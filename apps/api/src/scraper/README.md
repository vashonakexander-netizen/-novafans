# Media Scraper Bot

Scrapes media (images/videos) from external websites and imports them into Savage House.

## API Endpoints

### POST `/creator/scraper/scrape`

Create a new scrape job.

**Request Body:**
```json
{
  "sourceUrl": "https://example.com/gallery",
  "config": {
    "imageSelector": "img.gallery-image",
    "videoSelector": "video source",
    "minImageSize": 200,
    "useApi": false
  }
}
```

**Response:**
```json
{
  "jobId": "import-session-id",
  "importSessionId": "import-session-id",
  "status": "queued",
  "message": "Scrape job queued for processing"
}
```

### GET `/creator/scraper/jobs/:importSessionId`

Check the status of a scrape job.

**Response:**
```json
{
  "sessionId": "import-session-id",
  "status": "READY",
  "totalFiles": 15,
  "mediaCount": 15,
  "sourceUrl": "https://example.com/gallery",
  "createdAt": "2024-01-01T00:00:00Z",
  "media": [...]
}
```

## Configuration Options

### HTML Scraping

```json
{
  "imageSelector": "img.gallery-image",  // CSS selector for images
  "videoSelector": "video source",        // CSS selector for videos
  "minImageSize": 200                     // Minimum image width in pixels
}
```

### API Scraping

```json
{
  "useApi": true,
  "apiEndpoint": "https://api.example.com/media",
  "apiHeaders": {
    "Authorization": "Bearer token"
  },
  "apiParams": {
    "page": 1
  },
  "apiMediaPath": "data.media.url"  // JSON path to media URL
}
```

## Workflow

1. **Create Scrape Job**: POST to `/creator/scraper/scrape` with URL
2. **Worker Processes**: Background worker scrapes media (every 5 seconds)
3. **Check Status**: GET `/creator/scraper/jobs/:id` to see progress
4. **Import Media**: Use existing import endpoints to commit media to posts

## Example Usage

```bash
# 1. Create scrape job
curl -X POST http://localhost:3001/creator/scraper/scrape \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceUrl": "https://your-site.com/gallery",
    "config": {
      "imageSelector": "img[data-src]",
      "minImageSize": 300
    }
  }'

# 2. Check status
curl http://localhost:3001/creator/scraper/jobs/IMPORT_SESSION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Preview import session
curl http://localhost:3001/creator/import/sessions/IMPORT_SESSION_ID/preview \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Commit to posts
curl -X POST http://localhost:3001/creator/import/sessions/IMPORT_SESSION_ID/commit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupSize": 5,
    "visibility": "SUBSCRIBERS",
    "scheduleMode": "DRIP",
    "startAt": "2024-01-01T00:00:00Z",
    "intervalHours": 24
  }'
```

## Notes

- Scraper runs in background worker (checks every 5 seconds)
- Media is downloaded and stored temporarily
- Integrates with existing import system
- Supports both HTML scraping and API-based scraping
- Filters out logos, icons, and small images by default
