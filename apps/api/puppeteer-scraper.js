#!/usr/bin/env node

/**
 * Puppeteer-based Scraper (Like Browse.ai)
 * Handles JavaScript-loaded content and dynamic pages
 * 
 * Usage: node puppeteer-scraper.js <URL> [output-dir]
 */

const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const sourceUrl = process.argv[2];
const outputDir = process.argv[3] || './scraped-media';

if (!sourceUrl) {
  console.error('Usage: node puppeteer-scraper.js <URL> [output-dir]');
  process.exit(1);
}

// Cookie for authenticated sites
const cookie = process.env.COOKIE || 'pip=ap4kt4641myj; si2=1759548421; _vjs_volume=1; show_watched_5be491fa88819d08df6093f8=true; default_list_type_5be491fa88819d08df6093f8=%22infinity%22; pagin_size_5be491fa88819d08df6093f8=%22auto%22; scbw_5be491fa88819d08df6093f9=69555c398e9d448a1eb05263; auid=5be491fa88819d08df6093f8-p; ds8=1; test_cookie=1769478298552; pxid=1769478300';

// Parse cookies into array format for Puppeteer
function parseCookies(cookieString, domain) {
  return cookieString.split(';').map(c => {
    const [name, value] = c.trim().split('=');
    return {
      name: name.trim(),
      value: (value || '').trim(),
      domain: domain.replace(/^https?:\/\//, '').split('/')[0],
      path: '/',
    };
  }).filter(c => c.name && c.value);
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

function getBaseUrl(url) {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  } catch (e) {
    return url.split('?')[0];
  }
}

function getPageVariations(baseUrl) {
  return [
    baseUrl,
    `${baseUrl}?pl=0`,
    `${baseUrl}?pl=1`,
  ];
}

async function scrapeWithPuppeteer() {
  console.log('🤖 Starting Puppeteer scraper (like Browse.ai)...');
  console.log('🌐 URL:', sourceUrl);
  console.log('📁 Output:', outputDir);
  console.log('');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const baseUrl = new URL(sourceUrl).origin;
  const baseMovieUrl = getBaseUrl(sourceUrl);
  const pageUrls = getPageVariations(baseMovieUrl);
  const mediaItems = [];
  const allUrls = new Set();

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (let i = 0; i < pageUrls.length; i++) {
      const url = pageUrls[i];
      const pageType = i === 0 ? 'Original' : (i === 1 ? 'Preview (pl=0)' : 'Main (pl=1)');
      console.log(`📥 [${i + 1}/${pageUrls.length}] ${pageType}: ${url}`);

      const page = await browser.newPage();
      
      // Set cookies
      const cookies = parseCookies(cookie, baseUrl);
      await page.setCookie(...cookies);

      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });

      // Set up network request interception BEFORE navigation
      const networkMedia = [];
      page.on('response', response => {
        const responseUrl = response.url();
        if (/\.(mp4|m3u8|webm|mov|avi|mkv)(\?|$)/i.test(responseUrl) &&
            !responseUrl.includes('logo') && !responseUrl.includes('icon') && !responseUrl.includes('400_57s')) {
          const normalizedUrl = responseUrl.split('?')[0];
          if (!allUrls.has(normalizedUrl)) {
            allUrls.add(normalizedUrl);
            networkMedia.push({ url: responseUrl, type: 'video' });
            console.log(`   🌐 Network request: video - ${responseUrl.substring(0, 80)}...`);
          }
        }
      });

      // Navigate and wait for content to load
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 60000,
      });

      // Check if we're on a login page
      const pageTitle = await page.title();
      const pageContent = await page.content();
      
      if (pageTitle.toLowerCase().includes('login') || pageContent.includes('Email') && pageContent.includes('Password')) {
        console.log(`   ⚠️  Login page detected - cookie may be expired`);
        // Take screenshot for debugging
        await page.screenshot({ path: path.join(outputDir, `login-page-${i}.png`) });
      }

      // Wait for video player or content to appear
      try {
        await page.waitForSelector('video, iframe, [data-video], .player, .video-player', { timeout: 10000 });
        console.log(`   ✅ Video player found!`);
      } catch (e) {
        console.log(`   ⚠️  No video player found on page`);
      }

      // Wait for JavaScript to load content
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      // Try clicking play button if it exists
      try {
        const playButton = await page.$('button[aria-label*="play"], .play-button, [data-action="play"]');
        if (playButton) {
          await playButton.click();
          console.log(`   ▶️  Clicked play button`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (e) {
        // No play button
      }

      // Extract media from page
      const pageMedia = await page.evaluate((baseUrl) => {
        const media = [];

        // Get all images
        document.querySelectorAll('img').forEach(img => {
          const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
          if (src && /\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i.test(src) &&
              !src.includes('logo') && !src.includes('icon') && !src.includes('pin-instructions')) {
            try {
              const url = new URL(src, baseUrl).href;
              media.push({ url, type: 'image' });
            } catch (e) {}
          }
        });

        // Get all videos
        document.querySelectorAll('video').forEach(video => {
          const src = video.src || video.getAttribute('data-src');
          if (src) {
            try {
              const url = new URL(src, baseUrl).href;
              if (/\.(mp4|webm|ogg|mov|avi|mkv|m3u8)(\?|$)/i.test(url)) {
                media.push({ url, type: 'video' });
              }
            } catch (e) {}
          }
          // Check source tags
          video.querySelectorAll('source').forEach(source => {
            const src = source.src;
            if (src) {
              try {
                const url = new URL(src, baseUrl).href;
                if (/\.(mp4|webm|ogg|mov|avi|mkv|m3u8)(\?|$)/i.test(url)) {
                  media.push({ url, type: 'video' });
                }
              } catch (e) {}
            }
          });
        });

        // Get iframes
        document.querySelectorAll('iframe').forEach(iframe => {
          const src = iframe.src;
          if (src && (src.includes('video') || src.includes('player'))) {
            media.push({ url: src, type: 'video' });
          }
        });

        // Get data attributes
        document.querySelectorAll('[data-video], [data-src], [data-url]').forEach(el => {
          const videoUrl = el.getAttribute('data-video') || 
                          el.getAttribute('data-src') || 
                          el.getAttribute('data-url');
          if (videoUrl && /\.(mp4|m3u8|webm)/i.test(videoUrl)) {
            try {
              const url = new URL(videoUrl, baseUrl).href;
              media.push({ url, type: 'video' });
            } catch (e) {}
          }
        });

        // Get network requests (video files loaded via JavaScript)
        // This captures videos loaded dynamically
        const scripts = Array.from(document.querySelectorAll('script'));
        scripts.forEach(script => {
          const content = script.textContent || script.innerHTML || '';
          const patterns = [
            /https?:\/\/[^\s"']+\.mp4[^\s"']*/gi,
            /https?:\/\/[^\s"']+\.m3u8[^\s"']*/gi,
            /https?:\/\/[^\s"']+\.webm[^\s"']*/gi,
          ];
          patterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
              matches.forEach(match => {
                if (!match.includes('logo') && !match.includes('icon') && !match.includes('400_57s')) {
                  try {
                    const url = new URL(match, baseUrl).href;
                    media.push({ url, type: 'video' });
                  } catch (e) {}
                }
              });
            }
          });
        });

        return media;
      }, baseUrl);

      // Add unique media
      pageMedia.forEach(item => {
        const normalizedUrl = item.url.split('?')[0];
        if (!allUrls.has(normalizedUrl)) {
          allUrls.add(normalizedUrl);
          mediaItems.push(item);
          console.log(`   ✅ Found: ${item.type} - ${item.url.substring(0, 80)}...`);
        }
      });

      // Add network-captured media
      networkMedia.forEach(item => {
        mediaItems.push(item);
      });

      await page.close();
    }

    console.log('');
    console.log(`✅ Found ${mediaItems.length} unique media items`);
    console.log('');

    if (mediaItems.length === 0) {
      console.log('⚠️  No media found.');
      await browser.close();
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

    await browser.close();

  } catch (error) {
    console.error('❌ Error:', error.message);
    await browser.close();
    process.exit(1);
  }
}

scrapeWithPuppeteer();
