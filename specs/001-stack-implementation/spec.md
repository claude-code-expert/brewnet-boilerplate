# Feature Specification: Brewnet 5-Stack Implementation

**Feature Branch**: `001-stack-implementation`
**Created**: 2026-02-28
**Status**: Draft
**Input**: PRD/TRD 분석 기반 전체 5개 언어 스택 구현 + 스택별 README.md 가이드

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Node.js 스택 + 공통 인프라 구축 (Priority: P1)

개발자가 `cd stacks/node && make dev`를 실행하면 Node.js(Express + Prisma) 백엔드 + React 프론트엔드 + PostgreSQL이 Docker Compose로 기동되고, `http://localhost:3000`에서 "Hello from Node!" 메시지를 확인할 수 있다. README.md에 실행 방법과 검증 URL이 안내되어 있다.

**Why this priority**: 첫 번째 스택이 전체 보일러플레이트 패턴(docker-compose, Makefile, validate.sh, frontend)의 기준점을 확립한다. Node.js는 빌드가 가장 빠르므로 검증 사이클이 짧다.

**Independent Test**: `cd stacks/node && make dev` 후 4개 API 엔드포인트 호출과 프론트엔드 접속으로 완전히 검증 가능하다.

**Acceptance Scenarios**:

1. **Given** stacks/node/ 디렉토리에 모든 파일이 존재, **When** `cp .env.example .env && make dev` 실행, **Then** backend(8080), frontend(3000), postgres(5433) 세 서비스가 healthy 상태로 기동
2. **Given** 서비스가 실행 중, **When** `GET /api/hello` 호출, **Then** `{"message":"Hello from Node!","lang":"node","version":"..."}` 응답
3. **Given** 서비스가 실행 중, **When** `GET /health` 호출, **Then** `{"status":"ok","timestamp":"...","db_connected":true}` 응답
4. **Given** 서비스가 실행 중, **When** `POST /api/echo` with `{"test":"brewnet"}` 호출, **Then** 동일한 body 반환
5. **Given** 서비스가 실행 중, **When** 브라우저에서 `http://localhost:3000` 접속, **Then** "Hello from Node!" 메시지와 DB 연결 상태 표시
6. **Given** `.env`에서 `DB_DRIVER=mysql`로 변경, **When** `make down && make dev` 실행, **Then** MySQL로 전환되어 동일하게 동작
7. **Given** `.env`에서 `DB_DRIVER=sqlite3`로 변경, **When** `make down && make dev` 실행, **Then** SQLite3로 전환되어 동일하게 동작 (DB 컨테이너 없이)
8. **Given** 서비스가 실행 중, **When** `make validate` 실행, **Then** 모든 체크가 통과

---

### User Story 2 - Python 스택 구현 (Priority: P2)

개발자가 `cd stacks/python && make dev`를 실행하면 Python(FastAPI + SQLAlchemy) 백엔드 + React 프론트엔드 + PostgreSQL이 기동되고, 동일한 4개 API와 프론트엔드가 동작한다.

**Why this priority**: Python은 Node.js 다음으로 빠르게 검증할 수 있는 스택이며, 패턴 재현성을 확인하는 두 번째 구현이다.

**Independent Test**: `cd stacks/python && make dev` 후 4개 API + 프론트엔드 + 3종 DB 전환 검증.

**Acceptance Scenarios**:

1. **Given** stacks/python/ 구성 완료, **When** `make dev` 실행, **Then** FastAPI 백엔드가 8080에서 동작
2. **Given** 서비스 실행 중, **When** 4개 엔드포인트 호출, **Then** PRD API 스펙과 동일한 응답
3. **Given** DB_DRIVER 변경, **When** 재기동, **Then** 3종 DB 모두 정상 동작
4. **Given** `make validate` 실행, **Then** 모든 체크 통과

---

### User Story 3 - Go 스택 구현 (Priority: P3)

개발자가 `cd stacks/go && make dev`를 실행하면 Go(Gin + GORM) 백엔드 + React 프론트엔드 + PostgreSQL이 기동된다.

**Why this priority**: 컴파일 언어 중 빌드 속도가 가장 빠른 Go를 먼저 구현한다.

**Independent Test**: `cd stacks/go && make dev` 후 4개 API + 프론트엔드 + 3종 DB 전환 검증.

**Acceptance Scenarios**:

