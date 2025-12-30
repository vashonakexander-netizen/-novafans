# Railway Deployment Guide for NovaFans

This guide provides step-by-step instructions for deploying NovaFans API and AI services to Railway.

## Overview

Railway setup consists of:
- **API Service** (Docker): NestJS backend
- **AI Service** (Docker): Express AI service
- **PostgreSQL**: Managed database (Railway provides)
- **Redis**: Managed Redis (Railway provides)

## Prerequisites

1. Railway account: https://railway.app
2. GitHub repository connected to Railway
3. Railway CLI (optional but recommended): `npm i -g @railway/cli`

## Step 1: Create Railway Project

### Via Dashboard

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `novafans` repository

### Via CLI

```bash
railway login
railway init
railway link
```

## Step 2: Add Managed Services

### Add PostgreSQL Database

1. In Railway dashboard, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create and expose `DATABASE_URL` as an environment variable

### Add Redis

1. In Railway dashboard, click "+ New"
2. Select "Database" → "Add Redis"
3. Railway will automatically create and expose `REDIS_URL` as an environment variable

## Step 3: Deploy API Service

### Option A: Via Dashboard

1. Click "+ New" → "Empty Service"
2. Name it `novafans-api`
3. Connect to your GitHub repo
4. Configure service:
   - **Root Directory:** (leave empty, uses repo root)
   - **Dockerfile Path:** `apps/api/Dockerfile`
   - **Build Command:** (leave empty, Dockerfile handles this)
   - **Start Command:** (leave empty, Dockerfile handles this)
   - **Port:** `3001` (or leave empty, Railway auto-detects from EXPOSE)

5. Set environment variables (see "Environment Variables" section below)

6. Railway will automatically build and deploy

### Option B: Via CLI

```bash
# Create API service
railway service create novafans-api

# Link to API service
railway link --service novafans-api

# Deploy
railway up --dockerfile apps/api/Dockerfile
```

## Step 4: Deploy AI Service

### Option A: Via Dashboard

1. Click "+ New" → "Empty Service"
2. Name it `novafans-ai`
3. Connect to your GitHub repo (same repo as API)
4. Configure service:
   - **Root Directory:** (leave empty)
   - **Dockerfile Path:** `apps/ai/Dockerfile`
   - **Port:** `3002`

5. Set environment variables (see "Environment Variables" section below)

6. Railway will automatically build and deploy

### Option B: Via CLI

```bash
# Create AI service
railway service create novafans-ai

# Link to AI service
railway link --service novafans-ai

# Deploy
railway up --dockerfile apps/ai/Dockerfile
```

## Step 5: Configure Environment Variables

### API Service Environment Variables

Set these in Railway dashboard for `novafans-api` service:

