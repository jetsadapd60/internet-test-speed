FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/api/prisma ./apps/api/prisma

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .

# Generate Prisma Client
RUN pnpm --filter api exec prisma generate

# Build the api app
RUN pnpm --filter api build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# Install dependencies for runner
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy definition files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/api/prisma ./apps/api/prisma

# Install production dependencies only
RUN pnpm install --filter api --prod --frozen-lockfile --ignore-scripts

# Generate Prisma Client (needed for runtime)
RUN pnpm --filter api exec prisma generate

# Copy built artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist

RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

CMD ["node", "apps/api/dist/src/main"]
