# Research: 나머지 프레임워크 스택 추가

**Date**: 2026-02-28
**Branch**: `002-add-remaining-frameworks`

## 1. 버전 결정

| Framework | BREWNET-USER-STORY 명시 버전 | 조사된 최신 안정 버전 | 결정 | 근거 |
|-----------|---------------------------|---------------------|------|------|
| Django | 6.0.x | 6.0.2 | 6.0.x | 일치 |
| Flask | 3.1.x | 3.1.2 | 3.1.x | 일치 |
| Echo | 4.x | 4.13.4 | 4.x | 일치 |
| Fiber | 3.x | 3.0.0 | 3.x | 일치, Go 1.25+ 필요 |
| Axum | 0.8.x | 0.8.8 | 0.8.x | 일치 |
| NestJS | 11.x | 11.1.14 | 11.x | 일치 |
| Next.js | 15.x | 16.1.6 LTS | **15.x** | USER-STORY 명시 버전 준수. 15.5.x는 안정적이며 App Router 완성 |
| Spring Framework | 7.0.x | 7.0.3 | 7.0.x | 일치 |
| Ktor | 3.4.x | 3.4.0 | 3.4.x | 일치 |
| Spring Boot (Kotlin) | 4.0.x | 4.0.3 | 4.0.x | 일치 |

## 2. 프레임워크별 기술 결정

### 2.1 Python — Django

- **Decision**: Django ORM(built-in) + `JsonResponse` (DRF 불필요)
- **Rationale**: 4개 엔드포인트에 DRF는 과잉. `JsonResponse`로 충분
- **DB 드라이버**: `psycopg2-binary`(PostgreSQL), `mysqlclient`(MySQL), built-in SQLite3
- **서버**: `gunicorn` + `config/wsgi.py`
- **구조**: `src/config/` (settings, urls, wsgi) + `src/api/` (views, urls)
- **Docker**: `python:3.13-slim` → `python:3.13-slim` (venv 복사)

### 2.2 Python — Flask

- **Decision**: Flask-SQLAlchemy 3.1 (동기 ORM)
- **Rationale**: Flask의 표준 ORM 통합. 비동기 불필요 (4개 간단한 엔드포인트)
- **DB 드라이버**: `psycopg2-binary`, `pymysql`(pure Python, C dep 회피), built-in SQLite3
- **서버**: `gunicorn` + app factory (`create_app()`)
- **구조**: `src/__init__.py`(factory), `src/routes.py`, `src/database.py`, `src/config.py`
- **Docker**: 동일 (`python:3.13-slim`)

### 2.3 Go — Echo

- **Decision**: Echo v4 + GORM (go-gin과 동일 ORM)
- **Rationale**: GORM 재사용으로 DB 연결 코드 최소화. Echo는 `net/http` 호환이므로 표준 미들웨어 사용 가능
- **구조**: go-gin과 동일 (`cmd/server/main.go`, `internal/handler/`, `internal/database/`)
- **Docker**: `golang:1.24-alpine` → `alpine:3.21` (CGO_ENABLED=1 for SQLite)

### 2.4 Go — Fiber

- **Decision**: Fiber v3 + GORM
- **Rationale**: Fiber v3는 Go 1.25+ 필요. fasthttp 기반이므로 `net/http` 미들웨어 비호환 주의
- **주의사항**: `*fiber.Ctx`는 풀링됨 — goroutine 간 참조 금지. Request/Response가 `io.Reader/Writer` 아님
- **구조**: go-gin/echo와 동일 구조이나 핸들러 시그니처가 `fiber.Ctx` 기반
- **Docker**: `golang:1.25-alpine` → `alpine:3.21` (Go 1.25+ 필수)

### 2.5 Rust — Axum

- **Decision**: Axum 0.8 + SQLx(AnyPool) + tower-http(CORS)
- **Rationale**: rust-actix-web과 동일 DB 레이어(SQLx) 재사용. Tower 미들웨어 호환은 Axum의 강점
- **구조**: `src/main.rs`, `src/handler.rs`, `src/database.rs` (rust-actix-web과 동일 패턴)
- **Docker**: `rust:1.88` → `debian:bookworm-slim` (rust-actix-web과 동일)

### 2.6 Node.js — NestJS

- **Decision**: NestJS 11 + Prisma (nodejs-express와 동일 ORM)
- **Rationale**: Prisma 재사용으로 DB 전환 패턴 동일. NestJS의 DI는 프레임워크 본질이므로 Constitution VI 예외
- **Multi-DB**: nodejs-express와 동일한 Prisma + `sed` 치환 방식
- **구조**: `src/main.ts`, `src/app.module.ts`, `src/app.controller.ts`, `src/app.service.ts`, `src/prisma/prisma.service.ts`
- **Docker**: `node:22-alpine` (3-stage: deps → build → run)

### 2.7 Node.js — Next.js

