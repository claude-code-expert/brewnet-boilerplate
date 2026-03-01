# Changelog

All notable changes to this project will be documented in this file.

이 프로젝트의 모든 주요 변경 사항을 이 파일에 기록합니다.

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

- Comprehensive bilingual (Korean/English) root README.md
  - Project overview, available stacks table (15 backends)
  - Brewnet CLI installation and usage guide (`brewnet create-app`)
  - Manual clone instructions (full clone, sparse checkout, degit)
  - API contract, database support, port conventions, Makefile targets
  - Repository structure, Docker architecture, environment variables
- Detailed Contributing guide (9-step process)
  - Directory structure, API contract, Docker requirements
  - Frontend integration, Makefile, README format
  - Validation steps, PR submission with checklist
- Brewnet branding: `brewnet.dev` URL, `brewnet.dev@gmail.com`, Korean tagline
- Monorepo reference one-liner added to all 15 stack READMEs
- OPERATIONS.md (git-ignored, internal operations workflow document)
  - Branch strategy, release workflow, stack publishing
  - CI/CD pipeline, database operations, monitoring
  - Incident response, maintenance checklists
- Stack branch publishing via `publish-stack-branches.sh`
  - 15 orphan branches (`stack/{name}`) for Brewnet CLI direct clone
  - Each branch contains flattened stack files at repo root

### Changed / 변경

- `publish-stack-branches.sh` removed from git tracking (internal operations only)
- `.gitignore` updated: added `OPERATIONS.md`, `shared/scripts/publish-stack-branches.sh`

---

## [v1.0.0] - 2026-03-01

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