1. **Given** stacks/go/ 구성 완료, **When** `make dev` 실행, **Then** Gin 백엔드가 8080에서 동작
2. **Given** 서비스 실행 중, **When** 4개 엔드포인트 호출, **Then** PRD API 스펙과 동일한 응답
3. **Given** DB_DRIVER 변경, **When** 재기동, **Then** 3종 DB 모두 정상 동작 (CGO_ENABLED=1 for SQLite)
4. **Given** `make validate` 실행, **Then** 모든 체크 통과

---

### User Story 4 - Rust 스택 구현 (Priority: P4)

개발자가 `cd stacks/rust && make dev`를 실행하면 Rust(Actix-web + SQLx) 백엔드 + React 프론트엔드 + PostgreSQL이 기동된다.

**Why this priority**: Rust는 빌드 시간이 가장 길지만, 성능이 뛰어난 스택으로 Go 다음에 구현한다.

**Independent Test**: `cd stacks/rust && make dev` 후 4개 API + 프론트엔드 + 3종 DB 전환 검증.

**Acceptance Scenarios**:

1. **Given** stacks/rust/ 구성 완료, **When** `make dev` 실행, **Then** Actix-web 백엔드가 8080에서 동작
2. **Given** 서비스 실행 중, **When** 4개 엔드포인트 호출, **Then** PRD API 스펙과 동일한 응답
3. **Given** DB_DRIVER 변경, **When** 재기동, **Then** 3종 DB 모두 정상 동작
4. **Given** `make validate` 실행, **Then** 모든 체크 통과

---

### User Story 5 - Java 스택 구현 (Priority: P5)

개발자가 `cd stacks/java && make dev`를 실행하면 Java(Spring Boot + JPA) 백엔드 + React 프론트엔드 + PostgreSQL이 기동된다.

**Why this priority**: JVM 기반 스택으로 빌드 시간이 길어 후반부에 배치한다.

**Independent Test**: `cd stacks/java && make dev` 후 4개 API + 프론트엔드 + 3종 DB 전환 검증.

**Acceptance Scenarios**:

1. **Given** stacks/java/ 구성 완료, **When** `make dev` 실행, **Then** Spring Boot 백엔드가 8080에서 동작
2. **Given** 서비스 실행 중, **When** 4개 엔드포인트 호출, **Then** PRD API 스펙과 동일한 응답
3. **Given** DB_DRIVER 변경, **When** 재기동, **Then** 3종 DB 모두 정상 동작 (Spring profiles 활용)
4. **Given** `make validate` 실행, **Then** 모든 체크 통과

---

---

### Edge Cases

- DB 컨테이너가 아직 ready가 아닌 상태에서 백엔드가 시작되면 healthcheck 재시도로 대기
- SQLite3 모드에서 `/app/data/` 디렉토리가 없으면 자동 생성
- DB_DRIVER에 잘못된 값(e.g., "mongodb")이 들어오면 명확한 에러 메시지와 함께 서버 시작 실패
- 포트 충돌(8080, 3000이 이미 사용 중)이 발생하면 docker compose가 에러 반환
- .env.example을 .env로 복사하지 않고 실행하면 기본값(postgres)으로 동작
- POST /api/echo에 빈 body를 보내면 빈 객체 반환
- POST /api/echo에 JSON이 아닌 데이터를 보내면 그대로 반환 또는 400 에러

## Requirements *(mandatory)*

### Functional Requirements

**공통 인프라 (모든 스택에 적용)**

- **FR-001**: 각 스택은 `stacks/{lang}/` 하위에 `backend/`, `frontend/`, `docker-compose.yml`, `Makefile`, `.env.example`, `README.md`를 포함해야 한다
- **FR-002**: 모든 스택은 동일한 4개 API 엔드포인트(`/`, `/health`, `/api/hello`, `/api/echo`)를 구현해야 한다
- **FR-003**: `/health` 응답은 `db_connected` 필드를 포함하여 실제 DB 연결 상태를 반환해야 한다
- **FR-004**: `docker-compose.yml`은 DB_DRIVER 환경변수에 따라 profiles로 PostgreSQL/MySQL 서비스를 선택적으로 기동해야 한다
- **FR-005**: SQLite3 선택 시 외부 DB 컨테이너 없이 백엔드 내부 파일 DB로 동작해야 한다
- **FR-006**: Makefile은 `dev`, `build`, `up`, `down`, `logs`, `test`, `clean`, `validate` 8개 타겟을 제공해야 한다
- **FR-007**: `make validate`는 `shared/scripts/validate.sh`를 실행하여 4개 엔드포인트 + db_connected를 검증해야 한다

