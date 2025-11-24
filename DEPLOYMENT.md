# NovaFans Deployment Guide

This guide covers deploying NovaFans from development to staging and production.

## Table of Contents

- [Local Development](#local-development)
- [Staging Setup (Railway + Vercel)](#staging-setup-railway--vercel)
- [Production Setup (Railway + Vercel)](#production-setup-railway--vercel)
- [Staging E2E Checklist](#staging-e2e-checklist)
- [Environment Variables](#environment-variables)
- [Domains & HTTPS](#domains--https)
- [Health Checks](#health-checks)
- [Crypto Payments Integration](#crypto-payments-integration)
- [Final Sanity Checklist](#final-sanity-checklist)

---

## Local Development

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker & Docker Compose (for Postgres and Redis)

### Setup Steps

1. **Clone and install dependencies:**
   ```bash
   git clone <repo-url>
   cd novafans
   pnpm install
   ```

2. **Start infrastructure (Postgres & Redis):**
   ```bash
   docker-compose up -d
   ```

3. **Set up environment variables:**
   ```bash
   # Copy example files
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   cp apps/ai/.env.example apps/ai/.env
   ```

4. **Run database migrations:**
   ```bash
   cd apps/api
   pnpm prisma:generate
   pnpm prisma:migrate dev
   ```

5. **Start all services:**
   ```bash
   # From root directory
   pnpm dev
   ```

   This starts:
   - API server on `http://localhost:3001`
   - Web app on `http://localhost:3000`
   - AI service on `http://localhost:3002`

6. **Verify health endpoints:**
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:3002/health
   ```

---

## Staging Setup (Railway + Vercel)

### Overview

Staging environment for testing deployments before production. Uses Railway for backend services and Vercel for frontend.

**Staging URLs (example):**
- `staging.novafans.com` → Vercel web app
- `api-staging.novafans.com` → Railway API service
- `ai-staging.novafans.com` → Railway AI service

### Required Services

1. **Railway Services:**
   - `novafans-api-staging` (API service)
   - `novafans-ai-staging` (AI service)
   - PostgreSQL (managed)
   - Redis (managed)

2. **Vercel:**
   - `novafans-web-staging` (Next.js web app)

### Step 1: Railway Setup (Backend)

#### 1.1 Create Railway Project

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `novafans` repository
4. Name: `novafans-staging`

#### 1.2 Add Managed Services

**PostgreSQL:**
1. Click "+ New" → "Database" → "Add PostgreSQL"
2. Railway provides `DATABASE_URL` automatically
3. Note the connection string

**Redis:**
1. Click "+ New" → "Database" → "Add Redis"
2. Railway provides `REDIS_URL` automatically
3. Note the connection string

#### 1.3 Deploy API Service

1. Click "+ New" → "Empty Service"
2. Name: `novafans-api-staging`
3. Connect to GitHub repository
4. Configure:
   - **Dockerfile Path:** `apps/api/Dockerfile`
   - **Root Directory:** Leave blank (root)
   - **Port:** `3001` (or Railway will auto-detect)

5. **Set Environment Variables:**
   ```env
   NODE_ENV=staging
   PORT=3001
   API_BASE_URL=https://api-staging.novafans.com
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   JWT_ACCESS_SECRET=your-staging-access-secret-32-chars-minimum
   JWT_REFRESH_SECRET=your-staging-refresh-secret-32-chars-minimum
   FRONTEND_ORIGIN=https://staging.novafans.com
   AI_SERVICE_URL=https://ai-staging.novafans.com
   STORAGE_BASE_URL=https://api-staging.novafans.com
   UPLOADS_DIR=/data/uploads
   CRYPTO_PROVIDER=fake
   CRYPTO_CALLBACK_BASE_URL=https://api-staging.novafans.com
   CRYPTO_DEFAULT_CURRENCY=USDT
   CRYPTO_MIN_AMOUNT=1.0
   ```

6. **Add Persistent Volume:**
   - Go to Settings → Volumes
   - Click "+ New Volume"
   - Mount Path: `/data/uploads`
   - Volume Name: `novafans-uploads-staging`

7. **Deploy:**
   - Railway automatically builds and deploys on push to connected branch
   - Or trigger manual deployment from dashboard

#### 1.4 Deploy AI Service

1. Click "+ New" → "Empty Service"
2. Name: `novafans-ai-staging`
3. Connect to GitHub repository
4. Configure:
   - **Dockerfile Path:** `apps/ai/Dockerfile`
   - **Root Directory:** Leave blank (root)
   - **Port:** `3002` (or Railway will auto-detect)

5. **Set Environment Variables:**
   ```env
   NODE_ENV=staging
   PORT=3002
   AI_SERVICE_URL=https://ai-staging.novafans.com
   AI_PROVIDER=fake
   # AI_API_KEY=  # Leave empty for staging fake mode
   ```

6. **Deploy:**
   - Railway automatically builds and deploys

#### 1.5 Run Database Migrations

Once API service is running:

```bash
railway run --service novafans-api-staging pnpm prisma:migrate deploy
```

Or via Railway dashboard:
1. Go to `novafans-api-staging` service
2. Click "Deployments" → "New Deploy" → "Run Command"
3. Command: `pnpm prisma:migrate deploy`

#### 1.6 Configure Custom Domains

**API Service:**
1. Go to `novafans-api-staging` → Settings → Networking
2. Add custom domain: `api-staging.novafans.com`
3. Railway automatically provisions SSL certificate

**AI Service:**
1. Go to `novafans-ai-staging` → Settings → Networking
2. Add custom domain: `ai-staging.novafans.com`
3. Railway automatically provisions SSL certificate

#### 1.7 Verify Health Endpoints

```bash
curl https://api-staging.novafans.com/health
# Expected: {"status":"ok","db":"ok","redis":"ok","crypto":{...}}

curl https://ai-staging.novafans.com/health
# Expected: {"status":"ok","provider":"fake"}
```

### Step 2: Vercel Setup (Frontend)

#### 2.1 Create Vercel Project

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your `novafans` GitHub repository
4. Configure:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `apps/web`
   - **Build Command:** `pnpm install && pnpm build` (or leave default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `pnpm install`

#### 2.2 Set Environment Variables

Go to Project Settings → Environment Variables and add:

```env
NEXT_PUBLIC_API_URL=https://api-staging.novafans.com
NEXT_PUBLIC_AI_SERVICE_URL=https://ai-staging.novafans.com
```

**Important:** These are `NEXT_PUBLIC_*` variables, so they're baked into the build. Set them before deploying.

#### 2.3 Configure Domain

1. Go to Project Settings → Domains
2. Add domain: `staging.novafans.com`
3. Vercel automatically provisions SSL certificate
4. Update DNS:
   - Add CNAME: `staging.novafans.com` → `cname.vercel-dns.com`
   - Or use Vercel's nameservers

#### 2.4 Deploy

- Vercel automatically deploys on push to connected branch
- Or trigger manual deployment from dashboard

#### 2.5 Verify Deployment

1. Visit `https://staging.novafans.com`
2. Verify page loads correctly
3. Check browser console for errors
4. Verify API calls go to `https://api-staging.novafans.com`

---

## Production Setup (Railway + Vercel)

### Overview

Production environment for live traffic. Uses Railway for backend services and Vercel for frontend.

**Production URLs:**
- `novafans.com` (and `www.novafans.com`) → Vercel web app
- `api.novafans.com` → Railway API service
- `ai.novafans.com` → Railway AI service

### Required Services

1. **Railway Services:**
   - `novafans-api` (API service)
   - `novafans-ai` (AI service)
   - PostgreSQL (managed)
   - Redis (managed)

2. **Vercel:**
   - `novafans-web` (Next.js web app)

### Step 1: Railway Setup (Backend)

#### 1.1 Create Railway Project

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `novafans` repository
4. Name: `novafans-production`

#### 1.2 Add Managed Services

**PostgreSQL:**
1. Click "+ New" → "Database" → "Add PostgreSQL"
2. Enable automatic backups (recommended)
3. Railway provides `DATABASE_URL` automatically

**Redis:**
1. Click "+ New" → "Database" → "Add Redis"
2. Railway provides `REDIS_URL` automatically

#### 1.3 Deploy API Service

1. Click "+ New" → "Empty Service"
2. Name: `novafans-api`
3. Connect to GitHub repository
4. Configure:
   - **Dockerfile Path:** `apps/api/Dockerfile`
   - **Root Directory:** Leave blank (root)
   - **Port:** `3001` (or Railway will auto-detect)
   - **Branch:** `main` (or your production branch)

5. **Set Environment Variables:**
   ```env
   NODE_ENV=production
   PORT=3001
   API_BASE_URL=https://api.novafans.com
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   JWT_ACCESS_SECRET=your-production-access-secret-32-chars-minimum
   JWT_REFRESH_SECRET=your-production-refresh-secret-32-chars-minimum
   FRONTEND_ORIGIN=https://novafans.com
   AI_SERVICE_URL=https://ai.novafans.com
   STORAGE_BASE_URL=https://api.novafans.com
   UPLOADS_DIR=/data/uploads
   CRYPTO_PROVIDER=nowpayments
   CRYPTO_API_KEY=your-production-crypto-api-key
   CRYPTO_IPN_SECRET=your-production-webhook-secret-32-chars
   CRYPTO_CALLBACK_BASE_URL=https://api.novafans.com
   CRYPTO_DEFAULT_CURRENCY=USDT
   CRYPTO_MIN_AMOUNT=1.0
   ```

   **Generate strong secrets:**
   ```bash
   openssl rand -base64 32  # For JWT secrets
   openssl rand -hex 32     # For crypto webhook secret
   ```

6. **Add Persistent Volume:**
   - Go to Settings → Volumes
   - Click "+ New Volume"
   - Mount Path: `/data/uploads`
   - Volume Name: `novafans-uploads`

7. **Configure Health Check:**
   - Go to Settings → Networking → Health Check
   - Path: `/health`
   - Interval: 30 seconds

8. **Deploy:**
   - Railway automatically builds and deploys on push to `main`
   - Or trigger manual deployment from dashboard

#### 1.4 Deploy AI Service

1. Click "+ New" → "Empty Service"
2. Name: `novafans-ai`
3. Connect to GitHub repository
4. Configure:
   - **Dockerfile Path:** `apps/ai/Dockerfile`
   - **Root Directory:** Leave blank (root)
   - **Port:** `3002` (or Railway will auto-detect)
   - **Branch:** `main` (or your production branch)

5. **Set Environment Variables:**
   ```env
   NODE_ENV=production
   PORT=3002
   AI_SERVICE_URL=https://ai.novafans.com
   AI_PROVIDER=openai
   AI_API_KEY=sk-your-openai-api-key
   AI_MODEL=gpt-4o-mini
   AI_MAX_TOKENS=512
   AI_TEMPERATURE=0.7
   ```

6. **Configure Health Check:**
   - Go to Settings → Networking → Health Check
   - Path: `/health`
   - Interval: 30 seconds

7. **Deploy:**
   - Railway automatically builds and deploys

#### 1.5 Run Database Migrations

Once API service is running:

```bash
railway run --service novafans-api pnpm prisma:migrate deploy
```

Or via Railway dashboard:
1. Go to `novafans-api` service
2. Click "Deployments" → "New Deploy" → "Run Command"
3. Command: `pnpm prisma:migrate deploy`

**Verify migrations:**
```bash
railway run --service novafans-api pnpm prisma:migrate status
```

#### 1.6 Configure Custom Domains

**API Service:**
1. Go to `novafans-api` → Settings → Networking
2. Add custom domain: `api.novafans.com`
3. Railway automatically provisions SSL certificate
4. Update DNS:
   - Add CNAME: `api.novafans.com` → `<railway-provided-domain>`

**AI Service:**
1. Go to `novafans-ai` → Settings → Networking
2. Add custom domain: `ai.novafans.com`
3. Railway automatically provisions SSL certificate
4. Update DNS:
   - Add CNAME: `ai.novafans.com` → `<railway-provided-domain>`

#### 1.7 Configure Crypto Webhook

If using real crypto payments:

1. Log into your crypto payment provider dashboard (NOWPayments, etc.)
2. Navigate to Webhooks/IPN settings
3. Add webhook URL: `https://api.novafans.com/payments/crypto/webhook`
4. Set webhook secret to match `CRYPTO_IPN_SECRET`
5. Enable webhook notifications for:
   - Payment confirmed
   - Payment expired
   - Payment canceled

6. **Test webhook** (if provider supports test mode):
   ```bash
   curl -X POST https://api.novafans.com/payments/crypto/test-webhook \
     -H "Content-Type: application/json" \
     -d '{"providerStatus": "PAID", "invoiceId": "test-123", "type": "SUBSCRIPTION", "amount": 10.00, "currency": "USDT"}'
   ```

#### 1.8 Verify Health Endpoints

```bash
curl https://api.novafans.com/health
# Expected: {"status":"ok","db":"ok","redis":"ok","crypto":{"provider":"nowpayments","configured":true,"mode":"real"}}

curl https://ai.novafans.com/health
# Expected: {"status":"ok","provider":"openai","model":"gpt-4o-mini"}
```

### Step 2: Vercel Setup (Frontend)

#### 2.1 Create Vercel Project

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your `novafans` GitHub repository
4. Configure:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `apps/web`
   - **Build Command:** `pnpm install && pnpm build` (or leave default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `pnpm install`
   - **Production Branch:** `main` (or your production branch)

#### 2.2 Set Environment Variables

Go to Project Settings → Environment Variables and add:

**Production:**
```env
NEXT_PUBLIC_API_URL=https://api.novafans.com
NEXT_PUBLIC_AI_SERVICE_URL=https://ai.novafans.com
```

**Preview (optional, for PR previews):**
```env
NEXT_PUBLIC_API_URL=https://api-staging.novafans.com
NEXT_PUBLIC_AI_SERVICE_URL=https://ai-staging.novafans.com
```

**Important:** 
- These are `NEXT_PUBLIC_*` variables, so they're baked into the build at build time
- Set them in Vercel dashboard before first deployment
- They cannot be changed without rebuilding

#### 2.3 Configure Domains

1. Go to Project Settings → Domains
2. Add domains:
   - `novafans.com` (root)
   - `www.novafans.com` (optional)
3. Vercel automatically provisions SSL certificates
4. Update DNS:
   - Add CNAME: `www.novafans.com` → `cname.vercel-dns.com`
   - For root domain: Follow Vercel's DNS configuration guide

#### 2.4 Deploy

- Vercel automatically deploys on push to `main`
- Or trigger manual deployment from dashboard

#### 2.5 Verify Deployment

1. Visit `https://novafans.com`
2. Verify page loads correctly
3. Check browser console for errors
4. Verify API calls go to `https://api.novafans.com` (not localhost)
5. Test authentication flow
6. Test media uploads

---

## Staging E2E Checklist

Use this checklist to verify the entire platform works end-to-end in staging before promoting to production.

### Prerequisites

- Staging environment deployed (Railway + Vercel)
- Health endpoints responding
- Database migrations run
- Test accounts created (or ability to create)

---

### Flow 1: Creator Sign-up → Onboarding → Post Creation → AI Enable

#### Step 1: Creator Sign-up

1. Visit `https://staging.novafans.com/register`
2. Fill in registration form:
   - Email: `creator-test@example.com`
   - Username: `creator-test`
   - Display Name: `Test Creator`
   - Password: `Test123!@#`
   - ✅ Confirm "I am 18+" checkbox
   - ✅ Accept Terms of Service
   - ✅ Accept Privacy Policy
3. Click "Register"
4. ✅ **Verify:** User is created and logged in
5. ✅ **Verify:** Redirected to onboarding or creator dashboard

#### Step 2: Creator Onboarding

1. If onboarding wizard appears, complete:
   - Upload avatar image
   - Upload header image
   - Set subscription price: `$9.99/month`
   - Enable AI autopilot: `Yes`
   - Upload first post (optional)
2. Click "Complete Onboarding"
3. ✅ **Verify:** Onboarding completed
4. ✅ **Verify:** Creator profile is active
5. ✅ **Verify:** AI persona settings saved

#### Step 3: Create Post

1. Navigate to Creator Dashboard → Posts
2. Click "Create New Post"
3. Fill in:
   - Title: `Test Post`
   - Body: `This is a test post for staging verification`
   - Visibility: `SUBSCRIBERS`
   - Upload media (image)
4. Click "Publish"
5. ✅ **Verify:** Post is created and visible in creator's posts list
6. ✅ **Verify:** Media file is uploaded and accessible via public URL
7. ✅ **Verify:** Post appears in creator's profile (for subscribers)

#### Step 4: Enable AI Autopilot

1. Navigate to Creator Dashboard → Settings → AI Persona
2. Enable "AI Autopilot"
3. Configure AI persona settings:
   - Tone: `Friendly`
   - Personality traits: `Funny, Engaging`
4. Save settings
5. ✅ **Verify:** AI autopilot is enabled
6. ✅ **Verify:** Settings saved in database

---

### Flow 2: Fan Sign-up → Subscribe → View Post → Send DM

#### Step 1: Fan Sign-up

1. Open incognito/private browser window
2. Visit `https://staging.novafans.com/register`
3. Fill in registration form:
   - Email: `fan-test@example.com`
   - Username: `fan-test`
   - Display Name: `Test Fan`
   - Password: `Test123!@#`
   - ✅ Confirm "I am 18+" checkbox
   - ✅ Accept Terms of Service
   - ✅ Accept Privacy Policy
4. Click "Register"
5. ✅ **Verify:** User is created and logged in
6. ✅ **Verify:** Redirected to home/feed

#### Step 2: Browse Creator

1. Navigate to `/u/creator-test` (or use creator discovery)
2. ✅ **Verify:** Creator profile page loads
3. ✅ **Verify:** Creator's subscription price displayed: `$9.99/month`
4. ✅ **Verify:** "Subscribe" button is visible

#### Step 3: Subscribe to Creator

1. Click "Subscribe" button
2. Select crypto payment method
3. ✅ **Verify:** Invoice is created
4. ✅ **Verify:** Payment URL is returned (or fake payment page in fake mode)
5. In staging with fake crypto mode:
   - Invoice status is PENDING
   - Can trigger test webhook to simulate payment
6. Trigger test webhook:
   ```bash
   curl -X POST https://api-staging.novafans.com/payments/crypto/test-webhook \
     -H "Content-Type: application/json" \
     -d '{
       "providerStatus": "PAID",
       "invoiceId": "<invoice-id-from-step-3>",
       "type": "SUBSCRIPTION",
       "amount": 9.99,
       "currency": "USDT"
     }'
   ```
7. ✅ **Verify:** Invoice status changes to PAID
8. ✅ **Verify:** Subscription is ACTIVE
9. ✅ **Verify:** Creator's `balancePending` increases
10. ✅ **Verify:** Transaction is COMPLETED

#### Step 4: View Subscriber-Only Post

1. Refresh creator profile page
2. ✅ **Verify:** Subscriber-only post is now visible
3. ✅ **Verify:** Post media loads correctly
4. ✅ **Verify:** Media URL is accessible (not localhost)

#### Step 5: Send DM to Creator

1. Navigate to Messages
2. Open or create conversation with creator
3. Send message: `Hello! This is a test message.`
4. ✅ **Verify:** Message is sent
5. ✅ **Verify:** If AI autopilot enabled, AI response is generated within 10 seconds
6. ✅ **Verify:** AI response is appropriate and matches creator persona
7. ✅ **Verify:** Conversation appears in both fan and creator message lists

---

### Flow 3: Admin Login → View Users → View Reports → View Crypto Status

#### Step 1: Admin Login

1. Use admin account credentials
2. Visit `https://staging.novafans.com/login`
3. Login with admin account
4. ✅ **Verify:** Login successful
5. ✅ **Verify:** Redirected to admin dashboard (or home if no separate admin route)

#### Step 2: View Users

1. Navigate to `/admin` (or admin dashboard)
2. Click "Users" section
3. ✅ **Verify:** List of users loads
4. ✅ **Verify:** Can see creator-test and fan-test users
5. ✅ **Verify:** User details display correctly:
   - Email
   - Username
   - Role
   - Registration date
   - Status (banned/active)

#### Step 3: Test User Ban

1. Find test user in list
2. Click "Ban User" (if available)
3. Fill in ban reason
4. Submit ban
5. ✅ **Verify:** User is marked as banned
6. ✅ **Verify:** User cannot login with banned account

#### Step 4: View Reports

1. Navigate to Admin → Reports
2. ✅ **Verify:** Reports list loads
3. ✅ **Verify:** Can view report details
4. ✅ **Verify:** Can mark reports as resolved/rejected

#### Step 5: View Crypto Status

1. Navigate to `/admin/crypto-status`
2. ✅ **Verify:** Crypto status page loads
3. ✅ **Verify:** Shows current crypto provider: `fake`
4. ✅ **Verify:** Shows configuration status:
   - API key: Not configured (expected for fake mode)
   - IPN secret: Not configured
   - Callback URL: Shows staging URL
5. ✅ **Verify:** Shows recent invoices (if any)
6. ✅ **Verify:** Shows test results summary (if validation was run)

#### Step 6: View Creator Payouts

1. Navigate to Admin → Payouts
2. ✅ **Verify:** Payout requests list loads
3. ✅ **Verify:** Can see creator balances
4. ✅ **Verify:** Can approve/reject payout requests
5. ✅ **Verify:** Balance updates correctly after approval

---

### Verification Commands

Run these commands to verify staging endpoints:

```bash
# API Health
curl https://api-staging.novafans.com/health
# Expected: {"status":"ok","db":"ok","redis":"ok","crypto":{...}}

# AI Health
curl https://ai-staging.novafans.com/health
# Expected: {"status":"ok","provider":"fake"}

# Web App
curl -I https://staging.novafans.com
# Expected: 200 OK

# Verify no localhost URLs in production build
curl https://staging.novafans.com | grep -i "localhost" || echo "✅ No localhost URLs found"
```

---

### Common Issues & Solutions

#### Issue: API calls failing from web app

**Check:**
- `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Value matches Railway API service URL
- No trailing slash in URL
- CORS allows staging web domain

**Solution:**
1. Verify env var in Vercel dashboard
2. Rebuild web app (env vars are build-time)
3. Check browser console for errors
4. Verify CORS settings in API service

#### Issue: Media files not loading

**Check:**
- `STORAGE_BASE_URL` matches `API_BASE_URL`
- Uploads directory exists and is writable
- Volume is mounted correctly (Railway)
- Media URLs use full domain (not localhost)

**Solution:**
1. Verify `STORAGE_BASE_URL` env var
2. Check Railway volume mount
3. Verify file uploads succeed
4. Check media URL format in database

#### Issue: Database connection errors

**Check:**
- `DATABASE_URL` is set correctly
- Database is accessible from Railway service
- Connection string format is correct

**Solution:**
1. Verify `DATABASE_URL` in Railway dashboard
2. Check Railway service logs
3. Verify database is running
4. Test connection manually

#### Issue: Crypto payments not working

**Check:**
- `CRYPTO_PROVIDER` is set correctly
- `CRYPTO_CALLBACK_BASE_URL` matches API URL
- Webhook URL is accessible
- Webhook secret matches provider configuration

**Solution:**
1. Verify all crypto env vars
2. Test webhook endpoint accessibility
3. Use test webhook endpoint to simulate payment
4. Check webhook logs in API service

---

## Environment Variables

For a complete, authoritative reference of all environment variables, see [`docs/ENVIRONMENT.md`](./docs/ENVIRONMENT.md).

### Quick Reference

**API Service (Railway):**
- Core: `NODE_ENV`, `PORT`, `API_BASE_URL`, `DATABASE_URL`, `REDIS_URL`
- Auth: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- Storage: `STORAGE_BASE_URL`, `UPLOADS_DIR`
- Crypto: `CRYPTO_PROVIDER`, `CRYPTO_API_KEY`, `CRYPTO_IPN_SECRET`, `CRYPTO_CALLBACK_BASE_URL`
- External: `FRONTEND_ORIGIN`, `AI_SERVICE_URL`

**AI Service (Railway):**
- Core: `NODE_ENV`, `PORT`, `AI_SERVICE_URL`
- LLM: `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`, `AI_MAX_TOKENS`, `AI_TEMPERATURE`

**Web App (Vercel):**
- Required: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_AI_SERVICE_URL`

---

## Domains & HTTPS

Railway and Vercel automatically provision SSL certificates for all custom domains. No manual certificate configuration is needed.

### DNS Configuration

**Staging:**
```
staging.novafans.com      CNAME    cname.vercel-dns.com
api-staging.novafans.com  CNAME    <railway-api-domain>
ai-staging.novafans.com   CNAME    <railway-ai-domain>
```

**Production:**
```
novafans.com              A        <vercel-ip> (or use Vercel nameservers)
www.novafans.com          CNAME    cname.vercel-dns.com
api.novafans.com          CNAME    <railway-api-domain>
ai.novafans.com           CNAME    <railway-ai-domain>
```

---

## Health Checks

Both API and AI services expose `/health` endpoints for monitoring.

### API Health Endpoint

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "db": "ok",
  "redis": "ok",
  "crypto": {
    "provider": "fake" | "nowpayments",
    "configured": true | false,
    "mode": "fake" | "real"
  }
}
```

### AI Health Endpoint

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "provider": "fake" | "openai",
  "model": "gpt-4o-mini" | undefined
}
```

### Railway Health Check Configuration

Configure in Railway service settings:
- **Path:** `/health`
- **Interval:** 30 seconds (default)
- **Timeout:** 10 seconds
- **Start Period:** 40 seconds
- **Retries:** 3

---

## Enabling Analytics

NovaFans supports Plausible and PostHog analytics. See [`docs/GROWTH.md`](./docs/GROWTH.md) for complete setup instructions.

### Quick Setup

**Plausible:**
```env
NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible
NEXT_PUBLIC_ANALYTICS_SITE_ID=novafans.com
```

**PostHog:**
```env
NEXT_PUBLIC_ANALYTICS_PROVIDER=posthog
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**Important:**
- Set these variables in Vercel dashboard before building
- Analytics is disabled if `NEXT_PUBLIC_ANALYTICS_PROVIDER` is not set (safe for development)
- For PostHog, install package: `cd apps/web && pnpm add posthog-js`

### Tracked Events

- Page views (automatic)
- Landing page CTAs (`landing_cta_creator`, `landing_cta_fan`)
- Registration events (`registration_complete`, `registration_failed`)
- Creator onboarding (`creator_onboarding_start`)
- Subscription started (frontend only)

---

## Crypto Payments Integration

See [`docs/CRYPTO.md`](./docs/CRYPTO.md) for complete crypto payment system documentation.

### Quick Setup

**Staging (Fake Mode):**
```env
CRYPTO_PROVIDER=fake
# No API key needed
```

**Production (Real Mode):**
```env
CRYPTO_PROVIDER=nowpayments
CRYPTO_API_KEY=your-api-key
CRYPTO_IPN_SECRET=your-webhook-secret
CRYPTO_CALLBACK_BASE_URL=https://api.novafans.com
CRYPTO_DEFAULT_CURRENCY=USDT
CRYPTO_MIN_AMOUNT=1.0
```

**Webhook URL:** `https://api.novafans.com/payments/crypto/webhook`

---

## Final Sanity Checklist

Use this checklist before promoting staging to production:

### Infrastructure

- [ ] All Railway services deployed and healthy
- [ ] All Vercel deployments successful
- [ ] Custom domains configured and SSL active
- [ ] Database migrations run successfully
- [ ] Redis connected and working
- [ ] Persistent volumes mounted correctly

### Environment Variables

- [ ] All required env vars set in Railway
- [ ] All required env vars set in Vercel
- [ ] No localhost URLs in production env vars
- [ ] JWT secrets are strong and unique
- [ ] Crypto webhook secret is strong and unique

### Health Checks

- [ ] API health endpoint returns `{"status":"ok"}`
- [ ] AI health endpoint returns `{"status":"ok"}`
- [ ] Web app loads without errors
- [ ] No console errors in browser

### Functionality

- [ ] Users can register and login
- [ ] Creators can complete onboarding
- [ ] Posts can be created and viewed
- [ ] Subscriptions work (crypto payment flow)
- [ ] Messages work (with AI autopilot)
- [ ] Media uploads work
- [ ] Admin panel accessible
- [ ] Reports system works
- [ ] Payouts system works

### Security

- [ ] HTTPS enabled on all domains
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] No secrets in logs or code
- [ ] Database backups enabled

### Documentation

- [ ] DEPLOYMENT.md updated
- [ ] ENVIRONMENT.md updated
- [ ] Team has access to deployment platforms
- [ ] Runbooks documented

---

## Next Steps After Deployment

1. **Set up monitoring** (Sentry, DataDog, etc.)
2. **Configure alerts** for service failures
3. **Enable database backups** (Railway provides automatic backups)
4. **Set up analytics** (PostHog, Mixpanel, etc.)
5. **Monitor AI usage and costs** in OpenAI dashboard
6. **Test crypto payment flow** with real provider test mode
7. **Set up staging → production promotion process**

---

## Support

For issues or questions:
- [`README.md`](./README.md) for general setup
- [`docs/ENVIRONMENT.md`](./docs/ENVIRONMENT.md) for environment variables
- [`docs/CRYPTO.md`](./docs/CRYPTO.md) for crypto payments
- [`docs/SEO.md`](./docs/SEO.md) for SEO pages
- [`docs/TELEGRAM_BOT.md`](./docs/TELEGRAM_BOT.md) for Telegram bot
