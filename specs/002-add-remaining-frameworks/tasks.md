# Tasks: 나머지 프레임워크 스택 추가

**Input**: Design documents from `/specs/002-add-remaining-frameworks/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not requested — validation via `make validate` per stack.

**Organization**: Tasks grouped by user story (US1-US7). Each story is independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files/directories, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US7)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing patterns and prepare shared assets for reuse

- [x] T001 Verify existing 5 stacks are stable by running `make validate` in stacks/go-gin
- [x] T002 Create shared validation reference by documenting the exact file list each new stack needs in a scratch checklist

**Checkpoint**: Existing stacks confirmed working, reusable patterns identified

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Prepare reusable templates that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create reusable Makefile template by extracting stacks/go-gin/Makefile pattern (only `test` target differs per language)
- [x] T004 Create reusable docker-compose.yml template by extracting stacks/go-gin/docker-compose.yml pattern (labels/build context differ per stack)
- [x] T005 [P] Create reusable .env.example template by extracting stacks/go-gin/.env.example pattern (only STACK_LANG differs)

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Python Django/Flask (Priority: P1) 🎯 MVP

**Goal**: Add `stacks/python-django/` and `stacks/python-flask/` with full Multi-DB support

**Independent Test**: `cd stacks/python-django && cp .env.example .env && make dev` → 4 endpoints respond correctly, `db_connected: true`

**Ref**: [spec.md US1], [plan.md §Python-Django], [plan.md §Python-Flask], [research.md §2.1-2.2], [contracts/api-contract.md]

### python-django

- [x] T006 [P] [US1] Create directory structure `stacks/python-django/backend/src/config/` and `stacks/python-django/backend/src/api/`
- [x] T007 [US1] Implement Django settings with Multi-DB support (postgres/mysql/sqlite3 via DB_DRIVER) in `stacks/python-django/backend/src/config/settings.py`
- [x] T008 [US1] Implement URL configuration in `stacks/python-django/backend/src/config/urls.py` routing to api app
- [x] T009 [US1] Implement WSGI application in `stacks/python-django/backend/src/config/wsgi.py`
- [x] T010 [US1] Implement 4 API endpoints using JsonResponse in `stacks/python-django/backend/src/api/views.py`: GET / (django-backend), GET /health (db_connected), GET /api/hello (Hello from Django!), POST /api/echo
- [x] T011 [US1] Create API URL routing in `stacks/python-django/backend/src/api/urls.py`
- [x] T012 [US1] Create `stacks/python-django/backend/manage.py` for Django management
- [x] T013 [US1] Create `stacks/python-django/backend/requirements.txt` with Django 6.0, gunicorn, psycopg2-binary, mysqlclient
- [x] T014 [US1] Create multi-stage Dockerfile in `stacks/python-django/backend/Dockerfile` (python:3.13-slim, gunicorn entrypoint, non-root appuser, HEALTHCHECK)
- [x] T015 [P] [US1] Create `stacks/python-django/backend/.dockerignore`
- [x] T016 [US1] Create `stacks/python-django/docker-compose.yml` with backend+frontend+postgres+mysql profiles, labels com.brewnet.stack=python-django
- [x] T017 [P] [US1] Create `stacks/python-django/Makefile` with 8 targets (test target: `$(COMPOSE) run --rm backend python manage.py test`)
- [x] T018 [P] [US1] Create `stacks/python-django/.env.example` with STACK_LANG=python-django
- [x] T019 [US1] Copy `stacks/python-fastapi/frontend/` to `stacks/python-django/frontend/`
- [x] T020 [US1] Create `stacks/python-django/README.md` (English+Korean, Quick Start, API examples, DB switching, project structure)

### python-flask

- [x] T021 [P] [US1] Create directory structure `stacks/python-flask/backend/src/`
- [x] T022 [US1] Implement Flask app factory with Multi-DB support in `stacks/python-flask/backend/src/__init__.py` using Flask-SQLAlchemy (psycopg2-binary/pymysql/sqlite3 via DB_DRIVER)
- [x] T023 [US1] Implement config with DB_DRIVER switching in `stacks/python-flask/backend/src/config.py`
- [x] T024 [US1] Implement database initialization and health check in `stacks/python-flask/backend/src/database.py`
- [x] T025 [US1] Implement 4 API endpoints in `stacks/python-flask/backend/src/routes.py`: GET / (flask-backend), GET /health (db_connected), GET /api/hello (Hello from Flask!), POST /api/echo
- [x] T026 [US1] Create `stacks/python-flask/backend/requirements.txt` with Flask 3.1, Flask-SQLAlchemy, gunicorn, psycopg2-binary, pymysql
- [x] T027 [US1] Create multi-stage Dockerfile in `stacks/python-flask/backend/Dockerfile` (python:3.13-slim, gunicorn entrypoint, non-root appuser, HEALTHCHECK)
- [x] T028 [P] [US1] Create `stacks/python-flask/backend/.dockerignore`
- [x] T029 [US1] Create `stacks/python-flask/docker-compose.yml` with labels com.brewnet.stack=python-flask
- [x] T030 [P] [US1] Create `stacks/python-flask/Makefile` with 8 targets
- [x] T031 [P] [US1] Create `stacks/python-flask/.env.example` with STACK_LANG=python-flask
- [x] T032 [US1] Copy `stacks/python-fastapi/frontend/` to `stacks/python-flask/frontend/`
- [x] T033 [US1] Create `stacks/python-flask/README.md`

### US1 Validation

- [x] T034 [US1] Validate python-django: `cd stacks/python-django && cp .env.example .env && make build && make up` then verify GET / → django-backend, GET /api/hello → Hello from Django!, GET /health → db_connected:true, POST /api/echo
- [x] T035 [US1] Validate python-flask: same verification with flask-backend, Hello from Flask!

**Checkpoint**: US1 complete — both Python stacks fully functional with Multi-DB

---

## Phase 4: User Story 2 — Go Echo/Fiber (Priority: P2)

**Goal**: Add `stacks/go-echo/` and `stacks/go-fiber/` reusing GORM from go-gin

**Independent Test**: `cd stacks/go-echo && cp .env.example .env && make dev` → 4 endpoints + Multi-DB

**Ref**: [spec.md US2], [plan.md §Go-Echo/Fiber], [research.md §2.3-2.4]

### go-echo

- [x] T036 [P] [US2] Create directory structure `stacks/go-echo/backend/cmd/server/` and `stacks/go-echo/backend/internal/handler/` and `stacks/go-echo/backend/internal/database/`
- [x] T037 [US2] Implement Multi-DB connection using GORM (reuse go-gin pattern) in `stacks/go-echo/backend/internal/database/database.go`
- [x] T038 [US2] Implement 4 handler files in `stacks/go-echo/backend/internal/handler/`: root.go (echo-backend), health.go (db_connected), hello.go (Hello from Echo!), echo.go
- [x] T039 [US2] Implement main server with Echo v4 router and CORS in `stacks/go-echo/backend/cmd/server/main.go`
- [x] T040 [US2] Create `stacks/go-echo/backend/go.mod` with echo v4, gorm, and DB driver dependencies
- [x] T041 [US2] Create multi-stage Dockerfile in `stacks/go-echo/backend/Dockerfile` (golang:1.24-alpine → alpine:3.21, CGO_ENABLED=1 for SQLite)
- [x] T042 [P] [US2] Create `stacks/go-echo/backend/.dockerignore`
- [x] T043 [US2] Create `stacks/go-echo/docker-compose.yml` with labels com.brewnet.stack=go-echo
- [x] T044 [P] [US2] Create `stacks/go-echo/Makefile` with 8 targets (test: `go test ./...`)
- [x] T045 [P] [US2] Create `stacks/go-echo/.env.example` with STACK_LANG=go-echo
- [x] T046 [US2] Copy `stacks/go-gin/frontend/` to `stacks/go-echo/frontend/`
- [x] T047 [US2] Create `stacks/go-echo/README.md`

### go-fiber

- [x] T048 [P] [US2] Create directory structure `stacks/go-fiber/backend/cmd/server/` and `stacks/go-fiber/backend/internal/handler/` and `stacks/go-fiber/backend/internal/database/`
- [x] T049 [US2] Implement Multi-DB connection using GORM in `stacks/go-fiber/backend/internal/database/database.go` (reuse from go-echo/go-gin)
- [x] T050 [US2] Implement 4 handler files using Fiber v3 ctx in `stacks/go-fiber/backend/internal/handler/`: root.go (fiber-backend), health.go (db_connected), hello.go (Hello from Fiber!), echo.go — note fiber.Ctx is pooled, no goroutine sharing
- [x] T051 [US2] Implement main server with Fiber v3 router and CORS in `stacks/go-fiber/backend/cmd/server/main.go`
- [x] T052 [US2] Create `stacks/go-fiber/backend/go.mod` with fiber v3, gorm, and DB driver dependencies
- [x] T053 [US2] Create multi-stage Dockerfile in `stacks/go-fiber/backend/Dockerfile` (golang:1.25-alpine → alpine:3.21, Go 1.25+ required for Fiber v3)
- [x] T054 [P] [US2] Create `stacks/go-fiber/backend/.dockerignore`
- [x] T055 [US2] Create `stacks/go-fiber/docker-compose.yml` with labels com.brewnet.stack=go-fiber
- [x] T056 [P] [US2] Create `stacks/go-fiber/Makefile` with 8 targets
- [x] T057 [P] [US2] Create `stacks/go-fiber/.env.example` with STACK_LANG=go-fiber
- [x] T058 [US2] Copy `stacks/go-gin/frontend/` to `stacks/go-fiber/frontend/`
- [x] T059 [US2] Create `stacks/go-fiber/README.md`

### US2 Validation

- [x] T060 [US2] Validate go-echo: build + up + verify 4 endpoints (echo-backend, Hello from Echo!)
- [x] T061 [US2] Validate go-fiber: build + up + verify 4 endpoints (fiber-backend, Hello from Fiber!)

**Checkpoint**: US2 complete — both Go stacks fully functional

---

## Phase 5: User Story 3 — Rust Axum (Priority: P3)

**Goal**: Add `stacks/rust-axum/` reusing SQLx AnyPool from rust-actix-web

**Independent Test**: `cd stacks/rust-axum && cp .env.example .env && make dev` → 4 endpoints

**Ref**: [spec.md US3], [plan.md §Rust-Axum], [research.md §2.5]

- [x] T062 [P] [US3] Create directory structure `stacks/rust-axum/backend/src/`
- [x] T063 [US3] Implement Multi-DB connection using SQLx AnyPool in `stacks/rust-axum/backend/src/database.rs` (reuse pattern from rust-actix-web)
- [x] T064 [US3] Implement 4 route handlers using Axum extractors in `stacks/rust-axum/backend/src/handler.rs`: GET / (axum-backend), GET /health (db_connected), GET /api/hello (Hello from Axum!), POST /api/echo
- [x] T065 [US3] Implement main server with Axum router, tower-http CORS, and shared state in `stacks/rust-axum/backend/src/main.rs`
- [x] T066 [US3] Create `stacks/rust-axum/backend/Cargo.toml` with axum 0.8, sqlx (any pool), tower-http, tokio, serde dependencies
- [x] T067 [US3] Create multi-stage Dockerfile in `stacks/rust-axum/backend/Dockerfile` (rust:1.88 → debian:bookworm-slim, non-root appuser)
- [x] T068 [P] [US3] Create `stacks/rust-axum/backend/.dockerignore`
- [x] T069 [US3] Create `stacks/rust-axum/docker-compose.yml` with labels com.brewnet.stack=rust-axum
- [x] T070 [P] [US3] Create `stacks/rust-axum/Makefile` with 8 targets (test: `cargo test`)
- [x] T071 [P] [US3] Create `stacks/rust-axum/.env.example` with STACK_LANG=rust-axum
- [x] T072 [US3] Copy `stacks/rust-actix-web/frontend/` to `stacks/rust-axum/frontend/`
- [x] T073 [US3] Create `stacks/rust-axum/README.md`

### US3 Validation

- [x] T074 [US3] Validate rust-axum: build + up + verify 4 endpoints (axum-backend, Hello from Axum!, db_connected, echo)

**Checkpoint**: US3 complete — Rust Axum stack fully functional

---

## Phase 6: User Story 4 — Node.js NestJS/Next.js (Priority: P4)

**Goal**: Add `stacks/nodejs-nestjs/` (standard) and `stacks/nodejs-nextjs/` (unified frontend+backend)

**Independent Test**: `cd stacks/nodejs-nestjs && cp .env.example .env && make dev` → 4 endpoints

**Ref**: [spec.md US4], [plan.md §NestJS/Next.js], [research.md §2.6-2.7]

### nodejs-nestjs

- [x] T075 [P] [US4] Create directory structure `stacks/nodejs-nestjs/backend/src/` and `stacks/nodejs-nestjs/backend/src/prisma/` and `stacks/nodejs-nestjs/backend/prisma/`
- [x] T076 [US4] Create Prisma schema with Multi-DB support in `stacks/nodejs-nestjs/backend/prisma/schema.prisma` (reuse nodejs-express pattern)
- [x] T077 [US4] Implement PrismaService with onModuleInit in `stacks/nodejs-nestjs/backend/src/prisma/prisma.service.ts`
- [x] T078 [US4] Implement AppService with hello/health/echo logic in `stacks/nodejs-nestjs/backend/src/app.service.ts`
- [x] T079 [US4] Implement AppController with 4 endpoint decorators in `stacks/nodejs-nestjs/backend/src/app.controller.ts`: GET / (nestjs-backend), GET /health, GET /api/hello (Hello from NestJS!), POST /api/echo
- [x] T080 [US4] Implement AppModule importing PrismaService in `stacks/nodejs-nestjs/backend/src/app.module.ts`
- [x] T081 [US4] Implement NestJS bootstrap with CORS in `stacks/nodejs-nestjs/backend/src/main.ts`
- [x] T082 [US4] Create `stacks/nodejs-nestjs/backend/package.json` with @nestjs/core, @nestjs/platform-express, @prisma/client, prisma
- [x] T083 [P] [US4] Create `stacks/nodejs-nestjs/backend/tsconfig.json` with NestJS compiler options
- [x] T084 [P] [US4] Create `stacks/nodejs-nestjs/backend/nest-cli.json`
- [x] T085 [US4] Create 3-stage Dockerfile in `stacks/nodejs-nestjs/backend/Dockerfile` (node:22-alpine, deps → build → run, non-root, HEALTHCHECK)
- [x] T086 [P] [US4] Create `stacks/nodejs-nestjs/backend/.dockerignore`
- [x] T087 [US4] Create `stacks/nodejs-nestjs/docker-compose.yml` with labels com.brewnet.stack=nodejs-nestjs
- [x] T088 [P] [US4] Create `stacks/nodejs-nestjs/Makefile` with 8 targets
- [x] T089 [P] [US4] Create `stacks/nodejs-nestjs/.env.example` with STACK_LANG=nodejs-nestjs
- [x] T090 [US4] Copy `stacks/nodejs-express/frontend/` to `stacks/nodejs-nestjs/frontend/`
- [x] T091 [US4] Create `stacks/nodejs-nestjs/README.md`

### nodejs-nextjs (UNIFIED — no separate frontend)

- [x] T092 [P] [US4] Create directory structure `stacks/nodejs-nextjs/src/app/api/hello/`, `stacks/nodejs-nextjs/src/app/api/echo/`, `stacks/nodejs-nextjs/src/app/health/`, `stacks/nodejs-nextjs/src/lib/`, `stacks/nodejs-nextjs/prisma/`
- [x] T093 [US4] Create Prisma schema with Multi-DB support in `stacks/nodejs-nextjs/prisma/schema.prisma`
- [x] T094 [US4] Implement Prisma client singleton in `stacks/nodejs-nextjs/src/lib/db.ts`
- [x] T095 [US4] Implement GET / route returning root response in `stacks/nodejs-nextjs/src/app/route.ts` (nextjs-backend)
- [x] T096 [US4] Implement GET /api/hello route handler in `stacks/nodejs-nextjs/src/app/api/hello/route.ts` (Hello from Next.js!)
- [x] T097 [US4] Implement POST /api/echo route handler in `stacks/nodejs-nextjs/src/app/api/echo/route.ts`
- [x] T098 [US4] Implement GET /health route handler with db_connected in `stacks/nodejs-nextjs/src/app/health/route.ts`
- [x] T099 [US4] Implement landing page calling /api/hello in `stacks/nodejs-nextjs/src/app/page.tsx`
- [x] T100 [US4] Create root layout in `stacks/nodejs-nextjs/src/app/layout.tsx`
- [x] T101 [US4] Create `stacks/nodejs-nextjs/package.json` with next 15, react 19, @prisma/client, prisma
- [x] T102 [US4] Create `stacks/nodejs-nextjs/next.config.ts` with output: 'standalone'
- [x] T103 [P] [US4] Create `stacks/nodejs-nextjs/tsconfig.json` with Next.js compiler options
- [x] T104 [US4] Create Dockerfile in `stacks/nodejs-nextjs/Dockerfile` (node:22-alpine, standalone output, non-root, HEALTHCHECK on port 3000)
- [x] T105 [P] [US4] Create `stacks/nodejs-nextjs/.dockerignore`
- [x] T106 [US4] Create `stacks/nodejs-nextjs/docker-compose.yml` with single backend service (no frontend), port 3000, labels com.brewnet.stack=nodejs-nextjs
- [x] T107 [P] [US4] Create `stacks/nodejs-nextjs/Makefile` with 8 targets (validate against port 3000)
- [x] T108 [P] [US4] Create `stacks/nodejs-nextjs/.env.example` with STACK_LANG=nodejs-nextjs, BACKEND_PORT=3000
- [x] T109 [US4] Create `stacks/nodejs-nextjs/README.md` noting unified frontend+backend architecture

### US4 Validation

- [x] T110 [US4] Validate nodejs-nestjs: build + up + verify 4 endpoints (nestjs-backend, Hello from NestJS!)
- [x] T111 [US4] Validate nodejs-nextjs: build + up + verify 4 endpoints on port 3000 (nextjs-backend, Hello from Next.js!), verify browser shows landing page

**Checkpoint**: US4 complete — both Node.js stacks functional (NestJS standard, Next.js unified)

---

## Phase 7: User Story 5 — Java Spring Framework (Priority: P5)

**Goal**: Add `stacks/java-spring/` with manual DI, embedded Tomcat, JDBC+HikariCP

**Independent Test**: `cd stacks/java-spring && cp .env.example .env && make dev` → 4 endpoints

**Ref**: [spec.md US5], [plan.md §Java-Spring], [research.md §2.8]

- [x] T112 [P] [US5] Create directory structure `stacks/java-spring/backend/src/main/java/dev/brewnet/app/controller/` and `stacks/java-spring/backend/src/main/java/dev/brewnet/app/config/`
- [x] T113 [US5] Implement DataSourceConfig with Multi-DB support (JDBC+HikariCP, postgres/mysql/sqlite3 via DB_DRIVER) in `stacks/java-spring/backend/src/main/java/dev/brewnet/app/config/DataSourceConfig.java`
- [x] T114 [US5] Implement WebConfig with DispatcherServlet and CORS in `stacks/java-spring/backend/src/main/java/dev/brewnet/app/config/WebConfig.java`
- [x] T115 [US5] Implement ApiController with 4 endpoints using @RequestMapping in `stacks/java-spring/backend/src/main/java/dev/brewnet/app/controller/ApiController.java`: GET / (spring-backend), GET /health (db_connected), GET /api/hello (Hello from Spring Framework!), POST /api/echo
- [x] T116 [US5] Implement Application.java with embedded Tomcat programmatic setup in `stacks/java-spring/backend/src/main/java/dev/brewnet/app/Application.java`
- [x] T117 [US5] Create `stacks/java-spring/backend/pom.xml` with Spring Framework 7.0, embedded Tomcat, HikariCP, JDBC drivers, shade plugin for uber-JAR
- [x] T118 [US5] Create multi-stage Dockerfile in `stacks/java-spring/backend/Dockerfile` (eclipse-temurin:21-jdk as builder with Debian, eclipse-temurin:21-jre-alpine as runner, non-root, HEALTHCHECK)
- [x] T119 [P] [US5] Create `stacks/java-spring/backend/.dockerignore`
- [x] T120 [US5] Create `stacks/java-spring/docker-compose.yml` with labels com.brewnet.stack=java-spring
- [x] T121 [P] [US5] Create `stacks/java-spring/Makefile` with 8 targets (test: `mvn test`)
- [x] T122 [P] [US5] Create `stacks/java-spring/.env.example` with STACK_LANG=java-spring
- [x] T123 [US5] Copy `stacks/java-springboot/frontend/` to `stacks/java-spring/frontend/`
- [x] T124 [US5] Create `stacks/java-spring/README.md`

### US5 Validation

- [x] T125 [US5] Validate java-spring: build + up + verify 4 endpoints (spring-backend, Hello from Spring Framework!, db_connected)

**Checkpoint**: US5 complete — Java Spring Framework stack functional

---

## Phase 8: User Story 6 — Kotlin Ktor/Spring Boot (Priority: P6)

**Goal**: Add `stacks/kotlin-ktor/` (Exposed ORM) and `stacks/kotlin-springboot/` (Spring Data JPA) — new language

**Independent Test**: `cd stacks/kotlin-ktor && cp .env.example .env && make dev` → 4 endpoints + Multi-DB

**Ref**: [spec.md US6], [plan.md §Kotlin-Ktor/SpringBoot], [research.md §2.9-2.10]

### kotlin-ktor

- [x] T126 [P] [US6] Create directory structure `stacks/kotlin-ktor/backend/src/main/kotlin/dev/brewnet/app/plugins/`
- [x] T127 [US6] Implement Database plugin with Exposed ORM Multi-DB support in `stacks/kotlin-ktor/backend/src/main/kotlin/dev/brewnet/app/plugins/Database.kt` (postgresql/mysql-connector-j/sqlite-jdbc via DB_DRIVER)
- [x] T128 [US6] Implement Serialization plugin with kotlinx.serialization in `stacks/kotlin-ktor/backend/src/main/kotlin/dev/brewnet/app/plugins/Serialization.kt`
- [x] T129 [US6] Implement Routing plugin with 4 endpoints in `stacks/kotlin-ktor/backend/src/main/kotlin/dev/brewnet/app/plugins/Routing.kt`: GET / (ktor-backend), GET /health (db_connected), GET /api/hello (Hello from Ktor!), POST /api/echo
- [x] T130 [US6] Implement Application.kt with Netty engine, CORS, and plugin installation in `stacks/kotlin-ktor/backend/src/main/kotlin/dev/brewnet/app/Application.kt`
- [x] T131 [US6] Create `stacks/kotlin-ktor/backend/build.gradle.kts` with Ktor 3.4 plugin, Exposed, kotlinx.serialization, DB drivers, fat JAR config
- [x] T132 [P] [US6] Create `stacks/kotlin-ktor/backend/settings.gradle.kts`
- [x] T133 [US6] Create multi-stage Dockerfile in `stacks/kotlin-ktor/backend/Dockerfile` (eclipse-temurin:21-jdk → eclipse-temurin:21-jre-alpine, non-root, HEALTHCHECK)
- [x] T134 [P] [US6] Create `stacks/kotlin-ktor/backend/.dockerignore`
- [x] T135 [US6] Create `stacks/kotlin-ktor/docker-compose.yml` with labels com.brewnet.stack=kotlin-ktor
- [x] T136 [P] [US6] Create `stacks/kotlin-ktor/Makefile` with 8 targets (test: `./gradlew test`)
- [x] T137 [P] [US6] Create `stacks/kotlin-ktor/.env.example` with STACK_LANG=kotlin-ktor
- [x] T138 [US6] Copy `stacks/java-springboot/frontend/` to `stacks/kotlin-ktor/frontend/`
- [x] T139 [US6] Create `stacks/kotlin-ktor/README.md`

### kotlin-springboot

- [x] T140 [P] [US6] Create directory structure `stacks/kotlin-springboot/backend/src/main/kotlin/dev/brewnet/app/controller/` and `stacks/kotlin-springboot/backend/src/main/kotlin/dev/brewnet/app/config/` and `stacks/kotlin-springboot/backend/src/main/resources/`
- [x] T141 [US6] Implement DataSourceConfig with Multi-DB support using Kotlin DSL in `stacks/kotlin-springboot/backend/src/main/kotlin/dev/brewnet/app/config/DataSourceConfig.kt`
- [x] T142 [US6] Implement ApiController with 4 endpoints using Kotlin data classes in `stacks/kotlin-springboot/backend/src/main/kotlin/dev/brewnet/app/controller/ApiController.kt`: GET / (springboot-kt-backend), GET /health (db_connected), GET /api/hello (Hello from Spring Boot (Kotlin)!), POST /api/echo
- [x] T143 [US6] Implement Application.kt with @SpringBootApplication in `stacks/kotlin-springboot/backend/src/main/kotlin/dev/brewnet/app/Application.kt`
- [x] T144 [US6] Create `stacks/kotlin-springboot/backend/src/main/resources/application.yml` with spring.datasource config for Multi-DB
- [x] T145 [US6] Create `stacks/kotlin-springboot/backend/build.gradle.kts` with Spring Boot 4.0, kotlin("plugin.spring"), kotlin("plugin.jpa"), Spring Data JPA, DB drivers
- [x] T146 [P] [US6] Create `stacks/kotlin-springboot/backend/settings.gradle.kts`
- [x] T147 [US6] Create multi-stage Dockerfile in `stacks/kotlin-springboot/backend/Dockerfile` (eclipse-temurin:21-jdk → eclipse-temurin:21-jre-alpine)
- [x] T148 [P] [US6] Create `stacks/kotlin-springboot/backend/.dockerignore`
- [x] T149 [US6] Create `stacks/kotlin-springboot/docker-compose.yml` with labels com.brewnet.stack=kotlin-springboot
- [x] T150 [P] [US6] Create `stacks/kotlin-springboot/Makefile` with 8 targets (test: `./gradlew test`)
- [x] T151 [P] [US6] Create `stacks/kotlin-springboot/.env.example` with STACK_LANG=kotlin-springboot
- [x] T152 [US6] Copy `stacks/java-springboot/frontend/` to `stacks/kotlin-springboot/frontend/`
- [x] T153 [US6] Create `stacks/kotlin-springboot/README.md`

### US6 Validation

- [x] T154 [US6] Validate kotlin-ktor: build + up + verify 4 endpoints (ktor-backend, Hello from Ktor!)
- [x] T155 [US6] Validate kotlin-springboot: build + up + verify 4 endpoints (springboot-kt-backend, Hello from Spring Boot (Kotlin)!)

**Checkpoint**: US6 complete — Kotlin language added with 2 framework stacks

---

## Phase 9: User Story 7 — Frontend Templates (Priority: P7)

**Goal**: Add Vue.js, SvelteKit frontend templates and API-only mode support

**Independent Test**: Swap go-gin frontend/ with Vue.js template → `make dev` → browser shows hello message

**Ref**: [spec.md US7], [plan.md §Frontend Templates], [research.md (N/A — frontend not researched)]

### Vue.js Template

- [x] T156 [P] [US7] Create directory structure `stacks/frontend-vue/src/`
- [x] T157 [US7] Implement Vue 3 App component calling GET /api/hello and displaying result in `stacks/frontend-vue/src/App.vue`
- [x] T158 [US7] Create main.ts entry point in `stacks/frontend-vue/src/main.ts`
- [x] T159 [US7] Create `stacks/frontend-vue/index.html`
- [x] T160 [US7] Create `stacks/frontend-vue/package.json` with vue 3, vite, typescript, @vitejs/plugin-vue
- [x] T161 [P] [US7] Create `stacks/frontend-vue/vite.config.ts` with vue plugin and dev proxy to backend:8080
- [x] T162 [P] [US7] Create `stacks/frontend-vue/tsconfig.json`
- [x] T163 [US7] Create multi-stage Dockerfile in `stacks/frontend-vue/Dockerfile` (node:22-alpine → nginx:alpine)
- [x] T164 [US7] Create `stacks/frontend-vue/nginx.conf` with /api reverse proxy to backend:8080
- [x] T165 [P] [US7] Create `stacks/frontend-vue/.dockerignore`

### SvelteKit Template

- [x] T166 [P] [US7] Create directory structure `stacks/frontend-svelte/src/routes/`
- [x] T167 [US7] Implement SvelteKit page calling GET /api/hello in `stacks/frontend-svelte/src/routes/+page.svelte`
- [x] T168 [US7] Create `stacks/frontend-svelte/src/app.html`
- [x] T169 [US7] Create `stacks/frontend-svelte/package.json` with svelte, sveltekit, vite, typescript, adapter-static
- [x] T170 [US7] Create `stacks/frontend-svelte/svelte.config.js` with adapter-static for SPA output
- [x] T171 [P] [US7] Create `stacks/frontend-svelte/vite.config.ts` with svelte plugin and dev proxy
- [x] T172 [P] [US7] Create `stacks/frontend-svelte/tsconfig.json`
- [x] T173 [US7] Create multi-stage Dockerfile in `stacks/frontend-svelte/Dockerfile` (node:22-alpine → nginx:alpine)
- [x] T174 [US7] Create `stacks/frontend-svelte/nginx.conf`
- [x] T175 [P] [US7] Create `stacks/frontend-svelte/.dockerignore`

### API-Only Mode

- [x] T176 [US7] Create API-only docker-compose template at `stacks/docker-compose.api-only.yml.template` showing backend-only configuration without frontend service (reference for Brewnet CLI)

### US7 Validation

- [x] T177 [US7] Validate Vue.js template: copy to go-gin/frontend, run make dev, verify browser displays hello message at localhost:3000
- [x] T178 [US7] Validate SvelteKit template: same test with SvelteKit frontend

**Checkpoint**: US7 complete — all 4 frontend options available (React, Vue, Svelte, None)

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, CI, and constitution updates

- [x] T179 Update CLAUDE.md: add 10 new stacks to Repository Structure, Stack-Specific Tech table, Commands examples, Active Technologies
- [x] T180 [P] Update `docs/PRD.md`: add new stacks to stack listing, supported frameworks table
- [x] T181 [P] Update `docs/TRD.md`: add stack implementation details for all 10 new stacks
- [x] T182 Update `.github/workflows/validate-stacks.yml` CI matrix: add all 10 new stacks to matrix.stack list (total 15 stacks × 3 DBs = 45 combinations)
- [x] T183 [P] Update `.specify/memory/constitution.md` Principle II: add idiomatic structure rules for Django, Flask, Echo, Fiber, Axum, NestJS, Next.js, Spring Framework, Ktor, Spring Boot (Kotlin)
- [x] T184 [P] Update `.specify/memory/constitution.md` Stack-Specific Technology Constraints table: add 10 new stacks
- [x] T185 Run full validation: `make validate` for all 15 stacks with default DB (postgres)
- [x] T186 Run quickstart.md validation scenarios for 3 representative stacks (python-django, kotlin-ktor, nodejs-nextjs)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — provides templates for all stories
- **US1-US7 (Phase 3-9)**: All depend on Foundational phase completion
  - US1-US6 are backend stacks — fully independent of each other
  - US7 (frontends) is independent of US1-US6 but benefits from having a backend for testing
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1 (Setup) ──→ Phase 2 (Foundation) ──┬──→ US1 (Python Django/Flask) ──→ ┐
                                            ├──→ US2 (Go Echo/Fiber)       ──→ │
                                            ├──→ US3 (Rust Axum)           ──→ │
                                            ├──→ US4 (Node NestJS/Next.js) ──→ ├──→ Phase 10 (Polish)
                                            ├──→ US5 (Java Spring)         ──→ │
                                            ├──→ US6 (Kotlin Ktor/SB)      ──→ │
                                            └──→ US7 (Frontend Templates)  ──→ ┘
```

