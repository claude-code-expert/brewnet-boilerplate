# Brewnet — Node.js Express Stack

> Node.js 22 + Express 5 + Prisma 6 + React 19 + Vite 6 + TypeScript

**Part of the [Brewnet Boilerplate](../../README.md) monorepo** — see root README for full stack list, CLI usage, and clone instructions. / [Brewnet Boilerplate](../../README.md) 모노레포의 일부입니다 — 전체 스택 목록, CLI 사용법, 클론 방법은 루트 README를 참고하세요.

Fullstack boilerplate with multi-DB support (PostgreSQL, MySQL, SQLite3).
Docker Compose one-command startup with hot reload for development.

풀스택 보일러플레이트. PostgreSQL, MySQL, SQLite3 멀티 DB 지원.
Docker Compose 한 줄 명령으로 핫 리로드 개발 환경을 즉시 시작합니다.

---

## Prerequisites / 사전 요구사항

### Node.js 22+

```bash
# nvm (recommended / 권장)
nvm install 22
nvm use 22

# Homebrew (macOS)
brew install node@22

# Verify / 확인
node --version  # v22.x.x
npm --version
```

### Docker

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (macOS / Windows) or Docker Engine + Docker Compose v2 (Linux)

### Available Ports / 사용 가능한 포트

| Port | Service | Description / 설명 |
|------|---------|---------------------|
| 8080 | Backend | Express API server / Express API 서버 |
| 3000 | Frontend | React dev server or nginx / React 개발 서버 또는 nginx |
| 5433 | PostgreSQL | Host-mapped DB port / 호스트 매핑 DB 포트 |
| 3307 | MySQL | Host-mapped DB port (when using MySQL) / MySQL 사용 시 호스트 매핑 포트 |

---

## Quick Start (Docker) / 빠른 시작

```bash
# 1. Set up environment variables / 환경변수 설정
cp .env.example .env

# 2. Start all services with hot reload / 핫 리로드로 전체 서비스 시작
make dev
```

> **Tip / 팁**: You can also start this stack from the [Brewnet Dashboard](../../dashboard/) — a browser UI that manages all 16 stacks with live status, README viewer, and inline API Explorer.
> [Brewnet Dashboard](../../dashboard/)에서 이 스택을 시작할 수도 있습니다 — 16개 스택의 실행 상태, README, API 테스트를 브라우저에서 한 번에 관리합니다.

Once running, open your browser: / 실행 후 브라우저에서 확인:

| URL | Description / 설명 |
|-----|---------------------|
| http://localhost:3000 | Frontend — Brewnet landing page |
| http://localhost:8080 | Backend root — service info JSON |
| http://localhost:8080/health | Healthcheck — DB connection status |
| http://localhost:8080/api/hello | Hello API — runtime version info |

---

## Local Development (without Docker) / 로컬 개발 (Docker 없이)

### Backend / 백엔드

```bash
cd backend
npm install
npx prisma generate

# Run with SQLite3 (no external DB needed / 외부 DB 불필요)
DB_DRIVER=sqlite3 \
DATABASE_URL="file:./data/brewnet_db.db" \
npm run dev
```

The backend starts on `http://localhost:8080`.

### Frontend / 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173` (Vite dev server).
Set `VITE_API_URL=http://localhost:8080` if the default does not work.

---

## API Endpoints / API 엔드포인트

| Method | Path | Description / 설명 |
|--------|------|---------------------|
| GET | `/` | Service info / 서비스 정보 |
| GET | `/health` | Healthcheck with DB status / DB 연결 상태 포함 헬스체크 |
| GET | `/api/hello` | Hello message with runtime version / 런타임 버전 포함 인사 |
| POST | `/api/echo` | Echo back request body / 요청 본문 그대로 반환 |

### Response Examples / 응답 예시

```bash
# GET / — Service info / 서비스 정보
curl -s http://localhost:8080/ | jq .
```
```json
{
  "service": "express-backend",
  "status": "running",
  "message": "☕ Brewnet says hello!"
}
```

```bash
# GET /health — Healthcheck / 헬스체크
curl -s http://localhost:8080/health | jq .
```
```json
{
  "status": "ok",
  "timestamp": "2026-03-01T12:00:00.000Z",
  "db_connected": true
}
```

```bash
# GET /api/hello — Hello API
curl -s http://localhost:8080/api/hello | jq .
```
```json
{
  "message": "Hello from Express!",
  "lang": "node",
  "version": "22.0.0"
}
```

