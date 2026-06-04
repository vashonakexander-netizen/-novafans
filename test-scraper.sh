#!/bin/bash

# Test script for the scraper
# Usage: ./test-scraper.sh YOUR_TOKEN YOUR_COOKIE

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "❌ Missing arguments"
  echo ""
  echo "Usage: ./test-scraper.sh YOUR_SAVAGE_HOUSE_TOKEN YOUR_TOFLX_COOKIE"
  echo ""
  echo "To get your token:"
  echo "  1. Login to Savage House as CREATOR"
  echo "  2. F12 → Application → localStorage → copy 'token'"
  echo ""
  echo "To get your cookie:"
  echo "  1. Login to toflx.com"
  echo "  2. F12 → Network tab → visit movie page"
  echo "  3. Click request → Headers → copy 'Cookie' value"
  exit 1
fi

TOKEN=$1
COOKIE=$2
MOVIE_URL="https://toflx.com/movies/one-battle-after-another-2025"
API_URL="http://localhost:3001"

echo "🎬 Testing Scraper..."
echo ""
echo "Movie URL: $MOVIE_URL"
echo ""

# Create scrape job
echo "📤 Creating scrape job..."
RESPONSE=$(curl -s -X POST "$API_URL/creator/scraper/scrape" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"sourceUrl\": \"$MOVIE_URL\",
    \"config\": {
      \"apiHeaders\": {
        \"Cookie\": \"$COOKIE\"
      }
    }
  }")

echo "Response: $RESPONSE"
echo ""

# Extract import session ID
SESSION_ID=$(echo $RESPONSE | grep -o '"importSessionId":"[^"]*' | cut -d'"' -f4)

if [ -z "$SESSION_ID" ]; then
  echo "❌ Failed to create scrape job"
  echo "Response: $RESPONSE"
  exit 1
fi

echo "✅ Scrape job created!"
echo "   Import Session ID: $SESSION_ID"
echo ""
echo "⏳ Waiting for scraper to process (checking every 5 seconds)..."
echo ""

# Check status
for i in {1..60}; do
  sleep 5
  STATUS=$(curl -s "$API_URL/creator/scraper/jobs/$SESSION_ID" \
    -H "Authorization: Bearer $TOKEN" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
  
  echo "[$i/60] Status: $STATUS"
  
  if [ "$STATUS" = "READY" ]; then
    echo ""
    echo "✅ Scraping complete!"
    echo ""
    echo "📋 Check results:"
    echo "   GET $API_URL/creator/scraper/jobs/$SESSION_ID"
    echo ""
    echo "📋 Preview media:"
    echo "   GET $API_URL/creator/import/sessions/$SESSION_ID/preview"
    exit 0
  fi
  
  if [ "$STATUS" = "CANCELED" ]; then
    echo ""
    echo "❌ Scraping failed or was canceled"
    exit 1
  fi
done

echo ""
echo "⏰ Timeout - scraping is taking longer than expected"
echo "   Check status manually: GET $API_URL/creator/scraper/jobs/$SESSION_ID"
