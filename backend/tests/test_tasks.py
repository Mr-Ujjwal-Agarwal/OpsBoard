"""Tests for the task management API."""


def _create_task(client, **overrides):
    payload = {
        "title": "Write unit tests",
        "description": "Cover the task service with pytest.",
        "status": "pending",
        "priority": "high",
    }
    payload.update(overrides)
    response = client.post("/api/tasks", json=payload)
    assert response.status_code == 201
    return response.json()


def test_create_task(client):
    task = _create_task(client)
    assert task["title"] == "Write unit tests"
    assert task["status"] == "pending"
    assert task["priority"] == "high"
    assert "id" in task
    assert "created_at" in task


def test_create_task_requires_title(client):
    response = client.post("/api/tasks", json={"description": "No title provided"})
    assert response.status_code == 422


def test_list_tasks_returns_created_task(client):
    _create_task(client, title="Task A")
    _create_task(client, title="Task B")

    response = client.get("/api/tasks")
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 2
    titles = {item["title"] for item in body["items"]}
    assert titles == {"Task A", "Task B"}


def test_search_tasks_by_title(client):
    _create_task(client, title="Deploy to Kubernetes")
    _create_task(client, title="Update Grafana dashboard")

    response = client.get("/api/tasks", params={"search": "kubernetes"})
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["title"] == "Deploy to Kubernetes"


def test_filter_tasks_by_status_and_priority(client):
    _create_task(client, title="Low priority pending", status="pending", priority="low")
    _create_task(client, title="High priority pending", status="pending", priority="high")
    _create_task(client, title="High priority done", status="completed", priority="high")

    response = client.get("/api/tasks", params={"status": "pending", "priority": "high"})
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["title"] == "High priority pending"


def test_get_task_by_id(client):
    created = _create_task(client)
    response = client.get(f"/api/tasks/{created['id']}")
    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


def test_get_task_not_found_returns_404(client):
    response = client.get("/api/tasks/999999")
    assert response.status_code == 404
    body = response.json()
    assert body["success"] is False


def test_update_task_partial(client):
    created = _create_task(client)
    response = client.patch(f"/api/tasks/{created['id']}", json={"status": "in_progress"})
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "in_progress"
    assert body["title"] == created["title"]  # unchanged


def test_mark_task_complete(client):
    created = _create_task(client, status="in_progress")
    response = client.post(f"/api/tasks/{created['id']}/complete")
    assert response.status_code == 200
    assert response.json()["status"] == "completed"


def test_delete_task(client):
    created = _create_task(client)
    response = client.delete(f"/api/tasks/{created['id']}")
    assert response.status_code == 200
    assert response.json()["success"] is True

    follow_up = client.get(f"/api/tasks/{created['id']}")
    assert follow_up.status_code == 404


def test_statistics(client):
    _create_task(client, status="pending", priority="low")
    _create_task(client, status="in_progress", priority="medium")
    _create_task(client, status="completed", priority="high")
    _create_task(client, status="completed", priority="high")

    response = client.get("/api/tasks/statistics")
    assert response.status_code == 200
    stats = response.json()
    assert stats["total"] == 4
    assert stats["pending"] == 1
    assert stats["in_progress"] == 1
    assert stats["completed"] == 2
    assert stats["high_priority"] == 2
    assert stats["completion_rate"] == 50.0
