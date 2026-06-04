# Using Browse.ai or Puppeteer for JavaScript-Loaded Content

## The Problem

The movie content is loaded via JavaScript after the page loads, so simple HTML scraping doesn't work. You need browser automation.

## Option 1: Use Browse.ai (Paid Service)

Browse.ai is a service that automates browsers and extracts data:

1. **Sign up**: https://browse.ai
2. **Create a robot** at the URL you provided
3. **Configure it** to:
   - Wait for video player to load
   - Extract video URLs
   - Extract images
4. **Run it** and get the data via API or dashboard

**Browse.ai API Integration:**
```javascript
// After setting up your robot, use their API
const response = await fetch('https://api.browse.ai/v2/robots/YOUR_ROBOT_ID/run', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
  },
  body: JSON.stringify({
    inputParameters: {
      url: 'https://toflx.com/movies/sinners-2025',
    },
  }),
});
```

## Option 2: Use Puppeteer (Free, Self-Hosted)

I've created a Puppeteer-based scraper that does the same thing as Browse.ai:

### Install:
```bash
cd apps/api
pnpm add puppeteer
```

### Run:
```bash
node puppeteer-scraper.js https://toflx.com/movies/sinners-2025
```

### What it does:
- ✅ Opens a real browser (headless Chrome)
- ✅ Executes JavaScript
- ✅ Waits for content to load
- ✅ Captures network requests (videos loaded via fetch/XHR)
- ✅ Extracts all media from all pages (preview + main)
- ✅ Downloads everything

## Comparison

| Feature | Browse.ai | Puppeteer Scraper |
|---------|-----------|-------------------|
| Cost | Paid | Free |
| Setup | Easy (web UI) | Code-based |
| JavaScript | ✅ Yes | ✅ Yes |
| Network Capture | ✅ Yes | ✅ Yes |
| Self-hosted | ❌ No | ✅ Yes |
| API | ✅ Yes | Custom |

## Recommendation

**Use Puppeteer scraper** - it's free and does everything Browse.ai does!

Just run:
```bash
cd apps/api
pnpm add puppeteer
node puppeteer-scraper.js <URL>
```

It will handle JavaScript-loaded content and find the actual movie files!
