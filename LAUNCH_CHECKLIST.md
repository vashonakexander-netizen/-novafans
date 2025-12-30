# NovaFans Launch Checklist

This document provides a step-by-step checklist for launching NovaFans from local development through staging to production.

**Last Updated:** 2024-01-XX

---

## Pre-Launch (Local Validation)

Complete these steps locally before deploying to staging or production.

### Code & Build Validation

- [ ] **Run build validation:**
  ```bash
  pnpm validate:build
  ```
  - Verifies all packages build successfully
  - Checks TypeScript compilation
  - Confirms no build errors

- [ ] **Run local validation:**
  ```bash
  pnpm validate:local
  ```
  - Installs dependencies
  - Builds all packages
  - Starts Docker (Postgres + Redis)
  - Runs Prisma migrations
  - Starts dev servers
  - Validates API and AI health endpoints

- [ ] **Run crypto validation:**
  ```bash
  pnpm validate:crypto
  ```
  - Tests crypto payment system
  - Validates webhook handling
  - Generates `CRYPTO_STATUS.html` report

### Local Testing

- [ ] **Test creator flow locally:**
  - [ ] Sign up as creator (`/register?role=CREATOR`)
  - [ ] Complete onboarding wizard
  - [ ] Create a post
  - [ ] Enable AI autopilot
  - [ ] Verify creator dashboard loads

- [ ] **Test fan flow locally:**
  - [ ] Sign up as fan (`/register?role=FAN`)
  - [ ] Browse creators (`/creators`)
  - [ ] View creator profile (`/u/[username]`)
  - [ ] Subscribe to creator (fake crypto mode)
  - [ ] View subscriber-only post
  - [ ] Send DM to creator
  - [ ] Verify AI autopilot responds (if enabled)

- [ ] **Test admin flow locally:**
  - [ ] Login as admin user
  - [ ] Access admin dashboard (`/admin`)
  - [ ] View users list
  - [ ] View reports
  - [ ] View crypto status (`/admin/crypto-status`)
  - [ ] Test payout workflow (if applicable)

- [ ] **Test marketing pages locally:**
  - [ ] Landing page (`/`) loads correctly
  - [ ] `/for-creators` page loads and CTAs work
  - [ ] `/for-fans` page loads and CTAs work
  - [ ] `/pricing` page loads and CTAs work
  - [ ] `/help` page loads with FAQ content
  - [ ] Footer navigation works on all pages
  - [ ] All CTAs link to correct registration flows

- [ ] **Test analytics locally:**
  - [ ] Open browser console in dev mode
  - [ ] Navigate between pages
  - [ ] Click CTAs on marketing pages
  - [ ] Verify `[Analytics]` logs appear in console
  - [ ] Verify no errors in console

### Documentation Review

- [ ] **Review deployment documentation:**
  - [ ] Read `DEPLOYMENT.md` completely
  - [ ] Understand Railway setup process
  - [ ] Understand Vercel setup process
  - [ ] Note all required environment variables

- [ ] **Review environment variables:**
  - [ ] Read `docs/ENVIRONMENT.md`
  - [ ] Understand all required variables
  - [ ] Prepare production secrets (JWT, crypto, etc.)

- [ ] **Review analytics setup:**
  - [ ] Read `docs/GROWTH.md`
  - [ ] Choose analytics provider (Plausible or PostHog)
  - [ ] Prepare analytics credentials

- [ ] **Review crypto setup:**
  - [ ] Read `docs/CRYPTO.md`
  - [ ] Decide on fake vs real crypto mode for staging
  - [ ] Prepare crypto provider credentials (if using real mode)

### Pre-Deployment Preparation

- [ ] **Generate strong secrets:**
  ```bash
  # JWT secrets (32+ characters)
  openssl rand -base64 32
  
  # Crypto webhook secret (if using real crypto)
  openssl rand -hex 32
  ```

