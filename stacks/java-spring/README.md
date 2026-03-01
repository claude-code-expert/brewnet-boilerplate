# Brewnet -- Java Spring Framework Stack

> Java 21 + Spring Framework 6.2 (pure, NOT Spring Boot) + Embedded Tomcat 10.1 + JDBC/HikariCP + React 19 + Vite 6 + TypeScript
>
> Java 21 + Spring Framework 6.2 (순수 Spring, Spring Boot 아님) + 내장 Tomcat 10.1 + JDBC/HikariCP + React 19 + Vite 6 + TypeScript

**Part of the [Brewnet Boilerplate](../../README.md) monorepo** — see root README for full stack list, CLI usage, and clone instructions. / [Brewnet Boilerplate](../../README.md) 모노레포의 일부입니다 — 전체 스택 목록, CLI 사용법, 클론 방법은 루트 README를 참고하세요.

Fullstack boilerplate with multi-DB support (PostgreSQL, MySQL, SQLite3). Uses pure Spring Framework with programmatic embedded Tomcat -- no Spring Boot auto-configuration. Database switching is handled by `DataSourceConfig.java` reading the `DB_DRIVER` environment variable.

PostgreSQL, MySQL, SQLite3 멀티 DB를 지원하는 풀스택 보일러플레이트입니다. Spring Boot 자동 설정 없이 순수 Spring Framework와 프로그래밍 방식의 내장 Tomcat을 사용합니다. `DataSourceConfig.java`에서 `DB_DRIVER` 환경 변수를 읽어 DB를 전환합니다.

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

> Maven is included via the `mvnw` wrapper -- no separate install needed. The Docker build uses `maven` installed in the builder stage.
>
> Maven은 `mvnw` 래퍼로 포함되어 있어 별도 설치가 필요 없습니다. Docker 빌드에서는 빌더 스테이지에 설치된 `maven`을 사용합니다.

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
| http://localhost:3000 | Frontend -- React app displaying "Hello from Spring Framework!" |
| http://localhost:8080 | Backend root |
| http://localhost:8080/health | Health check endpoint |
| http://localhost:8080/api/hello | Hello API |

---

## Local Development (without Docker) / 로컬 개발 (Docker 없이)

### Backend

```bash
cd backend

# Build the uber-JAR with Maven
# Maven으로 uber-JAR 빌드
mvn package -DskipTests

# Run with SQLite3 (no external DB required)
# SQLite3로 실행 (외부 DB 불필요)
DB_DRIVER=sqlite3 java -jar target/spring-backend-1.0.0.jar
```

Alternatively, using Maven exec plugin:

또는 Maven exec 플러그인 사용:

```bash
DB_DRIVER=sqlite3 mvn exec:java -Dexec.mainClass="dev.brewnet.app.Application"
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
  "service": "spring-backend",
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
  "message": "Hello from Spring Framework!",
  "lang": "java",
  "version": "21.0.5+11-LTS"
}
```

> Note: The `version` field uses `Runtime.version().toString()` which returns the full JDK version string.
>
> 참고: `version` 필드는 `Runtime.version().toString()`을 사용하여 전체 JDK 버전 문자열을 반환합니다.

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

## Key Differences from Spring Boot / Spring Boot과의 차이점

| Feature | java-springboot | java-spring |
|---------|----------------|-------------|
| Framework | Spring Boot 3.3 | Spring Framework 6.2 (pure) |
| Auto-configuration | `@SpringBootApplication` | Manual `@Configuration` classes |
| Build tool | Gradle (`build.gradle.kts`) | Maven (`pom.xml`) |
| Embedded server | Spring Boot auto-config | Programmatic `Tomcat` setup in `Application.java` |
| DataSource | Spring Boot auto-config + JPA profiles | Manual `HikariCP` + `JdbcTemplate` in `DataSourceConfig.java` |
| Packaging | `bootJar` (Spring Boot plugin) | `maven-shade-plugin` (uber-JAR) |
| DB switching | `spring.profiles.active` | `DB_DRIVER` env read in `DataSourceConfig` switch/case |

