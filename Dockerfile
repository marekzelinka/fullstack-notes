# syntax=docker/dockerfile:1

# Stage 1: Base
ARG NODE_VERSION=25.9.0
FROM node:${NODE_VERSION}-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install --global corepack@latest --force
RUN corepack enable

WORKDIR /app

# Stage 2: Install dependencies
FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server/package.json ./apps/server/
COPY apps/client/package.json ./apps/client/

# Install all dependencies (including devDeps for building)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the client (assuming it outputs to apps/client/dist)
RUN pnpm --filter client build

# Prune dependencies for production
RUN pnpm install --prod --frozen-lockfile

# Stage 3: Runner
FROM base AS runner
ENV NODE_ENV=production

# Copy production node_modules and built assets
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/server ./apps/server
COPY --from=build /app/apps/client/dist ./apps/server/public

# Expose the port from your env config
EXPOSE 3001

WORKDIR /app/apps/server
CMD ["node", "src/index.js"]
