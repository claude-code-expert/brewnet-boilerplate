# Brewnet -- Kotlin Spring Boot Stack

> Kotlin 2.1 + Spring Boot 3.4 + Spring JDBC (JdbcTemplate) + HikariCP + React 19 + Vite 6 + TypeScript
>
> Kotlin 2.1 + Spring Boot 3.4 + Spring JDBC (JdbcTemplate) + HikariCP + React 19 + Vite 6 + TypeScript

Fullstack boilerplate with multi-DB support (PostgreSQL, MySQL, SQLite3). Uses Spring Boot with Kotlin, Spring JDBC (`JdbcTemplate`) for database access (not JPA), and HikariCP for connection pooling. Database switching is handled by `DataSourceConfig.kt` reading the `DB_DRIVER` environment variable. Spring Boot's `DataSourceAutoConfiguration` is explicitly disabled.

PostgreSQL, MySQL, SQLite3 멀티 DB를 지원하는 풀스택 보일러플레이트입니다. Kotlin + Spring Boot, 데이터베이스 접근용 Spring JDBC(`JdbcTemplate`, JPA 미사용), 커넥션 풀링용 HikariCP를 사용합니다. `DataSourceConfig.kt`에서 `DB_DRIVER` 환경 변수를 읽어 DB를 전환합니다. Spring Boot의 `DataSourceAutoConfiguration`은 명시적으로 비활성화되어 있습니다.

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

> Kotlin 2.1 and Gradle are included via the `gradlew` wrapper -- no separate Kotlin or Gradle install needed.
>
> Kotlin 2.1과 Gradle은 `gradlew` 래퍼로 포함되어 있어 별도의 Kotlin 또는 Gradle 설치가 필요 없습니다.

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

| URL | Description / 설명 |
|-----|---------------------|
| http://localhost:3000 | Frontend -- React app displaying "Hello from Spring Boot (Kotlin)!" |
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
  "service": "springboot-kt-backend",
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
  "message": "Hello from Spring Boot (Kotlin)!",
  "lang": "kotlin",
  "version": "2.1.10"
}
```

> Note: The `version` field uses `KotlinVersion.CURRENT.toString()` which returns the Kotlin stdlib version.
>
> 참고: `version` 필드는 `KotlinVersion.CURRENT.toString()`을 사용하여 Kotlin 표준 라이브러리 버전을 반환합니다.

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

## Key Differences from java-springboot / java-springboot과의 차이점

| Feature | java-springboot | kotlin-springboot |
|---------|----------------|-------------------|
| Language | Java 21 | Kotlin 2.1 |
| DB Access | Spring Data JPA + Hibernate | Spring JDBC (`JdbcTemplate`) + HikariCP |
| DataSource config | Spring Boot auto-config via profiles | Manual `DataSourceConfig.kt` with `DB_DRIVER` env |
| Auto-configuration | Full (`@SpringBootApplication`) | Partial (excludes `DataSourceAutoConfiguration`) |
| Serialization | Jackson | Jackson + `jackson-module-kotlin` |
| Spring plugin | N/A | `kotlin("plugin.spring")` for open classes |

---

## Database Configuration / 데이터베이스 설정

Switch databases by changing `DB_DRIVER` in `.env` and restarting:

`.env`에서 `DB_DRIVER`를 변경하고 재시작하여 DB를 전환합니다:

```bash
make down
# Edit .env: DB_DRIVER=postgres | mysql | sqlite3
make dev
```

`DataSourceConfig.kt` reads `DB_DRIVER` and configures `HikariDataSource` with the appropriate JDBC driver and connection URL. `DataSourceAutoConfiguration` is excluded in `application.yml` to allow custom DataSource configuration.

`DataSourceConfig.kt`는 `DB_DRIVER`를 읽어 적절한 JDBC 드라이버와 연결 URL로 `HikariDataSource`를 구성합니다. 커스텀 DataSource 설정을 위해 `application.yml`에서 `DataSourceAutoConfiguration`이 제외되어 있습니다.

### PostgreSQL (default / 기본값)

| Property | Value |
|----------|-------|
| JDBC URL (container) | `jdbc:postgresql://postgres:5432/brewnet` |
| JDBC URL (host) | `jdbc:postgresql://localhost:5433/brewnet` |
| Driver class | `org.postgresql.Driver` |
| Host port | `5433` |

```kotlin
// DataSourceConfig.kt - postgres case (default)
config.apply {
    jdbcUrl = "jdbc:postgresql://${env("DB_HOST", "postgres")}:${env("DB_PORT", "5432")}/${env("DB_NAME", "brewnet")}"
    username = env("DB_USER", "brewnet")
    password = env("DB_PASSWORD", "")
    driverClassName = "org.postgresql.Driver"
}
```

### MySQL

| Property | Value |
|----------|-------|
| JDBC URL (container) | `jdbc:mysql://mysql:3306/brewnet` |
| JDBC URL (host) | `jdbc:mysql://localhost:3307/brewnet` |
| Driver class | `com.mysql.cj.jdbc.Driver` |
| Host port | `3307` |

```kotlin
// DataSourceConfig.kt - mysql case
config.apply {
    jdbcUrl = "jdbc:mysql://${env("MYSQL_HOST", "mysql")}:${env("MYSQL_PORT", "3306")}/${env("MYSQL_DATABASE", "brewnet")}"
    username = env("MYSQL_USER", "brewnet")
    password = env("MYSQL_PASSWORD", "")
    driverClassName = "com.mysql.cj.jdbc.Driver"
}
```

