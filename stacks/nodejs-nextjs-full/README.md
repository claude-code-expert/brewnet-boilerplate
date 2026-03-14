# Brewnet — Node.js Next.js Full-Stack Stack

> Node.js 22 + Next.js 15 (App Router) + Prisma 6 + React 19 + TypeScript

**Part of the [Brewnet Boilerplate](../../README.md) monorepo** — see root README for full stack list, CLI usage, and clone instructions. / [Brewnet Boilerplate](../../README.md) 모노레포의 일부입니다 — 전체 스택 목록, CLI 사용법, 클론 방법은 루트 README를 참고하세요.

Next.js 15 App Router full-stack boilerplate.
**React Server Components + Client Components + API Routes + DB** — all in one project.

Next.js 15 App Router 풀스택 보일러플레이트.
**React Server Components + Client Components + API Routes + DB**를 하나의 프로젝트로 구성합니다.

> **vs `nodejs-nextjs` (API Routes)**
> `nodejs-nextjs-full` uses Server Components to fetch data and render UI directly — full-stack in one project.
> `nodejs-nextjs` focuses on API Routes as a lightweight backend with minimal UI.
>
> `nodejs-nextjs-full`은 Server Component에서 직접 데이터를 가져와 UI를 렌더링하는 풀스택 패턴을 사용합니다.
> `nodejs-nextjs`는 API Routes 백엔드 중심으로 최소한의 UI만 포함합니다.

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
| 3000 | Next.js | Unified app (API + UI) / 통합 앱 (API + UI) |
| 5433 | PostgreSQL | Host-mapped DB port / 호스트 매핑 DB 포트 |
| 3307 | MySQL | Host-mapped DB port (when using MySQL) / MySQL 사용 시 호스트 매핑 포트 |

> **Note / 참고:** This stack does NOT use port 8080. Everything runs on port 3000.
> 이 스택은 포트 8080을 사용하지 않습니다. 모든 것이 포트 3000에서 실행됩니다.

---

## Quick Start (Docker) / 빠른 시작

```bash
cp .env.example .env
make dev
open http://localhost:3000
```

> **Tip / 팁**: You can also start this stack from the [Brewnet Dashboard](../../dashboard/) — a browser UI that manages all 16 stacks with live status, README viewer, and inline API Explorer.
> [Brewnet Dashboard](../../dashboard/)에서 이 스택을 시작할 수도 있습니다 — 16개 스택의 실행 상태, README, API 테스트를 브라우저에서 한 번에 관리합니다.

Once running, open your browser: / 실행 후 브라우저에서 확인:

| URL | Description / 설명 |
|-----|---------------------|
| http://localhost:3000 | Home page (Server Component rendering `/api/hello` data) |
| http://localhost:3000/health | Healthcheck — DB connection status |
| http://localhost:3000/api/hello | Hello API — runtime version info |
| http://localhost:3000/api/echo | Echo API (POST) — echoes request body |

---

## Architecture / 아키텍처

```
src/
├── app/
│   ├── api/
│   │   ├── hello/route.ts   ← GET /api/hello  (uses lib/hello)
│   │   └── echo/route.ts    ← POST /api/echo
│   ├── health/route.ts      ← GET /health
│   ├── route.ts             ← GET /
│   ├── layout.tsx           ← Root layout (imports globals.css)
│   ├── page.tsx             ← Home page (Server Component)
│   └── globals.css
├── components/
│   └── HelloCard.tsx        ← Client Component ('use client')
└── lib/
    ├── hello.ts             ← Shared logic (Server Component + API Route)
    └── db.ts                ← Prisma client
```

### Key Pattern / 핵심 패턴

Business logic lives in `lib/hello.ts` and is imported by both the **Server Component** (`page.tsx`) and the **API Route** (`/api/hello`).

비즈니스 로직을 `lib/hello.ts`에 두고, **Server Component**(`page.tsx`)와 **API Route**(`/api/hello`)에서 동일하게 import하여 사용합니다.

```
lib/hello.ts (shared logic)
    ├── app/page.tsx              ← Server Component: import directly
    └── app/api/hello/route.ts   ← API Route: import directly
```

The `HelloCard.tsx` is a `'use client'` component that receives data from the Server Component via props and adds interactivity (copy button).

`HelloCard.tsx`는 Server Component로부터 props를 받아 상호작용(복사 버튼)을 추가하는 `'use client'` 컴포넌트입니다.

