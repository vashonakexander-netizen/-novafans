# NovaFans Launch Guide

Quick-start guide to take NovaFans from local development to a live, advertisable product.

## What's Built

✅ Full agency management platform
✅ Multi-client dashboard with color-coded sidebar
✅ Media vault with drag-drop upload + approval workflow
✅ AI inbox with Claude-powered draft generation + confidence scoring
✅ Content scheduler with calendar UI
✅ Per-client analytics (Recharts)
✅ Cross-client revenue dashboard
✅ Public fan pages with Stripe subscriptions (Free/Premium/VIP), digital shop, and tips
✅ Model upload dashboard
✅ Fan dashboard
✅ Role-based route protection (AGENCY/MODEL/FAN)
✅ Dark theme throughout
✅ 50 routes, production build passing, zero errors

## 5 Things You Need Before You Can Advertise

1. **Stripe account** — Get from https://stripe.com → Developers → API keys
   - Test mode keys to start, switch to live before launch
2. **Anthropic API key** — Get from https://console.anthropic.com
   - The AI inbox draft generation uses `claude-sonnet-4-20250514`
3. **PostgreSQL database** — Local or hosted (Railway/Supabase/Neon)
4. **A domain** — e.g. novafans.app, novafans.com
5. **Hosting** — Vercel (frontend) + Railway/Render (backend) recommended

## Local Quick Start

```bash
# 1. Install dependencies
cd /Users/vash/novafans
pnpm install

# 2. Set up the database
psql -d postgres -c "CREATE USER novafans WITH PASSWORD 'novafans' CREATEDB;"
createdb -O novafans novafans
cd apps/api && npx prisma migrate deploy

# 3. Configure env vars
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Edit apps/api/.env:
#   POSTGRES_URL=postgresql://novafans:novafans@localhost:5432/novafans
#   JWT_ACCESS_SECRET=$(openssl rand -base64 32)
#   JWT_REFRESH_SECRET=$(openssl rand -base64 32)
#   ANTHROPIC_API_KEY=sk-ant-...

# Edit apps/web/.env.local:
#   NEXT_PUBLIC_API_URL=http://localhost:3001
#   STRIPE_SECRET_KEY=sk_test_...
#   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
#   STRIPE_WEBHOOK_SECRET=whsec_...
#   ANTHROPIC_API_KEY=sk-ant-...

# 4. Start the backend
cd apps/api && pnpm start:dev

# 5. Start the frontend (new terminal)
cd apps/web && pnpm dev

# 6. Visit http://localhost:3000
```

## Production Deployment (Vercel + Railway)

### Backend → Railway
1. https://railway.app → New Project → Deploy from GitHub
2. Root directory: `apps/api`
3. Add environment variables (see local quickstart)
4. Provision PostgreSQL addon, copy `POSTGRES_URL`
5. Build command: `pnpm install && pnpm --filter api build && npx prisma migrate deploy`
6. Start command: `pnpm --filter api start:prod`

### Frontend → Vercel
1. https://vercel.com → Import Project
2. Root directory: `apps/web`
3. Framework: Next.js
4. Add env vars (all the same plus `NEXT_PUBLIC_APP_URL=https://yourdomain.com`)
5. Deploy

### Stripe Webhook
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://yourdomain.com/api/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy signing secret → set `STRIPE_WEBHOOK_SECRET` in Vercel → redeploy

## Smoke Test Before Advertising

- [ ] Landing page loads at your domain
- [ ] Register a test AGENCY account
- [ ] Add a creator client with a unique slug
- [ ] Visit `/{slug}` — fan page should render with sub tiers
- [ ] Click Subscribe → Stripe Checkout opens (test card: `4242 4242 4242 4242`)
- [ ] Register a test FAN account → log in → land on `/fan` dashboard
- [ ] Register a test MODEL account → log in → land on `/model` dashboard
- [ ] Upload a file in the agency vault — should appear in the grid
- [ ] Generate an AI draft in the inbox (requires a message record in DB)

## Marketing Launch Checklist

- [ ] Update branding contact emails (`support@`, `legal@`, `privacy@` → your domain)
- [ ] Set up Stripe in **live** mode and update API keys
- [ ] Create a Plausible or PostHog account for analytics
- [ ] Set up Sentry for error monitoring
- [ ] Write your first blog/announcement post
- [ ] Set up `/help` content with real FAQs based on early-user questions
- [ ] Create social media accounts (Twitter, Instagram, TikTok)
- [ ] Prepare 3-5 demo creator profiles to seed `/creators` browse page
- [ ] Configure email transactional service (SendGrid, Resend) for password resets
- [ ] Privacy + Terms pages reviewed by legal
- [ ] DMCA agent registered (US law requirement for UGC platforms)
- [ ] Acceptable use policy reviewed
- [ ] Tax/payout configuration for creators (Stripe Connect for multi-party payouts)

## Key Files

- `apps/web/src/app/(marketing)/page.tsx` — Landing page
- `apps/web/src/app/agency/*` — Agency dashboard
- `apps/web/src/app/[modelslug]/page.tsx` — Public fan page
- `apps/web/src/middleware.ts` — Role-based route protection
- `apps/api/src/agency/*` — Agency NestJS module (controllers, services)
- `apps/api/prisma/schema.prisma` — Database schema

---

You're 1-2 days away from launch. Get those env vars and DNS configured, run the smoke test, then start telling people.
