# Brewnet -- Python-Flask Stack

> Python 3.13+ / Flask 3.1 / Flask-SQLAlchemy / Gunicorn + React 19 / Vite 6 / TypeScript
>
> Python 3.13+ / Flask 3.1 / Flask-SQLAlchemy / Gunicorn + React 19 / Vite 6 / TypeScript

**Part of the [Brewnet Boilerplate](../../README.md) monorepo** — see root README for full stack list, CLI usage, and clone instructions. / [Brewnet Boilerplate](../../README.md) 모노레포의 일부입니다 — 전체 스택 목록, CLI 사용법, 클론 방법은 루트 README를 참고하세요.

Fullstack boilerplate with multi-DB support (PostgreSQL, MySQL, SQLite3). Uses the Flask application factory pattern (`create_app()`) with Flask-SQLAlchemy for database access and Gunicorn for production serving.

다중 DB를 지원하는 풀스택 보일러플레이트입니다 (PostgreSQL, MySQL, SQLite3). Flask 애플리케이션 팩토리 패턴(`create_app()`)과 Flask-SQLAlchemy를 사용하며, 프로덕션에서는 Gunicorn으로 서빙합니다.

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
| 8080 | Backend | Flask (gunicorn) |
| 3000 | Frontend | React (nginx in prod) |
| 5433 | PostgreSQL | Host-mapped from container 5432 / 컨테이너 5432에서 호스트 매핑 |
| 3307 | MySQL | Host-mapped from container 3306 / 컨테이너 3306에서 호스트 매핑 |

---

## Quick Start (Docker) / 빠른 시작 (Docker)

```bash
cp .env.example .env
make dev
```

> **Tip / 팁**: You can also start this stack from the [Brewnet Dashboard](../../dashboard/) — a browser UI that manages all 16 stacks with live status, README viewer, and inline API Explorer.
> [Brewnet Dashboard](../../dashboard/)에서 이 스택을 시작할 수도 있습니다 — 16개 스택의 실행 상태, README, API 테스트를 브라우저에서 한 번에 관리합니다.

Open http://localhost:3000 in your browser -- the frontend displays "Hello from Flask!" with DB connection status.

브라우저에서 http://localhost:3000 을 열면 프론트엔드에 "Hello from Flask!" 메시지와 DB 연결 상태가 표시됩니다.

---

## Local Development (without Docker) / 로컬 개발 (Docker 없이)

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Run with SQLite (no external DB needed / 외부 DB 불필요)
DB_DRIVER=sqlite3 SQLITE_PATH=./data/brewnet_db.db python -m flask --app src.main run --port 8080
```

Flask uses the application factory pattern. The `--app src.main` flag is not needed when using `wsgi.py` directly:

Flask는 애플리케이션 팩토리 패턴을 사용합니다. `wsgi.py`를 직접 사용할 때는 `--app src.main` 플래그가 필요하지 않습니다:

```bash
# Alternative: run via wsgi.py / 대안: wsgi.py를 통해 실행
DB_DRIVER=sqlite3 SQLITE_PATH=./data/brewnet_db.db gunicorn wsgi:app --bind 0.0.0.0:8080 --reload
```

> **Note**: The app factory is in `src/__init__.py` (`create_app()`), and `wsgi.py` imports and creates the app instance for Gunicorn.
>
> **참고**: 앱 팩토리는 `src/__init__.py` (`create_app()`)에 있으며, `wsgi.py`가 Gunicorn을 위해 앱 인스턴스를 import하고 생성합니다.

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
| GET | `/` | Service info / 서비스 정보 | `{"service":"flask-backend","status":"running","message":"..."}` |
| GET | `/health` | Health check with DB status / DB 상태 포함 헬스체크 | `{"status":"ok","timestamp":"...","db_connected":true}` |
| GET | `/api/hello` | Hello message / 인사 메시지 | `{"message":"Hello from Flask!","lang":"python","version":"3.13.x"}` |
| POST | `/api/echo` | Echo request body / 요청 본문 반환 | Returns the JSON body sent in the request / 요청으로 보낸 JSON 본문을 그대로 반환 |

### curl Examples / curl 예시

```bash
# Service info / 서비스 정보
curl -s http://localhost:8080/ | jq .
# {
#   "service": "flask-backend",
#   "status": "running",
#   "message": "☕ Brewnet says hello!"
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
#   "message": "Hello from Flask!",
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

