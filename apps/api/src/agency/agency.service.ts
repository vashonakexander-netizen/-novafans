import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";

@Injectable()
export class AgencyService {
  constructor(private prisma: PrismaService) {}

  async getClients(agencyId: string) {
    return this.prisma.agencyClient.findMany({
      where: { agencyId, status: { not: "ARCHIVED" } },
      orderBy: { createdAt: "desc" },
    });
  }

  async getClientsOverview(agencyId: string) {
    const clients = await this.prisma.agencyClient.findMany({
      where: { agencyId, status: { not: "ARCHIVED" } },
    });

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return Promise.all(
      clients.map(async (client) => {
        const [unreadMessages, scheduledThisWeek, revenueThisMonth, pendingUploads] = await Promise.all([
          this.prisma.agencyMessage.count({ where: { clientId: client.id, status: "UNREAD", direction: "INBOUND" } }),
          this.prisma.agencyScheduledPost.count({ where: { clientId: client.id, scheduledAt: { gte: weekStart }, status: { in: ["SCHEDULED", "DRAFT"] } } }),
          this.prisma.agencyOrder.aggregate({ where: { product: { clientId: client.id }, createdAt: { gte: monthStart } }, _sum: { amount: true } }).then((r) => Number(r._sum.amount || 0)),
          this.prisma.agencyMediaVault.count({ where: { clientId: client.id, status: "UPLOADED" } }),
        ]);
        return { ...client, unreadMessages, scheduledThisWeek, revenueThisMonth, pendingUploads };
      })
    );
  }

  async getAgencyStats(agencyId: string) {
    const clients = await this.prisma.agencyClient.findMany({ where: { agencyId }, select: { id: true } });
    const clientIds = clients.map((c) => c.id);

    const [totalRevenue, totalFans, totalMessages] = await Promise.all([
      this.prisma.agencyOrder.aggregate({ where: { product: { clientId: { in: clientIds } } }, _sum: { amount: true } }).then((r) => Number(r._sum.amount || 0)),
      this.prisma.agencySubscription.count({ where: { clientId: { in: clientIds }, status: "ACTIVE" } }),
      this.prisma.agencyMessage.count({ where: { clientId: { in: clientIds } } }),
    ]);

    return { totalRevenue, totalClients: clients.length, totalFans, totalMessages };
  }

  async getClient(agencyId: string, clientId: string) {
    const client = await this.prisma.agencyClient.findFirst({ where: { id: clientId, agencyId } });
    if (!client) throw new NotFoundException("Client not found");
    return client;
  }

  async createClient(agencyId: string, dto: any) {
    return this.prisma.agencyClient.create({
      data: { agencyId, name: dto.name, slug: dto.slug, bio: dto.bio, colorTag: dto.colorTag, toneProfile: dto.toneProfile, payoutSplit: dto.payoutSplit ?? 0.8, platformLinks: dto.platformLinks },
    });
  }

  async updateClient(agencyId: string, clientId: string, dto: any) {
    await this.getClient(agencyId, clientId);
    return this.prisma.agencyClient.update({ where: { id: clientId }, data: { name: dto.name, bio: dto.bio, toneProfile: dto.toneProfile, payoutSplit: dto.payoutSplit, colorTag: dto.colorTag, platformLinks: dto.platformLinks } });
  }

  async getRevenue(agencyId: string, period: string) {
    const clients = await this.prisma.agencyClient.findMany({ where: { agencyId }, select: { id: true, name: true, colorTag: true, payoutSplit: true } });
    const clientIds = clients.map((c) => c.id);

    const [totalRevenue, pendingPayouts] = await Promise.all([
      this.prisma.agencyOrder.aggregate({ where: { product: { clientId: { in: clientIds } } }, _sum: { amount: true } }).then((r) => Number(r._sum.amount || 0)),
      this.prisma.agencyOrder.aggregate({ where: { product: { clientId: { in: clientIds } }, stripePaymentId: null }, _sum: { amount: true } }).then((r) => Number(r._sum.amount || 0)),
    ]);

    const byClient = await Promise.all(
      clients.map(async (c) => {
        const [revenue, orders, subs] = await Promise.all([
          this.prisma.agencyOrder.aggregate({ where: { product: { clientId: c.id } }, _sum: { amount: true } }).then((r) => Number(r._sum.amount || 0)),
          this.prisma.agencyOrder.count({ where: { product: { clientId: c.id } } }),
          this.prisma.agencySubscription.count({ where: { clientId: c.id, status: "ACTIVE" } }),
        ]);
        return { ...c, revenue, orders, subs, split: c.payoutSplit };
      })
    );

    const agencyCut = byClient.reduce((sum, c) => sum + c.revenue * (1 - c.split), 0);
    const creatorPayouts = byClient.reduce((sum, c) => sum + c.revenue * c.split, 0);

    const revenueChart = this.generateChartData(period);

    return { totalRevenue, agencyCut, creatorPayouts, pendingPayouts, byClient, revenueChart };
  }

  private generateChartData(period: string) {
    const now = new Date();
    const points = period === "daily" ? 30 : period === "weekly" ? 12 : 12;
    return Array.from({ length: points }, (_, i) => {
      const d = new Date(now);
      if (period === "daily") d.setDate(now.getDate() - (points - 1 - i));
      else if (period === "weekly") d.setDate(now.getDate() - (points - 1 - i) * 7);
      else d.setMonth(now.getMonth() - (points - 1 - i));
      return {
        label: period === "monthly"
          ? d.toLocaleString("en", { month: "short" })
          : d.toLocaleDateString("en", { month: "short", day: "numeric" }),
        revenue: 0,
      };
    });
  }
}
