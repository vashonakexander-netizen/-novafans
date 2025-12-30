# Crypto Payments Guide

Complete guide to NovaFans crypto payment system, including fake mode and real gateway integration.

## Overview

NovaFans supports crypto payments through a pluggable gateway system:
- **Fake Mode** (default): Simulated payments for development/testing
- **Real Mode**: Integration with NOWPayments-style gateways for production

## Configuration

### Environment Variables

#### Fake Mode (Default)
```env
# No configuration needed - works out of the box
CRYPTO_PROVIDER=fake
# Or simply omit CRYPTO_PROVIDER and CRYPTO_API_KEY
```

#### Real Mode (NOWPayments)
```env
CRYPTO_PROVIDER=nowpayments
CRYPTO_API_KEY=your-nowpayments-api-key
CRYPTO_IPN_SECRET=your-webhook-secret-hmac-key
CRYPTO_CALLBACK_BASE_URL=https://api.novafans.com
CRYPTO_DEFAULT_CURRENCY=USDT
CRYPTO_MIN_AMOUNT=1.0
```

### Configuration Details

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CRYPTO_PROVIDER` | No | `fake` | Provider: `fake` or `nowpayments` |
| `CRYPTO_API_KEY` | Yes (real mode) | - | Gateway API key |
| `CRYPTO_IPN_SECRET` | Recommended | - | Webhook HMAC secret for verification |
| `CRYPTO_CALLBACK_BASE_URL` | No | API base URL | Base URL for webhook callbacks |
| `CRYPTO_DEFAULT_CURRENCY` | No | `USDT` | Default payment currency |
| `CRYPTO_MIN_AMOUNT` | No | `1.0` | Minimum payment amount |

## Payment Flows

### Subscription Flow

**Endpoint:** `POST /subscriptions/:creatorId/crypto`

**Request:**
```json
{
  "currency": "USDT" // optional, defaults to CRYPTO_DEFAULT_CURRENCY
}
```

**Response:**
```json
{
  "invoiceId": "internal-invoice-id",
  "paymentUrl": "https://gateway.com/pay/...",
  "status": "PENDING",
  "amount": 10.00,
  "currency": "USDT",
  "expiresAt": "2024-01-01T12:00:00Z"
}
```

**Flow:**
1. Validates amount >= `CRYPTO_MIN_AMOUNT`
2. Creates invoice via gateway
3. Creates `CryptoInvoice` record (PENDING)
4. Creates `Transaction` stub (PENDING)
5. Returns payment URL

**Fake Mode:**
- Returns fake payment URL: `https://fake.novafans.com/crypto/{invoiceId}`
- No external API calls

**Real Mode:**
- Calls NOWPayments API
- Returns actual gateway payment URL
- User completes payment on gateway
- Webhook processes payment completion

### Tip Flow

**Endpoint:** `POST /live-sessions/:id/tips`

**Request:**
```json
{
  "amount": 5.00,
  "message": "Great show!"
}
```

**Fake Mode:**
- Processes instantly
- Creates completed transaction
- Updates creator balance
- Creates LiveTip entry
- Returns tip object

**Real Mode:**
- Validates amount >= `CRYPTO_MIN_AMOUNT`
- Creates invoice via gateway
- Creates `CryptoInvoice` (PENDING)
- Creates `Transaction` (PENDING)
- Returns payment URL
- Webhook processes payment completion

**Response (Real Mode):**
```json
{
  "invoiceId": "internal-invoice-id",
  "paymentUrl": "https://gateway.com/pay/...",
  "status": "PENDING",
  "amount": 5.00,
  "currency": "USDT",
  "message": "Redirect user to paymentUrl to complete tip payment"
}
```

## Webhook Handling

### Webhook Endpoint

**Endpoint:** `POST /payments/crypto/webhook`

**Security:**
- HMAC signature verification (if `CRYPTO_IPN_SECRET` configured)
- Unknown invoices logged but acknowledged (to avoid spam)

**Processing:**
1. Maps webhook payload via `CryptoGatewayService.mapWebhook`
2. Finds invoice by `providerInvoiceId` or internal ID
3. Processes based on status:
   - **PAID**: Completes transaction, activates subscription, updates balance
   - **EXPIRED/CANCELED**: Marks transaction as failed
   - **PENDING**: Updates invoice status

**Status Mapping:**
- Provider statuses mapped to: `PENDING`, `PAID`, `EXPIRED`, `CANCELED`, `ERROR`

### Test Webhook Endpoint

**Endpoint:** `POST /payments/crypto/test-webhook` (dev-only)