**프론트엔드 (각 스택에 복사)**

- **FR-008**: 프론트엔드는 React 19 + Vite 6 + TypeScript로 구성하며, 각 스택 디렉토리에 동일한 복사본을 둔다
- **FR-009**: `App.tsx`는 `GET /api/hello` 응답의 `message`를 화면에 표시해야 한다
- **FR-010**: `App.tsx`는 `GET /health` 응답의 `db_connected` 상태를 표시해야 한다
- **FR-011**: Production 빌드에서 nginx가 static 파일을 서빙하고 `/api/*`와 `/health`를 백엔드로 reverse proxy해야 한다

**Docker**

- **FR-012**: 모든 Dockerfile은 multi-stage build(builder → runner)를 사용해야 한다
- **FR-013**: 모든 컨테이너는 non-root 사용자(`appuser`)로 실행해야 한다
- **FR-014**: 모든 서비스에 HEALTHCHECK directive를 포함해야 한다
- **FR-015**: 네트워크를 `brewnet`(public)과 `brewnet-internal`(DB only, internal)로 분리해야 한다
- **FR-016**: `deploy.resources.limits`로 메모리 및 CPU 제한을 설정해야 한다
- **FR-017**: `backend/`와 `frontend/` 각각에 `.dockerignore`를 포함해야 한다

**README.md (각 스택 하위)**

- **FR-018**: 각 스택의 README.md는 다음 내용을 포함해야 한다:
  - Quick Start (실행 방법: `.env` 설정 → `make dev` → 접속 URL)
  - API 엔드포인트 목록 (Method, Path, 예상 응답, curl 예시)
  - DB 전환 가이드 (DB_DRIVER 변경 → 재기동 절차)
  - Makefile 타겟 설명
  - 프로젝트 구조 설명
  - 검증/테스트 방법 (`make validate`)
- **FR-019**: README.md는 영어로 작성하되, 한국어 설명을 병기한다

### Key Entities

- **Stack**: 언어별 보일러플레이트 단위 (go, rust, java, node, python). 각각 독립적으로 실행 가능한 fullstack 환경
- **Backend Service**: HTTP API 서버. 4개 엔드포인트를 구현하고, DB_DRIVER에 따라 적절한 DB에 연결
- **Frontend Service**: React SPA. 백엔드 API를 호출하여 결과를 표시. nginx로 프로덕션 서빙
- **Database Service**: PostgreSQL(default), MySQL, SQLite3 중 하나. docker-compose profiles로 관리
- **Makefile**: 각 스택의 통일된 CLI 인터페이스. 8개 표준 타겟 제공
- **validate.sh**: 공통 검증 스크립트. 4개 엔드포인트 + db_connected 상태 검증

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 모든 5개 스택에서 `cp .env.example .env && make dev` 실행 후 3분 이내에 `http://localhost:3000`에서 "Hello from {Lang}!" 메시지 확인 가능 (첫 Docker build 제외)
- **SC-002**: 모든 5개 스택에서 Docker build가 캐시 없는 상태에서 5분 이내에 완료
- **SC-003**: 모든 5개 스택에서 `make validate`가 100% 통과
- **SC-004**: 모든 5개 스택에서 3종 DB(PostgreSQL, MySQL, SQLite3) 전환이 `.env` 수정 + `docker compose down && docker compose up -d`로 30초 이내에 완료
- **SC-005**: 각 스택의 백엔드 코드가 테스트 제외 200줄 이내
- **SC-006**: 각 스택의 README.md에 따라 처음 접하는 개발자가 5분 이내에 스택을 기동하고 API를 검증 가능
- **SC-007**: CI에서 5 stacks x 3 DBs = 15개 조합이 모두 통과

### Assumptions

- Docker 및 Docker Compose v2가 호스트에 설치되어 있다
- 포트 8080, 3000, 5433, 3307이 호스트에서 사용 가능하다
- 인터넷 연결이 가능하여 Docker 이미지 pull이 가능하다
- 각 스택의 프론트엔드는 동일한 React 코드를 복사하여 사용한다
