from sqlalchemy import text
from src import db


def check_connection():
    try:
        db.session.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
