# 🚀 Deploy Your Site - Simple Steps

## Quick Deploy via Vercel Website

### Step 1: Push to GitHub
```bash
cd /Users/vash/novafans
git push origin main
```
*(If it asks for credentials, use GitHub Personal Access Token)*

### Step 2: Deploy on Vercel
1. **Open:** https://vercel.com
2. **Click:** "Sign Up" or "Log In"
3. **Choose:** "Continue with GitHub"
4. **Click:** "Add New Project"
5. **Find:** `vashonakexander-netizen/-novafans`
6. **Click:** "Import"

### Step 3: Configure (IMPORTANT!)
- **Framework:** Next.js (auto-detected)
- **Root Directory:** Click "Edit" → Type: `apps/web` → Click "Continue"
- **Build Command:** `cd ../.. && pnpm install && pnpm build --filter=web`
- **Output Directory:** `.next`
- **Install Command:** `cd ../.. && pnpm install`

### Step 4: Deploy!
Click **"Deploy"** and wait 2-3 minutes.

### Step 5: Get Your URL
You'll get a URL like: `https://novafans-abc123.vercel.app`

**That's your live site! 🎉**

---

## Or Use CLI (If you prefer terminal)

```bash
cd /Users/vash/novafans/apps/web
npx vercel login
npx vercel
```

Follow the prompts, and you're done!

---

## Add Custom Domain Later

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Update DNS records
4. Done!

