import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { CreatePayoutRequestDto } from "./dto";
import { PayoutStatus } from "@prisma/client";

@Injectable()
export class PayoutsService {
  constructor(private prisma: PrismaService) {}

  async getMyPayouts(creatorId: string) {
    const balance = await this.prisma.creatorBalance.findUnique({
      where: { creatorId },
    });

    if (!balance) {
      // Create balance if it doesn't exist
      await this.prisma.creatorBalance.create({
        data: {
          creatorId,
          balanceAvailable: 0,
          balancePending: 0,
        },
      });
      return {
        balance: {
          available: 0,
          pending: 0,
        },
        requests: [],
      };
    }

    const requests = await this.prisma.payoutRequest.findMany({
      where: { creatorId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return {
      balance: {
        available: balance.balanceAvailable,
        pending: balance.balancePending,
      },
      requests,
    };
  }

  async createPayoutRequest(creatorId: string, dto: CreatePayoutRequestDto) {
    if (dto.amount <= 0) {
      throw new BadRequestException("Amount must be greater than 0");
    }

    const balance = await this.prisma.creatorBalance.findUnique({
      where: { creatorId },
    });

    if (!balance) {
      throw new NotFoundException("Creator balance not found");
    }

    if (dto.amount > balance.balanceAvailable.toNumber()) {
      throw new BadRequestException("Amount exceeds available balance");
    }

    // TODO: In production, add compliance checks and hold periods before allowing payout requests
    // TODO: Add minimum payout amount validation
    // TODO: Add payout frequency limits (e.g., max 1 payout per week)

    // Create payout request
    const request = await this.prisma.payoutRequest.create({
      data: {
        creatorId,
        amount: dto.amount,
        payoutMethod: dto.payoutMethod,
        payoutDetails: dto.payoutDetails || {},
        status: PayoutStatus.REQUESTED,
      },
    });

    // Decrease available balance
    await this.prisma.creatorBalance.update({
      where: { creatorId },
      data: {
        balanceAvailable: {
          decrement: dto.amount,
        },
      },
    });

    return request;
  }

  async getAllPayouts(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const requests = await this.prisma.payoutRequest.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return requests;
  }

  async markProcessing(payoutId: string) {
    const request = await this.prisma.payoutRequest.findUnique({
      where: { id: payoutId },
    });

    if (!request) {
      throw new NotFoundException("Payout request not found");
    }

    await this.prisma.payoutRequest.update({
      where: { id: payoutId },
      data: { status: PayoutStatus.PROCESSING },
    });

    return { success: true };
  }

  async markPaid(payoutId: string, txHash?: string) {
    const request = await this.prisma.payoutRequest.findUnique({
      where: { id: payoutId },
    });

    if (!request) {
      throw new NotFoundException("Payout request not found");
    }

    // TODO: In production, integrate with real payout provider (Payoneer, Paxum, crypto wallets, etc.)
    // TODO: For crypto payouts, use wallet APIs to send transactions
    // TODO: For bank transfers, integrate with payment processors
    // TODO: Add webhook handlers for payout status updates from providers
    const payoutDetails: any = request.payoutDetails && typeof request.payoutDetails === 'object' 
      ? { ...request.payoutDetails as object } 
      : {};
    if (txHash) {
      payoutDetails.txHash = txHash;
    }
    payoutDetails.paidAt = new Date().toISOString();

    await this.prisma.payoutRequest.update({
      where: { id: payoutId },
      data: {
        status: PayoutStatus.PAID,
        payoutDetails,
      },
    });

    return { success: true };
  }

  async markRejected(payoutId: string, reason?: string) {
    const request = await this.prisma.payoutRequest.findUnique({
      where: { id: payoutId },
    });

    if (!request) {
      throw new NotFoundException("Payout request not found");
    }

    if (request.status === PayoutStatus.PAID) {
      throw new ForbiddenException("Cannot reject a paid payout");
    }

    // Return amount back to creator's balance
    await this.prisma.creatorBalance.update({
      where: { creatorId: request.creatorId },
      data: {
        balanceAvailable: {
          increment: request.amount,
        },
      },
    });

    const payoutDetails: any = request.payoutDetails && typeof request.payoutDetails === 'object' 
      ? { ...request.payoutDetails as object } 
      : {};
    if (reason) {
      payoutDetails.rejectionReason = reason;
    }

    await this.prisma.payoutRequest.update({
      where: { id: payoutId },
      data: {
        status: PayoutStatus.REJECTED,
        payoutDetails,
      },
    });

    return { success: true };
  }
}

