import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { TransactionsService } from "../transactions/transactions.service";
import { CreateCryptoSubscriptionDto } from "./dto";
import { CryptoGatewayService } from "../crypto-gateway/crypto-gateway.service";
import { getCryptoConfig } from "@savage-house/config";

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService,
    private cryptoGateway: CryptoGatewayService
  ) {}

  async subscribe(fanId: string, creatorId: string) {
    // Check if creator exists and is active
    const creator = await this.prisma.user.findUnique({
      where: { id: creatorId },
      include: { creatorProfile: true },
    });

    if (!creator || creator.role !== "CREATOR") {
      throw new NotFoundException("Creator not found");
    }

    if (!creator.creatorProfile?.isActive) {
      throw new ConflictException("Creator is not active");
    }

    const subPrice = creator.creatorProfile.baseSubPrice || 0;

    // Check if already subscribed
    const existing = await this.prisma.subscription.findFirst({
      where: {
        fanId,
        creatorId,
        status: "ACTIVE",
      },
    });

    if (existing) {
      throw new ConflictException("Already subscribed");
    }

    // Create pending subscription
    const subscription = await this.prisma.subscription.create({
      data: {
        fanId,
        creatorId,
        price: subPrice,
        status: "ACTIVE",
        renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return subscription;
  }

  async createCryptoSubscription(fanId: string, creatorId: string, dto: CreateCryptoSubscriptionDto) {
    const cryptoConfig = getCryptoConfig();
    
    // Check if creator exists
    const creator = await this.prisma.user.findUnique({
      where: { id: creatorId },
      include: { creatorProfile: true },
    });

    if (!creator || creator.role !== "CREATOR") {
      throw new NotFoundException("Creator not found");
    }

    if (!creator.creatorProfile?.isActive) {
      throw new ConflictException("Creator is not active");
    }

    const subPrice = Number(creator.creatorProfile?.baseSubPrice || dto.amount || 0);
    const currency = dto.currency || cryptoConfig.defaultCurrency;

    // Validate minimum amount
    if (subPrice < cryptoConfig.minAmount) {
      throw new ConflictException(`Subscription amount must be at least ${cryptoConfig.minAmount} ${currency}`);
    }

    // Create invoice via crypto gateway
    const gatewayResult = await this.cryptoGateway.createInvoice({
      userId: fanId,
      creatorId,
      amount: subPrice,
      currency,
      type: "SUBSCRIPTION",
      metadata: {
        fanId,
        creatorId,
        subscriptionType: "STANDARD",
      },
    });

    // Create crypto invoice record with provider invoice ID
    const invoice = await this.prisma.cryptoInvoice.create({
      data: {
        fanId,
        creatorId,
        amount: subPrice,
        currency,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        processorInvoiceId: gatewayResult.providerInvoiceId || gatewayResult.invoiceId,
      },
    });

    // Create pending transaction stub
    const transaction = await this.transactionsService.create({
      userId: fanId,
      creatorId,
      type: "SUBSCRIPTION",
      amountGross: subPrice,
      platformFee: subPrice * 0.2, // 20% platform fee
      amountNetCreator: subPrice * 0.8,
      source: "CRYPTO",
      status: "PENDING",
      externalTxnId: invoice.id,
    });

    return {
      invoiceId: invoice.id,
      paymentUrl: gatewayResult.paymentUrl,
      status: "PENDING",
      amount: subPrice,
      currency,
      expiresAt: invoice.expiresAt,
    };
  }

  async getMySubscriptions(userId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        fanId: userId,
        status: "ACTIVE",
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
                bio: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return subscriptions;
  }

  async cancel(fanId: string, creatorId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        fanId,
        creatorId,
        status: "ACTIVE",
      },
    });

    if (!subscription) {
      throw new NotFoundException("Subscription not found");
    }

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "CANCELED",
        renewsAt: null,
      },
    });

    return { success: true };
  }

  async isSubscribed(fanId: string, creatorId: string): Promise<boolean> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        fanId,
        creatorId,
        status: "ACTIVE",
      },
    });

    return !!subscription;
  }
}

