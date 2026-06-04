#!/usr/bin/env node

/**
 * Super Simple Interactive Scraper
 * Opens browser, you login, it captures everything automatically
 */

const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

const movieUrl = process.argv[2] || 'https://toflx.com/movies/sinners-2025';
const outputDir = './scraped-media';

console.log('🎬 Simple Movie Scraper');
console.log('═══════════════════════════════════════════════');
console.log('');
console.log('This will:');
console.log('1. Open a browser window');
console.log('2. You login to toflx.com');
console.log('3. It automatically captures all videos/images');
console.log('4. Downloads everything');
console.log('');
console.log('Movie URL:', movieUrl);
console.log('');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Show browser so you can login
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const mediaUrls = new Set();
  const results = { videos: [], images: [], failed: [] };

  // Capture ALL network requests
  page.on('response', async (response) => {
    const url = response.url();
    
    // Capture video files
    if (/\.(mp4|m3u8|webm|mov|avi|mkv)(\?|$)/i.test(url) &&
        !url.includes('logo') && !url.includes('icon') && !url.includes('400_57s')) {
      if (!mediaUrls.has(url)) {
        mediaUrls.add(url);
        console.log(`🎬 Found video: ${url.substring(0, 100)}...`);
        results.videos.push({ url });
      }
    }
    
    // Capture images
    if (/\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i.test(url) &&
        !url.includes('logo') && !url.includes('icon') && !url.includes('pin-instructions')) {
      if (!mediaUrls.has(url)) {
        mediaUrls.add(url);
        console.log(`🖼️  Found image: ${url.substring(0, 100)}...`);
        results.images.push({ url });
      }
    }
  });

  console.log('🌐 Opening browser...');
  console.log('👤 Please login to toflx.com when the browser opens');
  console.log('⏳ Waiting 30 seconds for you to login...');
  console.log('');

  // Navigate to the movie page
  await page.goto(movieUrl, { waitUntil: 'networkidle2', timeout: 60000 });

  // Wait for user to login
  console.log('⏳ Waiting for you to login and navigate to the movie...');
  console.log('   (The browser is open - login and go to the movie page)');
  console.log('   Press Ctrl+C when done, or wait 60 seconds...');
  console.log('');

  // Wait 60 seconds for user to login and navigate
  await new Promise(resolve => setTimeout(resolve, 60000));

  // Also try the page variations automatically
  const baseUrl = movieUrl.split('?')[0];
  const variations = [
    `${baseUrl}?pl=0`,
    `${baseUrl}?pl=1`,
  ];

  for (const url of variations) {
    console.log(`📥 Checking: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log('');
  console.log(`✅ Found ${results.videos.length} videos and ${results.images.length} images`);
  console.log('');

  // Download everything
  let downloadCount = 0;
  for (const item of [...results.videos, ...results.images]) {
    downloadCount++;
    const isVideo = results.videos.includes(item);
    const ext = path.extname(new URL(item.url).pathname) || (isVideo ? '.mp4' : '.jpg');
    const filename = `${isVideo ? 'video' : 'image'}-${downloadCount}${ext}`;
    const filepath = path.join(outputDir, filename);

    console.log(`📥 Downloading ${downloadCount}/${results.videos.length + results.images.length}: ${filename}`);

    try {
      const agent = new https.Agent({ rejectUnauthorized: false });
      const response = await axios({
        method: 'GET',
        url: item.url,
        responseType: 'stream',
        httpsAgent: agent,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': new URL(movieUrl).origin + '/',
        },
      });

      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      item.file = filename;
      console.log(`   ✅ Saved: ${filename}`);
    } catch (error) {
      results.failed.push({ url: item.url, error: error.message });
      console.log(`   ❌ Failed: ${error.message}`);
    }
  }

  // Save results
  fs.writeFileSync(
    path.join(outputDir, 'results.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('');
  console.log('🎉 Done!');
  console.log(`📁 Files saved to: ${path.resolve(outputDir)}`);
  console.log(`📊 Videos: ${results.videos.length}, Images: ${results.images.length}`);

  await browser.close();
})();
