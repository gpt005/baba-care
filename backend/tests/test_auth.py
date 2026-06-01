from __future__ import annotations

import importlib

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("INVOICE_API_KEY", "test-secret")
    import app.main as main

    importlib.reload(main)
    return TestClient(main.app)


def test_health_open(client: TestClient) -> None:
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"ok": True}


def test_auth_check_rejects_missing_key(client: TestClient) -> None:
    res = client.get("/auth/check")
    assert res.status_code == 401


def test_auth_check_rejects_wrong_key(client: TestClient) -> None:
    res = client.get("/auth/check", headers={"X-API-Key": "nope"})
    assert res.status_code == 401


def test_auth_check_accepts_correct_key(client: TestClient) -> None:
    res = client.get("/auth/check", headers={"X-API-Key": "test-secret"})
    assert res.status_code == 200
    assert res.json() == {"ok": True}
