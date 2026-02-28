import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "brewnet-dev-secret-key")
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = ["src.api"]

MIDDLEWARE = [
    "src.config.cors.CorsMiddleware",
]

ROOT_URLCONF = "src.config.urls"
WSGI_APPLICATION = "src.config.wsgi.application"

# Multi-DB configuration driven by DB_DRIVER
DB_DRIVER = os.getenv("DB_DRIVER", "postgres")

if DB_DRIVER == "postgres":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "HOST": os.getenv("DB_HOST", "postgres"),
            "PORT": os.getenv("DB_PORT", "5432"),
            "NAME": os.getenv("DB_NAME", "brewnet"),
            "USER": os.getenv("DB_USER", "brewnet"),
            "PASSWORD": os.getenv("DB_PASSWORD", ""),
        }
    }
elif DB_DRIVER == "mysql":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "HOST": os.getenv("MYSQL_HOST", "mysql"),
            "PORT": os.getenv("MYSQL_PORT", "3306"),
            "NAME": os.getenv("MYSQL_DATABASE", "brewnet"),
            "USER": os.getenv("MYSQL_USER", "brewnet"),
            "PASSWORD": os.getenv("MYSQL_PASSWORD", ""),
        }
    }
elif DB_DRIVER == "sqlite3":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": os.getenv("SQLITE_PATH", "/app/data/brewnet.db"),
        }
    }
else:
    raise ValueError(f"Unsupported DB_DRIVER: {DB_DRIVER}")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
