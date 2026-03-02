# Changelog

All notable changes to this project will be documented in this file.

이 프로젝트의 모든 주요 변경 사항을 이 파일에 기록합니다.

---

## [v1.0.4] - 2026-03-02

### Added / 추가

- **`stacks/nodejs-nextjs-full/`** — Next.js 15 Full-Stack boilerplate (16th stack)
  - Server Components + Client Components + shared `lib/hello.ts` pattern
  - Unified frontend+backend on port 3000 (no separate frontend service)
  - Prisma ORM with PostgreSQL / MySQL / SQLite3 support
  - Vitest test suite covering all 4 API endpoints (`/`, `/health`, `/api/hello`, `POST /api/echo`)
  - Docker: `node:22-alpine` multi-stage build, non-root user, HEALTHCHECK

### Changed / 변경

- **Root README.md**
  - Stack count: 15 → 16
  - Added `stacks/nodejs-nextjs-full/` to repository structure tree
  - Fixed boilerplate repository URL: `user/brewnet-boilerplate` → `claude-code-expert/brewnet-boilerplate`
  - Added `stack/{name}` branch mapping table for all 16 stacks
  - Fixed `java-springboot` framework version: Spring Boot 3.3 → Spring Boot 3.4
- **`stacks/nodejs-nextjs/README.md`**: Added cross-reference note to `nodejs-nextjs-full`
- **`stacks/java-springboot/README.md`**: Removed duplicate header line; fixed `DB_NAME` default
- **`stacks/kotlin-ktor/README.md`**: Removed duplicate subtitle line
- **`.gitignore`**: Added `.vscode/` and `**/backend/bin/` entries

### CLI Integration (brewnet-cli `feature/traefik`) / CLI 연동

**Go framework routing** (was: single `goTemplate()` → Express-like fallback)
- `ginTemplate()`: Gin 1.10.0, Go 1.22, `cmd/server/main.go` + `internal/handler/*` + `internal/database/database.go`
- `echoTemplate()`: Echo 4.13.3, Go 1.22, same modular structure
- `fiberTemplate()`: Fiber v3, Go 1.25, same modular structure
- All templates: GORM multi-DB (PostgreSQL / MySQL / SQLite3), multi-stage Dockerfile
- `getScaffoldTemplate()` `case 'go':` — framework switch (default: gin)
- `getDevConfig()` `case 'go':` — `go run ./cmd/server` (was `go run .`)

**Kotlin framework routing** (was: missing → Express fallback)
- `ktorTemplate()`: Kotlin 2.1.10, Ktor 3.1.1, Exposed ORM 0.58.0
  - Files: `build.gradle.kts`, `Application.kt`, `plugins/Routing.kt`, `plugins/Database.kt`, `plugins/Serialization.kt`, `Dockerfile`, `.dockerignore`
- `springbootKtTemplate()`: Kotlin 2.1.10, Spring Boot 3.4.3, HikariCP
  - Files: `build.gradle.kts`, `Application.kt`, `controller/ApiController.kt`, `config/DataSourceConfig.kt`, `application.yml`, `Dockerfile`, `.dockerignore`
- `getScaffoldTemplate()` `case 'kotlin':` — framework switch (default: ktor)
- `getDevConfig()` `case 'kotlin':` — `gradle run` (Ktor) / `gradle bootRun` (Spring Boot Kotlin)
- `getSampleDataFiles()` `case 'kotlin':` — `src/main/resources/data.json`

**Version display fixes** (`dev-stack.ts` wizard header)
- Go: `1.24` → `1.22+` (actual range 1.22–1.25 depending on framework)
- Rust: `1.85` → `1.88`
- Kotlin: `2.3` → `2.1`

**Test coverage**: 52 → 92 tests (40 added, all passing)

---

## [v1.0.3] - 2026-03-01

### Changed / 변경

- Standardize database defaults across all 15 stacks (68 files)
  - `DB_NAME`: `brewnet` → `brewnet_db`
  - `DB_PASSWORD`: `brewnet_secret` → `password`
  - `MYSQL_DATABASE`: `brewnet` → `brewnet_db`
  - `MYSQL_PASSWORD`: `brewnet_secret` → `password`
  - `MYSQL_ROOT_PASSWORD`: `root_secret` → `password`
  - `SQLITE_PATH`: `brewnet.db` → `brewnet_db.db`
- Update all `.env.example`, `docker-compose.yml`, backend source code defaults
- Add default credentials table and DB connection examples to root README.md
- Add MySQL environment variables to root README.md environment variables table
- Update CLAUDE.md, PRD.md, TRD.md, spec documents with new DB defaults

---

## [v1.0.2] - 2026-03-01

### Changed / 변경

- Remove Vue.js and SvelteKit frontend template references from documentation (README, CLAUDE.md, PRD.md)
- Frontend is now React 19 + Vite 6 + TypeScript only across all stacks
- Update all 15 stack branches with latest documentation changes

### Removed / 제거

- `frontend-vue/`, `frontend-svelte/` references from all documentation
- Vue/Svelte options from CLI prompt examples

---

## [v1.0.1] - 2026-03-01

### Added / 추가

- 15 backend stacks (fullstack boilerplates)
  - **Go**: Gin, Echo v4, Fiber v3 (GORM)
  - **Rust**: Actix-web 4, Axum 0.8 (SQLx)
  - **Java**: Spring Boot 3.4, Spring Framework 6.2 (JPA/JDBC)
  - **Kotlin**: Ktor 3.1 (Exposed ORM), Spring Boot 3.4 (JDBC)
  - **Node.js**: Express 5, NestJS 11, Next.js 15 (Prisma)
  - **Python**: FastAPI (async SQLAlchemy), Django 6, Flask 3.1 (Flask-SQLAlchemy)
- React 19 + Vite 6 + TypeScript default frontend (all stacks)
- Multi-database support: PostgreSQL 16, MySQL 8.4, SQLite3 (via `DB_DRIVER` env)
- Docker architecture: multi-stage builds, non-root execution, health checks, network isolation
- Uniform Makefile targets: dev, build, up, down, logs, test, clean, validate
- Shared validation script (`shared/scripts/validate.sh`)
- GitHub Actions CI (`validate-stacks.yml`)
- Documentation: PRD.md, TRD.md, BREWNET-USER-STORY.md, CLAUDE.md
- Comprehensive bilingual (Korean/English) root README.md
  - Project overview, available stacks table (15 backends)
  - Brewnet CLI installation and usage guide (`brewnet create-app`)
  - Manual clone instructions (full clone, sparse checkout, degit)
  - API contract, database support, port conventions, Makefile targets
  - Repository structure, Docker architecture, environment variables
- Detailed Contributing guide (9-step process)
- Brewnet branding: `brewnet.dev` URL, `brewnet.dev@gmail.com`, Korean tagline
- Monorepo reference one-liner added to all 15 stack READMEs
- OPERATIONS.md (git-ignored, internal operations workflow document)
- Stack branch publishing via `publish-stack-branches.sh`
  - 15 orphan branches (`stack/{name}`) for Brewnet CLI direct clone

### Changed / 변경

- `publish-stack-branches.sh` removed from git tracking (internal operations only)
- `.gitignore` updated: added `OPERATIONS.md`, `shared/scripts/publish-stack-branches.sh`
