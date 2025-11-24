import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { TransactionsService } from "../transactions/transactions.service";
import { CreateLiveSessionDto, SendLiveTipDto } from "./dto";
import { LiveSessionStatus, LiveAccessType } from "@prisma/client";
import { CryptoGatewayService } from "../crypto-gateway/crypto-gateway.service";
import { getCryptoConfig } from "@novafans/config";
import { LiveKitService } from "./livekit.service";

@Injectable()
export class LiveSessionsService {
  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService,
    private cryptoGateway: CryptoGatewayService,
    private liveKit: LiveKitService
  ) {}

  async createSession(creatorId: string, dto: CreateLiveSessionDto) {
    const now = new Date();
    const scheduledStart = dto.scheduledStartAt ? new Date(dto.scheduledStartAt) : null;

    // Determine status
    let status: LiveSessionStatus = LiveSessionStatus.SCHEDULED;
    let startedAt: Date | null = null;

    if (!scheduledStart || scheduledStart <= now) {
      status = LiveSessionStatus.LIVE;
      startedAt = now;
    }

    // Validate ticket price for TICKETED shows
    if (dto.accessType === LiveAccessType.TICKETED && !dto.ticketPrice) {
      throw new BadRequestException("Ticket price is required for ticketed shows");
    }

    // Generate streamKey and streamUrl
    let streamKey: string | null = null;
    let streamUrl: string | null = null;
    let liveRoomId: string | null = null;
    let liveStreamProvider: string | null = null;

    // Use LiveKit if configured, otherwise use placeholder
    if (this.liveKit.isConfigured()) {
      try {
        const roomName = `live_${creatorId}_${Date.now()}`;
        const room = await this.liveKit.createRoom(roomName);
        liveRoomId = room.name;
        liveStreamProvider = "LIVEKIT";
        streamKey = roomName; // Room name can be used as stream key
        streamUrl = this.liveKit.getStreamUrl(roomName);
      } catch (error) {
        // Fallback to placeholder if LiveKit fails
        streamKey = `live_${creatorId}_${Date.now()}`;
        streamUrl = `https://example.com/live/${streamKey}`;
      }
    } else {
      // Placeholder mode (backward compatible)
      streamKey = `live_${creatorId}_${Date.now()}`;
      streamUrl = `https://example.com/live/${streamKey}`;
    }

    const session = await this.prisma.liveSession.create({
      data: {
        creatorId,
        title: dto.title,
        description: dto.description,
        status,
        accessType: dto.accessType || LiveAccessType.FREE,
        ticketPrice: dto.ticketPrice,
        scheduledStartAt: scheduledStart,
        startedAt,
        streamKey,
        streamUrl,
        liveRoomId,
        liveStreamProvider,
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
      },
    });

    return session;
  }

  async startSession(sessionId: string, creatorId: string) {
    const session = await this.prisma.liveSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException("Live session not found");
    }

    if (session.creatorId !== creatorId) {
      throw new ForbiddenException("You can only start your own sessions");
    }

    if (session.status !== LiveSessionStatus.SCHEDULED) {
      throw new BadRequestException("Session is not scheduled");
    }

    await this.prisma.liveSession.update({
      where: { id: sessionId },
      data: {
        status: LiveSessionStatus.LIVE,
        startedAt: new Date(),
      },
    });

    return this.getSession(sessionId, creatorId);
  }

  async endSession(sessionId: string, creatorId: string) {
    const session = await this.prisma.liveSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException("Live session not found");
    }

    if (session.creatorId !== creatorId) {
      throw new ForbiddenException("You can only end your own sessions");
    }

    // Delete LiveKit room if it exists
    if (session.liveRoomId && this.liveKit.isConfigured()) {
      try {
        await this.liveKit.deleteRoom(session.liveRoomId);
      } catch (error) {
        // Log but don't fail if room deletion fails
        console.error("Failed to delete LiveKit room:", error);
      }
    }

    await this.prisma.liveSession.update({
      where: { id: sessionId },
      data: {
        status: LiveSessionStatus.ENDED,
        endedAt: new Date(),
      },
    });

    return { success: true };
  }

  async getPublicSessions() {
    const now = new Date();

    const [liveSessions, upcomingSessions] = await Promise.all([
      // Currently live
      this.prisma.liveSession.findMany({
        where: {
          status: LiveSessionStatus.LIVE,
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
        },
        orderBy: {
          startedAt: "desc",
        },
      }),
      // Upcoming scheduled
      this.prisma.liveSession.findMany({
        where: {
          status: LiveSessionStatus.SCHEDULED,
          scheduledStartAt: {
            gte: now,
          },
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
        },
        orderBy: {
          scheduledStartAt: "asc",
        },
        take: 20,
      }),
    ]);

    return {
      live: liveSessions,
      upcoming: upcomingSessions,
    };
  }

  async getSession(sessionId: string, userId?: string) {
    const session = await this.prisma.liveSession.findUnique({
      where: { id: sessionId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            creatorProfile: {
              select: {
                avatarUrl: true,
                bio: true,
              },
            },
          },
        },
        tips: {
          include: {
            fan: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 50,
        },
      },
    });

    if (!session) {
      throw new NotFoundException("Live session not found");
    }

    // Check access for fans
    if (userId && userId !== session.creatorId) {
      if (session.accessType === LiveAccessType.SUBSCRIBERS_ONLY) {
        const subscription = await this.prisma.subscription.findFirst({
          where: {
            fanId: userId,
            creatorId: session.creatorId,
            status: "ACTIVE",
          },
        });

        if (!subscription) {
          throw new ForbiddenException("Subscription required to view this live show");
        }
      }

      // TODO: Check ticket purchase for TICKETED shows
      if (session.accessType === LiveAccessType.TICKETED) {
        // For now, allow access (TODO: implement ticket purchase check)
      }
    }

    // Don't expose streamKey to viewers (only to creator)
    if (userId !== session.creatorId) {
      return {
        ...session,
        streamKey: undefined,
      };
    }

    return session;
  }

  async sendTip(sessionId: string, fanId: string, dto: SendLiveTipDto) {
    const session = await this.prisma.liveSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException("Live session not found");
    }

    if (session.status !== LiveSessionStatus.LIVE) {
      throw new BadRequestException("Session is not live");
    }

    if (dto.amount <= 0) {
      throw new BadRequestException("Tip amount must be greater than 0");
    }

    const cryptoConfig = getCryptoConfig();
    const currency = cryptoConfig.defaultCurrency;

    // Validate minimum amount
    if (dto.amount < cryptoConfig.minAmount) {
      throw new BadRequestException(`Tip amount must be at least ${cryptoConfig.minAmount} ${currency}`);
    }

    // If in fake mode, process instantly (backward compatible)
    if (cryptoConfig.provider === "fake" || !cryptoConfig.apiKey) {
      // Instant tip processing (existing behavior)
      const transaction = await this.transactionsService.create({
        userId: fanId,
        creatorId: session.creatorId,
        type: "TIP",
        amountGross: dto.amount,
        platformFee: dto.amount * 0.2,
        amountNetCreator: dto.amount * 0.8,
        source: "CRYPTO",
        status: "COMPLETED",
      });

      // Update creator balance
      await this.transactionsService.complete(transaction.id);

      // Create live tip
      const tip = await this.prisma.liveTip.create({
        data: {
          liveSessionId: sessionId,
          fanId,
          amount: dto.amount,
          message: dto.message,
        },
        include: {
          fan: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
      });

      return tip;
    }

    // Real crypto gateway mode: create invoice and return payment URL
    // TODO: Frontend should show "waiting for payment" state and redirect to paymentUrl
    const gatewayResult = await this.cryptoGateway.createInvoice({
      userId: fanId,
      creatorId: session.creatorId,
      amount: dto.amount,
      currency,
      type: "TIP",
      metadata: {
        liveSessionId: sessionId,
        fanId,
        creatorId: session.creatorId,
        message: dto.message,
      },
    });

    // Create crypto invoice record
    const invoice = await this.prisma.cryptoInvoice.create({
      data: {
        fanId,
        creatorId: session.creatorId,
        amount: dto.amount,
        currency,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        processorInvoiceId: gatewayResult.providerInvoiceId || gatewayResult.invoiceId,
      },
    });

    // Create pending transaction
    const transaction = await this.transactionsService.create({
      userId: fanId,
      creatorId: session.creatorId,
      type: "TIP",
      amountGross: dto.amount,
      platformFee: dto.amount * 0.2,
      amountNetCreator: dto.amount * 0.8,
      source: "CRYPTO",
      status: "PENDING",
      externalTxnId: invoice.id,
    });

    // Return payment URL for frontend to redirect user
    // TODO: Frontend should handle payment flow and show "Tip pending" state
    return {
      invoiceId: invoice.id,
      paymentUrl: gatewayResult.paymentUrl,
      status: "PENDING",
      amount: dto.amount,
      currency,
      message: "Redirect user to paymentUrl to complete tip payment",
    };
  }

  async getCreatorSessions(creatorId: string) {
    const sessions = await this.prisma.liveSession.findMany({
      where: { creatorId },
      include: {
        tips: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    // Calculate total tips per session
    const sessionsWithStats = sessions.map((session) => {
      const totalTips = session.tips.reduce((sum, tip) => sum + Number(tip.amount), 0);
      return {
        ...session,
        totalTips,
        tipsCount: session.tips.length,
        tips: undefined, // Remove tips array from response
      };
    });

    return sessionsWithStats;
  }

  async getViewerToken(sessionId: string, userId: string, username: string): Promise<{ token: string; url: string }> {
    const session = await this.prisma.liveSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException("Live session not found");
    }

    if (session.status !== LiveSessionStatus.LIVE) {
      throw new BadRequestException("Session is not live");
    }

    // Check access
    if (session.accessType === LiveAccessType.SUBSCRIBERS_ONLY) {
      const subscription = await this.prisma.subscription.findFirst({
        where: {
          fanId: userId,
          creatorId: session.creatorId,
          status: "ACTIVE",
        },
      });

      if (!subscription) {
        throw new ForbiddenException("Subscription required to view this live show");
      }
    }

    // Generate token if LiveKit is configured
    if (session.liveRoomId && this.liveKit.isConfigured()) {
      const token = await this.liveKit.generateSubscriberToken(session.liveRoomId, userId, username);
      const url = this.liveKit.getStreamUrl(session.liveRoomId);
      return { token, url };
    }

    // Fallback: return placeholder (backward compatible)
    return {
      token: "placeholder-token",
      url: session.streamUrl || "https://example.com/live/placeholder",
    };
  }

  async getPublisherToken(sessionId: string, creatorId: string, username: string): Promise<{ token: string; url: string }> {
    const session = await this.prisma.liveSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException("Live session not found");
    }

    if (session.creatorId !== creatorId) {
      throw new ForbiddenException("Only the creator can get publisher token");
    }

    // Generate token if LiveKit is configured
    if (session.liveRoomId && this.liveKit.isConfigured()) {
      const token = await this.liveKit.generatePublisherToken(session.liveRoomId, creatorId, username);
      const url = this.liveKit.getStreamUrl(session.liveRoomId);
      return { token, url };
    }

    // Fallback: return placeholder (backward compatible)
    return {
      token: "placeholder-token",
      url: session.streamUrl || "https://example.com/live/placeholder",
    };
  }
}

