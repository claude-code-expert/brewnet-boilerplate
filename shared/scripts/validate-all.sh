#!/bin/bash
set -uo pipefail

# Validate all 15 Brewnet stacks
# Uses port 8082 (backend) and 3002 (frontend) to avoid conflicts with running services

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
STACKS_DIR="$REPO_ROOT/stacks"
VALIDATE_SCRIPT="$SCRIPT_DIR/validate.sh"

BACKEND_PORT=8082
FRONTEND_PORT=3002
NEXTJS_PORT=3002

STACKS=(
    go-gin
    go-echo
    go-fiber
    rust-actix-web
    rust-axum
    java-springboot
    java-spring
    kotlin-ktor
    kotlin-springboot
    nodejs-express
    nodejs-nestjs
    nodejs-nextjs
    python-fastapi
    python-django
    python-flask
)

PASSED=()
FAILED=()
SKIPPED=()
BUILD_FAILED=()

echo "========================================================"
echo "  Brewnet Full Stack Validation (${#STACKS[@]} stacks)"
echo "  Backend port: $BACKEND_PORT | Frontend port: $FRONTEND_PORT"
echo "========================================================"
echo ""

for stack in "${STACKS[@]}"; do
    STACK_DIR="$STACKS_DIR/$stack"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  [$((${#PASSED[@]}+${#FAILED[@]}+${#BUILD_FAILED[@]}+1))/${#STACKS[@]}] $stack"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    cd "$STACK_DIR"

    # Setup .env
    cp .env.example .env
    sed -i.bak "s/^DB_DRIVER=.*/DB_DRIVER=sqlite3/" .env 2>/dev/null || true
    echo "DB_DRIVER=sqlite3" >> .env
    echo "BACKEND_PORT=$BACKEND_PORT" >> .env
    echo "FRONTEND_PORT=$FRONTEND_PORT" >> .env
    echo "DB_PASSWORD=testpass123" >> .env
    echo "MYSQL_PASSWORD=testpass123" >> .env
    echo "MYSQL_ROOT_PASSWORD=testpass123" >> .env
    rm -f .env.bak

    # Determine the correct BASE_URL for validation
    # nodejs-nextjs uses BACKEND_PORT mapping to container port 3000
    BASE_URL="http://localhost:$BACKEND_PORT"

    # Build
    echo "  Building..."
    BUILD_START=$(date +%s)
    if ! docker compose build 2>&1 | tail -5; then
        echo "  ✗ BUILD FAILED for $stack"
        BUILD_FAILED+=("$stack")
        docker compose down -v 2>/dev/null || true
        rm -f .env
        echo ""
        continue
    fi
    BUILD_END=$(date +%s)
    echo "  Build completed in $((BUILD_END - BUILD_START))s"

    # Start
    echo "  Starting..."
    docker compose up -d 2>&1 | tail -3

    # Validate
    echo "  Validating (BASE_URL=$BASE_URL)..."
    if BASE_URL="$BASE_URL" TIMEOUT=90 bash "$VALIDATE_SCRIPT" 2>&1; then
        echo "  ✓ PASSED: $stack"
        PASSED+=("$stack")
    else
        echo "  ✗ FAILED: $stack"
        echo "  --- Container logs ---"
        docker compose logs --tail=20 2>&1 || true
        echo "  --- End logs ---"
        FAILED+=("$stack")
    fi

    # Cleanup
    docker compose down -v 2>/dev/null || true
    rm -f .env
    echo ""
done

echo ""
echo "========================================================"
echo "  RESULTS SUMMARY"
echo "========================================================"
echo ""
echo "  Passed:       ${#PASSED[@]}/${#STACKS[@]}"
for s in "${PASSED[@]}"; do echo "    ✓ $s"; done
echo ""

if [ ${#FAILED[@]} -gt 0 ]; then
    echo "  Failed:       ${#FAILED[@]}/${#STACKS[@]}"
    for s in "${FAILED[@]}"; do echo "    ✗ $s"; done
    echo ""
fi

if [ ${#BUILD_FAILED[@]} -gt 0 ]; then
    echo "  Build Failed: ${#BUILD_FAILED[@]}/${#STACKS[@]}"
    for s in "${BUILD_FAILED[@]}"; do echo "    ✗ $s (build)"; done
    echo ""
fi

echo "========================================================"
TOTAL_FAIL=$((${#FAILED[@]} + ${#BUILD_FAILED[@]}))
if [ "$TOTAL_FAIL" -eq 0 ]; then
    echo "  All ${#STACKS[@]} stacks passed!"
    exit 0
else
    echo "  $TOTAL_FAIL stack(s) had issues"
    exit 1
fi
