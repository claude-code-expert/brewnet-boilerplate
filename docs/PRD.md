# Brewnet Boilerplate — Product Requirements Document (PRD)

> **Brewnet** — Your server on tap. Just brew it.
> **Site**: brewnet.dev
> **Contact**: brewnet.dev@gmail.com
> **License**: MIT License
> **Version**: 1.0.0
> **Date**: 2026-02-28

---

## 1. Executive Summary

### 1.1 Problem

풀스택 프로젝트를 시작할 때마다 반복되는 작업이 있다. 프레임워크 초기 설정, Docker 구성, DB 연결, API 엔드포인트 작성, 프론트엔드 연동. 언어마다 베스트 프랙티스가 다르고, 검색해서 조합하면 불필요한 의존성과 과도한 추상화가 끼어든다.

### 1.2 Solution

`brewnet create-app` 명령 하나로 **즉시 실행 가능한 풀스택 모노레포**를 생성한다. Git에서 템플릿을 shallow clone하고, 선택한 스택(Go/Rust/Java/Kotlin/Node/Python × 다양한 프레임워크)과 DB(PostgreSQL/MySQL/SQLite3)에 맞는 설정 파일을 적용한 뒤, `docker compose up` 한 번으로 Hello World API 서버 + 프론트엔드(React) + DB가 동작한다.

### 1.3 Core Principles

| 원칙 | 설명 |
|------|------|
| **Zero Bloat** | 각 프레임워크의 공식 권장 구조만 사용. 불필요한 라이브러리, 미들웨어, 추상화 계층 제거 |
| **One Command** | `docker compose up` 한 번으로 백엔드 + 프론트엔드 + DB 전체 기동 |
| **Config-Driven DB** | `.env` 파일의 `DB_DRIVER` 값 하나로 PostgreSQL / MySQL / SQLite3 전환 |
| **Best Practice Only** | 각 언어 커뮤니티가 인정하는 표준 프로젝트 구조와 패턴만 적용 |
| **Immediately Runnable** | clone 후 설정 변경 없이 바로 실행 가능 |

---

## 2. Target User

### Primary: 사이드 프로젝트 시작하는 개발자

Docker는 쓸 줄 알지만 매번 boilerplate 잡는 데 반나절을 쓰는 개발자. 프레임워크별 Dockerfile 최적화, DB 드라이버 설정, CORS 처리 같은 반복 작업을 건너뛰고 싶다.

### Secondary: 새 프레임워크를 학습하는 개발자

Go 개발자가 Rust로 넘어가거나, Python 개발자가 Java를 시도할 때 해당 언어의 관용적 프로젝트 구조를 참고 코드로 활용.

### Tertiary: Brewnet 홈서버 사용자

Brewnet CLI로 홈서버를 운영 중이고, 자체 웹 앱을 올려서 배포하려는 사용자.

---

## 3. User Flow

```
brewnet create-app my-project --stack go-gin
        │
        ├─ 1. git clone (shallow) brewnet-boilerplate repo
        ├─ 2. stacks/go-gin/ → ~/.brewnet/projects/my-project/ 복사
        ├─ 3. .env.example → .env (DB_PASSWORD 등 자동 생성)
        ├─ 4. docker compose up -d
        └─ 5. http://localhost:3000 자동 오픈
             ├─ Frontend: React 페이지 → "Hello from Gin!" 표시
             ├─ Backend:  GET /api/hello → JSON 응답
             └─ Database:  PostgreSQL 연결 완료 (기본값)
```

### DB 변경 시

```bash
# .env 파일 수정
DB_DRIVER=mysql        # postgres | mysql | sqlite3

# 재기동
docker compose down && docker compose up -d
```

---

## 4. Repository Structure

