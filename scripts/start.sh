#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Checking Docker..."
if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Attempting to start Docker Desktop..."
  if [[ "$(uname)" == "Darwin" ]]; then
    open -a Docker
    echo "Waiting for Docker to start (this may take 30-60 seconds)..."
    max_attempts=90
    attempt=0
    until docker info >/dev/null 2>&1; do
      attempt=$((attempt + 1))
      if [[ $attempt -ge $max_attempts ]]; then
        echo "Error: Docker did not start in time. Please start Docker Desktop manually and try again."
        exit 1
      fi
      sleep 1
    done
    echo "Docker is ready."
  else
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
  fi
fi

echo "==> Starting PostgreSQL, SMTP (Mailpit), and CloudBeaver..."
docker compose up postgres smtp cloudbeaver -d

echo "==> Waiting for PostgreSQL to be ready..."
sleep 2
max_attempts=30
attempt=0
until docker compose exec -T postgres pg_isready -U postgres -q 2>/dev/null; do
  attempt=$((attempt + 1))
  if [[ $attempt -ge $max_attempts ]]; then
    echo "Error: PostgreSQL did not become ready in time."
    exit 1
  fi
  sleep 1
done
echo "PostgreSQL is ready."

if [[ ! -f .env ]]; then
  echo "==> Creating .env from .env.example..."
  cp .env.example .env
  echo "Created .env. You may need to edit it with your database credentials."
else
  echo "==> .env already exists."
fi

echo "==> Installing dependencies..."
pnpm install

echo "==> Starting all apps (web, api, admin)..."
pnpm dev
