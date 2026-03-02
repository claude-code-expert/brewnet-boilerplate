import os


def get_database_uri():
    driver = os.getenv("DB_DRIVER", "postgres")

    if driver == "postgres":
        return (
            f"postgresql://{os.getenv('DB_USER', 'brewnet')}:{os.getenv('DB_PASSWORD', '')}"
            f"@{os.getenv('DB_HOST', 'postgres')}:{os.getenv('DB_PORT', '5432')}"
            f"/{os.getenv('DB_NAME', 'brewnet_db')}"
        )
    elif driver == "mysql":
        return (
            f"mysql+pymysql://{os.getenv('MYSQL_USER', 'brewnet')}:{os.getenv('MYSQL_PASSWORD', '')}"
            f"@{os.getenv('MYSQL_HOST', 'mysql')}:{os.getenv('MYSQL_PORT', '3306')}"
            f"/{os.getenv('MYSQL_DATABASE', 'brewnet_db')}"
        )
    elif driver == "sqlite3":
        path = os.getenv("SQLITE_PATH", "/app/data/brewnet_db.db")
        return f"sqlite:///{path}"
    else:
        raise ValueError(f"Unsupported DB_DRIVER: {driver}")
