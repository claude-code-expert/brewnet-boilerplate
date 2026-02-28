<!--
  Sync Impact Report
  ==================
  Version change: N/A (template) → 1.0.0 (initial)
  Added principles:
    - I. Zero Bloat (from PRD 1.3)
    - II. Idiomatic Language Structure (from PRD 6.x + TRD 3.x)
    - III. Config-Driven Database (from PRD 5.2 + TRD 2.x)
    - IV. Uniform API Contract (from PRD 5.1 + TRD 5.1)
    - V. Docker Security Baseline (from PRD 5.4 + TRD 9)
    - VI. Anti-Pattern Enforcement (from TRD 8.x)
  Added sections:
    - Stack-Specific Technology Constraints
    - Validation & CI Workflow
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ (Constitution Check section is generic, works as-is)
    - .specify/templates/spec-template.md ✅ (no constitution-specific references to update)
    - .specify/templates/tasks-template.md ✅ (no constitution-specific references to update)
    - .specify/templates/commands/ ✅ (no command files exist yet)
  Follow-up TODOs: None
-->

# Brewnet Boilerplate Constitution

## Core Principles

### I. Zero Bloat

각 프레임워크의 공식 권장 구조와 최소 의존성만 사용한다.

- 불필요한 라이브러리, 미들웨어, 추상화 계층을 추가해서는 안 된다
- DI 프레임워크(wire, fx, inversify, MediatR), 로깅 프레임워크(winston, logback custom), DTO/Mapper 계층은 금지
- Repository 패턴 이중 추상화 금지 — ORM이 이미 추상화 역할을 수행
- 백엔드 코드는 테스트 제외 200줄 이내를 목표로 한다
- 새 의존성 추가 시 반드시 정당한 근거와 사용자 승인이 MUST 필요

### II. Idiomatic Language Structure

각 스택은 해당 언어 커뮤니티가 인정하는 표준 프로젝트 구조만 사용한다.

- **Go**: Standard Go Layout (`cmd/`, `internal/`). `pkg/` 디렉토리 남용 금지, 불필요한 interface 추상화 금지
- **Rust**: flat `src/` 구조 (`main.rs`, `handler.rs`, `database.rs`). Diesel ORM 금지, 과도한 macro derive 금지
- **Java**: Spring Boot 관례 (`src/main/java/`, `src/main/resources/`). 5계층 아키텍처(Controller-Service-Repository-DTO-Mapper) 금지, Lombok 과다 사용 금지, XML 설정 금지
- **Node**: Express 5 + TypeScript 필수, `src/routes/` 구조. class-validator 데코레이터 금지, morgan+winston 동시 사용 금지
- **Python**: FastAPI 자체 구조 (`src/main.py`, `src/routers/`). Django-style apps 구조 금지, Alembic 금지

### III. Config-Driven Database

`.env` 파일의 `DB_DRIVER` 값 하나로 PostgreSQL / MySQL / SQLite3를 전환한다.

- `DB_DRIVER` MUST accept: `postgres`, `mysql`, `sqlite3`
- 각 스택의 DB 연결 로직은 환경변수 기반 분기 + ORM 네이티브 드라이버 교체 패턴을 따른다
- `docker-compose.yml`은 profiles로 DB 서비스를 선택적으로 기동한다 (postgres profile, mysql profile)
- SQLite3 선택 시 외부 DB 컨테이너 없이 백엔드 내부 파일 DB로 동작한다
- DB 전환은 `.env` 수정 + `docker compose down && docker compose up -d`로 30초 이내에 완료되어야 한다

### IV. Uniform API Contract

모든 스택은 정확히 4개의 동일한 엔드포인트를 구현한다. 추가 엔드포인트는 금지.

| Method | Path | Response |
|--------|------|----------|
| `GET` | `/` | `{"service":"{lang}-backend","status":"running","message":"..."}` |
| `GET` | `/health` | `{"status":"ok","timestamp":"...","db_connected":true}` |
| `GET` | `/api/hello` | `{"message":"Hello from {Lang}!","lang":"{lang}","version":"..."}` |
| `POST` | `/api/echo` | Request body echo |

- `/health` 응답에 `db_connected` 필드 MUST 포함
- CRUD 엔드포인트(items 등) 추가 금지 — 이 보일러플레이트는 연결 확인용
- 응답 형식은 모든 스택에서 동일해야 한다

### V. Docker Security Baseline

모든 스택의 Docker 구성은 아래 보안 기준을 충족해야 한다.

