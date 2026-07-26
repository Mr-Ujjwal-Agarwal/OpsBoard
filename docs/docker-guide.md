# Docker guide

## Overview

Every service ships as a multi-stage build so the image that actually runs in production contains nothing needed only to build it — no compilers, no dev dependencies, no source maps' worth of unused tooling.

## Backend Dockerfile (`backend/Dockerfile`)

**Stage 1 — `builder`:** starts from `python:3.12-slim`, installs OS build tools (`build-essential`, `gcc`, `libpq-dev`) needed to compile `psycopg2-binary`, creates a virtual environment at `/opt/venv`, and installs Python dependencies into it.

**Stage 2 — `runtime`:** starts fresh from `python:3.12-slim`, installs only the runtime Postgres client library (`libpq5`, not the `-dev` headers) plus `curl` for the healthcheck, copies the pre-built virtual environment from the builder stage, copies the application source, and creates a non-root `app` user that the container runs as.

Result: no compiler toolchain, no build-time headers, and no root process in the final image.

```bash
# Build and run standalone (without compose), pointing at an external Postgres:
docker build -t opsboard-backend ./backend
docker run -p 8000:8000 \
  -e POSTGRES_HOST=host.docker.internal \
  -e POSTGRES_USER=opsboard -e POSTGRES_PASSWORD=opsboard -e POSTGRES_DB=opsboard \
  opsboard-backend
```

## Frontend Dockerfile (`frontend/Dockerfile`)

**Stage 1 — `builder`:** starts from `node:22-alpine`, installs npm dependencies, copies source, and runs `vite build` to produce a static `dist/` bundle. The `VITE_API_BASE_URL` build argument is baked into the JavaScript bundle at this point — Vite env vars are compile-time, not runtime, so changing this after the image is built requires a rebuild.

**Stage 2 — `runtime`:** starts from `nginx:1.27-alpine`, copies only the static `dist/` output and a custom `nginx.conf`. No Node.js, no npm, no source code ships in the final image — just static files and nginx.

`nginx.conf` does three things: serves the static SPA with a `try_files` fallback to `index.html` (so client-side routing survives a page refresh), proxies `/api/*` to the `backend` container so the browser only ever talks to one origin, and gzips text-based assets.

```bash
docker build -t opsboard-frontend ./frontend \
  --build-arg VITE_API_BASE_URL=/api
docker run -p 8080:8080 opsboard-frontend
```

Note: running the frontend image standalone (without compose) means the `/api` proxy target (`http://backend:8000`) won't resolve — it relies on Docker Compose's internal DNS, where service names double as hostnames.

## docker-compose.yml

Three services on a single bridge network (`opsboard-network`):

| Service | Image source | Exposes | Depends on |
|---|---|---|---|
| `postgres` | `postgres:16-alpine` | `5432` | — |
| `backend` | built from `./backend` | `8000` | `postgres` (healthy) |
| `frontend` | built from `./frontend` | `8080` | `backend` (healthy) |

**Healthchecks drive startup order.** Each service defines a `healthcheck`, and downstream services use `depends_on: condition: service_healthy` rather than just `depends_on: [service]`. Plain `depends_on` only waits for a container to *start*, not for the application inside it to be *ready* — Postgres accepting TCP connections is not the same moment as Postgres being ready to accept queries. Using `service_healthy` means the backend genuinely doesn't attempt to connect until `pg_isready` succeeds.

**Persistent storage.** The `postgres_data` named volume is mounted at `/var/lib/postgresql/data`, so data survives `docker compose down` (though not `docker compose down -v`, which explicitly removes volumes).

**Configuration.** Every environment variable in `docker-compose.yml` has a `${VAR:-default}` fallback, so `docker compose up --build` works immediately with no `.env` file present — but copying `.env.example` to `.env` first is recommended so you have a single place to change ports, credentials, or feature flags like `SEED_DATABASE`.

## Rebuilding after code changes

```bash
docker compose up --build          # rebuild changed images, restart
docker compose up --build backend  # rebuild and restart just one service
docker compose down -v             # stop everything and wipe the database volume
```
