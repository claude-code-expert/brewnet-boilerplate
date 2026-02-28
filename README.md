<p align="center">
  <h1 align="center">Brewnet Boilerplate</h1>
  <p align="center">
    <a href="https://www.brewnet.dev">https://www.brewnet.dev</a> · <a href="mailto:brewnet.dev@gmail.com">brewnet.dev@gmail.com</a>
  </p>
  <p align="center">
    <em>손쉽게 설치하는 나만의 홈서버, Brewnet</em><br/>
    <strong>Your server on tap. Just brew it.</strong><br/>
    <em>한 명령어로 풀스택 앱을 생성하세요.</em>
  </p>
</p>

<p align="center">
  <a href="#quick-start--빠른-시작">Quick Start</a> ·
  <a href="#available-stacks--지원-스택">Stacks</a> ·
  <a href="#brewnet-cli-usage--cli-사용법">CLI Usage</a> ·
  <a href="#manual-clone--수동-클론">Manual Clone</a>
</p>

---

Multi-language fullstack boilerplate monorepo for the **Brewnet CLI** (`brewnet create-app`). Each stack is a self-contained backend + frontend project that runs with a single `docker compose up`.

**Brewnet CLI** (`brewnet create-app`)를 위한 다중 언어 풀스택 보일러플레이트 모노레포입니다. 각 스택은 `docker compose up` 한 번으로 실행 가능한 독립적인 백엔드 + 프론트엔드 프로젝트입니다.

## Quick Start / 빠른 시작

### Option 1: Brewnet CLI (Recommended / 권장)

```bash
# Install Brewnet CLI / Brewnet CLI 설치
npm install -g brewnet

# Create a new project / 새 프로젝트 생성
brewnet create-app my-project

# Interactive prompts will guide you: / 대화형 프롬프트가 안내합니다:
# → Select language (Go, Rust, Java, Kotlin, Node.js, Python)
# → Select framework (Gin, Echo, Fiber, Spring Boot, Express, FastAPI, ...)
# → Select frontend (React, Vue, Svelte, API-only)
# → Auto-generates .env with secure secrets
# → Starts Docker containers

# Open your app / 앱 열기
open http://localhost:3000
```

### Option 2: Manual Clone / 수동 클론

```bash
# Clone the entire boilerplate repo / 전체 보일러플레이트 저장소 클론
git clone https://github.com/user/brewnet-boilerplate.git
cd brewnet-boilerplate

# Pick a stack and run / 스택을 선택하고 실행
cd stacks/go-gin
cp .env.example .env
make dev

# Open your app / 앱 열기
open http://localhost:3000
```

---

## Available Stacks / 지원 스택

15 backend stacks + 2 frontend templates, all production-ready with Docker.

15개의 백엔드 스택과 2개의 프론트엔드 템플릿을 제공하며, 모두 Docker로 프로덕션 준비가 되어 있습니다.

### Backend Stacks / 백엔드 스택

| Language | Stack | Framework | ORM / DB Layer | Entry Point |
|----------|-------|-----------|----------------|-------------|
| **Go** | `go-gin` | Gin | GORM | `backend/cmd/server/main.go` |
| | `go-echo` | Echo v4 | GORM | `backend/cmd/server/main.go` |
| | `go-fiber` | Fiber v3 | GORM | `backend/cmd/server/main.go` |
| **Rust** | `rust-actix-web` | Actix-web 4 | SQLx | `backend/src/main.rs` |
| | `rust-axum` | Axum 0.8 | SQLx | `backend/src/main.rs` |
| **Java** | `java-springboot` | Spring Boot 3.4 | JPA / JDBC | `backend/src/.../Application.java` |
| | `java-spring` | Spring Framework 6.2 | JDBC / HikariCP | `backend/src/.../Application.java` |
| **Kotlin** | `kotlin-ktor` | Ktor 3.1 | Exposed ORM | `backend/src/.../Application.kt` |
| | `kotlin-springboot` | Spring Boot 3.4 | JDBC | `backend/src/.../Application.kt` |
| **Node.js** | `nodejs-express` | Express 5 | Prisma | `backend/src/index.ts` |
| | `nodejs-nestjs` | NestJS 11 | Prisma | `backend/src/main.ts` |
| | `nodejs-nextjs` | Next.js 15 | Prisma | `src/app/route.ts` |
| **Python** | `python-fastapi` | FastAPI | SQLAlchemy (async) | `backend/src/main.py` |
| | `python-django` | Django 6 | Django ORM | `backend/src/config/wsgi.py` |
| | `python-flask` | Flask 3.1 | Flask-SQLAlchemy | `backend/wsgi.py` |

