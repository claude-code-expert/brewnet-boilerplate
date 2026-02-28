# Tasks: Brewnet 5-Stack Implementation

**Input**: Design documents from `/specs/001-stack-implementation/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api-spec.md, quickstart.md

**Tests**: Not separately requested. Validation is performed via `make validate` (`shared/scripts/validate.sh` — curl-based API verification per FR-007).

**Organization**: Tasks are grouped by user story (US1-US5). US1 (Node.js) is the MVP and includes common infrastructure establishment. US2-US5 replicate the pattern with stack-specific implementations.

**Document Cross-Reference**:

| Document | Used For | Key Sections |
|----------|----------|-------------|
| `contracts/api-spec.md` | Endpoint contracts, CORS, field rules | 4 endpoints + Error/CORS |
| `data-model.md` | Response models, DB connection config, env vars | Sections 1-3 |
| `docs/TRD.md` | Stack code samples, Docker, Compose, Makefile, CI | Sections 2-6 |
| `docs/PRD.md` | Requirements, port conventions, constraints | Sections 5-6 |
| `spec.md` | User stories, FRs, acceptance scenarios, success criteria | US1-US6, FR-001 to FR-019 |
| `research.md` | Implementation order, README structure, infra strategy | Sections 2-4 |
| `constitution.md` | Principles I-VI (validation gates) | All 6 principles |

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1-US6) — maps to spec.md user stories
- All file paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create monorepo directory structure and shared validation script

**Basis**: plan.md Project Structure, research.md Section 3 (common infra built with first stack), FR-007

- [x] T001 Create monorepo directory structure: `stacks/{node,python,go,rust,java}/`, `shared/scripts/`, `.github/workflows/` per plan.md Project Structure
- [x] T002 [P] Create validation script in `shared/scripts/validate.sh` — wait for backend health, verify GET /, GET /health (with db_connected check), GET /api/hello, POST /api/echo per TRD Section 5.1 and api-spec.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create reusable frontend template that will be copied to all 6 stacks

**Basis**: TRD Section 4, FR-008 to FR-011, research.md Section 1.3, Constitution Principle IV

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create common frontend template with all files: `src/App.tsx` (fetch /api/hello + /health, display message + db_connected), `src/main.tsx`, `src/vite-env.d.ts`, `public/brewnet.svg`, `index.html`, `vite.config.ts` (proxy /api to backend:8080), `tsconfig.json`, `package.json` (React 19, Vite 6, TypeScript), `nginx.conf` (proxy /api/ and /health to backend:8080, SPA fallback), `Dockerfile` (multi-stage: node:22-alpine builder → nginx:alpine, HEALTHCHECK), `.dockerignore` — per TRD Section 4.1-4.4, FR-008 to FR-011, Constitution V
- [x] T004 [P] Update root `.gitignore` to include `.env`, `node_modules/`, `dist/`, `data/`, `*.db` patterns per Constitution V (`.env` protection)

**Checkpoint**: Foundation ready — user story implementation can begin

---

## Phase 3: User Story 1 — Node.js Stack (Priority: P1) — MVP

**Goal**: Deliver fully functional Node.js (Express 5 + Prisma) fullstack boilerplate with 3-DB support. This stack establishes the canonical pattern (docker-compose, Makefile, .env.example, README) for all subsequent stacks.

**Independent Test**: `cd stacks/node && cp .env.example .env && make dev` → verify 4 API endpoints at localhost:8080 + frontend at localhost:3000. Then `make validate` passes. Switch DB_DRIVER to mysql and sqlite3 to verify all 3 drivers.

**Basis**: spec.md US1 (8 acceptance scenarios), TRD 3.4, PRD 6.4, research.md Sections 1.1/3/4

### Implementation for User Story 1

- [x] T005 [P] [US1] Create Node backend project config: `package.json` (Express 5, Prisma, @prisma/client, cors, TypeScript, ts-node, @types/*) and `tsconfig.json` (outDir: dist, strict mode) in `stacks/node/backend/` — per TRD 3.4, PRD 6.4, Constitution I (minimal deps only)
- [x] T006 [P] [US1] Create Prisma schema with env-driven provider (`env("PRISMA_DB_PROVIDER")`) and url (`env("DATABASE_URL")`) in `stacks/node/backend/prisma/schema.prisma` — per TRD 3.4 Prisma Schema, data-model.md Section 2
- [x] T007 [US1] Implement database connection module in `stacks/node/backend/src/database.ts` — initialize PrismaClient, export connection check function for /health endpoint — per data-model.md Section 2, TRD 3.4
- [x] T008 [P] [US1] Implement 3 route handler files in `stacks/node/backend/src/routes/`: `root.ts` (GET / → RootResponse, GET /health → HealthResponse with db_connected from actual DB ping), `hello.ts` (GET /api/hello → HelloResponse with process.version), `echo.ts` (POST /api/echo → echo body, empty body → {}) — per api-spec.md all 4 endpoints, FR-002, FR-003, data-model.md Section 1
- [x] T009 [US1] Create Express app entry point in `stacks/node/backend/src/index.ts` — import routes, configure CORS (origin: localhost:3000, methods: GET/POST/OPTIONS, headers: Content-Type), JSON body parser, listen on port 8080 — per api-spec.md CORS section, Constitution IV
- [x] T010 [P] [US1] Create backend Dockerfile (multi-stage: `node:22-alpine` builder with npm ci + prisma generate + tsc build → `node:22-alpine` runner with non-root `appuser`, HEALTHCHECK wget, EXPOSE 8080, mkdir /app/data for SQLite) and `.dockerignore` in `stacks/node/backend/` — per TRD 3.4 Dockerfile, FR-012 to FR-014, FR-017, Constitution V
- [x] T011 [US1] Copy common frontend template (from Phase 2) to `stacks/node/frontend/` — all files unchanged per FR-008, research.md Section 1.3
- [x] T012 [P] [US1] Create `stacks/node/docker-compose.yml` with 5 services: backend (build ./backend, port 8080, all DB env vars, depends_on postgres/mysql with required:false, healthcheck, resource limits, labels, networks brewnet+brewnet-internal, sqlite-data volume), frontend (build ./frontend, port 3000:80, depends_on backend healthy, resource limits, labels, network brewnet), postgres (postgres:16-alpine, profile "postgres", healthcheck pg_isready, port 5433:5432, network brewnet-internal), mysql (mysql:8.4, profile "mysql", healthcheck mysqladmin ping, port 3307:3306, network brewnet-internal), networks (brewnet bridge, brewnet-internal internal:true), volumes (pg-data, mysql-data, sqlite-data) — per TRD 2.3 full template, FR-004, FR-005, FR-015, FR-016, Constitution V
- [x] T013 [P] [US1] Create `stacks/node/Makefile` with 8 targets (dev, build, up, down, logs, test, clean, validate) and DB_DRIVER→COMPOSE_PROFILES auto-selection logic (read DB_DRIVER from .env, set COMPOSE_PROFILES accordingly, sqlite3→empty profile) — per TRD 2.4, FR-006, research.md Section 1.5
- [x] T014 [P] [US1] Create `stacks/node/.env.example` with all environment variables: common (PROJECT_NAME, DOMAIN, DB_DRIVER=postgres, BACKEND_PORT, FRONTEND_PORT, TZ, STACK_LANG=node), PostgreSQL (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD), MySQL (MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, MYSQL_ROOT_PASSWORD), SQLite3 (SQLITE_PATH), Prisma (PRISMA_DB_PROVIDER, DATABASE_URL) — per TRD Section 7, data-model.md Section 3
- [x] T015 [US1] Create `stacks/node/README.md` in English with Korean annotations: sections for Stack Introduction, Quick Start (.env setup → make dev → access URLs), API Endpoints table with curl examples (4 endpoints), Database Switching guide (DB_DRIVER change → make down && make dev), Project Structure tree, Makefile Targets (8 targets), Validation (make validate) — per FR-018, FR-019, research.md Section 4

**Checkpoint**: Node.js stack fully functional. `make dev` starts backend+frontend+DB. `make validate` passes for all 3 DB drivers. README.md provides complete usage guide. Spec acceptance scenarios 1-8 verified.

---

## Phase 4: User Story 2 — Python Stack (Priority: P2)

**Goal**: Deliver fully functional Python (FastAPI + SQLAlchemy async) fullstack boilerplate, replicating the Node.js stack pattern.

**Independent Test**: `cd stacks/python && cp .env.example .env && make dev` → verify 4 APIs + frontend + 3 DB drivers.

**Basis**: spec.md US2 (4 acceptance scenarios), TRD 3.5, PRD 6.5

### Implementation for User Story 2

- [x] T016 [P] [US2] Create Python backend project files: `requirements.txt` (fastapi, uvicorn[standard], sqlalchemy[asyncio], pydantic-settings, asyncpg, aiomysql, aiosqlite) and `src/config.py` (pydantic Settings class with DB_DRIVER, all DB env vars) in `stacks/python/backend/` — per TRD 3.5 requirements.txt, Constitution I
- [x] T017 [US2] Implement Python backend application: `src/database.py` (async engine creation with DB_DRIVER switch: postgres→asyncpg, mysql→aiomysql, sqlite3→aiosqlite), `src/routers/root.py` (GET / → RootResponse, GET /health → HealthResponse with actual DB ping), `src/routers/hello.py` (GET /api/hello → HelloResponse with sys.version), `src/routers/echo.py` (POST /api/echo), `src/main.py` (FastAPI app, CORS middleware, include routers, uvicorn on port 8080) in `stacks/python/backend/src/` — per TRD 3.5, api-spec.md, data-model.md, FR-002, FR-003
- [x] T018 [P] [US2] Create backend Dockerfile (multi-stage: `python:3.12-slim` builder with pip install --prefix=/install → runner with non-root `appuser`, HEALTHCHECK python urllib, EXPOSE 8080, CMD uvicorn) and `.dockerignore` in `stacks/python/backend/` — per TRD 3.5 Dockerfile, Constitution V
- [x] T019 [US2] Copy frontend template to `stacks/python/frontend/` and create stack infrastructure: `docker-compose.yml` (adapt from Node pattern, STACK_LANG=python), `Makefile` (8 targets, TEST_CMD=pytest), `.env.example` (STACK_LANG=python, no Prisma vars) in `stacks/python/` — per TRD 2.3-2.4, FR-004 to FR-006, data-model.md Section 3
- [x] T020 [US2] Create `stacks/python/README.md` with stack-specific Quick Start, API examples, DB switching, project structure — per FR-018, FR-019, research.md Section 4

**Checkpoint**: Python stack fully functional. All 4 acceptance scenarios pass. 3 DB drivers work. README is complete.

---

## Phase 5: User Story 3 — Go Stack (Priority: P3)

**Goal**: Deliver fully functional Go (Gin + GORM) fullstack boilerplate. First compiled language stack.

**Independent Test**: `cd stacks/go && cp .env.example .env && make dev` → verify 4 APIs + frontend + 3 DB drivers.

**Basis**: spec.md US3 (4 acceptance scenarios, note: CGO_ENABLED=1 for SQLite), TRD 3.1, PRD 6.1

### Implementation for User Story 3

- [x] T021 [P] [US3] Create Go backend project files: `go.mod` (module, Go 1.22+, deps: gin-gonic/gin, gorm.io/gorm, gorm.io/driver/{postgres,mysql,sqlite}, gin-contrib/cors) in `stacks/go/backend/` — per TRD 3.1, PRD 6.1, Constitution I
- [x] T022 [US3] Implement Go backend application: `internal/database/database.go` (Connect() with DB_DRIVER switch: postgres/mysql/sqlite3 DSN, return *gorm.DB), `internal/handler/root.go` (GET / → RootResponse), `internal/handler/health.go` (GET /health with DB ping → HealthResponse), `internal/handler/hello.go` (GET /api/hello with runtime.Version()), `internal/handler/echo.go` (POST /api/echo), `cmd/server/main.go` (Gin engine, CORS, register routes, listen :8080) in `stacks/go/backend/` — per TRD 3.1 full code sample, api-spec.md, FR-002, FR-003
- [x] T023 [P] [US3] Create backend Dockerfile (multi-stage: `golang:1.22-alpine` builder with CGO_ENABLED=1, go build → `alpine:3.19` runner with ca-certificates, non-root appuser, HEALTHCHECK wget, mkdir /app/data) and `.dockerignore` in `stacks/go/backend/` — per TRD 3.1 Dockerfile (CGO note critical for SQLite), Constitution V
- [x] T024 [US3] Copy frontend template to `stacks/go/frontend/` and create stack infrastructure: `docker-compose.yml` (STACK_LANG=go), `Makefile` (8 targets, TEST_CMD=go test ./...), `.env.example` (STACK_LANG=go) in `stacks/go/` — per TRD 2.3-2.4, FR-004 to FR-006
- [x] T025 [US3] Create `stacks/go/README.md` with Go-specific notes (CGO_ENABLED for SQLite), Quick Start, API examples, DB switching, project structure — per FR-018, FR-019

**Checkpoint**: Go stack fully functional. All 4 acceptance scenarios pass. CGO_ENABLED=1 verified for SQLite. README complete.

---

## Phase 6: User Story 4 — Rust Stack (Priority: P4)

**Goal**: Deliver fully functional Rust (Actix-web 4 + SQLx) fullstack boilerplate. Longest build time.

**Independent Test**: `cd stacks/rust && cp .env.example .env && make dev` → verify 4 APIs + frontend + 3 DB drivers.

**Basis**: spec.md US4 (4 acceptance scenarios), TRD 3.2, PRD 6.2

### Implementation for User Story 4

- [x] T026 [P] [US4] Create Rust backend project files: `Cargo.toml` (actix-web 4, actix-cors, serde+serde_json, sqlx with features [runtime-tokio, any, postgres, mysql, sqlite], tokio, chrono) in `stacks/rust/backend/` — per TRD 3.2 Cargo.toml, PRD 6.2, Constitution I
- [x] T027 [US4] Implement Rust backend application: `src/database.rs` (connect() async with DB_DRIVER match: postgres/mysql/sqlite3 → AnyPool), `src/handler.rs` (root, health with DB ping, hello with CARGO_PKG_VERSION, echo handlers), `src/main.rs` (HttpServer, CORS, routes, bind :8080) in `stacks/rust/backend/src/` — per TRD 3.2 full code sample, api-spec.md, FR-002, FR-003
- [x] T028 [P] [US4] Create backend Dockerfile (multi-stage: `rust:1.75` builder with empty main.rs dep caching trick → cargo build --release → `debian:bookworm-slim` runner with ca-certificates, wget, non-root appuser, HEALTHCHECK wget, mkdir /app/data) and `.dockerignore` in `stacks/rust/backend/` — per TRD 3.2 Dockerfile (dep caching note), Constitution V
- [x] T029 [US4] Copy frontend template to `stacks/rust/frontend/` and create stack infrastructure: `docker-compose.yml` (STACK_LANG=rust), `Makefile` (8 targets, TEST_CMD=cargo test), `.env.example` (STACK_LANG=rust) in `stacks/rust/` — per TRD 2.3-2.4, FR-004 to FR-006
- [x] T030 [US4] Create `stacks/rust/README.md` with Rust-specific notes (build time, dep caching), Quick Start, API examples, DB switching, project structure — per FR-018, FR-019

**Checkpoint**: Rust stack fully functional. All 4 acceptance scenarios pass. Dep caching reduces rebuild time. README complete.

---

## Phase 7: User Story 5 — Java Stack (Priority: P5)

**Goal**: Deliver fully functional Java (Spring Boot 3.3 + JPA) fullstack boilerplate with Spring profiles for DB switching.

**Independent Test**: `cd stacks/java && cp .env.example .env && make dev` → verify 4 APIs + frontend + 3 DB drivers.

**Basis**: spec.md US5 (4 acceptance scenarios, note: Spring profiles), TRD 3.3, PRD 6.3

### Implementation for User Story 5

- [x] T031 [P] [US5] Create Java backend project files: `build.gradle.kts` (Spring Boot 3.3 starter-web + starter-data-jpa, PostgreSQL/MySQL/SQLite drivers, hibernate-community-dialects), `settings.gradle.kts`, `gradle/wrapper/*` (Gradle wrapper), `src/main/resources/application.yml` (common: spring.profiles.active=${DB_DRIVER}, server.port=8080), `application-postgres.yml`, `application-mysql.yml`, `application-sqlite.yml` (each with datasource config) in `stacks/java/backend/` — per TRD 3.3 full config, PRD 6.3, Constitution I
- [x] T032 [US5] Implement Java backend application: `src/main/java/dev/brewnet/app/Application.java` (@SpringBootApplication), `src/main/java/dev/brewnet/app/controller/RootController.java` (@RestController with 4 endpoints: GET / → RootResponse, GET /health → HealthResponse with DataSource ping, GET /api/hello → HelloResponse with System.getProperty("java.version"), POST /api/echo → echo body, @CrossOrigin for CORS) in `stacks/java/backend/` — per TRD 3.3, api-spec.md, FR-002, FR-003
- [x] T033 [P] [US5] Create backend Dockerfile (multi-stage: `eclipse-temurin:21-jdk-alpine` builder with Gradle wrapper dep download → bootJar → `eclipse-temurin:21-jre-alpine` runner with non-root appuser, HEALTHCHECK wget, java -jar app.jar) and `.dockerignore` in `stacks/java/backend/` — per TRD 3.3 Dockerfile, Constitution V
- [x] T034 [US5] Copy frontend template to `stacks/java/frontend/` and create stack infrastructure: `docker-compose.yml` (STACK_LANG=java, backend environment includes SPRING_PROFILES_ACTIVE=${DB_DRIVER}), `Makefile` (8 targets, TEST_CMD=./gradlew test), `.env.example` (STACK_LANG=java) in `stacks/java/` — per TRD 2.3-2.4, FR-004 to FR-006
- [x] T035 [US5] Create `stacks/java/README.md` with Java-specific notes (Spring profiles, Gradle build), Quick Start, API examples, DB switching, project structure — per FR-018, FR-019

**Checkpoint**: Java stack fully functional. All 4 acceptance scenarios pass. Spring profiles switch DB cleanly. README complete.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: CI pipeline, cross-stack validation, final documentation

**Basis**: TRD Section 6.1, research.md Section 5, SC-007 (CI 18-job matrix)

- [x] T041 Create GitHub Actions CI workflow in `.github/workflows/validate-stacks.yml` — matrix strategy (stack: [go,rust,java,node,python] × db: [postgres,mysql,sqlite3]), steps: checkout → set DB config (.env.example → .env, sed DB_DRIVER, generate passwords) → make build → make up → make validate → logs on failure → make clean always — per TRD 6.1 full workflow, SC-007
- [x] T042 [P] Cross-stack consistency check: verify all 6 stacks have identical directory structure pattern (backend/, frontend/, docker-compose.yml, Makefile, .env.example, README.md), verify all API responses match api-spec.md field rules, verify all Dockerfiles follow Constitution V — per FR-001, Constitution IV/V
- [x] T043 Run quickstart.md validation: execute quickstart steps for at least one stack (Node) — `cp .env.example .env && make dev` → verify 4 endpoints → `make validate` → DB switch to mysql → re-verify → DB switch to sqlite3 → re-verify → `make clean` — per quickstart.md, SC-001 to SC-004

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup ──────────────────────────────────── (no dependencies)
    │
    ▼
Phase 2: Foundational ──────────────────────────── (depends on Phase 1)
    │
    ▼
Phase 3: US1 Node.js (P1) ── MVP ───────────────── (depends on Phase 2)
    │
    ├── Phase 4: US2 Python (P2) ────────────────── (depends on Phase 2, pattern from US1)
    ├── Phase 5: US3 Go (P3) ────────────────────── (depends on Phase 2, pattern from US1)
    ├── Phase 6: US4 Rust (P4) ──────────────────── (depends on Phase 2, pattern from US1)
    └── Phase 7: US5 Java (P5) ──────────────────── (depends on Phase 2, pattern from US1)
         │
         ▼
Phase 8: Polish ─────────────────────────────────── (depends on all US phases)
```

### User Story Dependencies

- **US1 (Node.js, P1)**: MUST complete first — establishes canonical pattern (docker-compose template, Makefile template, .env.example template, README structure). All subsequent stacks replicate this pattern.
- **US2-US5 (P2-P5)**: Structurally independent of each other. Each can start after Phase 2 (Foundational) is complete. However, US1 SHOULD complete first to validate the shared pattern before replication.
- **Recommended order**: US1 → US2 → US3 → US4 → US5 (per research.md Section 2: interpreter languages first for fast validation cycles, then compiled languages).

### Within Each User Story

1. Backend project config (dependencies) — FIRST, enables all other backend tasks
2. Backend application code (DB + routes + entry) — depends on project config
3. Backend Dockerfile + .dockerignore — can parallel with app code (different files)
4. Frontend copy + stack infrastructure — can parallel with backend
5. README.md — LAST (needs final project structure)

### Parallel Opportunities

**Within Phase 1-2**:
- T001 (dirs) then T002 (validate.sh) ∥ T003 (frontend) ∥ T004 (.gitignore) all in parallel

**Within US1 (Phase 3)**:
- T005 (package.json) ∥ T006 (prisma) can parallel (separate files)
- T008 (routes) ∥ T010 (Dockerfile) ∥ T012 (compose) ∥ T013 (Makefile) ∥ T014 (.env.example) can parallel (separate files)
- T015 (README) must be last

**Across User Stories (US2-US5)**:
- If multiple agents are available, US2-US5 can all execute in parallel after US1 validates the pattern
- Each story is fully independent and touches only its own `stacks/{lang}/` directory

---

## Parallel Execution Examples

### Phase 1-2 (Setup + Foundational)

```
Parallel batch 1: T001 (directory structure)
Parallel batch 2: T002 (validate.sh) ∥ T003 (frontend template) ∥ T004 (.gitignore)
```

### US1 (Node.js) — within Phase 3

```
Parallel batch 1: T005 (package.json) ∥ T006 (prisma schema)
Sequential: T007 (database.ts) — depends on T005, T006
Parallel batch 2: T008 (routes) ∥ T010 (Dockerfile) ∥ T012 (compose) ∥ T013 (Makefile) ∥ T014 (.env.example)
Sequential: T009 (index.ts) — depends on T008
Sequential: T011 (frontend copy) — depends on T003
Sequential: T015 (README) — depends on all above
```

### Multi-Agent Strategy (US2-US5)

```
After US1 validated:
  Agent A: US2 Python (T016-T020)
  Agent B: US3 Go     (T021-T025)
  Agent C: US4 Rust   (T026-T030)
  Agent D: US5 Java   (T031-T035)
All independent — no cross-story dependencies
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002-T004)
3. Complete Phase 3: US1 Node.js (T005-T015)
4. **STOP and VALIDATE**: `cd stacks/node && cp .env.example .env && make dev && make validate`
5. Verify 3 DB drivers: postgres → mysql → sqlite3
6. Node.js stack is production-ready as standalone boilerplate

### Incremental Delivery

1. Setup + Foundational → shared infra ready
2. Add US1 Node.js → Test independently → **MVP delivered**
3. Add US2 Python → Test independently → 2 stacks available
4. Add US3 Go → Test independently → 3 stacks available
5. Add US4 Rust → Test independently → 4 stacks available
6. Add US5 Java → Test independently → **Full 5-stack set delivered**
7. Polish: CI pipeline → Cross-stack validation → **Release ready**

### Success Criteria Traceability

| Criteria | Tasks | Verification |
|----------|-------|-------------|
| SC-001: Hello World < 3min | T005-T015, T016-T035 | Each stack: make dev → localhost:3000 |
| SC-002: Docker build < 5min | T010, T018, T023, T028, T033 | Dockerfile multi-stage optimization |
| SC-003: make validate 100% | T002, T013 (per stack Makefile) | T043 final validation |
| SC-004: DB switch < 30s | T012-T014 (per stack compose+env) | quickstart.md DB switching test |
| SC-005: Backend < 200 LOC | T007-T009, T017, T022, T027, T032 | Code review |
| SC-006: README → 5min start | T015, T020, T025, T030, T035 | FR-018 compliance |
| SC-007: CI 15-job matrix | T041 | GitHub Actions validate-stacks.yml |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks within same phase
- [USn] label maps to spec.md user stories for traceability
- Every stack replicates the same pattern: 5 tasks (project config → backend code → Dockerfile → infra → README)
- No unit test tasks: validation is via `make validate` (shared/scripts/validate.sh)
- Constitution principles are checked throughout: I (zero bloat deps), II (idiomatic structure), III (config-driven DB), IV (uniform API), V (Docker security), VI (anti-patterns)
- Backend < 200 LOC constraint (SC-005) must be verified after each stack implementation
- Commit after each task or logical group for clean git history
