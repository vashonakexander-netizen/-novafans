import { Controller, Post, Body, Param, Get, Req, Headers, UseGuards } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { PrismaService } from "../common/prisma/prisma.service";
import { CryptoGatewayService } from "../crypto-gateway/crypto-gateway.service";
import { getCryptoConfig } from "@novafans/config";
import { IsString, IsEnum, IsNumber, IsOptional } from "class-validator";
import { TransactionStatus } from "@prisma/client";

@Controller("payments")
export class PaymentsController {
  constructor(
    private transactionsService: TransactionsService,
    private prisma: PrismaService,
    private cryptoGateway: CryptoGatewayService
  ) {}

  @Post("crypto/webhook")
  async cryptoWebhook(@Body() body: any, @Req() req: any, @Headers() headers: any) {
    try {
      // Map webhook using crypto gateway
      const webhookResult = await this.cryptoGateway.mapWebhook(body, headers);

      // If mapping failed, return error but acknowledge to avoid spam
      if (!webhookResult.ok) {
        // Log error but never log full payloads with sensitive data
        console.error(`Webhook mapping failed: provider=${webhookResult.provider}, status=${webhookResult.status}`);
        return { ok: true }; // Return 200 to avoid being spammed, but log internally
      }

      // Find invoice by providerInvoiceId (for real providers) or internal ID (for fake)
      const invoice = await this.prisma.cryptoInvoice.findFirst({
        where: {
          OR: [
            { processorInvoiceId: webhookResult.providerInvoiceId },
            { id: webhookResult.providerInvoiceId },
          ],
        },
        include: {
          fan: true,
          creator: true,
        },
      });

      if (!invoice) {
        // Log unknown invoice but return 200 to avoid spam
        // Never log full providerInvoiceId or sensitive data
        console.error(`Webhook for unknown invoice: ${webhookResult.providerInvoiceId ? webhookResult.providerInvoiceId.substring(0, 16) + "..." : "N/A"}`);
        return { ok: true };
      }

      // Handle different statuses
      if (webhookResult.status === "PAID") {
        // Update invoice status
        await this.prisma.cryptoInvoice.update({
          where: { id: invoice.id },
          data: { status: "PAID" },
        });

        // Find or create transaction
        let transaction = await this.prisma.transaction.findFirst({
          where: { externalTxnId: invoice.id },
        });

        const invoiceType = webhookResult.type || "SUBSCRIPTION"; // Default to SUBSCRIPTION
        const amount = webhookResult.amount ? Number(webhookResult.amount) : Number(invoice.amount);

        if (!transaction) {
          // Create transaction
          transaction = await this.transactionsService.create({
            userId: invoice.fanId,
            creatorId: invoice.creatorId,
            type: invoiceType,
            amountGross: amount,
            platformFee: amount * 0.2,
            amountNetCreator: amount * 0.8,
            source: "CRYPTO",
            status: "COMPLETED",
            externalTxnId: invoice.id,
          });
        } else {
          // Update existing transaction to COMPLETED
          await this.prisma.transaction.update({
            where: { id: transaction.id },
            data: {
              status: "COMPLETED",
              amountGross: amount,
              platformFee: amount * 0.2,
              amountNetCreator: amount * 0.8,
            },
          });
          transaction = await this.prisma.transaction.findUnique({
            where: { id: transaction.id },
          });
        }

        // Handle different transaction types
        if (invoiceType === "SUBSCRIPTION") {
          // Activate or extend subscription
          const existingSubscription = await this.prisma.subscription.findFirst({
            where: {
              fanId: invoice.fanId,
              creatorId: invoice.creatorId,
              status: "ACTIVE",
            },
          });

          if (existingSubscription) {
            // Extend subscription
            await this.prisma.subscription.update({
              where: { id: existingSubscription.id },
              data: {
                renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              },
            });
          } else {
            // Create new subscription
            await this.prisma.subscription.create({
              data: {
                fanId: invoice.fanId,
                creatorId: invoice.creatorId,
                price: amount,
                status: "ACTIVE",
                renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              },
            });
          }
        } else if (invoiceType === "TIP") {
          // Extract liveSessionId from metadata
          const liveSessionId = webhookResult.metadata?.liveSessionId;
          if (liveSessionId) {
            // Create LiveTip entry
            await this.prisma.liveTip.create({
              data: {
                liveSessionId,
                fanId: invoice.fanId,
                amount,
                message: webhookResult.metadata?.message,
              },
            });
          }
        }

        // Update creator balance (add to pending)
        await this.transactionsService.updateCreatorBalance(
          invoice.creatorId,
          transaction!.amountNetCreator.toNumber()
        );

        return { ok: true };
      }

      if (webhookResult.status === "EXPIRED" || webhookResult.status === "CANCELED") {
        // Update invoice status
                    await this.prisma.cryptoInvoice.update({
                      where: { id: invoice.id },
                      data: {
                        status: webhookResult.status === "CANCELED" ? "CANCELED" : "EXPIRED" as any,
                      },
                    });

        // Mark transaction as failed/canceled if it exists
        const transaction = await this.prisma.transaction.findFirst({
          where: { externalTxnId: invoice.id },
        });

                  if (transaction) {
                      await this.prisma.transaction.update({
                        where: { id: transaction.id },
                        data: { 
                          status: webhookResult.status === "CANCELED" ? TransactionStatus.CANCELED : TransactionStatus.FAILED,
                        },
                      });
                    }

        return { ok: true };
      }

      // PENDING status - update invoice status if needed, then acknowledge
      if (webhookResult.status === "PENDING") {
        await this.prisma.cryptoInvoice.update({
          where: { id: invoice.id },
          data: { status: "PENDING" },
        });
      }

      return { ok: true };
    } catch (error: any) {
      // Log error but return 200 to avoid spam
      // Never log full error objects that might contain sensitive data
      console.error(`Crypto webhook error: ${error.message || "Unknown error"}`);
      return { ok: true };
    }
  }