### Frontend Templates / 프론트엔드 템플릿

| Template | Tech Stack | Description / 설명 |
|----------|------------|---------------------|
| Default (included in each stack) | React 19 + Vite 6 + TypeScript | Default frontend / 기본 프론트엔드 |
| `frontend-vue` | Vue.js 3 + Vite 6 + TypeScript | Vue.js alternative / Vue.js 대체 프론트엔드 |
| `frontend-svelte` | SvelteKit + TypeScript | SvelteKit alternative / SvelteKit 대체 프론트엔드 |

> **Note / 참고**: `nodejs-nextjs` is a unified stack — frontend and backend are a single Next.js app on port 3000.
> `nodejs-nextjs`는 통합 스택으로, 프론트엔드와 백엔드가 하나의 Next.js 앱으로 포트 3000에서 동작합니다.

---

## Brewnet CLI Usage / CLI 사용법

### Installation / 설치

```bash
npm install -g brewnet
```

### Create a New App / 새 앱 생성

```bash
brewnet create-app <project-name> [options]
```

**Interactive mode** — just run without options, the CLI guides you step by step:

**대화형 모드** — 옵션 없이 실행하면 CLI가 단계별로 안내합니다:

```bash
brewnet create-app my-project
```

```
? Select a language / 언어를 선택하세요:
  ❯ Go
    Rust
    Java
    Kotlin
    Node.js
    Python

? Select a framework / 프레임워크를 선택하세요:
  ❯ Gin (lightweight, fast)
    Echo (minimalist, extensible)
    Fiber (Express-inspired)

? Select a frontend / 프론트엔드를 선택하세요:
  ❯ React (default)
    Vue.js
    SvelteKit
    API-only (no frontend)
```

**With flags** — skip prompts for CI/scripting:

**플래그 사용** — CI/스크립트에서 프롬프트 생략:

```bash
# Specify stack directly / 스택 직접 지정
brewnet create-app my-api --stack go-gin

# With frontend template / 프론트엔드 템플릿 지정
brewnet create-app my-app --stack rust-axum --frontend vue

# API-only (no frontend) / API 전용 (프론트엔드 없음)
brewnet create-app my-api --stack python-fastapi --frontend none
```

### What Happens / 내부 동작

```
brewnet create-app my-project --stack go-gin
```

1. Shallow-clones this repo / 이 저장소를 shallow clone합니다
2. Copies `stacks/go-gin/` → `~/.brewnet/projects/my-project/` / 스택 복사
3. Auto-generates `.env` with secure secrets / 보안 시크릿이 포함된 `.env` 자동 생성
4. Runs `docker compose up -d` / Docker 컨테이너 시작
5. Opens `http://localhost:3000` / 브라우저에서 앱 열기

---

## Manual Clone / 수동 클론

### Clone the Entire Repo / 전체 저장소 클론

```bash
git clone https://github.com/user/brewnet-boilerplate.git
cd brewnet-boilerplate
```

### Clone a Single Stack / 단일 스택만 클론

If you only need one stack, use sparse checkout to save bandwidth:

하나의 스택만 필요한 경우 sparse checkout으로 용량을 절약하세요:

```bash
# Sparse checkout a single stack / 단일 스택 sparse checkout
git clone --filter=blob:none --sparse https://github.com/user/brewnet-boilerplate.git
cd brewnet-boilerplate
git sparse-checkout set stacks/go-gin shared

# Or use degit for a clean copy / 또는 degit으로 클린 복사
npx degit user/brewnet-boilerplate/stacks/go-gin my-project
cd my-project
```

### Run a Stack / 스택 실행

```bash
cd stacks/go-gin          # or any stack / 또는 원하는 스택
cp .env.example .env      # configure environment / 환경 설정
make dev                  # start with Docker / Docker로 시작
```

