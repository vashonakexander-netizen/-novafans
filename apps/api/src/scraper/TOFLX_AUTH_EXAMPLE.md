# Scraping toflx.com with Authentication

## Movie Page URL
https://toflx.com/movies/one-battle-after-another-2025

## Authentication Required

The site appears to require authentication. Here's how to configure the scraper:

### Option 1: Use Session Cookies

If you're logged into toflx.com, get your session cookies and use them:

```json
{
  "sourceUrl": "https://toflx.com/movies/one-battle-after-another-2025",
  "config": {
    "apiHeaders": {
      "Cookie": "session=YOUR_SESSION_COOKIE; auth_token=YOUR_AUTH_TOKEN"
    }
  }
}
```

### Option 2: Use Authorization Token

If the site uses bearer tokens:

```json
{
  "sourceUrl": "https://toflx.com/movies/one-battle-after-another-2025",
  "config": {
    "apiHeaders": {
      "Authorization": "Bearer YOUR_TOKEN"
    }
  }
}
```

### Option 3: Use API Endpoint (If Available)

If toflx.com has an API for movies:

```json
{
  "sourceUrl": "https://toflx.com/movies/one-battle-after-another-2025",
  "config": {
    "useApi": true,
    "apiEndpoint": "https://toflx.com/api/movies/one-battle-after-another-2025",
    "apiHeaders": {
      "Authorization": "Bearer YOUR_TOKEN"
    },
    "apiMediaPath": "data.video.url" // or "data.media.url" depending on API structure
  }
}
```

## How to Get Authentication

### Browser Method:
1. Open https://toflx.com in your browser
2. Login to your account
3. Open Developer Tools (F12)
4. Go to Network tab
5. Refresh the page
6. Find any request to toflx.com
7. Check Request Headers → Cookie or Authorization
8. Copy the cookie/token value

### Chrome Extension Method:
1. Install a cookie export extension
2. Export cookies for toflx.com
3. Use the session cookie in the scraper config

## Example Request

```bash
curl -X POST http://localhost:3001/creator/scraper/scrape \
  -H "Authorization: Bearer YOUR_SAVAGE_HOUSE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceUrl": "https://toflx.com/movies/one-battle-after-another-2025",
    "config": {
      "apiHeaders": {
        "Cookie": "session=YOUR_TOFLX_SESSION",
        "Referer": "https://toflx.com/"
      },
      "imageSelector": "img.poster, img.thumbnail, .movie-poster img",
      "videoSelector": "video source, video[src], iframe[src*='video']"
    }
  }'
```

## Common Selectors for Movie Pages

### Images:
- `img.poster`
- `img.thumbnail`
- `.movie-poster img`
- `.poster img`
- `img[src*='poster']`
- `img[src*='thumbnail']`

### Videos:
- `video source[src]`
- `video[src]`
- `iframe[src*='player']`
- `.player video`
- `.video-player video`
- `source[type='video/mp4']`

## Notes

- The scraper will automatically try common selectors if not specified
- Authentication cookies may expire - refresh if scraping fails
- Some sites load content via JavaScript (may need Puppeteer/Playwright for full support)
- Video URLs might be in embedded players (iframes) rather than direct links