  @Get("crypto/pay/:invoiceId")
  async getCryptoPaymentPage(@Param("invoiceId") invoiceId: string) {
    const invoice = await this.prisma.cryptoInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        creator: {
          select: {
            username: true,
            displayName: true,
          },
        },
      },
    });

    if (!invoice) {
      return { error: "Invoice not found" };
    }

    // Fake payment page data
    return {
      invoiceId: invoice.id,
      amount: invoice.amount,
      currency: invoice.currency,
      creator: invoice.creator,
      status: invoice.status,
      message:
        "This is a fake payment processor. In production, this would redirect to CoinPayments/NOWPayments or similar.",
      instructions: [
        "In production, this endpoint would show a payment interface",
        "Webhook endpoint: POST /payments/crypto/webhook",
        "Send { invoiceId, status: 'PAID' } to complete payment",
      ],
    };
  }

  /**
   * Test webhook endpoint (dev-only)
   * Allows developers to simulate webhook calls without hitting real gateway
   */
  @Post("crypto/test-webhook")
  async testWebhook(@Body() body: {
    providerStatus: "PENDING" | "PAID" | "EXPIRED" | "CANCELED" | "ERROR";
    invoiceId: string;
    type?: "SUBSCRIPTION" | "TIP" | "PAID_POST" | "PAID_DM";
    amount?: number;
    currency?: string;
  }) {
    const config = getCryptoConfig();
    
    // Only allow in development or with secret token
    // TODO: Add proper dev-only guard or secret token check
    if (process.env.NODE_ENV === "production" && !process.env.TEST_WEBHOOK_SECRET) {
      return { error: "Test webhook only available in development", ok: false };
    }

    // Build fake provider payload
    const fakePayload = {
      invoiceId: body.invoiceId,
      id: body.invoiceId,
      status: body.providerStatus,
      type: body.type,
      amount: body.amount,
      currency: body.currency || config.defaultCurrency,
      metadata: {
        type: body.type,
      },
    };

    // Use fake headers
    const fakeHeaders = {};

    // Map webhook using gateway (will use fake gateway)
    const webhookResult = await this.cryptoGateway.mapWebhook(fakePayload, fakeHeaders);

    // If mapping succeeded, process through real webhook handler
    if (webhookResult.ok) {
      // Reuse the real webhook processing logic
      return this.cryptoWebhook(fakePayload, {} as any, fakeHeaders);
    }

    return { error: "Webhook mapping failed", ok: false };
  }
}