```bash
# POST /api/echo — Echo API
curl -s -X POST http://localhost:8080/api/echo \
  -H "Content-Type: application/json" \
  -d '{"test": "brewnet", "number": 42}' | jq .
```
```json
{
  "test": "brewnet",
  "number": 42
}
```

---

## Database Configuration / 데이터베이스 설정

This stack uses **Prisma ORM** with environment-driven provider selection.
`PrismaClient` reads `DATABASE_URL` to connect to the configured database.

이 스택은 **Prisma ORM**을 사용하며, 환경변수로 DB 프로바이더를 선택합니다.
`PrismaClient`가 `DATABASE_URL`을 읽어 설정된 데이터베이스에 연결합니다.

### PostgreSQL (default / 기본값)

```env
DB_DRIVER=postgres
PRISMA_DB_PROVIDER=postgresql
DATABASE_URL=postgresql://brewnet:password@postgres:5432/brewnet_db
```

| Context | URL |
|---------|-----|
| Container (internal) | `postgresql://brewnet:password@postgres:5432/brewnet_db` |
| Host (external) | `postgresql://brewnet:password@localhost:5433/brewnet_db` |

### MySQL

```env
DB_DRIVER=mysql
PRISMA_DB_PROVIDER=mysql
DATABASE_URL=mysql://brewnet:password@mysql:3306/brewnet_db
```

| Context | URL |
|---------|-----|
| Container (internal) | `mysql://brewnet:password@mysql:3306/brewnet_db` |
| Host (external) | `mysql://brewnet:password@localhost:3307/brewnet_db` |

### SQLite3

```env
DB_DRIVER=sqlite3
PRISMA_DB_PROVIDER=sqlite
DATABASE_URL=file:/app/data/brewnet_db.db
```

| Context | URL |
|---------|-----|
| Container (internal) | `file:/app/data/brewnet_db.db` |
| Host / Local dev | `file:./data/brewnet_db.db` |

> **Note / 참고:** After changing `PRISMA_DB_PROVIDER`, you must regenerate the Prisma client:
> `PRISMA_DB_PROVIDER`를 변경한 후 Prisma 클라이언트를 재생성해야 합니다:
> ```bash
> npx prisma generate
> ```
> In Docker, the image rebuild (`make dev`) handles this automatically.
> Docker 환경에서는 이미지 재빌드(`make dev`) 시 자동으로 처리됩니다.

### Switching Databases / DB 전환

```bash
# 1. Stop services / 서비스 중지
make down

# 2. Edit .env — change DB_DRIVER, PRISMA_DB_PROVIDER, DATABASE_URL
#    .env 수정 — DB_DRIVER, PRISMA_DB_PROVIDER, DATABASE_URL 변경

# 3. Restart / 재시작
make dev
```

---

## Environment Variables / 환경변수

| Variable | Default | Description / 설명 |
|----------|---------|---------------------|
| `PROJECT_NAME` | `brewnet` | Project name / 프로젝트 이름 |
| `DOMAIN` | `localhost` | Domain name / 도메인 |
| `DB_DRIVER` | `postgres` | Database driver: `postgres`, `mysql`, `sqlite3` / DB 드라이버 |
| `BACKEND_PORT` | `8080` | Backend host port / 백엔드 호스트 포트 |
| `FRONTEND_PORT` | `3000` | Frontend host port / 프론트엔드 호스트 포트 |
| `TZ` | `Asia/Seoul` | Timezone / 타임존 |
| `STACK_LANG` | `nodejs-express` | Stack identifier / 스택 식별자 |
| `DB_HOST` | `postgres` | PostgreSQL host / PostgreSQL 호스트 |
| `DB_PORT` | `5432` | PostgreSQL port / PostgreSQL 포트 |
| `DB_NAME` | `brewnet_db` | PostgreSQL database name / PostgreSQL DB 이름 |
| `DB_USER` | `brewnet` | PostgreSQL username / PostgreSQL 사용자명 |
| `DB_PASSWORD` | `password` | PostgreSQL password / PostgreSQL 비밀번호 |
| `MYSQL_HOST` | `mysql` | MySQL host / MySQL 호스트 |
| `MYSQL_PORT` | `3306` | MySQL port / MySQL 포트 |
| `MYSQL_DATABASE` | `brewnet_db` | MySQL database name / MySQL DB 이름 |
| `MYSQL_USER` | `brewnet` | MySQL username / MySQL 사용자명 |
| `MYSQL_PASSWORD` | `password` | MySQL password / MySQL 비밀번호 |
| `MYSQL_ROOT_PASSWORD` | `password` | MySQL root password / MySQL 루트 비밀번호 |
| `SQLITE_PATH` | `/app/data/brewnet_db.db` | SQLite file path / SQLite 파일 경로 |
| `PRISMA_DB_PROVIDER` | `postgresql` | Prisma provider: `postgresql`, `mysql`, `sqlite` / Prisma 프로바이더 |
| `DATABASE_URL` | *(auto from provider)* | Prisma connection URL / Prisma 연결 URL |

