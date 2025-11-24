# NovaFans Validation Scripts

This directory contains validation scripts to ensure the NovaFans codebase builds and runs correctly.

## Scripts

### `validate-local.sh`

Comprehensive local validation script that:

1. **Checks prerequisites** - Verifies pnpm, docker, docker-compose are installed
2. **Installs dependencies** - Runs `pnpm install --frozen-lockfile`
3. **Builds all packages** - Builds config, API, AI, and Web in order
4. **Starts Docker services** - Boots Postgres and Redis via docker-compose
5. **Runs migrations** - Executes Prisma migrations against local database
6. **Validates service startup** - Tests that API and AI services can start without errors

## Usage

From the repository root:

```bash
pnpm validate:local
```

Or directly:

```bash
bash scripts/validation/validate-local.sh
```

## Requirements

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 16+ (via Docker)
- Redis 7+ (via Docker)

## What It Does

1. **Dependency Installation**
   - Installs all workspace dependencies
   - Uses frozen lockfile for reproducible builds

2. **Build Process**
   - Builds `packages/config` first (dependency for other packages)
   - Generates Prisma client for API
   - Builds API, AI, and Web applications
   - Fails fast if any build step fails

3. **Database Setup**
   - Starts Postgres and Redis containers
   - Waits for services to be healthy
   - Runs Prisma migrations
   - Creates database schema

4. **Service Validation**
   - Starts API service briefly to check for startup errors
   - Starts AI service briefly to check for startup errors
   - Validates services can bind to ports and initialize

## Environment Variables

The script sets minimal environment variables for validation. For actual development, ensure you have proper `.env` files:

- `apps/api/.env` - API configuration
- `apps/web/.env` - Web configuration  
- `apps/ai/.env` - AI service configuration

See `docs/ENVIRONMENT.md` for complete environment variable reference.

## Troubleshooting

### Build Failures

If builds fail:
- Check that all dependencies are installed: `pnpm install`
- Verify TypeScript configuration is correct
- Check for syntax errors in source files

### Docker Issues

If Docker services fail to start:
- Ensure Docker is running: `docker ps`
- Check if ports 5432 (Postgres) and 6379 (Redis) are available
- Try stopping existing containers: `docker-compose down`

### Migration Failures

If migrations fail:
- Check database connection string in `apps/api/.env`
- Verify Postgres container is healthy: `docker exec novafans-postgres pg_isready`
- Check Prisma schema is valid: `cd apps/api && pnpm prisma validate`

### Service Startup Failures

If services fail to start:
- Check startup logs in `/tmp/api-startup.log` and `/tmp/ai-startup.log`
- Verify environment variables are set correctly
- Check that required services (Postgres, Redis) are running

## Next Steps After Validation

Once validation passes:

1. **Configure environment variables:**
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   cp apps/ai/.env.example apps/ai/.env
   # Edit .env files with your configuration
   ```

2. **Start development:**
   ```bash
   pnpm dev
   ```

3. **Access services:**
   - API: http://localhost:3001
   - Web: http://localhost:3000
   - AI: http://localhost:3002

## CI/CD Integration

This validation script can be adapted for CI/CD pipelines:

- Remove Docker startup steps (use managed services)
- Run in parallel where possible
- Add test execution after validation
- Generate build artifacts

