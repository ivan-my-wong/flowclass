FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @flowclass/api build

EXPOSE 3100
CMD ["pnpm", "--filter", "@flowclass/api", "start:production"]
