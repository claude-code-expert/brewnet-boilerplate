# Brewnet -- Java Spring Boot Stack

> Java 21 + Spring Boot 3.3 + JPA + HikariCP + React 19 + Vite 6 + TypeScript

**Part of the [Brewnet Boilerplate](../../README.md) monorepo** — see root README for full stack list, CLI usage, and clone instructions. / [Brewnet Boilerplate](../../README.md) 모노레포의 일부입니다 — 전체 스택 목록, CLI 사용법, 클론 방법은 루트 README를 참고하세요.

Fullstack boilerplate with multi-DB support (PostgreSQL, MySQL, SQLite3). Spring Boot auto-configuration handles DB switching via `spring.profiles.active` mapped from `DB_DRIVER`.

PostgreSQL, MySQL, SQLite3 멀티 DB를 지원하는 풀스택 보일러플레이트입니다. `DB_DRIVER` 환경 변수가 `spring.profiles.active`로 매핑되어 DB를 자동 전환합니다.

---

## Prerequisites / 사전 요구사항

### JDK 21

```bash
# macOS (Homebrew)
brew install temurin@21

# SDKMAN (recommended / 권장)
sdk install java 21.0.5-tem

# Verify / 확인
java -version
```

> Gradle is included via the `gradlew` wrapper -- no separate install needed.
>
> Gradle은 `gradlew` 래퍼로 포함되어 있어 별도 설치가 필요 없습니다.

### Node.js 22+

Required for the frontend dev server.

프론트엔드 개발 서버에 필요합니다.

```bash
# macOS (Homebrew)
brew install node@22

# Verify / 확인
node -v
```

### Docker Desktop

Required for `make dev` (Docker Compose).

`make dev` 실행에 필요합니다 (Docker Compose).

---

## Quick Start (Docker) / 빠른 시작

```bash
cp .env.example .env
make dev
```

> **Tip / 팁**: You can also start this stack from the [Brewnet Dashboard](../../dashboard/) — a browser UI that manages all 16 stacks with live status, README viewer, and inline API Explorer.
> [Brewnet Dashboard](../../dashboard/)에서 이 스택을 시작할 수도 있습니다 — 16개 스택의 실행 상태, README, API 테스트를 브라우저에서 한 번에 관리합니다.

| URL | Description / 설명 |
|-----|---------------------|
| http://localhost:3000 | Frontend -- React app displaying "Hello from Spring Boot!" |
| http://localhost:8080 | Backend root |
| http://localhost:8080/health | Health check endpoint |
| http://localhost:8080/api/hello | Hello API |

---

## Local Development (without Docker) / 로컬 개발 (Docker 없이)

### Backend

```bash
cd backend

# Run with SQLite3 (no external DB required)
# SQLite3로 실행 (외부 DB 불필요)
DB_DRIVER=sqlite3 ./gradlew bootRun
```

The backend starts on `http://localhost:8080`.

백엔드가 `http://localhost:8080`에서 시작됩니다.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173` (Vite dev server).

프론트엔드가 `http://localhost:5173`에서 시작됩니다 (Vite 개발 서버).

---

## API Endpoints / API 엔드포인트

| Method | Path | Description / 설명 |
|--------|------|---------------------|
| `GET` | `/` | Service info / 서비스 정보 |
| `GET` | `/health` | Health check / 헬스 체크 |
| `GET` | `/api/hello` | Hello message / 인사 메시지 |
| `POST` | `/api/echo` | Echo request body / 요청 본문 반환 |

### Response Examples / 응답 예시

