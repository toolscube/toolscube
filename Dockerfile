# ---- Build stage ----
FROM node:20-slim AS builder
WORKDIR /app

# Prisma on slim needs OpenSSL
RUN apt-get update -y && apt-get install -y --no-install-recommends \
  openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Build-time args (optional)
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
# dev deps needed to build
RUN npm ci

# prisma generate (no DB connect required)
COPY prisma ./prisma
RUN npx prisma generate

# build app (ensure next.config.js has: module.exports = { output: 'standalone' })
COPY . .
RUN npm run build

# Keep only production deps (includes prisma CLI + transitive deps)
RUN npm prune --omit=dev

# ---- Runtime stage ----
FROM node:20-slim AS runner
WORKDIR /app

# Optional but avoids Prisma engine warnings
RUN apt-get update -y && apt-get install -y --no-install-recommends \
  openssl ca-certificates && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3005

# Copy only necessary files/folders to run
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3005

# Auto-migrate then start
CMD npx prisma migrate deploy && node server.js