---

## Local Development (without Docker) / 로컬 개발 (Docker 없이)

This is a **monorepo** — there is no separate `backend/` or `frontend/` directory.
이 스택은 **모노레포**입니다 — 별도의 `backend/` 또는 `frontend/` 디렉토리가 없습니다.

```bash
# Install dependencies / 의존성 설치
npm install

# Generate Prisma client / Prisma 클라이언트 생성
npx prisma generate

# Run with SQLite3 (no external DB needed / 외부 DB 불필요)
DB_DRIVER=sqlite3 \
DATABASE_URL="file:./data/brewnet_db.db" \
npm run dev
```

The app starts on `http://localhost:3000` with Next.js dev server (hot reload enabled).
앱이 `http://localhost:3000`에서 Next.js 개발 서버로 시작됩니다 (핫 리로드 활성화).

---

## API Endpoints / API 엔드포인트

All endpoints are served on **port 3000** (not 8080).
모든 엔드포인트는 **포트 3000**에서 제공됩니다 (8080이 아닙니다).

| Method | Path | Route File | Description / 설명 |
|--------|------|-----------|---------------------|
| GET | `/` | `src/app/route.ts` | Service info / 서비스 정보 |
| GET | `/health` | `src/app/health/route.ts` | Healthcheck with DB status / DB 연결 상태 포함 헬스체크 |
| GET | `/api/hello` | `src/app/api/hello/route.ts` | Hello message with runtime version / 런타임 버전 포함 인사 |
| POST | `/api/echo` | `src/app/api/echo/route.ts` | Echo back request body / 요청 본문 그대로 반환 |

### Response Examples / 응답 예시

```bash
# GET / — Service info / 서비스 정보
curl -s http://localhost:3000/ | jq .
```
```json
{
  "service": "nextjs-backend",
  "status": "running",
  "message": "☕ Brewnet says hello!"
}
```

```bash
# GET /health — Healthcheck / 헬스체크
curl -s http://localhost:3000/health | jq .
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
curl -s http://localhost:3000/api/hello | jq .
```
```json
{
  "message": "Hello from Next.js!",
  "lang": "nodejs",
  "version": "v22.0.0"
}
```

```bash
# POST /api/echo — Echo API
curl -s -X POST http://localhost:3000/api/echo \
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

This stack uses **Prisma ORM** with a dynamic `buildDatabaseUrl()` function in `src/lib/db.ts`.
The function constructs the connection URL at runtime based on `DB_DRIVER` and related environment variables.
If `DATABASE_URL` is set explicitly, it takes priority over the dynamic builder.

이 스택은 **Prisma ORM**을 사용하며, `src/lib/db.ts`의 `buildDatabaseUrl()` 함수가
런타임에 `DB_DRIVER`와 관련 환경변수를 기반으로 연결 URL을 동적으로 구성합니다.
`DATABASE_URL`이 명시적으로 설정된 경우 동적 빌더보다 우선합니다.

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
make down
# Edit .env — change DB_DRIVER, PRISMA_DB_PROVIDER, DATABASE_URL
# .env 수정 — DB_DRIVER, PRISMA_DB_PROVIDER, DATABASE_URL 변경
make dev
```

---

## Environment Variables / 환경변수

| Variable | Default | Description / 설명 |
|----------|---------|---------------------|
| `PROJECT_NAME` | `brewnet` | Project name / 프로젝트 이름 |
| `DOMAIN` | `localhost` | Domain name / 도메인 |
| `DB_DRIVER` | `postgres` | Database driver: `postgres`, `mysql`, `sqlite3` / DB 드라이버 |
| `BACKEND_PORT` | `3000` | Next.js host port (maps to container port 3000) / Next.js 호스트 포트 |
| `FRONTEND_PORT` | `3000` | Same as BACKEND_PORT (unified) / BACKEND_PORT와 동일 (통합) |
| `TZ` | `Asia/Seoul` | Timezone / 타임존 |
| `STACK_LANG` | `nodejs-nextjs-full` | Stack identifier / 스택 식별자 |
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
| `make test` | `docker compose run --rm backend npm test` | Run tests (Vitest) / 테스트 실행 |
| `make clean` | `docker compose down -v --rmi local` | Remove containers, volumes, images / 컨테이너, 볼륨, 이미지 모두 제거 |
| `make validate` | `bash ../../shared/scripts/validate.sh` | Healthcheck + API verification (port 3000) / 헬스체크 + API 자동 검증 |