- [ ] **Prepare domain names:**
  - [ ] Staging domain: `staging.novafans.com` (or your choice)
  - [ ] Production domain: `novafans.com` (or your choice)
  - [ ] API subdomain: `api.novafans.com`
  - [ ] AI subdomain: `ai.novafans.com`

- [ ] **Prepare Railway account:**
  - [ ] Create Railway account (https://railway.app)
  - [ ] Connect GitHub repository
  - [ ] Verify billing/plan setup

- [ ] **Prepare Vercel account:**
  - [ ] Create Vercel account (https://vercel.com)
  - [ ] Connect GitHub repository
  - [ ] Verify billing/plan setup

- [ ] **Prepare analytics account:**
  - [ ] Create Plausible account OR PostHog account
  - [ ] Get site ID (Plausible) or API key (PostHog)
  - [ ] Note host URL (if self-hosted PostHog)

---

## Staging Launch

Deploy and test NovaFans in a staging environment before production.

### Railway Setup (Backend)

- [ ] **Create Railway project:**
  - [ ] Go to https://railway.app
  - [ ] Click "New Project" → "Deploy from GitHub repo"
  - [ ] Select `novafans` repository
  - [ ] Name: `novafans-staging`

- [ ] **Add managed services:**
  - [ ] Add PostgreSQL database
  - [ ] Note `DATABASE_URL` from Railway
  - [ ] Add Redis database
  - [ ] Note `REDIS_URL` from Railway

- [ ] **Deploy API service:**
  - [ ] Create new service: `novafans-api-staging`
  - [ ] Set Dockerfile path: `apps/api/Dockerfile`
  - [ ] Set port: `3001`
  - [ ] Configure environment variables (see `DEPLOYMENT.md` Staging section):
    - [ ] `NODE_ENV=staging`
    - [ ] `PORT=3001`
    - [ ] `API_BASE_URL=https://api-staging.novafans.com`
    - [ ] `DATABASE_URL=${{Postgres.DATABASE_URL}}`
    - [ ] `REDIS_URL=${{Redis.REDIS_URL}}`
    - [ ] `JWT_ACCESS_SECRET=<your-staging-secret>`
    - [ ] `JWT_REFRESH_SECRET=<your-staging-secret>`
    - [ ] `FRONTEND_ORIGIN=https://staging.novafans.com`
    - [ ] `AI_SERVICE_URL=https://ai-staging.novafans.com`
    - [ ] `STORAGE_BASE_URL=https://api-staging.novafans.com`
    - [ ] `UPLOADS_DIR=/data/uploads`
    - [ ] `CRYPTO_PROVIDER=fake` (or real if testing)
    - [ ] `CRYPTO_CALLBACK_BASE_URL=https://api-staging.novafans.com`
  - [ ] Add persistent volume: `/data/uploads`
  - [ ] Deploy service

- [ ] **Deploy AI service:**
  - [ ] Create new service: `novafans-ai-staging`
  - [ ] Set Dockerfile path: `apps/ai/Dockerfile`
  - [ ] Set port: `3002`
  - [ ] Configure environment variables:
    - [ ] `NODE_ENV=staging`
    - [ ] `PORT=3002`
    - [ ] `AI_SERVICE_URL=https://ai-staging.novafans.com`
    - [ ] `AI_PROVIDER=fake` (or `openai` if testing)
    - [ ] `AI_API_KEY=<your-key>` (if using OpenAI)
  - [ ] Deploy service

- [ ] **Run database migrations:**
  ```bash
  railway run --service novafans-api-staging pnpm prisma:migrate deploy
  ```
  - [ ] Verify migrations completed successfully
  - [ ] Check for any migration errors

- [ ] **Configure custom domains:**
  - [ ] API service: Add domain `api-staging.novafans.com`
  - [ ] AI service: Add domain `ai-staging.novafans.com`
  - [ ] Update DNS records (CNAME to Railway domains)
  - [ ] Wait for SSL certificates to provision

- [ ] **Verify health endpoints:**
  ```bash
  curl https://api-staging.novafans.com/health
  # Expected: {"status":"ok","db":"ok","redis":"ok",...}
  
  curl https://ai-staging.novafans.com/health
  # Expected: {"status":"ok","provider":"fake",...}
  ```

### Vercel Setup (Frontend)

- [ ] **Create Vercel project:**
  - [ ] Go to https://vercel.com
  - [ ] Click "Add New Project"
  - [ ] Import `novafans` repository
  - [ ] Configure:
    - [ ] Framework: Next.js (auto-detected)
    - [ ] Root Directory: `apps/web`
    - [ ] Build Command: `pnpm install && pnpm build`
    - [ ] Output Directory: `.next`

- [ ] **Set environment variables:**
  - [ ] `NEXT_PUBLIC_API_URL=https://api-staging.novafans.com`
  - [ ] `NEXT_PUBLIC_AI_SERVICE_URL=https://ai-staging.novafans.com`
  - [ ] `NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible` (or `posthog`)
  - [ ] `NEXT_PUBLIC_ANALYTICS_SITE_ID=<your-site-id>` (if Plausible)
  - [ ] `NEXT_PUBLIC_POSTHOG_KEY=<your-key>` (if PostHog)
  - [ ] `NEXT_PUBLIC_POSTHOG_HOST=<your-host>` (if PostHog, optional)

- [ ] **Configure domain:**
  - [ ] Add domain: `staging.novafans.com`
  - [ ] Update DNS (CNAME to Vercel)
  - [ ] Wait for SSL certificate

- [ ] **Deploy:**
  - [ ] Trigger deployment
  - [ ] Verify build succeeds
  - [ ] Check deployment logs for errors

### Staging Testing

- [ ] **Test creator flow on staging:**
  - [ ] Visit `https://staging.novafans.com`
  - [ ] Click "Become a Creator"
  - [ ] Sign up as creator
  - [ ] Complete onboarding wizard
  - [ ] Create a post
  - [ ] Enable AI autopilot
  - [ ] Verify creator dashboard works

- [ ] **Test fan flow on staging:**
  - [ ] Open incognito window
  - [ ] Visit `https://staging.novafans.com`
  - [ ] Sign up as fan
  - [ ] Browse creators
  - [ ] Subscribe to creator (test crypto payment if enabled)
  - [ ] View subscriber-only post
  - [ ] Send DM to creator
  - [ ] Verify AI autopilot responds

- [ ] **Test admin flow on staging:**
  - [ ] Login as admin
  - [ ] Access `/admin` dashboard
  - [ ] View users list
  - [ ] View reports
  - [ ] View crypto status (`/admin/crypto-status`)
  - [ ] Test payout workflow

- [ ] **Test marketing pages on staging:**
  - [ ] Landing page loads correctly
  - [ ] All marketing pages accessible
  - [ ] All CTAs link correctly
  - [ ] Footer navigation works
  - [ ] No console errors

- [ ] **Test analytics on staging:**
  - [ ] Visit analytics dashboard (Plausible/PostHog)
  - [ ] Navigate staging site
  - [ ] Click CTAs
  - [ ] Verify events appear in analytics dashboard
  - [ ] Verify page views are tracking

- [ ] **Test crypto payments on staging (if real mode):**
  - [ ] Configure crypto provider webhook URL
  - [ ] Test subscription payment flow
  - [ ] Test tip payment flow
  - [ ] Verify webhook processing
  - [ ] Verify balance updates

### Staging Verification

- [ ] **Run staging E2E checklist:**
  - [ ] Follow complete E2E checklist from `DEPLOYMENT.md`
  - [ ] Verify all flows work end-to-end
  - [ ] Document any issues found

- [ ] **Performance check:**
  - [ ] Page load times acceptable
  - [ ] API response times acceptable
  - [ ] Media uploads work
  - [ ] No memory leaks or crashes

- [ ] **Security check:**
  - [ ] HTTPS enabled on all domains
  - [ ] No secrets in logs
  - [ ] CORS configured correctly
  - [ ] Rate limiting active

---

## Production Launch

Deploy NovaFans to production after successful staging validation.

### Railway Setup (Backend)

- [ ] **Create Railway project:**
  - [ ] Go to https://railway.app
  - [ ] Click "New Project" → "Deploy from GitHub repo"
  - [ ] Select `novafans` repository
  - [ ] Name: `novafans-production`

- [ ] **Add managed services:**
  - [ ] Add PostgreSQL database
  - [ ] Enable automatic backups
  - [ ] Note `DATABASE_URL` from Railway
  - [ ] Add Redis database
  - [ ] Note `REDIS_URL` from Railway

- [ ] **Deploy API service:**
  - [ ] Create new service: `novafans-api`
  - [ ] Set Dockerfile path: `apps/api/Dockerfile`
  - [ ] Set port: `3001`
  - [ ] Set branch: `main` (or your production branch)
  - [ ] Configure environment variables (see `DEPLOYMENT.md` Production section):
    - [ ] `NODE_ENV=production`
    - [ ] `PORT=3001`
    - [ ] `API_BASE_URL=https://api.novafans.com`
    - [ ] `DATABASE_URL=${{Postgres.DATABASE_URL}}`
    - [ ] `REDIS_URL=${{Redis.REDIS_URL}}`
    - [ ] `JWT_ACCESS_SECRET=<strong-production-secret>`
    - [ ] `JWT_REFRESH_SECRET=<strong-production-secret>`
    - [ ] `FRONTEND_ORIGIN=https://novafans.com`
    - [ ] `AI_SERVICE_URL=https://ai.novafans.com`
    - [ ] `STORAGE_BASE_URL=https://api.novafans.com`
    - [ ] `UPLOADS_DIR=/data/uploads`
    - [ ] `CRYPTO_PROVIDER=nowpayments` (or your provider)
    - [ ] `CRYPTO_API_KEY=<your-production-key>`
    - [ ] `CRYPTO_IPN_SECRET=<your-production-secret>`
    - [ ] `CRYPTO_CALLBACK_BASE_URL=https://api.novafans.com`
    - [ ] `CRYPTO_DEFAULT_CURRENCY=USDT`
    - [ ] `CRYPTO_MIN_AMOUNT=1.0`
  - [ ] Add persistent volume: `/data/uploads`
  - [ ] Configure health check: Path `/health`, Interval 30s
  - [ ] Deploy service

- [ ] **Deploy AI service:**
  - [ ] Create new service: `novafans-ai`
  - [ ] Set Dockerfile path: `apps/ai/Dockerfile`
  - [ ] Set port: `3002`
  - [ ] Set branch: `main` (or your production branch)
  - [ ] Configure environment variables:
    - [ ] `NODE_ENV=production`
    - [ ] `PORT=3002`
    - [ ] `AI_SERVICE_URL=https://ai.novafans.com`
    - [ ] `AI_PROVIDER=openai`
    - [ ] `AI_API_KEY=<your-openai-key>`
    - [ ] `AI_MODEL=gpt-4o-mini`
    - [ ] `AI_MAX_TOKENS=512`
    - [ ] `AI_TEMPERATURE=0.7`
  - [ ] Configure health check: Path `/health`, Interval 30s
  - [ ] Deploy service

- [ ] **Run database migrations:**
  ```bash
  railway run --service novafans-api pnpm prisma:migrate deploy
  ```
  - [ ] Verify migrations completed successfully
  - [ ] Check migration status: `railway run --service novafans-api pnpm prisma:migrate status`

- [ ] **Configure custom domains:**
  - [ ] API service: Add domain `api.novafans.com`
  - [ ] AI service: Add domain `ai.novafans.com`
  - [ ] Update DNS records (CNAME to Railway domains)
  - [ ] Wait for SSL certificates to provision (may take a few minutes)

- [ ] **Configure crypto webhook (if using real crypto):**
  - [ ] Log into crypto payment provider dashboard
  - [ ] Navigate to Webhooks/IPN settings
  - [ ] Add webhook URL: `https://api.novafans.com/payments/crypto/webhook`
  - [ ] Set webhook secret to match `CRYPTO_IPN_SECRET`
  - [ ] Enable notifications for: payment confirmed, expired, canceled
  - [ ] Test webhook (if provider supports test mode)

- [ ] **Verify health endpoints:**
  ```bash
  curl https://api.novafans.com/health
  # Expected: {"status":"ok","db":"ok","redis":"ok","crypto":{...}}
  
  curl https://ai.novafans.com/health
  # Expected: {"status":"ok","provider":"openai","model":"gpt-4o-mini"}
  ```

### Vercel Setup (Frontend)

- [ ] **Create Vercel project:**
  - [ ] Go to https://vercel.com
  - [ ] Click "Add New Project"
  - [ ] Import `novafans` repository
  - [ ] Configure:
    - [ ] Framework: Next.js (auto-detected)
    - [ ] Root Directory: `apps/web`
    - [ ] Build Command: `pnpm install && pnpm build`
    - [ ] Output Directory: `.next`
    - [ ] Production Branch: `main` (or your production branch)

- [ ] **Set environment variables:**
  - [ ] `NEXT_PUBLIC_API_URL=https://api.novafans.com`
  - [ ] `NEXT_PUBLIC_AI_SERVICE_URL=https://ai.novafans.com`
  - [ ] `NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible` (or `posthog`)
  - [ ] `NEXT_PUBLIC_ANALYTICS_SITE_ID=<your-production-site-id>` (if Plausible)
  - [ ] `NEXT_PUBLIC_POSTHOG_KEY=<your-production-key>` (if PostHog)
  - [ ] `NEXT_PUBLIC_POSTHOG_HOST=<your-host>` (if PostHog, optional)

- [ ] **Configure domains:**
  - [ ] Add domain: `novafans.com` (root)
  - [ ] Add domain: `www.novafans.com` (optional)
  - [ ] Update DNS records
  - [ ] Wait for SSL certificates

- [ ] **Deploy:**
  - [ ] Trigger deployment
  - [ ] Verify build succeeds
  - [ ] Check deployment logs
  - [ ] Verify no build errors

### Production Testing

- [ ] **Test creator flow on production:**
  - [ ] Visit `https://novafans.com`
  - [ ] Click "Become a Creator"
  - [ ] Sign up as creator
  - [ ] Complete onboarding wizard
  - [ ] Create a post
  - [ ] Enable AI autopilot
  - [ ] Verify creator dashboard works
  - [ ] Verify media uploads work

- [ ] **Test fan flow on production:**
  - [ ] Open incognito window
  - [ ] Visit `https://novafans.com`
  - [ ] Sign up as fan
  - [ ] Browse creators
  - [ ] Subscribe to creator (test with real crypto payment if enabled)
  - [ ] View subscriber-only post
  - [ ] Send DM to creator
  - [ ] Verify AI autopilot responds

- [ ] **Test admin flow on production:**
  - [ ] Login as admin
  - [ ] Access `/admin` dashboard
  - [ ] View users list
  - [ ] View reports
  - [ ] View crypto status (`/admin/crypto-status`)
  - [ ] Test payout workflow

- [ ] **Test marketing pages on production:**
  - [ ] Landing page loads correctly
  - [ ] All marketing pages accessible
  - [ ] All CTAs link correctly
  - [ ] Footer navigation works
  - [ ] No console errors
  - [ ] All images load correctly
  - [ ] Mobile responsive design works

- [ ] **Test analytics on production:**
  - [ ] Visit analytics dashboard (Plausible/PostHog)
  - [ ] Navigate production site
  - [ ] Click CTAs on marketing pages
  - [ ] Verify events appear in analytics dashboard
  - [ ] Verify page views are tracking
  - [ ] Verify conversion events are tracking

- [ ] **Test crypto payments on production (if enabled):**
  - [ ] Test subscription payment with real crypto
  - [ ] Test tip payment with real crypto
  - [ ] Verify webhook processing
  - [ ] Verify balance updates
  - [ ] Verify invoice creation
  - [ ] Test with low-value payment first

### Production Verification

- [ ] **Run production E2E checklist:**
  - [ ] Follow complete E2E checklist from `DEPLOYMENT.md`
  - [ ] Verify all flows work end-to-end
  - [ ] Document any issues found

- [ ] **Performance check:**
  - [ ] Page load times acceptable (< 3s)
  - [ ] API response times acceptable (< 500ms)
  - [ ] Media uploads work
  - [ ] No memory leaks or crashes
  - [ ] Check Core Web Vitals (if available)

- [ ] **Security check:**
  - [ ] HTTPS enabled on all domains
  - [ ] SSL certificates valid
  - [ ] No secrets in logs
  - [ ] CORS configured correctly
  - [ ] Rate limiting active
  - [ ] Database backups enabled

- [ ] **Monitoring setup:**
  - [ ] Set up error tracking (Sentry, etc.)
  - [ ] Set up uptime monitoring
  - [ ] Configure alerts for service failures
  - [ ] Set up log aggregation

### Post-Launch

- [ ] **Monitor first 24 hours:**
  - [ ] Check error logs
  - [ ] Monitor analytics for traffic
  - [ ] Verify no critical errors
  - [ ] Check database performance
  - [ ] Monitor API response times

- [ ] **Verify key metrics:**
  - [ ] Landing page → Registration conversion rate
  - [ ] Creator vs Fan signup ratio
  - [ ] Onboarding completion rate
  - [ ] Subscription start rate (if applicable)
  - [ ] Payment success rate (if applicable)

- [ ] **Documentation:**
  - [ ] Update `LAUNCH_CHECKLIST.md` with any issues found
  - [ ] Document any production-specific configurations
  - [ ] Update team on launch status

---

## Quick Reference

### Key Documentation

- **Deployment Guide:** [`DEPLOYMENT.md`](./DEPLOYMENT.md)
- **Environment Variables:** [`docs/ENVIRONMENT.md`](./docs/ENVIRONMENT.md)
- **Analytics Setup:** [`docs/GROWTH.md`](./docs/GROWTH.md)
- **Crypto Payments:** [`docs/CRYPTO.md`](./docs/CRYPTO.md)
- **SEO Guide:** [`docs/SEO.md`](./docs/SEO.md)
- **Telegram Bot:** [`docs/TELEGRAM_BOT.md`](./docs/TELEGRAM_BOT.md)

### Validation Commands

```bash
# Build validation
pnpm validate:build

# Local validation (requires Docker)
pnpm validate:local

# Crypto validation
pnpm validate:crypto
```

### Health Endpoints

- API: `https://api.novafans.com/health`
- AI: `https://ai.novafans.com/health`

### Support

For issues or questions:
- Check [`DEPLOYMENT.md`](./DEPLOYMENT.md) for deployment troubleshooting
- Check [`docs/ENVIRONMENT.md`](./docs/ENVIRONMENT.md) for environment variable issues
- Check [`docs/GROWTH.md`](./docs/GROWTH.md) for analytics issues
- Review error logs in Railway and Vercel dashboards

---

## Notes

- **Staging First:** Always deploy and test in staging before production
- **Backup Secrets:** Store all production secrets securely (password manager, etc.)
- **Monitor Closely:** Watch logs and metrics closely during first 24-48 hours
- **Document Issues:** Keep notes on any issues encountered and how they were resolved
- **Team Access:** Ensure team members have access to Railway, Vercel, and analytics dashboards

---

**Status:** ✅ Ready for Launch

Complete all checkboxes in order, and NovaFans will be ready for production use.


