"""
Health, readiness, and liveness endpoints.

These three are intentionally distinct because they answer different
questions and, in a future Kubernetes deployment, back different probes:

- /api/health  -> general-purpose status check for humans and uptime tools.
- /api/ready   -> "can this instance serve traffic right now?" backs the
                  readinessProbe; checks the database connection.
- /api/live    -> "is this process still alive?" backs the livenessProbe;
                  never touches external dependencies so a slow database
                  never causes Kubernetes to kill a healthy process.
"""

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config.settings import get_settings
from app.core.logging import get_logger
from app.database.session import get_db
from app.schemas.common import HealthResponse

router = APIRouter(tags=["Health"])
logger = get_logger(__name__)
settings = get_settings()


@router.get("/health", response_model=HealthResponse, summary="General health check")
def health() -> HealthResponse:
    """Return basic service status. Does not check downstream dependencies."""
    return HealthResponse(status="ok", service=settings.app_name, version=settings.app_version)


@router.get("/ready", response_model=HealthResponse, summary="Readiness check")
def ready(db: Session = Depends(get_db)) -> JSONResponse:
    """
    Check whether the service is ready to receive traffic.

    Verifies the database connection is reachable. Returns 503 if not,
    which is what a Kubernetes readinessProbe expects in order to remove
    the pod from the service's load-balancing rotation.
    """
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:  # noqa: BLE001 - deliberately broad for a health check
        logger.error("Readiness check failed: database unreachable: %s", exc)
        body = HealthResponse(
            status="not_ready",
            service=settings.app_name,
            version=settings.app_version,
            detail="Database connection failed.",
        )
        return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content=body.model_dump())

    body = HealthResponse(status="ready", service=settings.app_name, version=settings.app_version)
    return JSONResponse(status_code=status.HTTP_200_OK, content=body.model_dump())


@router.get("/live", response_model=HealthResponse, summary="Liveness check")
def live() -> HealthResponse:
    """
    Check whether the process itself is alive and responsive.

    Intentionally has zero external dependencies so a struggling database
    does not cause Kubernetes to restart an otherwise-healthy pod.
    """
    return HealthResponse(status="alive", service=settings.app_name, version=settings.app_version)
