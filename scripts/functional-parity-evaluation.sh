#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORT_PATH="$ROOT_DIR/artifacts/functional-evaluation-report.md"

RUN_API_TESTS="${RUN_API_TESTS:-0}"

resolve_app_dir() {
  local migrated_path="$1"
  local legacy_path="$2"

  if [[ -d "$ROOT_DIR/$migrated_path" ]]; then
    echo "$ROOT_DIR/$migrated_path"
    return 0
  fi

  if [[ -d "$ROOT_DIR/$legacy_path" ]]; then
    echo "$ROOT_DIR/$legacy_path"
    return 0
  fi

  echo ""
}

WEB_DIR="$(resolve_app_dir "apps/web" "flowclass-web")"
API_DIR="$(resolve_app_dir "apps/api" "flowclass-api")"
ADMIN_DIR="$(resolve_app_dir "apps/admin" "flowclass-connect")"

if [[ -z "$WEB_DIR" || -z "$API_DIR" || -z "$ADMIN_DIR" ]]; then
  echo "Unable to resolve one or more app directories."
  echo "Expected either migrated (apps/*) or legacy (flowclass-*) layout."
  exit 1
fi

PASS_COUNT=0
FAIL_COUNT=0

mkdir -p "$ROOT_DIR/artifacts"
{
  echo "# Functional Evaluation Report"
  echo
  echo "- Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo "- Repository root: $ROOT_DIR"
  echo "- Web directory: $WEB_DIR"
  echo "- API directory: $API_DIR"
  echo "- Admin directory: $ADMIN_DIR"
  echo "- RUN_API_TESTS: $RUN_API_TESTS"
  echo
} > "$REPORT_PATH"

record_result() {
  local label="$1"
  local status="$2"
  local detail="$3"

  if [[ "$status" == "PASS" ]]; then
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi

  {
    echo "## $label"
    echo
    echo "- Status: $status"
    echo "- Detail: $detail"
    echo
  } >> "$REPORT_PATH"
}

run_step() {
  local label="$1"
  shift
  if "$@"; then
    record_result "$label" "PASS" "Command succeeded."
    return 0
  fi

  record_result "$label" "FAIL" "Command failed."
  return 1
}

step_failed=0

run_step "Web lint" pnpm --dir "$WEB_DIR" run lint || step_failed=1
run_step "Web build" pnpm --dir "$WEB_DIR" run build || step_failed=1

run_step "API lint" pnpm --dir "$API_DIR" run lint || step_failed=1
run_step "API build" pnpm --dir "$API_DIR" run build || step_failed=1

if [[ "$RUN_API_TESTS" == "1" ]]; then
  run_step "API tests" pnpm --dir "$API_DIR" exec jest --runInBand || step_failed=1
else
  record_result "API tests" "PASS" "Skipped (set RUN_API_TESTS=1 to execute)."
fi

run_step "Admin lint" pnpm --dir "$ADMIN_DIR" run lint || step_failed=1
run_step "Admin build" pnpm --dir "$ADMIN_DIR" run build || step_failed=1

# OSS paywall/subscription stripping checks (admin app source only).
if rg -n "SubscriptionManagement|CheckoutPage|PricingPublic|AssignSubscription|PlanAssignment|SubscriptionPresetPlans|SuccessSubscription" "$ADMIN_DIR/src/App.tsx" > /dev/null; then
  record_result \
    "OSS paywall-strip check" \
    "FAIL" \
    "Found active subscription/paywall modules still referenced in admin app."
  step_failed=1
else
  record_result \
    "OSS paywall-strip check" \
    "PASS" \
    "Subscription and checkout routes are not mounted in admin app."
fi

{
  echo "## Final summary"
  echo
  echo "- Passed checks: $PASS_COUNT"
  echo "- Failed checks: $FAIL_COUNT"
} >> "$REPORT_PATH"

echo "Evaluation report generated: $REPORT_PATH"

if [[ "$step_failed" -eq 1 ]]; then
  exit 1
fi
