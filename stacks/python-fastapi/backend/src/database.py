from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from src.config import settings


def get_database_url() -> str:
    match settings.DB_DRIVER:
        case "postgres":
            return (
                f"postgresql+asyncpg://{settings.DB_USER}:{settings.DB_PASSWORD}"
                f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
            )
        case "mysql":
            return (
                f"mysql+aiomysql://{settings.MYSQL_USER}:{settings.MYSQL_PASSWORD}"
                f"@{settings.MYSQL_HOST}:{settings.MYSQL_PORT}/{settings.MYSQL_DATABASE}"
            )
        case "sqlite3":
            return f"sqlite+aiosqlite:///{settings.SQLITE_PATH}"
        case _:
            raise ValueError(f"Unsupported DB_DRIVER: {settings.DB_DRIVER}")


engine: AsyncEngine = create_async_engine(get_database_url(), echo=False)


async def check_connection() -> bool:
    try:
        async with engine.connect() as conn:
            await conn.execute(
                __import__("sqlalchemy").text("SELECT 1")
            )
        return True
    except Exception:
        return False
