import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { TransactionType, TransactionSource, TransactionStatus, SubscriptionStatus, Prisma } from "@prisma/client";

interface CreateTransactionDto {
  userId: string;
  creatorId: string;
  type: TransactionType;
  amountGross: number;
  platformFee: number;
  amountNetCreator: number;
  source: TransactionSource;
  status?: TransactionStatus;
  externalTxnId?: string;
}

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTransactionDto) {
    const transaction = await this.prisma.transaction.create({
      data: {
        userId: dto.userId,
        creatorId: dto.creatorId,
        type: dto.type,
        amountGross: dto.amountGross,
        platformFee: dto.platformFee,
        amountNetCreator: dto.amountNetCreator,
        source: dto.source,
        status: dto.status || TransactionStatus.PENDING,
        externalTxnId: dto.externalTxnId,
      },
    });

    return transaction;
  }

  async complete(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status === TransactionStatus.COMPLETED) {
      return transaction;
    }

    // Update transaction status
    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.COMPLETED },
    });

    // Update creator balance
    await this.updateCreatorBalance(transaction.creatorId, transaction.amountNetCreator.toNumber());

    // If subscription transaction, activate subscription
    if (transaction.type === TransactionType.SUBSCRIPTION) {
      await this.activateSubscription(transaction.userId, transaction.creatorId, transaction.amountGross.toNumber());
    }

    return this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });
  }

  async updateCreatorBalance(creatorId: string, amount: number) {
    // TODO: In production, implement automatic hold period logic:
    //   - Subscriptions: 7-day hold
    //   - Tips/Paid DMs: 14-day hold
    //   - After hold period, automatically move balancePending -> balanceAvailable
    // For now, all earnings go to balancePending and require admin release

    const balance = await this.prisma.creatorBalance.findUnique({
      where: { creatorId },
    });

    if (balance) {
      await this.prisma.creatorBalance.update({
        where: { creatorId },
        data: {
          balancePending: {
            increment: amount,
          },
        },
      });
    } else {
      await this.prisma.creatorBalance.create({
        data: {
          creatorId,
          balancePending: amount,
          balanceAvailable: 0,
        },
      });
    }
  }

  async activateSubscription(fanId: string, creatorId: string, price: number) {
    // Cancel existing subscription if any
    await this.prisma.subscription.updateMany({
      where: {
        fanId,
        creatorId,
        status: SubscriptionStatus.ACTIVE,
      },
      data: {
        status: SubscriptionStatus.CANCELED,
      },
    });

    // Create new subscription
    await this.prisma.subscription.create({
      data: {
        fanId,
        creatorId,
        price,
        status: "ACTIVE",
        renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [{ userId }, { creatorId: userId }],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        creator: {
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
      take: 100,
    });
  }

  async findByCreator(creatorId: string) {
    return this.prisma.transaction.findMany({
      where: { creatorId },
      include: {
        user: {
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
      take: 100,
    });
  }
}

