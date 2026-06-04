# Easy Deployment Options for NovaFans

## 🎯 Recommended: Railway.app (Easiest!)

Railway handles monorepos automatically and requires minimal configuration.

### Steps:
1. Go to https://railway.app and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `novafans` repository
4. Railway will auto-detect it's a Next.js app
5. Set Root Directory: `apps/web` (in the settings if needed)
6. Deploy!

**That's it!** Railway will automatically:
- Install dependencies with pnpm
- Build the Next.js app
- Deploy it with a live URL

## Alternative: Render.com

1. Go to https://render.com
2. Connect your GitHub account
3. Click "New" → "Web Service"
4. Select your `novafans` repository
5. Configure:
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && pnpm install && pnpm --filter=web build`
   - **Start Command**: `cd ../.. && pnpm --filter=web start`
   - **Node Version**: 18 or higher
6. Click "Create Web Service"

## Fix Vercel (If You Want to Keep Trying)

The issue is the Root Directory setting. Here's how to fix it manually:

1. Go to: https://vercel.com/alexanders-projects-31480311/web/settings/general
2. Scroll to "Root Directory"
3. Click "Edit"
4. **Remove it completely** (leave blank)
5. Save
6. Go to Deployments tab
7. Click "Redeploy" on the latest deployment

The root `vercel.json` will handle everything automatically.

## Local Development

To test locally first:

```bash
cd /Users/vash/novafans
pnpm install
pnpm dev --filter=web
```

Then open http://localhost:3000
