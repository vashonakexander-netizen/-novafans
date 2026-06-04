#!/usr/bin/env node

/**
 * Standalone Website Scraper - Handles Preview + Main Movie Pages
 * No API server needed - works independently
 * 
 * Usage: node standalone-scraper.js <URL> [output-dir]
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const sourceUrl = process.argv[2];
const outputDir = process.argv[3] || './scraped-media';

if (!sourceUrl) {
  console.error('Usage: node standalone-scraper.js <URL> [output-dir]');
  process.exit(1);
}

// Cookie for authenticated sites
const cookie = process.env.COOKIE || 'pip=ap4kt4641myj; si2=1759548421; _vjs_volume=1; show_watched_5be491fa88819d08df6093f8=true; default_list_type_5be491fa88819d08df6093f8=%22infinity%22; pagin_size_5be491fa88819d08df6093f8=%22auto%22; scbw_5be491fa88819d08df6093f9=69555c398e9d448a1eb05263; auid=5be491fa88819d08df6093f8-p; ds8=1; test_cookie=1769478298552; pxid=1769478300';

// Get base URL without query params
function getBaseUrl(url) {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  } catch (e) {
    return url.split('?')[0];
  }
}

// Get page variations (preview and main)
function getPageVariations(baseUrl) {
  const variations = [
    baseUrl, // Original
    `${baseUrl}?pl=0`, // Preview page
    `${baseUrl}?pl=1`, // Main movie page
  ];
  return [...new Set(variations)];
}

async function scrapePage(url) {
  const https = require('https');
  const agent = new https.Agent({ rejectUnauthorized: false });
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': cookie,
        'Referer': new URL(url).origin + '/',
        'Origin': new URL(url).origin,
      },
      httpsAgent: agent,
      timeout: 30000,
    });
    return cheerio.load(response.data);
  } catch (error) {
    console.log(`   ⚠️  Failed: ${error.message}`);
    return null;
  }
}

function extractMedia($, baseUrl) {
  const mediaItems = [];

  // Extract images
  $('img').each((_, element) => {
    const src = $(element).attr('src') || $(element).attr('data-src') || $(element).attr('data-lazy-src');
    if (src) {
      try {
        const absoluteUrl = new URL(src, baseUrl).href;
        if (/\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i.test(absoluteUrl) &&
            !absoluteUrl.includes('logo') && !absoluteUrl.includes('icon') && !absoluteUrl.includes('pin-instructions')) {
          mediaItems.push({ url: absoluteUrl, type: 'image' });
        }
      } catch (e) {}
    }
  });

  // Extract videos
  $('video').each((_, element) => {
    const src = $(element).attr('src') || $(element).attr('data-src');
    if (src) {
      try {
        const absoluteUrl = new URL(src, baseUrl).href;
        if (/\.(mp4|webm|ogg|mov|avi|mkv|m3u8)(\?|$)/i.test(absoluteUrl)) {
          mediaItems.push({ url: absoluteUrl, type: 'video' });
        }
      } catch (e) {}
    }
    $(element).find('source').each((_, source) => {
      const src = $(source).attr('src');
      if (src) {
        try {
          const absoluteUrl = new URL(src, baseUrl).href;
          if (/\.(mp4|webm|ogg|mov|avi|mkv|m3u8)(\?|$)/i.test(absoluteUrl)) {
            mediaItems.push({ url: absoluteUrl, type: 'video' });
          }
        } catch (e) {}
      }
    });
  });

  // Extract from script tags (JavaScript-loaded content)
  $('script').each((_, script) => {
    const content = $(script).html() || '';
    
    // Look for video URLs in various formats
    const patterns = [
      /https?:\/\/[^\s"']+\.mp4[^\s"']*/gi,
      /https?:\/\/[^\s"']+\.m3u8[^\s"']*/gi,
      /https?:\/\/[^\s"']+\.webm[^\s"']*/gi,
      /"url"\s*:\s*"([^"]+\.(mp4|m3u8|webm))"/gi,
      /'url'\s*:\s*'([^']+\.(mp4|m3u8|webm))'/gi,
      /src\s*[:=]\s*["']([^"']+\.(mp4|m3u8|webm))["']/gi,
      /file\s*[:=]\s*["']([^"']+\.(mp4|m3u8|webm))["']/gi,
    ];
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          let url = match;
          const urlMatch = match.match(/["']([^"']+\.(mp4|m3u8|webm))["']/);
          if (urlMatch) url = urlMatch[1];
          
          if (url && !url.startsWith('http')) {
            url = new URL(url, baseUrl).href;
          }
          
          if (url && !url.includes('logo') && !url.includes('icon') && !url.includes('400_57s')) {
            try {
              const absoluteUrl = new URL(url, baseUrl).href;
              mediaItems.push({ url: absoluteUrl, type: 'video' });
            } catch (e) {}
          }
        });
      }
    });
  });

  // Check data attributes
  $('[data-video], [data-src], [data-url], iframe').each((_, element) => {
    const videoUrl = $(element).attr('data-video') || 
                    $(element).attr('data-src') || 
                    $(element).attr('data-url') ||
                    $(element).attr('src');
    if (videoUrl && /\.(mp4|m3u8|webm)/i.test(videoUrl)) {
      try {
        const absoluteUrl = new URL(videoUrl, baseUrl).href;
        if (!absoluteUrl.includes('logo') && !absoluteUrl.includes('icon')) {
          mediaItems.push({ url: absoluteUrl, type: 'video' });
        }
      } catch (e) {}
    }
  });

  return mediaItems;
}

