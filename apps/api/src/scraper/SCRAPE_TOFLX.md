# Scraping toflx.com

## Site Analysis

URL: https://toflx.com

### Current Status
- Site appears to require authentication
- Login page and contact page visible
- Need to identify media gallery/profile pages

## Configuration Options

### Option 1: HTML Scraping (If Media Pages Exist)

If there's a gallery/profile page with media:

```json
{
  "sourceUrl": "https://toflx.com/gallery",
  "config": {
    "imageSelector": "img.gallery-image, img[data-src]",
    "videoSelector": "video source, video[src]",
    "minImageSize": 200
  }
}
```

### Option 2: API Scraping (If API Available)

If the site has an API endpoint:

```json
{
  "sourceUrl": "https://toflx.com/api/media",
  "config": {
    "useApi": true,
    "apiEndpoint": "https://toflx.com/api/media",
    "apiHeaders": {
      "Authorization": "Bearer YOUR_TOKEN"
    },
    "apiMediaPath": "data.media.url"
  }
}
```

### Option 3: Authenticated Scraping

If you need to login first:

1. Login to the site manually
2. Get session cookies/token
3. Use in `apiHeaders`:
```json
{
  "apiHeaders": {
    "Cookie": "session=YOUR_SESSION",
    "Authorization": "Bearer YOUR_TOKEN"
  }
}
```

## Testing

To test the scraper with toflx.com:

```bash
curl -X POST http://localhost:3001/creator/scraper/scrape \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceUrl": "https://toflx.com/YOUR_MEDIA_PAGE",
    "config": {
      "imageSelector": "img",
      "videoSelector": "video"
    }
  }'
```

## Next Steps

1. **Identify media pages**: Find URLs with actual media content
2. **Get authentication**: If site requires login
3. **Configure selectors**: Based on actual HTML structure
4. **Test scraping**: Run scraper with correct configuration
