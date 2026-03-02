from datetime import datetime, timezone

from fastapi import APIRouter

from src.database import check_connection

router = APIRouter()


@router.get("/")
async def root():
    return {
        "service": "fastapi-backend",
        "status": "running",
        "message": "Hello Brewnet (https://www.brewnet.dev)",
    }


@router.get("/health")
async def health():
    db_connected = await check_connection()
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "db_connected": db_connected,
    }
