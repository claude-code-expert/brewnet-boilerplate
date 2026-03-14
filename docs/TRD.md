# Brewnet Boilerplate — Technical Requirements Document (TRD)

> **Brewnet** — Your server on tap. Just brew it.
> **Site**: brewnet.dev
> **Contact**: brewnet.dev@gmail.com
> **License**: MIT License
> **Version**: 1.0.0
> **Date**: 2026-02-28

---

## 1. Architecture Overview

### 1.1 System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Host Machine                                                │
│                                                              │
│  ┌─── Docker Network: brewnet (bridge) ──────────────────┐  │
│  │                                                        │  │
│  │  ┌──────────┐     ┌──────────┐                        │  │
│  │  │ Frontend │────▶│ Backend  │   localhost:3000 (FE)   │  │
│  │  │ React+   │ /api│{Framework}│   localhost:8080 (BE)   │  │
│  │  │ nginx    │     │ :8080    │                        │  │
│  │  │ :80      │     └────┬─────┘                        │  │
│  │  └──────────┘          │                              │  │
│  │                        │                              │  │
│  │  ┌─── Docker Network: brewnet-internal (internal) ──┐ │  │
│  │  │                     │                            │ │  │
│  │  │              ┌──────▼──────┐                     │ │  │
│  │  │              │  Database   │                     │ │  │
│  │  │              │ PostgreSQL  │  (or MySQL/SQLite)  │ │  │
│  │  │              │ :5432       │                     │ │  │
│  │  │              └─────────────┘                     │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Design Decisions

| 결정 | 이유 | 대안 (채택하지 않음) |
|------|------|---------------------|
| Monorepo (stacks/) | 단일 repo에서 전 스택 CI/CD, 일관된 구조 강제 | 스택별 개별 repo → 버전 동기화 어려움 |
| Docker Compose profiles | DB 전환을 env 파일 하나로 처리 | 별도 compose 파일 → 관리 복잡 |
| 동일 Frontend (스택별 복사) | 백엔드만 교체, 각 스택이 독립적으로 동작 | shared/frontend/ 참조 → 스택 분리 시 깨짐 |
| ORM 사용 | DB 전환이 config 변경만으로 가능 | Raw SQL → DB별 쿼리 분기 필요 |
| Multi-stage Docker build | 이미지 크기 최소화 | 단일 stage → 빌드 도구가 프로덕션 이미지에 포함 |

---

## 2. Database Architecture

### 2.1 DB Driver 추상화 패턴

모든 스택은 동일한 추상화 전략을 따른다: **환경변수 기반 분기 + ORM 네이티브 드라이버 교체**.

```
                    ┌─────────────┐
                    │   .env      │
                    │ DB_DRIVER=? │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ postgres │ │  mysql   │ │ sqlite3  │
        │ config   │ │  config  │ │  config  │
        └────┬─────┘ └────┬─────┘ └────┬─────┘
             │             │             │
             ▼             ▼             ▼
        ┌──────────────────────────────────┐
        │        ORM / Query Layer         │
        │   (동일한 Model, 동일한 Query)    │
        └──────────────────────────────────┘
```

### 2.2 DB별 Connection String 규격

```
# PostgreSQL
postgresql://brewnet:${DB_PASSWORD}@postgres:5432/brewnet?sslmode=disable

# MySQL
mysql://brewnet:${MYSQL_PASSWORD}@mysql:3306/brewnet?parseTime=true&charset=utf8mb4

# SQLite3
sqlite:///data/brewnet_db.db
# 또는 file:./data/brewnet_db.db?_journal_mode=WAL
```

### 2.3 docker-compose.yml DB Profile 설계

