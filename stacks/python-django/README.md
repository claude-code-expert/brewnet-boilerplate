# Brewnet -- Python-Django Stack

> Python 3.13+ / Django 6.0 / Django ORM / Gunicorn + React 19 / Vite 6 / TypeScript
>
> Python 3.13+ / Django 6.0 / Django ORM / Gunicorn + React 19 / Vite 6 / TypeScript

**Part of the [Brewnet Boilerplate](../../README.md) monorepo** — see root README for full stack list, CLI usage, and clone instructions. / [Brewnet Boilerplate](../../README.md) 모노레포의 일부입니다 — 전체 스택 목록, CLI 사용법, 클론 방법은 루트 README를 참고하세요.

Fullstack boilerplate with multi-DB support (PostgreSQL, MySQL, SQLite3). Uses Django's built-in `JsonResponse` without Django REST Framework -- lightweight and dependency-free.

다중 DB를 지원하는 풀스택 보일러플레이트입니다 (PostgreSQL, MySQL, SQLite3). Django REST Framework 없이 Django 내장 `JsonResponse`를 사용하여 가볍고 의존성이 최소화되어 있습니다.

---

## Prerequisites / 사전 요구사항

### Python 3.13+

```bash
# pyenv (recommended / 권장)
pyenv install 3.13
pyenv local 3.13

# Homebrew (macOS)
brew install python@3.13

# Verify / 확인
python3 --version  # 3.13.x
```

### Virtual Environment / 가상 환경

```bash
python3 -m venv .venv && source .venv/bin/activate
```

### Node.js 22+ (for frontend / 프론트엔드용)

```bash
# nvm (recommended / 권장)
nvm install 22
nvm use 22

# Homebrew (macOS)
brew install node@22

# Verify / 확인
node --version  # v22.x.x
```

### Docker Desktop

