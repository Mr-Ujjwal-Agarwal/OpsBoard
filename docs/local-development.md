# Local development guide

## Option A: run everything with Docker Compose (recommended)

Prerequisites: Docker and Docker Compose.

```bash
cp .env.example .env
docker compose up --build
```

This builds the frontend and backend images and starts three containers: `postgres`, `backend`, `frontend`. Compose brings them up in dependency order — `backend` waits for Postgres to report healthy, and `frontend` waits for the backend to report healthy — via `depends_on: condition: service_healthy`.

On backend startup, SQLAlchemy creates the `tasks` table if it doesn't exist, and seeds six sample tasks if the table is empty (disable this by setting `SEED_DATABASE=false` in `.env`).

Once running:

| Service | URL |
|---|---|
| Frontend | http://localhost:8080 |
| Backend API docs | http://localhost:8000/docs |
| Backend health check | http://localhost:8000/api/health |

Stop everything with `Ctrl+C`, or run in the background with `docker compose up --build -d` and stop with `docker compose down`. To also remove the database volume (wiping all data), use `docker compose down -v`.

See [`docker-guide.md`](docker-guide.md) for details on what each Dockerfile does.

## Option B: run services individually (faster iteration)

Useful when actively developing the frontend or backend and you want hot-reload without rebuilding images.

### 1. Start only Postgres via Docker

```bash
docker compose up postgres -d
```

### 2. Run the backend locally

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt

export POSTGRES_HOST=localhost   # override the in-network hostname
export CORS_ORIGINS=http://localhost:5173

uvicorn app.main:app --reload --port 8000
```

The backend is now running at http://localhost:8000 with hot-reload enabled, connected to the Postgres container via `localhost:5432`.

### 3. Run the frontend locally

```bash
cd frontend
npm install
export VITE_API_BASE_URL=http://localhost:8000/api
npm run dev
```

The frontend dev server runs at http://localhost:5173 with hot module replacement, calling the locally running backend directly (no nginx proxy in this mode).

## Running backend tests

```bash
cd backend
pip install -r requirements.txt
pytest
```

Tests run against an isolated in-memory SQLite database (see `backend/tests/conftest.py`) and never touch the Postgres container, so they're fast and require no setup.

## Common issues

**Port already in use.** Change the relevant `*_EXPOSED_PORT` variable in `.env` (e.g. `FRONTEND_EXPOSED_PORT=8081`) and re-run `docker compose up --build`.

**Frontend can't reach the backend after `npm run dev`.** Confirm `VITE_API_BASE_URL` is set and points at `http://localhost:8000/api` — in dev-server mode there's no nginx proxy to fall back on a relative `/api` path.

**Backend can't reach Postgres when run outside Docker.** Confirm `POSTGRES_HOST=localhost` is set; the default (`postgres`) is a Docker network hostname that only resolves inside the compose network.