---

## Database Configuration / 데이터베이스 설정

Switch databases by changing `DB_DRIVER` in `.env` and restarting:

`.env`에서 `DB_DRIVER`를 변경하고 재시작하여 DB를 전환합니다:

```bash
make down
# Edit .env: DB_DRIVER=postgres | mysql | sqlite3
make dev
```

`DataSourceConfig.java` reads `DB_DRIVER` and configures `HikariDataSource` with the appropriate JDBC driver and connection URL.

`DataSourceConfig.java`는 `DB_DRIVER`를 읽어 적절한 JDBC 드라이버와 연결 URL로 `HikariDataSource`를 구성합니다.

### PostgreSQL (default / 기본값)

| Property | Value |
|----------|-------|
| JDBC URL (container) | `jdbc:postgresql://postgres:5432/brewnet` |
| JDBC URL (host) | `jdbc:postgresql://localhost:5433/brewnet` |
| Driver class | `org.postgresql.Driver` |
| Driver version | `42.7.4` |
| Host port | `5433` |

```java
// DataSourceConfig.java - postgres case
config.setJdbcUrl("jdbc:postgresql://" + env("DB_HOST", "postgres") + ":" + env("DB_PORT", "5432") + "/" + env("DB_NAME", "brewnet_db"));
config.setUsername(env("DB_USER", "brewnet"));
config.setPassword(env("DB_PASSWORD", ""));
config.setDriverClassName("org.postgresql.Driver");
```

### MySQL

| Property | Value |
|----------|-------|
| JDBC URL (container) | `jdbc:mysql://mysql:3306/brewnet` |
| JDBC URL (host) | `jdbc:mysql://localhost:3307/brewnet` |
| Driver class | `com.mysql.cj.jdbc.Driver` |
| Driver version | `9.1.0` |
| Host port | `3307` |

```java
// DataSourceConfig.java - mysql case
config.setJdbcUrl("jdbc:mysql://" + env("MYSQL_HOST", "mysql") + ":" + env("MYSQL_PORT", "3306") + "/" + env("MYSQL_DATABASE", "brewnet_db"));
config.setUsername(env("MYSQL_USER", "brewnet"));
config.setPassword(env("MYSQL_PASSWORD", ""));
config.setDriverClassName("com.mysql.cj.jdbc.Driver");
```

### SQLite3

| Property | Value |
|----------|-------|
| JDBC URL | `jdbc:sqlite:/app/data/brewnet_db.db` |
| Driver class | `org.sqlite.JDBC` |
| Driver version | `3.47.2.0` |
| Note | No external DB service needed / 외부 DB 서비스 불필요 |

