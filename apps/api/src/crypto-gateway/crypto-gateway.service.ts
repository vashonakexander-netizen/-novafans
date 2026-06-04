import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { getCryptoConfig } from "@savage-house/config";
import { ICryptoGateway, CreateInvoiceParams, CreateInvoiceResult, MapWebhookResult } from "./crypto-gateway.interface";
import { FakeCryptoGateway } from "./providers/fake-crypto-gateway";
import { NowPaymentsGateway } from "./providers/nowpayments-gateway";

@Injectable()
export class CryptoGatewayService implements ICryptoGateway, OnModuleInit {
  private readonly logger = new Logger(CryptoGatewayService.name);
  private gateway: ICryptoGateway;
  private config: ReturnType<typeof getCryptoConfig>;
  private provider: string;

  onModuleInit() {
    this.config = getCryptoConfig();
    
    // Initialize gateway based on provider
    if (this.config.provider === "fake" || !this.config.apiKey) {
      this.logger.log("Using FAKE crypto gateway (no API key or provider=fake)");
      this.gateway = new FakeCryptoGateway();
      this.provider = "fake";
    } else if (this.config.provider === "nowpayments") {
      if (!this.config.apiKey) {
        this.logger.warn("CRYPTO_PROVIDER=nowpayments but CRYPTO_API_KEY is missing. Falling back to FAKE mode.");
        this.gateway = new FakeCryptoGateway();
        this.provider = "fake";
      } else {
        if (!this.config.apiKey) {
          this.logger.warn("NOWPayments API key not configured. Falling back to FAKE mode.");
          this.gateway = new FakeCryptoGateway();
          this.provider = "fake";
        } else {
          this.logger.log("Using NOWPayments crypto gateway");
          this.gateway = new NowPaymentsGateway({
            apiKey: this.config.apiKey,
            ipnSecret: this.config.ipnSecret,
            webhookSecret: this.config.webhookSecret,
            callbackBaseUrl: this.config.callbackBaseUrl,
            defaultCurrency: this.config.defaultCurrency,
            minAmount: this.config.minAmount,
          });
          this.provider = "nowpayments";
        }
      }
    } else {
      this.logger.warn(`Unknown CRYPTO_PROVIDER: ${this.config.provider}. Falling back to FAKE mode.`);
      this.gateway = new FakeCryptoGateway();
      this.provider = "fake";
    }
  }

  async createInvoice(params: CreateInvoiceParams): Promise<CreateInvoiceResult> {
    // Validate minimum amount
    const amount = Number(params.amount);
    if (amount < this.config.minAmount) {
      throw new Error(`Amount must be at least ${this.config.minAmount} ${params.currency || this.config.defaultCurrency}`);
    }

    // Log invoice creation (without sensitive data)
    this.logger.log(
      `Creating invoice: provider=${this.provider}, amount=${amount}, currency=${params.currency || this.config.defaultCurrency}, type=${params.type}, userId=${params.userId}, creatorId=${params.creatorId}`
    );

    const result = await this.gateway.createInvoice(params);

    // Log result (without sensitive data - never log API keys or secrets)
    this.logger.log(
      `Invoice created: invoiceId=${result.invoiceId.substring(0, 16)}..., providerInvoiceId=${result.providerInvoiceId ? result.providerInvoiceId.substring(0, 16) + "..." : "N/A"}, provider=${this.provider}`
    );

    return result;
  }

  async mapWebhook(payload: any, headers: any): Promise<MapWebhookResult> {
    try {
      const result = await this.gateway.mapWebhook(payload, headers);
      
      // Log webhook mapping (truncate payload for safety, never log secrets)
      const payloadPreview = JSON.stringify(payload).substring(0, 200);
      this.logger.log(
        `Webhook mapped: provider=${result.provider}, status=${result.status}, providerInvoiceId=${result.providerInvoiceId ? result.providerInvoiceId.substring(0, 16) + "..." : "N/A"}, type=${result.type || "N/A"}`
      );
      this.logger.debug(`Webhook payload preview (truncated): ${payloadPreview}...`);

      return result;
    } catch (error: any) {
      this.logger.error(`Webhook mapping failed: ${error.message}`);
      
      // Return error result instead of throwing
      return {
        ok: false,
        provider: this.provider,
        status: "ERROR",
        raw: payload,
      };
    }
  }
}

