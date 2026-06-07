# Admin app smoke-test playbook

How to run a structured smoke test of the admin app (http://localhost:3000) and fix issues as you go.

## Prerequisites

- Dev server running. If not: `pnpm dev:admin` (and `pnpm dev:api` if API isn't already up).
- Playwright MCP tools available in your runtime. Load them via ToolSearch with the `select:` query if they're deferred.
- Login credentials. Default dev: `info@flowclass.io` / (ask user).
- Repo root: `/Users/IvanWong/Desktop/flowclass-projects/flowclass-open-source`. Admin source under `apps/admin/src/`.

## Method (per page)

For every page in the section list below, do all of these in order before moving to the next page:

1. **Navigate** — `browser_navigate` to the URL.
2. **Snapshot** — `browser_snapshot` to capture what loaded.
3. **Console** — `browser_console_messages` and note every error/warning. Treat as findings.
4. **Network** — `browser_network_requests` and look for 4xx/5xx.
5. **Interact** — click 2-4 primary actions (Create / Edit / View / a tab switch / a filter). Snapshot after each.
6. **Re-check** — after each click, re-run console + network checks.
7. **Fix** — if you find a fixable error, patch it (see "Fix policy" below) and reload. Two fix attempts max per error before logging and moving on.
8. **Log** — append a section to `docs/testing/runs/<YYYY-MM-DD>.md` for this run (see "Logging" below).

## Sections to cover

This is the canonical order. Skip features that aren't wired up in this build (note them as 🚫).

1. **Account Management** — `/account`, `/account/update-profile`, logout/relogin.
2. **Onboarding** — `/home` welcome card, Starter/Scaling/Multi-Branch tabs, any first-run wizards.
3. **Main Page / Nav** — `/dashboard`, every visible sidebar link, breadcrumbs.
4. **School Detail** — `/school` Basic, Brand, Links tabs.
5. **Contacts** — `/contact` Basic, country, address, identifiers.
6. **WhatsApp Template** — `/whatsapp-templates` list, "+ Add" modal, edit, language/category selects.
7. **Notification Templates (CustomMessages)** — `/custom-messages` list, edit, send.
8. **Coupon** — `/promotion`, `/promotion/coupon-code` list, Add form.
9. **Course & Classes** — `/teaching-service` list, course create, Class tab, recurring schedule.
10. **Student CRM** — `/student-record` list, row action menu (View Detail, Merge, Set Parent, Add to Parent Group, Assign Invoice, Credit Balance), `/student-record/:id` detail, multi-account/parent-child flows, bulk selection bar.
11. **Bulk Send / Invoice Campaign** — `/bulk-send-documents` list, "Select" to start new, editor wizard (one merged step).
12. **Payment Proof Table** — `/application` list, `/application/edit` detail, bulk-action bar.
13. **Lessons** — `/lesson-matrix` attendance, `/availability`, `/reschedule-approval`, `/student-submissions`.
14. **Settings** — `/settings/users`, `/settings/payments`, `/settings/application-form`, `/feature-enable`.
15. **Misc** — `/locations`, `/full-calendar`, `/notification-log`, `/certificate-templates`, `/materials`.

## Fix policy

- **Fix blocking bugs** (white screens, 500s, ReferenceError, TypeError on load) — patch and re-test.
- **Fix cheap warnings** (controlled/uncontrolled, validateDOMNesting, unknown-prop warnings) when the cause is obvious (≤ 2 file edits).
- **Log everything else** — don't go down rabbit holes. Higher-cost refactors go in the "Next steps" section of the run log.
- **Never run destructive ops** (delete-all, drop, force-push). Smoke tests only verify UI loads and basic actions.
- **Don't commit.** Leave the diff for the user to review.

## Logging

For each smoke-test run, create `docs/testing/runs/<YYYY-MM-DD>.md` with this template:

```markdown
# Smoke test — <YYYY-MM-DD>

## Section: <name>
- **URL(s)**: <list>
- **Status**: ✅ Pass | ⚠️ Issues | ❌ Broken | 🚫 Not in build
- **What was tested**: 1-2 lines
- **Errors found**: bullet list
- **Fixes applied**: file paths + brief description
- **Still broken**: anything you couldn't fix

(repeat per section)

## Files changed
- path/to/file.tsx — what changed

## Next steps (priority order)
1. ...
```

## Common bug patterns in this codebase

Spotted often enough to be a checklist. If a page crashes, scan for these first:

1. **Missing imports after extraction** — `ReferenceError: X is not defined`. Likely a helper that lives in `apps/admin/src/utils/` or `apps/admin/src/components/` but wasn't imported. Grep for `export const X` or `function X` to find it.
2. **TDZ violations in hooks** — `Cannot access 'X' before initialization`. A `useEffect` references a `const` declared *below* it. Move the effect after the declaration.
3. **String literal aliases** — `@/assets/...` written as a string instead of an `import`. Vite only resolves `@` in import statements. Fix: `import x from '@/...'`.
4. **Radix prop mismatches** — `dataTestId` (camelCase) on Radix primitives. Use `data-testid` directly; wrappers like `Button`/`IconButton` map `dataTestId` → `data-testid`.
5. **Nested `<button>`** — Radix `Trigger`s wrap their child in a button by default. If the child is also a button, you get `validateDOMNesting`. Fix: make the child a `<span>` with `role="combobox"` (or use Radix `asChild`).
6. **react-hook-form `{...field}` on Radix Root** — Radix `Select.Root` is not a forwardRef. Pattern: `<Select value={field.value} onValueChange={field.onChange}>` instead of `{...field}`.
7. **Half-merged code** — duplicate `useState` declarations, dead code after early `return` inside `useMemo`, `selectedRows` casting to a different shape than what `rowData` actually provides. Trace data shapes carefully.
8. **Trigger wrapped inside another button wrapper** — A self-contained Radix `Trigger` (which renders its own `<button>`) placed inside something that ALSO renders a `<button>` (e.g. `IconButton`, `Button`, custom `BoxWithToggleGroup`) produces nested `<button>`. Fix at the *outer* wrapper: render the trigger directly when no extra click handler is needed, instead of wrapping it. Seen in `StatusChangeTrigger` (inside `DropdownMenuTrigger`) and `BoxWithToggleGroup` (with `PromptDialog`).
9. **`null` values into controlled inputs** — react-hook-form `defaultValues` often produce `null` for empty strings when API responses are `null`. React warns when an input's `value` flips between `null` and `string`. Preferred fix: coalesce `value === null → ''` once at the wrapper (`Input.tsx`), not at every call site. Preserve `undefined` to leave uncontrolled callers untouched.
10. **Radix portal popover behind modal backdrop** — Radix `SelectContent`, `PopoverContent`, etc. portal to the body with a low default z-index (commonly `z-50`). This project's modal backdrop is `z-modal-backdrop = 1040`, so a popover inside a dialog appears visible but is click-intercepted by the overlay. Fix: bump the popover container's z-index to `z-popover` (1060). Audit every `z-50` in `components/ui/{Select,Popover,Tooltip,DropdownMenu,Combobox}.tsx`.
11. **API DTO field omitted from form `defaultValues`** — react-hook-form silently strips `undefined` from the submitted `data`, so a backend that requires the field returns 422. Two fixes: type the `default*` const with the field included (`isDefault: false`), or coalesce in `onSubmit` (`isDefault: data.isDefault ?? false`). The const approach is preferred — fewer foot-guns when adding new fields.
12. **Plain function component inside Radix `asChild` Slot** — `Slot` always forwards a `ref` to its child. If the child is a plain function component (not `forwardRef`), React warns "Function components cannot be given refs" and the ref is lost. Wrap any custom overlay/content/trigger used with `asChild` in `React.forwardRef` and set `displayName`.
13. **`<>...</>` inside `.map()`** — fragments don't accept a `key` prop. Use `<React.Fragment key={...}>` so React's list-key warning doesn't fire and reconciliation stays stable across renders.
14. **Stale closure in recoil updater** — `setRecoil(prev => ({ ...studentData.someField, ... }))` where `studentData` is the *captured-at-render* atom value. The closure-captured value can be stale by the time the click fires, leading to "click does nothing" bugs (silent state writes that overwrite newer state, or `prev` ignored entirely). Fix: always read from `prev` inside the updater (`prev.someField`), never from the outer captured atom.
15. **Form `isDirty` true on mount** — when `useForm`'s `defaultValues` differ subtly from the API-loaded payload (e.g. `null` vs `''`, `undefined` vs `false`, ordering of an object), react-hook-form thinks the user has edited and shows "Unsaved changes". Fix: align the seed `defaultValues` shape exactly with what the API returns, **or** call `form.reset(apiData, { keepDefaultValues: false })` after the fetch completes — never `useState` + `useEffect` to set values one-by-one.
16. **`useFieldArray.replace()` always marks dirty** — RHF's `replace` flips `isDirty` to true even when called from a mount-time effect with the same content. Pre-seed the array at the **parent**'s `defaultValues` instead, so the child's "empty → replace" branch never fires. Don't try to wrap `replace` in a "skip first call" effect — that races with React 18 strict mode's double-invocation.
17. **`form.watch(cb)` re-propagating with `shouldDirty: true`** — a subscription that does `form.setValue(target, value, { shouldDirty: true })` will mark the form dirty for every programmatic write, including mount-time effects. Gate on `info?.type === 'change'` so only user-driven changes propagate as dirty: `watch(({ value, name, type }) => setValue(name, value, { shouldDirty: type === 'change' }))`.
18. **react-select chip Remove aria-label is `[object Object]`** — when `formatOptionLabel` returns JSX, react-select stringifies the JSX for the multi-value chip's Remove button aria-label and announcements. `getOptionLabel` alone doesn't fix it. Branch on `formatMeta?.context === 'value'`: return a plain `String(data.label)` for the chip, JSX for the dropdown list. Pattern: `formatOptionLabel={(data, m) => m?.context === 'value' ? String(data.label) : <JSX>}`.
19. **AG Grid v33 warning #48: object-typed cell needs `valueFormatter`** — if a column's value is an object (e.g. an `address` object rendered via `cellRenderer`), AG Grid still tries to derive a text value for sorting/filtering and warns. Add `valueFormatter: () => ''` (or a real string formatter) even when the cellRenderer fully handles display.
20. **AG Grid warning #273: duplicate column id** — mixing `{field: 'phone'}` and `{colId: 'phone'}` in the same `columnDefs` array silently produces internal ids `phone_1`, `phone_2` and breaks `getColumn('phone')`, column-state save/restore, etc. Always use distinct `colId`s when two columns might collide.

## Quick reference

| Need | Where |
|---|---|
| Routes | `apps/admin/src/App.tsx` |
| Sidebar | `apps/admin/src/components/MenuBar/menuBarItems.ts` |
| Wrappers (`Button`, `Input`, `ModalDialog`) | `apps/admin/src/components/ui/` |
| Radix re-exports (`Select`, `Dialog`) | `apps/admin/src/components/ui/` |
| Locale strings | `apps/admin/src/locales/{en,zh}/*.json` |
| Recoil atoms | `apps/admin/src/stores/` |
| API hooks | `apps/admin/src/hooks/` |
