# Brewnet -- Kotlin Ktor Stack

> Kotlin 2.1 + Ktor 3.1 + Exposed ORM 0.58 + kotlinx.serialization + Netty + React 19 + Vite 6 + TypeScript
>
> Kotlin 2.1 + Ktor 3.1 + Exposed ORM 0.58 + kotlinx.serialization + Netty + React 19 + Vite 6 + TypeScript

Fullstack boilerplate with multi-DB support (PostgreSQL, MySQL, SQLite3). Uses Ktor with the Netty engine, Exposed ORM for database access, and kotlinx.serialization for JSON handling. Database switching is controlled by the `DB_DRIVER` environment variable in `Database.kt`.

PostgreSQL, MySQL, SQLite3 멀티 DB를 지원하는 풀스택 보일러플레이트입니다. Netty 엔진의 Ktor, 데이터베이스 접근용 Exposed ORM, JSON 처리용 kotlinx.serialization을 사용합니다. `Database.kt`에서 `DB_DRIVER` 환경 변수로 DB를 전환합니다.

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
| http://localhost:3000 | Frontend -- React app displaying "Hello from Ktor!" |
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
DB_DRIVER=sqlite3 ./gradlew run
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
  "service": "ktor-backend",
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
  "message": "Hello from Ktor!",
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

### Serialization Note / 직렬화 참고

JSON responses use `buildJsonObject { put("key", value) }` from kotlinx.serialization. This approach is used instead of `mapOf()` because `kotlinx.serialization` cannot serialize `Map<String, Any>` with mixed types (String + Boolean).

JSON 응답은 kotlinx.serialization의 `buildJsonObject { put("key", value) }`를 사용합니다. `kotlinx.serialization`이 혼합 타입(String + Boolean)의 `Map<String, Any>`를 직렬화할 수 없기 때문에 이 방식을 사용합니다.

---

## Database Configuration / 데이터베이스 설정

Switch databases by changing `DB_DRIVER` in `.env` and restarting:

`.env`에서 `DB_DRIVER`를 변경하고 재시작하여 DB를 전환합니다:

```bash
make down
# Edit .env: DB_DRIVER=postgres | mysql | sqlite3
make dev
```

`Database.kt` uses Exposed ORM's `Database.connect()` with JDBC URLs. The `when` block selects the driver based on `DB_DRIVER`.

`Database.kt`는 Exposed ORM의 `Database.connect()`를 JDBC URL과 함께 사용합니다. `when` 블록에서 `DB_DRIVER`에 따라 드라이버를 선택합니다.

### PostgreSQL (default / 기본값)

| Property | Value |
|----------|-------|
| Connection URL (container) | `jdbc:postgresql://postgres:5432/brewnet` |
| Connection URL (host) | `jdbc:postgresql://localhost:5433/brewnet` |
| JDBC Driver | `org.postgresql.Driver` |
| Driver version | `42.7.4` |
| Host port | `5433` |

```kotlin
// Database.kt - postgres case
Database.connect(
    url = "jdbc:postgresql://${env("DB_HOST", "postgres")}:${env("DB_PORT", "5432")}/${env("DB_NAME", "brewnet")}",
    driver = "org.postgresql.Driver",
    user = env("DB_USER", "brewnet"),
    password = env("DB_PASSWORD", "")
)
```

### MySQL

| Property | Value |
|----------|-------|
| Connection URL (container) | `jdbc:mysql://mysql:3306/brewnet` |
| Connection URL (host) | `jdbc:mysql://localhost:3307/brewnet` |
| JDBC Driver | `com.mysql.cj.jdbc.Driver` |
| Driver version | `9.1.0` |
| Host port | `3307` |

```kotlin
// Database.kt - mysql case
Database.connect(
    url = "jdbc:mysql://${env("MYSQL_HOST", "mysql")}:${env("MYSQL_PORT", "3306")}/${env("MYSQL_DATABASE", "brewnet")}",
    driver = "com.mysql.cj.jdbc.Driver",
    user = env("MYSQL_USER", "brewnet"),
    password = env("MYSQL_PASSWORD", "")
)
```

### SQLite3

