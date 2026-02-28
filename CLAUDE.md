# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language Rules

- All code, comments, and variable names in English.
- Result summaries and next step explanations in Korean.

## Project Overview

> **Brewnet** — Your server on tap. Just brew it.
> MIT License

Multi-language fullstack boilerplate monorepo for the Brewnet CLI `brewnet create-app` command. Each stack is a self-contained backend + frontend monorepo that runs with a single `docker compose up`.

## Repository Structure

```
brewnet-boilerplate/
├── stacks/                      ← Language-framework fullstack boilerplates
│   ├── python-fastapi/          ← Python (FastAPI + React)
│   ├── python-django/           ← Python (Django + React)
│   ├── python-flask/            ← Python (Flask + React)
│   ├── go-gin/                  ← Go (Gin + React)
│   ├── go-echo/                 ← Go (Echo + React)
│   ├── go-fiber/                ← Go (Fiber v3 + React)
│   ├── rust-actix-web/          ← Rust (Actix-web + React)
│   ├── rust-axum/               ← Rust (Axum + React)
│   ├── nodejs-express/          ← Node.js (Express + React)
│   ├── nodejs-nestjs/           ← Node.js (NestJS + React)
│   ├── nodejs-nextjs/           ← Node.js (Next.js unified)
│   ├── java-springboot/         ← Java (Spring Boot + React)
│   ├── java-spring/             ← Java (Spring Framework + React)
│   ├── kotlin-ktor/             ← Kotlin (Ktor + React)
│   ├── kotlin-springboot/       ← Kotlin (Spring Boot + React)
│   ├── frontend-vue/            ← Vue.js frontend template
│   └── frontend-svelte/         ← SvelteKit frontend template
├── shared/                      ← Common infra (traefik, healthcheck, scripts)
└── .github/workflows/           ← CI: validate all stacks
```

Each `stacks/{lang}-{framework}/` contains: `backend/`, `frontend/`, `docker-compose.yml`, `Makefile`, `.env.example`, `README.md`.

## Commands

```bash
# Run a specific stack
cd stacks/go-gin && make dev

# Build a specific stack
cd stacks/python-fastapi && make build

# Test a specific stack
cd stacks/nodejs-express && make test

# Validate (healthcheck + API verification)
cd stacks/rust-actix-web && make validate

# Clean up containers, volumes, images
cd stacks/java-springboot && make clean

# Validate all stacks
for stack in stacks/*/; do (cd "$stack" && make build); done
```

### Makefile Targets (uniform across all stacks)

`make dev` (docker compose up, hot reload) | `make build` | `make up` (production) | `make down` | `make logs` | `make test` | `make clean` | `make validate`

## Architecture

### Backend API Spec (all stacks must implement)

```
GET  /           → { "service": "{framework}-backend", "status": "running", "message": "🍺 Brewnet says hello!" }
GET  /health     → { "status": "ok", "timestamp": "...", "db_connected": true|false }
GET  /api/hello  → { "message": "Hello from {Framework}!", "lang": "{lang}", "version": "..." }
POST /api/echo   → (echo back request body)
```

### Port Conventions

| Service    | Container port | Host mapping        |
|------------|---------------|---------------------|
| Backend    | 8080          | `localhost:8080`    |
| Frontend   | 5173 (dev) / 80 (prod) | `localhost:3000` |
| PostgreSQL | 5432          | `localhost:5433`    |

### Frontend (swappable templates)

Default: React 19 + Vite 6 + TypeScript. Alternative templates: Vue.js 3 (`frontend-vue/`), SvelteKit (`frontend-svelte/`), API-only (no frontend). `App` component calls `GET /api/hello` and displays the response. Production: nginx serves static files + reverse proxies `/api` to backend. Exception: `nodejs-nextjs` uses unified frontend+backend on port 3000.

### Docker Rules