---

## Project Structure / 프로젝트 구조

```
stacks/nodejs-nextjs-full/
├── src/
│   ├── app/
│   │   ├── route.ts              # GET / — root endpoint (service info JSON)
│   │   ├── layout.tsx            # Root layout (imports globals.css)
│   │   ├── page.tsx              # Home page — Server Component (uses lib/hello)
│   │   ├── globals.css           # Global styles
│   │   ├── health/
│   │   │   └── route.ts          # GET /health — healthcheck with DB status
│   │   └── api/
│   │       ├── hello/
│   │       │   └── route.ts      # GET /api/hello — uses lib/hello (shared logic)
│   │       └── echo/
│   │           └── route.ts      # POST /api/echo — echo request body
│   ├── components/
│   │   └── HelloCard.tsx         # 'use client' component — copy button interactivity
│   └── lib/
│       ├── hello.ts              # Shared: getHelloData() used by Server Component + API Route
│       └── db.ts                 # Prisma singleton + buildDatabaseUrl() + checkDbConnection()
├── prisma/
│   └── schema.prisma             # Prisma schema (env-driven provider)
├── public/                       # Static assets
├── package.json                  # Next.js 15, React 19, Prisma 6, TypeScript 5.7
├── next.config.ts                # output: 'standalone' for Docker optimization
├── tsconfig.json
├── Dockerfile                    # 3-stage build (deps -> builder -> runner, node:22-alpine)
├── .dockerignore
├── docker-compose.yml            # Services: backend (Next.js), postgres, mysql
├── Makefile                      # 8 standard targets
├── .env.example                  # Environment variable template / 환경변수 템플릿
└── README.md
```

> **Note / 참고:** Unlike other Brewnet stacks, there is no separate `frontend/` service in `docker-compose.yml`.
> Next.js handles server-side rendering, client components, and API routes in a single container on port 3000.
>
> 다른 Brewnet 스택과 달리, `docker-compose.yml`에 별도의 `frontend/` 서비스가 없습니다.
> Next.js가 단일 컨테이너에서 서버사이드 렌더링, 클라이언트 컴포넌트, API 라우트를 모두 처리합니다 (포트 3000).

---

## Docker Architecture / Docker 아키텍처

```
                    ┌─────────────────────────────────┐
                    │         brewnet (network)        │
                    │                                  │
  localhost:3000 ──►│  backend (next.js:3000)          │
                    │       │  UI + API unified        │
                    │       │  Server Components       │
                    │       │  + Client Components     │
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

- **brewnet** network: public, Next.js app accessible from host
- **brewnet-internal** network: internal only, Next.js + database communication
- Resource limits: backend 512M/1CPU
- No separate frontend container (unified architecture)

### Build Stages / 빌드 단계

| Stage / 단계 | Image / 이미지 | Purpose / 목적 |
|--------------|----------------|----------------|
| **deps** | `node:22-alpine` | Install production dependencies / 프로덕션 의존성 설치 |
| **builder** | `node:22-alpine` | Build Next.js standalone output / Next.js standalone 빌드 |
| **runner** | `node:22-alpine` | Minimal runtime / 최소 런타임 |

---

## Key Differences from Other Stacks / 다른 스택과의 차이점

| Feature | Other Stacks | nodejs-nextjs | nodejs-nextjs-full |
|---------|-------------|---------------|-------------------|
| Port | Backend 8080, Frontend 3000 | Everything on 3000 | Everything on 3000 |
| Architecture | Separate backend + frontend | Single unified container | Single unified container |
| UI | React SPA (Vite) | Minimal page | Server Components + Client Components |
| Shared logic | — | — | `lib/hello.ts` shared between Server Component + API Route |
| SSR | No (SPA) | API Routes only | React Server Components |
| Client Components | Full SPA | N/A | `HelloCard.tsx` (`'use client'`) |
| `BACKEND_PORT` | `8080` | `3000` | `3000` |

---

## Tech Stack / 기술 스택

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22 |
| Framework | Next.js 15 (App Router) |
| ORM | Prisma 6 (`@prisma/client`) |
| Language | TypeScript 5.7 |
| Frontend | React 19 (Server Components + Client Components) |
| Database | PostgreSQL 16 / MySQL 8.4 / SQLite3 |
| Testing | Vitest 3 |
| Container | Docker (node:22-alpine, standalone output) |

---

## License

MIT
