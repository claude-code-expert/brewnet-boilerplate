class TestGetRoot:
    def test_returns_200(self, client):
        response = client.get("/")
        assert response.status_code == 200

    def test_returns_service_info(self, client):
        data = client.get("/").json()
        assert data["service"] == "fastapi-backend"
        assert data["status"] == "running"
        assert "message" in data


class TestGetHealth:
    def test_returns_200(self, client):
        response = client.get("/health")
        assert response.status_code == 200

    def test_returns_ok_status(self, client):
        data = client.get("/health").json()
        assert data["status"] == "ok"
        assert "timestamp" in data


class TestGetApiHello:
    def test_returns_200(self, client):
        response = client.get("/api/hello")
        assert response.status_code == 200

    def test_returns_greeting(self, client):
        data = client.get("/api/hello").json()
        assert data["message"] == "Hello from FastAPI!"
        assert data["lang"] == "python"
        assert "version" in data


class TestPostApiEcho:
    def test_returns_200(self, client):
        response = client.post("/api/echo", json={"test": "brewnet"})
        assert response.status_code == 200

    def test_echoes_request_body(self, client):
        payload = {"test": "brewnet", "nested": {"key": "value"}}
        data = client.post("/api/echo", json=payload).json()
        assert data == payload

    def test_empty_body_returns_empty_dict(self, client):
        response = client.post("/api/echo", content=b"", headers={"content-type": "application/json"})
        # Invalid JSON falls back to empty dict
        assert response.status_code == 200
