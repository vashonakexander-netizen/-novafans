#!/bin/bash

# Quick demo script to test the scraper and show movies

API_URL="http://localhost:3001"
SOURCE_URL="https://toflx.com/movies/one-battle-after-another-2025"
COOKIE="pip=ap4kt4641myj; si2=1759548421; _vjs_volume=1; show_watched_5be491fa88819d08df6093f8=true; default_list_type_5be491fa88819d08df6093f8=%22infinity%22; pagin_size_5be491fa88819d08df6093f8=%22auto%22; scbw_5be491fa88819d08df6093f9=69555c398e9d448a1eb05263; auid=5be491fa88819d08df6093f8-p; ds8=1; test_cookie=1769478298552; pxid=1769478300"

echo "🎬 Testing Scraper & Auto-Import"
echo "=================================="
echo ""

# Wait for API to be ready
echo "⏳ Waiting for API server..."
for i in {1..10}; do
  if curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo "✅ API server is ready!"
    break
  fi
  echo "   Attempt $i/10..."
  sleep 2
done

echo ""
echo "📥 Creating scrape job..."
echo "   URL: $SOURCE_URL"
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/scraper/scrape" \
  -H "Content-Type: application/json" \
  -d "{
    \"sourceUrl\": \"$SOURCE_URL\",
    \"config\": {
      \"apiHeaders\": {
        \"Cookie\": \"$COOKIE\"
      }
    }
  }")

IMPORT_SESSION_ID=$(echo "$RESPONSE" | grep -o '"importSessionId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$IMPORT_SESSION_ID" ]; then
  echo "❌ Failed to create scrape job"
  echo "Response: $RESPONSE"
  exit 1
fi

echo "✅ Scrape job created!"
echo "   Import Session ID: $IMPORT_SESSION_ID"
echo ""
echo "⏳ Scraping and importing (this may take 30-60 seconds)..."
echo "   The scraper will:"
echo "   1. Extract videos/images from the page"
echo "   2. Download them"
echo "   3. Auto-create posts (one per media item)"
echo "   4. Publish them immediately"
echo ""

# Monitor status
STATUS="PENDING"
ATTEMPTS=0
MAX_ATTEMPTS=30

while [ "$STATUS" != "READY" ] && [ "$STATUS" != "COMMITTED" ] && [ "$STATUS" != "CANCELED" ] && [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
  sleep 5
  ATTEMPTS=$((ATTEMPTS + 1))
  
  STATUS_RESPONSE=$(curl -s "$API_URL/scraper/jobs/$IMPORT_SESSION_ID")
  STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
  TOTAL_FILES=$(echo "$STATUS_RESPONSE" | grep -o '"totalFiles":[^,}]*' | cut -d':' -f2 | tr -d ' ')
  MEDIA_COUNT=$(echo "$STATUS_RESPONSE" | grep -o '"mediaCount":[^,}]*' | cut -d':' -f2 | tr -d ' ')
  
  echo "   Status: $STATUS | Files: ${TOTAL_FILES:-0} | Media: ${MEDIA_COUNT:-0} (attempt $ATTEMPTS/$MAX_ATTEMPTS)"
done

echo ""
if [ "$STATUS" == "COMMITTED" ] || [ "$STATUS" == "READY" ]; then
  echo "🎉 SUCCESS!"
  echo ""
  echo "✅ Scraping complete!"
  echo "✅ Posts created and published!"
  echo ""
  echo "📱 View your movies:"
  echo "   Browse Page: http://localhost:3001/browse"
  echo ""
  echo "📊 Check posts:"
  POSTS_RESPONSE=$(curl -s "$API_URL/posts")
  POST_COUNT=$(echo "$POSTS_RESPONSE" | grep -o '"id"' | wc -l | tr -d ' ')
  echo "   Total posts available: $POST_COUNT"
else
  echo "⚠️  Scraping did not complete successfully"
  echo "   Status: $STATUS"
fi
