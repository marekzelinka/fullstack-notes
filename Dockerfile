# syntax=docker/dockerfile:1

ARG NODE_VERSION=26
FROM node:${NODE_VERSION}-slim AS base

# Set up pnpm and production environment
ENV PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH" \
    NODE_ENV=production
RUN npm install --global corepack@latest --force
RUN corepack enable pnpm

WORKDIR /app

# --- Stage 1: Build & Isolate ---
FROM base AS build
COPY . .

# 1. Install all dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# 2. Build the frontend
RUN pnpm --filter client build
# 3. Use 'pnpm deploy' to create a standalone server folder
# This prunes devDeps and flattens workspace links into /prod/server
RUN pnpm --filter server --prod deploy /prod/server --legacy
# 4. Manually move the frontend dist into the newly isolated server
RUN cp -r apps/client/dist /prod/server/public

# --- Stage 2: Final Production Image ---
FROM base
ENV NODE_ENV=production

# Now we only need the /prod/server folder!
WORKDIR /app
COPY --from=build /prod/server ./

EXPOSE 3001

CMD [ "node", "src/index.js" ]
