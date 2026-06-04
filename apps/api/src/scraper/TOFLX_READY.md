# toflx.com Scraper Configuration - READY!

## ✅ What's Configured

The scraper is now specifically configured for toflx.com:

1. **Video URL Extraction**
   - Extracts from `<video>` tags
   - Extracts from `<source>` tags  
   - Extracts from JavaScript code (finds .mp4 URLs in scripts)
   - Extracts from data attributes
   - Specifically looks for `*.sdu.sdx-sdx.com` CDN URLs

2. **Required Headers**
   - Referer: https://toflx.com/
   - Origin: https://toflx.com
   - Accept headers for video content

3. **Image Extraction**
   - Poster images
   - Thumbnails
   - Cover images

## 🚀 How to Use

### Step 1: Get Your Session Cookie

1. Login to toflx.com in your browser
2. Open Developer Tools (F12)
3. Go to Network tab
4. Visit a movie page: https://toflx.com/movies/one-battle-after-another-2025
5. Find any request to toflx.com
6. Copy the `Cookie` header value

### Step 2: Create Scrape Job

```bash
POST http://localhost:3001/creator/scraper/scrape
Authorization: Bearer YOUR_SAVAGE_HOUSE_TOKEN
Content-Type: application/json

{
  "sourceUrl": "https://toflx.com/movies/one-battle-after-another-2025",
  "config": {
    "apiHeaders": {
      "Cookie": "YOUR_SESSION_COOKIE_FROM_STEP_1"
    }
  }
}
```

### Step 3: Check Status

```bash
GET http://localhost:3001/creator/scraper/jobs/IMPORT_SESSION_ID
Authorization: Bearer YOUR_SAVAGE_HOUSE_TOKEN
```

### Step 4: Import Media

Once the scraper finishes, use the existing import endpoints to commit the media to posts.

## 📋 What the Scraper Will Find

- **Videos**: MP4 files from `*.sdu.sdx-sdx.com` CDN
- **Images**: Movie posters, thumbnails, covers
- **Formats**: 1080p, 720p, and other resolutions

## ⚙️ Advanced Configuration

If you need custom selectors:

```json
{
  "sourceUrl": "https://toflx.com/movies/one-battle-after-another-2025",
  "config": {
    "imageSelector": "img.poster, .movie-poster img",
    "videoSelector": "video source, [data-video]",
    "apiHeaders": {
      "Cookie": "YOUR_SESSION_COOKIE",
      "Referer": "https://toflx.com/"
    }
  }
}
```

## 🎯 Expected Results

The scraper will:
1. Extract video URLs from the page (including CDN URLs from JavaScript)
2. Extract poster/thumbnail images
3. Download media files
4. Create an import session
5. Make media ready for posting on Savage House

## 📝 Notes

- Video URLs are often loaded via JavaScript, so the scraper searches script tags
- CDN URLs require Referer header (automatically set)
- Session cookies may expire - refresh if scraping fails
- Large video files may take time to download