| URL | Description / 설명 |
|-----|---------------------|
| http://localhost:3000 | Frontend / 프론트엔드 |
| http://localhost:8080 | Backend API / 백엔드 API |
| http://localhost:8080/health | Health check / 헬스체크 |
| http://localhost:8080/api/hello | Hello API |

---

## API Contract / API 규약

All 15 backend stacks implement the same 4 endpoints:

모든 15개 백엔드 스택은 동일한 4개의 엔드포인트를 구현합니다:

| Method | Path | Response | Description / 설명 |
|--------|------|----------|---------------------|
| `GET` | `/` | `{"service":"...-backend","status":"running","message":"..."}` | Service info / 서비스 정보 |
| `GET` | `/health` | `{"status":"ok","timestamp":"...","db_connected":true\|false}` | Health check / 헬스체크 |
| `GET` | `/api/hello` | `{"message":"Hello from ...!","lang":"...","version":"..."}` | Hello API |
| `POST` | `/api/echo` | Echo back request body / 요청 본문 그대로 반환 | Echo API |

```bash
# Test any stack / 아무 스택이나 테스트
curl -s http://localhost:8080/api/hello | jq .
curl -s -X POST http://localhost:8080/api/echo \
  -H "Content-Type: application/json" \
  -d '{"hello":"brewnet"}' | jq .
```

---

## Database Support / 데이터베이스 지원

All stacks support 3 databases via `DB_DRIVER` environment variable:

모든 스택은 `DB_DRIVER` 환경 변수를 통해 3개의 데이터베이스를 지원합니다:

| DB_DRIVER | Database | Host Port | Note / 참고 |
|-----------|----------|-----------|-------------|
| `postgres` (default) | PostgreSQL 16 | 5433 | Default, recommended / 기본값, 권장 |
| `mysql` | MySQL 8.4 | 3307 | Alternative / 대안 |
| `sqlite3` | SQLite3 | — | No external container needed / 외부 컨테이너 불필요 |

```bash
# Switch database / 데이터베이스 전환
make down
# Edit .env: DB_DRIVER=mysql
make dev
```

---

## Port Conventions / 포트 규약

| Service | Container Port | Host Port | Note / 참고 |
|---------|---------------|-----------|-------------|
| Backend | 8080 | `localhost:8080` | All stacks / 전 스택 공통 |
| Frontend | 5173 (dev) / 80 (prod) | `localhost:3000` | nginx in production / 프로덕션에서 nginx |
| PostgreSQL | 5432 | `localhost:5433` | Avoid conflict with local PG / 로컬 PG 충돌 방지 |
| MySQL | 3306 | `localhost:3307` | Avoid conflict with local MySQL / 로컬 MySQL 충돌 방지 |

---

## Makefile Targets / Makefile 타겟

Uniform across all stacks:

모든 스택에서 동일합니다:

| Target | Description / 설명 |
|--------|---------------------|
| `make dev` | Start with hot reload (docker compose up --build) / 핫 리로드로 시작 |
| `make build` | Build Docker images / Docker 이미지 빌드 |
| `make up` | Production mode (detached) / 프로덕션 모드 (백그라운드) |
| `make down` | Stop all services / 전체 서비스 중지 |
| `make logs` | Follow container logs / 컨테이너 로그 추적 |
| `make test` | Run tests / 테스트 실행 |
| `make clean` | Remove containers, volumes, images / 컨테이너, 볼륨, 이미지 제거 |
| `make validate` | Verify API endpoints / API 엔드포인트 검증 |

---

## Repository Structure / 저장소 구조

