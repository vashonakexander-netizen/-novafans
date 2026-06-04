# Extracting Video URLs from toflx.com

## Direct Video URL Format

When you visit a movie page on toflx.com, the actual video file is served from a CDN:

```
https://sredirk3ddjdcvlk-ap4kt4641myj.sdu.sdx-sdx.com/
[path]/[filename].mp4
```

Example:
```
https://sredirk3ddjdcvlk-ap4kt4641myj.sdu.sdx-sdx.com/
2u2cd22517/.../one-battle-after-another-2025-1080.mp4
```

## Required Headers

The CDN requires specific headers:

```
Referer: https://toflx.com/
Origin: https://toflx.com
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...
```

## Using the Scraper

### Option 1: Scrape the Movie Page

The scraper will automatically extract video URLs from the HTML:

```json
POST /creator/scraper/scrape
{
  "sourceUrl": "https://toflx.com/movies/one-battle-after-another-2025",
  "config": {
    "apiHeaders": {
      "Cookie": "YOUR_SESSION_COOKIE",
      "Referer": "https://toflx.com/"
    },
    "videoSelector": "video source, video[src], [data-video]"
  }
}
```

### Option 2: Direct Video URL

If you already have the video URL from network requests:

You can add it directly to an import session:

```json
POST /creator/import/sessions/:id/files
{
  "files": [
    {
      "tempFileUrl": "https://sredirk3ddjdcvlk-ap4kt4641myj.sdu.sdx-sdx.com/.../one-battle-after-another-2025-1080.mp4",
      "mediaType": "VIDEO",
      "originalFilename": "one-battle-after-another-2025-1080.mp4"
    }
  ]
}
```

## Finding Video URLs Manually

1. Open the movie page on toflx.com
2. Open Developer Tools (F12)
3. Go to Network tab
4. Filter by "Media" or "XHR"
5. Play the video
6. Look for `.mp4` requests
7. Copy the video URL

## Example Video URL Structure

The video URLs typically contain:
- CDN domain: `*.sdu.sdx-sdx.com`
- Encrypted/obfuscated path
- Filename with resolution: `[movie-name]-1080.mp4`
- Query parameters for authentication/tracking

## Notes

- Video URLs may be in `<video>` tags, `<source>` tags, or loaded via JavaScript
- The scraper now extracts video URLs from JavaScript code and data attributes
- Video files are large - ensure sufficient storage and bandwidth
- Video URLs may expire or require authentication headers
