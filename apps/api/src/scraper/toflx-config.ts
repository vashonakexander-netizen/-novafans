/**
 * Pre-configured settings for scraping toflx.com
 * 
 * Usage:
 * {
 *   "sourceUrl": "https://toflx.com/movies/one-battle-after-another-2025",
 *   "config": {
 *     ...toflxConfig,
 *     "apiHeaders": {
 *       "Cookie": "YOUR_SESSION_COOKIE"
 *     }
 *   }
 * }
 */

export const toflxConfig = {
  // Image selectors for movie pages
  imageSelector: "img.poster, img.thumbnail, .movie-poster img, .poster img, img[src*='poster'], img[src*='thumbnail'], img[src*='cover']",
  
  // Video selectors - toflx.com loads videos via JavaScript, so we need to catch them from:
  // 1. Video tags
  // 2. Source tags
  // 3. JavaScript code (the scraper will extract .mp4 URLs from scripts)
  // 4. Data attributes
  videoSelector: "video source[src], video[src], iframe[src*='player'], [data-video], [data-src-video], source[type='video/mp4']",
  
  // Minimum image size (filter out small icons)
  minImageSize: 200,
  
  // Headers that toflx.com CDN requires
  apiHeaders: {
    "Referer": "https://toflx.com/",
    "Origin": "https://toflx.com",
    "Accept": "*/*",
    "Accept-Language": "en-CA,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
    "Sec-Fetch-Dest": "video",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "cross-site",
  }
};

/**
 * Expected video URL patterns from toflx.com:
 * - https://*.sdu.sdx-sdx.com/.../[movie-name]-1080.mp4
 * - https://*.sdu.sdx-sdx.com/.../[movie-name]-720.mp4
 * - https://*.sdu.sdx-sdx.com/.../[movie-name].mp4
 */
export const toflxVideoUrlPattern = /https?:\/\/[^\/]+\.sdu\.sdx-sdx\.com\/[^"'\s]+\.mp4/gi;