- **Multi-stage build**: builder → runner 단계 분리 MUST
- **Non-root 실행**: `appuser` 또는 언어 관례에 따른 비루트 사용자 MUST
- **HEALTHCHECK directive**: 모든 서비스 Dockerfile에 MUST 포함
- **Network isolation**: `brewnet` (public) + `brewnet-internal` (DB only, internal: true)
- **Resource limits**: `deploy.resources.limits` (memory, cpus) MUST 설정
- **`.dockerignore`**: `backend/`, `frontend/` 각각 MUST 존재
- **Labels**: `com.brewnet.stack={lang}`, `com.brewnet.role={backend|frontend}`
- **`.env` 보호**: `.gitignore`에 `.env` 포함, `.env.example`만 커밋

### VI. Anti-Pattern Enforcement

"베스트 프랙티스"라는 이름으로 불필요한 복잡도를 추가하는 패턴을 명시적으로 배제한다.

- 모든 스택 공통 금지: DI 프레임워크, 커스텀 에러 핸들링 미들웨어 체인, API 문서 도구(FastAPI 내장 제외), 환경변수 검증 전용 라이브러리(언어 내장 기능 사용)
- 스택별 금지 사항은 Principle II에 명시된 항목을 따른다
- Out of Scope (v1): Auth, Redis, GraphQL, gRPC, Message Queue, Monitoring 스택, Mobile, Desktop, NoSQL, 다중 프론트엔드 프레임워크
- 금지 패턴 위반 시 해당 코드를 제거하고 이유를 문서화해야 한다

## Stack-Specific Technology Constraints

각 스택의 기술 스택은 PRD Section 6과 TRD Section 3에 정의된 범위로 제한한다.

| Stack | Framework | ORM | Entry Point | Docker Base |
|-------|-----------|-----|-------------|-------------|
| Go | Gin | GORM | `cmd/server/main.go` | `golang:1.22-alpine` → `alpine:3.19` |
| Rust | Actix-web 4 | SQLx | `src/main.rs` | `rust:1.75` → `debian:bookworm-slim` |
| Java | Spring Boot 3.3 | JPA (Hibernate) | `Application.java` | `temurin:21-jdk-alpine` → `21-jre-alpine` |
| Node | Express 5 | Prisma | `src/index.ts` | `node:22-alpine` |
| Python | FastAPI | SQLAlchemy 2.0 (async) | `src/main.py` | `python:3.12-slim` |

- 위 표에 없는 프레임워크/라이브러리 도입은 사용자 승인 없이 금지
- 프론트엔드: React 19 + Vite 6 + TypeScript (모든 스택 동일, 각 스택 디렉토리에 복사)
- 포트 규격: Backend 8080, Frontend 3000 (dev 5173 / prod 80), PostgreSQL 5433, MySQL 3307

## Validation & CI Workflow

### 구현 전 명세 확인

새로운 스택이나 기능 구현 시 반드시 아래 문서를 먼저 확인한다.

- API 구현 → `docs/PRD.md` Section 5.1 (API Spec)
- DB 설정 → `docs/TRD.md` Section 2 (Database Architecture)
- Docker 구성 → `docs/TRD.md` Section 2.3 (docker-compose), `docs/PRD.md` Section 5.4
- 스택별 구조 → `docs/TRD.md` Section 3 (Stack Implementation Details)

### Validation Checkpoints

- `make validate`: 4개 엔드포인트 응답 검증 + `db_connected` 확인
- CI (GitHub Actions): 5 stacks x 3 DBs = 15개 조합 매트릭스 검증
- 모든 스택에서 `make validate` 100% 통과 MUST

### 커밋 전 확인

- 빌드 성공 확인
- 문법 검사 에러 없음
- 환경 설정 파일(`.env`) 미포함 확인
- 명세 문서(PRD/TRD)와의 일치 확인

## Governance

- 이 Constitution은 프로젝트의 모든 구현 결정에 우선한다
- 원칙 수정 시: 변경 사유 문서화 → 사용자 승인 → PRD/TRD 동기화 → Constitution 버전 업데이트
- Constitution 위반이 발견되면 즉시 수정하고, 원인을 분석하여 재발 방지 조치를 문서화한다
- 참조 문서: `docs/PRD.md` (제품 요구사항), `docs/TRD.md` (기술 요구사항), `CLAUDE.md` (개발 가이드)
- 버전 정책: MAJOR (원칙 삭제/재정의), MINOR (원칙 추가/확장), PATCH (문구 수정/명확화)

**Version**: 1.0.0 | **Ratified**: 2026-02-28 | **Last Amended**: 2026-02-28
