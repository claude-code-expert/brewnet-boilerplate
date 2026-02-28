import sys

from fastapi import APIRouter

router = APIRouter()


@router.get("/api/hello")
async def hello():
    version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    return {
        "message": "Hello from FastAPI!",
        "lang": "python",
        "version": version,
    }