- Install from [docker.com](https://www.docker.com/products/docker-desktop/) / [docker.com](https://www.docker.com/products/docker-desktop/)에서 설치
- Docker Compose v2 included / Docker Compose v2 포함

### Available Ports / 사용 가능한 포트

| Port | Service | Description / 설명 |
|------|---------|---------------------|
| 8080 | Backend | Django (gunicorn) |
| 3000 | Frontend | React (nginx in prod) |
| 5433 | PostgreSQL | Host-mapped from container 5432 / 컨테이너 5432에서 호스트 매핑 |
| 3307 | MySQL | Host-mapped from container 3306 / 컨테이너 3306에서 호스트 매핑 |

---

## Quick Start (Docker) / 빠른 시작 (Docker)

```bash
cp .env.example .env
make dev
```

Open http://localhost:3000 in your browser -- the frontend displays "Hello from Django!" with DB connection status.

브라우저에서 http://localhost:3000 을 열면 프론트엔드에 "Hello from Django!" 메시지와 DB 연결 상태가 표시됩니다.

---

## Local Development (without Docker) / 로컬 개발 (Docker 없이)

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Run with SQLite (no external DB needed / 외부 DB 불필요)
DB_DRIVER=sqlite3 SQLITE_PATH=./data/brewnet.db python src/manage.py runserver 8080
```

Django management commands available locally:

로컬에서 사용 가능한 Django 관리 명령어:

```bash
# Run migrations / 마이그레이션 실행
DB_DRIVER=sqlite3 SQLITE_PATH=./data/brewnet.db python src/manage.py migrate

# Create superuser / 슈퍼유저 생성
DB_DRIVER=sqlite3 SQLITE_PATH=./data/brewnet.db python src/manage.py createsuperuser

# Collect static files / 정적 파일 수집
DB_DRIVER=sqlite3 SQLITE_PATH=./data/brewnet.db python src/manage.py collectstatic
```

> **Note**: The `manage.py` file is located at `backend/manage.py`. The `DJANGO_SETTINGS_MODULE` is set to `src.config.settings`.
>
> **참고**: `manage.py` 파일은 `backend/manage.py`에 위치합니다. `DJANGO_SETTINGS_MODULE`은 `src.config.settings`로 설정되어 있습니다.

### Frontend

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8080 npm run dev
```

Frontend dev server starts at http://localhost:5173 with hot reload. Proxies API requests to the backend at port 8080.

프론트엔드 개발 서버가 http://localhost:5173 에서 핫 리로드와 함께 시작됩니다. API 요청은 포트 8080의 백엔드로 프록시됩니다.

---

## API Endpoints / API 엔드포인트

| Method | Path | Description / 설명 | Response |
|--------|------|---------------------|----------|
| GET | `/` | Service info / 서비스 정보 | `{"service":"django-backend","status":"running","message":"..."}` |
| GET | `/health` | Health check with DB status / DB 상태 포함 헬스체크 | `{"status":"ok","timestamp":"...","db_connected":true}` |
| GET | `/api/hello` | Hello message / 인사 메시지 | `{"message":"Hello from Django!","lang":"python","version":"3.13.x"}` |
| POST | `/api/echo` | Echo request body / 요청 본문 반환 | Returns the JSON body sent in the request / 요청으로 보낸 JSON 본문을 그대로 반환 |

All views use Django's built-in `JsonResponse` and decorators (`@require_GET`, `@require_POST`) -- no Django REST Framework dependency.

모든 뷰는 Django 내장 `JsonResponse`와 데코레이터(`@require_GET`, `@require_POST`)를 사용합니다 -- Django REST Framework 의존성이 없습니다.

### curl Examples / curl 예시

```bash
# Service info / 서비스 정보
curl -s http://localhost:8080/ | jq .
# {
#   "service": "django-backend",
#   "status": "running",
#   "message": "🍺 Brewnet says hello!"
# }

# Health check / 헬스체크
curl -s http://localhost:8080/health | jq .
# {
#   "status": "ok",
#   "timestamp": "2026-03-01T12:00:00+00:00",
#   "db_connected": true
# }

# Hello API
curl -s http://localhost:8080/api/hello | jq .
# {
#   "message": "Hello from Django!",
#   "lang": "python",
#   "version": "3.13.1"
# }

# Echo API
curl -s -X POST http://localhost:8080/api/echo \
  -H "Content-Type: application/json" \
  -d '{"test":"brewnet"}' | jq .
# {
#   "test": "brewnet"
# }
```

---

## Database Configuration / 데이터베이스 설정

Django uses its built-in database backends configured in `src/config/settings.py`. Switch databases by changing `DB_DRIVER` in `.env`.

Django는 `src/config/settings.py`에 구성된 내장 데이터베이스 백엔드를 사용합니다. `.env`에서 `DB_DRIVER`를 변경하여 데이터베이스를 전환할 수 있습니다.

```bash
make down
# Edit .env: DB_DRIVER=postgres | mysql | sqlite3
# .env 수정: DB_DRIVER=postgres | mysql | sqlite3
make dev
```

### PostgreSQL (default / 기본값)

| Item | Value |
|------|-------|
| Django ENGINE | `django.db.backends.postgresql` |
| Driver | `psycopg2` (via `psycopg2-binary`) |
| Container host | `postgres:5432` |
| Host access | `localhost:5433` |

```env
DB_DRIVER=postgres
DB_HOST=postgres          # container name (Docker) / 컨테이너 이름 (Docker)
DB_PORT=5432
DB_NAME=brewnet
DB_USER=brewnet
DB_PASSWORD=brewnet_secret
```

Django DATABASES config (from `settings.py`):

```python
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
```

### MySQL

| Item | Value |
|------|-------|
| Django ENGINE | `django.db.backends.mysql` |
| Driver | `mysqlclient` |
| Container host | `mysql:3306` |
| Host access | `localhost:3307` |

```env
DB_DRIVER=mysql
MYSQL_HOST=mysql          # container name (Docker) / 컨테이너 이름 (Docker)
MYSQL_PORT=3306
MYSQL_DATABASE=brewnet
MYSQL_USER=brewnet
MYSQL_PASSWORD=brewnet_secret
MYSQL_ROOT_PASSWORD=root_secret
```

Django DATABASES config (from `settings.py`):

```python
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
```

### SQLite3

| Item | Value |
|------|-------|
| Django ENGINE | `django.db.backends.sqlite3` |
| Driver | Built-in (Python stdlib) / 내장 (Python 표준 라이브러리) |
| File path (container) | `/app/data/brewnet.db` |
| File path (local) | `./data/brewnet.db` |
| External container | Not needed / 불필요 |

```env
DB_DRIVER=sqlite3
SQLITE_PATH=/app/data/brewnet.db   # container path / 컨테이너 경로
# Local: SQLITE_PATH=./data/brewnet.db
```

Django DATABASES config (from `settings.py`):

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.getenv("SQLITE_PATH", "/app/data/brewnet.db"),
    }
}
```

No external database container is required for SQLite3. The database file is stored in the `data/` directory.

SQLite3는 외부 데이터베이스 컨테이너가 필요하지 않습니다. 데이터베이스 파일은 `data/` 디렉토리에 저장됩니다.

---

## Environment Variables / 환경 변수

| Variable | Default | Description / 설명 |
|----------|---------|---------------------|
| `PROJECT_NAME` | `brewnet` | Project name / 프로젝트 이름 |
| `DOMAIN` | `localhost` | Domain / 도메인 |
| `DB_DRIVER` | `postgres` | Database driver: `postgres`, `mysql`, `sqlite3` / 데이터베이스 드라이버 |
| `BACKEND_PORT` | `8080` | Backend host port / 백엔드 호스트 포트 |
| `FRONTEND_PORT` | `3000` | Frontend host port / 프론트엔드 호스트 포트 |
| `TZ` | `Asia/Seoul` | Timezone / 타임존 |
| `STACK_LANG` | `python-django` | Stack identifier / 스택 식별자 |
| `DB_HOST` | `postgres` | PostgreSQL host / PostgreSQL 호스트 |
| `DB_PORT` | `5432` | PostgreSQL port / PostgreSQL 포트 |
| `DB_NAME` | `brewnet` | PostgreSQL database name / PostgreSQL 데이터베이스 이름 |
| `DB_USER` | `brewnet` | PostgreSQL user / PostgreSQL 사용자 |
| `DB_PASSWORD` | - | PostgreSQL password / PostgreSQL 비밀번호 |
| `MYSQL_HOST` | `mysql` | MySQL host / MySQL 호스트 |
| `MYSQL_PORT` | `3306` | MySQL port / MySQL 포트 |
| `MYSQL_DATABASE` | `brewnet` | MySQL database name / MySQL 데이터베이스 이름 |
| `MYSQL_USER` | `brewnet` | MySQL user / MySQL 사용자 |
| `MYSQL_PASSWORD` | - | MySQL password / MySQL 비밀번호 |
| `MYSQL_ROOT_PASSWORD` | - | MySQL root password / MySQL 루트 비밀번호 |
| `SQLITE_PATH` | `/app/data/brewnet.db` | SQLite3 file path / SQLite3 파일 경로 |

---

## Makefile Targets / Makefile 타겟

| Target | Command | Description / 설명 |
|--------|---------|---------------------|
| `make dev` | `docker compose up --build` | Start with hot reload / 핫 리로드로 시작 |
| `make build` | `docker compose build` | Build Docker images / Docker 이미지 빌드 |
| `make up` | `docker compose up -d` | Start in production mode (detached) / 프로덕션 모드로 시작 (백그라운드) |
| `make down` | `docker compose down` | Stop all services / 모든 서비스 중지 |
| `make logs` | `docker compose logs -f` | Follow container logs / 컨테이너 로그 추적 |
| `make test` | `docker compose run --rm backend python manage.py test` | Run Django tests / Django 테스트 실행 |
| `make clean` | `docker compose down -v --rmi local` | Remove containers, volumes, images / 컨테이너, 볼륨, 이미지 제거 |
| `make validate` | `bash ../../shared/scripts/validate.sh` | Verify all API endpoints / 모든 API 엔드포인트 검증 |

---

## Project Structure / 프로젝트 구조

```
stacks/python-django/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── settings.py      # Django settings + multi-DB config / Django 설정 + 다중 DB 구성
│   │   │   ├── urls.py          # Root URL configuration / 루트 URL 설정
│   │   │   ├── wsgi.py          # WSGI entry point (gunicorn) / WSGI 진입점 (gunicorn)
│   │   │   └── cors.py          # Custom CORS middleware / 커스텀 CORS 미들웨어
│   │   └── api/
│   │       ├── views.py         # API views (JsonResponse) / API 뷰 (JsonResponse)
│   │       └── urls.py          # API URL patterns / API URL 패턴
│   ├── manage.py                # Django management CLI / Django 관리 CLI
│   ├── requirements.txt         # Python dependencies / Python 의존성
│   ├── Dockerfile               # Multi-stage build (python:3.13-slim) / 멀티스테이지 빌드
│   └── .dockerignore
├── frontend/                    # React 19 + Vite 6 + TypeScript
│   ├── src/
│   ├── Dockerfile               # Multi-stage build (node:22-alpine -> nginx) / 멀티스테이지 빌드
│   └── .dockerignore
├── docker-compose.yml           # backend + frontend + postgres + mysql services
├── Makefile                     # Uniform targets: dev, build, up, down, logs, test, clean, validate
├── .env.example                 # Environment variable template / 환경변수 템플릿
└── README.md
```

---

## Key Dependencies / 주요 의존성

| Package | Version | Purpose / 용도 |
|---------|---------|----------------|
| `Django` | 6.0.x | Web framework / 웹 프레임워크 |
| `gunicorn` | 23.x+ | WSGI HTTP server (production) / WSGI HTTP 서버 (프로덕션) |
| `psycopg2-binary` | 2.9+ | PostgreSQL driver / PostgreSQL 드라이버 |
| `mysqlclient` | 2.2+ | MySQL driver / MySQL 드라이버 |
| `pytest` | 8.x+ | Testing framework / 테스트 프레임워크 |
| `pytest-django` | 4.8+ | Django test integration / Django 테스트 통합 |

---

## Django-Specific Notes / Django 관련 참고사항

- **No DRF**: This stack intentionally avoids Django REST Framework. All API endpoints return `JsonResponse` directly.
- **Custom CORS**: Uses a lightweight custom middleware (`src/config/cors.py`) instead of `django-cors-headers`.
- **WSGI**: Production runs via `gunicorn src.config.wsgi:application --bind 0.0.0.0:8080`.
- **Settings module**: `DJANGO_SETTINGS_MODULE=src.config.settings` (set in `manage.py` and `wsgi.py`).

- **DRF 미사용**: 이 스택은 의도적으로 Django REST Framework를 사용하지 않습니다. 모든 API 엔드포인트는 `JsonResponse`를 직접 반환합니다.
- **커스텀 CORS**: `django-cors-headers` 대신 경량 커스텀 미들웨어(`src/config/cors.py`)를 사용합니다.
- **WSGI**: 프로덕션에서는 `gunicorn src.config.wsgi:application --bind 0.0.0.0:8080`으로 실행됩니다.
- **설정 모듈**: `DJANGO_SETTINGS_MODULE=src.config.settings` (`manage.py`와 `wsgi.py`에서 설정됨).

---

## Docker Architecture / Docker 아키텍처

- **Multi-stage build**: `python:3.13-slim` (builder with gcc + libmysqlclient-dev) -> `python:3.13-slim` (runner with libmariadb3)
- **Non-root execution**: Runs as `appuser` / `appuser`로 실행
- **Health check**: `python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/health')"`
- **Networks**: `brewnet` (public) + `brewnet-internal` (DB only, internal) / `brewnet` (공용) + `brewnet-internal` (DB 전용, 내부)
- **Resource limits**: Backend 512M / 1 CPU, Frontend 128M / 0.5 CPU

---

## Validation / 검증

```bash
make validate
```

Runs the shared validation script that verifies `GET /health` returns 200 and `GET /api/hello` returns 200.

공유 검증 스크립트를 실행하여 `GET /health`가 200을, `GET /api/hello`가 200을 반환하는지 확인합니다.
