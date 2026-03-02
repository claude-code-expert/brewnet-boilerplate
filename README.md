# Brewnet — Rust Actix-web Stack

> Rust 1.88+ / Actix-web 4 / SQLx 0.8 / React 19 / Vite 6 / TypeScript

**Part of the [Brewnet Boilerplate](../../README.md) monorepo** — see root README for full stack list, CLI usage, and clone instructions. / [Brewnet Boilerplate](../../README.md) 모노레포의 일부입니다 — 전체 스택 목록, CLI 사용법, 클론 방법은 루트 README를 참고하세요.

Fullstack boilerplate with multi-database support (PostgreSQL, MySQL, SQLite3). Multi-stage Docker builds with dependency caching for fast incremental compilation.

> Rust 1.88+ / Actix-web 4 / SQLx 0.8 기반 풀스택 보일러플레이트. PostgreSQL, MySQL, SQLite3 멀티 데이터베이스를 지원하며, Docker 멀티 스테이지 빌드와 의존성 캐싱을 통해 빠른 증분 컴파일을 제공합니다.

---

## Prerequisites / 사전 요구사항

| Requirement / 요구사항 | Version / 버전 | Notes / 비고 |
|------------------------|----------------|--------------|
| **Rust** (via rustup) | 1.88+ | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| **Node.js** | 22+ | Frontend build / 프론트엔드 빌드 |
| **Docker Desktop** | Latest | Required for `make dev` / `make dev` 실행에 필요 |
| **Available ports** | 3000, 8080, 5433, 3307 | Frontend, Backend, PostgreSQL, MySQL |

> **Rust edition**: 2021 (configured in `Cargo.toml`)
>
> **Rust 에디션**: 2021 (`Cargo.toml`에서 설정)

---

## Quick Start (Docker) / 빠른 시작 (Docker)

```bash
cp .env.example .env
make dev
```

> **Note**: The first build takes longer due to Rust compilation. Subsequent builds use dependency caching via a two-step Docker build that pre-compiles dependencies before copying source code.
>
> **참고**: 첫 빌드는 Rust 컴파일로 인해 시간이 걸립니다. 이후 빌드는 소스 코드 복사 전에 의존성을 미리 컴파일하는 2단계 Docker 빌드를 통해 캐싱이 적용됩니다.

### Access / 접속

| URL | Description / 설명 |
|-----|---------------------|
| http://localhost:3000 | Frontend (React + Vite) |
| http://localhost:8080 | Backend root endpoint |
| http://localhost:8080/health | Health check with DB status |
| http://localhost:8080/api/hello | Hello API |

---

## Local Development (without Docker) / 로컬 개발 (Docker 없이)

### Backend / 백엔드

```bash
cd backend

# Run with SQLite3 (no external DB needed)
# SQLite3로 실행 (외부 DB 불필요)
DB_DRIVER=sqlite3 SQLITE_PATH=./data/brewnet_db.db cargo run

# Or with PostgreSQL (requires a running PostgreSQL instance)
# 또는 PostgreSQL로 실행 (실행 중인 PostgreSQL 인스턴스 필요)
DB_DRIVER=postgres DB_HOST=localhost DB_PORT=5432 DB_NAME=brewnet_db DB_USER=brewnet DB_PASSWORD=password cargo run
```

### Frontend / 프론트엔드

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8080 npm run dev
```

### Run Tests / 테스트 실행

```bash
cd backend
cargo test
```

---

## API Endpoints / API 엔드포인트

| Method | Path | Description / 설명 | Response Example / 응답 예시 |
|--------|------|---------------------|------------------------------|
| `GET` | `/` | Service info / 서비스 정보 | `{"service":"actix-web-backend","status":"running","message":"🍺 Brewnet says hello!"}` |
| `GET` | `/health` | Health check with DB status / DB 상태 포함 헬스체크 | `{"status":"ok","timestamp":"2026-03-01T12:00:00+00:00","db_connected":true}` |
| `GET` | `/api/hello` | Hello message / 인사 메시지 | `{"message":"Hello from Actix-web!","lang":"rust","version":"1.0.0"}` |
| `POST` | `/api/echo` | Echo request body / 요청 본문 에코 | _(returns the JSON body you send / 전송한 JSON 본문을 그대로 반환)_ |

### cURL Examples / cURL 예시

```bash
# Root
curl -s http://localhost:8080/ | jq .

# Health check
curl -s http://localhost:8080/health | jq .

# Hello
curl -s http://localhost:8080/api/hello | jq .

