# Claude conventions for this repo

## Smoke testing the admin app

When the user asks for a UI test pass / smoke test / "click through every page" / regression check of the admin app, **follow [docs/testing/admin-smoke-test.md](docs/testing/admin-smoke-test.md)**. That file is the canonical playbook:

- Section order
- Per-page method (navigate → snapshot → console → network → interact → fix → log)
- Fix policy (what to fix inline vs. log)
- Logging format
- Common bug patterns in this codebase

After each run, append a dated file under `docs/testing/runs/<YYYY-MM-DD>.md` with what you tested, what you fixed, and what's still open.

## Repo layout

- `apps/api/` — NestJS backend (port 5000)
- `apps/admin/` — Vite + React admin (port 3000)
- `apps/web/` — Next.js student-facing site
- `docs/` — Operational docs, including `docs/testing/`

## House rules

- **Don't commit** unless the user explicitly asks. Leave diffs for review.
- **Don't run destructive ops** (drops, force-push, delete-all) without confirmation.
- **Trust the file** — when you read a file, that's the current state. Diagnostics from in-flight edits can be stale; `grep` for the symbol if you're unsure.
- **The codebase is mid-extraction from a larger product.** Expect: missing imports, dead code after early `return`s in `useMemo`, half-renamed identifiers, TDZ violations. The smoke-test playbook lists the common patterns.
- **`dataTestId` is a project convention**, mapped to `data-testid` by wrappers (`Button`, `IconButton`, `DatePicker`, etc.). Use it on wrappers, but use `data-testid` directly on Radix primitives.