```
brewnet-boilerplate/
├── stacks/
│   ├── go-gin/                      # Go (Gin + React)
│   │   ├── backend/
│   │   │   ├── cmd/server/main.go
│   │   │   ├── internal/
│   │   │   │   ├── handler/         # HTTP 핸들러
│   │   │   │   └── database/        # DB 연결 (config-driven)
│   │   │   ├── Dockerfile
│   │   │   ├── go.mod
│   │   │   └── go.sum
│   │   ├── frontend/                # React 19 + Vite 6 + TypeScript
│   │   │   ├── src/App.tsx
│   │   │   ├── Dockerfile
│   │   │   └── nginx.conf
│   │   ├── docker-compose.yml
│   │   ├── .env.example
│   │   ├── Makefile
│   │   └── README.md
│   ├── go-echo/                     # Go (Echo + React)
│   ├── go-fiber/                    # Go (Fiber + React)
│   ├── rust-actix-web/              # Rust (Actix-web + React)
│   ├── rust-axum/                   # Rust (Axum + React)
│   ├── java-springboot/             # Java (Spring Boot + React)
│   ├── java-spring/                 # Java (Spring Framework + React)
│   ├── kotlin-ktor/                 # Kotlin (Ktor + React)
│   ├── kotlin-springboot/           # Kotlin (Spring Boot + React)
│   ├── nodejs-express/              # Node.js (Express + React)
│   ├── nodejs-nestjs/               # Node.js (NestJS + React)
│   ├── nodejs-nextjs/               # Node.js (Next.js fullstack)
│   ├── python-fastapi/              # Python (FastAPI + React)
│   ├── python-django/               # Python (Django + React)
│   ├── python-flask/                # Python (Flask + React)
│   ├── frontend-template/           # Shared React 프론트엔드 템플릿
│   └── docker-compose.api-only.yml.template  # API-only 템플릿
├── shared/
│   ├── scripts/                     # healthcheck, validate 스크립트
│   └── traefik/                     # Traefik 설정 (Brewnet 연동용)
├── docs/
│   ├── PRD.md                       # Product Requirements Document
│   └── TRD.md                       # Technical Requirements Document
├── .github/workflows/
│   └── validate-stacks.yml          # CI: 전 스택 빌드 + 헬스체크
├── LICENSE                          # MIT License
└── README.md
```

---

## 5. Feature Requirements

### 5.1 Backend API Spec (모든 스택 공통)

모든 스택은 아래 4개 엔드포인트를 반드시 구현한다.

| Method | Path | Response | 설명 |
|--------|------|----------|------|
| `GET` | `/` | `{"service":"{framework}-backend","status":"running","message":"🍺 Brewnet says hello!"}` | 서비스 정보 |
| `GET` | `/health` | `{"status":"ok","timestamp":"...","db_connected":true}` | 헬스체크 (DB 연결 상태 포함) |
| `GET` | `/api/hello` | `{"message":"Hello from {Framework}!","lang":"{lang}","version":"..."}` | 프론트엔드 연동 확인용 |
| `POST` | `/api/echo` | Request body 그대로 반환 | API 계층 동작 확인용 |

### 5.2 Config-Driven Database

`.env` 파일의 `DB_DRIVER` 값으로 DB를 결정한다. 각 스택의 `database/` 또는 해당 모듈에 DB별 설정 파일이 분리되어 있다.

```env
# .env.example
DB_DRIVER=postgres          # postgres | mysql | sqlite3

# PostgreSQL (DB_DRIVER=postgres)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=brewnet
DB_USER=brewnet
DB_PASSWORD=                # auto-generated on create-app

# MySQL (DB_DRIVER=mysql)
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_DATABASE=brewnet
MYSQL_USER=brewnet
MYSQL_PASSWORD=
MYSQL_ROOT_PASSWORD=

# SQLite3 (DB_DRIVER=sqlite3)
SQLITE_PATH=./data/brewnet_db.db
```

`docker-compose.yml`은 DB_DRIVER에 따라 profiles를 사용하여 해당 DB 서비스만 기동한다.

```yaml
services:
  postgres:
    image: postgres:16-alpine
    profiles: ["postgres"]
    # ...

  mysql:
    image: mysql:8.4
    profiles: ["mysql"]
    # ...

  backend:
    build: ./backend
    environment:
      - DB_DRIVER=${DB_DRIVER:-postgres}
    depends_on:
      postgres:
        condition: service_healthy
        required: false
      mysql:
        condition: service_healthy
        required: false
    # ...
```

SQLite3 선택 시 외부 DB 컨테이너 없이 백엔드 내부 파일 DB로 동작한다.

### 5.3 Frontend Spec

React 19 + Vite 6 + TypeScript. 모든 스택에서 동일한 프론트엔드를 각 스택 디렉토리에 복사하여 사용한다.

`App.tsx`는 `GET /api/hello`를 호출하고 응답을 화면에 표시한다. 추가로 `/health` 응답의 `db_connected` 상태를 표시하여 DB 연결 확인을 시각화한다.

Production: nginx가 static 파일을 서빙하고 `/api/*`를 백엔드로 reverse proxy.

### 5.4 Docker Requirements

| 항목 | 요구사항 |
|------|----------|
| Build | Multi-stage (builder → runner) |
| User | Non-root 실행 (`appuser`) |
| Healthcheck | `HEALTHCHECK` directive 필수 |
| Network | `brewnet` (public) + `brewnet-internal` (DB only) |
| Resource | `deploy.resources.limits` (memory, cpus) |
| Labels | `com.brewnet.stack={lang}-{framework}`, `com.brewnet.role={backend\|frontend}` |
| `.dockerignore` | `backend/`, `frontend/` 각각 필수 |

### 5.5 Port Convention