**Purpose:**
- Simulate webhook calls without hitting real gateway
- Test payment flows locally

**Request:**
```json
{
  "providerStatus": "PAID",
  "invoiceId": "internal-invoice-id",
  "type": "SUBSCRIPTION",
  "amount": 10.00,
  "currency": "USDT"
}
```

**Usage:**
```bash
# Test subscription payment
curl -X POST http://localhost:3001/payments/crypto/test-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "providerStatus": "PAID",
    "invoiceId": "your-invoice-id",
    "type": "SUBSCRIPTION",
    "amount": 10.00,
    "currency": "USDT"
  }'
```

**Security:**
- Only available in development (`NODE_ENV !== 'production'`)
- Or with `TEST_WEBHOOK_SECRET` environment variable

## Gateway Interface

### `CryptoGatewayService`

**Methods:**

#### `createInvoice(params)`
```typescript
{
  userId: string;
  creatorId: string;
  amount: number;
  currency: string;
  type: "SUBSCRIPTION" | "TIP" | "PAID_POST" | "PAID_DM";
  metadata?: any;
}
```

Returns:
```typescript
{
  invoiceId: string;
  paymentUrl: string;
  providerInvoiceId?: string;
}
```

#### `mapWebhook(payload, headers)`
Maps provider webhook to standard format:

Returns:
```typescript
{
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
```

## Implementation Details

### Fake Gateway

- Generates random invoice IDs
- Returns fake payment URLs
- Accepts webhook payloads with `{ invoiceId, status, type?, amount?, currency? }`
- No external API calls

### NOWPayments Gateway

**API Endpoint:** `https://api.nowpayments.io/v1/payment` (TODO: Use sandbox in dev)

**Invoice Creation:**
- POST to `/payment` with invoice details
- Includes metadata for internal tracking
- Sets callback URL: `{CRYPTO_CALLBACK_BASE_URL}/payments/crypto/webhook`

**Webhook Verification:**
- Verifies HMAC-SHA512 signature (if `CRYPTO_IPN_SECRET` set)
- Extracts payment status from payload
- Maps provider statuses to standard statuses

**TODO:**
- Adjust API endpoints to match actual NOWPayments documentation
- Add support for sandbox/test mode
- Add retry logic for API calls
- Add rate limiting

## Logging

### Invoice Creation
- Logs: provider, amount, currency, type
- Does NOT log: API keys, secrets, full payloads

### Webhook Processing
- Logs: provider, status, providerInvoiceId, type
- Logs: payload preview (truncated to 200 chars)
- Does NOT log: API keys, secrets, full sensitive payloads

### Error Handling
- Unknown invoices: Logged but acknowledged (200 response)
- Invalid signatures: Logged, returns error result
- Mapping failures: Logged, returns error result

## Production Deployment

### Requirements

1. **HTTPS Required**
   - Webhook URL must be publicly accessible
   - Must use HTTPS in production
   - Gateway must be able to reach your webhook endpoint

2. **Webhook URL**
   - Configure in gateway dashboard: `https://api.novafans.com/payments/crypto/webhook`
   - Must match `CRYPTO_CALLBACK_BASE_URL`

3. **IPN Secret**
   - Generate strong secret for HMAC verification
   - Store securely (environment variable)
   - Configure in gateway dashboard

4. **Testing**
   - Use test webhook endpoint in development
   - Test with small amounts first
   - Verify webhook processing before going live

## Backward Compatibility

✅ **Fake mode is fully preserved:**
- Works without any configuration
- All existing frontend code continues to work
- No breaking changes to API responses
- Fake webhook format still supported

## Troubleshooting

### Webhook Not Processing

1. Check webhook URL is publicly accessible
2. Verify `CRYPTO_CALLBACK_BASE_URL` matches deployed URL
3. Check logs for webhook mapping errors
4. Verify HMAC signature if using real gateway

### Invoice Not Found

- Check `processorInvoiceId` matches provider invoice ID
- Verify invoice was created before webhook arrives
- Check logs for unknown invoice errors

### Payment Not Completing

- Verify webhook is being called by gateway
- Check webhook processing logs
- Use test webhook endpoint to simulate payment
- Verify transaction status in database

## TODO

- [ ] Add support for CoinPayments provider
- [ ] Add sandbox/test mode for NOWPayments
- [ ] Add retry logic for API calls
- [ ] Add rate limiting for API calls
- [ ] Add webhook replay mechanism
- [ ] Add invoice expiration handling
- [ ] Add payment status polling (fallback if webhook fails)


