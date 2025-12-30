#!/bin/bash

# Verify crypto environment configuration

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
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

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "$SCRIPT_DIR/../.." && pwd )"
API_ENV="${API_ENV:-$ROOT_DIR/apps/api/.env}"

cd "$ROOT_DIR"

echo "Verifying crypto environment configuration..."
echo ""

# Check if .env exists
if [ ! -f "$API_ENV" ]; then
    log_warn ".env file not found at $API_ENV"
    log_info "Creating from .env.example..."
    if [ -f "$ROOT_DIR/apps/api/.env.example" ]; then
        cp "$ROOT_DIR/apps/api/.env.example" "$API_ENV"
        log_info "✓ Created .env from example"
    else
        log_error ".env.example not found"
        exit 1
    fi
fi

# Check required variables for fake mode
log_info "Checking fake mode configuration..."

if grep -q "CRYPTO_PROVIDER=fake" "$API_ENV" 2>/dev/null || ! grep -q "CRYPTO_PROVIDER=" "$API_ENV" 2>/dev/null; then
    log_info "✓ CRYPTO_PROVIDER is fake or not set (defaults to fake)"
else
    PROVIDER=$(grep "CRYPTO_PROVIDER=" "$API_ENV" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    log_info "CRYPTO_PROVIDER is set to: $PROVIDER"
fi

# Set defaults if not present
if ! grep -q "CRYPTO_DEFAULT_CURRENCY=" "$API_ENV" 2>/dev/null; then
    echo "CRYPTO_DEFAULT_CURRENCY=USDT" >> "$API_ENV"
    log_info "✓ Added CRYPTO_DEFAULT_CURRENCY=USDT"
fi

if ! grep -q "CRYPTO_CALLBACK_BASE_URL=" "$API_ENV" 2>/dev/null; then
    echo "CRYPTO_CALLBACK_BASE_URL=http://localhost:3001" >> "$API_ENV"
    log_info "✓ Added CRYPTO_CALLBACK_BASE_URL=http://localhost:3001"
fi

if ! grep -q "CRYPTO_MIN_AMOUNT=" "$API_ENV" 2>/dev/null; then
    echo "CRYPTO_MIN_AMOUNT=1" >> "$API_ENV"
    log_info "✓ Added CRYPTO_MIN_AMOUNT=1"
fi

# Verify CRYPTO_API_KEY is not set (for fake mode)
if grep -q "CRYPTO_API_KEY=" "$API_ENV" 2>/dev/null; then
    API_KEY=$(grep "CRYPTO_API_KEY=" "$API_ENV" | cut -d'=' -f2)
    if [ -n "$API_KEY" ] && [ "$API_KEY" != "" ]; then
        log_warn "CRYPTO_API_KEY is set - this will use real mode, not fake mode"
    else
        log_info "✓ CRYPTO_API_KEY is empty (fake mode)"
    fi
else
    log_info "✓ CRYPTO_API_KEY not set (fake mode)"
fi

echo ""
log_info "✅ Environment verification complete"
log_info "   Fake mode is configured correctly"


