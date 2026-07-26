"""
Task ORM model.

Defines the single domain entity for OpsBoard. Status and priority are
modeled as native Postgres enums for data integrity at the database layer,
not just at the API layer.
"""

import enum
from datetime import datetime, timezone

from sqlalchemy import Enum as SAEnum
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class Status(str, enum.Enum):
    """Lifecycle status of a task."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class Priority(str, enum.Enum):
    """Priority level of a task."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


def _utcnow() -> datetime:
    """Return the current UTC time. Used as a shared default factory."""
    return datetime.now(timezone.utc)


class Task(Base):
    """A single task tracked on the OpsBoard dashboard."""

    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[Status] = mapped_column(
        SAEnum(Status, name="task_status", native_enum=True),
        nullable=False,
        default=Status.PENDING,
        index=True,
    )
    priority: Mapped[Priority] = mapped_column(
        SAEnum(Priority, name="task_priority", native_enum=True),
        nullable=False,
        default=Priority.MEDIUM,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        nullable=False, default=_utcnow, onupdate=_utcnow
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging helper only
        return f"<Task id={self.id} title={self.title!r} status={self.status.value}>"
