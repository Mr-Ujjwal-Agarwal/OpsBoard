"""
Task service layer.

Contains all business logic for working with tasks. Routers stay thin and
only handle HTTP concerns (status codes, request/response schemas); all
querying, filtering, and mutation logic lives here so it can be tested and
reused independently of the web framework.
"""

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.exceptions import TaskNotFoundError
from app.core.logging import get_logger
from app.models.task import Priority, Status, Task
from app.schemas.task import TaskCreate, TaskStatistics, TaskUpdate

logger = get_logger(__name__)


class TaskService:
    """Encapsulates all task-related database operations."""

    def __init__(self, db: Session):
        self.db = db

    def list_tasks(
        self,
        search: str | None = None,
        status: Status | None = None,
        priority: Priority | None = None,
    ) -> list[Task]:
        """Return tasks optionally filtered by search text, status, and priority."""
        query = self.db.query(Task)

        if search:
            like_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(Task.title.ilike(like_pattern), Task.description.ilike(like_pattern))
            )

        if status is not None:
            query = query.filter(Task.status == status)

        if priority is not None:
            query = query.filter(Task.priority == priority)

        return query.order_by(Task.created_at.desc()).all()

    def get_task(self, task_id: int) -> Task:
        """Return a single task by id, or raise TaskNotFoundError."""
        task = self.db.get(Task, task_id)
        if task is None:
            raise TaskNotFoundError(task_id)
        return task

    def create_task(self, payload: TaskCreate) -> Task:
        """Create and persist a new task."""
        task = Task(
            title=payload.title,
            description=payload.description,
            status=payload.status,
            priority=payload.priority,
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        logger.info("Created task id=%s title=%r", task.id, task.title)
        return task

    def update_task(self, task_id: int, payload: TaskUpdate) -> Task:
        """Apply a partial update to an existing task."""
        task = self.get_task(task_id)

        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)

        self.db.commit()
        self.db.refresh(task)
        logger.info("Updated task id=%s fields=%s", task.id, list(update_data.keys()))
        return task

    def mark_complete(self, task_id: int) -> Task:
        """Convenience operation to set a task's status to completed."""
        task = self.get_task(task_id)
        task.status = Status.COMPLETED
        self.db.commit()
        self.db.refresh(task)
        logger.info("Marked task id=%s as completed", task.id)
        return task

    def delete_task(self, task_id: int) -> None:
        """Delete a task by id."""
        task = self.get_task(task_id)
        self.db.delete(task)
        self.db.commit()
        logger.info("Deleted task id=%s", task_id)

    def get_statistics(self) -> TaskStatistics:
        """Compute aggregate statistics across all tasks in a single query."""
        rows = self.db.query(Task.status, Task.priority, func.count(Task.id)).group_by(
            Task.status, Task.priority
        ).all()

        total = 0
        status_counts = {Status.PENDING: 0, Status.IN_PROGRESS: 0, Status.COMPLETED: 0}
        priority_counts = {Priority.LOW: 0, Priority.MEDIUM: 0, Priority.HIGH: 0}

        for status_value, priority_value, count in rows:
            total += count
            status_counts[status_value] += count
            priority_counts[priority_value] += count

        completion_rate = round((status_counts[Status.COMPLETED] / total) * 100, 2) if total else 0.0

        return TaskStatistics(
            total=total,
            pending=status_counts[Status.PENDING],
            in_progress=status_counts[Status.IN_PROGRESS],
            completed=status_counts[Status.COMPLETED],
            low_priority=priority_counts[Priority.LOW],
            medium_priority=priority_counts[Priority.MEDIUM],
            high_priority=priority_counts[Priority.HIGH],
            completion_rate=completion_rate,
        )
