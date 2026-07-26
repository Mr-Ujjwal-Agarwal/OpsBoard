"""
Task Pydantic schemas.

Separates the API-facing data contracts (request/response bodies) from the
internal ORM model, so the database schema can evolve independently of the
public API surface.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.task import Priority, Status


class TaskBase(BaseModel):
    """Fields shared by task creation and update payloads."""

    title: str = Field(..., min_length=1, max_length=200, description="Short, descriptive task title")
    description: str | None = Field(default=None, max_length=5000, description="Optional longer description")
    status: Status = Field(default=Status.PENDING, description="Current lifecycle status of the task")
    priority: Priority = Field(default=Priority.MEDIUM, description="Priority level of the task")


class TaskCreate(TaskBase):
    """Payload for creating a new task."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": "Write deployment documentation",
                "description": "Document the docker compose and future Kubernetes workflow.",
                "status": "pending",
                "priority": "medium",
            }
        }
    )


class TaskUpdate(BaseModel):
    """Payload for updating an existing task. All fields are optional (partial update)."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    status: Status | None = None
    priority: Priority | None = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {"status": "completed"}
        }
    )


class TaskRead(TaskBase):
    """Full task representation returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class TaskListResponse(BaseModel):
    """Envelope wrapping a list of tasks with the total count."""

    total: int
    items: list[TaskRead]


class TaskStatistics(BaseModel):
    """Aggregate statistics about tasks, used to populate dashboard stat cards."""

    total: int
    pending: int
    in_progress: int
    completed: int
    low_priority: int
    medium_priority: int
    high_priority: int
    completion_rate: float = Field(..., description="Percentage of tasks completed, 0-100")
