# BASELINE-AUDIT.md

**Audit date:** 2026-09-10  
**Source:** `CodesbyFebin/mcp-servers-master` `kilo/orbital-eagle-zbx`  
**Source SHA:** `f0010c7862b327429457e4305ba9fe233a56ccab`  
**Target (start):** `CodesbyFebin/Indian-MCP-Server` `main`  
**Target starting SHA:** `ad27900c7cfb9d2c7a5e9624a60e71c46dcaaa3e`

## Target before import

Only `README.md` existed. No packages, services, schema, Docker, CI, or tests.

README claimed: shared contracts, PostgreSQL schema, control-plane API, MCP gateway, Docker Compose, CI. **Those artefacts were not in the repository.** Classification: KEEP README identity, REPLACE missing foundation with imported source.

## Source fingerprint

- Root is a mixed tree: public Next.js directory (`app/`, `src/`, `next.config.mjs`) **plus** `app-mcpserver-in/` control-plane monorepo.
- Latest source commit: `refactor(api): update KYC schema to support OVSE offline verification`.
- `app-mcpserver-in/` contained ~10k files, of which ~10k were `node_modules` / `.next`. Source files after exclude: **167**.
- Branch-level extras: `pii-redact-middleware.ts`, `upi-sandbox-integration.py`.

## What was imported

- Entire `app-mcpserver-in/` source tree (nested, not flattened).
- Provenance copies of DPDP/UPI files under `tools/`.

## What was excluded (justified)

| Path | Reason |
|------|--------|
| `source-repo/app/`, `src/`, Next/Vercel root configs | Public discovery directory product (`mcpserver.in`) |
| `node_modules`, `.next`, `dist`, `.turbo`, `__pycache__`, `*.pyc` | Generated / vendor |
| `package-lock.json` inside monorepo | Conflicts with `pnpm-lock.yaml` |
| Source `packages/` at repo root | Directory-side contracts, not the OS workspace |

## Residual contamination (kept, flagged)

`app-mcpserver-in/apps/web` still contains public-directory routes (`/servers`, `/glossary`, editorial policy, sitemaps). Kept because it is part of the source monorepo and includes `/trace` plus tests. It must **not** become a second public directory. Later phase should split OS console from discovery UI.

## Security-sensitive findings (do not treat as production)

1. `services/api/index.ts` OVSE upload path accepts `aadhaarNumber` and hashes it server-side. Master prompt forbids raw Aadhaar on public endpoints. **P0.**
2. `lib/db/schema.ts` stores `privateKey` in a text column. Not a secret manager.
3. Docker Compose publishes Postgres `5432` to the host.
4. Caddyfile still terminates `www.mcpserver.in` (directory hostname) inside this OS repo.
5. UPI tools are sandbox-oriented; credentials via env. Missing credentials now fail closed in `payments.py`.
6. No `.github` CI workflows were present on the source branch.

## Tests present

- `apps/web/src/__tests__/*` (directory/publication oriented)
- `tests/test_observability.py`
- `services/mcp-server/tools/tools_acceptance_test.py`

## Deployment readiness

Not production-ready. No CI, no exact-SHA health contract, no RLS tests, no frozen production image evidence.