- Multi-stage builds (builder → runner) in all Dockerfiles
- Non-root user execution (`appuser` or language convention)
- `.dockerignore` required in each `backend/` and `frontend/`
- `HEALTHCHECK` directive in all services
- Network separation: `brewnet` (public) + `brewnet-internal` (DB access)
- Resource limits via `deploy.resources.limits`
- Docker labels: `com.brewnet.stack={lang}-{framework}`, `com.brewnet.role={backend|frontend}`

### docker-compose.yml Structure

Services: `backend`, `frontend` (optional), `postgres` (profile), `mysql` (profile). DB_DRIVER env selects active DB. Backend depends on DB healthy. Frontend depends on backend. Networks: `brewnet` + `brewnet-internal` (internal, DB only). Exception: `nodejs-nextjs` has no separate frontend service (unified on port 3000).

### Stack-Specific Tech

| Stack              | Backend                                          | Entry point                                              | Base image (builder → runner)                          |
|--------------------|--------------------------------------------------|----------------------------------------------------------|-------------------------------------------------------|
| python-fastapi     | Python 3.12+ / FastAPI / SQLAlchemy (async)      | `backend/src/main.py`                                    | `python:3.12-slim`                                    |
| python-django      | Python 3.13+ / Django 6 / Gunicorn              | `backend/src/config/wsgi.py`                             | `python:3.13-slim`                                    |
| python-flask       | Python 3.13+ / Flask 3.1 / Flask-SQLAlchemy      | `backend/wsgi.py`                                        | `python:3.13-slim`                                    |
| go-gin             | Go 1.22+ / Gin / GORM                           | `backend/cmd/server/main.go`                             | `golang:1.22-alpine` → `alpine`                       |
| go-echo            | Go 1.22+ / Echo v4 / GORM                       | `backend/cmd/server/main.go`                             | `golang:1.24-alpine` → `alpine`                       |
| go-fiber           | Go 1.25+ / Fiber v3 / GORM                      | `backend/cmd/server/main.go`                             | `golang:1.25-alpine` → `alpine`                       |
| rust-actix-web     | Rust 1.88+ / Actix-web 4 / SQLx                 | `backend/src/main.rs`                                    | `rust:1.88` → `debian:bookworm-slim`                  |
| rust-axum          | Rust 1.88+ / Axum 0.8 / SQLx                    | `backend/src/main.rs`                                    | `rust:1.88` → `debian:bookworm-slim`                  |
| nodejs-express     | Node 22 / Express 5 / Prisma                    | `backend/src/index.ts`                                   | `node:22-alpine`                                      |
| nodejs-nestjs      | Node 22 / NestJS 11 / Prisma                    | `backend/src/main.ts`                                    | `node:22-alpine`                                      |
| nodejs-nextjs      | Node 22 / Next.js 15 / Prisma (unified)          | `src/app/route.ts`                                       | `node:22-alpine`                                      |
| java-springboot    | Java 21 / Spring Boot 3.4 / JDBC                | `backend/src/.../Application.java`                       | `eclipse-temurin:21-jdk` → `21-jre-alpine`            |
| java-spring        | Java 21 / Spring Framework 6.2 / Maven          | `backend/src/.../Application.java`                       | `eclipse-temurin:21-jdk` → `21-jre-alpine`            |
| kotlin-ktor        | Kotlin 2.1 / Ktor 3.1 / Exposed ORM             | `backend/src/.../Application.kt`                         | `gradle:8.12-jdk21` → `21-jre-alpine`                |
| kotlin-springboot  | Kotlin 2.1 / Spring Boot 3.4 / JDBC             | `backend/src/.../Application.kt`                         | `gradle:8.12-jdk21` → `21-jre-alpine`                |

### Environment Variables (.env.example, common to all stacks)

`PROJECT_NAME`, `DOMAIN`, `DB_HOST=postgres`, `DB_PORT=5432`, `DB_NAME=brewnet`, `DB_USER=brewnet`, `DB_PASSWORD`, `BACKEND_PORT=8080`, `FRONTEND_PORT=3000`, `VITE_API_URL=http://localhost:8080`, `TZ=Asia/Seoul`

## Brewnet CLI Integration