---

## Makefile Targets / Makefile 타겟

| Target | Command | Description / 설명 |
|--------|---------|---------------------|
| `make dev` | `docker compose up --build` | Start with hot reload / 핫 리로드 개발 모드 시작 |
| `make build` | `docker compose build` | Build Docker images / Docker 이미지 빌드 |
| `make up` | `docker compose up -d` | Start in production mode (detached) / 프로덕션 모드 시작 |
| `make down` | `docker compose down` | Stop all services / 모든 서비스 중지 |
| `make logs` | `docker compose logs -f` | Follow container logs / 컨테이너 로그 실시간 확인 |
| `make test` | `docker compose run --rm backend npm test` | Run tests / 테스트 실행 |
| `make clean` | `docker compose down -v --rmi local` | Remove containers, volumes, images / 컨테이너, 볼륨, 이미지 모두 제거 |
| `make validate` | `bash ../../shared/scripts/validate.sh` | Healthcheck + API verification / 헬스체크 + API 자동 검증 |

---

## Project Structure / 프로젝트 구조

```
stacks/nodejs-express/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express app entry point / Express 앱 엔트리포인트
│   │   ├── database.ts           # Prisma client + connection check / Prisma 클라이언트 + 연결 확인
│   │   └── routes/
│   │       ├── root.ts           # GET / (service info), GET /health
│   │       ├── hello.ts          # GET /api/hello
│   │       └── echo.ts           # POST /api/echo
│   ├── prisma/
│   │   └── schema.prisma         # Prisma schema (env-driven provider)
│   ├── package.json              # Express 5, Prisma 6, TypeScript 5.7
│   ├── tsconfig.json
│   ├── Dockerfile                # Multi-stage build (node:22-alpine)
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Main component — Brewnet landing page
│   │   └── main.tsx              # React 19 entry point
│   ├── nginx.conf                # Production: static files + reverse proxy /api -> backend
│   ├── Dockerfile                # Multi-stage build (node:22-alpine -> nginx)
│   └── .dockerignore
├── docker-compose.yml            # Services: backend, frontend, postgres, mysql
├── Makefile                      # 8 standard targets
├── .env.example                  # Environment variable template / 환경변수 템플릿
└── README.md
```

---

## Docker Architecture / Docker 아키텍처

```
                    ┌─────────────────────────────────┐
                    │         brewnet (network)        │
                    │                                  │
  localhost:3000 ──►│  frontend (nginx:80)             │
                    │       │ reverse proxy /api ──►   │
  localhost:8080 ──►│  backend (express:8080)          │
                    │       │                          │
                    │       ▼                          │
                    │  ┌──────────────────────────┐   │
                    │  │  brewnet-internal (network)│  │
                    │  │                            │  │
                    │  │  postgres (5432) ◄─────────│  │
  localhost:5433 ──►│  │  mysql (3306)    ◄─────────│  │
  localhost:3307 ──►│  └──────────────────────────┘   │
                    └─────────────────────────────────┘
```

- **brewnet** network: public, frontend + backend communication
- **brewnet-internal** network: internal only, backend + database communication
- Resource limits: backend 512M/1CPU, frontend 128M/0.5CPU

---

## Tech Stack / 기술 스택

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22 |
| Backend Framework | Express 5 |
| ORM | Prisma 6 (`@prisma/client`) |
| Language | TypeScript 5.7 |
| Frontend | React 19 + Vite 6 |
| Database | PostgreSQL 16 / MySQL 8.4 / SQLite3 |
| Testing | Vitest 3 + Supertest 7 |
| Container | Docker (node:22-alpine) |

---

## License

Apache 2.0
