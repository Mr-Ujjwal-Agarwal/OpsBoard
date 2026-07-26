"""
Shared response envelopes used across multiple routers.
"""

from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class HealthResponse(BaseModel):
    """Response body for health, readiness, and liveness endpoints."""

    model_config = ConfigDict(json_schema_extra={"example": {"status": "ok", "service": "opsboard-api"}})

    status: str
    service: str
    version: str | None = None
    detail: str | None = None


class MessageResponse(BaseModel):
    """Generic success message response, e.g. after a delete operation."""

    success: bool = True
    message: str


class ErrorResponse(BaseModel):
    """Generic error response shape returned by exception handlers."""

    success: bool = False
    error: str
    details: Any | None = None
