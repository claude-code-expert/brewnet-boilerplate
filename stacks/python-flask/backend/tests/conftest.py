import os

import pytest

# Force SQLite in-memory before app is created
os.environ["DB_DRIVER"] = "sqlite3"
os.environ["SQLITE_PATH"] = ":memory:"

from src import create_app


@pytest.fixture()
def app():
    """Create a Flask application configured for testing."""
    app = create_app()
    app.config["TESTING"] = True
    return app


@pytest.fixture()
def client(app):
    """Create a test client for the Flask application."""
    return app.test_client()
