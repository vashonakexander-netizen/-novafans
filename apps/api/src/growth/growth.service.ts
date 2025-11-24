import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { StorageService } from "../storage/storage.service";
import { AiService } from "../ai/ai.service";

@Injectable()
export class GrowthService {
  private readonly logger = new Logger(GrowthService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private storageService: StorageService,
    private aiService: AiService
  ) {}

  async processNewCreator(creatorId: string) {
    const creator = await this.prisma.user.findUnique({
      where: { id: creatorId },
      include: { creatorProfile: true },
    });

    if (!creator || creator.role !== "CREATOR" || !creator.creatorProfile) {
      return;
    }

    this.logger.log(`Processing growth automation for new creator ${creatorId}`);

    // 1. Generate SEO content
    await this.generateSEOContent(creator);

    // 2. Generate AI persona teaser
    await this.generateAIPersonaTeaser(creator);

    // 3. Generate suggested pricing
    await this.suggestPricing(creator);

    // 4. Generate suggested bio
    await this.suggestBio(creator);

    // 5. Create starter posts (pending approval)
    await this.createStarterPosts(creator);
  }

  private async generateSEOContent(creator: any) {
    // TODO: Generate SEO-optimized landing page content
    this.logger.log(`Generated SEO content for ${creator.username}`);
  }

  private async generateAIPersonaTeaser(creator: any) {
    if (!creator.creatorProfile.aiPersonaEnabled) {
      return;
    }

    // Generate AI persona preview
    const prompt = `Create a friendly AI persona preview for ${creator.displayName}. Keep it engaging and authentic.`;
    // TODO: Call AI service to generate persona
    this.logger.log(`Generated AI persona teaser for ${creator.username}`);
  }

  private async suggestPricing(creator: any) {
    // Analyze similar creators and suggest pricing
    const similarCreators = await this.prisma.creatorProfile.findMany({
      where: {
        id: { not: creator.creatorProfile.id },
      },
      take: 10,
      orderBy: {
        baseSubPrice: "desc",
      },
    });

    const avgPrice =
      similarCreators.reduce((sum, c) => sum + Number(c.baseSubPrice || 0), 0) /
      (similarCreators.length || 1);

    const suggestedPrice = Math.round(avgPrice * 0.8); // 20% below average

    // Store suggestion (could add a suggestions table)
    this.logger.log(`Suggested price $${suggestedPrice} for ${creator.username}`);
  }

  private async suggestBio(creator: any) {
    // Generate bio suggestion using AI
    const prompt = `Create an engaging bio for a creator named ${creator.displayName}. Make it professional and appealing.`;
    // TODO: Call AI service
    this.logger.log(`Generated bio suggestion for ${creator.username}`);
  }

  private async createStarterPosts(creator: any) {
    // Create 5 starter posts (pending approval)
    const prompts = [
      "Create a welcome post introducing yourself",
      "Create a post about what subscribers can expect",
      "Create a post showcasing your content style",
      "Create a post about your schedule",
      "Create a post asking subscribers what they'd like to see",
    ];

    for (const promptText of prompts) {
      // TODO: Generate post content using AI
      // Create post with status PENDING_APPROVAL
      this.logger.log(`Created starter post for ${creator.username}: ${promptText}`);
    }
  }

  async sendWeeklySummary(creatorId: string) {
    const creator = await this.prisma.user.findUnique({
      where: { id: creatorId },
      include: { creatorProfile: true },
    });

    if (!creator || creator.role !== "CREATOR") {
      return;
    }

    // Get analytics
    const analytics = await this.prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT s.id) as new_subs,
        COALESCE(SUM(t.amount), 0) as earnings
      FROM "Subscription" s
      LEFT JOIN "Transaction" t ON t."subscriptionId" = s.id
      WHERE s."creatorId" = ${creatorId}
        AND s."createdAt" > NOW() - INTERVAL '7 days'
    `;

    // Send Telegram notification if available
    if (creator.telegramChatId) {
      // TODO: Send via Telegram bot
    }

    // Send push notification
    await this.notificationsService.sendToUser(
      creatorId,
      "Weekly Summary",
      `You gained ${analytics[0]?.new_subs || 0} new subscribers and earned $${Number(analytics[0]?.earnings || 0).toFixed(2)} this week!`
    );
  }

  async sendRetentionNudge(creatorId: string) {
    const creator = await this.prisma.user.findUnique({
      where: { id: creatorId },
      include: { creatorProfile: true },
    });

    if (!creator || creator.role !== "CREATOR") {
      return;
    }

    // Find subscribers who haven't engaged recently
    // Check for fans who haven't sent messages in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeSubs = await this.prisma.subscription.findMany({
      where: {
        creatorId,
        status: "ACTIVE",
      },
      include: {
        fan: {
          include: {
            sentMessages: {
              where: {
                createdAt: {
                  gte: sevenDaysAgo,
                },
              },
            },
          },
        },
      },
      take: 10,
    });
    
    const inactiveSubs = activeSubs.filter(sub => sub.fan.sentMessages.length === 0);

    if (inactiveSubs.length > 0) {
      await this.notificationsService.sendToUser(
        creatorId,
        "Retention Alert",
        `You have ${inactiveSubs.length} subscribers who haven't engaged recently. Post more content to keep them active!`
      );
    }
  }

  async sendSubscriptionExpiryReminder(fanId: string, creatorId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        fanId,
        creatorId,
        status: "ACTIVE",
      },
      include: {
        creator: {
          select: {
            displayName: true,
          },
        },
      },
    });

    if (!subscription) {
      return;
    }

    const daysUntilExpiry = Math.ceil(
      (subscription.renewsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry <= 3) {
      await this.notificationsService.sendToUser(
        fanId,
        "Subscription Expiring Soon",
        `Your subscription to ${subscription.creator.displayName} expires in ${daysUntilExpiry} days. Renew now to continue access!`
      );
    }
  }
}

