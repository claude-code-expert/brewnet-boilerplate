from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DB_DRIVER: str = "postgres"

    # PostgreSQL
    DB_HOST: str = "postgres"
    DB_PORT: int = 5432
    DB_NAME: str = "brewnet_db"
    DB_USER: str = "brewnet"
    DB_PASSWORD: str = ""

    # MySQL
    MYSQL_HOST: str = "mysql"
    MYSQL_PORT: int = 3306
    MYSQL_DATABASE: str = "brewnet_db"
    MYSQL_USER: str = "brewnet"
    MYSQL_PASSWORD: str = ""

    # SQLite3
    SQLITE_PATH: str = "/app/data/brewnet_db.db"

    class Config:
        env_file = ".env"


settings = Settings()
