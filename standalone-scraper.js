#!/usr/bin/env node

/**
 * Standalone Website Scraper
 * No API server needed - works independently
 * 
 * Usage: node standalone-scraper.js <URL> [output-dir]
 * 
 * Run from: cd /Users/vash/novafans/apps/api && node ../../standalone-scraper.js <URL>
 */

// Load dependencies - they're in the root node_modules
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const sourceUrl = process.argv[2];
const outputDir = process.argv[3] || './scraped-media';

if (!sourceUrl) {
  console.error('Usage: node standalone-scraper.js <URL> [output-dir]');
  console.error('');
  console.error('Example:');
  console.error('  node standalone-scraper.js https://toflx.com/movies/one-battle-after-another-2025');
  process.exit(1);
}

// Cookie for authenticated sites (update if needed)
const cookie = process.env.COOKIE || 'pip=ap4kt4641myj; si2=1759548421; _vjs_volume=1; show_watched_5be491fa88819d08df6093f8=true; default_list_type_5be491fa88819d08df6093f8=%22infinity%22; pagin_size_5be491fa88819d08df6093f8=%22auto%22; scbw_5be491fa88819d08df6093f9=69555c398e9d448a1eb05263; auid=5be491fa88819d08df6093f8-p; ds8=1; test_cookie=1769478298552; pxid=1769478300';

async function downloadFile(url, filepath) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
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
    console.error(`Failed to download ${url}:`, error.message);
    return null;
  }
}

async function scrapeWebsite() {
  console.log('🌐 Scraping:', sourceUrl);
  console.log('📁 Output directory:', outputDir);
  console.log('');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Fetch the page
    const response = await axios.get(sourceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': cookie,
        'Referer': new URL(sourceUrl).origin + '/',
        'Origin': new URL(sourceUrl).origin,
      },
      timeout: 30000,
    });

    const $ = cheerio.load(response.data);
    const baseUrl = new URL(sourceUrl).origin;
    const mediaItems = [];

    // Extract images
    $('img').each((_, element) => {
      const src = $(element).attr('src') || $(element).attr('data-src') || $(element).attr('data-lazy-src');
      if (src) {
        try {
          const absoluteUrl = new URL(src, baseUrl).href;
          if (/\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i.test(absoluteUrl) &&
              !absoluteUrl.includes('logo') && !absoluteUrl.includes('icon')) {
            mediaItems.push({ url: absoluteUrl, type: 'image' });
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });

    // Extract videos
    $('video').each((_, element) => {
      const src = $(element).attr('src') || $(element).attr('data-src');
      if (src) {
        try {
          const absoluteUrl = new URL(src, baseUrl).href;
          if (/\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(absoluteUrl)) {
            mediaItems.push({ url: absoluteUrl, type: 'video' });
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
      // Check source tags
      $(element).find('source').each((_, source) => {
        const src = $(source).attr('src');
        if (src) {
          try {
            const absoluteUrl = new URL(src, baseUrl).href;
            if (/\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(absoluteUrl)) {
              mediaItems.push({ url: absoluteUrl, type: 'video' });
            }
          } catch (e) {
            // Invalid URL, skip
          }
        }
      });
    });

    // Extract from script tags (JavaScript-loaded content)
    $('script').each((_, script) => {
      const content = $(script).html() || '';
      const videoMatches = content.match(/https?:\/\/[^\s"']+\.mp4[^\s"']*/gi);
      if (videoMatches) {
        videoMatches.forEach(url => {
          if (!url.includes('logo') && !url.includes('icon')) {
            mediaItems.push({ url: url, type: 'video' });
          }
        });
      }
    });

    // Remove duplicates
    const uniqueMedia = [];
    const seen = new Set();
    mediaItems.forEach(item => {
      const normalizedUrl = item.url.split('?')[0];
      if (!seen.has(normalizedUrl)) {
        seen.add(normalizedUrl);
        uniqueMedia.push(item);
      }
    });

    console.log(`✅ Found ${uniqueMedia.length} media items`);
    console.log('');

    // Download media
    const results = {
      images: [],
      videos: [],
      failed: [],
    };

    for (let i = 0; i < uniqueMedia.length; i++) {
      const item = uniqueMedia[i];
      const ext = path.extname(new URL(item.url).pathname) || (item.type === 'video' ? '.mp4' : '.jpg');
      const filename = `${item.type}-${i + 1}${ext}`;
      const filepath = path.join(outputDir, filename);

      console.log(`📥 Downloading ${i + 1}/${uniqueMedia.length}: ${filename}`);
      
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

    // Save results JSON
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
    console.log(`📄 Results JSON: ${resultsFile}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   URL:', error.response.config.url);
    }
    process.exit(1);
  }
}

scrapeWebsite();
