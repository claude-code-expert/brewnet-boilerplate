import os

# Override DB_DRIVER before Django settings are loaded so that
# src.config.settings picks SQLite in-memory instead of PostgreSQL.
os.environ["DB_DRIVER"] = "sqlite3"
os.environ["SQLITE_PATH"] = ":memory:"
