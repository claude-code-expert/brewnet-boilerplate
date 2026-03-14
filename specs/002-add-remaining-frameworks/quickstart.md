# Quickstart: 나머지 프레임워크 스택 추가

**Date**: 2026-02-28
**Feature**: [spec.md](./spec.md)

## Prerequisites

- Docker Desktop or Docker Engine + Compose v2
- `make` command available
- Ports 8080, 3000, 5433, 3307 available (or override via `.env`)

## Quick Validation per Stack

### Standard Stack (backend + frontend + DB)

```bash
# 1. Navigate to any new stack
cd stacks/{lang}-{framework}

# 2. Setup environment
cp .env.example .env

# 3. Start with default DB (PostgreSQL)
make dev

# 4. Validate all endpoints
make validate

# 5. Cleanup
make clean
```

### Multi-DB Switch Test

```bash
# PostgreSQL (default)
cp .env.example .env
make dev
make validate
make down

# MySQL
sed -i 's/^DB_DRIVER=.*/DB_DRIVER=mysql/' .env
make dev
make validate
make down

# SQLite3
sed -i 's/^DB_DRIVER=.*/DB_DRIVER=sqlite3/' .env
make dev
make validate
make clean
```

### Next.js Stack (unified — no separate frontend)

```bash
cd stacks/nodejs-nextjs
cp .env.example .env
make dev

# Validate API endpoints (port 3000, not 8080)
curl http://localhost:3000/api/hello
curl http://localhost:3000/health

# Frontend is at the same URL
open http://localhost:3000

make clean
```

## Manual Endpoint Verification

```bash
# 1. Root endpoint
curl -s http://localhost:8080/ | jq .
# Expected: { "service": "{framework}-backend", "status": "running", "message": "☕ Brewnet says hello!" }

# 2. Health check
curl -s http://localhost:8080/health | jq .
# Expected: { "status": "ok", "timestamp": "...", "db_connected": true }

# 3. Hello endpoint
curl -s http://localhost:8080/api/hello | jq .
# Expected: { "message": "Hello from {Framework}!", "lang": "{lang}", "version": "..." }

# 4. Echo endpoint
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"test": "brewnet", "number": 42}' \
  http://localhost:8080/api/echo | jq .
# Expected: { "test": "brewnet", "number": 42 }
```

## Stack-by-Stack Validation Checklist

### US1: Python Django/Flask

```bash
# Django
cd stacks/python-django && cp .env.example .env && make dev
curl -s localhost:8080/ | jq -r '.service'        # → django-backend
curl -s localhost:8080/api/hello | jq -r '.message' # → Hello from Django!
curl -s localhost:8080/health | jq -r '.db_connected' # → true
make clean

# Flask
cd stacks/python-flask && cp .env.example .env && make dev
curl -s localhost:8080/ | jq -r '.service'        # → flask-backend
curl -s localhost:8080/api/hello | jq -r '.message' # → Hello from Flask!
make clean
```

### US2: Go Echo/Fiber

```bash
# Echo
cd stacks/go-echo && cp .env.example .env && make dev
curl -s localhost:8080/ | jq -r '.service'        # → echo-backend
curl -s localhost:8080/api/hello | jq -r '.message' # → Hello from Echo!
make clean

# Fiber
cd stacks/go-fiber && cp .env.example .env && make dev
curl -s localhost:8080/ | jq -r '.service'        # → fiber-backend
curl -s localhost:8080/api/hello | jq -r '.message' # → Hello from Fiber!
make clean
```

### US3: Rust Axum

```bash
cd stacks/rust-axum && cp .env.example .env && make dev
curl -s localhost:8080/ | jq -r '.service'        # → axum-backend
curl -s localhost:8080/api/hello | jq -r '.message' # → Hello from Axum!
make clean
```

### US4: Node.js NestJS/Next.js

```bash
# NestJS
cd stacks/nodejs-nestjs && cp .env.example .env && make dev
curl -s localhost:8080/ | jq -r '.service'        # → nestjs-backend
curl -s localhost:8080/api/hello | jq -r '.message' # → Hello from NestJS!
make clean

# Next.js (port 3000!)
cd stacks/nodejs-nextjs && cp .env.example .env && make dev
curl -s localhost:3000/api/hello | jq -r '.message' # → Hello from Next.js!
curl -s localhost:3000/health | jq -r '.db_connected' # → true
make clean
```

### US5: Java Spring Framework

```bash
cd stacks/java-spring && cp .env.example .env && make dev
curl -s localhost:8080/ | jq -r '.service'        # → spring-backend
curl -s localhost:8080/api/hello | jq -r '.message' # → Hello from Spring Framework!
make clean
```

### US6: Kotlin Ktor/Spring Boot

```bash
# Ktor
cd stacks/kotlin-ktor && cp .env.example .env && make dev
curl -s localhost:8080/ | jq -r '.service'        # → ktor-backend
curl -s localhost:8080/api/hello | jq -r '.message' # → Hello from Ktor!
make clean

# Spring Boot (Kotlin)
cd stacks/kotlin-springboot && cp .env.example .env && make dev
curl -s localhost:8080/ | jq -r '.service'        # → springboot-kt-backend
curl -s localhost:8080/api/hello | jq -r '.message' # → Hello from Spring Boot (Kotlin)!
make clean
```

### US7: Frontend Templates

```bash
# Vue.js frontend (with any backend, e.g., go-gin)
# Brewnet CLI replaces frontend/ with frontend-vue template
cd stacks/go-gin
# (swap frontend/ content with frontend-vue template)
make dev
# Browser: http://localhost:3000 → Vue 3 app showing hello message

# SvelteKit frontend
# (swap frontend/ content with frontend-svelte template)
make dev
# Browser: http://localhost:3000 → SvelteKit app showing hello message

# API-only (no frontend)
# docker-compose.yml without frontend service
make dev
curl -s localhost:8080/api/hello  # Backend only, no frontend
```

## CI Validation (All Stacks × All DBs)

After all stacks are implemented, the CI matrix should validate:

```
15 stacks × 3 DBs = 45 combinations
```

Each combination runs: `make build` → `make up` → `make validate` → `make clean`

## Troubleshooting

| Issue | Solution |
|-------|---------|
| Port 8080 in use | Set `BACKEND_PORT=8081` in `.env` |
| Port 3000 in use | Set `FRONTEND_PORT=3001` in `.env` |
| DB connection fails | Check `docker compose ps` — DB container must be healthy |
| SQLite permission error | Ensure `/app/data` directory exists with correct ownership in Dockerfile |
| Go Fiber build fails | Verify Go 1.25+ in Dockerfile (`golang:1.25-alpine`) |
| Rust build slow | Normal — first build caches dependencies, subsequent builds are faster |
| Next.js standalone error | Verify `output: 'standalone'` in `next.config.ts` |
