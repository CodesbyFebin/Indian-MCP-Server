# TARGET-ARCHITECTURE.md

## Current → target mapping

| Target (master prompt) | Current after import |
|------------------------|----------------------|
| `apps/web` App Router console | Partial: Next app exists, mostly discovery routes + `/trace` |
| `services/control-plane` | `services/api` (Hono/TS mixed with schema + OVSE) |
| `services/gateway` | Present (`services/gateway`, Python router in mcp-server) |
| `services/worker` / scheduler | Missing |
| `packages/contracts` | Present (event/workflow schemas, not full OS evidence model) |
| `packages/database` | Partial: `lib/db/schema.ts` only |
| `deploy/compose` | `app-mcpserver-in/deploy/docker/docker-compose.yml` |
| CI | Missing |

## Trust boundaries

- Public directory (mcpserver.in) remains a different product/repo.
- Control plane must re-resolve signed deploy intents; do not trust query-string githubUrl/image/command.
- Untrusted MCP servers must not run in the control-plane process.

## Failure modes already visible

- Empty/placeholder packages: `packages/api`, `services/workflow-engine`.
- Manifest vs lockfile mismatch (fixed in this migration: `workspace:*`).
- Turbo pipeline missing on source (added `turbo.json`).
- Authority/compliance language in some imported comments overstates legal status.

## Migration plan (this commit)

1. Nested import of `app-mcpserver-in/`.
2. Packaging compatibility so `pnpm install --frozen-lockfile` and `pnpm compile` can run.
3. Evidence reports. No DNS/deploy.