Flask uses Flask-SQLAlchemy with synchronous drivers. The database URI is built in `src/config.py` based on the `DB_DRIVER` environment variable. Switch databases by changing `DB_DRIVER` in `.env`.

Flask는 동기 드라이버와 함께 Flask-SQLAlchemy를 사용합니다. 데이터베이스 URI는 `DB_DRIVER` 환경변수를 기반으로 `src/config.py`에서 생성됩니다. `.env`에서 `DB_DRIVER`를 변경하여 데이터베이스를 전환할 수 있습니다.

```bash
make down
# Edit .env: DB_DRIVER=postgres | mysql | sqlite3
# .env 수정: DB_DRIVER=postgres | mysql | sqlite3
make dev
```

### PostgreSQL (default / 기본값)

| Item | Value |
|------|-------|
| Connection string (container) | `postgresql://brewnet:secret@postgres:5432/brewnet` |
| Connection string (host) | `postgresql://brewnet:secret@localhost:5433/brewnet` |
| Driver | `psycopg2` (via `psycopg2-binary`) |
| Container port | 5432 |
| Host-mapped port | 5433 |

```env
DB_DRIVER=postgres
DB_HOST=postgres          # container name (Docker) / 컨테이너 이름 (Docker)
DB_PORT=5432
DB_NAME=brewnet_db
DB_USER=brewnet
DB_PASSWORD=password
```

### MySQL

| Item | Value |
|------|-------|
| Connection string (container) | `mysql+pymysql://brewnet:secret@mysql:3306/brewnet` |
| Connection string (host) | `mysql+pymysql://brewnet:secret@localhost:3307/brewnet` |
| Driver | `PyMySQL` |
| Container port | 3306 |
| Host-mapped port | 3307 |

```env
DB_DRIVER=mysql
MYSQL_HOST=mysql          # container name (Docker) / 컨테이너 이름 (Docker)
MYSQL_PORT=3306
MYSQL_DATABASE=brewnet_db
MYSQL_USER=brewnet
MYSQL_PASSWORD=password
MYSQL_ROOT_PASSWORD=password
```

### SQLite3

| Item | Value |
|------|-------|
| Connection string (container) | `sqlite:////app/data/brewnet_db.db` |
| Connection string (local) | `sqlite:///./data/brewnet_db.db` |
| Driver | Built-in (Python stdlib) / 내장 (Python 표준 라이브러리) |
| External container | Not needed / 불필요 |

