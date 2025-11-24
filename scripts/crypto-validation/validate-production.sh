#!/bin/bash

# Production crypto validation checklist

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_step() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

API_URL="${API_URL:-https://api.novafans.com}"

log_step "Production Crypto Validation Checklist"

echo "API URL: $API_URL"
echo ""

log_step "1. Environment Variables"

log_info "Required for real crypto mode:"
echo "  ✓ CRYPTO_PROVIDER=nowpayments"
echo "  ✓ CRYPTO_API_KEY=<your-key>"
echo "  ✓ CRYPTO_IPN_SECRET=<your-secret>"
echo "  ✓ CRYPTO_CALLBACK_BASE_URL=$API_URL"
echo "  ✓ CRYPTO_DEFAULT_CURRENCY=USDT"
echo "  ✓ CRYPTO_MIN_AMOUNT=1"
echo ""

log_step "2. Health Check"

if command -v curl &> /dev/null; then
    if curl -s "${API_URL}/health" > /dev/null 2>&1; then
        log_info "✓ API health endpoint is accessible"
    else
        log_error "✗ API health endpoint is not accessible"
    fi
else
    log_warn "curl not available, skipping health check"
fi

log_step "3. Webhook Endpoint"

WEBHOOK_URL="${API_URL}/payments/crypto/webhook"
log_info "Webhook URL: $WEBHOOK_URL"
log_info "Verify this URL is configured in your crypto gateway dashboard"
echo ""

log_step "4. Testing Checklist"

log_info "Manual tests required:"
echo "  [ ] Test subscription flow with real payment"
echo "  [ ] Test tip flow with real payment"
echo "  [ ] Test expired invoice handling"
echo "  [ ] Test canceled invoice handling"
echo "  [ ] Verify webhook processing in logs"
echo "  [ ] Verify no sensitive data in logs"
echo ""

log_step "5. Security Checklist"

log_info "Verify:"
echo "  [ ] CRYPTO_IPN_SECRET is set and matches gateway"
echo "  [ ] Webhook URL uses HTTPS"
echo "  [ ] API keys are stored securely (not in code)"
echo "  [ ] Logs don't contain API keys or secrets"
echo ""

log_info "✅ Production validation checklist complete"
log_info "   Complete manual tests before going live"

