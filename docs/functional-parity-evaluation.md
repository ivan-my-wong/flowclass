# Functional Parity Evaluation (Pre/Post Monorepo Migration)

This evaluation is the guardrail for migrating to pnpm workspaces without breaking existing product behavior.

## Goal

Prove the app keeps the same user-visible functionality before and after:

- moving into `apps/*` + `packages/*`,
- normalizing package scripts,
- removing paywall/subscription gating for open source.

## Scope

Current project targets:

- `flowclass-web` (future `apps/web`)
- `flowclass-api` (future `apps/api`)
- `flowclass-connect` (future `apps/admin`)

Key functional domains to preserve:

- Authentication and authorization flows
- Course/class management flows
- Student profile and enrollment flows (non-paywall behavior)
- Scheduling/calendar/workflow features
- API health and critical endpoints
- Build and lint correctness for all apps

## Evaluation Method

Run the same checks two times:

1. **Baseline run (before migration)**
2. **Post-migration run (after monorepo changes)**

Compare output reports and ensure:

- no critical suites regress,
- build/lint status remains stable or improves,
- expected paywall/subscription removal checks pass.

## Commands

Run from repository root:

```bash
bash scripts/functional-parity-evaluation.sh
```

Optional deeper checks:

```bash
RUN_API_TESTS=1 bash scripts/functional-parity-evaluation.sh
```

## Acceptance Criteria

The migration is considered functionally safe when all are true:

1. `web`, `api`, and `admin` build successfully.
2. Lint passes for all migrated apps.
3. Existing test suites that previously passed still pass (or expected failures are documented with owner/date).
4. Open-source paywall checks pass:
   - no route-level blocking by subscription paywalls,
   - no hard dependency on subscription quota checks for core workflows.
5. Report file exists in `artifacts/functional-evaluation-report.md`.

## Paywall Removal Validation

The evaluation script includes static checks that subscription/paywall routes are not mounted in the admin app router.

If checkout, pricing, or subscription management routes are still active after OSS stripping, the evaluation fails.

## CI Recommendation

Add this command to CI for pull requests that modify migration files:

```bash
bash scripts/functional-parity-evaluation.sh
```

For nightly full confidence:

```bash
RUN_API_TESTS=1 bash scripts/functional-parity-evaluation.sh
```
