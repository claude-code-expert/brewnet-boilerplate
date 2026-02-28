# Research: Brewnet 5-Stack Implementation

**Phase**: 0 (Outline & Research)
**Date**: 2026-02-28

## 1. 기술 스택 결정 (TRD에서 확정)

TRD Section 3에 모든 기술 결정이 완료되어 있으므로 추가 리서치 불필요. 아래는 확정된 결정 사항 요약.

### 1.1 Backend Frameworks

| Stack | Decision | Rationale | Alternatives Rejected |
|-------|----------|-----------|----------------------|
| Node | Express 5 + Prisma | 최소 설정, TypeScript 지원, 빠른 빌드 | NestJS (과도한 구조), Fastify (사용자층 좁음) |
| Python | FastAPI + SQLAlchemy 2.0 (async) | async 네이티브, Pydantic 통합 | Django (과도한 구조), Flask (SQLAlchemy 통합 미비) |
| Go | Gin + GORM | 가장 널리 사용되는 Go 웹 프레임워크 + ORM | Echo (커뮤니티 규모), Fiber (호환성 이슈) |
| Rust | Actix-web 4 + SQLx | 성능 우수, compile-time query 검증 | Axum (상대적으로 신규), Diesel (compile-time 복잡도) |
| Java | Spring Boot 3.3 + JPA | 엔터프라이즈 표준, Gradle Kotlin DSL | Quarkus (사용자층 좁음), Maven (설정 장황) |

### 1.2 Database Strategy

- **Decision**: Config-Driven Multi-DB (PostgreSQL + MySQL + SQLite3)
- **Rationale**: `.env` 파일의 `DB_DRIVER` 값 하나로 전환. 사용자가 선호하는 DB를 즉시 사용 가능
- **Alternatives Rejected**: 단일 DB(PostgreSQL only) — 사용자 선택지 제한

### 1.3 Frontend Strategy

- **Decision**: React 19 + Vite 6 + TypeScript, 각 스택에 동일 복사본
- **Rationale**: 스택 분리 시 독립 동작 보장. shared/ 참조 방식은 스택을 떼어낼 때 깨짐
- **Alternatives Rejected**: shared/frontend/ (참조 깨짐), Vue/Svelte (React이 가장 넓은 사용자층)

### 1.4 Docker Compose DB Profile

- **Decision**: docker-compose profiles + `depends_on.required: false`
- **Rationale**: 단일 compose 파일로 3종 DB 관리. SQLite3는 외부 컨테이너 불필요
- **Alternatives Rejected**: 별도 compose 파일 (docker-compose.postgres.yml 등) — 관리 복잡

### 1.5 Makefile DB_DRIVER 연동

- **Decision**: `.env`에서 `DB_DRIVER` 읽어 `COMPOSE_PROFILES` 자동 설정
- **Rationale**: 사용자가 `.env`만 수정하면 `make dev`로 바로 전환
- **Alternatives Rejected**: 수동 profile 지정 (`make dev PROFILE=mysql`) — UX 복잡

## 2. 구현 순서 결정

- **Decision**: Node → Python → Go → Rust → Java
- **Rationale**: PRD Phase 2-4 타임라인 기반. 인터프리터 언어(빠른 빌드)를 먼저 구현하여 패턴 확립 후 컴파일 언어로 확장
- **Alternatives Rejected**: 알파벳 순서 (빌드 시간 고려 없음), 동시 구현 (패턴 불일치 위험)

## 3. 공통 인프라 선행 구축

- **Decision**: 첫 번째 스택(Node) 구현 시 공통 인프라를 함께 구축
  - `shared/scripts/validate.sh` — 4개 엔드포인트 + db_connected 검증
  - Frontend 템플릿 (React 19 + Vite 6 + TypeScript)
  - docker-compose.yml 템플릿 (3종 DB profiles)
  - Makefile 템플릿 (8개 타겟 + DB_DRIVER 연동)
  - .env.example 템플릿
  - README.md 템플릿
- **Rationale**: 첫 스택에서 전체 패턴을 검증한 후 나머지 스택에 복제
- **Alternatives Rejected**: 별도 infra phase — 실제 스택 없이 검증 불가

## 4. README.md 구조

- **Decision**: 영어 + 한국어 병기. 아래 섹션 포함:
  1. Stack 소개 (What's included)
  2. Quick Start (Prerequisites → `.env` → `make dev` → 접속)
  3. API Endpoints (테이블 + curl 예시)
  4. Database Switching (DB_DRIVER 변경 + 재기동)
  5. Project Structure (디렉토리 트리)
  6. Makefile Targets (8개 타겟 설명)
  7. Validation (make validate)
- **Rationale**: PRD FR-018, FR-019 요구사항 충족. curl 예시로 즉시 검증 가능
- **Alternatives Rejected**: 한국어 단독 (글로벌 사용 제한), 영어 단독 (한국어 사용자 편의 부족)

## 5. CI Pipeline

- **Decision**: GitHub Actions matrix (5 stacks × 3 DBs = 15 jobs)
- **Rationale**: TRD Section 6.1에 정의. 모든 조합의 빌드 + 기동 + validate 검증
- **Alternatives Rejected**: 스택별 개별 workflow (중복), DB matrix 없이 PostgreSQL만 (검증 불충분)
