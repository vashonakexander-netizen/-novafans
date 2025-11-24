import { ICryptoGateway, CreateInvoiceParams, CreateInvoiceResult, MapWebhookResult } from "../crypto-gateway.interface";
import { Logger } from "@nestjs/common";
import * as crypto from "crypto";
const axios = require("axios");

interface NowPaymentsConfig {
  apiKey: string;
  ipnSecret?: string;
  webhookSecret?: string; // Legacy alias
  callbackBaseUrl: string;
  defaultCurrency: string;
  minAmount: number;
}

/**
 * NOWPayments-style crypto gateway implementation
 * 
 * TODO: Adapt this to actual NOWPayments API documentation when integrating
 * TODO: Add support for other providers (CoinPayments, etc.)
 * TODO: Add retry logic and error handling for API calls
 * TODO: Add rate limiting for API calls
 */
export class NowPaymentsGateway implements ICryptoGateway {
  private readonly logger = new Logger(NowPaymentsGateway.name);
  private readonly apiBaseUrl = "https://api.nowpayments.io/v1"; // TODO: Use sandbox URL in dev
  private readonly config: NowPaymentsConfig;

  constructor(config: NowPaymentsConfig) {
    this.config = config;
  }

  async createInvoice(params: CreateInvoiceParams): Promise<CreateInvoiceResult> {
    try {
      // Construct callback URL
      const callbackUrl = `${this.config.callbackBaseUrl}/payments/crypto/webhook`;
      
      // Prepare invoice request (NOWPayments-style)
      // TODO: Adjust this to match actual NOWPayments API structure
      const invoiceRequest = {
        price_amount: Number(params.amount),
        price_currency: params.currency || this.config.defaultCurrency,
        pay_currency: params.currency || this.config.defaultCurrency,
        order_id: `${params.type}_${params.userId}_${Date.now()}`,
        order_description: `NovaFans ${params.type}`,
        ipn_callback_url: callbackUrl,
        success_url: `${this.config.callbackBaseUrl}/payments/crypto/success`,
        cancel_url: `${this.config.callbackBaseUrl}/payments/crypto/cancel`,
        // Custom metadata for our internal tracking
        metadata: {
          userId: params.userId,
          creatorId: params.creatorId,
          type: params.type,
          ...params.metadata,
        },
      };

      // Call NOWPayments API
      const response = await axios.post(
        `${this.apiBaseUrl}/payment`,
        invoiceRequest,
        {
          headers: {
            "x-api-key": this.config.apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      const providerInvoice = response.data;
      
      // Extract provider invoice ID and payment URL
      const rawProviderId = providerInvoice.payment_id || providerInvoice.id;
      const paymentUrl = providerInvoice.invoice_url || providerInvoice.payment_url;

      if (!rawProviderId || !paymentUrl) {
        throw new Error("Invalid response from crypto gateway");
      }

      // Return provider invoice ID and payment URL
      // The caller will create an internal invoice and link it via providerInvoiceId
      return {
        invoiceId: rawProviderId, // Temporary: caller will create internal ID
        paymentUrl,
        providerInvoiceId: rawProviderId,
      };
    } catch (error: any) {
      this.logger.error(`Failed to create invoice with NOWPayments: ${error.message}`);
      throw new Error(`Crypto gateway error: ${error.message}`);
    }
  }

  async mapWebhook(payload: any, headers: any): Promise<MapWebhookResult> {
    // Verify webhook signature if secret is configured
    const secret = this.config.ipnSecret || this.config.webhookSecret;
    if (secret) {
      const signature = headers["x-nowpayments-sig"] || headers["x-signature"] || headers["x-ipn-signature"];
      if (!signature) {
        return {
          ok: false,
          provider: "nowpayments",
          status: "ERROR",
          raw: payload,
        };
      }

      // Verify HMAC signature
      // TODO: Adjust signature algorithm based on actual NOWPayments documentation
      // NOWPayments typically uses HMAC-SHA512
      const expectedSignature = crypto
        .createHmac("sha512", secret)
        .update(JSON.stringify(payload))
        .digest("hex");

      if (signature !== expectedSignature) {
        return {
          ok: false,
          provider: "nowpayments",
          status: "ERROR",
          raw: payload,
        };
      }
    }

    // Extract invoice ID and status from NOWPayments payload
    // TODO: Adjust field names to match actual NOWPayments webhook structure
    const providerInvoiceId = payload.payment_id || payload.id || payload.invoice_id;
    const status = payload.payment_status || payload.status;

    if (!providerInvoiceId) {
      return {
        ok: false,
        provider: "nowpayments",
        status: "ERROR",
        raw: payload,
      };
    }

    // Map NOWPayments statuses to our standard statuses
    let mappedStatus: "PENDING" | "PAID" | "EXPIRED" | "CANCELED" | "ERROR" = "PENDING";
    const statusUpper = (status || "").toUpperCase();
    
    if (statusUpper === "CONFIRMED" || statusUpper === "PAID" || statusUpper === "COMPLETED") {
      mappedStatus = "PAID";
    } else if (statusUpper === "EXPIRED") {
      mappedStatus = "EXPIRED";
    } else if (statusUpper === "CANCELED" || statusUpper === "CANCELLED" || statusUpper === "FAILED") {
      mappedStatus = "CANCELED";
    } else if (statusUpper === "WAITING" || statusUpper === "PENDING") {
      mappedStatus = "PENDING";
    } else {
      mappedStatus = "ERROR";
    }

    // Extract metadata from payload
    const metadata = payload.metadata || {};
    const type = metadata.type as "SUBSCRIPTION" | "TIP" | "PAID_POST" | "PAID_DM" | undefined;

    return {
      ok: true,
      provider: "nowpayments",
      status: mappedStatus,
      providerInvoiceId,
      amount: payload.payment_amount || payload.amount ? Number(payload.payment_amount || payload.amount) : undefined,
      currency: payload.pay_currency || payload.currency,
      type,
      metadata,
      raw: payload,
    };
  }
}

