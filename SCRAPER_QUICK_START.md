# Scraper Quick Start Guide

## ✅ Step 1: Start the API Server

Open a terminal and run:

```bash
cd /Users/vash/novafans/apps/api
pnpm run dev
```

Wait for it to say "Nest application successfully started" and "Scraper worker started"

## ✅ Step 2: Get Your toflx.com Session Cookie

1. Open your browser
2. Go to https://toflx.com and **login** to your account
3. Open Developer Tools (Press F12 or right-click → Inspect)
4. Go to the **Network** tab
5. Visit a movie page: https://toflx.com/movies/one-battle-after-another-2025
6. In the Network tab, find any request to `toflx.com`
7. Click on it, then look at **Request Headers**
8. Find the **Cookie** header
9. **Copy the entire cookie value** (it will be long, something like `session=abc123; auth=xyz789; ...`)

## ✅ Step 3: Get Your Savage House Auth Token

1. Make sure you're logged into Savage House as a **CREATOR**
2. Open browser DevTools → Application/Storage tab
3. Find `localStorage` → Look for `token`
4. **Copy the token value**

OR login via API:
```bash
POST http://localhost:3001/auth/login
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```
Copy the `accessToken` from the response.

## ✅ Step 4: Test the Scraper

Use curl, Postman, or any HTTP client:

```bash
curl -X POST http://localhost:3001/creator/scraper/scrape \
  -H "Authorization: Bearer YOUR_SAVAGE_HOUSE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceUrl": "https://toflx.com/movies/one-battle-after-another-2025",
    "config": {
      "apiHeaders": {
        "Cookie": "YOUR_TOFLX_SESSION_COOKIE"
      }
    }
  }'
```

Replace:
- `YOUR_SAVAGE_HOUSE_TOKEN` - from Step 3
- `YOUR_TOFLX_SESSION_COOKIE` - from Step 2

## ✅ Step 5: Check Scrape Status

The response will give you an `importSessionId`. Check status:

```bash
curl http://localhost:3001/creator/scraper/jobs/IMPORT_SESSION_ID \
  -H "Authorization: Bearer YOUR_SAVAGE_HOUSE_TOKEN"
```

## ✅ Step 6: Wait for Scraping to Complete

The scraper worker checks for jobs every 5 seconds. It will:
1. Scrape the page
2. Extract video URLs
3. Extract images
4. Download media
5. Create import session

Check status every 30 seconds until `status` is `READY`.

## ✅ Step 7: Import Media to Posts

Once status is `READY`, use the import endpoints to create posts:

```bash
# Preview what was scraped
GET http://localhost:3001/creator/import/sessions/IMPORT_SESSION_ID/preview

# Commit to posts
POST http://localhost:3001/creator/import/sessions/IMPORT_SESSION_ID/commit
{
  "groupSize": 1,
  "visibility": "SUBSCRIBERS",
  "scheduleMode": "NOW"
}
```

## 🎯 Quick Checklist

- [ ] API server running (`pnpm run dev` in apps/api)
- [ ] Logged into toflx.com
- [ ] Got toflx.com session cookie (from Network tab)
- [ ] Got Savage House auth token (as CREATOR)
- [ ] Created scrape job via API
- [ ] Checked job status
- [ ] Media scraped and ready
- [ ] Imported to posts

## 🆘 Troubleshooting

**API not starting?**
- Make sure you're in `/Users/vash/novafans/apps/api`
- Run `pnpm install` first
- Check for TypeScript errors

**Scraper not finding videos?**
- Make sure you're logged into toflx.com
- Check that the session cookie is valid
- Try a different movie page URL

**Authentication errors?**
- Make sure you're logged in as CREATOR (not FAN)
- Check that your token hasn't expired
- Re-login if needed
