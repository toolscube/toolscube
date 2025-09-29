# Build stage
FROM node:20-slim AS builder
WORKDIR /app

# install deps
COPY package*.json ./
RUN npm ci

# generate prisma client & build app
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3005

# copy build output + prisma stuff
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin

EXPOSE 3005

# run migrate + start server
CMD npx prisma migrate deploy && node server.js