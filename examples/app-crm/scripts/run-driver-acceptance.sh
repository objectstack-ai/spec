#!/usr/bin/env bash
# Runs the CRM Playwright acceptance suite once for each storage driver.
# Each driver gets its own dev-server boot with the matching OS_DATABASE_URL.
#
# Usage:
#   ./scripts/run-driver-acceptance.sh                  # all drivers
#   ./scripts/run-driver-acceptance.sh sqlite           # one driver
#   ./scripts/run-driver-acceptance.sh sqlite mongodb   # subset
#
# Requirements:
#   sqlite   — none (always available)
#   mongodb  — local mongod listening on $MONGO_URL (default: 127.0.0.1:27017)
#   postgres — running pg accessible at $PG_URL (default: 127.0.0.1:5432)
#              On macOS the simplest setup is:
#                docker run -d --name pg -p 5432:5432 \
#                  -e POSTGRES_PASSWORD=postgres \
#                  -e POSTGRES_DB=objectstack_crm_test postgres:16-alpine
#              (Postgres is **not** booted by this script — start it yourself.)

set -euo pipefail

cd "$(dirname "$0")/.."

PORT="${CRM_PORT:-3001}"
MONGO_URL="${MONGO_URL:-mongodb://127.0.0.1:27017/objectstack_crm_test}"
PG_URL="${PG_URL:-postgres://postgres:postgres@127.0.0.1:5432/objectstack_crm_test}"
SQLITE_FILE="${SQLITE_FILE:-/tmp/objectstack-crm-acceptance.db}"

DRIVERS=("$@")
if [ ${#DRIVERS[@]} -eq 0 ]; then
  DRIVERS=("sqlite" "mongodb" "postgres")
fi

run_one() {
  local driver="$1"
  local url="$2"
  local spec="$3"

  echo
  echo "=========================================="
  echo "▶ Driver: $driver"
  echo "  URL:    $url"
  echo "  Spec:   $spec"
  echo "=========================================="

  if lsof -ti:"$PORT" >/dev/null 2>&1; then
    lsof -ti:"$PORT" | xargs kill 2>/dev/null || true
    sleep 2
  fi

  rm -f /tmp/crm-dev-"$driver".log
  OS_DATABASE_URL="$url" pnpm dev > /tmp/crm-dev-"$driver".log 2>&1 &
  local dev_pid=$!

  local i=0
  until curl -sf "http://127.0.0.1:$PORT/api/v1/meta" >/dev/null 2>&1; do
    i=$((i + 1))
    if [ $i -gt 90 ]; then
      echo "✗ Dev server did not become ready (see /tmp/crm-dev-$driver.log)"
      kill "$dev_pid" 2>/dev/null || true
      return 1
    fi
    sleep 1
  done

  set +e
  pnpm exec playwright test "$spec"
  local rc=$?
  set -e

  # `pnpm dev` wraps several layers — kill the whole port-3001 listener
  # to ensure the underlying CLI server actually exits, not just the
  # pnpm wrapper.
  kill "$dev_pid" 2>/dev/null || true
  if lsof -ti:"$PORT" >/dev/null 2>&1; then
    lsof -ti:"$PORT" | xargs kill 2>/dev/null || true
    sleep 1
    lsof -ti:"$PORT" | xargs kill -9 2>/dev/null || true
  fi
  wait "$dev_pid" 2>/dev/null || true
  sleep 1

  return $rc
}

failed=()
for d in "${DRIVERS[@]}"; do
  case "$d" in
    sqlite)
      rm -f "$SQLITE_FILE"
      if ! run_one sqlite "file:$SQLITE_FILE" "e2e/sqlite-driver.spec.ts"; then
        failed+=("sqlite")
      fi
      ;;
    mongodb)
      if ! run_one mongodb "$MONGO_URL" "e2e/mongodb-driver.spec.ts"; then
        failed+=("mongodb")
      fi
      ;;
    postgres)
      if ! run_one postgres "$PG_URL" "e2e/postgres-driver.spec.ts"; then
        failed+=("postgres")
      fi
      ;;
    *)
      echo "Unknown driver: $d"
      exit 2
      ;;
  esac
done

echo
if [ ${#failed[@]} -eq 0 ]; then
  echo "✓ All driver acceptance suites passed."
else
  echo "✗ Failed drivers: ${failed[*]}"
  exit 1
fi
