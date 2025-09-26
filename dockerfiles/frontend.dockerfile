FROM oven/bun:alpine AS deps
WORKDIR /tmp

COPY bun.lock ./apps/frontend/package.json ./
RUN bun install --no-save

# entah bug atau bukan waktu build nextjs pake bun ada error tapi kalau pake node okok aja
FROM node:alpine AS builder
WORKDIR /tmp

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /tmp/node_modules ./node_modules
COPY --from=deps /tmp/package.json ./

COPY ./apps/frontend/tsconfig.json ./
COPY ./apps/frontend/next.config.ts ./
COPY ./apps/frontend/src ./src
RUN npm run build

FROM oven/bun:alpine AS runner

WORKDIR /app

COPY ./apps/frontend/public ./public
COPY --from=builder /tmp/.next/static ./.next/static
COPY --from=builder /tmp/.next/standalone ./

CMD ["./server.js"]
