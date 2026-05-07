# syntax=docker/dockerfile:1

ARG NODE_VERSION=25
FROM node:${NODE_VERSION}-slim AS base

# Set up pnpm and production environment
ENV PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH" \
    NODE_ENV=production
RUN corepack enable

WORKDIR /app

# 2. Fetch stage: Leverage pnpm 11 caching
FROM base AS fetcher
COPY pnpm-lock.yaml ./
# Fetches dependencies based only on the lockfile for extreme speed
RUN pnpm fetch

# 3. Build stage: Client build only
FROM fetcher AS builder
COPY . .
# Install devDependencies as well to build the Vite app
RUN pnpm install --offline --frozen-lockfile --prod=false
RUN pnpm --filter client build

# 4. Production stage: Pruned and optimized
FROM base AS runner

# Use pnpm deploy to isolate the server and its prod dependencies
# Since server is pure JS, we skip any 'pnpm build' steps here
RUN pnpm --filter server deploy /app/server --prod

WORKDIR /app/server

# Copy the built Vite static files from the builder stage
# Assuming Vite outputs to apps/client/dist
COPY --from=builder /app/apps/client/dist ./public

# PORT should match our Fly.io deployment
EXPOSE 3001

# Start the Node-based server directly
CMD [ "node", "src/index.js" ]
