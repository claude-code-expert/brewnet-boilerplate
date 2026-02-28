# API Contract: Brewnet Backend

**Version**: 1.0.0
**Base URL**: `http://localhost:8080`
**Content-Type**: `application/json`

모든 5개 스택은 이 contract을 정확히 동일하게 구현해야 한다.

---

## GET /

서비스 기본 정보를 반환한다.

**Request**: No parameters

**Response** (200 OK):
```json
{
  "service": "{lang}-backend",
  "status": "running",
  "message": "🍺 Brewnet says hello!"
}
```

**Field Rules**:
- `service`: `{lang}-backend` 형식. lang은 `go`, `rust`, `java`, `node`, `python` 중 하나
- `status`: 항상 `"running"`
- `message`: 항상 `"🍺 Brewnet says hello!"`

**Example**:
```bash
curl -s http://localhost:8080/ | jq .
```

---

## GET /health

헬스체크. DB 연결 상태를 포함한다.

**Request**: No parameters

**Response** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2026-02-28T12:00:00Z",
  "db_connected": true
}
```

**Field Rules**:
- `status`: 항상 `"ok"` (서버가 응답 가능한 상태이면)
- `timestamp`: ISO 8601 형식, 현재 시각
- `db_connected`: boolean — 실제 DB에 ping/query를 수행한 결과
  - PostgreSQL/MySQL: connection pool에서 simple query 실행
  - SQLite3: 파일 접근 가능 여부

**Example**:
```bash
curl -s http://localhost:8080/health | jq .
```

---

## GET /api/hello

프론트엔드 연동 확인용 엔드포인트.

**Request**: No parameters

**Response** (200 OK):
```json
{
  "message": "Hello from Node!",
  "lang": "node",
  "version": "22.0.0"
}
```

**Field Rules**:
- `message`: `"Hello from {Lang}!"` 형식. Lang은 대문자 시작 (`Go`, `Rust`, `Java`, `Node`, `Python`)
- `lang`: 소문자 스택 식별자 (`go`, `rust`, `java`, `node`, `python`)
- `version`: 런타임 버전 문자열 (Go: `runtime.Version()`, Rust: env CARGO_PKG_VERSION, Java: `System.getProperty("java.version")`, Node: `process.version`, Python: `sys.version`)

**Example**:
```bash
curl -s http://localhost:8080/api/hello | jq .
```

---

## POST /api/echo

요청 body를 그대로 반환한다.

**Request**:
- Content-Type: `application/json`
- Body: 임의 JSON

**Response** (200 OK):
- 요청 body를 그대로 반환

**Field Rules**:
- Request body가 valid JSON이면 그대로 반환
- 빈 body인 경우 빈 객체 `{}` 반환

**Example**:
```bash
curl -s -X POST http://localhost:8080/api/echo \
  -H "Content-Type: application/json" \
  -d '{"test":"brewnet","number":42}' | jq .
```

**Expected Response**:
```json
{
  "test": "brewnet",
  "number": 42
}
```

---

## Error Responses

이 보일러플레이트에서는 커스텀 에러 핸들링을 구현하지 않는다. 프레임워크 기본 에러 응답을 사용한다.

- **404**: 정의되지 않은 경로 접근 시 프레임워크 기본 404
- **405**: 지원하지 않는 HTTP method 사용 시 프레임워크 기본 405
- **500**: 서버 내부 오류 시 프레임워크 기본 500

## CORS

- Allowed Origin: `http://localhost:3000` (프론트엔드)
- Allowed Methods: `GET`, `POST`, `OPTIONS`
- Allowed Headers: `Content-Type`
