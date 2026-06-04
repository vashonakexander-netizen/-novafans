# How to Start the API Server

## The Problem

The 404 error happens because the **API server is not running**. 

The web app is trying to call `http://localhost:3001/scraper/scrape`, but port 3001 is serving the Next.js app, not the API.

## Solution

Start the API server in a **separate terminal**:

```bash
# Terminal 1: API Server
cd /Users/vash/novafans/apps/api
pnpm dev
```

The API should start on port 3001.

## Verify It's Working

Once the API is running, test it:

```bash
curl http://localhost:3001/health
```

Should return: `{"status":"ok",...}`

## Then Try the Scraper

1. Go to: http://localhost:3001/admin/scraper
2. Paste URL
3. Click "Start Scraping"

It should work now!

## Ports

- **Web App**: http://localhost:3000 (or 3001 if 3000 is taken)
- **API Server**: http://localhost:3001
- **AI Service**: http://localhost:3002 (optional)

Make sure the API server is running before using the scraper!
