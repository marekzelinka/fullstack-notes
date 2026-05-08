# syntax=docker/dockerfile:1

# Base image with pnpm installed
ARG NODE_VERSION=25.9.0
FROM node:${NODE_VERSION}-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install --global corepack@latest --force
RUN corepack enable

WORKDIR /app

# Build the Frontend (Vite)
FROM base AS build-client

COPY . .
# Install all deps (including dev) using the cached store
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# Build React app - output usually goes to apps/client/dist
RUN pnpm --filter client run build

# Prepare isolated Server production environment
FROM base AS server-deploy

COPY . .
# Use pnpm deploy to create a standalone directory for the server
# This resolves workspace links and copies necessary code/deps into /out
RUN pnpm --filter server --prod deploy /out --legacy --ignore-scripts

# Final Production Image
FROM base AS runner

WORKDIR /app
USER node

# Copy the standalone server from the deploy stage
COPY --from=server-deploy --chown=node:node /out .
# Copy the frontend build into the server's public directory
COPY --from=build-client --chown=node:node /app/apps/client/dist ./public

EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "src/index.js"]
