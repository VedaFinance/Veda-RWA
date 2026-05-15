FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/app/package.json ./packages/app/
COPY packages/backend/package.json ./packages/backend/
RUN npm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_STELLAR_NETWORK=testnet
RUN npm run build:app

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/packages/app/next.config.js ./packages/app/
COPY --from=builder /app/packages/app/package.json ./packages/app/
COPY --from=builder /app/packages/app/.next ./packages/app/.next
COPY --from=builder /app/packages/app/public ./packages/app/public
COPY --from=builder /app/packages/app/node_modules ./packages/app/node_modules
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npx", "--prefix", "packages/app", "next", "start"]
