# NovaFans Environment Variables Reference

This document provides an authoritative reference for all environment variables used in NovaFans across different services.

**Note:** All variables are case-sensitive. Use the exact names provided below.

---

## API Service (Railway/Container)

These variables are used by `getApiConfig()` in `@novafans/config`.

### Core Configuration

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `NODE_ENV` | No | `development` | Node environment (`development`, `production`, `test`) | `production` |
| `PORT` | No | `3001` | Port for API server to listen on | `3001` |
| `API_BASE_URL` | No | `http://localhost:3001` | Public URL of the API service | `https://api.novafans.com` |
| `FRONTEND_ORIGIN` | No | `http://localhost:3000` | Allowed CORS origin (web app URL) | `https://novafans.com` |

### Database

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `DATABASE_URL` | **Yes** | - | PostgreSQL connection string (Railway provides this) | `postgresql://user:pass@host:5432/db` |
| `POSTGRES_URL` | No* | - | Alias for `DATABASE_URL` (fallback if `DATABASE_URL` not set) | Same as `DATABASE_URL` |

\* Either `DATABASE_URL` or `POSTGRES_URL` is required.

### Redis

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection string (Railway provides this) | `redis://host:6379` |

### JWT Authentication

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `JWT_ACCESS_SECRET` | **Yes** | - | Secret key for access tokens (32+ chars, random) | `your-super-secret-key-min-32-chars` |
| `JWT_REFRESH_SECRET` | **Yes** | - | Secret key for refresh tokens (32+ chars, random) | `your-refresh-secret-key-min-32-chars` |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Access token expiration time | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token expiration time | `7d` |

### Storage & Media

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `STORAGE_BASE_URL` | No | `http://localhost:3001` | Base URL for serving uploaded media (should match API URL) | `https://api.novafans.com` |
| `UPLOADS_DIR` | No | `./uploads` | Path to uploads directory (use `/data/uploads` for Railway volumes) | `/data/uploads` |

### External Services

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `AI_SERVICE_URL` | No | `http://localhost:3002` | Public URL of the AI service | `https://ai.novafans.com` |

### Crypto Payments

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `CRYPTO_PROVIDER` | No | `fake` | Crypto payment provider (`fake`, `nowpayments`, `coinpayments`) | `nowpayments` |
| `CRYPTO_API_KEY` | No* | - | API key from crypto payment provider | `your-crypto-api-key` |
| `CRYPTO_IPN_SECRET` | No* | - | Webhook/notification secret or HMAC key (preferred) | `your-ipn-secret-32-chars` |
| `CRYPTO_WEBHOOK_SECRET` | No* | - | Legacy alias for `CRYPTO_IPN_SECRET` | Same as `CRYPTO_IPN_SECRET` |
| `CRYPTO_CALLBACK_BASE_URL` | No | API base URL | Base URL for payment callbacks (should match API URL) | `https://api.novafans.com` |
| `CRYPTO_DEFAULT_CURRENCY` | No | `USDT` | Default cryptocurrency for payments | `USDT` |
| `CRYPTO_MIN_AMOUNT` | No | `1.0` | Minimum payment amount | `1.0` |

\* Required when `CRYPTO_PROVIDER` is not `fake`.

**Fake Mode (Default):**
```env
# No configuration needed - works out of the box
CRYPTO_PROVIDER=fake
# Or simply omit CRYPTO_PROVIDER and CRYPTO_API_KEY
```

**Real Mode (NOWPayments):**
```env
CRYPTO_PROVIDER=nowpayments
CRYPTO_API_KEY=your-nowpayments-api-key
CRYPTO_IPN_SECRET=your-webhook-secret-hmac-key
CRYPTO_CALLBACK_BASE_URL=https://api.novafans.com
CRYPTO_DEFAULT_CURRENCY=USDT
CRYPTO_MIN_AMOUNT=1.0
```

### Rate Limiting

Rate limiting uses Redis by default, falling back to in-memory if Redis is unavailable.

No additional environment variables are required for rate limiting, but Redis must be configured for distributed rate limiting in production.

---

## AI Service (Railway/Container)

These variables are used by `getAiConfig()` in `@novafans/config`.

### Core Configuration

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `NODE_ENV` | No | `development` | Node environment | `production` |
| `PORT` | No | `3002` | Port for AI service to listen on | `3002` |
| `AI_SERVICE_URL` | No | `http://localhost:3002` | Public URL of the AI service | `https://ai.novafans.com` |

### LLM Configuration

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `AI_PROVIDER` | No | `fake` | LLM provider (`fake`, `openai`, `anthropic`) | `openai` |
| `AI_API_KEY` | No* | - | API key for LLM provider | `sk-your-openai-api-key` |
| `AI_MODEL` | No | `gpt-4o-mini` | Model name to use | `gpt-4o-mini` |
| `AI_MAX_TOKENS` | No | `512` | Maximum tokens in response | `512` |
| `AI_TEMPERATURE` | No | `0.7` | Temperature for response generation (0-1) | `0.7` |

\* Required when `AI_PROVIDER` is not `fake`.

**Development Note:** Set `AI_PROVIDER=fake` and leave `AI_API_KEY` empty to use rule-based replies (no API costs).

**Production Note:** Set `AI_PROVIDER=openai` and provide a valid `AI_API_KEY` for real LLM-powered autopilot.

---

## Web App (Vercel)

These variables are used by `getWebConfig()` in `@novafans/config` and are injected at build time.

### Required Variables

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | **Yes** | `http://localhost:3001` | Public URL of the API service | `https://api.novafans.com` |
| `NEXT_PUBLIC_AI_SERVICE_URL` | **Yes** | `http://localhost:3002` | Public URL of the AI service | `https://ai.novafans.com` |