| Service | Container Port | Host Mapping |
|---------|---------------|--------------|
| Backend | 8080 | `localhost:8080` |
| Frontend | 5173 (dev) / 80 (prod) | `localhost:3000` |
| PostgreSQL | 5432 | `localhost:5433` |
| MySQL | 3306 | `localhost:3307` |

SQLite3는 별도 포트 없음 (파일 기반).

### 5.6 Makefile (모든 스택 공통)

```makefile
dev          # docker compose up (hot reload)
build        # docker compose build
up           # production mode
down         # stop
logs         # follow logs
test         # run tests
clean        # remove containers, volumes, images
validate     # healthcheck + API verification
```

---

## 6. Stack-Specific Requirements

### Go Stacks

#### 6.1 Go (Gin + GORM) — `go-gin`

| 항목 | 값 |
|------|-----|
| Runtime | Go 1.22+ |
| Framework | Gin |
| ORM | GORM |
| Entry | `cmd/server/main.go` |
| Structure | Standard Go Layout (`cmd/`, `internal/`) |
| Docker | `golang:1.22-alpine` → `alpine:3.19` |
| DB Drivers | `gorm.io/driver/postgres`, `gorm.io/driver/mysql`, `gorm.io/driver/sqlite` |

#### 6.2 Go (Echo) — `go-echo`

| 항목 | 값 |
|------|-----|
| Runtime | Go 1.22+ |
| Framework | Echo v4 |
| ORM | GORM |
| Entry | `cmd/server/main.go` |
| Docker | `golang:1.22-alpine` → `alpine:3.19` |

#### 6.3 Go (Fiber) — `go-fiber`

| 항목 | 값 |
|------|-----|
| Runtime | Go 1.22+ |
| Framework | Fiber v2 (fasthttp) |
| ORM | GORM |
| Entry | `cmd/server/main.go` |
| Docker | `golang:1.22-alpine` → `alpine:3.19` |

Go 공통 금지사항: `pkg/` 디렉토리 남용, 불필요한 interface 추상화, wire/fx 같은 DI 프레임워크.

### Rust Stacks

#### 6.4 Rust (Actix-web + SQLx) — `rust-actix-web`

| 항목 | 값 |
|------|-----|
| Runtime | Rust 1.88+ |
| Framework | Actix-web 4 |
| DB | SQLx (any driver) |
| Entry | `src/main.rs` |
| Docker | `rust:1.88` → `debian:bookworm-slim` |

#### 6.5 Rust (Axum + SQLx) — `rust-axum`

| 항목 | 값 |
|------|-----|
| Runtime | Rust 1.88+ |
| Framework | Axum 0.8 + tower-http |
| DB | SQLx (any driver) |
| Entry | `src/main.rs` |
| Docker | `rust:1.88` → `debian:bookworm-slim` |

Rust 공통 금지사항: Diesel (compile-time 복잡도), 불필요한 macro derive, async runtime 중복.

### Java Stacks

#### 6.6 Java (Spring Boot + JPA) — `java-springboot`

| 항목 | 값 |
|------|-----|
| Runtime | Java 21 (Eclipse Temurin) |
| Framework | Spring Boot 3.3 |
| ORM | Spring Data JPA (Hibernate) |
| Entry | `src/main/java/dev/brewnet/app/Application.java` |
| Build | Gradle (Kotlin DSL) |
| Docker | `eclipse-temurin:21-jdk` → `eclipse-temurin:21-jre` |

#### 6.7 Java (Spring Framework) — `java-spring`

| 항목 | 값 |
|------|-----|
| Runtime | Java 21 (Eclipse Temurin) |
| Framework | Spring Framework 6.2 (non-Boot, embedded Tomcat) |
| DB | HikariCP + JDBC |
| Entry | `src/main/java/dev/brewnet/app/Application.java` |
| Build | Maven (shade plugin uber-JAR) |
| Docker | `eclipse-temurin:21-jdk` → `eclipse-temurin:21-jre-alpine` |

Java 공통 금지사항: Lombok 과다 사용, 과도한 계층 분리(5계층 아키텍처), XML 설정.

### Kotlin Stacks

#### 6.8 Kotlin (Ktor) — `kotlin-ktor`

| 항목 | 값 |
|------|-----|
| Runtime | Kotlin 2.1 / Java 21 |
| Framework | Ktor 3.1 + kotlinx.serialization |
| DB | Exposed ORM |
| Entry | `src/main/kotlin/dev/brewnet/app/Application.kt` |
| Build | Gradle (Kotlin DSL) + Shadow plugin |
| Docker | `eclipse-temurin:21-jdk` → `eclipse-temurin:21-jre-alpine` |

#### 6.9 Kotlin (Spring Boot) — `kotlin-springboot`

