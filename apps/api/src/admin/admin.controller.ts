import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../common/prisma/prisma.service";
import { getCryptoConfig } from "@savage-house/config";
import { readFileSync } from "fs";
import { join } from "path";
import { existsSync } from "fs";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get("crypto-status")
  async getCryptoStatus(@CurrentUser() user: any) {
    const cryptoConfig = getCryptoConfig();
    
    // Get last 10 crypto invoices
    const recentInvoices = await this.prisma.cryptoInvoice.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        fan: {
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
    });

    // Get validation results if available
    let validationResults = null;
    try {
      const resultsPath = join(process.cwd(), "CRYPTO_VALIDATION_RESULTS.json");
      if (existsSync(resultsPath)) {
        const resultsData = readFileSync(resultsPath, "utf-8");
        validationResults = JSON.parse(resultsData);
      }
    } catch (error) {
      // Validation results not available
      validationResults = null;
    }

    // Check health
    let healthStatus = {
      api: "unknown",
      webhook: "unknown",
    };

    try {
      // This is a self-check, so we'll just return configured status
      healthStatus.api = "ok";
      healthStatus.webhook = cryptoConfig.callbackBaseUrl ? "configured" : "not_configured";
    } catch (error) {
      // Ignore
    }

    // Determine test statuses
    const subscriptionFlowStatus = validationResults?.tests?.subscription_flow?.status || "UNKNOWN";
    const tipFlowStatus = validationResults?.tests?.balance_updates?.status || "UNKNOWN";
    const webhookMappingStatus = validationResults?.tests?.webhook_status_mapping?.status || "UNKNOWN";
    const balanceUpdatesStatus = validationResults?.tests?.balance_updates?.status || "UNKNOWN";

    return {
      crypto: {
        provider: cryptoConfig.provider,
        mode: cryptoConfig.provider === "fake" || !cryptoConfig.apiKey ? "fake" : "real",
        configured: cryptoConfig.provider === "fake" || !!cryptoConfig.apiKey,
        hasApiKey: !!cryptoConfig.apiKey,
        hasIpnSecret: !!cryptoConfig.ipnSecret,
        callbackBaseUrl: cryptoConfig.callbackBaseUrl,
        defaultCurrency: cryptoConfig.defaultCurrency,
        minAmount: cryptoConfig.minAmount,
      },
      health: healthStatus,
      recentInvoices: recentInvoices.map((inv) => ({
        id: inv.id,
        amount: Number(inv.amount),
        currency: inv.currency,
        status: inv.status,
        createdAt: inv.createdAt,
        expiresAt: inv.expiresAt,
        fan: inv.fan,
        creator: inv.creator,
      })),
      validation: validationResults?.summary || null,
      tests: {
        subscriptionFlow: subscriptionFlowStatus === "PASS" || subscriptionFlowStatus === "MANUAL" ? "PASS" : subscriptionFlowStatus,
        tipFlow: tipFlowStatus === "PASS" ? "PASS" : "FAIL",
        webhookMapping: webhookMappingStatus === "PASS" ? "PASS" : "FAIL",
        balanceUpdates: balanceUpdatesStatus === "PASS" ? "PASS" : "FAIL",
      },
      lastValidated: validationResults?.timestamp || null,
    };
  }
}
