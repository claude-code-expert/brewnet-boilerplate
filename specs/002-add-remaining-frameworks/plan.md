# Implementation Plan: 나머지 프레임워크 스택 추가

**Branch**: `002-add-remaining-frameworks` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-add-remaining-frameworks/spec.md`

## Summary

기존 5개 스택(python-fastapi, nodejs-express, go-gin, rust-actix-web, java-springboot) 패턴을 기반으로 10개 신규 백엔드 프레임워크 스택을 추가한다. 각 스택은 동일한 4개 API 엔드포인트, Multi-DB(PostgreSQL/MySQL/SQLite3) 지원, Docker multi-stage 빌드, 8개 Makefile 타겟을 구현한다. 추가로 Vue.js, SvelteKit, API-only 프론트엔드 옵션을 제공한다.

## Technical Context

**Languages/Versions**:
- Python 3.13+ (Django 6.0.x, Flask 3.1.x)
- Go 1.24+ (Echo v4), Go 1.25+ (Fiber v3)
- Rust 1.88+ (Axum 0.8.x)
- Node.js 22 (NestJS 11.x, Next.js 15.x)
- Java 21 (Spring Framework 7.0.x)
- Kotlin (JVM 21) (Ktor 3.4.x, Spring Boot 4.0.x)

**Primary Dependencies**:
- Python: Django ORM, Flask-SQLAlchemy 3.1, psycopg2-binary, pymysql, gunicorn
- Go: GORM (Echo/Fiber), Echo v4, Fiber v3
- Rust: Axum 0.8, SQLx (AnyPool), tower-http (CORS), tokio
- Node: Prisma (NestJS/Next.js), NestJS 11 (@nestjs/core), Next.js 15 (App Router)
- Java: Spring Framework 7.0, embedded Tomcat, JDBC + HikariCP, Maven
- Kotlin: Ktor 3.4 + Exposed ORM + Netty, Spring Boot 4.0 + Spring Data JPA + Gradle

**Storage**: PostgreSQL 16 / MySQL 8.4 / SQLite3 (via `DB_DRIVER` env)
**Testing**: N/A (boilerplate validation only — `make validate`)
**Target Platform**: Docker (linux/amd64), macOS/Linux dev environment
**Project Type**: Multi-language boilerplate monorepo (web-service templates)
**Performance Goals**: N/A (boilerplate — startup + healthcheck within 30s)
**Constraints**: Backend code ≤200 lines (excluding tests), zero unnecessary dependencies
**Scale/Scope**: 10 new backend stacks + 3 frontend options = 13 new stack directories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Zero Bloat | ✅ PASS | Each stack uses framework's native ORM/DB driver only. No DI frameworks (NestJS DI is framework-native exception). ≤200 lines target |
| II. Idiomatic Language Structure | ⚠️ UPDATE NEEDED | Constitution currently lists 5 stacks only. Must add 10 new stacks' structure rules |
| III. Config-Driven Database | ✅ PASS | All stacks use `DB_DRIVER` env var + docker-compose profiles pattern |
| IV. Uniform API Contract | ✅ PASS | All stacks implement same 4 endpoints. `service` = `{framework}-backend`, `message` = `Hello from {Framework}!` |
| V. Docker Security Baseline | ✅ PASS | Multi-stage builds, non-root user, HEALTHCHECK, network isolation for all |
| VI. Anti-Pattern Enforcement | ✅ PASS | No extra patterns. NestJS DI is framework-native (exception documented in research.md) |

**Post-Design Re-check**: Constitution Principle II must be updated to include structure rules for Django, Flask, Echo, Fiber, Axum, NestJS, Next.js, Spring Framework, Ktor, Spring Boot (Kotlin). This is a documentation update, not a blocker.

## Project Structure

### Documentation (this feature)

```text
specs/002-add-remaining-frameworks/
├── plan.md              # This file
├── research.md          # Phase 0 output (completed)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api-contract.md  # Uniform API contract for all stacks
├── checklists/
│   └── requirements.md  # Quality checklist (completed, 16/16 PASS)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
stacks/
├── python-django/           # NEW — US1
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/      # settings.py, urls.py, wsgi.py
│   │   │   └── api/         # views.py, urls.py
│   │   ├── manage.py
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   ├── frontend/            # React (copied from existing)
│   ├── docker-compose.yml
│   ├── Makefile
│   ├── .env.example
│   └── README.md
│
├── python-flask/            # NEW — US1
│   ├── backend/
│   │   ├── src/
│   │   │   ├── __init__.py  # App factory (create_app)
│   │   │   ├── routes.py
│   │   │   ├── database.py
│   │   │   └── config.py
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   ├── frontend/
│   ├── docker-compose.yml
│   ├── Makefile
│   ├── .env.example
│   └── README.md
│
├── go-echo/                 # NEW — US2
│   ├── backend/
│   │   ├── cmd/server/main.go
│   │   ├── internal/
│   │   │   ├── handler/     # root.go, health.go, hello.go, echo.go
│   │   │   └── database/    # database.go (GORM)
│   │   ├── go.mod
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   ├── frontend/
│   ├── docker-compose.yml
│   ├── Makefile
│   ├── .env.example
│   └── README.md
│
├── go-fiber/                # NEW — US2
│   ├── backend/             # Same layout as go-echo
│   │   ├── cmd/server/main.go
│   │   ├── internal/handler/ + database/
│   │   ├── go.mod
│   │   ├── Dockerfile       # golang:1.25-alpine (Go 1.25+ required)
│   │   └── .dockerignore
│   ├── frontend/
│   ├── docker-compose.yml
│   ├── Makefile
│   ├── .env.example
│   └── README.md
│
├── rust-axum/               # NEW — US3
│   ├── backend/
│   │   ├── src/
│   │   │   ├── main.rs
│   │   │   ├── handler.rs
│   │   │   └── database.rs  # SQLx AnyPool (reuse from rust-actix-web)
│   │   ├── Cargo.toml
│   │   ├── Dockerfile       # rust:1.88 → debian:bookworm-slim
│   │   └── .dockerignore
│   ├── frontend/
│   ├── docker-compose.yml
│   ├── Makefile
│   ├── .env.example
│   └── README.md
│
├── nodejs-nestjs/           # NEW — US4
│   ├── backend/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── app.controller.ts
│   │   │   ├── app.service.ts
│   │   │   └── prisma/
│   │   │       └── prisma.service.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── nest-cli.json
│   │   ├── Dockerfile       # 3-stage: deps → build → run
│   │   └── .dockerignore
│   ├── frontend/
│   ├── docker-compose.yml
│   ├── Makefile
│   ├── .env.example
│   └── README.md
│
├── nodejs-nextjs/           # NEW — US4 (UNIFIED: no separate frontend)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Landing page (calls /api/hello)
│   │   │   ├── layout.tsx
│   │   │   ├── api/
│   │   │   │   ├── hello/route.ts    # GET /api/hello
│   │   │   │   └── echo/route.ts     # POST /api/echo
│   │   │   └── health/route.ts       # GET /health
│   │   └── lib/
│   │       └── db.ts                 # Prisma client
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   ├── next.config.ts                # output: 'standalone'
│   ├── tsconfig.json
│   ├── Dockerfile                    # node:22-alpine, standalone output
│   ├── .dockerignore
│   ├── docker-compose.yml            # backend service only (no frontend)
│   ├── Makefile
│   ├── .env.example
│   └── README.md
│
├── java-spring/             # NEW — US5
│   ├── backend/
│   │   ├── src/main/java/dev/brewnet/app/
│   │   │   ├── Application.java      # Embedded Tomcat setup
│   │   │   ├── controller/
│   │   │   │   └── ApiController.java
│   │   │   └── config/
│   │   │       ├── WebConfig.java
│   │   │       └── DataSourceConfig.java
│   │   ├── pom.xml                   # Maven + shade plugin
│   │   ├── Dockerfile                # temurin:21-jdk → 21-jre-alpine
│   │   └── .dockerignore
│   ├── frontend/
│   ├── docker-compose.yml
│   ├── Makefile
│   ├── .env.example
│   └── README.md
│
├── kotlin-ktor/             # NEW — US6
│   ├── backend/
│   │   ├── src/main/kotlin/dev/brewnet/app/
│   │   │   ├── Application.kt        # Ktor + Netty
│   │   │   └── plugins/
│   │   │       ├── Routing.kt
│   │   │       ├── Database.kt       # Exposed ORM
│   │   │       └── Serialization.kt
│   │   ├── build.gradle.kts          # Ktor plugin for fat JAR
│   │   ├── settings.gradle.kts
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   ├── frontend/
│   ├── docker-compose.yml
│   ├── Makefile
│   ├── .env.example
│   └── README.md
│
├── kotlin-springboot/       # NEW — US6
│   ├── backend/
│   │   ├── src/main/kotlin/dev/brewnet/app/
│   │   │   ├── Application.kt
│   │   │   ├── controller/
│   │   │   │   └── ApiController.kt
│   │   │   └── config/
│   │   │       └── DataSourceConfig.kt
│   │   ├── src/main/resources/
│   │   │   └── application.yml
│   │   ├── build.gradle.kts          # kotlin("plugin.spring"), kotlin("plugin.jpa")
│   │   ├── settings.gradle.kts
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   ├── frontend/
│   ├── docker-compose.yml
│   ├── Makefile
│   ├── .env.example
│   └── README.md
│
├── frontend-vue/            # NEW — US7 (template only)
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.ts
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vite.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .dockerignore
│
├── frontend-svelte/         # NEW — US7 (template only)
│   ├── src/
│   │   ├── routes/
│   │   │   └── +page.svelte
│   │   └── app.html
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── svelte.config.js
│   ├── vite.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .dockerignore
│
└── [existing 5 stacks unchanged]
```

**Structure Decision**: Each new backend stack follows the same `stacks/{lang}-{framework}/` flat structure with `backend/`, `frontend/`, `docker-compose.yml`, `Makefile`, `.env.example`, `README.md`. Exceptions:
- **nodejs-nextjs**: No separate `backend/` + `frontend/` — unified Next.js app at root level. docker-compose.yml has single `backend` service.
- **frontend-vue/svelte**: Standalone template directories. Brewnet CLI copies the chosen frontend template into each stack's `frontend/` directory.

## Framework-Specific Implementation Details

### Python — Django (US1)

| Item | Decision |
|------|----------|
| ORM | Django ORM (built-in) |
| API | `JsonResponse` (no DRF) |
| Server | gunicorn + config/wsgi.py |
| DB Drivers | psycopg2-binary, mysqlclient, built-in sqlite3 |
| Docker | `python:3.13-slim` → `python:3.13-slim` (venv copy) |
| Structure | `src/config/` (settings, urls, wsgi) + `src/api/` (views, urls) |

### Python — Flask (US1)

| Item | Decision |
|------|----------|
| ORM | Flask-SQLAlchemy 3.1 (sync) |
| API | Flask native |
| Server | gunicorn + app factory |
| DB Drivers | psycopg2-binary, pymysql, built-in sqlite3 |
| Docker | `python:3.13-slim` |
| Structure | `src/__init__.py` (factory), `src/routes.py`, `src/database.py`, `src/config.py` |

### Go — Echo (US2)

| Item | Decision |
|------|----------|
| ORM | GORM (reuse from go-gin) |
| Router | Echo v4 |
| Docker | `golang:1.24-alpine` → `alpine:3.21` |
| Structure | Same as go-gin (`cmd/server/`, `internal/handler/`, `internal/database/`) |

### Go — Fiber (US2)

| Item | Decision |
|------|----------|
| ORM | GORM (reuse from go-gin) |
| Router | Fiber v3 (fasthttp-based) |
| Docker | `golang:1.25-alpine` → `alpine:3.21` (Go 1.25+ required) |
| Caution | `*fiber.Ctx` is pooled — no goroutine cross-reference |
| Structure | Same as go-gin |

### Rust — Axum (US3)

| Item | Decision |
|------|----------|
| DB | SQLx AnyPool (reuse from rust-actix-web) |
| Router | Axum 0.8 + tower-http (CORS) |
| Docker | `rust:1.88` → `debian:bookworm-slim` |
| Structure | `src/main.rs`, `src/handler.rs`, `src/database.rs` |

### Node.js — NestJS (US4)

| Item | Decision |
|------|----------|
| ORM | Prisma (reuse from nodejs-express) |
| Pattern | Module/Controller/Service (framework-native DI) |
| Multi-DB | Prisma + `sed` schema swap (same as nodejs-express) |
| Docker | `node:22-alpine` (3-stage: deps → build → run) |
| Structure | `src/main.ts`, `src/app.module.ts`, `src/app.controller.ts`, `src/app.service.ts`, `src/prisma/prisma.service.ts` |

### Node.js — Next.js (US4)

| Item | Decision |
|------|----------|
| ORM | Prisma |
| API | App Router Route Handlers |
| Mode | Unified frontend+backend (single container) |
| Docker | `node:22-alpine`, `output: 'standalone'` |
| Compose | Single `backend` service only (port 3000 directly) |
| Structure | `src/app/page.tsx`, `src/app/api/hello/route.ts`, `src/app/api/echo/route.ts`, `src/app/health/route.ts`, `src/lib/db.ts` |

### Java — Spring Framework (US5)

| Item | Decision |
|------|----------|
| DI | Manual (no Spring Boot auto-config) |
| Server | Embedded Tomcat (programmatic) |
| DB | JDBC + HikariCP |
| Build | Maven + shade plugin (uber-JAR) |
| Docker | `eclipse-temurin:21-jdk` (builder, Debian) → `eclipse-temurin:21-jre-alpine` |
| Caution | 200-line limit is challenging — minimal config required |

### Kotlin — Ktor (US6)

| Item | Decision |
|------|----------|
| ORM | Exposed ORM (Kotlin-native DSL) |
| Engine | Netty |
| Serialization | kotlinx.serialization |
| DB Drivers | postgresql, mysql-connector-j, sqlite-jdbc |
| Build | Gradle + Ktor plugin (fat JAR) |
| Docker | `eclipse-temurin:21-jdk` → `eclipse-temurin:21-jre-alpine` |

### Kotlin — Spring Boot (US6)

| Item | Decision |
|------|----------|
| Pattern | Spring Boot 4.0 + Kotlin DSL |
| ORM | Spring Data JPA |
| Plugins | `kotlin("plugin.spring")`, `kotlin("plugin.jpa")` |
| Build | Gradle |
| Docker | Same as java-springboot |

### Frontend Templates (US7)

| Template | Framework | Build | Router |
|----------|-----------|-------|--------|
| frontend-vue | Vue 3 + Vite + TypeScript | `npm run build` | N/A (SPA) |
| frontend-svelte | SvelteKit 2 + Vite + TypeScript | `npm run build` | N/A (SPA adapter-static) |
| API-only (none) | N/A | N/A | N/A — frontend service removed from docker-compose |

## Pattern Reuse Mapping

| New Stack | Base Stack | Reuse Scope |
|-----------|------------|-------------|
| python-django | python-fastapi | Dockerfile pattern, docker-compose.yml, Makefile, .env.example, frontend/ |
| python-flask | python-fastapi | Same |
| go-echo | go-gin | GORM DB code, Dockerfile, docker-compose.yml, Makefile, frontend/ |
| go-fiber | go-gin | GORM DB code, Dockerfile pattern (Go 1.25+ image) |
| rust-axum | rust-actix-web | SQLx AnyPool, Dockerfile, docker-compose.yml, Makefile, frontend/ |
| nodejs-nestjs | nodejs-express | Prisma, Dockerfile pattern, docker-compose.yml, Makefile, frontend/ |
| nodejs-nextjs | nodejs-express | Prisma only (structure completely different — unified service) |
| java-spring | java-springboot | JDBC/HikariCP, Dockerfile pattern (Maven instead of Gradle) |
| kotlin-ktor | java-springboot | Docker image pattern, docker-compose.yml, Makefile |
| kotlin-springboot | java-springboot | Nearly identical (Kotlin DSL wrapper) |

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| NestJS uses DI framework | NestJS DI is the framework's core architecture (Module/Controller/Service) | Without DI, NestJS loses its defining feature. Constitution VI allows framework-native patterns |
| Next.js unified structure | Next.js is inherently fullstack — separate backend/frontend creates unnecessary complexity | Splitting would require running two servers for a single framework, violating Zero Bloat |
| Spring Framework manual config | Non-Boot Spring requires manual Tomcat embed + DataSource config | Spring Boot would be a duplicate of java-springboot. Manual config is the point of this stack |
