# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@10

COPY pnpm-lock.yaml package.json ./
COPY patches ./patches

RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm build

RUN npx workbox-cli generateSW workbox-config.cjs

# Production stage
FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm@10

COPY pnpm-lock.yaml package.json ./
COPY patches ./patches

RUN pnpm install --no-frozen-lockfile --prod

# Copy server bundle
COPY --from=builder /app/dist ./dist

# serveStatic resolves path.resolve(import.meta.dirname, "public")
# import.meta.dirname of /app/dist/index.js = /app/dist
# so client build must live at /app/dist/public
COPY --from=builder /app/client/dist ./dist/public

EXPOSE 3000

# ESM-safe health check using fetch (Node 22 built-in)
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node --input-type=module --eval "const r=await fetch('http://localhost:3000/');if(!r.ok)process.exit(1);"

CMD ["node", "dist/index.js"]
