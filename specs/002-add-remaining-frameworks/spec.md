# Feature Specification: 나머지 프레임워크 스택 추가

**Feature Branch**: `002-add-remaining-frameworks`
**Created**: 2026-02-28
**Status**: Draft
**Input**: User description: "이제 남은 언어별 프레임워크 작업들을 분석해서 스펙을 정리해"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Python 추가 프레임워크 (Django, Flask) (Priority: P1)

Brewnet CLI 사용자가 Python 언어를 선택한 후, FastAPI 외에 Django 또는 Flask 프레임워크를 선택하면 해당 프레임워크의 fullstack 보일러플레이트가 제공된다.

**Why this priority**: Python은 가장 넓은 사용자층을 보유하며, Django와 Flask는 FastAPI 다음으로 높은 수요를 가진다. 기존 python-fastapi 패턴을 재사용할 수 있어 투입 대비 효과가 크다.

**Independent Test**: `cd stacks/python-django && make dev` 실행 후 4개 API 엔드포인트 응답 확인, `db_connected: true` 검증으로 독립 테스트 가능

**Acceptance Scenarios**:

1. **Given** `stacks/python-django/` 디렉토리가 존재, **When** `cp .env.example .env && make dev` 실행, **Then** backend(8080), frontend(3000), postgres(5433) 서비스가 healthy 상태로 기동
2. **Given** python-django 스택이 실행 중, **When** `GET /` 호출, **Then** `{"service": "django-backend", "status": "running", "message": "☕ Brewnet says hello!"}` 응답
3. **Given** python-django 스택이 실행 중, **When** `GET /api/hello` 호출, **Then** `{"message": "Hello from Django!", "lang": "python", "version": "..."}` 응답
4. **Given** python-django 스택이 실행 중, **When** `GET /health` 호출, **Then** `{"status": "ok", "timestamp": "...", "db_connected": true}` 응답
5. **Given** python-django의 `.env`에서 `DB_DRIVER=mysql`로 변경, **When** `make dev` 실행, **Then** MySQL 연결로 정상 동작
6. **Given** `stacks/python-flask/` 디렉토리, **When** 동일한 시나리오 1~5 수행, **Then** `flask-backend`, `Hello from Flask!` 응답

---

### User Story 2 — Go 추가 프레임워크 (Echo, Fiber) (Priority: P2)

사용자가 Go 언어를 선택한 후 Echo 또는 Fiber 프레임워크를 선택하면 해당 보일러플레이트가 제공된다.

**Why this priority**: Go는 클라우드 네이티브 시장에서 높은 점유율을 가지며, Echo와 Fiber는 Gin의 대안으로 자주 사용된다. 기존 go-gin 패턴을 재사용할 수 있다.

**Independent Test**: `cd stacks/go-echo && make dev` 실행 후 4개 API 엔드포인트 + Multi-DB 전환 검증

**Acceptance Scenarios**:

1. **Given** `stacks/go-echo/` 존재, **When** `cp .env.example .env && make dev`, **Then** 4개 엔드포인트 정상 응답 (`echo-backend`, `Hello from Echo!`)
2. **Given** `stacks/go-fiber/` 존재, **When** 동일 시나리오, **Then** `fiber-backend`, `Hello from Fiber!` 응답
3. **Given** go-echo 스택, **When** `DB_DRIVER=sqlite3`로 변경 후 `make dev`, **Then** SQLite3로 정상 동작, `db_connected: true`

---

### User Story 3 — Rust 추가 프레임워크 (Axum) (Priority: P3)

사용자가 Rust를 선택한 후 Axum 프레임워크를 선택하면 해당 보일러플레이트가 제공된다.

**Why this priority**: Axum은 Tokio 팀이 개발한 모던 프레임워크로 Actix-web의 주요 대안이다. Rust 생태계에서 빠르게 성장 중이다.

**Independent Test**: `cd stacks/rust-axum && make dev` 실행 후 4개 API 엔드포인트 검증

**Acceptance Scenarios**:

1. **Given** `stacks/rust-axum/` 존재, **When** `cp .env.example .env && make dev`, **Then** `axum-backend`, `Hello from Axum!` 응답
2. **Given** rust-axum 스택, **When** `GET /health`, **Then** `db_connected` 필드 포함 응답
3. **Given** rust-axum 스택, **When** `POST /api/echo` + JSON body, **Then** 동일 JSON 반환

---

### User Story 4 — Node.js 추가 프레임워크 (NestJS, Next.js) (Priority: P4)