### SQLite3

| Property | Value |
|----------|-------|
| JDBC URL | `jdbc:sqlite:/app/data/brewnet.db` |
| Driver class | `org.sqlite.JDBC` |
| Note | No external DB service needed / 외부 DB 서비스 불필요 |

```kotlin
// DataSourceConfig.kt - sqlite3 case
config.apply {
    jdbcUrl = "jdbc:sqlite:${env("SQLITE_PATH", "/app/data/brewnet.db")}"
    driverClassName = "org.sqlite.JDBC"
}
```

> HikariCP pool is configured with `maximumPoolSize=5` and `initializationFailTimeout=-1` (graceful degradation when DB is unavailable).
>
> HikariCP 풀은 `maximumPoolSize=5`, `initializationFailTimeout=-1`로 설정되어 DB 미연결 시에도 정상 기동됩니다.

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
| `STACK_LANG` | `kotlin-springboot` | Stack identifier / 스택 식별자 |
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
| `make test` | `docker compose run --rm backend gradle test --no-daemon` | Run backend tests (JUnit 5) / 백엔드 테스트 실행 |
| `make clean` | `docker compose down -v --rmi local` | Remove containers, volumes, images / 컨테이너, 볼륨, 이미지 제거 |
| `make validate` | `bash ../../shared/scripts/validate.sh` | Verify API endpoints / API 엔드포인트 검증 |

---

## Project Structure / 프로젝트 구조

```
stacks/kotlin-springboot/
├── backend/
│   ├── src/main/kotlin/dev/brewnet/app/
│   │   ├── Application.kt               # @SpringBootApplication entry point
│   │   ├── config/
│   │   │   └── DataSourceConfig.kt      # HikariCP multi-DB DataSource bean (postgres/mysql/sqlite3)
│   │   └── controller/
│   │       └── ApiController.kt         # 4 REST endpoints (/, /health, /api/hello, /api/echo)
│   ├── src/main/resources/
│   │   └── application.yml              # Server port + DataSourceAutoConfiguration exclusion
│   ├── build.gradle.kts                 # Gradle build (Kotlin 2.1.10, Spring Boot 3.4.3, Spring JDBC)
│   ├── settings.gradle.kts              # Project name: kotlin-springboot-backend
│   ├── Dockerfile                       # Multi-stage: gradle:8.12-jdk21 -> eclipse-temurin:21-jre-alpine
│   └── .dockerignore
├── frontend/                            # React 19 + Vite 6 + TypeScript
│   ├── src/
│   ├── Dockerfile                       # Multi-stage: node:22-alpine -> nginx
│   └── .dockerignore
├── docker-compose.yml                   # backend + frontend + postgres + mysql services
├── Makefile                             # Uniform targets (dev, build, up, down, logs, test, clean, validate)
├── .env.example                         # Environment variable template
└── README.md
```

### application.yml Configuration / application.yml 설정

```yaml
server:
  port: 8080

spring:
  main:
    banner-mode: off
  autoconfigure:
    exclude:
      - org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
```

> `DataSourceAutoConfiguration` is excluded because `DataSourceConfig.kt` provides a custom DataSource bean based on `DB_DRIVER`.
>
> `DataSourceConfig.kt`가 `DB_DRIVER`에 기반한 커스텀 DataSource 빈을 제공하므로 `DataSourceAutoConfiguration`이 제외됩니다.

### Key Dependencies / 주요 의존성

| Dependency | Version | Purpose / 용도 |
|------------|---------|-----------------|
| Kotlin | 2.1.10 | Programming language / 프로그래밍 언어 |
| Spring Boot | 3.4.3 | Application framework / 애플리케이션 프레임워크 |
| Spring Boot Starter Web | 3.4.x | REST API with embedded Tomcat / 내장 Tomcat REST API |
| Spring Boot Starter JDBC | 3.4.x | JdbcTemplate for database access / DB 접근용 JdbcTemplate |
| Jackson Module Kotlin | (managed) | Kotlin class serialization / Kotlin 클래스 직렬화 |
| Kotlin Reflect | (managed) | Kotlin reflection support / Kotlin 리플렉션 지원 |
| PostgreSQL Driver | (managed) | PostgreSQL JDBC driver |
| MySQL Connector/J | (managed) | MySQL JDBC driver |
| SQLite JDBC | (managed) | SQLite3 JDBC driver |
| kotlin-plugin-spring | 2.1.10 | Makes Spring classes open / Spring 클래스 open 처리 |

### Docker Architecture / Docker 아키텍처

| Service | Image | Port Mapping | Network |
|---------|-------|--------------|---------|
| backend | `gradle:8.12-jdk21` -> `eclipse-temurin:21-jre-alpine` | `8080:8080` | `brewnet`, `brewnet-internal` |
| frontend | `node:22-alpine` -> `nginx` | `3000:80` | `brewnet` |
| postgres | `postgres:16-alpine` | `5433:5432` | `brewnet-internal` |
| mysql | `mysql:8.4` | `3307:3306` | `brewnet-internal` |

> The backend is packaged via Spring Boot's `bootJar` Gradle task.
>
> 백엔드는 Spring Boot의 `bootJar` Gradle 태스크로 패키징됩니다.

---

## Validation / 검증

```bash
make validate
```

This runs the shared validation script that verifies all 4 API endpoints return expected responses.

공유 검증 스크립트를 실행하여 4개의 API 엔드포인트가 예상 응답을 반환하는지 확인합니다.
