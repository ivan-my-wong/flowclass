FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --frozen-lockfile

COPY . .
ARG VITE_ADMIN_BASE_URL=http://localhost:3000
ENV VITE_ADMIN_BASE_URL=${VITE_ADMIN_BASE_URL}
RUN pnpm --filter @flowclass/admin build

EXPOSE 3000
CMD ["pnpm", "--filter", "@flowclass/admin", "start"]
