# Architecture

## Design philosophy

OpsBoard exists to demonstrate cloud-native DevOps engineering, not application engineering. That leads to one governing rule throughout this repository: **keep the application simple, make the infrastructure and engineering practices around it excellent.**

Concretely, that means:

- No authentication, RBAC, payments, or notifications — every one of those would add surface area that distracts from the deployment story without adding to it.
- A backend structured with clean separation of concerns (routers / services / models / schemas) even though the domain logic itself is a single entity, because the structure is what needs to scale, not the feature set.
- Health, readiness, and liveness endpoints exist from day one, before Kubernetes is introduced, because they are a backend concern that Kubernetes will later consume — not the other way around.
- Every configuration value is sourced from environment variables, with no hardcoded hosts, credentials, or URLs anywhere in application code, because that's the only way the same image runs unmodified in Compose today and Kubernetes tomorrow.

## System overview

Three containers, one Docker network, one named volume:

```
┌──────────────────────────────────────────────────────────────┐
│                      opsboard-network (bridge)                │
│                                                                 │
│   ┌────────────┐      ┌────────────┐      ┌────────────┐      │
│   │  frontend  │ HTTP │  backend   │ TCP  │  postgres  │      │
│   │  (nginx)   │─────▶│ (uvicorn)  │─────▶│            │      │
│   │  :8080     │ /api │  :8000     │ 5432 │  :5432     │      │
│   └────────────┘      └────────────┘      └─────┬──────┘      │
│                                                    │             │
│                                          postgres_data volume   │
└──────────────────────────────────────────────────────────────┘
```

The frontend never talks to Postgres directly, and the browser never talks to the backend directly in the containerized deployment — nginx proxies `/api/*` requests to the backend container. This mirrors how a Kubernetes Ingress will route traffic in the future deployment, so the request path doesn't change shape when the app moves from Compose to Kubernetes.

## Backend: clean architecture

```
backend/app/
├── api/routers/     HTTP layer only: request/response shapes, status codes
├── services/        Business logic: querying, filtering, mutations
├── models/          SQLAlchemy ORM entities
├── schemas/         Pydantic request/response contracts
├── database/        Engine, session management, table creation, seeding
├── config/          Environment-variable-driven settings
├── core/            Logging configuration, exception handling
└── main.py          Composition root: wires everything together
```

Routers depend on services; services depend on the database session; nothing depends on FastAPI except the routers themselves. This means the service layer (`TaskService`) could be reused by a CLI, a background worker, or a test suite without any FastAPI-specific code getting in the way — which is exactly what the test suite in `backend/tests/` does.

Schemas are kept separate from models on purpose: `TaskCreate`, `TaskUpdate`, and `TaskRead` describe the public API contract, while `Task` (the ORM model) describes the database schema. They currently look similar, but decoupling them means either can change independently — for example, adding an internal-only database column later wouldn't automatically leak into the API response.

## Why three distinct probe endpoints

| Endpoint | Answers | Checks dependencies? | Backs (future) |
|---|---|---|---|
| `/api/health` | "Is this service generally OK?" | No | Uptime monitoring, humans |
| `/api/ready` | "Can this instance serve traffic right now?" | Yes — database connectivity | Kubernetes `readinessProbe` |
| `/api/live` | "Is this process still alive?" | No | Kubernetes `livenessProbe` |

The separation matters in production: if the database has a brief outage, `/api/ready` should fail (so Kubernetes stops routing traffic to the pod) but `/api/live` should keep succeeding (so Kubernetes doesn't kill and restart a pod that would recover the moment the database comes back). Conflating the two would cause unnecessary restarts during transient database issues.

## Frontend structure

```
frontend/src/
├── components/    Presentational, reusable UI pieces (one folder per component)
├── pages/         Route-level composition (currently just Dashboard)
├── hooks/         Data-fetching and state logic (useTasks, useDebouncedValue)
├── services/      Axios client and typed API functions
├── types/         Shared TypeScript types mirroring backend schemas
└── utils/         Formatting helpers
```

All data fetching lives in `useTasks`; components receive data and callbacks as props and contain no direct API calls. This keeps components trivially testable and means the data layer could be swapped (e.g. for React Query) without touching a single component.

## Folder structure

```
opsboard/
├── frontend/
│   ├── src/
│   │   ├── components/{Navbar,StatCards,TaskTable,SearchBar,Filters,TaskModal,StatusBadge,PriorityBadge,states}/
│   │   ├── pages/Dashboard/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/routers/       (health.py, tasks.py)
│   │   ├── services/           (task_service.py)
│   │   ├── models/              (task.py)
│   │   ├── schemas/             (task.py, common.py)
│   │   ├── database/            (session.py, init_db.py)
│   │   ├── config/               (settings.py)
│   │   ├── core/                  (logging.py, exceptions.py)
│   │   └── main.py
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── docker/postgres/init.sql
├── docs/
├── kubernetes/          (reserved)
├── argocd/               (reserved)
├── monitoring/            (reserved)
├── helm/                   (reserved)
├── .github/workflows/       (reserved)
├── docker-compose.yml
└── .env.example
```

The `kubernetes/`, `argocd/`, `monitoring/`, `helm/`, and `.github/workflows/` directories exist now, empty, so the repository's top-level shape never changes as the deployment pipeline is built out — only their contents grow.

## Future deployment flow

```
Developer → GitHub repository → GitHub Actions (CI: build, test, lint)
         → Docker build → Container registry (versioned images)
         → ArgoCD (GitOps: detects manifest changes, syncs cluster state)
         → Kubernetes cluster → Ingress → OpsBoard pods
         → Prometheus (scrapes metrics) → Grafana (visualizes them)
```

Nothing in the current application needs to change to support this. The backend already exposes the probes Kubernetes needs, reads all configuration from environment variables (which become ConfigMaps/Secrets), and is packaged as a single, immutable, non-root container image — the three things a workload needs to be Kubernetes-ready before a single YAML manifest is written.
