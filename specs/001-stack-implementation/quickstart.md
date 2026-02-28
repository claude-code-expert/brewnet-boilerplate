# Quickstart: Brewnet 5-Stack Implementation

**Date**: 2026-02-28

## Prerequisites

- Docker Desktop 또는 Docker Engine + Docker Compose v2
- 사용 가능한 포트: 8080, 3000, 5433, 3307
- Git

## 1. 특정 스택 실행

```bash
# 스택 선택 (go | rust | java | node | python)
cd stacks/node

# 환경변수 설정
cp .env.example .env

# 실행 (PostgreSQL 기본)
make dev
```

## 2. 접속 확인

| URL | 설명 |
|-----|------|
| http://localhost:3000 | Frontend — "Hello from Node!" 메시지 + DB 연결 상태 |
| http://localhost:8080/ | Backend root — 서비스 정보 JSON |
| http://localhost:8080/health | Healthcheck — db_connected 확인 |
| http://localhost:8080/api/hello | Hello API — 프론트엔드 연동 확인 |

## 3. API 검증 (curl)

```bash
# 서비스 정보
curl -s http://localhost:8080/ | jq .

# 헬스체크
curl -s http://localhost:8080/health | jq .

# Hello API
curl -s http://localhost:8080/api/hello | jq .

# Echo API
curl -s -X POST http://localhost:8080/api/echo \
  -H "Content-Type: application/json" \
  -d '{"test":"brewnet"}' | jq .
```

## 4. 자동 검증

```bash
make validate
# 4개 엔드포인트 + db_connected 상태를 자동 검증
```

## 5. DB 전환

```bash
# 종료
make down

# .env 수정
sed -i 's/^DB_DRIVER=.*/DB_DRIVER=mysql/' .env    # mysql로 전환

# 재기동
make dev

# 또는 sqlite3로 전환 (외부 DB 컨테이너 없이)
sed -i 's/^DB_DRIVER=.*/DB_DRIVER=sqlite3/' .env
make down && make dev
```

## 6. Makefile 타겟

```bash
make dev       # docker compose up --build (개발 모드)
make build     # docker compose build
make up        # docker compose up -d (프로덕션 모드)
make down      # docker compose down
make logs      # docker compose logs -f
make test      # 테스트 실행
make clean     # 컨테이너 + 볼륨 + 이미지 제거
make validate  # 헬스체크 + API 검증
```

## 7. 전 스택 빌드 (CI 시뮬레이션)

```bash
for stack in stacks/*/; do
  echo "=== Building $(basename $stack) ==="
  (cd "$stack" && cp .env.example .env && make build)
done
```

## 8. 종료 및 정리

```bash
make down      # 서비스 종료
make clean     # 전체 정리 (볼륨, 이미지 포함)
```

## Troubleshooting

| 문제 | 해결 |
|------|------|
| 포트 충돌 | `lsof -i :8080` 등으로 사용 중인 프로세스 확인 후 종료 |
| DB 연결 실패 | `make logs`로 backend 로그 확인. DB 컨테이너 healthy 상태 대기 |
| 이미지 빌드 실패 | `make clean && make build`로 캐시 없이 재빌드 |
| SQLite 권한 오류 | `/app/data/` 디렉토리 소유권 확인. Dockerfile에서 `chown appuser` 설정 |