**Required:**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=${POSTGRES_URL}  # Railway auto-provides this
REDIS_URL=${REDIS_URL}  # Railway auto-provides this
JWT_ACCESS_SECRET=your-secret-here-32-chars-minimum
JWT_REFRESH_SECRET=your-refresh-secret-here-32-chars-minimum
API_BASE_URL=${RAILWAY_PUBLIC_DOMAIN}  # Railway auto-provides this
STORAGE_BASE_URL=${RAILWAY_PUBLIC_DOMAIN}
FRONTEND_ORIGIN=https://novafans.com
AI_SERVICE_URL=https://ai.novafans.com  # Update after AI service is deployed
UPLOADS_DIR=/data/uploads
```

**Optional:**
```env
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CRYPTO_PROVIDER=fake
CRYPTO_DEFAULT_CURRENCY=USDT
```

**Railway Auto-Provided Variables:**
- `POSTGRES_URL` / `DATABASE_URL` (from PostgreSQL service)
- `REDIS_URL` (from Redis service)
- `RAILWAY_PUBLIC_DOMAIN` (auto-generated domain)
- `PORT` (can be overridden, Railway sets it)

### AI Service Environment Variables

Set these in Railway dashboard for `novafans-ai` service:

**Required:**
```env
NODE_ENV=production
PORT=3002
AI_SERVICE_URL=${RAILWAY_PUBLIC_DOMAIN}
AI_PROVIDER=openai
AI_API_KEY=sk-your-openai-api-key-here
```

**Optional:**
```env
AI_MODEL=gpt-4o-mini
AI_MAX_TOKENS=512
AI_TEMPERATURE=0.7
```

**For Development/Testing:**
```env
AI_PROVIDER=fake  # No API costs, uses rule-based replies
# Leave AI_API_KEY empty
```

## Step 6: Configure Persistent Volumes (Uploads)

For local file storage, Railway requires a volume for uploads:

### Via Dashboard

1. In `novafans-api` service, go to "Settings"
2. Click "Volumes" tab
3. Click "+ New Volume"
4. Set:
   - **Mount Path:** `/data/uploads`
   - **Volume Name:** `novafans-uploads`

5. Ensure `UPLOADS_DIR=/data/uploads` in environment variables

### Via CLI

```bash
railway volume create novafans-uploads --mount /data/uploads
```

**Note:** For production, consider migrating to S3/BunnyCDN instead of local storage (see DEPLOYMENT.md).

## Step 7: Run Database Migrations

After API service is deployed:

### Via Dashboard

1. Open `novafans-api` service
2. Go to "Deployments" → latest deployment
3. Click "View Logs"
4. Run migration command in logs console or via CLI:

### Via CLI

```bash
railway run --service novafans-api pnpm prisma:migrate deploy
```

Or if using Railway shell:

```bash
railway shell --service novafans-api
cd apps/api
pnpm prisma:migrate deploy
exit
```

## Step 8: Configure Custom Domains

### API Service Domain

1. In `novafans-api` service, go to "Settings"
2. Click "Networking" tab
3. Click "Generate Domain" or "Custom Domain"
4. For custom domain: `api.novafans.com`
5. Update `API_BASE_URL` and `STORAGE_BASE_URL` to match custom domain

### AI Service Domain

1. In `novafans-ai` service, go to "Settings"
2. Click "Networking" tab
3. Click "Generate Domain" or "Custom Domain"
4. For custom domain: `ai.novafans.com`
5. Update `AI_SERVICE_URL` in both API and AI services

### DNS Configuration

For custom domains, add CNAME records in your DNS:

```
api.novafans.com → CNAME → <railway-provided-domain>
ai.novafans.com → CNAME → <railway-provided-domain>
```

Railway provides automatic HTTPS certificates for custom domains.

## Step 9: Verify Deployment

### Health Checks

1. **API Health:**
   ```bash
   curl https://api.novafans.com/health
   ```
   Expected: `{"status":"ok","db":"ok","redis":"ok"}`

2. **AI Health:**
   ```bash
   curl https://ai.novafans.com/health
   ```
   Expected: `{"status":"ok","provider":"openai","model":"gpt-4o-mini"}`

### Test Endpoints

1. **API Base:**
   ```bash
   curl https://api.novafans.com/
   ```

2. **Check logs:**
   ```bash
   railway logs --service novafans-api
   railway logs --service novafans-ai
   ```

## Step 10: Connect API to AI Service

After both services are deployed:

1. Update `novafans-api` environment variable:
   ```env
   AI_SERVICE_URL=https://ai.novafans.com
   ```

2. Redeploy API service (Railway will auto-redeploy on env var change, or trigger manually)

## Railway-Specific Configuration

### Build Settings

Railway automatically detects Dockerfiles. Ensure:
- `apps/api/Dockerfile` exists
- `apps/ai/Dockerfile` exists
- Both Dockerfiles use `PORT` environment variable
- Both Dockerfiles listen on `0.0.0.0`

### Health Checks

Railway uses `/health` endpoint for service health monitoring:
- Configure health checks in service settings
- Health check path: `/health`
- Interval: 30 seconds (default)

### Scaling

Railway allows horizontal scaling:
1. Go to service → "Settings" → "Scaling"
2. Set instance count (default: 1)
3. Note: Ensure Redis is used for rate limiting and session storage when scaling

### Environment Variable Sharing

To share env vars across services:
1. Go to project → "Variables" tab
2. Add shared variables (e.g., `FRONTEND_ORIGIN`)
3. Reference in services: `${FRONTEND_ORIGIN}`

## Troubleshooting

### Build Fails

1. Check Dockerfile paths are correct
2. Verify `pnpm-lock.yaml` is committed
3. Check build logs in Railway dashboard
4. Ensure all dependencies are in `package.json`

### API Can't Connect to Database

1. Verify `DATABASE_URL` is set (Railway auto-provides)
2. Check database service is running
3. Verify database connection string format
4. Check service logs for connection errors

### Uploads Not Persisting

1. Verify volume is mounted at `/data/uploads`
2. Check `UPLOADS_DIR=/data/uploads` in env vars
3. Ensure volume is attached to correct service
4. Check file permissions in logs

### AI Service Not Responding

1. Verify `AI_API_KEY` is set (if `AI_PROVIDER=openai`)
2. Check `AI_SERVICE_URL` matches Railway domain
3. Test with `AI_PROVIDER=fake` for debugging
4. Check logs for API errors

## Cost Optimization

- Use `AI_PROVIDER=fake` in development/testing
- Monitor Railway usage dashboard
- Consider Railway's usage-based pricing
- Use managed services (Postgres, Redis) efficiently

## Next Steps

1. Set up monitoring (Railway provides basic metrics)
2. Configure backups for PostgreSQL
3. Set up alerts for service failures
4. Consider migrating uploads to S3/BunnyCDN (see DEPLOYMENT.md)
5. Implement CI/CD with Railway auto-deploy from Git

## Additional Resources

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- See `DEPLOYMENT.md` for general deployment guidance
- See `docs/ENVIRONMENT.md` for complete env var reference