```
brewnet-boilerplate/
├── stacks/                          ← Fullstack boilerplates / 풀스택 보일러플레이트
│   ├── go-gin/                      ← Go (Gin + React)
│   ├── go-echo/                     ← Go (Echo + React)
│   ├── go-fiber/                    ← Go (Fiber v3 + React)
│   ├── rust-actix-web/              ← Rust (Actix-web + React)
│   ├── rust-axum/                   ← Rust (Axum + React)
│   ├── java-springboot/             ← Java (Spring Boot + React)
│   ├── java-spring/                 ← Java (Spring Framework + React)
│   ├── kotlin-ktor/                 ← Kotlin (Ktor + React)
│   ├── kotlin-springboot/           ← Kotlin (Spring Boot + React)
│   ├── nodejs-express/              ← Node.js (Express + React)
│   ├── nodejs-nestjs/               ← Node.js (NestJS + React)
│   ├── nodejs-nextjs/               ← Node.js (Next.js unified)
│   ├── python-fastapi/              ← Python (FastAPI + React)
│   ├── python-django/               ← Python (Django + React)
│   ├── python-flask/                ← Python (Flask + React)
│   ├── frontend-vue/                ← Vue.js frontend template
│   └── frontend-svelte/             ← SvelteKit frontend template
├── shared/                          ← Common scripts / 공용 스크립트
│   ├── scripts/validate.sh          ← Health check + API verification
│   └── traefik/                     ← Reverse proxy config
├── docs/                            ← Documentation / 문서
│   ├── PRD.md                       ← Product Requirements
│   ├── TRD.md                       ← Technical Requirements
│   └── BREWNET-USER-STORY.md        ← User stories
├── .github/workflows/               ← CI: validate all stacks
├── CLAUDE.md                        ← AI assistant guide
├── LICENSE                          ← MIT License
└── README.md                        ← This file / 이 파일
```

Each `stacks/{lang}-{framework}/` directory contains:

각 `stacks/{lang}-{framework}/` 디렉토리에는 다음이 포함됩니다:

```
stacks/{lang}-{framework}/
├── backend/           ← Backend source + Dockerfile
├── frontend/          ← React/Vue/Svelte + Dockerfile (except nextjs)
├── docker-compose.yml ← All services defined
├── Makefile           ← Uniform build targets
├── .env.example       ← Environment variable template
└── README.md          ← Stack-specific documentation
```

---

## Docker Architecture / Docker 아키텍처

- **Multi-stage builds** — builder → runner in all Dockerfiles / 모든 Dockerfile에서 멀티스테이지 빌드
- **Non-root execution** — `appuser` or language convention / 비루트 사용자 실행
- **Health checks** — `HEALTHCHECK` in all services / 모든 서비스에 헬스체크
- **Network isolation** — `brewnet` (public) + `brewnet-internal` (DB only) / 네트워크 격리
- **Resource limits** — CPU and memory limits via `deploy.resources.limits` / 리소스 제한

---

## Environment Variables / 환경 변수

Common across all stacks (`.env.example`):

모든 스택에서 공통 (`.env.example`):

| Variable | Default | Description / 설명 |
|----------|---------|---------------------|
| `PROJECT_NAME` | `brewnet` | Project name / 프로젝트명 |
| `DOMAIN` | `localhost` | Domain / 도메인 |
| `DB_DRIVER` | `postgres` | `postgres` \| `mysql` \| `sqlite3` |
| `DB_HOST` | `postgres` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `brewnet` | Database name / DB명 |
| `DB_USER` | `brewnet` | Database user / DB 사용자 |
| `DB_PASSWORD` | — | Database password / DB 비밀번호 |
| `BACKEND_PORT` | `8080` | Backend host port / 백엔드 포트 |
| `FRONTEND_PORT` | `3000` | Frontend host port / 프론트엔드 포트 |
| `VITE_API_URL` | `http://localhost:8080` | API URL for frontend dev / 프론트엔드 개발용 API URL |
| `TZ` | `Asia/Seoul` | Timezone / 타임존 |

---

## CI / 지속적 통합

GitHub Actions (`validate-stacks.yml`) validates every stack on push:

GitHub Actions가 푸시 시 모든 스택을 검증합니다:

```
docker compose build → docker compose up -d → GET /health (200) → GET /api/hello (200) → docker compose down
```

---

## Contributing / 기여하기

We welcome contributions! If you'd like to add support for a new tech stack, please follow the steps below and submit a PR.

기여를 환영합니다! 지원하고 싶은 기술 스택이 있을 경우, 아래 조건을 충족하게 만드신 후 PR을 보내주세요.

---

### Step 1: Create Directory / 디렉토리 생성

Create your stack directory following the naming convention:

네이밍 규칙에 따라 스택 디렉토리를 생성하세요:

```bash
mkdir -p stacks/{lang}-{framework}
# Example: stacks/ruby-rails, stacks/csharp-aspnet, stacks/elixir-phoenix
```

