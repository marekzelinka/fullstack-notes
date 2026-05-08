# syntax=docker/dockerfile:1

# Stage 1: Base image with pnpm installed
ARG NODE_VERSION=25.9.0
FROM node:${NODE_VERSION}-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install --global corepack@latest --force
RUN corepack enable

WORKDIR /app

# Stage 2: Fetch dependencies based on lockfile only (High cache hit rate)
FROM base AS fetcher

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch

# Stage 3: Build the Frontend (React Vite)
FROM fetcher AS build-client

COPY . .
# Install all deps (including dev) using the cached store
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --offline
# Build React app - output usually goes to apps/client/dist
RUN pnpm --filter client run build

# Stage 4: Prepare isolated Server production environment
FROM fetcher AS server-deploy
COPY . .
# Use pnpm deploy to create a standalone directory for the server
# This resolves workspace links and copies necessary code/deps into /out
RUN pnpm --filter server --prod deploy /out

# Stage 5: Final Production Image
FROM node:20-slim AS runner

WORKDIR /app

# 1. Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
USER nodejs

# 2. Copy the standalone server from the deploy stage
COPY --from=server-deploy --chown=node:node /out .

# 3. Copy the frontend build into the server's public directory
# Assumption: Express is configured to serve static files from 'public'
COPY --from=build-client --chown=node:node /app/apps/client/dist ./public

EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "src/index.js"]
