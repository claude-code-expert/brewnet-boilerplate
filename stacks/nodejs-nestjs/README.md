# Brewnet — Node.js NestJS Stack

> Node.js 22 + NestJS 11 + Prisma 6 + React 19 + Vite 6 + TypeScript

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
| 8080 | Backend | NestJS API server / NestJS API 서버 |
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

Once running, open your browser: / 실행 후 브라우저에서 확인:

| URL | Description / 설명 |
|-----|---------------------|
| http://localhost:3000 | Frontend — displays "Hello from NestJS!" message |
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
DATABASE_URL="file:./data/brewnet.db" \
npm run start:dev
```

The backend starts on `http://localhost:8080` with watch mode (auto-restart on file changes).
백엔드가 `http://localhost:8080`에서 watch 모드로 시작됩니다 (파일 변경 시 자동 재시작).

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
  "service": "nestjs-backend",
  "status": "running",
  "message": "🍺 Brewnet says hello!"
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
  "message": "Hello from NestJS!",
  "lang": "nodejs",
  "version": "v22.0.0"
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

This stack uses **Prisma ORM** with a dynamic `buildDatabaseUrl()` function in `PrismaService`.
The function constructs the connection URL at runtime based on `DB_DRIVER` and related environment variables.
If `DATABASE_URL` is set explicitly, it takes priority over the dynamic builder.

이 스택은 **Prisma ORM**을 사용하며, `PrismaService`의 `buildDatabaseUrl()` 함수가
런타임에 `DB_DRIVER`와 관련 환경변수를 기반으로 연결 URL을 동적으로 구성합니다.
`DATABASE_URL`이 명시적으로 설정된 경우 동적 빌더보다 우선합니다.

### PostgreSQL (default / 기본값)

```env
DB_DRIVER=postgres
PRISMA_DB_PROVIDER=postgresql
DATABASE_URL=postgresql://brewnet:brewnet_secret@postgres:5432/brewnet
```

| Context | URL |
|---------|-----|
| Container (internal) | `postgresql://brewnet:brewnet_secret@postgres:5432/brewnet` |
| Host (external) | `postgresql://brewnet:brewnet_secret@localhost:5433/brewnet` |

### MySQL

```env
DB_DRIVER=mysql
PRISMA_DB_PROVIDER=mysql
DATABASE_URL=mysql://brewnet:brewnet_secret@mysql:3306/brewnet
```

| Context | URL |
|---------|-----|
| Container (internal) | `mysql://brewnet:brewnet_secret@mysql:3306/brewnet` |
| Host (external) | `mysql://brewnet:brewnet_secret@localhost:3307/brewnet` |

### SQLite3

```env
DB_DRIVER=sqlite3
PRISMA_DB_PROVIDER=sqlite
DATABASE_URL=file:/app/data/brewnet.db
```

| Context | URL |
|---------|-----|
| Container (internal) | `file:/app/data/brewnet.db` |
| Host / Local dev | `file:./data/brewnet.db` |

### Dynamic URL Builder (`buildDatabaseUrl()`) / 동적 URL 빌더

The `PrismaService` (`backend/src/prisma/prisma.service.ts`) automatically constructs the database URL:

`PrismaService` (`backend/src/prisma/prisma.service.ts`)가 자동으로 데이터베이스 URL을 구성합니다:

```typescript
function buildDatabaseUrl(): string {
    const driver = process.env.DB_DRIVER || 'postgres';
    if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
    switch (driver) {
        case 'mysql':
            return `mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}`;
        case 'sqlite3':
            return `file:${SQLITE_PATH}`;
        default:
            return `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
    }
}
```

This means you can either:
- Set `DATABASE_URL` directly (takes priority) / `DATABASE_URL`을 직접 설정 (우선 적용)
- Or set `DB_DRIVER` + individual DB variables and let the builder construct the URL / 또는 `DB_DRIVER` + 개별 DB 변수를 설정하여 자동 구성

> **Note / 참고:** After changing `PRISMA_DB_PROVIDER`, you must regenerate the Prisma client:
> `PRISMA_DB_PROVIDER`를 변경한 후 Prisma 클라이언트를 재생성해야 합니다:
> ```bash
> npx prisma generate
> ```
> In Docker, the image rebuild (`make dev`) handles this automatically.
> Docker 환경에서는 이미지 재빌드(`make dev`) 시 자동으로 처리됩니다.

### Graceful Degradation / 우아한 처리

`PrismaService` implements `OnModuleInit` with try-catch on `$connect()`.
If the database is unavailable at startup, the application still starts normally and
`db_connected` returns `false` on the `/health` endpoint.

`PrismaService`는 `OnModuleInit`에서 `$connect()`를 try-catch로 감싸고 있습니다.
시작 시 데이터베이스를 사용할 수 없어도 애플리케이션은 정상적으로 시작되며,
`/health` 엔드포인트에서 `db_connected`가 `false`로 반환됩니다.

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
| `STACK_LANG` | `nodejs-nestjs` | Stack identifier / 스택 식별자 |
| `DB_HOST` | `postgres` | PostgreSQL host / PostgreSQL 호스트 |
| `DB_PORT` | `5432` | PostgreSQL port / PostgreSQL 포트 |
| `DB_NAME` | `brewnet` | PostgreSQL database name / PostgreSQL DB 이름 |
| `DB_USER` | `brewnet` | PostgreSQL username / PostgreSQL 사용자명 |
| `DB_PASSWORD` | `brewnet_secret` | PostgreSQL password / PostgreSQL 비밀번호 |
| `MYSQL_HOST` | `mysql` | MySQL host / MySQL 호스트 |
| `MYSQL_PORT` | `3306` | MySQL port / MySQL 포트 |
| `MYSQL_DATABASE` | `brewnet` | MySQL database name / MySQL DB 이름 |
| `MYSQL_USER` | `brewnet` | MySQL username / MySQL 사용자명 |
| `MYSQL_PASSWORD` | `brewnet_secret` | MySQL password / MySQL 비밀번호 |
| `MYSQL_ROOT_PASSWORD` | `root_secret` | MySQL root password / MySQL 루트 비밀번호 |
| `SQLITE_PATH` | `/app/data/brewnet.db` | SQLite file path / SQLite 파일 경로 |
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
| `make test` | `docker compose run --rm backend npm test` | Run tests (Jest) / 테스트 실행 |
| `make clean` | `docker compose down -v --rmi local` | Remove containers, volumes, images / 컨테이너, 볼륨, 이미지 모두 제거 |
| `make validate` | `bash ../../shared/scripts/validate.sh` | Healthcheck + API verification / 헬스체크 + API 자동 검증 |

---

## Project Structure / 프로젝트 구조

```
stacks/nodejs-nestjs/
├── backend/
│   ├── src/
│   │   ├── main.ts               # NestJS bootstrap entry / NestJS 부트스트랩 엔트리포인트
│   │   ├── app.module.ts         # Root module — registers controller, service, prisma
│   │   ├── app.controller.ts     # HTTP endpoints: /, /health, /api/hello, /api/echo
│   │   ├── app.service.ts        # Business logic — health check via PrismaService
│   │   └── prisma/
│   │       └── prisma.service.ts # PrismaClient wrapper + dynamic DB URL builder
│   ├── prisma/
│   │   └── schema.prisma         # Prisma schema (env-driven provider)
│   ├── package.json              # NestJS 11, Prisma 6, TypeScript 5.7
│   ├── tsconfig.json
│   ├── nest-cli.json             # NestJS CLI configuration
│   ├── Dockerfile                # Multi-stage build (node:22-alpine)
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Main component — calls GET /api/hello
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
  localhost:8080 ──►│  backend (nestjs:8080)           │
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

## NestJS Architecture / NestJS 아키텍처

```
AppModule
  ├── AppController      ← HTTP request handling (4 endpoints)
  ├── AppService         ← Business logic (health check)
  └── PrismaService      ← Database connection (Prisma ORM)
```

| Component | File | Role / 역할 |
|-----------|------|-------------|
| `AppModule` | `app.module.ts` | Root module — wires controllers, services, providers |
| `AppController` | `app.controller.ts` | Route handler — `@Get()`, `@Get('health')`, `@Get('api/hello')`, `@Post('api/echo')` |
| `AppService` | `app.service.ts` | Service layer — `getHealth()` calls `PrismaService.checkConnection()` |
| `PrismaService` | `prisma/prisma.service.ts` | Prisma lifecycle — `OnModuleInit`, `OnModuleDestroy`, `buildDatabaseUrl()` |

---

## Tech Stack / 기술 스택

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22 |
| Backend Framework | NestJS 11 (Express platform) |
| ORM | Prisma 6 (`@prisma/client`) |
| Language | TypeScript 5.7 |
| Frontend | React 19 + Vite 6 |
| Database | PostgreSQL 16 / MySQL 8.4 / SQLite3 |
| Testing | Jest 29 + Supertest 7 |
| Container | Docker (node:22-alpine) |

---

## License

MIT