Your directory must contain the following files:

디렉토리에는 다음 파일들이 포함되어야 합니다:

```
stacks/{lang}-{framework}/
├── backend/              # Backend source code + Dockerfile
│   ├── Dockerfile        # Multi-stage build (builder → runner)
│   └── .dockerignore
├── frontend/             # React 19 + Vite 6 + TypeScript (copy from existing stack)
│   ├── Dockerfile        # Multi-stage build (node → nginx)
│   └── .dockerignore
├── docker-compose.yml    # backend + frontend + postgres + mysql services
├── Makefile              # Standard targets (dev, build, up, down, logs, test, clean, validate)
├── .env.example          # Environment variable template
└── README.md             # Stack-specific documentation (KR/EN bilingual)
```

### Step 2: Implement 4 Backend Endpoints / 4개 백엔드 엔드포인트 구현

All stacks must implement the same API contract. This ensures consistency and allows the Brewnet CLI to validate any stack uniformly.

모든 스택은 동일한 API 규약을 구현해야 합니다. 이를 통해 Brewnet CLI가 모든 스택을 동일한 방식으로 검증할 수 있습니다.

| Method | Path | Response Format |
|--------|------|-----------------|
| `GET` | `/` | `{"service":"{framework}-backend","status":"running","message":"🍺 Brewnet says hello!"}` |
| `GET` | `/health` | `{"status":"ok","timestamp":"...","db_connected":true\|false}` |
| `GET` | `/api/hello` | `{"message":"Hello from {Framework}!","lang":"{lang}","version":"..."}` |
| `POST` | `/api/echo` | Echo back the request body as-is / 요청 본문을 그대로 반환 |

### Step 3: Database Support / 데이터베이스 지원

Your stack must support 3 databases via the `DB_DRIVER` environment variable:

`DB_DRIVER` 환경 변수를 통해 3개의 데이터베이스를 지원해야 합니다:

- **PostgreSQL** (`DB_DRIVER=postgres`) — default, using your language's standard ORM/driver
- **MySQL** (`DB_DRIVER=mysql`) — alternative, same ORM/driver
- **SQLite3** (`DB_DRIVER=sqlite3`) — file-based, no external container needed

### Step 4: Docker Requirements / Docker 요구사항

| Requirement / 요구사항 | Description / 설명 |
|---|---|
| Multi-stage build | Builder stage → lightweight runner stage / 빌드 스테이지 → 경량 실행 스테이지 |
| Non-root user | Run as `appuser` or language convention / `appuser` 또는 언어 관례로 실행 |
| HEALTHCHECK | Backend must include HEALTHCHECK directive / 백엔드에 HEALTHCHECK 지시어 포함 |
| .dockerignore | Exclude unnecessary files from build context / 불필요한 파일 빌드 컨텍스트에서 제외 |
| Network isolation | `brewnet` (public) + `brewnet-internal` (DB only) / 네트워크 격리 |
| Resource limits | Set CPU and memory limits in docker-compose.yml / 리소스 제한 설정 |
| Port convention | Backend: `8080`, Frontend: `3000`, PostgreSQL: `5433`, MySQL: `3307` |

> **Important / 중요**: Use `127.0.0.1` instead of `localhost` in HEALTHCHECK commands. Alpine containers resolve `localhost` to IPv6 (`::1`), which can cause healthcheck failures.
>
> HEALTHCHECK 명령에서 `localhost` 대신 `127.0.0.1`을 사용하세요. Alpine 컨테이너는 `localhost`를 IPv6(`::1`)로 해석하여 헬스체크가 실패할 수 있습니다.

### Step 5: Frontend Integration / 프론트엔드 연동

Copy the `frontend/` directory from any existing stack (e.g., `stacks/go-gin/frontend/`). The React frontend is shared across all stacks.

기존 스택(예: `stacks/go-gin/frontend/`)에서 `frontend/` 디렉토리를 복사하세요. React 프론트엔드는 모든 스택에서 공유됩니다.

- `App` component calls `GET /api/hello` and displays the response
- Production: nginx serves static files and reverse proxies `/api` to the backend

### Step 6: Makefile / Makefile 작성