사용자가 Node.js를 선택한 후 NestJS 또는 Next.js 프레임워크를 선택하면 해당 보일러플레이트가 제공된다.

**Why this priority**: NestJS와 Next.js는 엔터프라이즈/풀스택 시장에서 높은 수요가 있지만, 기존 Express 패턴과 구조가 크게 달라 구현 복잡도가 높다. Next.js는 프론트엔드와 백엔드가 통합된 구조이므로 별도 설계가 필요하다.

**Independent Test**: `cd stacks/nodejs-nestjs && make dev` 실행 후 4개 API 엔드포인트 검증

**Acceptance Scenarios**:

1. **Given** `stacks/nodejs-nestjs/` 존재, **When** `make dev`, **Then** `nestjs-backend`, `Hello from NestJS!` 응답
2. **Given** `stacks/nodejs-nextjs/` 존재, **When** `make dev`, **Then** `nextjs-backend`, `Hello from Next.js!` 응답
3. **Given** nodejs-nextjs 스택, **When** 브라우저에서 `localhost:3000` 접속, **Then** Next.js App Router 기반 프론트엔드에서 `/api/hello` 응답을 표시 (별도 frontend 컨테이너 없이 단일 서비스)

---

### User Story 5 — Java 추가 프레임워크 (Spring Framework) (Priority: P5)

사용자가 Java를 선택한 후 Spring Framework(non-Boot)를 선택하면 해당 보일러플레이트가 제공된다.

**Why this priority**: Spring Framework는 Spring Boot보다 세밀한 제어가 필요한 고급 사용자를 위한 옵션이다. Spring Boot와 구조가 유사하나 자동 설정 없이 직접 설정이 필요하다.

**Independent Test**: `cd stacks/java-spring && make dev` 실행 후 4개 API 엔드포인트 검증

**Acceptance Scenarios**:

1. **Given** `stacks/java-spring/` 존재, **When** `make dev`, **Then** `spring-backend`, `Hello from Spring Framework!` 응답
2. **Given** java-spring 스택, **When** `GET /health`, **Then** `db_connected: true` (PostgreSQL)
3. **Given** java-spring 스택, **When** `DB_DRIVER=mysql` 변경 후 `make dev`, **Then** MySQL 연결 정상

---

### User Story 6 — Kotlin 신규 언어 + 프레임워크 (Ktor, Spring Boot Kotlin) (Priority: P6)

Kotlin은 현재 Brewnet에 없는 신규 언어이다. 사용자가 Kotlin을 선택한 후 Ktor 또는 Spring Boot (Kotlin DSL)을 선택하면 해당 보일러플레이트가 제공된다.

**Why this priority**: Kotlin은 완전히 새로운 언어 추가이므로 빌드 파이프라인, Docker 이미지, 의존성 관리 등 기반 작업이 필요하다. JVM 기반이므로 Java 스택의 패턴을 부분적으로 재사용할 수 있다.

**Independent Test**: `cd stacks/kotlin-ktor && make dev` 실행 후 4개 API 엔드포인트 + Multi-DB 검증

**Acceptance Scenarios**:

1. **Given** `stacks/kotlin-ktor/` 존재, **When** `make dev`, **Then** `ktor-backend`, `Hello from Ktor!` 응답
2. **Given** `stacks/kotlin-springboot/` 존재, **When** `make dev`, **Then** `springboot-kt-backend`, `Hello from Spring Boot (Kotlin)!` 응답
3. **Given** kotlin-ktor 스택, **When** Multi-DB 전환(postgres/mysql/sqlite3), **Then** 각 DB 드라이버로 정상 동작

---

### User Story 7 — 프론트엔드 추가 옵션 (Vue.js, SvelteKit, None) (Priority: P7)

기존 React 프론트엔드 외에 Vue.js, SvelteKit, API-only(프론트엔드 없음) 옵션을 제공한다. 각 프론트엔드는 모든 백엔드 프레임워크와 조합 가능해야 한다.

**Why this priority**: 프론트엔드 추가는 백엔드 프레임워크 추가와 독립적으로 작업 가능하며, 범용 템플릿이므로 한번 만들면 모든 스택에 적용된다. 다만 우선순위는 백엔드 완성 후가 적절하다.

**Independent Test**: 임의의 백엔드 스택 + Vue.js 프론트엔드 조합으로 `make dev` 실행 후 프론트엔드에서 `/api/hello` 응답 표시 확인

**Acceptance Scenarios**:

1. **Given** 임의의 백엔드 스택 + Vue.js 프론트엔드, **When** `make dev`, **Then** Vue 3 기반 프론트엔드가 `/api/hello` 호출 후 결과 표시
2. **Given** 임의의 백엔드 스택 + SvelteKit 프론트엔드, **When** `make dev`, **Then** SvelteKit 기반 프론트엔드가 동일 기능 제공
3. **Given** API-only 모드(`frontend: none`) 선택, **When** `make dev`, **Then** 백엔드만 기동, frontend 서비스 없음, docker-compose에 frontend 서비스 미포함

---

### Edge Cases

- 같은 언어 내에서 두 개 이상의 프레임워크를 동시에 기동하면 포트 충돌이 발생할 수 있다. 각 스택은 독립 디렉토리이므로 동시 실행 시 `BACKEND_PORT` 환경변수로 분리해야 한다.
- Next.js는 프론트엔드+백엔드 통합 구조이므로 별도 frontend 디렉토리/서비스가 없을 수 있다. docker-compose.yml 구조가 다른 스택과 다를 수 있다.
- Kotlin Spring Boot와 Java Spring Boot는 서로 다른 스택이지만 JVM 기반으로 베이스 이미지를 공유한다.
- Fiber 프레임워크는 `fasthttp` 기반으로 `net/http` 호환이 아니므로 미들웨어 패턴이 다르다.
- Spring Framework(non-Boot)는 WAR 패키징 또는 임베디드 서버 직접 구성이 필요하다.
- SQLite3 + Go 프레임워크(Echo, Fiber)는 CGO_ENABLED=1이 필요하다.
- Frontend `none` 선택 시 docker-compose.yml에서 frontend 서비스와 관련 depends_on을 제거해야 한다.

## Requirements *(mandatory)*

### Functional Requirements

**공통 요구사항 (모든 신규 스택에 적용)**

- **FR-001**: 각 신규 스택은 `stacks/{lang}-{framework}/` 디렉토리 구조를 따라야 한다
- **FR-002**: 각 신규 스택은 동일한 4개 API 엔드포인트를 구현해야 한다 (`GET /`, `GET /health`, `GET /api/hello`, `POST /api/echo`)
- **FR-003**: `GET /` 응답의 `service` 필드는 `{framework}-backend` 형식이어야 한다
- **FR-004**: `GET /api/hello` 응답의 `message` 필드는 `Hello from {Framework}!` 형식이어야 한다
- **FR-005**: `GET /health` 응답은 `db_connected` 필드를 포함해야 한다
- **FR-006**: 각 스택은 Multi-DB를 지원해야 한다 (PostgreSQL, MySQL, SQLite3), `DB_DRIVER` 환경변수로 전환
- **FR-007**: 각 스택은 `docker-compose.yml`에 postgres/mysql 프로파일과 `depends_on.required: false`를 포함해야 한다
- **FR-008**: 각 스택의 Dockerfile은 멀티 스테이지 빌드, non-root 사용자, HEALTHCHECK를 포함해야 한다
- **FR-009**: 각 스택은 8개 Makefile 타겟을 제공해야 한다 (dev, build, up, down, logs, test, clean, validate)
- **FR-010**: 각 스택은 `.env.example`, `README.md`(영어+한국어)를 포함해야 한다
- **FR-011**: Docker labels는 `com.brewnet.stack={lang}-{framework}` 형식이어야 한다
- **FR-012**: CORS 설정은 `localhost:3000` origin을 허용해야 한다

**프레임워크별 요구사항**

- **FR-013**: python-django는 Django ORM으로 DB 연결을 관리해야 한다
- **FR-014**: python-flask는 SQLAlchemy(동기)로 DB 연결을 관리해야 한다
- **FR-015**: go-echo는 Echo의 라우팅/미들웨어 패턴을 사용해야 한다
- **FR-016**: go-fiber는 Fiber v3의 fasthttp 기반 라우팅을 사용해야 한다
- **FR-017**: rust-axum은 Tower 미들웨어와 Axum의 라우팅 시스템을 사용해야 한다
- **FR-018**: nodejs-nestjs는 NestJS의 Module/Controller/Service 패턴을 사용해야 한다
- **FR-019**: nodejs-nextjs는 App Router의 Route Handlers로 API를 제공해야 한다
- **FR-020**: nodejs-nextjs는 프론트엔드와 백엔드가 단일 서비스로 통합되어야 한다
- **FR-021**: java-spring은 Spring Framework의 수동 DI/MVC 설정을 사용해야 한다
- **FR-022**: kotlin-ktor는 Ktor의 플러그인 아키텍처와 코루틴 기반 비동기를 사용해야 한다
- **FR-023**: kotlin-springboot는 Kotlin DSL과 Spring Boot 자동 설정을 사용해야 한다