- **US1 → US7**: All independent — no cross-story dependencies
- **Within each US**: Tasks are sequential unless marked [P]
- **US7**: Can run in parallel with any backend US

### Within Each User Story

- Directory structure first
- DB connection / ORM setup
- API endpoint handlers
- Main entry point / server setup
- Build config (go.mod, Cargo.toml, etc.)
- Dockerfile + .dockerignore
- docker-compose.yml, Makefile, .env.example
- Copy frontend, README
- Validation last

### Parallel Opportunities

**Cross-story parallelism** (all independent):
- US1 (Python) || US2 (Go) || US3 (Rust) || US4 (Node) || US5 (Java) || US6 (Kotlin) || US7 (Frontend)

**Within US1**:
- python-django tasks || python-flask tasks (different directories)

**Within US2**:
- go-echo tasks || go-fiber tasks (different directories)

**Within US4**:
- nodejs-nestjs tasks || nodejs-nextjs tasks (different directories)

**Within US6**:
- kotlin-ktor tasks || kotlin-springboot tasks (different directories)

**Within US7**:
- frontend-vue tasks || frontend-svelte tasks (different directories)

---

## Parallel Example: User Story 1

```bash
# Launch both Python stacks in parallel (different directories):
Agent 1: T006-T020 (python-django)
Agent 2: T021-T033 (python-flask)

# Within python-django, parallel tasks:
T006 [P] (directory structure) || T015 [P] (.dockerignore) || T017 [P] (Makefile) || T018 [P] (.env.example)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (python-django + python-flask)
4. **STOP and VALIDATE**: Both Python stacks pass `make validate`
5. Can demo 7 working stacks (5 existing + 2 new)

### Incremental Delivery

1. Setup + Foundation → Ready
2. US1 (Python) → 7 stacks total → Validate
3. US2 (Go) → 9 stacks → Validate
4. US3 (Rust) → 10 stacks → Validate
5. US4 (Node.js) → 12 stacks → Validate
6. US5 (Java) → 13 stacks → Validate
7. US6 (Kotlin) → 15 stacks → Validate
8. US7 (Frontends) → All frameworks + All frontend options → Validate
9. Polish → Documentation + CI update → Final validation

### Recommended Execution Order

For a single developer, execute US1-US6 by priority (P1→P6) sequentially. Within each US, implement both frameworks in that US before moving on (e.g., Django + Flask together). US7 can be done at any point after Foundation.

---

## Notes

- [P] tasks = different files/directories, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable via `make validate`
- Backend code target: ≤200 lines per stack (excluding config files)
- Frontend is always a copy from existing stack (React template) except US7
- Next.js (US4) is the exception: unified structure, no separate frontend directory, port 3000
- Fiber (US2) requires Go 1.25+ — use golang:1.25-alpine Docker image
- Spring Framework (US5) has the tightest constraint: manual Tomcat embed within 200 lines
- Kotlin (US6) is a new language — requires new Docker patterns (JVM 21 based)
