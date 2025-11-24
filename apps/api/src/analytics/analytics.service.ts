import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { TransactionType, Prisma } from "@prisma/client";

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getCreatorAnalytics(creatorId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total earnings (lifetime)
    const totalEarningsResult = await this.prisma.transaction.aggregate({
      where: {
        creatorId,
        status: "COMPLETED",
      },
      _sum: {
        amountNetCreator: true,
      },
    });

    const totalEarnings = totalEarningsResult._sum.amountNetCreator || 0;

    // Earnings last 30 days
    const monthlyEarningsResult = await this.prisma.transaction.aggregate({
      where: {
        creatorId,
        status: "COMPLETED",
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        amountNetCreator: true,
      },
    });

    const monthlyEarnings = monthlyEarningsResult._sum.amountNetCreator || 0;

    // Earnings by type
    const earningsByType = await this.prisma.transaction.groupBy({
      by: ["type"],
      where: {
        creatorId,
        status: "COMPLETED",
      },
      _sum: {
        amountNetCreator: true,
      },
    });

    const earningsByTypeMap: Record<string, number> = {
      SUBSCRIPTION: 0,
      PAID_POST: 0,
      PAID_DM: 0,
      TIP: 0,
    };

    earningsByType.forEach((item) => {
      earningsByTypeMap[item.type] = Number(item._sum.amountNetCreator || 0);
    });

    // Active subscribers count
    const activeSubscribersCount = await this.prisma.subscription.count({
      where: {
        creatorId,
        status: "ACTIVE",
      },
    });

    // New subscribers last 30 days
    const newSubscribersLast30d = await this.prisma.subscription.count({
      where: {
        creatorId,
        status: "ACTIVE",
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Top 5 posts by revenue
    const topPostsByRevenue = await this.prisma.transaction.groupBy({
      by: ["externalTxnId"],
      where: {
        creatorId,
        type: "PAID_POST",
        status: "COMPLETED",
      },
      _sum: {
        amountNetCreator: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          amountNetCreator: "desc",
        },
      },
      take: 5,
    });

    const topPosts = await Promise.all(
      topPostsByRevenue.map(async (item) => {
        if (!item.externalTxnId) return null;

        const post = await this.prisma.post.findUnique({
          where: { id: item.externalTxnId },
          select: {
            id: true,
            title: true,
          },
        });

        if (!post) return null;

        return {
          postId: post.id,
          title: post.title || "Untitled",
          revenue: Number(item._sum.amountNetCreator || 0),
          purchases: item._count.id,
        };
      })
    );

    const topPostsFiltered = topPosts.filter((p) => p !== null);

    return {
      totalEarnings: Number(totalEarnings),
      monthlyEarnings: Number(monthlyEarnings),
      earningsByType: earningsByTypeMap,
      activeSubscribersCount,
      newSubscribersLast30d,
      topPosts: topPostsFiltered,
    };
  }
}

