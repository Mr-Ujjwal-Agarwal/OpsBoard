# OpsBoard

**Cloud-native GitOps deployment platform** — a lightweight task management app used as the workload for demonstrating production-grade DevOps practices.

OpsBoard's application layer is deliberately simple. Its infrastructure, deployment pipeline, and operational tooling are the actual point of the project.

```
Developer → GitHub → GitHub Actions → Docker Build → Container Registry
          → ArgoCD → Kubernetes → Ingress → OpsBoard → Prometheus → Grafana
```

This repository currently implements the application and its local containerized environment (the first half of that pipeline). The GitOps/Kubernetes/observability half is being added in a follow-up phase — see [Roadmap](#roadmap).

## Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, TypeScript, TailwindCSS, Axios |
| Backend | FastAPI, Python 3.12, SQLAlchemy 2.0, Pydantic v2 |
| Database | PostgreSQL 16 |
| Local orchestration | Docker, Docker Compose |
| Future deployment | GitHub Actions, Kubernetes, ArgoCD, Prometheus, Grafana |

## Quickstart

```bash
git clone <this-repo>
cd opsboard
cp .env.example .env
docker compose up --build
```

Once the containers are healthy:

- Frontend: [http://localhost:8080](http://localhost:8080)
- Backend API docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)
- Backend health check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

See [`docs/local-development.md`](docs/local-development.md) for details, and [`docs/docker-guide.md`](docs/docker-guide.md) for how the containers are built and wired together.

## Features

- Dashboard with live statistics (total, in-progress, completed, completion rate)
- Create, update, delete tasks
- Mark tasks complete with one click
- Search tasks by title/description
- Filter tasks by status and priority
- Fully documented REST API with interactive Swagger and ReDoc UIs
- Kubernetes-ready health, readiness, and liveness endpoints

Deliberately out of scope: authentication, user accounts, RBAC, payments, notifications. See [`docs/architecture.md`](docs/architecture.md) for the reasoning.

## Repository structure

```
opsboard/
├── frontend/          React + Vite + TypeScript dashboard
├── backend/            FastAPI service (clean architecture: routers → services → models)
├── docker/             Postgres init scripts
├── docs/                Architecture, API, and operational documentation
├── kubernetes/          Reserved for future phase
├── argocd/               Reserved for future phase
├── monitoring/           Reserved for future phase
├── helm/                 Reserved for future phase
├── .github/workflows/    Reserved for future phase
└── docker-compose.yml    Local multi-container orchestration
```

Full breakdown in [`docs/architecture.md`](docs/architecture.md#folder-structure).

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — system design, folder structure, design decisions
- [`docs/api.md`](docs/api.md) — REST API reference
- [`docs/local-development.md`](docs/local-development.md) — running the stack locally, with and without Docker
- [`docs/docker-guide.md`](docs/docker-guide.md) — how each Dockerfile and the compose stack work

## Roadmap

- [x] Backend: FastAPI service with full CRUD, health/readiness/liveness probes
- [x] Frontend: React dashboard with search, filters, and statistics
- [x] Docker: multi-stage builds, docker-compose orchestration
- [x] Documentation
- [ ] GitHub Actions CI/CD (build, test, publish images)
- [ ] Kubernetes manifests
- [ ] ArgoCD GitOps deployment
- [ ] Prometheus metrics + alerting
- [ ] Grafana dashboards

## License

[MIT](LICENSE)