```java
// DataSourceConfig.java - sqlite3 case
config.setJdbcUrl("jdbc:sqlite:" + env("SQLITE_PATH", "/app/data/brewnet_db.db"));
config.setDriverClassName("org.sqlite.JDBC");
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
| `STACK_LANG` | `java-spring` | Stack identifier / 스택 식별자 |
| `DB_HOST` | `postgres` | PostgreSQL host / PostgreSQL 호스트 |
| `DB_PORT` | `5432` | PostgreSQL port / PostgreSQL 포트 |
| `DB_NAME` | `brewnet_db` | PostgreSQL database name / PostgreSQL DB 이름 |
| `DB_USER` | `brewnet` | PostgreSQL user / PostgreSQL 사용자 |
| `DB_PASSWORD` | `password` | PostgreSQL password / PostgreSQL 비밀번호 |
| `MYSQL_HOST` | `mysql` | MySQL host / MySQL 호스트 |
| `MYSQL_PORT` | `3306` | MySQL port / MySQL 포트 |
| `MYSQL_DATABASE` | `brewnet_db` | MySQL database name / MySQL DB 이름 |
| `MYSQL_USER` | `brewnet` | MySQL user / MySQL 사용자 |
| `MYSQL_PASSWORD` | `password` | MySQL password / MySQL 비밀번호 |
| `MYSQL_ROOT_PASSWORD` | `password` | MySQL root password / MySQL 루트 비밀번호 |
| `SQLITE_PATH` | `/app/data/brewnet_db.db` | SQLite3 file path / SQLite3 파일 경로 |

---

## Makefile Targets / Makefile 타겟

| Target | Command | Description / 설명 |
|--------|---------|---------------------|
| `make dev` | `docker compose up --build` | Build and start all services / 빌드 후 전체 서비스 시작 |
| `make build` | `docker compose build` | Build Docker images / Docker 이미지 빌드 |
| `make up` | `docker compose up -d` | Start in production mode (detached) / 프로덕션 모드 시작 |
| `make down` | `docker compose down` | Stop all services / 전체 서비스 중지 |
| `make logs` | `docker compose logs -f` | Follow service logs / 서비스 로그 추적 |
| `make test` | `docker compose run --rm backend mvn test` | Run backend tests (Maven + JUnit 5) / 백엔드 테스트 실행 |
| `make clean` | `docker compose down -v --rmi local` | Remove containers, volumes, images / 컨테이너, 볼륨, 이미지 제거 |
| `make validate` | `bash ../../shared/scripts/validate.sh` | Verify API endpoints / API 엔드포인트 검증 |

---

## Project Structure / 프로젝트 구조

```
stacks/java-spring/
├── backend/
│   ├── src/main/java/dev/brewnet/app/
│   │   ├── Application.java              # Embedded Tomcat bootstrap (programmatic, no Spring Boot)
│   │   ├── config/
│   │   │   ├── WebConfig.java            # @EnableWebMvc + CORS + component scan
│   │   │   └── DataSourceConfig.java     # HikariCP multi-DB DataSource + JdbcTemplate bean
│   │   └── controller/
│   │       └── ApiController.java        # 4 REST endpoints (/, /health, /api/hello, /api/echo)
│   ├── pom.xml                           # Maven build (Spring Framework 6.2.3, Tomcat 10.1.34, HikariCP 6.2.1)
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
| Spring WebMVC | 6.2.3 | MVC framework + DispatcherServlet |
| Spring JDBC | 6.2.3 | JdbcTemplate for database access / DB 접근용 JdbcTemplate |
| Embedded Tomcat | 10.1.34 | Programmatic embedded server / 프로그래밍 방식 내장 서버 |
| HikariCP | 6.2.1 | Connection pool / 커넥션 풀 |
| Jackson Databind | 2.18.2 | JSON serialization / JSON 직렬화 |
| PostgreSQL Driver | 42.7.4 | PostgreSQL JDBC driver |
| MySQL Connector/J | 9.1.0 | MySQL JDBC driver |
| SQLite JDBC | 3.47.2.0 | SQLite3 JDBC driver |
| JUnit Jupiter | 5.11.4 | Testing framework / 테스트 프레임워크 |

### Docker Architecture / Docker 아키텍처

| Service | Image | Port Mapping | Network |
|---------|-------|--------------|---------|
| backend | `eclipse-temurin:21-jdk` -> `21-jre-alpine` | `8080:8080` | `brewnet`, `brewnet-internal` |
| frontend | `node:22-alpine` -> `nginx` | `3000:80` | `brewnet` |
| postgres | `postgres:16-alpine` | `5433:5432` | `brewnet-internal` |
| mysql | `mysql:8.4` | `3307:3306` | `brewnet-internal` |

> The backend is packaged as an uber-JAR via `maven-shade-plugin`. META-INF signature files (*.SF, *.DSA, *.RSA) are excluded to avoid `Invalid signature file digest` errors.
>
> 백엔드는 `maven-shade-plugin`으로 uber-JAR로 패키징됩니다. `Invalid signature file digest` 오류를 방지하기 위해 META-INF 서명 파일(*.SF, *.DSA, *.RSA)이 제외됩니다.

---

## Validation / 검증

```bash
make validate
```

This runs the shared validation script that verifies all 4 API endpoints return expected responses.

공유 검증 스크립트를 실행하여 4개의 API 엔드포인트가 예상 응답을 반환하는지 확인합니다.
