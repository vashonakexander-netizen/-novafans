# Quick Deployment Guide

## Option 1: Local Domain (Easiest - No Internet Required)

Already set up! Access your site at:
- **http://novafans.local:3000**

If it doesn't work, run:
```bash
./setup-local-domain.sh
```

## Option 2: Deploy to Vercel (Get Real Domain - FREE)

### Step 1: Push to GitHub
```bash
cd /Users/vash/novafans
git init
git add .
git commit -m "Initial commit"
# Create repo on GitHub, then:
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "Add New Project"
4. Import your `novafans` repository
5. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `cd ../.. && pnpm install && pnpm build --filter=web`
   - **Output Directory:** `.next`
6. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL` = Your API URL (or leave default)
   - `NEXT_PUBLIC_AI_SERVICE_URL` = Your AI service URL (or leave default)
7. Click "Deploy"

### Step 3: Get Your Domain
- Vercel gives you: `your-project.vercel.app` (FREE)
- Or add your own domain in Vercel settings

## Option 3: Use ngrok (Temporary Public URL)

```bash
# Install ngrok
brew install ngrok

# Start tunnel
ngrok http 3000

# You'll get a URL like: https://abc123.ngrok.io
```

## Option 4: Network Access (Same WiFi)

Access from any device on your network:
- **http://192.168.1.97:3000**

## Current Status

- ✅ Local domain: `novafans.local:3000`
- ✅ Network IP: `192.168.1.97:3000`
- ✅ Server running on port 3000

