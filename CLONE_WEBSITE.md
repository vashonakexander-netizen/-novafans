# How to Clone or Scrape a Website

## Quick Methods

### Method 1: Use Your Built-in Scraper (Easiest)

Your Savage House scraper can extract media from any website:

1. **Go to**: http://localhost:3001/admin/scraper
2. **Paste the URL** you want to scrape
3. **Click "Start Scraping"**
4. Videos/images will be automatically extracted and added to your site

**What it does:**
- Extracts all videos and images
- Downloads them
- Creates posts automatically
- No coding needed!

---

### Method 2: Command Line Tools

#### Option A: wget (Simple Clone)
```bash
# Clone entire website
wget --mirror --convert-links --adjust-extension --page-requisites --no-parent https://example.com

# Just download HTML
wget https://example.com/page.html
```

#### Option B: httrack (Full Website Clone)
```bash
# Install httrack
brew install httrack  # macOS
# or
sudo apt-get install httrack  # Linux

# Clone website
httrack https://example.com -O ./cloned-site
```

#### Option C: curl (Simple Download)
```bash
# Download single page
curl -o page.html https://example.com

# Download with all assets
curl -L -o page.html https://example.com
```

---

### Method 3: Browser Extensions

#### SingleFile (Chrome/Firefox)
- Saves entire page as single HTML file
- Includes all CSS, images, fonts
- Perfect for archiving

#### Web Scraper (Chrome)
- Visual scraping tool
- Point and click interface
- Export to CSV/JSON

#### Save Page WE (Chrome)
- Saves complete webpage
- Includes all resources

---

### Method 4: Python Scripts

#### Simple Scraper
```python
import requests
from bs4 import BeautifulSoup

url = "https://example.com"
response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

# Extract all images
images = soup.find_all('img')
for img in images:
    print(img.get('src'))

# Extract all videos
videos = soup.find_all('video')
for video in videos:
    print(video.get('src'))
```

#### Full Clone Script
```python
import requests
import os
from urllib.parse import urljoin, urlparse

def download_page(url, output_dir):
    response = requests.get(url)
    os.makedirs(output_dir, exist_ok=True)
    
    with open(f"{output_dir}/index.html", "w") as f:
        f.write(response.text)
    
    print(f"Downloaded: {url}")

download_page("https://example.com", "./cloned")
```

---

### Method 5: Node.js Script

```javascript
const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');

async function scrape(url) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  
  // Extract images
  $('img').each((i, elem) => {
    console.log($(elem).attr('src'));
  });
  
  // Extract videos
  $('video').each((i, elem) => {
    console.log($(elem).attr('src'));
  });
  
  // Save HTML
  fs.writeFileSync('page.html', response.data);
}

scrape('https://example.com');
```

---

## For Your Savage House Site

### Use the Built-in Scraper

**Web Interface:**
1. Go to http://localhost:3001/admin/scraper
2. Paste URL
3. Click scrape
4. Done!

**API Endpoint:**
```bash
curl -X POST http://localhost:3001/scraper/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "sourceUrl": "https://example.com",
    "config": {
      "apiHeaders": {
        "Cookie": "your-cookie-here"
      }
    }
  }'
```

**What Gets Scraped:**
- ✅ All images
- ✅ All videos
- ✅ JavaScript-loaded content
- ✅ Data attributes
- ✅ Iframe embeds

**Auto-Import:**
- Creates posts automatically
- One media item per post
- Publishes immediately
- Appears on /browse page

---

## Quick Comparison

| Method | Ease | Speed | Best For |
|--------|------|-------|----------|
| Your Scraper | ⭐⭐⭐⭐⭐ | Fast | Media extraction |
| wget | ⭐⭐⭐⭐ | Very Fast | Full site clone |
| httrack | ⭐⭐⭐⭐ | Fast | Complete mirror |
| Browser Ext | ⭐⭐⭐⭐⭐ | Medium | Single pages |
| Python | ⭐⭐⭐ | Medium | Custom needs |
| Node.js | ⭐⭐⭐ | Medium | Custom needs |

---

## Recommended: Use Your Built-in Scraper

For your use case (scraping movies/media), your built-in scraper is perfect:

1. **No coding needed**
2. **Automatic import to posts**
3. **Web interface**
4. **Handles authentication**
5. **Extracts JavaScript content**

Just go to: **http://localhost:3001/admin/scraper**