```yaml
# docker-compose.yml (공통 구조, 모든 스택 동일)

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "${BACKEND_PORT:-8080}:8080"
    environment:
      - DB_DRIVER=${DB_DRIVER:-postgres}
      - DB_HOST=${DB_HOST:-postgres}
      - DB_PORT=${DB_PORT:-5432}
      - DB_NAME=${DB_NAME:-brewnet_db}
      - DB_USER=${DB_USER:-brewnet}
      - DB_PASSWORD=${DB_PASSWORD}
      - MYSQL_HOST=${MYSQL_HOST:-mysql}
      - MYSQL_PORT=${MYSQL_PORT:-3306}
      - MYSQL_DATABASE=${MYSQL_DATABASE:-brewnet_db}
      - MYSQL_USER=${MYSQL_USER:-brewnet}
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
      - SQLITE_PATH=${SQLITE_PATH:-/app/data/brewnet_db.db}
    volumes:
      - sqlite-data:/app/data    # SQLite3 persistence
    networks:
      - brewnet
      - brewnet-internal
    depends_on:
      postgres:
        condition: service_healthy
        required: false
      mysql:
        condition: service_healthy
        required: false
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://127.0.0.1:8080/health"]
      interval: 10s
      timeout: 5s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "1.0"
    labels:
      - "com.brewnet.stack=${STACK_NAME}"
      - "com.brewnet.role=backend"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "${FRONTEND_PORT:-3000}:80"
    networks:
      - brewnet
    depends_on:
      backend:
        condition: service_healthy
    deploy:
      resources:
        limits:
          memory: 128M
          cpus: "0.5"
    labels:
      - "com.brewnet.stack=${STACK_NAME}"
      - "com.brewnet.role=frontend"

  postgres:
    image: postgres:16-alpine
    profiles: ["postgres"]
    environment:
      POSTGRES_DB: ${DB_NAME:-brewnet_db}
      POSTGRES_USER: ${DB_USER:-brewnet}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5433:5432"
    volumes:
      - pg-data:/var/lib/postgresql/data
    networks:
      - brewnet-internal
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-brewnet}"]
      interval: 5s
      timeout: 3s
      retries: 5

  mysql:
    image: mysql:8.4
    profiles: ["mysql"]
    environment:
      MYSQL_DATABASE: ${MYSQL_DATABASE:-brewnet_db}
      MYSQL_USER: ${MYSQL_USER:-brewnet}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    ports:
      - "3307:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - brewnet-internal
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 3s
      retries: 5

networks:
  brewnet:
    driver: bridge
  brewnet-internal:
    driver: bridge
    internal: true

volumes:
  pg-data:
  mysql-data:
  sqlite-data:
```

### 2.4 Makefile에서 Profile 자동 선택

```makefile
# DB_DRIVER 값을 읽어서 compose profile 자동 설정
DB_DRIVER ?= $(shell grep -E '^DB_DRIVER=' .env 2>/dev/null | cut -d= -f2 || echo "postgres")
COMPOSE_PROFILES := $(if $(filter sqlite3,$(DB_DRIVER)),,$(DB_DRIVER))

COMPOSE := DB_DRIVER=$(DB_DRIVER) COMPOSE_PROFILES=$(COMPOSE_PROFILES) docker compose

dev:
	$(COMPOSE) up --build

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

test:
	$(COMPOSE) run --rm backend $(TEST_CMD)

clean:
	$(COMPOSE) down -v --rmi local

validate:
	@./scripts/validate.sh
```

---

## 3. Stack Implementation Details

### 3.1 Go (Gin + GORM)

#### Project Structure

```
backend/
├── cmd/server/
│   └── main.go                 # 엔트리포인트, 서버 기동
├── internal/
│   ├── handler/
│   │   ├── root.go             # GET /
│   │   ├── health.go           # GET /health
│   │   ├── hello.go            # GET /api/hello
│   │   └── echo.go             # POST /api/echo
│   └── database/
│       └── database.go         # DB 연결 (DB_DRIVER 분기)
├── Dockerfile
├── go.mod
├── go.sum
└── .dockerignore
```

#### DB Connection (database/database.go)

