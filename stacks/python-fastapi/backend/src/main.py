from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routers import root, hello, echo

app = FastAPI(title="Brewnet Python Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

app.include_router(root.router)
app.include_router(hello.router)
app.include_router(echo.router)
