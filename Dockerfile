# Multi-stage Dockerfile for Account Management Platform
# Production-grade security with minimal attack surface

# Stage 1: Dependencies
FROM node:20-alpine AS deps
LABEL stage=deps

# Install security updates and curl for health checks
RUN apk add --no-cache libc6-compat curl

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with security focus
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Stage 2: Builder
FROM node:20-alpine AS builder
LABEL stage=builder

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set build environment
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build application
RUN npm run build

# Stage 3: Runtime
FROM node:20-alpine AS runner
LABEL maintainer="Kareem Schultz"
LABEL version="1.0.0"
LABEL description="Account Management Platform - Production Container"

# Install security updates and required packages
RUN apk add --no-cache \
    dumb-init \
    curl \
    tini \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create necessary directories with proper permissions
RUN mkdir -p /app/.next/cache && \
    chown -R nextjs:nodejs /app/.next/cache && \
    chmod -R 755 /app/.next/cache

# Security hardening
RUN chown -R nextjs:nodejs /app && \
    chmod -R 755 /app && \
    chmod 644 /app/server.js

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Use tini for proper signal handling and init process
ENTRYPOINT ["/sbin/tini", "--"]

# Start application
CMD ["node", "server.js"]