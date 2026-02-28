# API Contract: Brewnet Stack Endpoints

**Date**: 2026-02-28
**Applies to**: All 15 stacks (5 existing + 10 new)

## Base URL

```
http://localhost:{BACKEND_PORT}  (default: 8080)
```

**Exception**: `nodejs-nextjs` uses port 3000 directly (unified frontend+backend).

---

## Endpoints

### 1. GET /

**Purpose**: Service identification and status.

**Request**: No parameters.

**Response** (200 OK):

```json
{
  "service": "<framework>-backend",
  "status": "running",
  "message": "🍺 Brewnet says hello!"
}
```

**Constraints**:
- `service`: MUST be `{framework}-backend` (lowercase, hyphenated)
- `status`: MUST be literal `"running"`
- `message`: MUST be literal `"🍺 Brewnet says hello!"`
- Content-Type: `application/json`

**Framework-specific `service` values**:

| Stack | service |
|-------|---------|
| python-django | `django-backend` |
| python-flask | `flask-backend` |
| go-echo | `echo-backend` |
| go-fiber | `fiber-backend` |
| rust-axum | `axum-backend` |
| nodejs-nestjs | `nestjs-backend` |
| nodejs-nextjs | `nextjs-backend` |
| java-spring | `spring-backend` |
| kotlin-ktor | `ktor-backend` |
| kotlin-springboot | `springboot-kt-backend` |

---

### 2. GET /health

**Purpose**: Health check with database connectivity status.

**Request**: No parameters.

**Response** (200 OK):

```json
{
  "status": "ok",
  "timestamp": "2026-02-28T12:00:00.000Z",
  "db_connected": true
}
```

**Constraints**:
- `status`: MUST be literal `"ok"`
- `timestamp`: MUST be ISO 8601 format
- `db_connected`: MUST be boolean (`true`/`false`), reflects actual DB ping result
- Content-Type: `application/json`
- MUST return 200 even when `db_connected: false`

**DB Connection Check Logic**:

```text
1. Execute: SELECT 1
2. If success within timeout → db_connected: true
3. If exception or timeout → db_connected: false
4. Always return 200 OK (health endpoint should not fail)
```

---

### 3. GET /api/hello

**Purpose**: Framework greeting with language and version info.

**Request**: No parameters.

**Response** (200 OK):

```json
{
  "message": "Hello from <Framework>!",
  "lang": "<language>",
  "version": "<version>"
}
```

**Constraints**:
- `message`: MUST be `"Hello from {Framework}!"` (exact framework name with proper casing)
- `lang`: MUST be the language identifier (lowercase)
- `version`: Framework or runtime version string
- Content-Type: `application/json`

**Framework-specific values**:

| Stack | message | lang | version source |
|-------|---------|------|----------------|
| python-django | `Hello from Django!` | `python` | `django.VERSION` |
| python-flask | `Hello from Flask!` | `python` | `flask.__version__` |
| go-echo | `Hello from Echo!` | `go` | `echo.Version` |
| go-fiber | `Hello from Fiber!` | `go` | `fiber.Version` |
| rust-axum | `Hello from Axum!` | `rust` | Cargo.toml version or env |
| nodejs-nestjs | `Hello from NestJS!` | `nodejs` | `process.version` |
| nodejs-nextjs | `Hello from Next.js!` | `nodejs` | `process.version` |
| java-spring | `Hello from Spring Framework!` | `java` | `Runtime.version()` |
| kotlin-ktor | `Hello from Ktor!` | `kotlin` | `KotlinVersion.CURRENT` |
| kotlin-springboot | `Hello from Spring Boot (Kotlin)!` | `kotlin` | `KotlinVersion.CURRENT` |

---

### 4. POST /api/echo

**Purpose**: Echo back request body (connectivity validation).

**Request**:
- Content-Type: `application/json`
- Body: Any valid JSON

```json
{
  "any": "json",
  "data": 123,
  "nested": { "key": "value" }
}
```

**Response** (200 OK):
- Content-Type: `application/json`
- Body: Identical to request body

```json
{
  "any": "json",
  "data": 123,
  "nested": { "key": "value" }
}
```

**Constraints**:
- MUST echo back the exact JSON body received
- Empty body → empty JSON object `{}` or 400 (implementation-specific)
- Non-JSON body → 400 Bad Request or 415 Unsupported Media Type

---

## CORS Configuration

All stacks MUST allow:

```text
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Error Responses

Not explicitly required for this boilerplate. Framework-default error handling is acceptable.

---

## Validation Script Contract

The shared validation script (`shared/scripts/validate.sh`) checks:

```bash
# 1. GET / → service field exists, status == "running"
curl -s http://localhost:8080/ | jq -e '.status == "running"'

# 2. GET /health → status == "ok", db_connected field exists
curl -s http://localhost:8080/health | jq -e '.status == "ok" and has("db_connected")'

# 3. GET /api/hello → message, lang, version fields exist
curl -s http://localhost:8080/api/hello | jq -e 'has("message") and has("lang") and has("version")'

# 4. POST /api/echo → echo back
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"test":"echo"}' http://localhost:8080/api/echo | jq -e '.test == "echo"'
```

---

## Docker Labels Contract

All backend services MUST include:

```yaml
labels:
  - "com.brewnet.stack={lang}-{framework}"
  - "com.brewnet.role=backend"
```

All frontend services (when present) MUST include:

```yaml
labels:
  - "com.brewnet.stack={lang}-{framework}"
  - "com.brewnet.role=frontend"
```
