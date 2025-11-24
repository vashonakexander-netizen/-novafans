import { ICryptoGateway, CreateInvoiceParams, CreateInvoiceResult, MapWebhookResult } from "../crypto-gateway.interface";
import { randomBytes } from "crypto";

/**
 * Fake crypto gateway implementation
 * Maintains backward compatibility with existing fake payment flow
 */
export class FakeCryptoGateway implements ICryptoGateway {
  async createInvoice(params: CreateInvoiceParams): Promise<CreateInvoiceResult> {
    // Generate a fake invoice ID (similar to current behavior)
    const invoiceId = randomBytes(16).toString("hex");
    
    // Return fake payment URL (matches current frontend expectation)
    const paymentUrl = `https://fake.novafans.com/crypto/${invoiceId}`;
    
    return {
      invoiceId,
      paymentUrl,
      providerInvoiceId: invoiceId, // In fake mode, use same ID
    };
  }

  async mapWebhook(payload: any, headers: any): Promise<MapWebhookResult> {
    // Current fake webhook expects: { invoiceId: string, status: string, type?: string, amount?: number, currency?: string }
    const invoiceId = payload.invoiceId || payload.id;
    const status = payload.status?.toUpperCase() || "PENDING";
    
    // Map to our standard statuses
    let mappedStatus: "PENDING" | "PAID" | "EXPIRED" | "CANCELED" | "ERROR" = "PENDING";
    if (status === "PAID" || status === "COMPLETED") {
      mappedStatus = "PAID";
    } else if (status === "EXPIRED") {
      mappedStatus = "EXPIRED";
    } else if (status === "CANCELED" || status === "CANCELLED" || status === "FAILED") {
      mappedStatus = "CANCELED";
    } else if (status === "ERROR") {
      mappedStatus = "ERROR";
    }

    return {
      ok: true,
      provider: "fake",
      status: mappedStatus,
      providerInvoiceId: invoiceId,
      amount: payload.amount ? Number(payload.amount) : undefined,
      currency: payload.currency,
      type: payload.type as "SUBSCRIPTION" | "TIP" | "PAID_POST" | "PAID_DM" | undefined,
      metadata: payload.metadata,
      raw: payload,
    };
  }
}

