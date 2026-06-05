# Railway Deployment — All-in-One

Deploy NovaFans (frontend + backend + PostgreSQL) on a single Railway project.

---

## Step-by-Step

### 1. Create Railway project
1. Go to **https://railway.app/new**
2. Click **"Deploy from GitHub repo"** → authorise GitHub if needed
3. Select **`vashonakexander-netizen/-novafans`**
4. Railway will detect the monorepo and ask which to deploy — **skip for now**, we'll add services manually

### 2. Add PostgreSQL
1. In the Railway project, click **"+ New" → Database → PostgreSQL**
2. Wait ~30 seconds for it to provision
3. Click on the Postgres service → **Variables** tab
4. Copy the **`DATABASE_URL`** value (we'll paste it into the API service shortly)

### 3. Add API service
1. Click **"+ New" → GitHub Repo → select novafans**
2. In the new service settings:
   - **Settings → Service → Root Directory**: `apps/api`
   - **Settings → Build → Build Command**: (leave empty — uses Nixpacks default)
   - **Settings → Deploy → Start Command**: `pnpm start:prod`
3. Go to **Variables tab** and paste:
   ```
   POSTGRES_URL=<paste-DATABASE_URL-from-postgres-service>
   JWT_ACCESS_SECRET=<generate-below>
   JWT_REFRESH_SECRET=<generate-below>
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   ANTHROPIC_API_KEY=<your-sk-ant-key>
   FRONTEND_ORIGIN=https://<will-set-after-frontend-deploys>
   NODE_ENV=production
   ```

   **Generate JWT secrets locally:**
   ```bash
   openssl rand -base64 48
   openssl rand -base64 48
   ```
   Run twice, paste each output as `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.

4. Go to **Settings → Networking → Generate Domain** — copy the API URL (e.g. `https://api-production-xxxx.up.railway.app`)

5. Click **Deploy** — first build takes ~3 minutes

### 4. Add Web service
1. Click **"+ New" → GitHub Repo → same novafans repo**
2. Settings:
   - **Root Directory**: `apps/web`
   - **Start Command**: `pnpm start`
3. **Variables** tab:
   ```
   NEXT_PUBLIC_API_URL=<the-api-railway-url-from-step-3>
   NEXT_PUBLIC_APP_URL=https://<placeholder-update-after-domain-generated>
   STRIPE_SECRET_KEY=<your-sk_test_-key>
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-pk_test_-key>
   ANTHROPIC_API_KEY=<your-sk-ant-key>
   NODE_ENV=production
   ```
4. Go to **Settings → Networking → Generate Domain** — copy the web URL
5. Go back and update:
   - **Web service `NEXT_PUBLIC_APP_URL`** = the web URL you just generated
   - **API service `FRONTEND_ORIGIN`** = the web URL
6. Both services will redeploy automatically on env change

### 5. Stripe Webhook
1. Stripe Dashboard → Developers → Webhooks → **Add endpoint**
2. URL: `https://<your-web-url>/api/stripe/webhook`
3. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. After creation, click the webhook → reveal **Signing secret** (`whsec_...`)
5. Add to web service env vars: `STRIPE_WEBHOOK_SECRET=whsec_...`
6. Web service redeploys

### 6. Seed demo data (optional)
SSH into the API service via Railway CLI, or use the database URL locally:
```bash
cd apps/api
POSTGRES_URL="<railway-postgres-url>" npx ts-node prisma/seed-demo.ts
```

This creates:
- Demo agency: `demo-agency@novafans.app` / `DemoPass123!`
- 3 sample creators (Sofia, Luna, Aria)
- Sample messages, products, templates

### 7. Smoke test
- Visit the web URL → landing page loads ✅
- Click "Get Started" → register a new AGENCY account
- Land on `/agency` → dashboard renders
- Visit one of the demo creator slugs to see the public fan page

### 8. Custom domain (optional, when ready)
- Railway web service → Settings → Domains → Add custom domain
- Update DNS as instructed (CNAME)
- Update `NEXT_PUBLIC_APP_URL` and `FRONTEND_ORIGIN` to the custom domain
- Update Stripe webhook URL to the custom domain

---

## Going Live with Real Money

When ready to accept real payments:
1. Stripe Dashboard → toggle from **Test mode** to **Live mode**
2. Get new live keys (`sk_live_...`, `pk_live_...`)
3. Update Railway web service env vars
4. Create a new webhook on live mode (steps 5.1-5.5 again)
5. Update `STRIPE_WEBHOOK_SECRET` with the new live webhook secret
6. Done — site now accepts real payments

---

## Troubleshooting

**Build fails on Railway:**
- Check the build logs — usually missing env var or pnpm cache issue
- Try clearing the Nixpacks cache: Settings → "Clear Cache" → redeploy

**"Database connection refused":**
- Make sure `POSTGRES_URL` is the **internal** Railway URL (uses `.railway.internal` host)
- Or use the public URL if you've enabled it — slower but works

**"CORS error from frontend":**
- `FRONTEND_ORIGIN` on the API service must exactly match your web URL (with `https://`, no trailing slash)

**"Stripe webhook signature failed":**
- Make sure the webhook URL in Stripe matches your web service URL exactly
- The `STRIPE_WEBHOOK_SECRET` should start with `whsec_`
