"""Tests for the health, readiness, and liveness endpoints."""


def test_health_returns_ok(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "OpsBoard API"


def test_ready_returns_ready_when_db_reachable(client):
    response = client.get("/api/ready")
    assert response.status_code == 200
    assert response.json()["status"] == "ready"


def test_live_returns_alive(client):
    response = client.get("/api/live")
    assert response.status_code == 200
    assert response.json()["status"] == "alive"