| 항목 | 값 |
|------|-----|
| Runtime | Kotlin 2.1 / Java 21 |
| Framework | Spring Boot 3.4 |
| DB | Spring JDBC (JdbcTemplate) |
| Entry | `src/main/kotlin/dev/brewnet/app/Application.kt` |
| Build | Gradle (Kotlin DSL) |
| Docker | `eclipse-temurin:21-jdk` → `eclipse-temurin:21-jre-alpine` |

### Node.js Stacks

#### 6.10 Node.js (Express + Prisma) — `nodejs-express`

| 항목 | 값 |
|------|-----|
| Runtime | Node.js 22 |
| Framework | Express 5 |
| ORM | Prisma |
| Language | TypeScript 필수 |
| Entry | `src/index.ts` |
| Docker | `node:22-alpine` |

#### 6.11 Node.js (NestJS + Prisma) — `nodejs-nestjs`

| 항목 | 값 |
|------|-----|
| Runtime | Node.js 22 |
| Framework | NestJS 10 |
| ORM | Prisma |
| Language | TypeScript 필수 |
| Entry | `src/main.ts` |
| Docker | `node:22-alpine` |

#### 6.12 Node.js (Next.js) — `nodejs-nextjs`

| 항목 | 값 |
|------|-----|
| Runtime | Node.js 22 |
| Framework | Next.js 15 (App Router) |
| ORM | Prisma |
| Language | TypeScript 필수 |
| Entry | `src/app/route.ts` (API) + `src/app/page.tsx` (UI) |
| Docker | `node:22-alpine` (3-stage: deps → builder → runner) |
| 특이사항 | Fullstack 단일 프로젝트 (별도 frontend/ 없음, port 3000) |

Node.js 공통 금지사항: class-validator 과도한 데코레이터, 불필요한 middleware chain, morgan/winston 동시 사용.

### Python Stacks

#### 6.13 Python (FastAPI + SQLAlchemy) — `python-fastapi`

| 항목 | 값 |
|------|-----|
| Runtime | Python 3.12+ |
| Framework | FastAPI |
| ORM | SQLAlchemy 2.0 (async) |
| Entry | `src/main.py` |
| Docker | `python:3.12-slim` |
| DB Drivers | `asyncpg`, `aiomysql`, `aiosqlite` |

#### 6.14 Python (Django) — `python-django`

| 항목 | 값 |
|------|-----|
| Runtime | Python 3.12+ |
| Framework | Django 5.1 |
| ORM | Django ORM |
| Entry | `src/manage.py` |
| Docker | `python:3.12-slim` |

#### 6.15 Python (Flask) — `python-flask`

| 항목 | 값 |
|------|-----|
| Runtime | Python 3.12+ |
| Framework | Flask 3.1 |
| ORM | SQLAlchemy 2.0 |
| Entry | `src/main.py` |
| Docker | `python:3.12-slim` |

Python 공통 금지사항: Alembic 포함 (샘플이므로 auto-create), pydantic v1 문법.

### Frontend Template

기본 프론트엔드: React 19 + Vite 6 + TypeScript. 모든 백엔드 스택에 포함.

#### 6.16 API-Only Template (`docker-compose.api-only.yml.template`)

프론트엔드 없이 백엔드 API만 운영할 때 사용하는 docker-compose 템플릿.

---

## 7. Out of Scope (v1)

아래 항목은 v1에 포함하지 않는다.

- Authentication/Authorization (JWT, OAuth)
- Redis/캐시 계층
- GraphQL
- gRPC
- Message Queue (RabbitMQ, Kafka)
- Monitoring/Logging 스택 (Prometheus, Grafana)
- CI/CD 파이프라인 파일 (GitHub Actions는 repo 차원의 validate만)
- Mobile (React Native, Flutter)
- Desktop (Electron, Tauri)
- MongoDB, Redis 등 NoSQL
- .NET (ASP.NET Core) — 향후 추가 예정

---

## 8. Success Metrics

| 지표 | 목표 |
|------|------|
| clone → Hello World 표시 | 3분 이내 (첫 Docker build 제외) |
| Docker build 시간 | 5분 이내 (캐시 없는 상태) |
| `make validate` 통과율 | 100% (모든 스택, CI 기준) |
| DB 전환 (env 변경 → 재기동) | 30초 이내 |
| 백엔드 코드 라인 수 | 200줄 이내 (테스트 제외) |

---

## 9. Delivery Timeline

| Phase | 기간 | 내용 |
|-------|------|------|
| Phase 1 | Week 1 | 공통 인프라: 공통 프론트엔드 템플릿 (스택별 복사), docker-compose 템플릿, Makefile, CI |
| Phase 2 | Week 2 | Node + Python 스택 (가장 빠른 검증) |
| Phase 3 | Week 3 | Go + Rust 스택 |
| Phase 4 | Week 4 | Java 스택 |
| Phase 5 | Week 5 | 통합 테스트, 문서화, CLI 연동 |

---

*Brewnet Boilerplate PRD v1.0.0 — MIT License*
