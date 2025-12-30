# 🚀 Deploy to Vercel - Quick Guide

## Option 1: Deploy via Vercel Website (Recommended)

### Step 1: Push to GitHub (if not already pushed)
```bash
cd /Users/vash/novafans
git push origin main
```
(You may need to authenticate with GitHub)

### Step 2: Deploy on Vercel
1. **Go to:** https://vercel.com
2. **Sign in** with GitHub
3. **Click:** "Add New Project"
4. **Find:** `vashonakexander-netizen/-novafans`
5. **Click:** "Import"

### Step 3: Configure
- **Framework:** Next.js (auto-detected)
- **Root Directory:** `apps/web` ⚠️ IMPORTANT!
- **Build Command:** `cd ../.. && pnpm install && pnpm build --filter=web`
- **Output Directory:** `.next`
- **Install Command:** `cd ../.. && pnpm install`

### Step 4: Environment Variables (Optional)
Add these if you have API URLs:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_AI_SERVICE_URL`

### Step 5: Deploy!
Click "Deploy" and wait 2-3 minutes.

**You'll get:** `https://novafans-xxxxx.vercel.app`

---

## Option 2: Deploy via Vercel CLI (Faster)

```bash
cd /Users/vash/novafans/apps/web
npx vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name? **novafans** (or your choice)
- Directory? **./** (current directory)
- Override settings? **No**

Then:
```bash
npx vercel --prod
```

---

## After Deployment

### Add Custom Domain
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `novafans.com`)
3. Follow DNS setup instructions

### Update Environment Variables
If you need to change API URLs later:
1. Go to Project Settings → Environment Variables
2. Add/update variables
3. Redeploy

---

## Your Site Will Be Live At:
- **Vercel URL:** `https://your-project.vercel.app`
- **Custom Domain:** `https://yourdomain.com` (after setup)

