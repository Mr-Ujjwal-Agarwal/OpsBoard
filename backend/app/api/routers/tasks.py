"""
Task router.

Exposes the full REST API for task management. All business logic is
delegated to TaskService; this module is responsible only for HTTP
concerns: routing, status codes, and request/response schemas.
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.task import Priority, Status
from app.schemas.common import MessageResponse
from app.schemas.task import TaskCreate, TaskListResponse, TaskRead, TaskStatistics, TaskUpdate
from app.services.task_service import TaskService

router = APIRouter(prefix="/tasks", tags=["Tasks"])


def get_task_service(db: Session = Depends(get_db)) -> TaskService:
    """Dependency that builds a TaskService bound to the current request's DB session."""
    return TaskService(db)


@router.get(
    "",
    response_model=TaskListResponse,
    summary="List tasks",
    description="List all tasks, optionally filtered by search text, status, and priority.",
)
def list_tasks(
    search: str | None = Query(default=None, description="Case-insensitive match against title/description"),
    status_filter: Status | None = Query(default=None, alias="status", description="Filter by task status"),
    priority: Priority | None = Query(default=None, description="Filter by task priority"),
    service: TaskService = Depends(get_task_service),
) -> TaskListResponse:
    tasks = service.list_tasks(search=search, status=status_filter, priority=priority)
    return TaskListResponse(total=len(tasks), items=tasks)


@router.get(
    "/statistics",
    response_model=TaskStatistics,
    summary="Get task statistics",
    description="Aggregate counts by status and priority, used for dashboard stat cards.",
)
def get_statistics(service: TaskService = Depends(get_task_service)) -> TaskStatistics:
    return service.get_statistics()


@router.get(
    "/{task_id}",
    response_model=TaskRead,
    summary="Get a task by id",
)
def get_task(task_id: int, service: TaskService = Depends(get_task_service)) -> TaskRead:
    return service.get_task(task_id)


@router.post(
    "",
    response_model=TaskRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a task",
)
def create_task(payload: TaskCreate, service: TaskService = Depends(get_task_service)) -> TaskRead:
    return service.create_task(payload)


@router.patch(
    "/{task_id}",
    response_model=TaskRead,
    summary="Update a task",
    description="Partially update a task. Only provided fields are changed.",
)
def update_task(
    task_id: int, payload: TaskUpdate, service: TaskService = Depends(get_task_service)
) -> TaskRead:
    return service.update_task(task_id, payload)


@router.post(
    "/{task_id}/complete",
    response_model=TaskRead,
    summary="Mark a task as complete",
)
def complete_task(task_id: int, service: TaskService = Depends(get_task_service)) -> TaskRead:
    return service.mark_complete(task_id)


@router.delete(
    "/{task_id}",
    response_model=MessageResponse,
    summary="Delete a task",
)
def delete_task(task_id: int, service: TaskService = Depends(get_task_service)) -> MessageResponse:
    service.delete_task(task_id)
    return MessageResponse(message=f"Task {task_id} deleted successfully.")
