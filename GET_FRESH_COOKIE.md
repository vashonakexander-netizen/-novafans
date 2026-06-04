# How to Get Fresh Cookie & Use Browse.ai

## The Problem

Your cookie has expired! All pages are showing login screens, so the scraper can't access the movie content.

## Solution 1: Get Fresh Cookie

### Step 1: Login to toflx.com
1. Open Chrome/Firefox
2. Go to https://toflx.com
3. **Login** with your account

### Step 2: Get Cookie
1. Press **F12** (DevTools)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Cookies** → `https://toflx.com`
4. Copy all cookie values

### Step 3: Format Cookie
The cookie should look like:
```
pip=xxx; si2=xxx; _vjs_volume=1; show_watched_xxx=true; ...
```

### Step 4: Use Fresh Cookie
```bash
# Set as environment variable
export COOKIE="your-fresh-cookie-here"

# Or update the script
# Edit apps/api/puppeteer-scraper.js and replace the cookie value
```

Then run:
```bash
cd apps/api
node puppeteer-scraper.js https://toflx.com/movies/sinners-2025
```

## Solution 2: Use Browse.ai (Easier!)

Browse.ai can handle login automatically!

### Step 1: Create Robot
1. Go to: https://dashboard.browse.ai
2. Click **"Create Robot"**
3. Paste your URL: `https://toflx.com/movies/sinners-2025`
4. Select **"Extract Data"**

### Step 2: Configure
1. **Record Session**: Click "Record Session Cookies" ✅
2. Browse.ai will open a browser
3. **Login** to toflx.com in that browser
4. Browse.ai will save your session!

### Step 3: Extract Data
1. Tell Browse.ai what to extract:
   - Video URLs
   - Image URLs
   - Movie title
2. Save the robot

### Step 4: Run & Get Data
1. Click **"Run"** on your robot
2. Browse.ai will:
   - Login automatically (using saved session)
   - Wait for content to load
   - Extract all media URLs
3. Get results via:
   - Dashboard (web interface)
   - API (for automation)

### Browse.ai API Example:
```javascript
// After setting up your robot
const response = await fetch('https://api.browse.ai/v2/robots/YOUR_ROBOT_ID/run', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    inputParameters: {
      url: 'https://toflx.com/movies/sinners-2025',
    },
  }),
});

const data = await response.json();
// data.result contains all extracted media URLs
```

## Recommendation

**Use Browse.ai** - it's easier because:
- ✅ Handles login automatically
- ✅ Saves your session
- ✅ No cookie management
- ✅ Visual interface
- ✅ API for automation

Just create a robot, login once, and it will remember your session!

## Quick Start with Browse.ai

1. Go to: https://dashboard.browse.ai/workspaces/alex-alexander-1/robots/new/custom
2. Paste URL: `https://toflx.com/movies/sinners-2025`
3. Enable "Record Session Cookies"
4. Create robot
5. Login when prompted
6. Configure what to extract (video URLs, images)
7. Run and get results!
