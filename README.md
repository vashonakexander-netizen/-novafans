# NovaFans - Creator Subscription Platform

A production-ready monorepo for an adult creator subscription platform similar to OnlyFans/Fanvue, with AI autopilot chat and creator migration assistant.

## Features

- **Creator & Fan Management**: Full user management with roles (FAN, CREATOR, ADMIN)
- **Subscriptions**: Monthly subscriptions with crypto payment support
- **Posts & Media**: Paywalled posts with multiple visibility levels (SUBSCRIBERS, PAID, PUBLIC_TEASER)
- **Direct Messaging**: Chat between fans and creators with paid message support
- **AI Autopilot**: AI-powered chat that responds as the creator when offline
- **Bulk Import**: Import content from device or remote sources (MEGA, Drive, ZIP)
- **Drip Posting**: Schedule posts with automatic drip publishing
- **Crypto Payments**: Real crypto payment gateway (NOWPayments) + fake fallback
- **Live Streaming**: LiveKit integration for real-time streaming
- **Mobile App**: React Native app (iOS + Android) with Expo
- **Telegram Bot**: Creator bot for notifications and management
- **Migration Tool**: Import from OnlyFans/Fanvue
- **SEO Pages**: Optimized landing pages for creators
- **Growth Automation**: Automated onboarding and retention
- **Trust & Safety**: CSAM scanning, watermarking, reporting
- **Observability**: Metrics, health checks, error tracking
- **Admin Panel**: User management, reporting, and moderation

## Tech Stack

- **Monorepo**: Turborepo + pnpm
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Mobile**: React Native + Expo
- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL + Redis
- **AI Service**: Node.js + Express + TypeScript
- **Telegram Bot**: Telegraf + TypeScript
- **Database**: PostgreSQL
- **Cache/Queue**: Redis
- **Live Streaming**: LiveKit
- **Storage**: Local / S3 / BunnyCDN
- **Observability**: Sentry, Prometheus metrics

## Prerequisites

- **Node.js** 18+ and **pnpm** 8+
- **Docker** and **Docker Compose** (for Postgres and Redis)
- **Git**

## Quick Start

### Option 1: Automated Validation (Recommended)

Run the comprehensive validation script that installs, builds, and validates everything:

```bash
pnpm validate:local
```

This script will:
- Install all dependencies
- Build all packages (config, API, AI, Web)
- Start Docker services (Postgres + Redis)
- Run database migrations
- Validate all services can start

### Option 2: Manual Setup

### 1. Clone and Install

```bash
git clone <repo-url>
cd novafans
pnpm install
```

### 2. Start Docker Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 3. Set Up Environment Variables

```bash
# Copy example env files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/ai/.env.example apps/ai/.env

# Edit .env files with your configuration
# The default values should work for local development
```

### 4. Run Database Migrations

```bash
# Generate Prisma client
cd apps/api
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# (Optional) Open Prisma Studio to view data
pnpm prisma:studio
```

### 5. Start All Apps

From the root directory:

```bash
# Start all apps in dev mode
pnpm dev

# Or start individually:
pnpm dev:api   # API server on http://localhost:3001
pnpm dev:web   # Next.js on http://localhost:3000
pnpm dev:ai    # AI service on http://localhost:3002
```

### 6. Access the Platform

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/health (health check endpoint)
- **AI Service**: http://localhost:3002/health

## Project Structure

