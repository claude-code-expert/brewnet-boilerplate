# Data Model: 나머지 프레임워크 스택 추가

**Date**: 2026-02-28
**Feature**: [spec.md](./spec.md)

## Overview

이 프로젝트는 CRUD 애플리케이션이 아니므로 전통적인 데이터 모델(entities, relationships)은 없다. 대신, 각 스택이 구현하는 **API 응답 구조**와 **DB 연결 검증 쿼리**가 데이터 모델의 역할을 한다.

## 1. API Response Structures

### GET / — Root

```json
{
  "service": "{framework}-backend",
  "status": "running",
  "message": "🍺 Brewnet says hello!"
}
```

| Field | Type | Description | Example Values |
|-------|------|-------------|----------------|
| `service` | string | `{framework}-backend` format | `django-backend`, `echo-backend`, `axum-backend` |
| `status` | string | Always `"running"` | `running` |
| `message` | string | Fixed greeting | `🍺 Brewnet says hello!` |

### GET /health — Health Check

```json
{
  "status": "ok",
  "timestamp": "2026-02-28T12:00:00Z",
  "db_connected": true
}
```

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `status` | string | Always `"ok"` | Must be `"ok"` |
| `timestamp` | string (ISO 8601) | Current server time | Valid ISO timestamp |
| `db_connected` | boolean | DB ping result | `true` if DB reachable, `false` otherwise |

### GET /api/hello — Hello Endpoint

```json
{
  "message": "Hello from {Framework}!",
  "lang": "{lang}",
  "version": "..."
}
```

| Field | Type | Description | Example Values |
|-------|------|-------------|----------------|
| `message` | string | `Hello from {Framework}!` | `Hello from Django!`, `Hello from Ktor!` |
| `lang` | string | Language identifier | `python`, `go`, `rust`, `nodejs`, `java`, `kotlin` |
| `version` | string | Framework/runtime version | `6.0.2`, `4.13.4`, `22.0.0` |

### POST /api/echo — Echo Endpoint

Request body echoed back as-is (JSON passthrough).

```json
// Request
{ "any": "json", "data": 123 }

// Response (identical)
{ "any": "json", "data": 123 }
```

## 2. Framework-to-Response Mapping

| Stack | `service` field | `message` field | `lang` field |
|-------|----------------|-----------------|--------------|
| python-django | `django-backend` | `Hello from Django!` | `python` |
| python-flask | `flask-backend` | `Hello from Flask!` | `python` |
| go-echo | `echo-backend` | `Hello from Echo!` | `go` |
| go-fiber | `fiber-backend` | `Hello from Fiber!` | `go` |
| rust-axum | `axum-backend` | `Hello from Axum!` | `rust` |
| nodejs-nestjs | `nestjs-backend` | `Hello from NestJS!` | `nodejs` |
| nodejs-nextjs | `nextjs-backend` | `Hello from Next.js!` | `nodejs` |
| java-spring | `spring-backend` | `Hello from Spring Framework!` | `java` |
| kotlin-ktor | `ktor-backend` | `Hello from Ktor!` | `kotlin` |
| kotlin-springboot | `springboot-kt-backend` | `Hello from Spring Boot (Kotlin)!` | `kotlin` |

## 3. Database Connection Patterns

### DB Driver Selection (Environment Variable)

```text
DB_DRIVER=postgres | mysql | sqlite3
```

### Connection String Patterns per Language

| Language | PostgreSQL | MySQL | SQLite3 |
|----------|-----------|-------|---------|
| Python (Django) | `django.db.backends.postgresql` | `django.db.backends.mysql` | `django.db.backends.sqlite3` |
| Python (Flask) | `postgresql://...` | `mysql+pymysql://...` | `sqlite:///path` |
| Go (Echo/Fiber) | `gorm.io/driver/postgres` | `gorm.io/driver/mysql` | `gorm.io/driver/sqlite` |
| Rust (Axum) | `postgres://...` (SQLx) | `mysql://...` (SQLx) | `sqlite://path` (SQLx) |
| Node (NestJS) | `prisma: postgresql` | `prisma: mysql` | `prisma: sqlite` |
| Node (Next.js) | `prisma: postgresql` | `prisma: mysql` | `prisma: sqlite` |
| Java (Spring) | `jdbc:postgresql://...` | `jdbc:mysql://...` | `jdbc:sqlite:path` |
| Kotlin (Ktor) | `jdbc:postgresql://...` (Exposed) | `jdbc:mysql://...` (Exposed) | `jdbc:sqlite:path` (Exposed) |
| Kotlin (Spring Boot) | `spring.datasource.url=jdbc:postgresql://...` | `spring.datasource.url=jdbc:mysql://...` | `spring.datasource.url=jdbc:sqlite:path` |

### Health Check Query

All stacks use the same validation approach:

```sql
SELECT 1
```

- Success → `db_connected: true`
- Exception/timeout → `db_connected: false`

## 4. Docker Compose Database Services

```yaml
# Included in ALL stack docker-compose.yml files
postgres:
  image: postgres:16-alpine
  profiles: ["postgres"]
  # ... (healthcheck: pg_isready)

mysql:
  image: mysql:8.4
  profiles: ["mysql"]
  # ... (healthcheck: mysqladmin ping)

# SQLite3: no service needed (embedded in backend container)
volumes:
  sqlite-data:  # Mounted to backend:/app/data
```

## 5. Environment Variable Schema

| Variable | Scope | Default | Used When |
|----------|-------|---------|-----------|
| `DB_DRIVER` | All | `postgres` | Always |
| `DB_HOST` | PostgreSQL | `postgres` | `DB_DRIVER=postgres` |
| `DB_PORT` | PostgreSQL | `5432` | `DB_DRIVER=postgres` |
| `DB_NAME` | PostgreSQL | `brewnet` | `DB_DRIVER=postgres` |
| `DB_USER` | PostgreSQL | `brewnet` | `DB_DRIVER=postgres` |
| `DB_PASSWORD` | PostgreSQL | *(required)* | `DB_DRIVER=postgres` |
| `MYSQL_HOST` | MySQL | `mysql` | `DB_DRIVER=mysql` |
| `MYSQL_PORT` | MySQL | `3306` | `DB_DRIVER=mysql` |
| `MYSQL_DATABASE` | MySQL | `brewnet` | `DB_DRIVER=mysql` |
| `MYSQL_USER` | MySQL | `brewnet` | `DB_DRIVER=mysql` |
| `MYSQL_PASSWORD` | MySQL | *(required)* | `DB_DRIVER=mysql` |
| `MYSQL_ROOT_PASSWORD` | MySQL | *(required)* | `DB_DRIVER=mysql` |
| `SQLITE_PATH` | SQLite3 | `/app/data/brewnet.db` | `DB_DRIVER=sqlite3` |
| `BACKEND_PORT` | All | `8080` | Always |
| `FRONTEND_PORT` | All | `3000` | When frontend exists |
| `STACK_LANG` | All | *(stack-specific)* | Always |
