# How to Get Videos from toflx.com to Savage House

## Quick Steps

### Step 1: Get Your Savage House Token

1. Go to http://localhost:3001 (your web app)
2. **Login as CREATOR** (not FAN)
3. Press F12 (DevTools)
4. Go to **Application** tab → **localStorage**
5. Find and copy the **"token"** value

OR login via API:
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email","password":"your-password"}'
```
Copy the `accessToken` from response.

### Step 2: Scrape Videos from toflx.com

Use the scraper with your saved cookie:

```bash
curl -X POST http://localhost:3001/creator/scraper/scrape \
  -H "Authorization: Bearer YOUR_SAVAGE_HOUSE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceUrl": "https://toflx.com/movies/one-battle-after-another-2025",
    "config": {
      "apiHeaders": {
        "Cookie": "pip=ap4kt4641myj; si2=1759548421; _vjs_volume=1; show_watched_5be491fa88819d08df6093f8=true; default_list_type_5be491fa88819d08df6093f8=%22infinity%22; pagin_size_5be491fa88819d08df6093f8=%22auto%22; scbw_5be491fa88819d08df6093f9=69555c398e9d448a1eb05263; auid=5be491fa88819d08df6093f8-p; ds8=1; test_cookie=1769478298552; pxid=1769478300"
      }
    }
  }'
```

**Response will include:**
```json
{
  "jobId": "import-session-id",
  "importSessionId": "import-session-id",
  "status": "queued"
}
```

### Step 3: Check Scraping Status

Wait 10-30 seconds, then check:

```bash
curl http://localhost:3001/creator/scraper/jobs/IMPORT_SESSION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Look for `"status": "READY"` - that means videos are scraped!

### Step 4: Preview Scraped Media

```bash
curl http://localhost:3001/creator/import/sessions/IMPORT_SESSION_ID/preview \
  -H "Authorization: Bearer YOUR_TOKEN"
```

This shows all the videos/images that were scraped.

### Step 5: Import Videos to Posts

Create posts from the scraped media:

```bash
curl -X POST http://localhost:3001/creator/import/sessions/IMPORT_SESSION_ID/commit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupSize": 1,
    "visibility": "SUBSCRIBERS",
    "price": null,
    "scheduleMode": "NOW"
  }'
```

**Options:**
- `groupSize: 1` - One video per post
- `groupSize: 5` - Group 5 videos per post
- `visibility: "SUBSCRIBERS"` - Only subscribers can see
- `visibility: "PAID"` - Requires payment
- `price: 5.99` - Set price for paid posts
- `scheduleMode: "NOW"` - Publish immediately
- `scheduleMode: "DRIP"` - Schedule posts over time

### Step 6: View Your Posts

Go to your creator dashboard:
http://localhost:3001/dashboard/creator

Your videos should now be available as posts!

## Using the Automated Script

I've created `run-scraper-now.sh` - just provide your token:

```bash
cd /Users/vash/novafans
./run-scraper-now.sh YOUR_SAVAGE_HOUSE_TOKEN
```

The script will:
- Create scrape job
- Monitor progress
- Show results when done

## Multiple Movies

To scrape multiple movies, just run the scraper for each movie URL:

```bash
# Movie 1
curl -X POST http://localhost:3001/creator/scraper/scrape \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sourceUrl": "https://toflx.com/movies/movie-1", ...}'

# Movie 2
curl -X POST http://localhost:3001/creator/scraper/scrape \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sourceUrl": "https://toflx.com/movies/movie-2", ...}'
```

Each will create a separate import session.
