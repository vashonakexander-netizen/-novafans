import { Decimal } from "@prisma/client/runtime/library";

export interface CreateInvoiceParams {
  userId: string;
  creatorId: string;
  amount: Decimal | number;
  currency: string;
  type: "SUBSCRIPTION" | "TIP" | "PAID_POST" | "PAID_DM";
  metadata?: any;
}

export interface CreateInvoiceResult {
  invoiceId: string; // Internal id or provider id mapping
  paymentUrl: string;
  providerInvoiceId?: string; // Gateway invoice id
}

export interface MapWebhookResult {
  ok: boolean;
  provider: string;
  status: "PENDING" | "PAID" | "EXPIRED" | "CANCELED" | "ERROR";
  providerInvoiceId?: string;
  amount?: number;
  currency?: string;
  type?: "SUBSCRIPTION" | "TIP" | "PAID_POST" | "PAID_DM";
  metadata?: any;
  raw: any;
}

export interface ICryptoGateway {
  createInvoice(params: CreateInvoiceParams): Promise<CreateInvoiceResult>;
  mapWebhook(payload: any, headers: any): Promise<MapWebhookResult>;
}

