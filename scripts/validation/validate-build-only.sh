#!/bin/bash

# NovaFans Build-Only Validation Script
# Validates that all packages can build without starting services

set -e

# Colors
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

log_step() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Step: $1${NC}"
    echo -e "${GREEN}========================================${NC}"
}

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "$SCRIPT_DIR/../.." && pwd )"

cd "$ROOT_DIR"

log_info "Starting NovaFans build validation"

# Step 1: Install dependencies
log_step "1. Installing dependencies"
pnpm install --frozen-lockfile
log_info "✓ Dependencies installed"

# Step 2: Build packages
log_step "2. Building packages"

log_info "Building @novafans/config..."
cd packages/config
pnpm build
cd "$ROOT_DIR"
log_info "✓ Config package built"

log_info "Building API..."
cd apps/api
npx prisma generate
npx nest build
cd "$ROOT_DIR"
log_info "✓ API built"

log_info "Building AI service..."
cd apps/ai
pnpm build
cd "$ROOT_DIR"
log_info "✓ AI service built"

log_info "Building Web app..."
cd apps/web
pnpm build
cd "$ROOT_DIR"
log_info "✓ Web app built"

log_info "✅ BUILD VALIDATION COMPLETE - All packages built successfully"

exit 0


