from fastapi import APIRouter, Request

router = APIRouter()


@router.post("/api/echo")
async def echo(request: Request):
    try:
        body = await request.json()
    except Exception:
        body = {}
    return body
