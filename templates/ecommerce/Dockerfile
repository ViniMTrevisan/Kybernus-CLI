# syntax=docker/dockerfile:1

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests for layer caching
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
# Ensure empty packages dir exists (workspace requirement)
RUN mkdir -p packages

# Install all dependencies (dev + prod)
RUN npm ci

# Copy source files
COPY tsconfig.json ./
COPY apps/api/tsconfig.json ./apps/api/
COPY apps/api/src ./apps/api/src
COPY apps/api/prisma ./apps/api/prisma

# Generate Prisma Client (requires `prisma` devDependency)
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Compile TypeScript → JavaScript
RUN npm run build --workspace=apps/api

# ── Stage 2: Production runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy workspace manifests for production install
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
RUN mkdir -p packages

# Production dependencies only (no devDeps)
RUN npm ci --omit=dev

# Copy compiled output
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Copy Prisma schema (used for `prisma migrate deploy` at startup)
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Copy the pre-generated Prisma query engine (same alpine architecture)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

# Run pending migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma && node apps/api/dist/server.js"]
