#!/bin/bash

# Test webhook harness script
# Tests the /payments/crypto/test-webhook endpoint

set -e

API_URL="${API_URL:-http://localhost:3001}"

echo "Testing crypto webhook harness..."
echo "API URL: $API_URL"
echo ""

# Test 1: PAID status
echo "Test 1: Simulating PAID webhook"
echo "Note: Requires existing invoiceId from a real subscription"
echo ""
echo "Example:"
echo "curl -X POST $API_URL/payments/crypto/test-webhook \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"providerStatus\": \"PAID\","
echo "    \"invoiceId\": \"<your-invoice-id>\","
echo "    \"type\": \"SUBSCRIPTION\","
echo "    \"amount\": 10.00,"
echo "    \"currency\": \"USDT\""
echo "  }'"
echo ""

# Test 2: EXPIRED status
echo "Test 2: Simulating EXPIRED webhook"
echo "curl -X POST $API_URL/payments/crypto/test-webhook \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"providerStatus\": \"EXPIRED\","
echo "    \"invoiceId\": \"<your-invoice-id>\","
echo "    \"type\": \"SUBSCRIPTION\","
echo "    \"amount\": 10.00,"
echo "    \"currency\": \"USDT\""
echo "  }'"
echo ""

# Test 3: CANCELED status
echo "Test 3: Simulating CANCELED webhook"
echo "curl -X POST $API_URL/payments/crypto/test-webhook \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"providerStatus\": \"CANCELED\","
echo "    \"invoiceId\": \"<your-invoice-id>\","
echo "    \"type\": \"SUBSCRIPTION\","
echo "    \"amount\": 10.00,"
echo "    \"currency\": \"USDT\""
echo "  }'"
echo ""

echo "Expected results:"
echo "  - PAID: Invoice → PAID, Transaction → COMPLETED, Subscription → ACTIVE"
echo "  - EXPIRED: Invoice → EXPIRED, Transaction → FAILED, No subscription"
echo "  - CANCELED: Invoice → CANCELED, Transaction → FAILED, No subscription"


