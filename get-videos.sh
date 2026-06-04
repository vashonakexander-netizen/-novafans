#!/bin/bash

# Automated script to scrape videos from toflx.com and import them to Savage House
# Usage: ./get-videos.sh <YOUR_SAVAGE_HOUSE_TOKEN> [MOVIE_URL]

TOKEN=$1
MOVIE_URL=${2:-"https://toflx.com/movies/one-battle-after-another-2025"}
TOFLX_COOKIE="pip=ap4kt4641myj; si2=1759548421; _vjs_volume=1; show_watched_5be491fa88819d08df6093f8=true; default_list_type_5be491fa88819d08df6093f8=%22infinity%22; pagin_size_5be491fa88819d08df6093f8=%22auto%22; scbw_5be491fa88819d08df6093f9=69555c398e9d448a1eb05263; auid=5be491fa88819d08df6093f8-p; ds8=1; test_cookie=1769478298552; pxid=1769478300"
API_BASE="http://localhost:3001"

if [ -z "$TOKEN" ]; then
  echo "❌ Usage: $0 <YOUR_SAVAGE_HOUSE_TOKEN> [MOVIE_URL]"
  echo ""
  echo "To get your token:"
  echo "1. Go to http://localhost:3001"
  echo "2. Login as CREATOR"
  echo "3. F12 → Application → localStorage → copy 'token'"
  exit 1
fi

echo "🎬 Starting video import process..."
echo "📹 Movie URL: $MOVIE_URL"
echo ""

# Step 1: Create scrape job
echo "📥 Step 1: Creating scrape job..."
SCRAPE_RESPONSE=$(curl -s -X POST "$API_BASE/creator/scraper/scrape" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"sourceUrl\": \"$MOVIE_URL\",
    \"config\": {
      \"apiHeaders\": {
        \"Cookie\": \"$TOFLX_COOKIE\"
      }
    }
  }")

IMPORT_SESSION_ID=$(echo "$SCRAPE_RESPONSE" | grep -o '"importSessionId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$IMPORT_SESSION_ID" ]; then
  echo "❌ Failed to create scrape job!"
  echo "Response: $SCRAPE_RESPONSE"
  exit 1
fi

echo "✅ Scrape job created! Import Session ID: $IMPORT_SESSION_ID"
echo "⏳ Waiting for scraping to complete (this may take 30-60 seconds)..."
echo ""

# Step 2: Monitor scraping progress
STATUS="PENDING"
ATTEMPTS=0
MAX_ATTEMPTS=30

while [ "$STATUS" != "READY" ] && [ "$STATUS" != "COMMITTED" ] && [ "$STATUS" != "CANCELED" ] && [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
  sleep 5
  ATTEMPTS=$((ATTEMPTS + 1))
  
  STATUS_RESPONSE=$(curl -s "$API_BASE/creator/scraper/jobs/$IMPORT_SESSION_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
  TOTAL_FILES=$(echo "$STATUS_RESPONSE" | grep -o '"totalFiles":[^,}]*' | cut -d':' -f2 | tr -d ' ')
  
  echo "   Status: $STATUS | Files found: ${TOTAL_FILES:-0} (attempt $ATTEMPTS/$MAX_ATTEMPTS)"
done

if [ "$STATUS" != "READY" ]; then
  echo "❌ Scraping failed or timed out. Status: $STATUS"
  echo "Check the API logs for details."
  exit 1
fi

echo ""
echo "✅ Scraping complete! Found $TOTAL_FILES media files"
echo ""

# Step 3: Preview scraped media
echo "📋 Step 2: Previewing scraped media..."
PREVIEW_RESPONSE=$(curl -s "$API_BASE/creator/import/sessions/$IMPORT_SESSION_ID/preview" \
  -H "Authorization: Bearer $TOKEN")

MEDIA_COUNT=$(echo "$PREVIEW_RESPONSE" | grep -o '"media":\[[^]]*\]' | grep -o '{"id"' | wc -l | tr -d ' ')

echo "✅ Found $MEDIA_COUNT media items ready to import"
echo ""

# Step 4: Ask user for import options
echo "📤 Step 3: Import to posts"
echo ""
echo "How would you like to import these videos?"
echo ""
echo "1) One video per post (recommended)"
echo "2) Group 5 videos per post"
echo "3) Group 10 videos per post"
echo "4) All videos in one post"
echo ""
read -p "Choose option (1-4) [default: 1]: " GROUP_CHOICE
GROUP_CHOICE=${GROUP_CHOICE:-1}

case $GROUP_CHOICE in
  1) GROUP_SIZE=1 ;;
  2) GROUP_SIZE=5 ;;
  3) GROUP_SIZE=10 ;;
  4) GROUP_SIZE=999 ;;
  *) GROUP_SIZE=1 ;;
esac

echo ""
echo "Who should see these posts?"
echo ""
echo "1) Subscribers only (recommended)"
echo "2) Paid posts (requires payment)"
echo "3) Public (everyone)"
echo ""
read -p "Choose option (1-3) [default: 1]: " VISIBILITY_CHOICE
VISIBILITY_CHOICE=${VISIBILITY_CHOICE:-1}

case $VISIBILITY_CHOICE in
  1) VISIBILITY="SUBSCRIBERS" ;;
  2) 
    VISIBILITY="PAID"
    read -p "Enter price per post (e.g., 5.99): " PRICE
    PRICE=${PRICE:-5.99}
    ;;
  3) VISIBILITY="PUBLIC" ;;
  *) VISIBILITY="SUBSCRIBERS" ;;
esac

echo ""
echo "When should posts be published?"
echo ""
echo "1) Now (immediately)"
echo "2) Drip schedule (spread over time)"
echo ""
read -p "Choose option (1-2) [default: 1]: " SCHEDULE_CHOICE
SCHEDULE_CHOICE=${SCHEDULE_CHOICE:-1}

case $SCHEDULE_CHOICE in
  1) SCHEDULE_MODE="NOW" ;;
  2) SCHEDULE_MODE="DRIP" ;;
  *) SCHEDULE_MODE="NOW" ;;
esac

# Build commit request
COMMIT_DATA="{
  \"groupSize\": $GROUP_SIZE,
  \"visibility\": \"$VISIBILITY\",
  \"scheduleMode\": \"$SCHEDULE_MODE\""

if [ "$VISIBILITY" = "PAID" ] && [ -n "$PRICE" ]; then
  COMMIT_DATA="$COMMIT_DATA,
  \"price\": $PRICE"
fi

COMMIT_DATA="$COMMIT_DATA
}"

echo ""
echo "🚀 Importing videos to posts..."
COMMIT_RESPONSE=$(curl -s -X POST "$API_BASE/creator/import/sessions/$IMPORT_SESSION_ID/commit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$COMMIT_DATA")

POST_COUNT=$(echo "$COMMIT_RESPONSE" | grep -o '"postsCreated":[^,}]*' | cut -d':' -f2 | tr -d ' ')

if [ -n "$POST_COUNT" ] && [ "$POST_COUNT" != "null" ]; then
  echo ""
  echo "🎉 SUCCESS!"
  echo "✅ Created $POST_COUNT posts from your videos"
  echo ""
  echo "📱 View your posts at: http://localhost:3001/dashboard/creator"
  echo ""
else
  echo ""
  echo "⚠️  Import response: $COMMIT_RESPONSE"
  echo "Check the API logs for details."
fi