Copy the `Makefile` from an existing stack and adjust the test command for your language. All stacks must support these targets:

기존 스택에서 `Makefile`을 복사하고 테스트 명령을 해당 언어에 맞게 수정하세요. 모든 스택은 다음 타겟을 지원해야 합니다:

```makefile
make dev       # docker compose up --build
make build     # docker compose build
make up        # docker compose up -d
make down      # docker compose down
make logs      # docker compose logs -f
make test      # run tests (language-specific)
make clean     # docker compose down -v --rmi local
make validate  # bash ../../shared/scripts/validate.sh
```

### Step 7: Write README / README 작성

Write a bilingual (Korean/English) README following the format of existing stack READMEs. Include:

기존 스택 README 형식을 따라 한글/영문 이중 언어로 README를 작성하세요. 포함 내용:

- Prerequisites (runtime installation) / 사전 요구사항 (런타임 설치)
- Quick Start / 빠른 시작
- Local Development / 로컬 개발
- API Endpoints / API 엔드포인트
- Database Configuration / DB 설정
- Environment Variables / 환경 변수
- Project Structure / 프로젝트 구조

Add the monorepo reference at the top:

상단에 모노레포 참조를 추가하세요:

```markdown
**Part of the [Brewnet Boilerplate](../../README.md) monorepo** — see root README for full stack list, CLI usage, and clone instructions. / [Brewnet Boilerplate](../../README.md) 모노레포의 일부입니다 — 전체 스택 목록, CLI 사용법, 클론 방법은 루트 README를 참고하세요.
```

### Step 8: Validate / 검증

Before submitting, verify your stack passes all checks:

제출 전에 스택이 모든 검증을 통과하는지 확인하세요:

```bash
cd stacks/{lang}-{framework}

# 1. Build succeeds / 빌드 성공 확인
make build

# 2. Dev mode starts correctly / 개발 모드 정상 시작 확인
make dev

# 3. All 4 endpoints respond / 4개 엔드포인트 응답 확인
curl -s http://localhost:8080/ | jq .
curl -s http://localhost:8080/health | jq .
curl -s http://localhost:8080/api/hello | jq .
curl -s -X POST http://localhost:8080/api/echo \
  -H "Content-Type: application/json" \
  -d '{"test":"brewnet"}' | jq .

# 4. Frontend displays API response / 프론트엔드에서 API 응답 표시 확인
open http://localhost:3000

# 5. Validation script passes / 검증 스크립트 통과 확인
make validate

# 6. Clean up / 정리
make clean
```

### Step 9: Submit PR / PR 제출

1. Fork this repository / 이 저장소를 Fork하세요
2. Create a feature branch / 기능 브랜치를 생성하세요: `git checkout -b feat/add-{lang}-{framework}-stack`
3. Commit your changes / 변경 사항을 커밋하세요
4. Push to your fork / Fork에 푸시하세요: `git push origin feat/add-{lang}-{framework}-stack`
5. Open a Pull Request to the `develop` branch / `develop` 브랜치로 PR을 생성하세요

**PR Checklist / PR 체크리스트**:

- [ ] Directory follows `stacks/{lang}-{framework}/` naming convention / 디렉토리가 네이밍 규칙을 따름
- [ ] All 4 endpoints implemented and respond correctly / 4개 엔드포인트 구현 및 정상 응답
- [ ] Multi-DB support (PostgreSQL, MySQL, SQLite3) / 멀티 DB 지원
- [ ] `make dev` starts the full stack / `make dev`로 전체 스택 시작
- [ ] `make validate` passes / `make validate` 통과
- [ ] Multi-stage Dockerfile with non-root user / 멀티스테이지 Dockerfile + 비루트 사용자
- [ ] README.md written in bilingual format / README가 한글/영문 이중 언어로 작성됨
- [ ] No secrets or credentials committed / 시크릿이나 인증 정보가 커밋되지 않음

---

### Questions / 문의

If you have any questions about contributing, feel free to reach out:

기여 관련 문의 사항이 있으시면 편하게 연락해 주세요:

- Email: [brewnet.dev@gmail.com](mailto:brewnet.dev@gmail.com)
- Website: [https://www.brewnet.dev](https://www.brewnet.dev)

---

## License / 라이선스

[MIT](LICENSE)