async function downloadFile(url, filepath) {
  try {
    const https = require('https');
    const agent = new https.Agent({ rejectUnauthorized: false });
    
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      httpsAgent: agent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': cookie,
        'Referer': new URL(sourceUrl).origin + '/',
        'Origin': new URL(sourceUrl).origin,
      },
    });

    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    return null;
  }
}

async function scrapeWebsite() {
  console.log('🌐 Scraping:', sourceUrl);
  console.log('📁 Output directory:', outputDir);
  console.log('');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const baseUrl = new URL(sourceUrl).origin;
  const baseMovieUrl = getBaseUrl(sourceUrl);
  const mediaItems = [];
  const allUrls = new Set();

  // Get page variations (preview + main)
  const pageUrls = getPageVariations(baseMovieUrl);
  console.log(`📄 Scraping ${pageUrls.length} pages (preview + main)...`);
  console.log('');

  try {
    // Scrape all page variations
    for (let i = 0; i < pageUrls.length; i++) {
      const url = pageUrls[i];
      const pageType = i === 0 ? 'Original' : (i === 1 ? 'Preview (pl=0)' : 'Main (pl=1)');
      console.log(`📥 [${i + 1}/${pageUrls.length}] ${pageType}: ${url}`);
      
      const $ = await scrapePage(url);
      if (!$) continue;

      const pageMedia = extractMedia($, baseUrl);
      
      pageMedia.forEach(item => {
        const normalizedUrl = item.url.split('?')[0];
        if (!allUrls.has(normalizedUrl)) {
          allUrls.add(normalizedUrl);
          mediaItems.push(item);
          console.log(`   ✅ Found: ${item.type} - ${item.url.substring(0, 80)}...`);
        }
      });
    }

    console.log('');
    console.log(`✅ Found ${mediaItems.length} unique media items`);
    console.log('');

    if (mediaItems.length === 0) {
      console.log('⚠️  No media found. The page might require login or use dynamic loading.');
      return;
    }

    // Download media
    const results = { images: [], videos: [], failed: [] };

    for (let i = 0; i < mediaItems.length; i++) {
      const item = mediaItems[i];
      const ext = path.extname(new URL(item.url).pathname) || (item.type === 'video' ? '.mp4' : '.jpg');
      const filename = `${item.type}-${i + 1}${ext}`;
      const filepath = path.join(outputDir, filename);

      console.log(`📥 Downloading ${i + 1}/${mediaItems.length}: ${filename}`);
      
      const downloaded = await downloadFile(item.url, filepath);
      
      if (downloaded !== null) {
        if (item.type === 'image') {
          results.images.push({ url: item.url, file: filename });
        } else {
          results.videos.push({ url: item.url, file: filename });
        }
        console.log(`   ✅ Saved: ${filename}`);
      } else {
        results.failed.push({ url: item.url, file: filename });
        console.log(`   ❌ Failed: ${filename}`);
      }
    }

    // Save results
    const resultsFile = path.join(outputDir, 'results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

    console.log('');
    console.log('🎉 Scraping complete!');
    console.log('');
    console.log(`📊 Results:`);
    console.log(`   Images: ${results.images.length}`);
    console.log(`   Videos: ${results.videos.length}`);
    console.log(`   Failed: ${results.failed.length}`);
    console.log('');
    console.log(`📁 Files saved to: ${path.resolve(outputDir)}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

scrapeWebsite();
