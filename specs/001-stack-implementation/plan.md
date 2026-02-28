# Implementation Plan: Brewnet 5-Stack Implementation

**Branch**: `001-stack-implementation` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-stack-implementation/spec.md`

## Summary

PRD/TRD에 정의된 5개 언어 스택(Node, Python, Go, Rust, Java)의 풀스택 보일러플레이트를 구현한다. 각 스택은 `stacks/{lang}/` 하위에 backend(4개 API 엔드포인트 + 3종 DB 지원), frontend(React 19 + Vite 6), docker-compose.yml(DB profiles), Makefile(8개 타겟), .env.example, README.md를 포함한다. 공통 인프라(validate.sh, frontend 템플릿)를 먼저 구축한 후, Node → Python → Go → Rust → Java 순서로 구현한다.

## Technical Context

**Language/Version**: Go 1.22+, Rust 1.75+, Java 21, Node.js 22 (TypeScript), Python 3.12+
**Primary Dependencies**: Gin, Actix-web 4, Spring Boot 3.3, Express 5, FastAPI
**Storage**: PostgreSQL 16, MySQL 8.4, SQLite3 (DB_DRIVER 환경변수로 전환)
**Testing**: `make validate` (validate.sh — curl 기반 API 검증)
**Target Platform**: Docker containers (Linux, multi-arch)
**Project Type**: Multi-language fullstack boilerplate monorepo
**Performance Goals**: Docker build < 5분, Hello World 표시 < 3분 (build 제외)
**Constraints**: Backend < 200 LOC (테스트 제외), DB 전환 < 30초
**Scale/Scope**: 5 stacks × 3 DBs = 15개 조합

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Verification |
|-----------|--------|-------------|
| I. Zero Bloat | PASS | 각 스택은 프레임워크 + ORM + DB 드라이버만 사용. DI/로깅/DTO 금지 |
| II. Idiomatic Structure | PASS | TRD Section 3에 정의된 언어별 표준 구조를 그대로 따름 |
| III. Config-Driven DB | PASS | .env DB_DRIVER로 postgres/mysql/sqlite3 전환, docker-compose profiles 사용 |
| IV. Uniform API Contract | PASS | 4개 엔드포인트만 구현 (/, /health, /api/hello, /api/echo). CRUD 없음 |
| V. Docker Security Baseline | PASS | Multi-stage, non-root, HEALTHCHECK, network isolation, resource limits, .dockerignore |
| VI. Anti-Pattern Enforcement | PASS | 스택별 금지 패턴 준수, Out of Scope 항목 미포함 |

**GATE RESULT: ALL PASS** — Phase 0 진행 가능

## Project Structure

### Documentation (this feature)

```text
specs/001-stack-implementation/
├── plan.md              # This file
├── research.md          # Phase 0: 기술 결정 사항 정리
├── data-model.md        # Phase 1: Entity 정의
├── quickstart.md        # Phase 1: 각 스택 실행 가이드
├── contracts/           # Phase 1: API contract
│   └── api-spec.md      # 4개 엔드포인트 상세 스펙
└── tasks.md             # Phase 2: /speckit.tasks 생성
```

### Source Code (repository root)

```text
stacks/
├── node/                          # US1 (P1)
│   ├── backend/
│   │   ├── src/
│   │   │   ├── index.ts           # Express app 엔트리포인트
│   │   │   ├── routes/
│   │   │   │   ├── root.ts        # GET /, /health
│   │   │   │   ├── hello.ts       # GET /api/hello
│   │   │   │   └── echo.ts        # POST /api/echo
│   │   │   └── database.ts        # Prisma client
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   ├── frontend/                  # React 19 + Vite 6 + TS (공통)
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── vite-env.d.ts
│   │   ├── public/brewnet.svg
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   ├── nginx.conf
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   ├── docker-compose.yml
│   ├── Makefile
│   ├── .env.example
│   └── README.md
│
├── python/                        # US2 (P2) — 동일 구조
│   ├── backend/
│   │   ├── src/
│   │   │   ├── main.py
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── routers/ (root.py, hello.py, echo.py)
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   ├── frontend/ (공통 복사)
│   ├── docker-compose.yml, Makefile, .env.example, README.md
│
├── go/                            # US3 (P3)
│   ├── backend/
│   │   ├── cmd/server/main.go
│   │   ├── internal/
│   │   │   ├── handler/ (root.go, health.go, hello.go, echo.go)
│   │   │   └── database/database.go
│   │   ├── go.mod, go.sum
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   ├── frontend/ (공통 복사)
│   ├── docker-compose.yml, Makefile, .env.example, README.md
│
├── rust/                          # US4 (P4)
│   ├── backend/
│   │   ├── src/ (main.rs, handler.rs, database.rs)
│   │   ├── Cargo.toml
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   ├── frontend/ (공통 복사)
│   ├── docker-compose.yml, Makefile, .env.example, README.md
│
├── java/                          # US5 (P5)
│   ├── backend/
│   │   ├── src/main/java/dev/brewnet/app/
│   │   │   ├── Application.java
│   │   │   └── controller/RootController.java
│   │   ├── src/main/resources/ (application*.yml)
│   │   ├── build.gradle.kts, settings.gradle.kts
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   ├── frontend/ (공통 복사)
│   ├── docker-compose.yml, Makefile, .env.example, README.md
│
shared/
├── scripts/
│   └── validate.sh                # 공통 검증 스크립트

.github/workflows/
└── validate-stacks.yml            # CI: 5×3 matrix
```

**Structure Decision**: Monorepo 내 `stacks/{lang}/` 구조. 각 스택이 완전히 독립적인 fullstack 프로젝트로, `shared/scripts/validate.sh`만 공유. Frontend는 각 스택에 동일 복사본. TRD Section 3의 언어별 구조를 그대로 반영.

## Complexity Tracking

> No Constitution violations. All implementations follow TRD-defined patterns.