**GET /**
```json
{
  "service": "springboot-backend",
  "status": "running",
  "message": "🍺 Brewnet says hello!"
}
```

**GET /health**
```json
{
  "status": "ok",
  "timestamp": "2026-03-01T12:00:00.000Z",
  "db_connected": true
}
```

**GET /api/hello**
```json
{
  "message": "Hello from Spring Boot!",
  "lang": "java",
  "version": "21.0.5"
}
```

**POST /api/echo**
```bash
curl -s -X POST http://localhost:8080/api/echo \
  -H "Content-Type: application/json" \
  -d '{"test": "brewnet"}'
```
```json
{
  "test": "brewnet"
}
```

---

## Database Configuration / 데이터베이스 설정

Switch databases by changing `DB_DRIVER` in `.env` and restarting:

`.env`에서 `DB_DRIVER`를 변경하고 재시작하여 DB를 전환합니다:

```bash
make down
# Edit .env: DB_DRIVER=postgres | mysql | sqlite3
make dev
```

Spring Boot maps `DB_DRIVER` to `spring.profiles.active`, loading the corresponding `application-{profile}.yml`.

Spring Boot는 `DB_DRIVER`를 `spring.profiles.active`로 매핑하여 해당하는 `application-{profile}.yml`을 로드합니다.

### PostgreSQL (default / 기본값)

| Property | Value |
|----------|-------|
| Profile | `application-postgres.yml` |
| JDBC URL (container) | `jdbc:postgresql://postgres:5432/brewnet` |
| JDBC URL (host) | `jdbc:postgresql://localhost:5433/brewnet` |
| Driver | `org.postgresql.Driver` |
| Dialect | `org.hibernate.dialect.PostgreSQLDialect` |
| Host port | `5433` |

```yaml
# application-postgres.yml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:postgres}:${DB_PORT:5432}/${DB_NAME:brewnet}
    username: ${DB_USER:brewnet}
    password: ${DB_PASSWORD:}
    driver-class-name: org.postgresql.Driver
```

### MySQL

| Property | Value |
|----------|-------|
| Profile | `application-mysql.yml` |
| JDBC URL (container) | `jdbc:mysql://mysql:3306/brewnet?useSSL=false&allowPublicKeyRetrieval=true` |
| JDBC URL (host) | `jdbc:mysql://localhost:3307/brewnet?useSSL=false&allowPublicKeyRetrieval=true` |
| Driver | `com.mysql.cj.jdbc.Driver` |
| Dialect | `org.hibernate.dialect.MySQLDialect` |
| Host port | `3307` |

```yaml
# application-mysql.yml
spring:
  datasource:
    url: jdbc:mysql://${MYSQL_HOST:mysql}:${MYSQL_PORT:3306}/${MYSQL_DATABASE:brewnet}?useSSL=false&allowPublicKeyRetrieval=true
    username: ${MYSQL_USER:brewnet}
    password: ${MYSQL_PASSWORD:}
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### SQLite3

| Property | Value |
|----------|-------|
| Profile | `application-sqlite3.yml` |
| JDBC URL | `jdbc:sqlite:/app/data/brewnet.db` |
| Driver | `org.sqlite.JDBC` |
| Dialect | `org.hibernate.community.dialect.SQLiteDialect` |
| Note | No external DB service needed / 외부 DB 서비스 불필요 |

```yaml
# application-sqlite3.yml
spring:
  datasource:
    url: jdbc:sqlite:${SQLITE_PATH:./data/brewnet.db}
    driver-class-name: org.sqlite.JDBC
```

> SQLite3 uses the `hibernate-community-dialects` module for the `SQLiteDialect`.
>
> SQLite3는 `SQLiteDialect`를 위해 `hibernate-community-dialects` 모듈을 사용합니다.

---

## Environment Variables / 환경 변수

| Variable | Default | Description / 설명 |
|----------|---------|---------------------|
| `PROJECT_NAME` | `brewnet` | Project name / 프로젝트 이름 |
| `DOMAIN` | `localhost` | Domain / 도메인 |
| `DB_DRIVER` | `postgres` | Database driver: `postgres`, `mysql`, `sqlite3` / DB 드라이버 |
| `BACKEND_PORT` | `8080` | Backend host port / 백엔드 호스트 포트 |
| `FRONTEND_PORT` | `3000` | Frontend host port / 프론트엔드 호스트 포트 |
| `TZ` | `Asia/Seoul` | Timezone / 타임존 |
| `STACK_LANG` | `java-springboot` | Stack identifier / 스택 식별자 |
| `DB_HOST` | `postgres` | PostgreSQL host / PostgreSQL 호스트 |
| `DB_PORT` | `5432` | PostgreSQL port / PostgreSQL 포트 |
| `DB_NAME` | `brewnet` | PostgreSQL database name / PostgreSQL DB 이름 |
| `DB_USER` | `brewnet` | PostgreSQL user / PostgreSQL 사용자 |
| `DB_PASSWORD` | `brewnet_secret` | PostgreSQL password / PostgreSQL 비밀번호 |
| `MYSQL_HOST` | `mysql` | MySQL host / MySQL 호스트 |
| `MYSQL_PORT` | `3306` | MySQL port / MySQL 포트 |
| `MYSQL_DATABASE` | `brewnet` | MySQL database name / MySQL DB 이름 |
| `MYSQL_USER` | `brewnet` | MySQL user / MySQL 사용자 |
| `MYSQL_PASSWORD` | `brewnet_secret` | MySQL password / MySQL 비밀번호 |
| `MYSQL_ROOT_PASSWORD` | `root_secret` | MySQL root password / MySQL 루트 비밀번호 |
| `SQLITE_PATH` | `/app/data/brewnet.db` | SQLite3 file path / SQLite3 파일 경로 |

---

## Makefile Targets / Makefile 타겟

| Target | Command | Description / 설명 |
|--------|---------|---------------------|
| `make dev` | `docker compose up --build` | Build and start all services / 빌드 후 전체 서비스 시작 |
| `make build` | `docker compose build` | Build Docker images / Docker 이미지 빌드 |
| `make up` | `docker compose up -d` | Start in production mode (detached) / 프로덕션 모드 시작 |
| `make down` | `docker compose down` | Stop all services / 전체 서비스 중지 |
| `make logs` | `docker compose logs -f` | Follow service logs / 서비스 로그 추적 |
| `make test` | `docker compose run --rm backend ./gradlew test` | Run backend tests / 백엔드 테스트 실행 |
| `make clean` | `docker compose down -v --rmi local` | Remove containers, volumes, images / 컨테이너, 볼륨, 이미지 제거 |
| `make validate` | `bash ../../shared/scripts/validate.sh` | Verify API endpoints / API 엔드포인트 검증 |

---

## Project Structure / 프로젝트 구조

```
stacks/java-springboot/
├── backend/
│   ├── src/main/java/dev/brewnet/app/
│   │   ├── Application.java              # @SpringBootApplication entry point
│   │   └── controller/
│   │       └── RootController.java       # 4 REST endpoints (/, /health, /api/hello, /api/echo)
│   ├── src/main/resources/
│   │   ├── application.yml               # Common config (port, profile activation)
│   │   ├── application-postgres.yml      # PostgreSQL datasource config
│   │   ├── application-mysql.yml         # MySQL datasource config
│   │   └── application-sqlite3.yml       # SQLite3 datasource config
│   ├── build.gradle.kts                  # Gradle build (Spring Boot 3.3, JPA, multi-DB drivers)
│   ├── settings.gradle.kts               # Project name: brewnet-java-backend
│   ├── Dockerfile                        # Multi-stage: eclipse-temurin:21-jdk -> 21-jre-alpine
│   └── .dockerignore
├── frontend/                             # React 19 + Vite 6 + TypeScript
│   ├── src/
│   ├── Dockerfile                        # Multi-stage: node:22-alpine -> nginx
│   └── .dockerignore
├── docker-compose.yml                    # backend + frontend + postgres + mysql services
├── Makefile                              # Uniform targets (dev, build, up, down, logs, test, clean, validate)
├── .env.example                          # Environment variable template
└── README.md
```

### Key Dependencies / 주요 의존성

| Dependency | Version | Purpose / 용도 |
|------------|---------|-----------------|
| Spring Boot | 3.3.0 | Application framework / 애플리케이션 프레임워크 |
| Spring Boot Starter Web | 3.3.x | REST API with embedded Tomcat / 내장 Tomcat REST API |
| Spring Boot Starter Data JPA | 3.3.x | JPA + Hibernate ORM |
| PostgreSQL Driver | (managed) | PostgreSQL JDBC driver / PostgreSQL JDBC 드라이버 |
| MySQL Connector/J | (managed) | MySQL JDBC driver / MySQL JDBC 드라이버 |
| SQLite JDBC | (managed) | SQLite3 JDBC driver / SQLite3 JDBC 드라이버 |
| Hibernate Community Dialects | (managed) | SQLiteDialect support / SQLiteDialect 지원 |

### Docker Architecture / Docker 아키텍처

| Service | Image | Port Mapping | Network |
|---------|-------|--------------|---------|
| backend | `eclipse-temurin:21-jdk` -> `21-jre-alpine` | `8080:8080` | `brewnet`, `brewnet-internal` |
| frontend | `node:22-alpine` -> `nginx` | `3000:80` | `brewnet` |
| postgres | `postgres:16-alpine` | `5433:5432` | `brewnet-internal` |
| mysql | `mysql:8.4` | `3307:3306` | `brewnet-internal` |

---

## Validation / 검증

```bash
make validate
```

This runs the shared validation script that verifies all 4 API endpoints return expected responses.

공유 검증 스크립트를 실행하여 4개의 API 엔드포인트가 예상 응답을 반환하는지 확인합니다.
