import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { RedisService } from "../common/redis/redis.service";
import { AiService } from "../ai/ai.service";
import { CreateMessageDto, SendPaidMessageDto } from "./dto";
import { MessageSenderType } from "@prisma/client";
import { TransactionsService } from "../transactions/transactions.service";

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private aiService: AiService,
    private transactionsService: TransactionsService
  ) {}

  async getConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [{ creatorId: userId }, { fanId: userId }],
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            creatorProfile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
        fan: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return conversations;
  }

  async getConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            creatorProfile: {
              select: {
                avatarUrl: true,
                aiPersonaEnabled: true,
                aiPersonaSettings: true,
              },
            },
          },
        },
        fan: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        messages: {
          include: {
            unlocks: {
              where: {
                fanId: userId,
              },
            },
          },
          orderBy: { createdAt: "asc" },
          take: 100,
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    if (conversation.creatorId !== userId && conversation.fanId !== userId) {
      throw new ForbiddenException("Access denied");
    }

    const isFan = conversation.fanId === userId;
    const isCreator = conversation.creatorId === userId;

    // Process messages for locked content visibility
    const processedMessages = conversation.messages.map((message) => {
      const isUnlocked = message.unlocks.length > 0;
      const isSender = message.senderId === userId;

      // Creator always sees their own messages
      if (isCreator && message.senderType === MessageSenderType.CREATOR) {
        return message;
      }

      // If message is locked and user is a fan who hasn't unlocked it
      if (message.isLocked && isFan && !isUnlocked && !isSender) {
        return {
          ...message,
          body: "Locked message",
          mediaUrl: null,
          locked: true,
          price: message.price,
        };
      }

      return {
        ...message,
        locked: message.isLocked && !isUnlocked && !isSender,
      };
    });

    return {
      ...conversation,
      messages: processedMessages,
    };
  }

  async getOrCreateConversation(fanId: string, creatorId: string) {
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        fanId,
        creatorId,
      },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          fanId,
          creatorId,
        },
      });
    }

    return conversation;
  }

  async createMessage(userId: string, dto: CreateMessageDto) {
    const { creatorId, body, mediaUrl, price, isLocked } = dto;

    // Get or create conversation
    const conversation = await this.getOrCreateConversation(userId, creatorId);

    // Verify user is part of conversation
    if (conversation.fanId !== userId && conversation.creatorId !== userId) {
      throw new ForbiddenException("Access denied");
    }

    // Determine sender type
    const senderType =
      userId === conversation.creatorId ? MessageSenderType.CREATOR : MessageSenderType.FAN;

    // Create message
    const message = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderType,
        senderId: userId,
        body,
        mediaUrl,
        price,
        isLocked: isLocked || false,
      },
    });

    // Update conversation
    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageId: message.id,
        updatedAt: new Date(),
      },
    });

    // If fan sent message to creator, check if AI autopilot is enabled
    if (senderType === MessageSenderType.FAN) {
      const creator = await this.prisma.user.findUnique({
        where: { id: creatorId },
        include: { creatorProfile: true },
      });

      if (creator?.creatorProfile?.aiPersonaEnabled) {
        // Push to AI queue
        await this.redis.lpush(
          "ai_reply_jobs",
          JSON.stringify({
            conversationId: conversation.id,
            creatorId,
            fanId: userId,
            messageId: message.id,
          })
        );
      }
    }

    return message;
  }

  async sendPaidMessage(conversationId: string, creatorId: string, dto: SendPaidMessageDto) {
    // Verify conversation belongs to this creator
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    if (conversation.creatorId !== creatorId) {
      throw new ForbiddenException("This conversation does not belong to you");
    }

    if (!dto.price || dto.price <= 0) {
      throw new ForbiddenException("Price must be greater than 0");
    }

    // Create locked message
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderType: MessageSenderType.CREATOR,
        senderId: creatorId,
        body: dto.body || "",
        mediaUrl: dto.mediaUrl,
        price: dto.price,
        isLocked: true,
      },
    });

    // Update conversation
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageId: message.id,
        updatedAt: new Date(),
      },
    });

    return message;
  }

  async unlockMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: true,
        unlocks: {
          where: {
            fanId: userId,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException("Message not found");
    }

    if (!message.isLocked || !message.price) {
      throw new ForbiddenException("Message is not locked");
    }

    // Verify user is the fan in this conversation
    if (message.conversation.fanId !== userId) {
      throw new ForbiddenException("You can only unlock messages in your own conversations");
    }

    // Check if already unlocked
    if (message.unlocks.length > 0) {
      return message;
    }

    // Create transaction
    // TODO: In production, integrate with real payment processor (CoinPayments, Stripe, etc.)
    const priceNum = message.price.toNumber();
    const transaction = await this.transactionsService.create({
      userId,
      creatorId: message.conversation.creatorId,
      type: "PAID_DM",
      amountGross: priceNum,
      platformFee: priceNum * 0.2,
      amountNetCreator: priceNum * 0.8,
      source: "CRYPTO", // TODO: Support CARD payment source
      status: "COMPLETED", // TODO: Make async and wait for payment webhook
      externalTxnId: messageId,
    });

    // Create MessageUnlock record
    await this.prisma.messageUnlock.create({
      data: {
        messageId: message.id,
        fanId: userId,
        transactionId: transaction.id,
      },
    });

    // Update creator balance
    await this.transactionsService.complete(transaction.id);

    // Return full unlocked message
    const unlockedMessage = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    return unlockedMessage;
  }

  async purchaseMessageAccess(messageId: string, userId: string) {
    // This is an alias for unlockMessage - kept for backwards compatibility
    return this.unlockMessage(messageId, userId);
  }
}

