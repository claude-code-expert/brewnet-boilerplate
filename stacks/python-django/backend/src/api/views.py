import json
import sys
from datetime import datetime, timezone

import django
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST


@require_GET
def root(request):
    return JsonResponse({
        "service": "django-backend",
        "status": "running",
        "message": "Hello Brewnet (https://www.brewnet.dev)",
    })


@require_GET
def health(request):
    db_connected = check_connection()
    return JsonResponse({
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "db_connected": db_connected,
    })


@require_GET
def hello(request):
    version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    return JsonResponse({
        "message": "Hello from Django!",
        "lang": "python",
        "version": version,
    })


@require_POST
def echo(request):
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        body = {}
    return JsonResponse(body)


def check_connection():
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return True
    except Exception:
        return False
