# Claude conventions for this repo

## Repo layout

- `apps/api/` — NestJS backend (port 5000)
- `apps/admin/` — Vite + React admin (port 3000)
- `apps/web/` — Next.js student-facing site
- `docs/` — Operational and architecture docs

## House rules

- **Don't commit** unless the user explicitly asks. Leave diffs for review.
- **Don't run destructive ops** (drops, force-push, delete-all) without confirmation.
- **Trust the file** — when you read a file, that's the current state. Diagnostics from in-flight edits can be stale; `grep` for the symbol if you're unsure.
- **The codebase is mid-extraction from a larger product.** Expect: missing imports, dead code after early `return`s in `useMemo`, half-renamed identifiers, TDZ violations. The smoke-test playbook lists the common patterns.
- **`dataTestId` is a project convention**, mapped to `data-testid` by wrappers (`Button`, `IconButton`, `DatePicker`, etc.). Use it on wrappers, but use `data-testid` directly on Radix primitives.
