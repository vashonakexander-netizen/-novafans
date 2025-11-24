import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { BanUserDto } from "./dto";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsers(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          role: true,
          isBanned: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async banUser(userId: string, adminId: string, dto: BanUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.role === "ADMIN") {
      throw new ForbiddenException("Cannot ban admin");
    }

    // Ban user
    await this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: true },
    });

    // Create ban record
    await this.prisma.ban.create({
      data: {
        userId,
        reason: dto.reason,
        bannedById: adminId,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });

    return { success: true };
  }

  async unbanUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: false },
    });

    return { success: true };
  }

  async getReports(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const reports = await this.prisma.report.findMany({
      where,
      include: {
        reporter: {
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

    return reports;
  }

  async updateReportStatus(reportId: string, status: string) {
    await this.prisma.report.update({
      where: { id: reportId },
      data: { status: status as any },
    });

    return { success: true };
  }

  async releasePendingBalance(creatorId: string) {
    // TODO: In production, replace this manual release with automatic rolling release
    // TODO: Implement hold periods (e.g., 7 days for subscriptions, 14 days for tips)
    // TODO: Automatically move balancePending -> balanceAvailable after hold period expires
    // For MVP, admins can manually release pending balances

    const balance = await this.prisma.creatorBalance.findUnique({
      where: { creatorId },
    });

    if (!balance) {
      throw new NotFoundException("Creator balance not found");
    }

    if (balance.balancePending.toNumber() <= 0) {
      return { success: true, message: "No pending balance to release" };
    }

    // Move pending to available
    await this.prisma.creatorBalance.update({
      where: { creatorId },
      data: {
        balanceAvailable: {
          increment: balance.balancePending,
        },
        balancePending: 0,
      },
    });

    return {
      success: true,
      releasedAmount: balance.balancePending.toNumber(),
      newBalance: {
        available: balance.balanceAvailable.toNumber() + balance.balancePending.toNumber(),
        pending: 0,
      },
    };
  }
}

