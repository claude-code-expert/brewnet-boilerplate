#!/bin/bash
set -e

BASE_URL="${BASE_URL:-http://localhost:8080}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
TIMEOUT="${TIMEOUT:-60}"
ERRORS=0

echo "================================================"
echo "  Brewnet Stack Validation"
echo "================================================"
echo ""

# Wait for backend to be healthy
echo "Waiting for backend at ${BASE_URL}..."
for i in $(seq 1 "$TIMEOUT"); do
    if curl -sf "${BASE_URL}/health" > /dev/null 2>&1; then
        echo "  Backend is healthy"
        break
    fi
    if [ "$i" -eq "$TIMEOUT" ]; then
        echo "  FAIL: Backend did not become healthy within ${TIMEOUT}s"
        exit 1
    fi
    sleep 1
done

echo ""
echo "Verifying endpoints..."
echo ""

# GET /
echo -n "  GET /  ... "
ROOT_RESPONSE=$(curl -sf "${BASE_URL}/" 2>/dev/null) || { echo "FAIL (connection error)"; ERRORS=$((ERRORS+1)); }
if [ -n "$ROOT_RESPONSE" ]; then
    if echo "$ROOT_RESPONSE" | jq -e '.status == "running"' > /dev/null 2>&1; then
        echo "OK"
    else
        echo "FAIL (unexpected response: $ROOT_RESPONSE)"
        ERRORS=$((ERRORS+1))
    fi
fi

# GET /health
echo -n "  GET /health  ... "
HEALTH_RESPONSE=$(curl -sf "${BASE_URL}/health" 2>/dev/null) || { echo "FAIL (connection error)"; ERRORS=$((ERRORS+1)); }
if [ -n "$HEALTH_RESPONSE" ]; then
    if echo "$HEALTH_RESPONSE" | jq -e '.status == "ok"' > /dev/null 2>&1; then
        echo "OK"
    else
        echo "FAIL (unexpected response: $HEALTH_RESPONSE)"
        ERRORS=$((ERRORS+1))
    fi
fi

# GET /health — db_connected check
echo -n "  GET /health (db_connected)  ... "
if [ -n "$HEALTH_RESPONSE" ]; then
    DB_CONNECTED=$(echo "$HEALTH_RESPONSE" | jq -r '.db_connected' 2>/dev/null)
    if [ "$DB_CONNECTED" = "true" ]; then
        echo "OK (connected)"
    elif [ "$DB_CONNECTED" = "false" ]; then
        echo "WARN (db_connected=false)"
    else
        echo "FAIL (db_connected field missing)"
        ERRORS=$((ERRORS+1))
    fi
fi

# GET /api/hello
echo -n "  GET /api/hello  ... "
HELLO_RESPONSE=$(curl -sf "${BASE_URL}/api/hello" 2>/dev/null) || { echo "FAIL (connection error)"; ERRORS=$((ERRORS+1)); }
if [ -n "$HELLO_RESPONSE" ]; then
    if echo "$HELLO_RESPONSE" | jq -e '.message' > /dev/null 2>&1; then
        LANG=$(echo "$HELLO_RESPONSE" | jq -r '.lang')
        VERSION=$(echo "$HELLO_RESPONSE" | jq -r '.version')
        echo "OK (lang=${LANG}, version=${VERSION})"
    else
        echo "FAIL (unexpected response: $HELLO_RESPONSE)"
        ERRORS=$((ERRORS+1))
    fi
fi

# POST /api/echo
echo -n "  POST /api/echo  ... "
ECHO_RESPONSE=$(curl -sf -X POST "${BASE_URL}/api/echo" \
    -H "Content-Type: application/json" \
    -d '{"test":"brewnet"}' 2>/dev/null) || { echo "FAIL (connection error)"; ERRORS=$((ERRORS+1)); }
if [ -n "$ECHO_RESPONSE" ]; then
    if echo "$ECHO_RESPONSE" | jq -e '.test == "brewnet"' > /dev/null 2>&1; then
        echo "OK"
    else
        echo "FAIL (unexpected response: $ECHO_RESPONSE)"
        ERRORS=$((ERRORS+1))
    fi
fi

echo ""
echo "================================================"
if [ "$ERRORS" -eq 0 ]; then
    echo "  All checks passed!"
    echo "================================================"
    exit 0
else
    echo "  ${ERRORS} check(s) failed!"
    echo "================================================"
    exit 1
fi
