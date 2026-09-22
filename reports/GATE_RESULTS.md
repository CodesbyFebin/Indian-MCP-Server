# GATE_RESULTS.md

Recorded 2026-09-22 against local working tree before push.

| Gate | Command | Result |
|------|---------|--------|
| Install | `cd app-mcpserver-in && pnpm install --frozen-lockfile` | PASS |
| Compile | `pnpm compile` (contracts, evidence, registry, auth) | PASS |
| Tests | `pnpm test` (turbo) | FAIL — 1 pre-existing directory-publication assertion in `apps/web` (`isServerIndexable`). 66/67 tests passed. |
| Build | `pnpm build` then `pnpm --filter mcpserver-in-web build` | PARTIAL — package builds + `apps/app` Next build pass. `apps/web` Next build failed until Trace Viewer type/syntax compatibility fixes; after those fixes, `mcpserver-in-web` Next build PASS (103 routes). |
| Python | `python3 -m py_compile` on `main.py`, `payments.py`, `upi-sandbox-integration.py` | PASS |
| Docker | `docker compose config` | NOT RUN — Docker CLI not present in this environment |
| Migrations | Drizzle generate/migrate | NOT RUN — no drizzle-kit workflow in imported monorepo; schema lives in `lib/db/schema.ts` and inline in `services/api/index.ts` |
| CI | GitHub Actions | MISSING in source and target |

## Compatibility fixes applied during migration

1. Nested layout: keep `app-mcpserver-in/` (do not flatten).
2. Exclude vendor: `node_modules`, `.next`, `.turbo`, `dist`, `__pycache__`, source `package-lock.json`.
3. Align internal deps to `workspace:*` to match `pnpm-lock.yaml`.
4. Add `turbo.json` (source `package.json` called `turbo run build` with no pipeline file).
5. Add tsconfig/placeholder entries for metadata-only packages that advertised `tsc` builds.
6. `lib/db/schema.ts`: remove circular self-import; import `boolean`.
7. `apps/web/app/trace/page.tsx`: type the execution model; replace broken inline regex/JSON.parse (missing paren in source) with a redact helper; `colSpan={9}`.

These are packaging/type compatibility fixes, not new product features.
