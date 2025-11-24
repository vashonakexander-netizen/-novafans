# Crypto Payment Validation Guide

Complete guide for validating the NovaFans crypto payment system.

## Quick Start

### Local Validation (Fake Mode)

```bash
# 1. Verify environment
pnpm crypto:verify-env

# 2. Run full validation
pnpm crypto:validate

# 3. Test webhook harness
pnpm crypto:test-webhook
```

### Production Validation (Real Mode)

```bash
# Run production checklist
bash scripts/crypto-validation/validate-production.sh
```

## Validation Steps

### 1. Environment Verification

**Local (Fake Mode):**
```env
CRYPTO_PROVIDER=fake
CRYPTO_DEFAULT_CURRENCY=USDT
CRYPTO_CALLBACK_BASE_URL=http://localhost:3001
CRYPTO_MIN_AMOUNT=1
# Leave CRYPTO_API_KEY and CRYPTO_IPN_SECRET blank
```

**Production (Real Mode):**
```env
CRYPTO_PROVIDER=nowpayments
CRYPTO_API_KEY=your_actual_api_key
CRYPTO_IPN_SECRET=your_hmac_secret
CRYPTO_CALLBACK_BASE_URL=https://api.yourdomain.com
CRYPTO_DEFAULT_CURRENCY=USDT
CRYPTO_MIN_AMOUNT=1
```

### 2. Local Crypto Tests

#### Subscription Flow
1. Create subscription: `POST /subscriptions/:creatorId/crypto`
2. Verify response: `{ invoiceId, paymentUrl, status: "PENDING" }`
3. Test webhook: `POST /payments/crypto/test-webhook`
4. Verify: Invoice → PAID, Transaction → COMPLETED, Subscription → ACTIVE

#### Tip Flow
1. Creator starts live session
2. Fan sends tip: `POST /live-sessions/:id/tips`
3. In fake mode: Tip completes instantly
4. Verify: LiveTip created, Transaction COMPLETED, balance updated

### 3. Webhook Testing

Use the test webhook endpoint to simulate different statuses:

```bash
# PAID
curl -X POST http://localhost:3001/payments/crypto/test-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "providerStatus": "PAID",
    "invoiceId": "<invoice-id>",
    "type": "SUBSCRIPTION",
    "amount": 10.00,
    "currency": "USDT"
  }'

# EXPIRED
curl -X POST http://localhost:3001/payments/crypto/test-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "providerStatus": "EXPIRED",
    "invoiceId": "<invoice-id>",
    "type": "SUBSCRIPTION",
    "amount": 10.00,
    "currency": "USDT"
  }'

# CANCELED
curl -X POST http://localhost:3001/payments/crypto/test-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "providerStatus": "CANCELED",
    "invoiceId": "<invoice-id>",
    "type": "SUBSCRIPTION",
    "amount": 10.00,
    "currency": "USDT"
  }'
```

### 4. Production Setup

1. **Deploy API** with crypto environment variables
2. **Verify health endpoint**: `https://api.yourdomain.com/health`
3. **Verify webhook endpoint**: `https://api.yourdomain.com/payments/crypto/webhook`
4. **Configure gateway dashboard**:
   - Webhook URL: `https://api.yourdomain.com/payments/crypto/webhook`
   - Webhook secret: Match `CRYPTO_IPN_SECRET`

### 5. Production Testing

1. **Test subscription** with real payment
2. **Test tip** with real payment
3. **Test expired invoice** handling
4. **Test canceled invoice** handling
5. **Monitor logs** for webhook processing
6. **Verify** no sensitive data in logs

## Security Checklist

- [ ] API keys stored securely (environment variables)
- [ ] Webhook secret matches gateway configuration
- [ ] HTTPS enabled for webhook URL
- [ ] Logs don't contain API keys
- [ ] Logs don't contain HMAC secrets
- [ ] Payloads truncated in logs
- [ ] Invoice IDs truncated in logs

## Troubleshooting

### Webhook Not Processing

1. Check webhook URL is publicly accessible
2. Verify `CRYPTO_CALLBACK_BASE_URL` matches deployed URL
3. Check logs for webhook mapping errors
4. Verify HMAC signature if using real gateway

### Invoice Not Found

1. Check `processorInvoiceId` matches provider invoice ID
2. Verify invoice was created before webhook arrives
3. Check logs for unknown invoice errors

### Payment Not Completing

1. Verify webhook is being called by gateway
2. Check webhook processing logs
3. Use test webhook endpoint to simulate payment
4. Verify transaction status in database

## Documentation

- `docs/CRYPTO.md` - Complete crypto payment guide
- `docs/ENVIRONMENT.md` - Environment variables reference
- `docs/DEPLOYMENT.md` - Deployment guide
- `CRYPTO_VALIDATION_COMPLETE.md` - Full validation report

## Support

For issues or questions:
1. Check logs for errors
2. Review documentation
3. Test with fake mode first
4. Verify environment variables
5. Check webhook configuration

