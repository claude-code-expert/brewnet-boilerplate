# Brewnet — Go-Fiber Stack

> Go 1.25+ + Fiber v3 + GORM + React 19 + Vite 6 + TypeScript

**Part of the [Brewnet Boilerplate](../../README.md) monorepo** — see root README for full stack list, CLI usage, and clone instructions. / [Brewnet Boilerplate](../../README.md) 모노레포의 일부입니다 — 전체 스택 목록, CLI 사용법, 클론 방법은 루트 README를 참고하세요.

Fullstack boilerplate with multi-DB support (PostgreSQL, MySQL, SQLite3).
Built on [Fiber](https://gofiber.io/) -- an Express-inspired web framework built on top of [Fasthttp](https://github.com/valyala/fasthttp), the fastest HTTP engine for Go.

## Prerequisites / 사전 요구사항

### Runtime / 런타임 설치

- **Go 1.25+**: [https://go.dev/dl/](https://go.dev/dl/)
  ```bash
  # macOS (Homebrew)
  brew install go

  # Linux
  wget https://go.dev/dl/go1.25.0.linux-amd64.tar.gz
  sudo tar -C /usr/local -xzf go1.25.0.linux-amd64.tar.gz
  export PATH=$PATH:/usr/local/go/bin

  # Verify / 확인
  go version
  ```

- **Node.js 22+** (for frontend): [https://nodejs.org/](https://nodejs.org/)
  ```bash
  # nvm (recommended)
  nvm install 22

  # Homebrew
  brew install node@22
  ```

- **Docker Desktop** or Docker Engine + Docker Compose v2
- Available ports: 8080, 3000, 5433 (PostgreSQL) or 3307 (MySQL)

> **Important**: Fiber v3 is built on [Fasthttp](https://github.com/valyala/fasthttp), which uses its own request/response model instead of Go's standard `net/http`. The `fiber.Ctx` is pooled and reused -- it must NOT be stored or shared across goroutines. If you need to pass context data to a goroutine, copy the required values first.
>
> Fiber v3는 Fasthttp 기반으로, Go 표준 `net/http` 대신 자체 요청/응답 모델을 사용합니다. `fiber.Ctx`는 풀링되어 재사용되므로, 고루틴 간에 저장하거나 공유하면 안 됩니다. 고루틴에 컨텍스트 데이터를 전달해야 한다면, 필요한 값을 먼저 복사하세요.

## Quick Start (Docker) / 빠른 시작

```bash
cp .env.example .env
make dev
```

> **Tip / 팁**: You can also start this stack from the [Brewnet Dashboard](../../dashboard/) — a browser UI that manages all 16 stacks with live status, README viewer, and inline API Explorer.
> [Brewnet Dashboard](../../dashboard/)에서 이 스택을 시작할 수도 있습니다 — 16개 스택의 실행 상태, README, API 테스트를 브라우저에서 한 번에 관리합니다.

| URL | Description / 설명 |
|-----|---------------------|
| http://localhost:3000 | Frontend |
| http://localhost:8080 | Backend API |
| http://localhost:8080/health | Healthcheck |

## Local Development (without Docker) / 로컬 개발

```bash
# Backend / 백엔드
cd backend
go mod tidy
DB_DRIVER=sqlite3 SQLITE_PATH=./data/brewnet_db.db go run cmd/server/main.go

# Frontend / 프론트엔드 (separate terminal / 별도 터미널)
cd frontend
npm install
VITE_API_URL=http://localhost:8080 npm run dev
```

## API Endpoints / API 엔드포인트

| Method | Path | Response | Description / 설명 |
|--------|------|----------|---------------------|
| GET | `/` | `{"service":"fiber-backend","status":"running","message":"..."}` | Service info / 서비스 정보 |
| GET | `/health` | `{"status":"ok","timestamp":"...","db_connected":bool}` | Healthcheck / 헬스체크 |
| GET | `/api/hello` | `{"message":"Hello from Fiber!","lang":"go","version":"..."}` | Hello API |
| POST | `/api/echo` | Request body echoed back / 요청 본문 그대로 반환 | Echo API |

```bash
curl -s http://localhost:8080/ | jq .
curl -s http://localhost:8080/health | jq .
curl -s http://localhost:8080/api/hello | jq .
curl -s -X POST http://localhost:8080/api/echo \
  -H "Content-Type: application/json" \
  -d '{"test":"brewnet"}' | jq .
```

## Database Configuration / DB 설정

Default: PostgreSQL. Change `DB_DRIVER` in `.env` to switch.

### PostgreSQL (default)

```bash
# .env
DB_DRIVER=postgres
DB_HOST=postgres          # Docker internal / Docker 내부
DB_PORT=5432
DB_NAME=brewnet_db
DB_USER=brewnet
DB_PASSWORD=your_secret
```

```
# GORM DSN (container internal / 컨테이너 내부)
host=postgres port=5432 user=brewnet password=your_secret dbname=brewnet sslmode=disable

# Connection string (from host / 호스트에서 접속)
postgresql://brewnet:your_secret@localhost:5433/brewnet
```

### MySQL

```bash
# .env
DB_DRIVER=mysql
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_DATABASE=brewnet_db
MYSQL_USER=brewnet
MYSQL_PASSWORD=your_secret
MYSQL_ROOT_PASSWORD=password
```

```
# GORM DSN (container internal / 컨테이너 내부)
brewnet:your_secret@tcp(mysql:3306)/brewnet?charset=utf8mb4&parseTime=True&loc=Local

# Connection string (from host / 호스트에서 접속)
mysql://brewnet:your_secret@localhost:3307/brewnet
```

### SQLite3

```bash
# .env
DB_DRIVER=sqlite3
SQLITE_PATH=/app/data/brewnet_db.db    # container path
# SQLITE_PATH=./data/brewnet_db.db     # local development
```

```
# No external DB container needed / 외부 DB 컨테이너 불필요
# File-based database / 파일 기반 데이터베이스
```

> **Note**: SQLite3 requires CGO_ENABLED=1 for Go (handled in Dockerfile).
> SQLite3는 CGO_ENABLED=1이 필요합니다 (Dockerfile에서 처리됨).

## Environment Variables / 환경변수

| Variable | Default | Description / 설명 |
|----------|---------|---------------------|
| `PROJECT_NAME` | `brewnet` | Project name / 프로젝트명 |
| `DOMAIN` | `localhost` | Domain / 도메인 |
| `DB_DRIVER` | `postgres` | DB type: `postgres` \| `mysql` \| `sqlite3` |
| `DB_HOST` | `postgres` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `brewnet_db` | Database name |
| `DB_USER` | `brewnet` | Database user |
| `DB_PASSWORD` | — | Database password (required) |
| `MYSQL_HOST` | `mysql` | MySQL host |
| `MYSQL_PORT` | `3306` | MySQL port |
| `MYSQL_DATABASE` | `brewnet_db` | MySQL database |
| `MYSQL_USER` | `brewnet` | MySQL user |
| `MYSQL_PASSWORD` | — | MySQL password |
| `MYSQL_ROOT_PASSWORD` | — | MySQL root password |
| `SQLITE_PATH` | `/app/data/brewnet_db.db` | SQLite file path |
| `BACKEND_PORT` | `8080` | Backend host port |
| `FRONTEND_PORT` | `3000` | Frontend host port |
| `VITE_API_URL` | `http://localhost:8080` | API URL for frontend dev |
| `TZ` | `Asia/Seoul` | Timezone |

## Makefile Targets / Makefile 타겟

| Target | Description / 설명 |
|--------|---------------------|
| `make dev` | Start with hot reload / 개발 모드 시작 |
| `make build` | Build Docker images / 이미지 빌드 |
| `make up` | Production mode / 프로덕션 모드 |
| `make down` | Stop services / 중지 |
| `make logs` | Follow logs / 로그 |
| `make test` | Run tests / 테스트 |
| `make clean` | Remove all / 전체 제거 |
| `make validate` | API verification / API 검증 |

## Project Structure / 프로젝트 구조

```
stacks/go-fiber/
├── backend/
│   ├── cmd/server/
│   │   └── main.go              # Entry point / 엔트리포인트
│   ├── internal/
│   │   ├── handler/
│   │   │   ├── root.go          # GET /
│   │   │   ├── health.go        # GET /health
│   │   │   ├── hello.go         # GET /api/hello
│   │   │   └── echo.go          # POST /api/echo
│   │   └── database/
│   │       └── database.go      # Multi-DB connection / 멀티 DB 연결
│   ├── go.mod
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/                    # React 19 + Vite 6 + TypeScript
├── docker-compose.yml
├── Makefile
├── .env.example
└── README.md
```