# Echo
curl -s -X POST http://localhost:8080/api/echo \
  -H "Content-Type: application/json" \
  -d '{"test":"brewnet","number":42}' | jq .
```

---

## Database Configuration / 데이터베이스 설정

Switch databases by changing `DB_DRIVER` in your `.env` file. The backend uses **SQLx AnyPool** to connect to any supported driver at runtime.

`.env` 파일에서 `DB_DRIVER`를 변경하여 데이터베이스를 전환합니다. 백엔드는 **SQLx AnyPool**을 사용하여 런타임에 지원되는 모든 드라이버에 연결합니다.

### PostgreSQL (default / 기본값)

```bash
# .env
DB_DRIVER=postgres
DB_HOST=postgres
DB_PORT=5432
DB_NAME=brewnet_db
DB_USER=brewnet
DB_PASSWORD=password
```

**SQLx connection URL (container-internal):**
```
postgres://brewnet:password@postgres:5432/brewnet
```

**SQLx connection URL (host access):**
```
postgres://brewnet:password@localhost:5433/brewnet
```

> Host port is `5433` (mapped from container port `5432` in docker-compose.yml).
>
> 호스트 포트는 `5433`입니다 (docker-compose.yml에서 컨테이너 포트 `5432`에서 매핑).

### MySQL

```bash
# .env
DB_DRIVER=mysql
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_DATABASE=brewnet_db
MYSQL_USER=brewnet
MYSQL_PASSWORD=password
MYSQL_ROOT_PASSWORD=password
```

**SQLx connection URL (container-internal):**
```
mysql://brewnet:password@mysql:3306/brewnet_db
```

**SQLx connection URL (host access):**
```
mysql://brewnet:password@localhost:3307/brewnet_db
```

> Host port is `3307` (mapped from container port `3306` in docker-compose.yml).
>
> 호스트 포트는 `3307`입니다 (docker-compose.yml에서 컨테이너 포트 `3306`에서 매핑).

### SQLite3

```bash
# .env
DB_DRIVER=sqlite3
SQLITE_PATH=/app/data/brewnet_db.db
```

**SQLx connection URL:**
```
sqlite:///app/data/brewnet_db.db
```

> For local development (without Docker), use a relative path: `sqlite://./data/brewnet_db.db`
>
> 로컬 개발(Docker 없이)에서는 상대 경로를 사용합니다: `sqlite://./data/brewnet_db.db`

### Switching Databases / 데이터베이스 전환

```bash
make down
# Edit .env: change DB_DRIVER to postgres, mysql, or sqlite3
# .env 편집: DB_DRIVER를 postgres, mysql, 또는 sqlite3로 변경
make dev
```

---

## Environment Variables / 환경 변수

All variables are defined in `.env.example`. Copy it to `.env` before running.

모든 변수는 `.env.example`에 정의되어 있습니다. 실행 전에 `.env`로 복사하세요.

| Variable / 변수 | Default / 기본값 | Description / 설명 |
|-----------------|-------------------|---------------------|
| `PROJECT_NAME` | `brewnet` | Docker Compose project name / Docker Compose 프로젝트 이름 |
| `DOMAIN` | `localhost` | Application domain / 애플리케이션 도메인 |
| `DB_DRIVER` | `postgres` | Database driver: `postgres` \| `mysql` \| `sqlite3` |
| `BACKEND_PORT` | `8080` | Host port for backend / 백엔드 호스트 포트 |
| `FRONTEND_PORT` | `3000` | Host port for frontend / 프론트엔드 호스트 포트 |
| `TZ` | `Asia/Seoul` | Timezone / 타임존 |
| `STACK_LANG` | `rust-actix-web` | Stack identifier / 스택 식별자 |
| `DB_HOST` | `postgres` | PostgreSQL hostname / PostgreSQL 호스트명 |
| `DB_PORT` | `5432` | PostgreSQL port / PostgreSQL 포트 |
| `DB_NAME` | `brewnet_db` | PostgreSQL database name / PostgreSQL 데이터베이스명 |
| `DB_USER` | `brewnet` | PostgreSQL username / PostgreSQL 사용자명 |
| `DB_PASSWORD` | `password` | PostgreSQL password / PostgreSQL 비밀번호 |
| `MYSQL_HOST` | `mysql` | MySQL hostname / MySQL 호스트명 |
| `MYSQL_PORT` | `3306` | MySQL port / MySQL 포트 |
| `MYSQL_DATABASE` | `brewnet_db` | MySQL database name / MySQL 데이터베이스명 |
| `MYSQL_USER` | `brewnet` | MySQL username / MySQL 사용자명 |
| `MYSQL_PASSWORD` | `password` | MySQL password / MySQL 비밀번호 |
| `MYSQL_ROOT_PASSWORD` | `password` | MySQL root password / MySQL 루트 비밀번호 |
| `SQLITE_PATH` | `/app/data/brewnet_db.db` | SQLite3 file path / SQLite3 파일 경로 |