```go
package database

import (
    "fmt"
    "os"

    "gorm.io/driver/mysql"
    "gorm.io/driver/postgres"
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
)

func Connect() (*gorm.DB, error) {
    driver := os.Getenv("DB_DRIVER")

    switch driver {
    case "postgres":
        dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
            os.Getenv("DB_HOST"), os.Getenv("DB_PORT"),
            os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_NAME"))
        return gorm.Open(postgres.Open(dsn), &gorm.Config{})

    case "mysql":
        dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
            os.Getenv("MYSQL_USER"), os.Getenv("MYSQL_PASSWORD"),
            os.Getenv("MYSQL_HOST"), os.Getenv("MYSQL_PORT"), os.Getenv("MYSQL_DATABASE"))
        return gorm.Open(mysql.Open(dsn), &gorm.Config{})

    case "sqlite3":
        path := os.Getenv("SQLITE_PATH")
        if path == "" {
            path = "./data/brewnet_db.db"
        }
        return gorm.Open(sqlite.Open(path), &gorm.Config{})

    default:
        return nil, fmt.Errorf("unsupported DB_DRIVER: %s", driver)
    }
}
```

#### Dockerfile

```dockerfile
# Build stage
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=1 go build -o server ./cmd/server

# Production stage
FROM alpine:3.19
RUN apk --no-cache add ca-certificates && \
    adduser -D -h /app appuser
WORKDIR /app
COPY --from=builder /app/server .
RUN mkdir -p /app/data && chown -R appuser:appuser /app
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD wget --spider -q http://127.0.0.1:8080/health || exit 1
ENTRYPOINT ["./server"]
```

> **Note**: CGO_ENABLED=1 필수 (SQLite 드라이버가 CGO 의존). alpine에서 빌드하면 musl libc로 정적 링크됨.

---

### 3.2 Rust (Actix-web + SQLx)

#### Project Structure

```
backend/
├── src/
│   ├── main.rs                 # 서버 기동, 라우팅
│   ├── handler.rs              # 핸들러 (root, health, hello, echo)
│   └── database.rs             # DB 연결 (DB_DRIVER 분기)
├── Cargo.toml
├── Dockerfile
└── .dockerignore
```

#### DB Connection (src/database.rs)

```rust
use sqlx::{AnyPool, any::AnyPoolOptions};
use std::env;

pub async fn connect() -> Result<AnyPool, sqlx::Error> {
    let driver = env::var("DB_DRIVER").unwrap_or_else(|_| "postgres".to_string());

    let url = match driver.as_str() {
        "postgres" => format!(
            "postgres://{}:{}@{}:{}/{}",
            env::var("DB_USER").unwrap_or_default(),
            env::var("DB_PASSWORD").unwrap_or_default(),
            env::var("DB_HOST").unwrap_or("postgres".into()),
            env::var("DB_PORT").unwrap_or("5432".into()),
            env::var("DB_NAME").unwrap_or("brewnet_db".into()),
        ),
        "mysql" => format!(
            "mysql://{}:{}@{}:{}/{}",
            env::var("MYSQL_USER").unwrap_or_default(),
            env::var("MYSQL_PASSWORD").unwrap_or_default(),
            env::var("MYSQL_HOST").unwrap_or("mysql".into()),
            env::var("MYSQL_PORT").unwrap_or("3306".into()),
            env::var("MYSQL_DATABASE").unwrap_or("brewnet_db".into()),
        ),
        "sqlite3" => format!(
            "sqlite://{}",
            env::var("SQLITE_PATH").unwrap_or("./data/brewnet_db.db".into())
        ),
        _ => panic!("Unsupported DB_DRIVER: {}", driver),
    };

    AnyPoolOptions::new()
        .max_connections(5)
        .connect(&url)
        .await
}
```

#### Cargo.toml (핵심 의존성만)

```toml
[dependencies]
actix-web = "4"
actix-cors = "0.7"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
sqlx = { version = "0.8", features = ["runtime-tokio", "any", "postgres", "mysql", "sqlite"] }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
chrono = { version = "0.4", features = ["serde"] }
```

#### Dockerfile

