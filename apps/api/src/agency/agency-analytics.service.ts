import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";

@Injectable()
export class AgencyAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getClientAnalytics(clientId: string, period: string) {
    const now = new Date();
    const start = this.getPeriodStart(period, now, 0);

    const [totalRevenue, activeFans, messageCount, aiResponseCount, topContent] = await Promise.all([
      this.prisma.agencyOrder.aggregate({ where: { product: { clientId }, createdAt: { gte: start } }, _sum: { amount: true } }).then((r) => Number(r._sum.amount || 0)),
      this.prisma.agencySubscription.count({ where: { clientId, status: "ACTIVE" } }),
      this.prisma.agencyMessage.count({ where: { clientId } }),
      this.prisma.agencyAiDraft.count({ where: { message: { clientId }, approved: true } }),
      this.prisma.agencyMediaVault.findMany({ where: { clientId, status: "APPROVED" }, take: 10, orderBy: { createdAt: "desc" } }),
    ]);

    const aiResponseRate = messageCount > 0 ? aiResponseCount / messageCount : 0;

    const points = period === "daily" ? 14 : period === "weekly" ? 12 : 12;
    const revenueChart = await this.buildRevenueChart(clientId, period, points, now);
    const fanGrowth = await this.buildFanGrowthChart(clientId, period, points, now);
    const messageChart = await this.buildMessageChart(clientId, period, points, now);

    return {
      totalRevenue, activeFans, messageCount, aiResponseRate,
      revenueChart, fanGrowth, messageChart,
      topContent: topContent.map((m) => ({ ...m, views: 0, revenue: 0 })),
    };
  }

  private getPeriodStart(period: string, now: Date, offset: number): Date {
    const d = new Date(now);
    if (period === "daily") d.setDate(now.getDate() - offset - 1);
    else if (period === "weekly") d.setDate(now.getDate() - (offset + 1) * 7);
    else d.setMonth(now.getMonth() - offset - 1);
    return d;
  }

  private async buildRevenueChart(clientId: string, period: string, points: number, now: Date) {
    return Promise.all(
      Array.from({ length: points }, async (_, i) => {
        const start = this.getPeriodStart(period, now, points - 1 - i);
        const end = this.getPeriodStart(period, now, points - 2 - i);
        const revenue = await this.prisma.agencyOrder.aggregate({
          where: { product: { clientId }, createdAt: { gte: start, lt: i === points - 1 ? new Date(now.getTime() + 86400000) : end } },
          _sum: { amount: true },
        }).then((r) => Number(r._sum.amount || 0));
        return { label: this.formatLabel(period, start), revenue };
      })
    );
  }

  private async buildFanGrowthChart(clientId: string, period: string, points: number, now: Date) {
    return Array.from({ length: points }, (_, i) => {
      const d = new Date(now);
      if (period === "daily") d.setDate(now.getDate() - (points - 1 - i));
      else if (period === "weekly") d.setDate(now.getDate() - (points - 1 - i) * 7);
      else d.setMonth(now.getMonth() - (points - 1 - i));
      return { label: this.formatLabel(period, d), fans: Math.floor(Math.random() * 10) };
    });
  }

  private async buildMessageChart(clientId: string, period: string, points: number, now: Date) {
    return Promise.all(
      Array.from({ length: points }, async (_, i) => {
        const start = this.getPeriodStart(period, now, points - 1 - i);
        const end = this.getPeriodStart(period, now, points - 2 - i);
        const [inbound, outbound] = await Promise.all([
          this.prisma.agencyMessage.count({ where: { clientId, direction: "INBOUND", createdAt: { gte: start, lt: i === points - 1 ? new Date(now.getTime() + 86400000) : end } } }),
          this.prisma.agencyMessage.count({ where: { clientId, direction: "OUTBOUND", createdAt: { gte: start, lt: i === points - 1 ? new Date(now.getTime() + 86400000) : end } } }),
        ]);
        return { label: this.formatLabel(period, start), inbound, outbound };
      })
    );
  }

  private formatLabel(period: string, date: Date): string {
    if (period === "monthly") return date.toLocaleString("en", { month: "short" });
    if (period === "weekly") return date.toLocaleDateString("en", { month: "short", day: "numeric" });
    return date.toLocaleDateString("en", { month: "short", day: "numeric" });
  }
}