```
novafans/
├── apps/
│   ├── api/              # NestJS backend API
│   │   ├── src/
│   │   │   ├── auth/     # Authentication module
│   │   │   ├── users/    # User management
│   │   │   ├── creators/ # Creator profiles
│   │   │   ├── posts/    # Posts & media
│   │   │   ├── subscriptions/ # Subscriptions
│   │   │   ├── messages/ # Direct messaging
│   │   │   ├── ai/       # AI autopilot worker
│   │   │   ├── import/   # Content import
│   │   │   ├── scheduling/ # Post scheduler
│   │   │   └── admin/    # Admin panel
│   │   └── prisma/       # Prisma schema & migrations
│   ├── web/              # Next.js frontend
│   │   └── src/
│   │       ├── app/      # App Router pages
│   │       ├── components/ # React components
│   │       └── lib/      # Utilities
│   └── ai/               # AI service (Express)
│       └── src/
├── packages/
│   ├── config/           # Shared configs (TS, ESLint, Prettier)
│   └── ui/               # Shared UI components
├── docker-compose.yml    # Docker services
└── turbo.json            # Turborepo config
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user (protected)

### Creators

- `GET /creators/:username` - Get public creator profile
- `GET /creators/me/profile` - Get own profile (creator only)
- `PUT /creators/me/profile` - Update profile (creator only)

### Posts

- `POST /posts` - Create post (creator only)
- `PUT /posts/:id` - Update post (creator only)
- `GET /posts/:id` - Get post
- `GET /creators/:creatorId/posts` - Get creator's posts
- `DELETE /posts/:id` - Delete post (creator only)

### Subscriptions

- `POST /subscriptions/:creatorId` - Subscribe to creator
- `POST /subscriptions/:creatorId/crypto` - Subscribe with crypto
- `GET /subscriptions/me` - Get my subscriptions
- `DELETE /subscriptions/:creatorId` - Cancel subscription

### Messages

- `GET /messages/conversations` - Get my conversations
- `GET /messages/conversations/:id` - Get conversation
- `POST /messages/conversations` - Send message
- `POST /messages/:messageId/purchase` - Purchase locked message

### Import

- `POST /creator/import/sessions` - Create import session
- `POST /creator/import/sessions/remote` - Create remote import
- `POST /creator/import/sessions/:id/files` - Add files to session
- `GET /creator/import/sessions/:id/preview` - Preview import
- `POST /creator/import/sessions/:id/commit` - Commit import (create posts)
- `POST /creator/import/sessions/:id/cancel` - Cancel import

### Payments

- `POST /payments/crypto/webhook` - Crypto payment webhook
- `GET /payments/crypto/pay/:invoiceId` - Fake payment page

### Admin

- `GET /admin/users` - List users (admin only)
- `POST /admin/users/:id/ban` - Ban user (admin only)
- `GET /admin/reports` - Get reports (admin only)

## Workers

The backend runs several background workers:

1. **AI Reply Worker**: Processes messages and sends AI replies when creators have autopilot enabled
2. **Remote Import Worker**: Downloads and processes remote import jobs (MEGA/Drive/ZIP)
3. **Scheduler Worker**: Publishes scheduled posts automatically

These workers run automatically when the API server starts.

## Database Schema

Key models:

- `User` - Users (FAN, CREATOR, ADMIN)
- `CreatorProfile` - Creator profiles and settings
- `Subscription` - Fan subscriptions to creators
- `Transaction` - All payments (CARD, CRYPTO)
- `CryptoInvoice` - Crypto payment invoices
- `Post` - Posts with visibility and pricing
- `PostMedia` - Media attachments for posts
- `Conversation` - DM conversations
- `Message` - Individual messages (FAN, CREATOR, AI)
- `ImportSession` - Bulk import sessions
- `ImportMedia` - Imported media files
- `AiSession` - AI interaction sessions

See `apps/api/prisma/schema.prisma` for full schema.

## Environment Variables

### Root `.env`

```env
POSTGRES_URL=postgresql://novafans:novafans@localhost:5432/novafans
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
API_BASE_URL=http://localhost:3001
AI_SERVICE_URL=http://localhost:3002
FRONTEND_ORIGIN=http://localhost:3000
```

### `apps/api/.env`

```env
POSTGRES_URL=postgresql://novafans:novafans@localhost:5432/novafans
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
PORT=3001
AI_SERVICE_URL=http://localhost:3002
FRONTEND_ORIGIN=http://localhost:3000
```

### `apps/web/.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### `apps/ai/.env`

```env
PORT=3002
```

## Development

### Running Individual Services

```bash
# API only
pnpm dev:api

# Web only
pnpm dev:web

# AI service only
pnpm dev:ai
```

### Linting

```bash
pnpm lint
```

### Building

```bash
pnpm build
```

### Database Management

```bash
# Generate Prisma client
cd apps/api
pnpm prisma:generate

# Create migration
pnpm prisma:migrate dev --name migration-name

# Reset database (⚠️ deletes all data)
pnpm prisma:migrate reset

# Open Prisma Studio
pnpm prisma:studio
```

## Production Deployment

### Prerequisites

1. Set up production PostgreSQL database
2. Set up production Redis instance
3. Configure environment variables
4. Set secure JWT secrets
5. Configure CORS origins
6. Set up file storage (S3, etc.) for media uploads

### Steps

1. Build all apps: `pnpm build`
2. Set production environment variables
3. Run migrations: `cd apps/api && pnpm prisma:migrate deploy`
4. Start services (use PM2, Docker, or your preferred process manager)

### TODO for Production

- [ ] Replace fake crypto payment processor with real provider (CoinPayments/NOWPayments)
- [ ] Integrate real LLM for AI autopilot (OpenAI GPT, Claude, etc.)
- [ ] Add file storage (AWS S3, Cloudinary, etc.)
- [ ] Implement proper ZIP extraction for remote imports
- [ ] Add rate limiting
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Add comprehensive error logging (Sentry, etc.)
- [ ] Add monitoring and alerting
- [ ] Implement email notifications
- [ ] Add SMS/2FA authentication
- [ ] Add content moderation tools
- [ ] Implement payout processing

## Fake Integrations

The codebase includes **fake integrations** that can be replaced:

1. **Crypto Payments**: `apps/api/src/transactions/payments.controller.ts` - Replace with CoinPayments/NOWPayments webhooks
2. **AI Service**: `apps/ai/src/index.ts` - Replace with OpenAI/Claude API calls
3. **File Storage**: Currently uses URLs - Replace with S3/Cloudinary upload logic
4. **Remote Import**: `apps/api/src/import/import.service.ts` - Implement real ZIP/MEGA/Drive download/extraction

## Security Notes

- ⚠️ Change all default secrets in production
- ⚠️ Implement proper rate limiting
- ⚠️ Add input validation and sanitization
- ⚠️ Implement file upload size limits
- ⚠️ Add CORS restrictions for production
- ⚠️ Use HTTPS in production
- ⚠️ Implement proper session management
- ⚠️ Add content moderation for adult content compliance

## License

[Your License Here]

## Support

[Your Support Contact]

# -novafans