```dockerfile
FROM rust:1.88 AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main(){}" > src/main.rs && cargo build --release && rm -rf src
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates wget && \
    rm -rf /var/lib/apt/lists/* && \
    useradd -m appuser
WORKDIR /app
COPY --from=builder /app/target/release/backend .
RUN mkdir -p /app/data && chown -R appuser:appuser /app
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD wget --spider -q http://127.0.0.1:8080/health || exit 1
ENTRYPOINT ["./backend"]
```

> **Note**: 빈 main.rs로 먼저 deps를 빌드하는 캐싱 전략. 소스 변경 시 deps 재빌드 방지.

---

### 3.3 Java (Spring Boot + JPA)

#### Project Structure

```
backend/
├── src/main/java/dev/brewnet/app/
│   ├── Application.java         # @SpringBootApplication
│   └── controller/
│       └── RootController.java  # GET /, /health, /api/hello, /api/echo
├── src/main/resources/
│   ├── application.yml          # 공통 설정
│   ├── application-postgres.yml
│   ├── application-mysql.yml
│   └── application-sqlite.yml
├── build.gradle.kts
├── Dockerfile
└── .dockerignore
```

#### Profile-based DB Config

```yaml
# application.yml
spring:
  profiles:
    active: ${DB_DRIVER:postgres}
  jpa:
    hibernate:
      ddl-auto: update
    open-in-view: false

server:
  port: 8080

---
# application-postgres.yml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:postgres}:${DB_PORT:5432}/${DB_NAME:brewnet_db}
    username: ${DB_USER:brewnet}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect

---
# application-mysql.yml
spring:
  datasource:
    url: jdbc:mysql://${MYSQL_HOST:mysql}:${MYSQL_PORT:3306}/${MYSQL_DATABASE:brewnet_db}?useSSL=false&allowPublicKeyRetrieval=true
    username: ${MYSQL_USER:brewnet}
    password: ${MYSQL_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    database-platform: org.hibernate.dialect.MySQLDialect

---
# application-sqlite.yml
spring:
  datasource:
    url: jdbc:sqlite:${SQLITE_PATH:./data/brewnet_db.db}
    driver-class-name: org.sqlite.JDBC
  jpa:
    database-platform: org.hibernate.community.dialect.SQLiteDialect
```

#### build.gradle.kts (핵심 의존성)

```kotlin
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")

    // DB Drivers
    runtimeOnly("org.postgresql:postgresql")
    runtimeOnly("com.mysql:mysql-connector-j")
    runtimeOnly("org.xerial:sqlite-jdbc")
    runtimeOnly("org.hibernate.orm:hibernate-community-dialects")  // SQLite dialect
}
```

#### Dockerfile

