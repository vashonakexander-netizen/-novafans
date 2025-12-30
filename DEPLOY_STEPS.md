# 🚀 Deploy to Vercel - Step by Step

## Your code is ready! Follow these steps:

### Step 1: Go to Vercel
1. Open https://vercel.com in your browser
2. Click "Sign Up" or "Log In"
3. Choose "Continue with GitHub" (recommended)

### Step 2: Import Your Project
1. Click "Add New Project"
2. Find your repository: `vashonakexander-netizen/-novafans`
3. Click "Import"

### Step 3: Configure Project
Vercel should auto-detect Next.js, but verify these settings:

**Framework Preset:** Next.js

**Root Directory:** `apps/web`
- Click "Edit" next to Root Directory
- Type: `apps/web`
- Click "Continue"

**Build and Output Settings:**
- Build Command: `cd ../.. && pnpm install && pnpm build --filter=web`
- Output Directory: `.next`
- Install Command: `cd ../.. && pnpm install`

### Step 4: Environment Variables
Add these (optional for now, defaults will work):
- `NEXT_PUBLIC_API_URL` = (leave empty for now, or your API URL)
- `NEXT_PUBLIC_AI_SERVICE_URL` = (leave empty for now, or your AI service URL)

### Step 5: Deploy!
1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://novafans-abc123.vercel.app`

### Step 6: Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your domain (e.g., `novafans.com`)
3. Follow DNS instructions

## 🎉 That's it!

Your site will be live at: `https://your-project.vercel.app`

## Quick Access
- Dashboard: https://vercel.com/dashboard
- Your repo: https://github.com/vashonakexander-netizen/-novafans

