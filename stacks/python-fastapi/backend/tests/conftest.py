import pytest
from fastapi.testclient import TestClient

from src.main import app
from src.routers import root as root_module


@pytest.fixture()
def client():
    """Create a test client with the database check_connection mocked out."""
    original = root_module.check_connection

    async def fake_check_connection():
        return False

    root_module.check_connection = fake_check_connection
    try:
        with TestClient(app) as c:
            yield c
    finally:
        root_module.check_connection = original
