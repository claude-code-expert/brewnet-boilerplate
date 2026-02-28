# Data Model: Brewnet 6-Stack Implementation

**Phase**: 1 (Design & Contracts)
**Date**: 2026-02-28

## Overview

이 보일러플레이트는 CRUD 데이터 모델을 포함하지 않는다 (Constitution Principle IV: Uniform API Contract). DB 연결 확인만 수행하며, 테이블이나 엔티티를 생성하지 않는다.

## Entities

### 1. API Response Models (JSON — 데이터 저장 없음)

#### RootResponse

```
{
  "service": string,       // "{lang}-backend" (e.g., "node-backend")
  "status": string,        // "running"
  "message": string        // "🍺 Brewnet says hello!"
}
```

#### HealthResponse

```
{
  "status": string,        // "ok"
  "timestamp": string,     // ISO 8601 (e.g., "2026-02-28T12:00:00Z")
  "db_connected": boolean  // true/false — 실제 DB ping 결과
}
```

#### HelloResponse

```
{
  "message": string,       // "Hello from {Lang}!" (e.g., "Hello from Node!")
  "lang": string,          // "{lang}" (e.g., "node")
  "version": string        // 런타임 버전 (e.g., "22.0.0")
}
```

#### EchoResponse

```
// Request body를 그대로 반환
// Content-Type: application/json
{
  ...request.body
}
```

### 2. Database Connection (State — 저장 없음)

DB_DRIVER 환경변수로 결정되는 연결 구성. 엔티티/테이블 없음.

| DB_DRIVER | Connection Target | Docker Profile | Host Port |
|-----------|-------------------|----------------|-----------|
| `postgres` | PostgreSQL 16 (`postgres:5432`) | `postgres` | 5433 |
| `mysql` | MySQL 8.4 (`mysql:3306`) | `mysql` | 3307 |
| `sqlite3` | File (`/app/data/brewnet.db`) | (none) | (none) |

### 3. Environment Configuration (.env)

| Category | Variables |
|----------|-----------|
| Common | `PROJECT_NAME`, `DOMAIN`, `DB_DRIVER`, `BACKEND_PORT`, `FRONTEND_PORT`, `TZ` |
| PostgreSQL | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` |
| MySQL | `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD` |
| SQLite3 | `SQLITE_PATH` |

## Relationships

```
Stack (1) ─── contains ──→ Backend Service (1)
Stack (1) ─── contains ──→ Frontend Service (1)
Stack (1) ─── contains ──→ docker-compose.yml (1)
Backend Service (1) ─── connects to ──→ Database Service (0..1)
Frontend Service (1) ─── proxies /api to ──→ Backend Service (1)
```

## Validation Rules

- `DB_DRIVER` MUST be one of: `postgres`, `mysql`, `sqlite3`
- `/health` response `db_connected` MUST reflect actual DB ping result
- All 4 endpoints MUST return valid JSON with Content-Type: application/json
- `POST /api/echo` MUST return request body as-is (identity function)
