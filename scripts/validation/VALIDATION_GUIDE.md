# NovaFans Validation Guide

## Quick Reference

### Run Full Validation
```bash
pnpm validate:local
```

### Run Build-Only Validation
```bash
pnpm validate:build
```

## What Gets Validated

### Full Validation (`validate:local`)

1. **Prerequisites**
   - pnpm installed
   - Docker installed
   - docker-compose or docker compose available

2. **Dependencies**
   - All workspace packages installed
   - Lockfile validated

3. **Builds**
   - `packages/config` → TypeScript compilation
   - `apps/api` → Prisma generate + NestJS build
   - `apps/ai` → TypeScript compilation
   - `apps/web` → Next.js build

4. **Docker Services**
   - Postgres container starts
   - Redis container starts
   - Health checks pass

5. **Database**
   - Migrations run successfully
   - Schema created/updated

6. **Service Startup**
   - API can start (brief test)
   - AI service can start (brief test)

### Build-Only Validation (`validate:build`)

- Same as steps 1-3 above
- Skips Docker, migrations, and service startup
- Faster execution
- Useful for CI/CD

## Expected Duration

- **Full validation:** ~2-5 minutes
- **Build-only:** ~1-2 minutes

## Success Criteria

✅ All steps complete without errors
✅ All packages build successfully
✅ Docker services are healthy
✅ Migrations run without errors
✅ Services can start

## Common Issues

### Issue: "pnpm: command not found"
**Solution:** Install pnpm: `npm install -g pnpm`

### Issue: "Docker not running"
**Solution:** Start Docker Desktop or Docker daemon

### Issue: "Port already in use"
**Solution:** Stop existing services on ports 5432, 6379, 3001, 3002

### Issue: "Migration failed"
**Solution:** 
- Check Postgres is running: `docker exec novafans-postgres pg_isready`
- Verify `.env` file exists in `apps/api/`
- Check `DATABASE_URL` is correct

### Issue: "Build failed"
**Solution:**
- Check TypeScript errors
- Verify all dependencies installed
- Check for syntax errors

## Output Files

The script creates temporary log files:
- `/tmp/api-startup.log` - API startup output
- `/tmp/ai-startup.log` - AI startup output

These are useful for debugging service startup issues.

## Integration

### Pre-commit Hook
```bash
# .git/hooks/pre-commit
#!/bin/bash
pnpm validate:build
```

### CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
- name: Validate build
  run: pnpm validate:build
```

### Local Development
Run before starting work:
```bash
pnpm validate:local
```

## Next Steps

After successful validation:

1. **Configure environment:**
   ```bash
   cp apps/api/.env.example apps/api/.env
   # Edit .env files
   ```

2. **Start development:**
   ```bash
   pnpm dev
   ```

3. **Access services:**
   - API: http://localhost:3001/health
   - Web: http://localhost:3000
   - AI: http://localhost:3002/health

## Script Details

### `validate-local.sh`
- **Location:** `scripts/validation/validate-local.sh`
- **Purpose:** Full validation including services
- **Duration:** ~2-5 minutes
- **Requirements:** Docker, pnpm, Node.js

### `validate-build-only.sh`
- **Location:** `scripts/validation/validate-build-only.sh`
- **Purpose:** Build validation only
- **Duration:** ~1-2 minutes
- **Requirements:** pnpm, Node.js

## Troubleshooting Commands

```bash
# Check Docker services
docker-compose ps

# Check Postgres
docker exec novafans-postgres pg_isready -U novafans

# Check Redis
docker exec novafans-redis redis-cli ping

# View API logs
cat /tmp/api-startup.log

# View AI logs
cat /tmp/ai-startup.log

# Stop Docker services
docker-compose down

# Clean rebuild
docker-compose down -v
pnpm validate:local
```

