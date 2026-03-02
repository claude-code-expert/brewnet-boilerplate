import sys
import json
from datetime import datetime, timezone

from flask import request, jsonify

from src.database import check_connection


def register_routes(app):

    @app.route("/", methods=["GET"])
    def root():
        return jsonify({
            "service": "flask-backend",
            "status": "running",
            "message": "Hello Brewnet (https://www.brewnet.dev)",
        })

    @app.route("/health", methods=["GET"])
    def health():
        db_connected = check_connection()
        return jsonify({
            "status": "ok",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "db_connected": db_connected,
        })

    @app.route("/api/hello", methods=["GET"])
    def hello():
        version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
        return jsonify({
            "message": "Hello from Flask!",
            "lang": "python",
            "version": version,
        })

    @app.route("/api/echo", methods=["POST"])
    def echo():
        try:
            body = request.get_json(force=True)
        except Exception:
            body = {}
        if body is None:
            body = {}
        return jsonify(body)
