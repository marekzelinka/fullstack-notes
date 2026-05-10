# syntax=docker/dockerfile:1
ARG NODE_VERSION=25.9.0
FROM node:${NODE_VERSION}-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install --global corepack@latest --force
RUN corepack enable
WORKDIR /app

# --- Stage 2: Build & Prune ---
FROM base AS build

# Copy workspace metadata
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# Copy all package.json files
COPY apps/server/package.json ./apps/server/
COPY apps/client/package.json ./apps/client/

# 1. Install all dependencies for the build process
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# 2. Copy source code
COPY . .

# 3. Build the React client (Vite)
RUN pnpm --filter client build

# 4. Use 'pnpm deploy' to extract the server into a standalone folder
# This automatically handles only production dependencies.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm --filter server --prod deploy /out/server --legacy

# --- Stage 3: Runner ---
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3001

# Copy only the isolated server package from the deploy step
COPY --from=build /out/server /app
# Copy the client dist directly into the public folder
COPY --from=build /app/apps/client/dist ./public

# Fly.io security best practice
USER node

EXPOSE 3001

CMD ["node", "src/index.js"]