```bash
brewnet create-app my-project --stack go-gin
# 1. git clone this repo (shallow)
# 2. Copy stacks/go-gin/ → ~/.brewnet/projects/my-project/
# 3. cp .env.example .env (+ auto-generate secrets)
# 4. docker compose up -d
# 5. Open http://localhost:3000
```

## Code Style

- Indentation: 2 spaces (YAML, JS, TS), 4 spaces (Python, Java, Kotlin, Go, Rust)
- Comments and variables: English
- README: English + Korean
- Logging: JSON structured logging recommended

## Adding a New Stack

1. Create `stacks/{lang}-{framework}/` with all required files
2. Implement the 4 backend endpoints (`/`, `/health`, `/api/hello`, `POST /api/echo`)
3. Frontend calls `/api/hello` and displays result
4. Verify `make dev` starts the full stack
5. Pass `make validate`

## CI

GitHub Actions (`validate-stacks.yml`) runs for each stack: `docker compose build` → `docker compose up -d` → verify `GET /health` 200 → verify `GET /api/hello` 200 → `docker compose down`.

---

## Prohibitions

### Database

- No `DROP TABLE`, `DROP DATABASE`, `TRUNCATE` without explicit user permission
- No `DELETE FROM` without `WHERE` clause
- No data deletion without backup
- No production database auto-modification

### Git

- `git push --force` — never
- `git reset --hard` — never
- `git commit --no-verify` — never
- `git commit` / `git push` — only on explicit user request

### Dependencies

- `npm audit fix --force` — never
- No library version changes without justification and user permission
- No introduction of frameworks/libraries outside the defined tech stack without user approval

### Protected Files

- `package.json` dependency changes require user permission
- `.env` / `.env.local` — never modify directly (user manages)
- `docs/` — no deletion without user confirmation


## SDD 워크플로우

### 1. 구현 전 명세 확인
```
API 구현 → API_SPEC.md 확인
컴포넌트 → COMPONENT_SPEC.md 확인
DB 작업 → DATA_MODEL.md 확인
타입 정의 → src/shared/types 확인
```

### 2. TDD 사이클
```
1. TEST_CASES.md에서 테스트 케이스 확인
2. 테스트 코드 작성 (Red) - 실패하는 테스트
3. 최소 구현 (Green) - 테스트 통과
4. 리팩토링 (Refactor) - 코드 개선
5. 명세 일치 확인
```

## 검증 체크리스트

### 커밋 전
- [ ] 문법 검사 에러 검출 없음 
- [ ] 빌드 성공 
- [ ] log 제거 확인
- [ ] 환경 설정 파일 미포함 확인

### PR 전
- [ ] 명세 문서와 일치 확인
- [ ] 테스트 커버리지 충분
- [ ] 에러 응답 형식 일치
- [ ] 애플리케이션 기본 호출 성공 

## Active Technologies
- Go 1.22-1.25, Rust 1.88+, Java 21, Kotlin 2.1, Node.js 22 (TypeScript), Python 3.12-3.13
- Gin, Echo v4, Fiber v3, Actix-web 4, Axum 0.8, Spring Boot 3.4, Spring Framework 6.2, Express 5, NestJS 11, Next.js 15, FastAPI, Django 6, Flask 3.1, Ktor 3.1
- GORM, SQLx, SQLAlchemy, Prisma, JPA/JDBC+HikariCP, Exposed ORM, Flask-SQLAlchemy
- PostgreSQL 16, MySQL 8.4, SQLite3 (via `DB_DRIVER` env)
- React 19, Vue.js 3, SvelteKit (frontend templates)

## Recent Changes
- 002-add-remaining-frameworks: Added 10 new backend stacks (Django, Flask, Echo, Fiber, Axum, NestJS, Next.js, Spring Framework, Ktor, Spring Boot Kotlin) + Vue/Svelte frontend templates
- 001-stack-implementation: Initial 5 stacks (Gin, Actix-web, Spring Boot, Express, FastAPI)
- Directory restructure: stacks/{lang}/ → stacks/{lang}-{framework}/ for multi-framework support
