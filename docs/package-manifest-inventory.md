# Package Manifest Inventory (Pre-Migration)

## Detected package manifests

- `package.json`
- `flowclass-web/package.json`
- `flowclass-api/package.json`
- `flowclass-connect/package.json`

## Summary

| Path | Name | Key scripts | Key dependencies |
| --- | --- | --- | --- |
| `package.json` | `flowclass-open-source` | `test` | `pnpm` via `packageManager` |
| `flowclass-web/package.json` | `flowclass_web_v2` | `dev`, `build`, `lint` | `next`, `react`, `typescript`, `@stripe/react-stripe-js` |
| `flowclass-api/package.json` | `flowclass-api` | `start:dev`, `build`, `lint` | `@nestjs/*`, `typeorm`, `stripe`, `typescript` |
| `flowclass-connect/package.json` | `flowclass_connect_v2` | `dev`, `build`, `lint`, `test` | `react`, `vite`, `typescript`, `stripe` |

## Target mapping

- `flowclass-web` -> `apps/web`
- `flowclass-api` -> `apps/api`
- `flowclass-connect` -> `apps/admin`