**Important:** All `NEXT_PUBLIC_*` variables are baked into the build at build time. They must be set in the Vercel dashboard before building.

---

## Environment Variable Validation

### Railway (API + AI)

When deploying to Railway, the following variables are **required**:

**API Service:**
- `DATABASE_URL` (or `POSTGRES_URL`)
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `API_BASE_URL` (should match Railway-provided domain)
- `STORAGE_BASE_URL` (typically same as `API_BASE_URL`)
- `FRONTEND_ORIGIN` (web app URL)
- `AI_SERVICE_URL` (if AI is on separate service)
- `REDIS_URL` (recommended for rate limiting)

**AI Service:**
- `PORT` (if different from default)
- `AI_SERVICE_URL` (should match Railway-provided domain)
- `AI_PROVIDER` (set to `openai` for production)
- `AI_API_KEY` (if `AI_PROVIDER=openai`)

### Vercel (Web)

When deploying to Vercel, the following variables are **required**:

- `NEXT_PUBLIC_API_URL` (must match your API service URL)
- `NEXT_PUBLIC_AI_SERVICE_URL` (must match your AI service URL)

**Optional Analytics Variables:**
- `NEXT_PUBLIC_ANALYTICS_PROVIDER` - Set to `plausible` or `posthog` to enable analytics
- `NEXT_PUBLIC_ANALYTICS_SITE_ID` - Plausible site ID (required if provider is `plausible`)
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog project API key (required if provider is `posthog`)
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host URL (optional, defaults to `https://app.posthog.com`)

---

## Production Recommendations

### Security

1. **Generate strong secrets:**
   ```bash
   # Generate JWT secrets (32+ characters)
   openssl rand -base64 32
   ```

2. **Never commit `.env` files** to version control

3. **Use Railway/Vercel secrets** for sensitive variables

4. **Enable HTTPS** (automatic on Railway/Vercel)

### Database & Redis

- Use **managed services** (Railway Postgres, Railway Redis) in production
- Do **not** use containerized Postgres/Redis for production
- Set `DATABASE_URL` and `REDIS_URL` from managed service connection strings

### Storage

- **Local storage (MVP):** Use persistent volumes (`UPLOADS_DIR=/data/uploads`)
- **Production (TODO):** Migrate to S3/BunnyCDN with additional env vars:
  - `S3_ACCESS_KEY_ID`
  - `S3_SECRET_ACCESS_KEY`
  - `S3_BUCKET`
  - `S3_REGION`
  - `STORAGE_BASE_URL=https://cdn.novafans.com`

### Domains

Recommended domain setup:
- `api.novafans.com` → Railway API service
- `ai.novafans.com` → Railway AI service
- `novafans.com` → Vercel web app

Update `API_BASE_URL`, `AI_SERVICE_URL`, `STORAGE_BASE_URL`, and `FRONTEND_ORIGIN` accordingly.

---

## Development vs Production

### Development

```env
NODE_ENV=development
API_BASE_URL=http://localhost:3001
AI_SERVICE_URL=http://localhost:3002
STORAGE_BASE_URL=http://localhost:3001
FRONTEND_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:3002
AI_PROVIDER=fake
CRYPTO_PROVIDER=fake
# Crypto works in fake mode without any additional config
```

### Production

```env
NODE_ENV=production
API_BASE_URL=https://api.novafans.com
AI_SERVICE_URL=https://ai.novafans.com
STORAGE_BASE_URL=https://api.novafans.com
FRONTEND_ORIGIN=https://novafans.com
NEXT_PUBLIC_API_URL=https://api.novafans.com
NEXT_PUBLIC_AI_SERVICE_URL=https://ai.novafans.com
AI_PROVIDER=openai
AI_API_KEY=sk-your-actual-key
CRYPTO_PROVIDER=nowpayments
CRYPTO_API_KEY=your-nowpayments-api-key
CRYPTO_IPN_SECRET=your-webhook-secret-hmac-key
CRYPTO_CALLBACK_BASE_URL=https://api.novafans.com
CRYPTO_DEFAULT_CURRENCY=USDT
CRYPTO_MIN_AMOUNT=1.0
```

---

## Quick Reference by Service

### API Service (Railway)
```
NODE_ENV=production
PORT=3001
API_BASE_URL=https://api.novafans.com
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
STORAGE_BASE_URL=https://api.novafans.com
UPLOADS_DIR=/data/uploads
FRONTEND_ORIGIN=https://novafans.com
AI_SERVICE_URL=https://ai.novafans.com
```

### AI Service (Railway)
```
NODE_ENV=production
PORT=3002
AI_SERVICE_URL=https://ai.novafans.com
AI_PROVIDER=openai
AI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini
AI_MAX_TOKENS=512
AI_TEMPERATURE=0.7
```

### Web App (Vercel)
```
NEXT_PUBLIC_API_URL=https://api.novafans.com
NEXT_PUBLIC_AI_SERVICE_URL=https://ai.novafans.com
```

---

## Troubleshooting

### API won't start
- Check `DATABASE_URL` is set and valid
- Check `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are set
- Verify `REDIS_URL` is accessible (optional but recommended)

### Web app can't connect to API
- Verify `NEXT_PUBLIC_API_URL` matches your API service URL
- Check `FRONTEND_ORIGIN` in API matches web app URL
- Ensure CORS is configured correctly

### Media files not loading
- Check `STORAGE_BASE_URL` matches API URL
- Verify uploads directory exists and is writable
- For Railway, ensure persistent volume is mounted at `UPLOADS_DIR`

### AI service not responding
- Verify `AI_API_KEY` is set if `AI_PROVIDER=openai`
- Check `AI_SERVICE_URL` matches the service's public URL
- Test with `AI_PROVIDER=fake` for debugging

