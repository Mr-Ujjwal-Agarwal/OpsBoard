"""
Database initialization.

Creates all tables from the ORM metadata on application startup and,
when enabled via configuration, seeds the database with a small set of
representative tasks so a freshly started environment isn't empty.
"""

from sqlalchemy.orm import Session

from app.config.settings import get_settings
from app.core.logging import get_logger
from app.database.session import Base, SessionLocal, engine
from app.models.task import Priority, Status, Task

logger = get_logger(__name__)
settings = get_settings()

_SEED_TASKS = [
    {
        "title": "Set up CI pipeline",
        "description": "Configure GitHub Actions to build, test, and push Docker images.",
        "status": Status.IN_PROGRESS,
        "priority": Priority.HIGH,
    },
    {
        "title": "Write Kubernetes manifests",
        "description": "Create deployment, service, and ingress manifests for OpsBoard.",
        "status": Status.PENDING,
        "priority": Priority.HIGH,
    },
    {
        "title": "Configure ArgoCD application",
        "description": "Point ArgoCD at the manifests repository for GitOps sync.",
        "status": Status.PENDING,
        "priority": Priority.MEDIUM,
    },
    {
        "title": "Add Prometheus scrape config",
        "description": "Expose and scrape metrics from the OpsBoard backend.",
        "status": Status.PENDING,
        "priority": Priority.MEDIUM,
    },
    {
        "title": "Build Grafana dashboard",
        "description": "Visualize request rate, latency, and error rate for OpsBoard.",
        "status": Status.PENDING,
        "priority": Priority.LOW,
    },
    {
        "title": "Write local development guide",
        "description": "Document how to run the full stack with docker compose.",
        "status": Status.COMPLETED,
        "priority": Priority.MEDIUM,
    },
]


def create_tables() -> None:
    """Create all database tables defined by the ORM models, if they don't exist."""
    logger.info("Creating database tables if they do not already exist.")
    Base.metadata.create_all(bind=engine)


def seed_database_if_empty() -> None:
    """Insert sample tasks when the tasks table is empty and seeding is enabled."""
    if not settings.seed_database:
        logger.info("Database seeding is disabled via configuration; skipping.")
        return

    db: Session = SessionLocal()
    try:
        existing_count = db.query(Task).count()
        if existing_count > 0:
            logger.info("Tasks table already contains %d rows; skipping seed.", existing_count)
            return

        logger.info("Seeding database with %d sample tasks.", len(_SEED_TASKS))
        for task_data in _SEED_TASKS:
            db.add(Task(**task_data))
        db.commit()
    finally:
        db.close()


def init_db() -> None:
    """Run all database initialization steps in order."""
    create_tables()
    seed_database_if_empty()
