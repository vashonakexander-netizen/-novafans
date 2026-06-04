import { Controller, Get, Post, Body, Param, HttpCode } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";

@Controller("agency/public")
export class AgencyPublicController {
  constructor(private prisma: PrismaService) {}

  @Get(":slug")
  async getPublicClient(@Param("slug") slug: string) {
    const client = await this.prisma.agencyClient.findFirst({
      where: { slug, status: "ACTIVE" },
      select: { id: true, name: true, slug: true, bio: true, colorTag: true, avatarUrl: true },
    });
    return client;
  }

  @Get(":slug/products")
  async getPublicProducts(@Param("slug") slug: string) {
    const client = await this.prisma.agencyClient.findFirst({ where: { slug, status: "ACTIVE" }, select: { id: true } });
    if (!client) return [];
    return this.prisma.agencyProduct.findMany({
      where: { clientId: client.id, isActive: true },
      orderBy: { price: "asc" },
    });
  }

  @Post(":slug/subscribe")
  async subscribe(@Param("slug") slug: string, @Body() body: { tier: string; billing: string }) {
    const client = await this.prisma.agencyClient.findFirst({ where: { slug }, select: { id: true } });
    if (!client) return { error: "Not found" };
    // The actual Stripe checkout is created by the Next.js API route
    // This endpoint returns the client ID for the frontend to use
    return { clientId: client.id };
  }

  @Post(":slug/purchase")
  async purchase(@Param("slug") slug: string, @Body() body: { productId: string }) {
    const product = await this.prisma.agencyProduct.findFirst({
      where: { id: body.productId, isActive: true },
      select: { id: true, title: true, price: true, clientId: true },
    });
    if (!product) return { error: "Product not found" };
    return {
      productId: product.id,
      productTitle: product.title,
      priceInCents: Math.round(Number(product.price) * 100),
      clientId: product.clientId,
    };
  }

  @Post(":slug/tip")
  async tip(@Param("slug") slug: string, @Body() body: { amount: number }) {
    const client = await this.prisma.agencyClient.findFirst({ where: { slug }, select: { id: true } });
    if (!client) return { error: "Not found" };
    return { clientId: client.id };
  }

  // ── Stripe Webhook Handlers ────────────────────────────────────────────

  @Post("webhooks/stripe")
  @HttpCode(200)
  async handleStripeCheckout(@Body() body: any) {
    const { type, sessionId, stripeSubscriptionId, amountTotal, metadata } = body;

    if (type === "subscription" && metadata?.clientId) {
      // Create or find a fan record and subscription
      await this.prisma.agencySubscription.upsert({
        where: { id: `stripe-${sessionId}` },
        update: {},
        create: {
          id: `stripe-${sessionId}`,
          fanId: await this.getOrCreateFan(metadata.fanEmail || "unknown"),
          clientId: metadata.clientId,
          tier: metadata.tier as any,
          status: "ACTIVE",
          stripeSubscriptionId: stripeSubscriptionId || null,
        },
      }).catch(() => {}); // ignore if fan FK fails
    }

    if (type === "purchase" && metadata?.productId) {
      const fan = await this.getOrCreateFan(metadata.fanEmail || "unknown");
      await this.prisma.agencyOrder.create({
        data: {
          fanId: fan,
          productId: metadata.productId,
          amount: amountTotal ? amountTotal / 100 : 0,
          stripePaymentId: sessionId,
        },
      }).catch(() => {});
    }

    if (type === "tip" && metadata?.clientId && metadata?.amount) {
      await this.prisma.agencyAnalyticsEvent.create({
        data: {
          clientId: metadata.clientId,
          eventType: "TIP",
          metadata: { amount: metadata.amount, sessionId },
        },
      }).catch(() => {});
    }

    return { ok: true };
  }

  @Post("webhooks/stripe/subscription")
  @HttpCode(200)
  async handleSubscriptionUpdate(@Body() body: { stripeSubscriptionId: string; status: string }) {
    await this.prisma.agencySubscription.updateMany({
      where: { stripeSubscriptionId: body.stripeSubscriptionId },
      data: { status: body.status === "active" ? "ACTIVE" : "CANCELED" },
    }).catch(() => {});
    return { ok: true };
  }

  private async getOrCreateFan(email: string): Promise<string> {
    const existing = await this.prisma.agencyFan.findFirst({ where: { email } });
    if (existing) return existing.id;
    const created = await this.prisma.agencyFan.create({ data: { displayName: email.split("@")[0], email } });
    return created.id;
  }
}