```env
DB_DRIVER=sqlite3
SQLITE_PATH=/app/data/brewnet_db.db   # container path / 컨테이너 경로
# Local: SQLITE_PATH=./data/brewnet_db.db
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
| `STACK_LANG` | `python-flask` | Stack identifier / 스택 식별자 |
| `DB_HOST` | `postgres` | PostgreSQL host / PostgreSQL 호스트 |
| `DB_PORT` | `5432` | PostgreSQL port / PostgreSQL 포트 |
| `DB_NAME` | `brewnet_db` | PostgreSQL database name / PostgreSQL 데이터베이스 이름 |
| `DB_USER` | `brewnet` | PostgreSQL user / PostgreSQL 사용자 |
| `DB_PASSWORD` | - | PostgreSQL password / PostgreSQL 비밀번호 |
| `MYSQL_HOST` | `mysql` | MySQL host / MySQL 호스트 |
| `MYSQL_PORT` | `3306` | MySQL port / MySQL 포트 |
| `MYSQL_DATABASE` | `brewnet_db` | MySQL database name / MySQL 데이터베이스 이름 |
| `MYSQL_USER` | `brewnet` | MySQL user / MySQL 사용자 |
| `MYSQL_PASSWORD` | - | MySQL password / MySQL 비밀번호 |
| `MYSQL_ROOT_PASSWORD` | - | MySQL root password / MySQL 루트 비밀번호 |
| `SQLITE_PATH` | `/app/data/brewnet_db.db` | SQLite3 file path / SQLite3 파일 경로 |

---

## Makefile Targets / Makefile 타겟

| Target | Command | Description / 설명 |
|--------|---------|---------------------|
| `make dev` | `docker compose up --build` | Start with hot reload / 핫 리로드로 시작 |
| `make build` | `docker compose build` | Build Docker images / Docker 이미지 빌드 |
| `make up` | `docker compose up -d` | Start in production mode (detached) / 프로덕션 모드로 시작 (백그라운드) |
| `make down` | `docker compose down` | Stop all services / 모든 서비스 중지 |
| `make logs` | `docker compose logs -f` | Follow container logs / 컨테이너 로그 추적 |
| `make test` | `docker compose run --rm backend python -m pytest` | Run tests with pytest / pytest로 테스트 실행 |
| `make clean` | `docker compose down -v --rmi local` | Remove containers, volumes, images / 컨테이너, 볼륨, 이미지 제거 |
| `make validate` | `bash ../../shared/scripts/validate.sh` | Verify all API endpoints / 모든 API 엔드포인트 검증 |

---

## Project Structure / 프로젝트 구조

```
stacks/python-flask/
├── backend/
│   ├── src/
│   │   ├── __init__.py          # Flask app factory (create_app) / Flask 앱 팩토리
│   │   ├── config.py            # Database URI builder (get_database_uri) / 데이터베이스 URI 생성
│   │   ├── database.py          # SQLAlchemy connection check / SQLAlchemy 연결 확인
│   │   └── routes.py            # All API routes (register_routes) / 모든 API 라우트
│   ├── wsgi.py                  # WSGI entry point for gunicorn / gunicorn용 WSGI 진입점
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
| `Flask` | 3.1.x | Web framework / 웹 프레임워크 |
| `Flask-SQLAlchemy` | 3.1.x | SQLAlchemy integration for Flask / Flask용 SQLAlchemy 통합 |
| `gunicorn` | 23.x+ | WSGI HTTP server (production) / WSGI HTTP 서버 (프로덕션) |
| `psycopg2-binary` | 2.9+ | PostgreSQL driver / PostgreSQL 드라이버 |
| `PyMySQL` | 1.1+ | MySQL driver / MySQL 드라이버 |
| `pytest` | 8.x+ | Testing framework / 테스트 프레임워크 |

---

## Flask-Specific Notes / Flask 관련 참고사항

- **Application factory**: The app is created via `create_app()` in `src/__init__.py`. This pattern allows for flexible configuration and testing.
- **WSGI entry point**: `wsgi.py` at the backend root calls `create_app()` and exposes the `app` instance for Gunicorn.
- **Production command**: `gunicorn wsgi:app --bind 0.0.0.0:8080`
- **Custom CORS**: Implemented via `@app.after_request` decorator instead of `flask-cors` -- keeps dependencies minimal.
- **Flask-SQLAlchemy**: Used for the database health check (`db.session.execute(text("SELECT 1"))`). The `db` instance is created in `src/__init__.py` and initialized with the app context.

- **애플리케이션 팩토리**: 앱은 `src/__init__.py`의 `create_app()`을 통해 생성됩니다. 이 패턴은 유연한 설정과 테스트를 가능하게 합니다.
- **WSGI 진입점**: 백엔드 루트의 `wsgi.py`가 `create_app()`을 호출하고 Gunicorn을 위한 `app` 인스턴스를 제공합니다.
- **프로덕션 명령어**: `gunicorn wsgi:app --bind 0.0.0.0:8080`
- **커스텀 CORS**: `flask-cors` 대신 `@app.after_request` 데코레이터로 구현 -- 의존성을 최소화합니다.
- **Flask-SQLAlchemy**: 데이터베이스 헬스체크에 사용됩니다 (`db.session.execute(text("SELECT 1"))`). `db` 인스턴스는 `src/__init__.py`에서 생성되고 앱 컨텍스트로 초기화됩니다.

---

## Docker Architecture / Docker 아키텍처

- **Multi-stage build**: `python:3.13-slim` (builder) -> `python:3.13-slim` (runner)
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
