FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --frozen-lockfile

COPY . .
ARG NEXT_PUBLIC_WEB_BASE_URL=http://localhost:3001
ENV NEXT_PUBLIC_WEB_BASE_URL=${NEXT_PUBLIC_WEB_BASE_URL}
RUN pnpm --filter @flowclass/web build

EXPOSE 3001
CMD ["pnpm", "--filter", "@flowclass/web", "start"]
