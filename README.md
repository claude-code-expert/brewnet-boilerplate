<p align="center">
  <h1 align="center">Brewnet Boilerplate</h1>
  <p align="center">
    <a href="https://www.brewnet.dev">https://www.brewnet.dev</a> · <a href="mailto:brewnet.dev@gmail.com">brewnet.dev@gmail.com</a>
  </p>
  <p align="center">
    <strong>Your server on tap. Just brew it.</strong><br/>
    <em>Generate a full-stack app with a single command.</em>
  </p>
</p>

<p align="center">
  <a href="./README.ko.md">한국어 README</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#available-stacks">Stacks</a> ·
  <a href="#brewnet-cli-usage">CLI Usage</a> ·
  <a href="#manual-clone">Manual Clone</a>
</p>

---

## What is Brewnet Boilerplate?

This repository is the official boilerplate collection for **[Brewnet](https://github.com/claude-code-expert/brewnet)** — a self-hosting Home Server solution designed to let you deploy and serve websites, APIs, and e-commerce services from your own Mac or Linux machine at home.

The **Brewnet CLI** (`brewnet create-app`) automatically clones the right stack from this repository, generates a secure `.env`, and launches your full-stack application with Docker — no manual configuration required.

### What you can build with Brewnet

- Personal homepages and portfolios served from home hardware
- E-Biz and web services hosted on your own Mac or Linux machine
- Full-stack applications across 6 languages and 16 frameworks, backed by PostgreSQL, MySQL, or SQLite3

Each stack in this monorepo is a self-contained backend + frontend project that runs with a single `docker compose up`. Supported languages: **Python, Node.js, Java, Kotlin, Rust, Go** — each with multiple framework options.

> **Brewnet CLI** — source code and documentation: [github.com/claude-code-expert/brewnet](https://github.com/claude-code-expert/brewnet)
> **Live demo**: [www.brewnet.dev](https://www.brewnet.dev)

## Prerequisites

Before running any stack, make sure the following are installed and running:

| Requirement | Version | Install |
|-------------|---------|---------|
| **Docker Desktop** (macOS / Windows) or **Docker Engine** (Linux) | 27+ | [docs.docker.com/get-docker](https://docs.docker.com/get-docker/) |
| **Docker Compose** (bundled with Docker Desktop) | v2+ | included in Docker Desktop |
| **Node.js** (dashboard only) | 18+ | [nodejs.org](https://nodejs.org/) |

> ⚠️ **Docker Desktop must be running** before you click **Start** on any stack or run `make dev`.
> Each stack starts its backend, frontend, and database as Docker containers via `docker compose up -d --build`.

```bash
# Verify Docker is running
docker info
# If you see "Cannot connect to the Docker daemon" → open Docker Desktop first
```

---

## Quick Start

### Option 1: Brewnet CLI (Recommended)

```bash
# Install Brewnet CLI
npm install -g brewnet

# Create a new project
brewnet create-app my-project

# Interactive prompts will guide you:
# → Select language (Go, Rust, Java, Kotlin, Node.js, Python)
# → Select framework (Gin, Echo, Fiber, Spring Boot, Express, FastAPI, ...)
# → Select frontend (React, API-only)
# → Auto-generates .env with secure secrets
# → Starts Docker containers

# Open your app
open http://localhost:3000
```

### Option 2: Manual Clone

```bash
# Clone a specific stack branch directly
git clone --depth=1 -b stack/go-gin \
  https://github.com/claude-code-expert/brewnet-boilerplate.git my-project
cd my-project
cp .env.example .env
make dev

open http://localhost:3000
```

---

## Available Stacks

16 backend stacks, all production-ready with Docker. Each stack includes React 19 + Vite 6 + TypeScript as the default frontend.

### Backend Stacks

| Language | Stack | Framework | ORM / DB Layer | Entry Point |
|----------|-------|-----------|----------------|-------------|
| **Go** | `go-gin` | Gin | GORM | `backend/cmd/server/main.go` |
| | `go-echo` | Echo v4 | GORM | `backend/cmd/server/main.go` |
| | `go-fiber` | Fiber v3 | GORM | `backend/cmd/server/main.go` |
| **Rust** | `rust-actix-web` | Actix-web 4 | SQLx | `backend/src/main.rs` |
| | `rust-axum` | Axum 0.8 | SQLx | `backend/src/main.rs` |
| **Java** | `java-springboot` | Spring Boot 3.3 | JPA / JDBC | `backend/src/.../Application.java` |
| | `java-spring` | Spring Framework 6.2 | JDBC / HikariCP | `backend/src/.../Application.java` |
| **Kotlin** | `kotlin-ktor` | Ktor 3.1 | Exposed ORM | `backend/src/.../Application.kt` |
| | `kotlin-springboot` | Spring Boot 3.4 | JDBC | `backend/src/.../Application.kt` |
| **Node.js** | `nodejs-express` | Express 5 | Prisma | `backend/src/index.ts` |
| | `nodejs-nestjs` | NestJS 11 | Prisma | `backend/src/main.ts` |
| | `nodejs-nextjs` | Next.js 15 (API Routes) | Prisma | `src/app/route.ts` |
| | `nodejs-nextjs-full` | Next.js 15 (Full-Stack) | Prisma | `src/app/page.tsx` |
| **Python** | `python-fastapi` | FastAPI | SQLAlchemy (async) | `backend/src/main.py` |
| | `python-django` | Django 6 | Django ORM | `backend/src/config/wsgi.py` |
| | `python-flask` | Flask 3.1 | Flask-SQLAlchemy | `backend/wsgi.py` |

> **Note**: Both `nodejs-nextjs` variants are unified stacks (no separate frontend container) on port 3000.
> - `nodejs-nextjs`: API Routes backend — minimal UI, fast MVP
> - `nodejs-nextjs-full`: Server Components + Client Components + API Routes — full-stack UI included

### Stack Branch Mapping

Each stack is published as an independent `stack/{name}` branch for direct clone:

```
Stack ID               → Branch
────────────────────────────────────────────
go-gin                 → stack/go-gin
go-echo                → stack/go-echo
go-fiber               → stack/go-fiber
rust-actix-web         → stack/rust-actix-web
rust-axum              → stack/rust-axum
java-springboot        → stack/java-springboot
java-spring            → stack/java-spring
kotlin-ktor            → stack/kotlin-ktor
kotlin-springboot      → stack/kotlin-springboot
nodejs-express         → stack/nodejs-express
nodejs-nestjs          → stack/nodejs-nestjs
nodejs-nextjs          → stack/nodejs-nextjs
nodejs-nextjs-full     → stack/nodejs-nextjs-full
python-fastapi         → stack/python-fastapi
python-django          → stack/python-django
python-flask           → stack/python-flask
```

---

## Brewnet CLI Usage

### Installation

```bash
npm install -g brewnet
```

### Create a New App

```bash
brewnet create-app <project-name> [options]
```

**Interactive mode** — just run without options, the CLI guides you step by step:

```bash
brewnet create-app my-project
```

```
? Select a language:
  ❯ Go
    Rust
    Java
    Kotlin
    Node.js
    Python

? Select a framework:
  ❯ Gin (lightweight, fast)
    Echo (minimalist, extensible)
    Fiber (Express-inspired)

? Select a frontend:
  ❯ React (default)
    API-only (no frontend)
```

**With flags** — skip prompts for CI/scripting:

```bash
# Specify stack directly
brewnet create-app my-api --stack go-gin

# API-only (no frontend)
brewnet create-app my-api --stack python-fastapi --frontend none
```

### What Happens

```
brewnet create-app my-project --stack go-gin
```

1. `git clone --depth=1 -b stack/go-gin https://github.com/claude-code-expert/brewnet-boilerplate.git my-project`
2. Auto-generates `.env` with secure secrets (based on `.env.example`)
3. Runs `docker compose up -d`
4. Verifies `/health` + `/api/hello` respond correctly
5. Opens `http://localhost:3000`

---

## CLI Integration Reference

> This section is the authoritative reference for implementing `brewnet create-app`.

### Repository

```
REPO_URL = https://github.com/claude-code-expert/brewnet-boilerplate.git
```

### Clone Command Pattern

```bash
git clone --depth=1 -b stack/<STACK_ID> \
  https://github.com/claude-code-expert/brewnet-boilerplate.git <PROJECT_NAME>
```

### All Stack Clone Commands

```bash
git clone --depth=1 -b stack/go-gin           https://github.com/claude-code-expert/brewnet-boilerplate.git <project>
git clone --depth=1 -b stack/go-echo          https://github.com/claude-code-expert/brewnet-boilerplate.git <project>
git clone --depth=1 -b stack/go-fiber         https://github.com/claude-code-expert/brewnet-boilerplate.git <project>
git clone --depth=1 -b stack/rust-actix-web   https://github.com/claude-code-expert/brewnet-boilerplate.git <project>
git clone --depth=1 -b stack/rust-axum        https://github.com/claude-code-expert/brewnet-boilerplate.git <project>
git clone --depth=1 -b stack/java-springboot  https://github.com/claude-code-expert/brewnet-boilerplate.git <project>
git clone --depth=1 -b stack/java-spring      https://github.com/claude-code-expert/brewnet-boilerplate.git <project>
git clone --depth=1 -b stack/kotlin-ktor      https://github.com/claude-code-expert/brewnet-boilerplate.git <project>
git clone --depth=1 -b stack/kotlin-springboot https://github.com/claude-code-expert/brewnet-boilerplate.git <project>
git clone --depth=1 -b stack/nodejs-express   https://github.com/claude-code-expert/brewnet-boilerplate.git <project>
git clone --depth=1 -b stack/nodejs-nestjs    https://github.com/claude-code-expert/brewnet-boilerplate.git <project>
git clone --depth=1 -b stack/nodejs-nextjs    https://github.com/claude-code-expert/brewnet-boilerplate.git <project>
git clone --depth=1 -b stack/nodejs-nextjs-full https://github.com/claude-code-expert/brewnet-boilerplate.git <project>
git clone --depth=1 -b stack/python-fastapi   https://github.com/claude-code-expert/brewnet-boilerplate.git <project>
git clone --depth=1 -b stack/python-django    https://github.com/claude-code-expert/brewnet-boilerplate.git <project>
git clone --depth=1 -b stack/python-flask     https://github.com/claude-code-expert/brewnet-boilerplate.git <project>
```

### Post-Clone Flow

```bash
cd <project>

# 1. Generate .env from template (secrets are auto-generated by CLI)
cp .env.example .env

# 2. Start containers
docker compose up -d

# 3. Verify
curl -sf http://localhost:8080/health   # → {"status":"ok","db_connected":true}
curl -sf http://localhost:8080/api/hello # → {"message":"Hello from ..."}

# 4. Open
open http://localhost:3000
```

### Stack ID → Language / Framework Table

| Stack ID | Language | Framework | Port |
|----------|----------|-----------|------|
| `go-gin` | Go | Gin | 8080 |
| `go-echo` | Go | Echo v4 | 8080 |
| `go-fiber` | Go | Fiber v3 | 8080 |
| `rust-actix-web` | Rust | Actix-web 4 | 8080 |
| `rust-axum` | Rust | Axum 0.8 | 8080 |
| `java-springboot` | Java | Spring Boot 3.3 | 8080 |
| `java-spring` | Java | Spring Framework 6.2 | 8080 |
| `kotlin-ktor` | Kotlin | Ktor 3.1 | 8080 |
| `kotlin-springboot` | Kotlin | Spring Boot 3.4 | 8080 |
| `nodejs-express` | Node.js | Express 5 | 8080 |
| `nodejs-nestjs` | Node.js | NestJS 11 | 8080 |
| `nodejs-nextjs` | Node.js | Next.js 15 (API Routes) | 3000 ⚠️ unified |
| `nodejs-nextjs-full` | Node.js | Next.js 15 (Full-Stack) | 3000 ⚠️ unified |
| `python-fastapi` | Python | FastAPI | 8080 |
| `python-django` | Python | Django 6 | 8080 |
| `python-flask` | Python | Flask 3.1 | 8080 |

> ⚠️ `nodejs-nextjs` / `nodejs-nextjs-full`: unified stacks, no separate frontend. Backend port is 3000 (not 8080).

---

## Manual Clone

### Clone the Entire Repo

```bash
git clone https://github.com/claude-code-expert/brewnet-boilerplate.git
cd brewnet-boilerplate
```

### Clone a Single Stack

```bash
# Option A (Recommended): stack branch direct clone
git clone --depth=1 -b stack/go-gin \
  https://github.com/claude-code-expert/brewnet-boilerplate.git my-project
cd my-project

# Option B: sparse checkout
git clone --filter=blob:none --sparse \
  https://github.com/claude-code-expert/brewnet-boilerplate.git
cd brewnet-boilerplate
git sparse-checkout set stacks/go-gin shared

# Option C: degit (clean copy without git history)
npx degit claude-code-expert/brewnet-boilerplate/stacks/go-gin my-project
cd my-project
```

### Run a Stack

```bash
cd stacks/go-gin          # or any stack
cp .env.example .env      # configure environment
make dev                  # start with Docker
```

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Frontend |
| http://localhost:8080 | Backend API |
| http://localhost:8080/health | Health check |
| http://localhost:8080/api/hello | Hello API |

---

## API Contract

All 16 backend stacks implement the same 4 endpoints:

| Method | Path | Response |
|--------|------|----------|
| `GET` | `/` | `{"service":"...-backend","status":"running","message":"Hello Brewnet (https://www.brewnet.dev)"}` |
| `GET` | `/health` | `{"status":"ok","timestamp":"...","db_connected":true\|false}` |
| `GET` | `/api/hello` | `{"message":"Hello from ...!","lang":"...","version":"..."}` |
| `POST` | `/api/echo` | Echo back request body |

```bash
# Test any stack
curl -s http://localhost:8080/api/hello | jq .
curl -s -X POST http://localhost:8080/api/echo \
  -H "Content-Type: application/json" \
  -d '{"hello":"brewnet"}' | jq .
```

---

## Database Support

All stacks support 3 databases via `DB_DRIVER` environment variable:

| DB_DRIVER | Database | Host Port | Note |
|-----------|----------|-----------|------|
| `postgres` (default) | PostgreSQL 16 | 5433 | Default, recommended |
| `mysql` | MySQL 8.4 | 3307 | Alternative |
| `sqlite3` | SQLite3 | — | No external container needed |

### Default Credentials

| Item | Value |
|------|-------|
| Database name | `brewnet_db` |
| Username | `brewnet` |
| Password | `password` |

```bash
# PostgreSQL (from host)
psql -h localhost -p 5433 -U brewnet -d brewnet_db

# MySQL (from host)
mysql -h 127.0.0.1 -P 3307 -u brewnet -p brewnet_db
```

### Switch Database

```bash
make down
# Edit .env: DB_DRIVER=mysql
make dev
```

---

## Port Conventions

| Service | Container Port | Host Port | Note |
|---------|---------------|-----------|------|
| Backend | 8080 | `localhost:8080` | All stacks |
| Frontend | 5173 (dev) / 80 (prod) | `localhost:3000` | nginx in production |
| PostgreSQL | 5432 | `localhost:5433` | Avoid conflict with local PG |
| MySQL | 3306 | `localhost:3307` | Avoid conflict with local MySQL |

---

## Makefile Targets

Uniform across all stacks:

| Target | Description |
|--------|-------------|
| `make dev` | Start with hot reload (`docker compose up --build`) |
| `make build` | Build Docker images |
| `make up` | Production mode (detached) |
| `make down` | Stop all services |
| `make logs` | Follow container logs |
| `make test` | Run tests |
| `make clean` | Remove containers, volumes, images |
| `make validate` | Verify API endpoints |

---

## Repository Structure

```
brewnet-boilerplate/
├── stacks/                          ← Fullstack boilerplates
│   ├── go-gin/                      ← Go (Gin + React)
│   ├── go-echo/                     ← Go (Echo + React)
│   ├── go-fiber/                    ← Go (Fiber v3 + React)
│   ├── rust-actix-web/              ← Rust (Actix-web + React)
│   ├── rust-axum/                   ← Rust (Axum + React)
│   ├── java-springboot/             ← Java (Spring Boot 3.3 + React)
│   ├── java-spring/                 ← Java (Spring Framework 6.2 + React)
│   ├── kotlin-ktor/                 ← Kotlin (Ktor + React)
│   ├── kotlin-springboot/           ← Kotlin (Spring Boot 3.4 + React)
│   ├── nodejs-express/              ← Node.js (Express + React)
│   ├── nodejs-nestjs/               ← Node.js (NestJS + React)
│   ├── nodejs-nextjs/               ← Node.js (Next.js API Routes, unified)
│   ├── nodejs-nextjs-full/          ← Node.js (Next.js Full-Stack, unified)
│   ├── python-fastapi/              ← Python (FastAPI + React)
│   ├── python-django/               ← Python (Django + React)
│   ├── python-flask/                ← Python (Flask + React)
│   └── frontend-template/           ← Shared React frontend template
├── dashboard/                       ← Stack management dashboard (Next.js 15, port 4000)
├── shared/                          ← Common scripts
│   ├── scripts/validate.sh          ← Health check + API verification
│   └── traefik/                     ← Reverse proxy config
├── docs/                            ← Documentation
│   ├── PRD.md
│   ├── TRD.md
│   └── BREWNET-USER-STORY.md
├── .github/workflows/               ← CI: validate all stacks
├── CLAUDE.md                        ← AI assistant guide
├── LICENSE                          ← MIT License
└── README.md                        ← This file
```

Each `stacks/{lang}-{framework}/` directory contains:

```
stacks/{lang}-{framework}/
├── backend/           ← Backend source + Dockerfile
├── frontend/          ← React 19 + TypeScript + Dockerfile (except nextjs)
├── docker-compose.yml ← All services defined
├── Makefile           ← Uniform build targets
├── .env.example       ← Environment variable template
└── README.md          ← Stack-specific documentation
```

---

## Docker Architecture

- **Multi-stage builds** — builder → runner in all Dockerfiles
- **Non-root execution** — `appuser` or language convention
- **Health checks** — `HEALTHCHECK` in all services
- **Network isolation** — `brewnet` (public) + `brewnet-internal` (DB only)
- **Resource limits** — CPU and memory limits via `deploy.resources.limits`

---

## Environment Variables

Common across all stacks (`.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| `PROJECT_NAME` | `brewnet` | Project name |
| `DOMAIN` | `localhost` | Domain |
| `DB_DRIVER` | `postgres` | `postgres` \| `mysql` \| `sqlite3` |
| `DB_HOST` | `postgres` | Docker: `postgres`, Local: `localhost` |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `brewnet_db` | Database name |
| `DB_USER` | `brewnet` | Database user |
| `DB_PASSWORD` | `password` | Database password |
| `MYSQL_HOST` | `mysql` | Docker: `mysql`, Local: `localhost` |
| `MYSQL_PORT` | `3306` | MySQL port |
| `MYSQL_DATABASE` | `brewnet_db` | MySQL database name |
| `MYSQL_USER` | `brewnet` | MySQL user |
| `MYSQL_PASSWORD` | `password` | MySQL password |
| `MYSQL_ROOT_PASSWORD` | `password` | MySQL root password |
| `SQLITE_PATH` | `/app/data/brewnet_db.db` | SQLite file path |
| `BACKEND_PORT` | `8080` | Backend host port |
| `FRONTEND_PORT` | `3000` | Frontend host port |
| `VITE_API_URL` | `http://localhost:8080` | API URL for frontend dev |
| `TZ` | `Asia/Seoul` | Timezone |

---

## Dashboard

The `dashboard/` directory contains a **Next.js 15 meta-dashboard** that lets you start and test all 16 stacks from a browser UI — no terminal needed for each stack.

### Prerequisites

| Requirement | Note |
|-------------|------|
| **Node.js 18+** | Required to run the dashboard itself |
| **Docker Desktop** (running) | Required to **Start** any stack |

> ⚠️ The dashboard UI (`npm run dev`) starts without Docker. However, clicking **▶ Start** on any stack card runs `docker compose up -d --build` internally — **Docker Desktop must be open and running** at that point.

### Quick Setup

```bash
# 1. Verify Docker Desktop is running
docker info

# 2. Clone and start the dashboard
git clone https://github.com/claude-code-expert/brewnet-boilerplate.git
cd brewnet-boilerplate/dashboard
npm install
npm run dev
# → http://localhost:4000
```

Open **http://localhost:4000** in your browser. You will see all 16 stacks in a grid with:

- **▶ Start** — launches the stack via `docker compose up -d --build`
- **README** — renders the stack's README.md in a modal
- **GitHub ↗** — opens the stack's orphan branch on GitHub

Once a stack is **Running**, connect to the address shown on the card:

```
Frontend  →  http://localhost:3001  (or whichever port was allocated)
Backend   →  http://localhost:8081
```

![Brewnet Dashboard](./public/images/brewnet-boilerplate.png)

### Dashboard Features

| Feature | Description |
|---------|-------------|
| Start / Stop | Launch any stack via `docker compose up -d --build` |
| Live status | Auto-polls running stack status every 5 seconds |
| Multi-stack | Dynamic port allocation (backend 8081–8096, frontend 3001–3016) |
| README viewer | Renders each stack's README.md in a modal |
| API Explorer | Test all 4 endpoints inline (`GET /`, `/health`, `/api/hello`, `POST /api/echo`) |
| GitHub links | Opens each stack's orphan branch directly |

> **Note**: The dashboard runs on **port 4000** to avoid conflicts with stack ports (3001–3016 and 8081–8096).
> **Docker Desktop must be open and running** on the host before clicking Start on any stack card.

---

## CI

GitHub Actions (`validate-stacks.yml`) validates every stack on push:

```
docker compose build → docker compose up -d → GET /health (200) → GET /api/hello (200) → docker compose down
```

---

## Contributing

We welcome contributions! To add a new stack, follow the steps below and submit a PR.

---

### Step 1: Create Directory

```bash
mkdir -p stacks/{lang}-{framework}
# Example: stacks/ruby-rails, stacks/csharp-aspnet, stacks/elixir-phoenix
```

Your directory must contain:

```
stacks/{lang}-{framework}/
├── backend/              # Backend source code + Dockerfile
│   ├── Dockerfile        # Multi-stage build (builder → runner)
│   └── .dockerignore
├── frontend/             # React 19 + Vite 6 + TypeScript (copy from existing stack)
│   ├── Dockerfile        # Multi-stage build (node → nginx)
│   └── .dockerignore
├── docker-compose.yml    # backend + frontend + postgres + mysql services
├── Makefile              # Standard targets (dev, build, up, down, logs, test, clean, validate)
├── .env.example          # Environment variable template
└── README.md             # Stack-specific documentation (KR/EN bilingual)
```

### Step 2: Implement 4 Backend Endpoints

All stacks must implement the same API contract:

| Method | Path | Response Format |
|--------|------|-----------------|
| `GET` | `/` | `{"service":"{framework}-backend","status":"running","message":"Hello Brewnet (https://www.brewnet.dev)"}` |
| `GET` | `/health` | `{"status":"ok","timestamp":"...","db_connected":true\|false}` |
| `GET` | `/api/hello` | `{"message":"Hello from {Framework}!","lang":"{lang}","version":"..."}` |
| `POST` | `/api/echo` | Echo back the request body as-is |

### Step 3: Database Support

Your stack must support 3 databases via the `DB_DRIVER` environment variable:

- **PostgreSQL** (`DB_DRIVER=postgres`) — default
- **MySQL** (`DB_DRIVER=mysql`) — alternative
- **SQLite3** (`DB_DRIVER=sqlite3`) — file-based, no external container needed

### Step 4: Docker Requirements

| Requirement | Description |
|-------------|-------------|
| Multi-stage build | Builder stage → lightweight runner stage |
| Non-root user | Run as `appuser` or language convention |
| HEALTHCHECK | Backend must include HEALTHCHECK directive |
| .dockerignore | Exclude unnecessary files from build context |
| Network isolation | `brewnet` (public) + `brewnet-internal` (DB only) |
| Resource limits | Set CPU and memory limits in docker-compose.yml |
| Port convention | Backend: `8080`, Frontend: `3000`, PostgreSQL: `5433`, MySQL: `3307` |

> **Important**: Use `127.0.0.1` instead of `localhost` in HEALTHCHECK commands. Alpine containers resolve `localhost` to IPv6 (`::1`), which can cause healthcheck failures.

### Step 5: Frontend Integration

Copy the `frontend/` directory from any existing stack (e.g., `stacks/go-gin/frontend/`). The React frontend is shared across all stacks.

- `App` component calls `GET /api/hello` and displays the response
- Production: nginx serves static files and reverse proxies `/api` to the backend

### Step 6: Makefile

Copy the `Makefile` from an existing stack and adjust the test command for your language:

```makefile
make dev       # docker compose up --build
make build     # docker compose build
make up        # docker compose up -d
make down      # docker compose down
make logs      # docker compose logs -f
make test      # run tests (language-specific)
make clean     # docker compose down -v --rmi local
make validate  # bash ../../shared/scripts/validate.sh
```

### Step 7: Write README

Write a bilingual (Korean/English) README following the format of existing stack READMEs. Include prerequisites, quick start, local development, API endpoints, database configuration, environment variables, and project structure.

Add the monorepo reference at the top:

```markdown
**Part of the [Brewnet Boilerplate](../../README.md) monorepo** — see root README for full stack list, CLI usage, and clone instructions.
```

### Step 8: Validate

```bash
cd stacks/{lang}-{framework}

make build
make dev

curl -s http://localhost:8080/ | jq .
curl -s http://localhost:8080/health | jq .
curl -s http://localhost:8080/api/hello | jq .
curl -s -X POST http://localhost:8080/api/echo \
  -H "Content-Type: application/json" \
  -d '{"test":"brewnet"}' | jq .

open http://localhost:3000
make validate
make clean
```

### Step 9: Submit PR

```bash
# 1. Fork this repository on GitHub

# 2. Clone your fork and switch to develop
git clone https://github.com/<your-username>/brewnet-boilerplate.git
cd brewnet-boilerplate
git checkout develop

# 3. Create a feature branch from develop
git checkout -b feat/add-{lang}-{framework}-stack

# 4. Commit your changes
git add stacks/{lang}-{framework}/
git commit -m "feat: add {lang}-{framework} stack"

# 5. Push to your fork
git push origin feat/add-{lang}-{framework}-stack

# 6. Open a Pull Request: your fork → upstream develop branch
```

> **Important**: PR target must be the `develop` branch, NOT `main`.

**PR Checklist**:

- [ ] Directory follows `stacks/{lang}-{framework}/` naming convention
- [ ] All 4 endpoints implemented and respond correctly
- [ ] Multi-DB support (PostgreSQL, MySQL, SQLite3)
- [ ] `make dev` starts the full stack
- [ ] `make validate` passes
- [ ] Multi-stage Dockerfile with non-root user
- [ ] README.md written in bilingual format
- [ ] No secrets or credentials committed

---

### Questions

- Email: [brewnet.dev@gmail.com](mailto:brewnet.dev@gmail.com)
- Website: [https://www.brewnet.dev](https://www.brewnet.dev)

---

## License

[MIT](LICENSE)
