FROM oven/bun:alpine AS builder

WORKDIR /tmp

COPY bun.lock ./apps/backend/package.json ./
RUN bun install --no-save

COPY ./apps/backend/prisma ./prisma
RUN bun run prisma:gen

COPY ./apps/backend/src ./src
COPY ./apps/backend/tsconfig.json .
RUN bun run build:js

FROM oven/bun:alpine AS runner

COPY --from=builder /tmp/build/app.js ./

ENV APP_ENV=production
ENV APP_HOST=localhost
ENV APP_PORT=3000

EXPOSE ${APP_PORT}

CMD ["./app.js"]