**프론트엔드 요구사항**

- **FR-024**: Vue.js 프론트엔드 템플릿은 Vue 3 + Vite + TypeScript로 구성해야 한다
- **FR-025**: SvelteKit 프론트엔드 템플릿은 SvelteKit + Vite + TypeScript로 구성해야 한다
- **FR-026**: 모든 프론트엔드 템플릿은 `GET /api/hello` 호출 후 결과를 화면에 표시해야 한다
- **FR-027**: API-only 모드 선택 시 docker-compose.yml에서 frontend 서비스가 제외되어야 한다
- **FR-028**: 모든 프론트엔드 템플릿은 프로덕션 빌드 시 nginx로 정적 파일 제공 + `/api` 리버스 프록시를 구성해야 한다

**문서/CI 요구사항**

- **FR-029**: 신규 스택 추가 시 CLAUDE.md, PRD.md, TRD.md의 스택 목록/테이블을 업데이트해야 한다
- **FR-030**: CI 워크플로우(validate-stacks.yml) matrix에 신규 스택을 추가해야 한다
- **FR-031**: 각 스택의 README.md는 Quick Start, API 예시, DB 전환 방법, 프로젝트 구조를 포함해야 한다

### Key Entities

- **Stack**: 하나의 `stacks/{lang}-{framework}/` 디렉토리. backend, frontend, docker-compose.yml, Makefile, .env.example, README.md로 구성
- **Framework**: 특정 언어에서 선택 가능한 웹 프레임워크. 각 프레임워크는 고유한 라우팅/미들웨어/DB 연결 패턴을 가짐
- **Frontend Template**: React, Vue.js, SvelteKit, None 중 하나. 모든 백엔드 스택과 조합 가능

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 신규 10개 백엔드 스택 모두 `make validate` 통과 (4개 엔드포인트 정상 응답)
- **SC-002**: 각 신규 스택에서 3개 DB 드라이버(PostgreSQL, MySQL, SQLite3) 모두 `db_connected: true` 확인
- **SC-003**: CI 워크플로우에서 15개 스택 x 3개 DB = 45개 조합 모두 빌드+검증 통과
- **SC-004**: 사용자가 `cp .env.example .env && make dev` 2개 명령만으로 임의의 스택을 실행할 수 있어야 한다
- **SC-005**: Vue.js, SvelteKit 프론트엔드 템플릿이 기존 React 템플릿과 동일한 기능 (hello 메시지 표시, DB 상태 표시) 제공
- **SC-006**: API-only 모드에서 frontend 서비스 없이 백엔드만 정상 기동

## Scope & Boundaries

### In Scope
- 10개 신규 백엔드 프레임워크 스택 구현
- Kotlin 언어 기반 2개 프레임워크 신규 추가
- Vue.js, SvelteKit 프론트엔드 템플릿 추가
- API-only (frontend: none) 모드 지원
- 문서 및 CI 업데이트

### Out of Scope
- Brewnet CLI 자체의 프레임워크 선택 UI 구현 (CLI는 별도 프로젝트)
- 프로덕션 배포 파이프라인 (CD)
- 인증/인가 기능
- Items CRUD 등 추가 API 엔드포인트
- 프레임워크별 성능 벤치마크
- PHP, .NET 등 목록에 없는 언어 추가

## Assumptions

- 모든 프레임워크의 최신 안정 버전이 Multi-DB(PostgreSQL, MySQL, SQLite3)를 지원한다고 가정
- Docker Desktop 또는 Docker Engine + Compose v2가 설치된 환경을 대상으로 한다
- 각 스택의 기본 포트는 8080(backend), 3000(frontend), 5433(PostgreSQL), 3307(MySQL)이다
- Next.js 스택은 프론트엔드+백엔드 통합이므로 별도 frontend 디렉토리가 없을 수 있다
- Kotlin 스택은 JVM 21 기반으로, Java 스택의 Docker 이미지 패턴을 공유한다
- 기존 5개 스택의 검증된 패턴(Makefile, docker-compose.yml, .env.example 구조)을 최대한 재사용한다

## Dependencies

- 기존 5개 스택(python-fastapi, nodejs-express, go-gin, rust-actix-web, java-springboot)의 패턴이 안정적이어야 한다
- BREWNET-USER-STORY.md에 정의된 프레임워크 버전 및 라이선스 정보
- 각 프레임워크의 공식 Docker 이미지 가용성
