# Simple Standalone Scraper

## No API Server Needed!

This scraper works completely independently - no API, no database, no complex setup.

## Quick Start

### 1. Install dependencies (one time):
```bash
cd /Users/vash/novafans
pnpm add axios cheerio
```

### 2. Run the scraper:
```bash
node standalone-scraper.js https://toflx.com/movies/one-battle-after-another-2025
```

## What It Does

1. ✅ Scrapes the website
2. ✅ Extracts all images and videos
3. ✅ Downloads them to `./scraped-media/`
4. ✅ Saves a `results.json` with all URLs
5. ✅ Works completely standalone

## Output

All files are saved to `./scraped-media/`:
- `image-1.jpg`, `image-2.jpg`, etc.
- `video-1.mp4`, `video-2.mp4`, etc.
- `results.json` - List of all scraped URLs

## Custom Cookie

If you need a different cookie, set it as an environment variable:

```bash
COOKIE="your-cookie-here" node standalone-scraper.js <URL>
```

## That's It!

No API server, no database, no complex setup. Just run it and get your files!