---

## Makefile Targets / Makefile 타겟

| Target / 타겟 | Description / 설명 |
|---------------|---------------------|
| `make dev` | Build and start all services (foreground) / 모든 서비스 빌드 후 시작 (포그라운드) |
| `make build` | Build Docker images only / Docker 이미지만 빌드 |
| `make up` | Start services in background (production) / 백그라운드로 서비스 시작 (프로덕션) |
| `make down` | Stop and remove containers / 컨테이너 중지 및 제거 |
| `make logs` | Follow container logs / 컨테이너 로그 추적 |
| `make test` | Run `cargo test` in backend container / 백엔드 컨테이너에서 `cargo test` 실행 |
| `make clean` | Remove containers, volumes, and local images / 컨테이너, 볼륨, 로컬 이미지 제거 |
| `make validate` | Run API validation script / API 검증 스크립트 실행 |

---

## Project Structure / 프로젝트 구조

```
stacks/rust-actix-web/
├── backend/
│   ├── src/
│   │   ├── main.rs              # Server entry point, Actix-web routing, CORS setup
│   │   │                        # 서버 진입점, Actix-web 라우팅, CORS 설정
│   │   ├── handler.rs           # Route handlers (root, health, hello, echo) + unit tests
│   │   │                        # 라우트 핸들러 (root, health, hello, echo) + 단위 테스트
│   │   └── database.rs          # SQLx AnyPool multi-DB connection (postgres/mysql/sqlite3)
│   │                            # SQLx AnyPool 멀티 DB 연결 (postgres/mysql/sqlite3)
│   ├── Cargo.toml               # Dependencies: actix-web 4, sqlx 0.8, tokio, chrono, serde
│   ├── Cargo.lock               # Locked dependency versions
│   ├── Dockerfile               # Multi-stage: rust:1.88 (builder) -> debian:bookworm-slim
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main component — calls GET /api/hello
│   │   ├── main.tsx             # React entry point
│   │   └── vite-env.d.ts        # Vite type declarations
│   ├── public/
│   │   └── brewnet.svg          # Brewnet logo
│   ├── index.html               # HTML entry point
│   ├── package.json             # React 19, Vite 6, TypeScript
│   ├── tsconfig.json            # TypeScript configuration
│   ├── vite.config.ts           # Vite configuration with API proxy
│   ├── nginx.conf               # Production: serves static files + reverse proxy /api
│   ├── Dockerfile               # Multi-stage: node:22-alpine (build) -> nginx (serve)
│   └── .dockerignore
├── docker-compose.yml           # Services: backend, frontend, postgres, mysql
├── Makefile                     # Unified commands (dev, build, up, down, test, clean, validate)
├── .env.example                 # Environment variable template
└── README.md
```

---

## Docker Architecture / Docker 아키텍처

### Build Stages / 빌드 단계

| Stage / 단계 | Image / 이미지 | Purpose / 목적 |
|--------------|----------------|----------------|
| **builder** | `rust:1.88` | Compile dependencies first, then source / 의존성 먼저 컴파일 후 소스 빌드 |
| **runner** | `debian:bookworm-slim` | Minimal runtime with `appuser` / `appuser`로 실행하는 최소 런타임 |

### Networks / 네트워크

| Network / 네트워크 | Type / 유형 | Services / 서비스 |
|--------------------|-----------|--------------------|
| `brewnet` | bridge | backend, frontend |
| `brewnet-internal` | internal (bridge) | backend, postgres, mysql |

### Resource Limits / 리소스 제한

| Service / 서비스 | Memory / 메모리 | CPUs |
|-------------------|----------------|------|
| backend | 512M | 1.0 |
| frontend | 128M | 0.5 |

---

## Validation / 검증

```bash
make validate
```

This runs the shared validation script that verifies:
- `GET /health` returns HTTP 200
- `GET /api/hello` returns HTTP 200

이 명령은 공유 검증 스크립트를 실행하여 다음을 확인합니다:
- `GET /health`가 HTTP 200을 반환하는지
- `GET /api/hello`가 HTTP 200을 반환하는지