- **Decision**: Next.js 15 + Prisma, App Router Route Handlers. 프론트엔드+백엔드 통합 단일 서비스
- **Rationale**: Next.js는 본질적으로 풀스택. 별도 frontend 디렉토리 없이 단일 컨테이너
- **docker-compose 구조**: backend 서비스 1개만 (frontend 서비스 없음). 포트 3000 직접 노출
- **구조**: `src/app/page.tsx`, `src/app/api/hello/route.ts`, `src/app/api/echo/route.ts`, `src/app/health/route.ts`, `src/lib/db.ts`
- **Docker**: `node:22-alpine`, `output: 'standalone'` 모드로 최적화

### 2.8 Java — Spring Framework

- **Decision**: Spring Framework 7.0 + 내장 Tomcat(programmatic) + JDBC + HikariCP
- **Rationale**: Spring Boot 없이 수동 DI/MVC. Application.java에서 Tomcat embed 직접 설정
- **주의사항**: 200줄 제한이 도전적. DispatcherServlet 수동 등록 + DataSource 수동 구성 필요
- **구조**: `src/main/java/.../Application.java`, `controller/ApiController.java`, `config/WebConfig.java`, `config/DataSourceConfig.java`
- **Docker**: `eclipse-temurin:21-jdk` → `eclipse-temurin:21-jre-alpine` (builder에 Debian 사용 — Alpine SIGSEGV 이슈)
- **빌드**: Maven shade plugin으로 uber-JAR 생성

### 2.9 Kotlin — Ktor

- **Decision**: Ktor 3.4 + Exposed ORM + Netty 엔진
- **Rationale**: JetBrains 공식 프레임워크. Exposed ORM은 Kotlin 네이티브 DSL
- **DB 드라이버**: PostgreSQL(`postgresql`), MySQL(`mysql-connector-j`), SQLite(`sqlite-jdbc`) — Java와 동일
- **구조**: `src/main/kotlin/.../Application.kt`, `plugins/Routing.kt`, `plugins/Database.kt`, `plugins/Serialization.kt`
- **Docker**: `eclipse-temurin:21-jdk` → `eclipse-temurin:21-jre-alpine` (fat JAR via Ktor plugin)

### 2.10 Kotlin — Spring Boot

- **Decision**: Spring Boot 4.0 + Kotlin DSL + Spring Data JPA
- **Rationale**: Java Spring Boot와 동일 패턴이나 Kotlin 문법. `kotlin("plugin.spring")` 필요
- **구조**: java-springboot와 동일하나 `.kt` 확장자. data class 활용
- **Docker**: java-springboot와 동일

## 3. BREWNET-USER-STORY.md 교차 검증

| USER-STORY 항목 | spec.md 포함 여부 | 비고 |
|----------------|-----------------|------|
| Python: FastAPI/Django/Flask | ✅ (US1) | FastAPI는 기존 구현 |
| Node.js: Next.js/Express/NestJS | ✅ (US4) | Express는 기존 구현 |
| Java: Spring/Spring Boot | ✅ (US5) | Spring Boot는 기존 구현 |
| Kotlin: Ktor/Spring Boot (Kotlin) | ✅ (US6) | 신규 언어 |
| Rust: Axum/Actix-web | ✅ (US3) | Actix-web은 기존 구현 |
| Go: Gin/Echo/Fiber | ✅ (US2) | Gin은 기존 구현 |
| Frontend: React/Vue/Svelte/None | ✅ (US7) | React는 기존 구현 |
| 기본 포트 8080 | ✅ (FR-008, Assumptions) | |
| `DB_DRIVER` 환경변수 | ✅ (FR-006) | |
| Multi-DB (Pg/MySQL/SQLite3) | ✅ (FR-006) | |
| Docker labels `com.brewnet.stack` | ✅ (FR-011) | |
| Makefile 8개 타겟 | ✅ (FR-009) | |

**누락 사항**: 없음. BREWNET-USER-STORY.md의 모든 프레임워크, 프론트엔드 옵션, 인프라 요구사항이 spec.md에 반영됨.

## 4. 기존 패턴 재사용 매핑

| 신규 스택 | 기반 스택 | 재사용 범위 |
|-----------|----------|-----------|
| python-django | python-fastapi | Dockerfile 패턴, docker-compose.yml, Makefile, .env.example, frontend/ |
| python-flask | python-fastapi | 동일 |
| go-echo | go-gin | DB 연결(GORM), Dockerfile, docker-compose.yml, Makefile, frontend/ |
| go-fiber | go-gin | GORM 재사용, Dockerfile 패턴 (단 Go 1.25+ 필요) |
| rust-axum | rust-actix-web | SQLx(AnyPool), Dockerfile, docker-compose.yml, Makefile, frontend/ |
| nodejs-nestjs | nodejs-express | Prisma, Dockerfile 패턴, docker-compose.yml, Makefile, frontend/ |
| nodejs-nextjs | nodejs-express | Prisma (구조는 완전히 다름 — 단일 서비스) |
| java-spring | java-springboot | JDBC/HikariCP, Dockerfile 패턴 (빌드 도구만 Maven으로 변경) |
| kotlin-ktor | java-springboot | Dockerfile/Docker 이미지 패턴, docker-compose.yml, Makefile |
| kotlin-springboot | java-springboot | 거의 동일 (Kotlin DSL 래퍼) |