```dockerfile
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY build.gradle.kts settings.gradle.kts gradlew ./
COPY gradle ./gradle
RUN ./gradlew dependencies --no-daemon
COPY src ./src
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
RUN adduser -D appuser
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
RUN mkdir -p /app/data && chown -R appuser:appuser /app
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD wget --spider -q http://127.0.0.1:8080/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

### 3.4 Node.js (Express + Prisma)

#### Project Structure

```
backend/
├── src/
│   ├── index.ts                # 엔트리포인트, Express app
│   ├── routes/
│   │   ├── root.ts             # GET /, /health
│   │   ├── hello.ts            # GET /api/hello
│   │   └── echo.ts             # POST /api/echo
│   └── database.ts             # Prisma client 초기화
├── prisma/
│   └── schema.prisma           # Prisma 스키마 (provider는 env에서)
├── tsconfig.json
├── package.json
├── Dockerfile
└── .dockerignore
```

#### Prisma Schema (provider 동적 전환)

```prisma
// prisma/schema.prisma
datasource db {
  provider = env("PRISMA_DB_PROVIDER")   // "postgresql" | "mysql" | "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

```env
# .env — Prisma용 변수 (Makefile이 DB_DRIVER로부터 자동 생성)
PRISMA_DB_PROVIDER=postgresql
DATABASE_URL=postgresql://brewnet:secret@postgres:5432/brewnet
```

#### Makefile 추가: Prisma env 자동 생성

```makefile
# DB_DRIVER → Prisma 환경변수 매핑
prisma-env:
ifeq ($(DB_DRIVER),postgres)
	@echo 'PRISMA_DB_PROVIDER=postgresql' >> .env
	@echo 'DATABASE_URL=postgresql://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)' >> .env
else ifeq ($(DB_DRIVER),mysql)
	@echo 'PRISMA_DB_PROVIDER=mysql' >> .env
	@echo 'DATABASE_URL=mysql://$(MYSQL_USER):$(MYSQL_PASSWORD)@$(MYSQL_HOST):$(MYSQL_PORT)/$(MYSQL_DATABASE)' >> .env
else
	@echo 'PRISMA_DB_PROVIDER=sqlite' >> .env
	@echo 'DATABASE_URL=file:$(SQLITE_PATH)' >> .env
endif
```

#### Dockerfile

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine
RUN adduser -D appuser
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package.json ./
RUN mkdir -p /app/data && chown -R appuser:appuser /app
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD wget --spider -q http://127.0.0.1:8080/health || exit 1
CMD ["node", "dist/index.js"]
```

> **Note**: Prisma는 provider 변경 시 `prisma generate` 재실행 필요. Docker entrypoint에서 `npx prisma migrate deploy && node dist/index.js` 패턴 사용.

---

### 3.5 Python (FastAPI + SQLAlchemy)

#### Project Structure

```
backend/
├── src/
│   ├── main.py                 # FastAPI app, 라우터 등록
│   ├── config.py               # pydantic Settings (환경변수)
│   ├── database.py             # DB 엔진 생성 (DB_DRIVER 분기)
│   └── routers/
│       ├── root.py             # GET /, /health
│       ├── hello.py            # GET /api/hello
│       └── echo.py             # POST /api/echo
├── requirements.txt
├── Dockerfile
└── .dockerignore
```

#### DB Connection (src/database.py)

```python
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from src.config import settings

def get_database_url() -> str:
    match settings.DB_DRIVER:
        case "postgres":
            return (
                f"postgresql+asyncpg://{settings.DB_USER}:{settings.DB_PASSWORD}"
                f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
            )
        case "mysql":
            return (
                f"mysql+aiomysql://{settings.MYSQL_USER}:{settings.MYSQL_PASSWORD}"
                f"@{settings.MYSQL_HOST}:{settings.MYSQL_PORT}/{settings.MYSQL_DATABASE}"
            )
        case "sqlite3":
            return f"sqlite+aiosqlite:///{settings.SQLITE_PATH}"
        case _:
            raise ValueError(f"Unsupported DB_DRIVER: {settings.DB_DRIVER}")

engine = create_async_engine(get_database_url(), echo=False)
async_session = async_sessionmaker(engine, expire_on_commit=False)
```

#### requirements.txt (최소 의존성)

```
fastapi==0.115.*
uvicorn[standard]==0.34.*
sqlalchemy[asyncio]==2.0.*
pydantic-settings==2.*
asyncpg==0.30.*
aiomysql==0.2.*
aiosqlite==0.20.*
```

#### Dockerfile

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.12-slim
RUN useradd -m appuser
WORKDIR /app
COPY --from=builder /install /usr/local
COPY src ./src
RUN mkdir -p /app/data && chown -R appuser:appuser /app
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/health')" || exit 1
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

---

### 3.6 Go (Echo) — `go-echo`

Gin과 동일한 Go 표준 레이아웃 (`cmd/`, `internal/`). Echo v4의 `e.GET()` / `e.POST()` 라우팅 사용. GORM으로 DB 추상화.

### 3.7 Go (Fiber) — `go-fiber`

fasthttp 기반 Fiber v2 사용. Gin/Echo와 동일한 프로젝트 구조. `fiber.Ctx`의 `c.JSON()` 응답.

> **Note**: Alpine 컨테이너에서 `localhost`가 IPv6(`::1`)로 해석되어 healthcheck 실패 가능. 모든 healthcheck URL은 `http://127.0.0.1:8080`으로 설정.

### 3.8 Rust (Axum + SQLx) — `rust-axum`

Axum 0.8 + tower-http CORS. `Router::new().route()` 패턴으로 라우팅. `State<Option<AnyPool>>` extractor로 DB 연결 실패 시에도 서버 기동. SQLx `any` feature로 다중 DB 지원.

### 3.9 Java (Spring Framework) — `java-spring`

Spring Boot를 사용하지 않는 순수 Spring Framework 6.2. 프로그래밍 방식의 embedded Tomcat 설정. HikariCP로 직접 DataSource 구성. Maven shade plugin으로 uber-JAR 빌드. `initializationFailTimeout(-1)` 설정으로 DB 미연결 시에도 기동.

### 3.10 Kotlin (Ktor) — `kotlin-ktor`

Ktor 3.1 + Netty 엔진. kotlinx.serialization으로 JSON 처리 (`buildJsonObject` 사용 — mixed-type Map 직렬화 불가 우회). Exposed ORM으로 DB 추상화. Gradle Shadow plugin으로 fat JAR 빌드.

### 3.11 Kotlin (Spring Boot) — `kotlin-springboot`

Kotlin 2.1 + Spring Boot 3.4. `@Autowired(required = false)` JdbcTemplate으로 DB 미연결 시 graceful degradation. `spring.autoconfigure.exclude` 설정으로 DataSource 자동설정 비활성화 후 수동 구성.

### 3.12 Node.js (NestJS + Prisma) — `nodejs-nestjs`

NestJS 10 데코레이터 기반 아키텍처. `PrismaService`에서 `onModuleInit()` try-catch로 DB 미연결 시에도 기동. 동적 `buildDatabaseUrl()` 함수로 `DB_DRIVER` 환경변수 기반 Prisma URL 구성.

### 3.13 Node.js (Next.js) — `nodejs-nextjs`

Next.js 15 App Router. API Route Handlers(`route.ts`)로 백엔드 엔드포인트 구현. 프론트엔드와 백엔드가 단일 프로젝트에 통합 (별도 `frontend/` 없음). `output: 'standalone'` 설정으로 Docker 최적화. Port 3000 사용 (8080이 아님).

> **Note**: 같은 route segment에 `page.tsx`와 `route.ts` 공존 불가. API 라우트가 필요한 경로에서는 `route.ts`만 사용.

### 3.14 Python (Django) — `python-django`

Django 5.1 + Django REST Framework 없이 순수 Django View. `DATABASES` 설정에서 `DB_DRIVER` 환경변수로 분기. `django.db.backends.postgresql` / `mysql` / `sqlite3` 백엔드 전환.

### 3.15 Python (Flask) — `python-flask`

Flask 3.1 + SQLAlchemy 2.0. `create_app()` 팩토리 패턴. `SQLALCHEMY_DATABASE_URI`를 `DB_DRIVER` 환경변수에서 동적 생성. gunicorn으로 프로덕션 실행.

---

## 4. Frontend (공통)

### 4.1 Structure

```
frontend/
├── src/
│   ├── App.tsx                 # 메인 컴포넌트
│   ├── main.tsx                # React 엔트리
│   └── vite-env.d.ts
├── public/
│   └── brewnet.svg
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── nginx.conf                  # Production reverse proxy
├── Dockerfile
└── .dockerignore
```

### 4.2 App.tsx (핵심 로직)

```tsx
import { useState, useEffect } from "react";

interface HealthResponse {
  status: string;
  timestamp: string;
  db_connected: boolean;
}

interface HelloResponse {
  message: string;
  lang: string;
  version: string;
}

export default function App() {
  const [hello, setHello] = useState<HelloResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    fetch("/api/hello").then(r => r.json()).then(setHello);
    fetch("/health").then(r => r.json()).then(setHealth);
  }, []);

  return (
    <main>
      <h1>☕ Brewnet</h1>
      {hello && <p>{hello.message} ({hello.lang} {hello.version})</p>}
      {health && (
        <p>
          DB: {health.db_connected ? "✅ Connected" : "❌ Disconnected"}
        </p>
      )}
    </main>
  );
}
```

### 4.3 nginx.conf (Production)

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /health {
        proxy_pass http://backend:8080;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 4.4 Dockerfile

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD wget --spider -q http://127.0.0.1:80 || exit 1
```

---

## 5. Shared Scripts

### 5.1 validate.sh (Healthcheck + API 검증)

```bash
#!/bin/bash
set -e

BASE_URL="http://localhost:8080"
TIMEOUT=60

echo "⏳ Waiting for backend..."
for i in $(seq 1 $TIMEOUT); do
    if curl -sf "$BASE_URL/health" > /dev/null 2>&1; then
        echo "✅ Backend healthy"
        break
    fi
    [ $i -eq $TIMEOUT ] && echo "❌ Timeout" && exit 1
    sleep 1
done

echo "🔍 Verifying endpoints..."

# GET /
curl -sf "$BASE_URL/" | jq -e '.status == "running"' > /dev/null
echo "  ✅ GET / — ok"

# GET /health (with DB check)
curl -sf "$BASE_URL/health" | jq -e '.status == "ok"' > /dev/null
echo "  ✅ GET /health — ok"

DB_CONNECTED=$(curl -sf "$BASE_URL/health" | jq -r '.db_connected')
echo "  ✅ DB connected: $DB_CONNECTED"

# GET /api/hello
curl -sf "$BASE_URL/api/hello" | jq -e '.message' > /dev/null
echo "  ✅ GET /api/hello — ok"

# POST /api/echo
ECHO_RESULT=$(curl -sf -X POST "$BASE_URL/api/echo" \
    -H "Content-Type: application/json" \
    -d '{"test":"brewnet"}')
echo "$ECHO_RESULT" | jq -e '.test == "brewnet"' > /dev/null
echo "  ✅ POST /api/echo — ok"

echo ""
echo "☕ All checks passed!"
```

---

## 6. CI Pipeline

### 6.1 GitHub Actions (validate-stacks.yml)

```yaml
name: Validate All Stacks

on:
  push:
    branches: [main]
  pull_request:

jobs:
  validate:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        stack: [go-gin, go-echo, go-fiber, rust-actix-web, rust-axum, java-springboot, java-spring, kotlin-ktor, kotlin-springboot, nodejs-express, nodejs-nestjs, nodejs-nextjs, python-fastapi, python-django, python-flask]
        db: [postgres, mysql, sqlite3]

    steps:
      - uses: actions/checkout@v4

      - name: Set DB config
        run: |
          cd stacks/${{ matrix.stack }}
          cp .env.example .env
          sed -i 's/^DB_DRIVER=.*/DB_DRIVER=${{ matrix.db }}/' .env
          # Generate passwords
          echo "DB_PASSWORD=$(openssl rand -hex 16)" >> .env
          echo "MYSQL_PASSWORD=$(openssl rand -hex 16)" >> .env
          echo "MYSQL_ROOT_PASSWORD=$(openssl rand -hex 16)" >> .env

      - name: Build
        run: cd stacks/${{ matrix.stack }} && make build

      - name: Start
        run: cd stacks/${{ matrix.stack }} && make up

      - name: Validate
        run: cd stacks/${{ matrix.stack }} && make validate

      - name: Logs (on failure)
        if: failure()
        run: cd stacks/${{ matrix.stack }} && make logs

      - name: Cleanup
        if: always()
        run: cd stacks/${{ matrix.stack }} && make clean
```

이 CI는 15 stacks × 3 DBs = **45개 조합**을 매 PR마다 검증한다.

---

## 7. Environment Variables Reference

### 7.1 공통

| Variable | Default | 설명 |
|----------|---------|------|
| `PROJECT_NAME` | `brewnet` | 프로젝트 이름 |
| `DOMAIN` | `localhost` | 도메인 |
| `DB_DRIVER` | `postgres` | DB 선택: `postgres` / `mysql` / `sqlite3` |
| `BACKEND_PORT` | `8080` | 백엔드 호스트 포트 |
| `FRONTEND_PORT` | `3000` | 프론트엔드 호스트 포트 |
| `TZ` | `Asia/Seoul` | 타임존 |

### 7.2 PostgreSQL (DB_DRIVER=postgres)

| Variable | Default | 설명 |
|----------|---------|------|
| `DB_HOST` | `postgres` | 호스트 |
| `DB_PORT` | `5432` | 포트 |
| `DB_NAME` | `brewnet_db` | 데이터베이스명 |
| `DB_USER` | `brewnet` | 사용자 |
| `DB_PASSWORD` | (required) | 패스워드 |

### 7.3 MySQL (DB_DRIVER=mysql)

| Variable | Default | 설명 |
|----------|---------|------|
| `MYSQL_HOST` | `mysql` | 호스트 |
| `MYSQL_PORT` | `3306` | 포트 |
| `MYSQL_DATABASE` | `brewnet_db` | 데이터베이스명 |
| `MYSQL_USER` | `brewnet` | 사용자 |
| `MYSQL_PASSWORD` | (required) | 패스워드 |
| `MYSQL_ROOT_PASSWORD` | (required) | Root 패스워드 |

### 7.4 SQLite3 (DB_DRIVER=sqlite3)

| Variable | Default | 설명 |
|----------|---------|------|
| `SQLITE_PATH` | `./data/brewnet_db.db` | DB 파일 경로 |

---

## 8. Anti-Patterns (금지 사항)

각 스택에서 **절대 포함하지 않는** 것들. "베스트 프랙티스"라는 이름으로 불필요한 복잡도를 추가하는 패턴을 명시적으로 배제한다.

### 8.1 공통 금지

| 금지 항목 | 이유 |
|----------|------|
| DI 프레임워크 (wire, fx, inversify, MediatR) | Hello World에 DI 컨테이너 불필요 |
| 로깅 프레임워크 (winston, logback custom) | 표준 출력으로 충분, Docker가 수집 |
| 환경변수 검증 라이브러리 | 각 언어 내장 기능으로 처리 (Pydantic Settings 등) |
| API 문서 자동 생성 도구 (Swagger UI) | FastAPI 내장은 허용, 별도 패키지 추가 금지 |
| 커스텀 에러 핸들링 미들웨어 체인 | 프레임워크 기본 에러 핸들러 사용 |
| Repository 패턴 추상화 | ORM이 이미 추상화, 이중 추상화 금지 |
| DTO/Mapper 계층 | Model → Response 직접 변환 (Pydantic, serde 등 언어 내장) |

### 8.2 스택별 금지

| Stack | 금지 | 이유 |
|-------|------|------|
| Go | `pkg/` 디렉토리, interface 남발 | Go 공식 가이드: "Accept interfaces, return structs" |
| Rust | Diesel ORM, 과도한 macro derive | SQLx가 더 경량, compile-time 검증 |
| Java | Lombok, MapStruct, 5계층 아키텍처 | Record class 사용, Minimal API이므로 계층 최소화 |
| Node | class-validator 데코레이터, morgan+winston 동시 | Express 내장 에러 핸들러, console.log 충분 |
| Python | Alembic migration tool, Django-style app 구조 | Auto-create으로 충분, FastAPI 자체 구조 사용 |

---

## 9. Security Baseline

모든 스택에 기본 적용되는 보안 설정.

| 항목 | 구현 |
|------|------|
| CORS | `localhost:3000` (프론트엔드) 만 허용, 프로덕션 시 DOMAIN 변수로 전환 |
| Non-root | Docker 컨테이너 내 `appuser`로 실행 |
| Network isolation | DB는 `brewnet-internal` 네트워크에만 연결, 외부 접근 차단 |
| No debug in prod | 프로덕션 빌드에서 디버그 모드 비활성화 |
| SQL injection | ORM 사용으로 파라미터 바인딩 강제 |
| `.env` 보호 | `.gitignore`에 `.env` 포함, `.env.example`만 커밋 |
| Healthcheck | 인증 없이 접근 가능하되, 민감 정보 미포함 |

---

*Brewnet Boilerplate TRD v1.0.0 — MIT License*
