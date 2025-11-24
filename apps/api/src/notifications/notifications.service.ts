import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import * as Notifications from "expo-server-sdk";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private expo: Notifications.Expo;

  constructor(private prisma: PrismaService) {
    // Initialize Expo push client
    this.expo = new Notifications.Expo();
  }

  async registerToken(userId: string, expoPushToken: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { expoPushToken },
    });
    this.logger.log(`Registered push token for user ${userId}`);
  }

  async sendToUser(userId: string, title: string, body: string, data?: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { expoPushToken: true },
    });

    if (!user?.expoPushToken) {
      this.logger.warn(`User ${userId} has no push token registered`);
      return;
    }

    try {
      const messages: Notifications.ExpoPushMessage[] = [
        {
          to: user.expoPushToken,
          sound: "default",
          title,
          body,
          data: data || {},
        },
      ];

      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          this.logger.error(`Error sending push notification: ${error}`);
        }
      }

      this.logger.log(`Sent push notification to user ${userId}`);
      return tickets;
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error}`);
      throw error;
    }
  }

  async sendToCreatorOnNewSub(creatorId: string, fanUsername: string) {
    const title = "New Subscriber! 🎉";
    const body = `${fanUsername} just subscribed to you!`;
    await this.sendToUser(creatorId, title, body, {
      type: "new_subscriber",
      fanUsername,
    });
  }

  async sendToCreatorOnNewTip(creatorId: string, amount: number, fanUsername: string) {
    const title = "New Tip! 💰";
    const body = `${fanUsername} sent you $${amount.toFixed(2)}`;
    await this.sendToUser(creatorId, title, body, {
      type: "new_tip",
      amount,
      fanUsername,
    });
  }

  async sendToFanOnAIRemessage(fanId: string, creatorDisplayName: string, messagePreview: string) {
    const title = `${creatorDisplayName} replied`;
    const body = messagePreview.substring(0, 100);
    await this.sendToUser(fanId, title, body, {
      type: "ai_message",
      creatorDisplayName,
    });
  }

  async sendToCreatorOnNewMessage(creatorId: string, fanUsername: string, messagePreview: string) {
    const title = `New message from ${fanUsername}`;
    const body = messagePreview.substring(0, 100);
    await this.sendToUser(creatorId, title, body, {
      type: "new_message",
      fanUsername,
    });
  }

  async sendToFanOnPaidDMUnlocked(fanId: string, creatorDisplayName: string) {
    const title = "Message unlocked! 🔓";
    const body = `You unlocked a message from ${creatorDisplayName}`;
    await this.sendToUser(fanId, title, body, {
      type: "paid_dm_unlocked",
      creatorDisplayName,
    });
  }
}

