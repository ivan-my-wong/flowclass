# Flowclass Open Source Monorepo

Flowclass is organized as a minimal `pnpm` workspaces monorepo for simple local development and open-source collaboration.

## Links

- **Website:** [flowclass.io](https://flowclass.io)
- **Documentation:** [flowclass.io/docs](https://flowclass.io/docs)

## Documentation & Guide

Full documentation is available at **[flowclass.io/docs](https://flowclass.io/docs)**, including:

- **Getting started** — environment setup, first run, and configuration
- **Architecture overview** — how the web, API, and admin apps fit together
- **Self-hosting guide** — deploying with Docker and configuring your environment
- **Contributing guide** — code style, branching, and PR process

For the fastest path from zero to a running instance, start with the [Getting Started](https://flowclass.io/docs) guide before working through the sections below.

## Quick start

PostgreSQL is required and must run via Docker. Use the start script to run the entire application:

```bash
pnpm start
```

This script will:

1. Check that Docker is running (on macOS, start Docker Desktop automatically if needed)
2. Start PostgreSQL, SMTP (Mailpit), and CloudBeaver via Docker
3. Create `.env` from `.env.example` if missing
4. Install dependencies and start all apps (web, api, admin)

## Environment

A single `.env` file at the project root is used by all apps. Copy from the template:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and any other required values.

**URLs:** Three variables for the three apps: `API_BASE_URL` (API), `NEXT_PUBLIC_WEB_BASE_URL` (Web), `VITE_ADMIN_BASE_URL` (Admin). When Web/Admin vars are not set, they default to the same domain as the current page (`window.location.origin`).

## Ports

| App        | Port | URL                   |
|------------|------|------------------------|
| API        | 3100 | http://localhost:3100  |
| CloudBeaver| 3101 | http://localhost:3101  |
| Admin      | 3000 | http://localhost:3000  |
| Web        | 3001 | http://localhost:3001  |

## CloudBeaver (Database Management)

CloudBeaver provides a web UI for managing the PostgreSQL database. Run `pnpm start` first to ensure Postgres and CloudBeaver are running.

1. Open http://localhost:3101
2. On first run, create an admin account (username and password of your choice)
3. Add a new database connection:
   - **Connection type:** PostgreSQL
   - **Host:** `postgres` (the Docker service name, not `localhost`)
   - **Port:** `5432`
   - **Database:** `flowclass`
   - **Username:** `postgres`
   - **Password:** `postgres`

## Common commands

```bash
pnpm start        # Run entire app (Docker + install + dev)
pnpm dev          # Start all apps (web, api, admin)
pnpm dev:web      # Start web only
pnpm dev:api      # Start API only
pnpm dev:admin    # Start admin only
pnpm build
pnpm lint
pnpm type-check
pnpm test
pnpm evaluate:functionality
```

## Contributing

1. Fork and clone the repository.
2. Create a branch for your change.
3. Run lint, type-check, and functional evaluation before opening a PR.
4. Submit a PR with a clear test plan.

## Licenses

- Root open-source code: MIT (`LICENSE`)
- Self-host/server copyleft terms: AGPL-3.0 (`LICENSE-AGPL`)

---

## Docker deployment

```bash
docker compose up --build
```

This Docker setup runs:

- `postgres` for the primary database (data persists in a Docker volume named `postgres-data`),
- `cloudbeaver` at http://localhost:3101 for database management (see [CloudBeaver (Database Management)](#cloudbeaver-database-management) above)
- `api` on `http://localhost:3100`,
- `admin` on `http://localhost:3000`,
- `web` on `http://localhost:3001`.

Uploaded media is stored in a Docker named volume `media-data` (mounted at `/workspace/uploads` in the API container) and served by the API (`/media/file/*`). CloudBeaver data (connections, settings) persists in `cloudbeaver-data`. Data persists across container restarts. No S3 bucket is required.

## Manual setup

If you prefer to run services manually instead of `pnpm start`:

```bash
docker compose up postgres smtp cloudbeaver -d
pnpm install
cp .env.example .env
pnpm dev
```

## Open-source mode defaults

This repository is configured for open-source distribution:

- subscription/paywall flows are disabled in this open-source build,
- no production secrets are stored in source control,
- environment variables must be provided via the root `.env` file (copy from `.env.example`).

## Workspace layout

- `apps/web` - Next.js frontend
- `apps/api` - Nest.js backend
- `apps/admin` - Vite + React admin app

## Prerequisites

- **Node.js 24** (use `nvm use` or `fnm use` if you have `.nvmrc` / `.node-version`)
- **pnpm** (>=10)
- **Docker** (for PostgreSQL and SMTP)