| Property | Value |
|----------|-------|
| Connection URL | `jdbc:sqlite:/app/data/brewnet.db` |
| JDBC Driver | `org.sqlite.JDBC` |
| Driver version | `3.47.2.0` |
| Note | No external DB service needed / 외부 DB 서비스 불필요 |

```kotlin
// Database.kt - sqlite3 case
Database.connect(
    url = "jdbc:sqlite:${env("SQLITE_PATH", "/app/data/brewnet.db")}",
    driver = "org.sqlite.JDBC"
)
```

> Health check uses `transaction { exec("SELECT 1") }` via Exposed to verify DB connectivity. Connection failure is handled gracefully -- the app starts even without a DB.
>
> 헬스 체크는 Exposed의 `transaction { exec("SELECT 1") }`를 사용하여 DB 연결을 확인합니다. 연결 실패 시에도 앱은 정상 기동됩니다.

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
| `STACK_LANG` | `kotlin-ktor` | Stack identifier / 스택 식별자 |
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
stacks/kotlin-ktor/
├── backend/
│   ├── src/main/kotlin/dev/brewnet/app/
│   │   ├── Application.kt               # Ktor Netty embedded server entry point (port 8080)
│   │   └── plugins/
│   │       ├── Database.kt              # Exposed ORM multi-DB connection (postgres/mysql/sqlite3)
│   │       ├── Routing.kt              # 4 route handlers (/, /health, /api/hello, /api/echo)
│   │       └── Serialization.kt        # ContentNegotiation + kotlinx.serialization JSON
│   ├── build.gradle.kts                 # Gradle build (Kotlin 2.1.10, Ktor 3.1.1, Exposed 0.58.0)
│   ├── settings.gradle.kts              # Project name: kotlin-ktor-backend
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

### Key Dependencies / 주요 의존성

| Dependency | Version | Purpose / 용도 |
|------------|---------|-----------------|
| Kotlin | 2.1.10 | Programming language / 프로그래밍 언어 |
| Ktor Server Core | 3.1.1 | HTTP server framework / HTTP 서버 프레임워크 |
| Ktor Server Netty | 3.1.1 | Netty engine / Netty 엔진 |
| Ktor Server CORS | 3.1.1 | CORS plugin / CORS 플러그인 |
| Ktor ContentNegotiation | 3.1.1 | Content negotiation plugin / 콘텐츠 협상 플러그인 |
| kotlinx.serialization JSON | 3.1.1 | JSON serialization / JSON 직렬화 |
| Exposed Core | 0.58.0 | Exposed ORM core / Exposed ORM 코어 |
| Exposed JDBC | 0.58.0 | Exposed JDBC integration / Exposed JDBC 통합 |
| PostgreSQL Driver | 42.7.4 | PostgreSQL JDBC driver |
| MySQL Connector/J | 9.1.0 | MySQL JDBC driver |
| SQLite JDBC | 3.47.2.0 | SQLite3 JDBC driver |
| Logback Classic | 1.5.16 | Logging framework / 로깅 프레임워크 |

### Docker Architecture / Docker 아키텍처

| Service | Image | Port Mapping | Network |
|---------|-------|--------------|---------|
| backend | `gradle:8.12-jdk21` -> `eclipse-temurin:21-jre-alpine` | `8080:8080` | `brewnet`, `brewnet-internal` |
| frontend | `node:22-alpine` -> `nginx` | `3000:80` | `brewnet` |
| postgres | `postgres:16-alpine` | `5433:5432` | `brewnet-internal` |
| mysql | `mysql:8.4` | `3307:3306` | `brewnet-internal` |

> The backend is packaged as a fat JAR via Ktor's `buildFatJar` Gradle task, producing `app.jar`.
>
> 백엔드는 Ktor의 `buildFatJar` Gradle 태스크를 통해 fat JAR(`app.jar`)로 패키징됩니다.

---

## Validation / 검증

```bash
make validate
```

This runs the shared validation script that verifies all 4 API endpoints return expected responses.

공유 검증 스크립트를 실행하여 4개의 API 엔드포인트가 예상 응답을 반환하는지 확인합니다.
