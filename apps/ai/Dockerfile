# Multi-stage build for NovaFans AI Service
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root package files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy packages
COPY packages/config ./packages/config

# Copy AI app
COPY apps/ai ./apps/ai

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build config package
WORKDIR /app/packages/config
RUN pnpm build

# Build AI service
WORKDIR /app/apps/ai
RUN pnpm build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root package files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy packages (only built output for config)
COPY --from=builder /app/packages/config/dist ./packages/config/dist
COPY --from=builder /app/packages/config/package.json ./packages/config/package.json
COPY --from=builder /app/packages/config/tsconfig.json ./packages/config/tsconfig.json

# Copy AI built output and dependencies
COPY --from=builder /app/apps/ai/dist ./apps/ai/dist
COPY --from=builder /app/apps/ai/package.json ./apps/ai/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/ai/node_modules ./apps/ai/node_modules

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app

USER nodejs

WORKDIR /app/apps/ai

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start AI service
CMD ["node", "dist/index.js"]

