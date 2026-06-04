#!/usr/bin/env python3
"""
Simple website scraper
Usage: python3 simple-scrape.py <URL>
"""

import sys
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import os

def scrape_website(url):
    """Scrape a website and extract all media"""
    print(f"🌐 Scraping: {url}")
    
    try:
        # Fetch the page
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract images
        images = []
        for img in soup.find_all('img'):
            src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
            if src:
                full_url = urljoin(url, src)
                images.append(full_url)
        
        # Extract videos
        videos = []
        for video in soup.find_all('video'):
            src = video.get('src') or video.get('data-src')
            if src:
                full_url = urljoin(url, src)
                videos.append(full_url)
            # Check source tags
            for source in video.find_all('source'):
                src = source.get('src')
                if src:
                    full_url = urljoin(url, src)
                    videos.append(full_url)
        
        # Extract iframes (YouTube, Vimeo, etc.)
        for iframe in soup.find_all('iframe'):
            src = iframe.get('src')
            if src and ('youtube' in src or 'vimeo' in src or 'video' in src):
                videos.append(src)
        
        # Print results
        print(f"\n📸 Found {len(images)} images:")
        for img in images[:10]:  # Show first 10
            print(f"   {img}")
        if len(images) > 10:
            print(f"   ... and {len(images) - 10} more")
        
        print(f"\n🎬 Found {len(videos)} videos:")
        for vid in videos[:10]:  # Show first 10
            print(f"   {vid}")
        if len(videos) > 10:
            print(f"   ... and {len(videos) - 10} more")
        
        # Save to file
        output_file = "scraped-media.txt"
        with open(output_file, 'w') as f:
            f.write(f"Scraped from: {url}\n\n")
            f.write("IMAGES:\n")
            for img in images:
                f.write(f"{img}\n")
            f.write("\nVIDEOS:\n")
            for vid in videos:
                f.write(f"{vid}\n")
        
        print(f"\n✅ Results saved to: {output_file}")
        print(f"\n💡 Tip: Use your Savage House scraper to import these:")
        print(f"   Go to: http://localhost:3001/admin/scraper")
        
        return images, videos
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching URL: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 simple-scrape.py <URL>")
        print("\nExample:")
        print("  python3 simple-scrape.py https://example.com")
        sys.exit(1)
    
    url = sys.argv[1]
    scrape_website(url)
