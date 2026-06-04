#!/usr/bin/env node

/**
 * Helper script to extract cookies from browser
 * 
 * Instructions:
 * 1. Login to toflx.com in your browser
 * 2. Open DevTools (F12)
 * 3. Go to Console tab
 * 4. Run: document.cookie
 * 5. Copy the output
 * 6. Run this script: node get-cookie.js "PASTE_COOKIE_HERE"
 */

const cookie = process.argv[2];

if (!cookie) {
  console.log(`
📋 HOW TO GET YOUR TOFLX.COM COOKIE:

1. Open toflx.com in your browser
2. Login to your account
3. Press F12 (DevTools)
4. Go to Console tab
5. Type: document.cookie
6. Press Enter
7. Copy the entire output
8. Run: node get-cookie.js "YOUR_COOKIE_HERE"

OR

1. F12 → Network tab
2. Visit a movie page
3. Click any request
4. Headers tab → Request Headers
5. Copy the "Cookie" value
6. Run: node get-cookie.js "YOUR_COOKIE_HERE"
`);
  process.exit(1);
}

console.log(`
✅ Cookie extracted!
📋 Use this in your scraper request:

{
  "sourceUrl": "https://toflx.com/movies/one-battle-after-another-2025",
  "config": {
    "apiHeaders": {
      "Cookie": "${cookie}"
    }
  }
}
`);
