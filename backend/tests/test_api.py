import json


class TestGetRoot:
    def test_returns_200(self, client):
        response = client.get("/")
        assert response.status_code == 200

    def test_returns_service_info(self, client):
        data = json.loads(client.get("/").content)
        assert data["service"] == "django-backend"
        assert data["status"] == "running"
        assert "message" in data


class TestGetHealth:
    def test_returns_200(self, client):
        response = client.get("/health")
        assert response.status_code == 200

    def test_returns_ok_status(self, client):
        data = json.loads(client.get("/health").content)
        assert data["status"] == "ok"
        assert "timestamp" in data


class TestGetApiHello:
    def test_returns_200(self, client):
        response = client.get("/api/hello")
        assert response.status_code == 200

    def test_returns_greeting(self, client):
        data = json.loads(client.get("/api/hello").content)
        assert data["message"] == "Hello from Django!"
        assert data["lang"] == "python"
        assert "version" in data


class TestPostApiEcho:
    def test_returns_200(self, client):
        response = client.post(
            "/api/echo",
            data=json.dumps({"test": "brewnet"}),
            content_type="application/json",
        )
        assert response.status_code == 200

    def test_echoes_request_body(self, client):
        payload = {"test": "brewnet", "nested": {"key": "value"}}
        response = client.post(
            "/api/echo",
            data=json.dumps(payload),
            content_type="application/json",
        )
        data = json.loads(response.content)
        assert data == payload

    def test_empty_body_returns_empty_dict(self, client):
        response = client.post(
            "/api/echo",
            data="",
            content_type="application/json",
        )
        assert response.status_code == 200
        data = json.loads(response.content)
        assert data == {}
