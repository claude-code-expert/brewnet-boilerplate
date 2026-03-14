# Brewnet -- Python-FastAPI Stack

> Python 3.12+ / FastAPI / SQLAlchemy 2.0 (async) + React 19 / Vite 6 / TypeScript
>
> Python 3.12+ / FastAPI / SQLAlchemy 2.0 (비동기) + React 19 / Vite 6 / TypeScript

**Part of the [Brewnet Boilerplate](../../README.md) monorepo** — see root README for full stack list, CLI usage, and clone instructions. / [Brewnet Boilerplate](../../README.md) 모노레포의 일부입니다 — 전체 스택 목록, CLI 사용법, 클론 방법은 루트 README를 참고하세요.

Async fullstack boilerplate with multi-DB support (PostgreSQL, MySQL, SQLite3). FastAPI runs on uvicorn with async SQLAlchemy for non-blocking database access.

비동기 풀스택 보일러플레이트로, 다중 DB를 지원합니다 (PostgreSQL, MySQL, SQLite3). FastAPI는 uvicorn 위에서 실행되며, async SQLAlchemy를 통해 논블로킹 데이터베이스 접근을 제공합니다.

---

## Prerequisites / 사전 요구사항

### Python 3.12+

```bash
# pyenv (recommended / 권장)
pyenv install 3.12
pyenv local 3.12

# Homebrew (macOS)
brew install python@3.12

# Verify / 확인
python3 --version  # 3.12.x
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
| 8080 | Backend | FastAPI (uvicorn) |
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

Open http://localhost:3000 in your browser -- the frontend displays "Hello from FastAPI!" with DB connection status.

브라우저에서 http://localhost:3000 을 열면 프론트엔드에 "Hello from FastAPI!" 메시지와 DB 연결 상태가 표시됩니다.

---

## Local Development (without Docker) / 로컬 개발 (Docker 없이)

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Run with SQLite (no external DB needed / 외부 DB 불필요)
DB_DRIVER=sqlite3 SQLITE_PATH=./data/brewnet_db.db uvicorn src.main:app --reload --port 8080
```

The `--reload` flag enables hot reload for development. FastAPI auto-generates interactive docs at http://localhost:8080/docs (Swagger UI) and http://localhost:8080/redoc (ReDoc).

`--reload` 플래그를 사용하면 개발 중 핫 리로드가 활성화됩니다. FastAPI는 http://localhost:8080/docs (Swagger UI)와 http://localhost:8080/redoc (ReDoc)에서 대화형 API 문서를 자동 생성합니다.

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
| GET | `/` | Service info / 서비스 정보 | `{"service":"fastapi-backend","status":"running","message":"..."}` |
| GET | `/health` | Health check with DB status / DB 상태 포함 헬스체크 | `{"status":"ok","timestamp":"...","db_connected":true}` |
| GET | `/api/hello` | Hello message / 인사 메시지 | `{"message":"Hello from FastAPI!","lang":"python","version":"3.12.x"}` |
| POST | `/api/echo` | Echo request body / 요청 본문 반환 | Returns the JSON body sent in the request / 요청으로 보낸 JSON 본문을 그대로 반환 |

### curl Examples / curl 예시

```bash
# Service info / 서비스 정보
curl -s http://localhost:8080/ | jq .
# {
#   "service": "fastapi-backend",
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
#   "message": "Hello from FastAPI!",
#   "lang": "python",
#   "version": "3.12.8"
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

FastAPI uses async SQLAlchemy 2.0 with different async drivers per database. Switch databases by changing `DB_DRIVER` in `.env`.

FastAPI는 데이터베이스별로 다른 비동기 드라이버와 함께 async SQLAlchemy 2.0을 사용합니다. `.env`에서 `DB_DRIVER`를 변경하여 데이터베이스를 전환할 수 있습니다.

```bash
make down
# Edit .env: DB_DRIVER=postgres | mysql | sqlite3
# .env 수정: DB_DRIVER=postgres | mysql | sqlite3
make dev
```

### PostgreSQL (default / 기본값)

| Item | Value |
|------|-------|
| Connection string (container) | `postgresql+asyncpg://brewnet:secret@postgres:5432/brewnet` |
| Connection string (host) | `postgresql+asyncpg://brewnet:secret@localhost:5433/brewnet` |
| Async driver | `asyncpg` |
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
| Connection string (container) | `mysql+aiomysql://brewnet:secret@mysql:3306/brewnet` |
| Connection string (host) | `mysql+aiomysql://brewnet:secret@localhost:3307/brewnet` |
| Async driver | `aiomysql` |
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
| Connection string (container) | `sqlite+aiosqlite:///./data/brewnet_db.db` |
| Connection string (local) | `sqlite+aiosqlite:///./data/brewnet_db.db` |
| Async driver | `aiosqlite` |
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
| `STACK_LANG` | `python-fastapi` | Stack identifier / 스택 식별자 |
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
| `make test` | `docker compose run --rm backend pytest` | Run tests / 테스트 실행 |
| `make clean` | `docker compose down -v --rmi local` | Remove containers, volumes, images / 컨테이너, 볼륨, 이미지 제거 |
| `make validate` | `bash ../../shared/scripts/validate.sh` | Verify all API endpoints / 모든 API 엔드포인트 검증 |

---

## Project Structure / 프로젝트 구조

```
stacks/python-fastapi/
├── backend/
│   ├── src/
│   │   ├── main.py              # FastAPI app + CORS middleware / FastAPI 앱 + CORS 미들웨어
│   │   ├── config.py            # Pydantic Settings (env vars) / Pydantic 환경변수 설정
│   │   ├── database.py          # Async SQLAlchemy engine + connection check / 비동기 SQLAlchemy 엔진 + 연결 확인
│   │   └── routers/
│   │       ├── root.py          # GET / (service info) + GET /health
│   │       ├── hello.py         # GET /api/hello
│   │       └── echo.py          # POST /api/echo
│   ├── requirements.txt         # Python dependencies / Python 의존성
│   ├── Dockerfile               # Multi-stage build (python:3.12-slim) / 멀티스테이지 빌드
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
| `fastapi` | 0.115.x | Web framework / 웹 프레임워크 |
| `uvicorn[standard]` | 0.34.x | ASGI server / ASGI 서버 |
| `sqlalchemy[asyncio]` | 2.0.x | Async ORM / 비동기 ORM |
| `pydantic-settings` | 2.x | Environment config / 환경변수 설정 |
| `asyncpg` | 0.30.x | PostgreSQL async driver / PostgreSQL 비동기 드라이버 |
| `aiomysql` | 0.2.x | MySQL async driver / MySQL 비동기 드라이버 |
| `aiosqlite` | 0.20.x | SQLite3 async driver / SQLite3 비동기 드라이버 |
| `pytest` | 8.x+ | Testing framework / 테스트 프레임워크 |
| `httpx` | 0.27+ | Async HTTP client for tests / 테스트용 비동기 HTTP 클라이언트 |

---

## Docker Architecture / Docker 아키텍처

- **Multi-stage build**: `python:3.12-slim` (builder) -> `python:3.12-slim` (runner)
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
