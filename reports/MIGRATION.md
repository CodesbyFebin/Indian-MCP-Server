# Control-plane migration

## SHAs

| Repo | Ref | SHA |
|------|-----|-----|
| Source `CodesbyFebin/mcp-servers-master` | `kilo/orbital-eagle-zbx` | `f0010c7862b327429457e4305ba9fe233a56ccab` |
| Target `CodesbyFebin/Indian-MCP-Server` start | `main` | `ad27900c7cfb9d2c7a5e9624a60e71c46dcaaa3e` |

## Scope imported

- `app-mcpserver-in/` monorepo (packages, services, apps, deploy, tests, docs, lib/db)
- `tools/pii-redact-middleware.ts` (branch-level DPDP artifact)
- `tools/upi-sandbox-integration.py` (branch-level UPI sandbox artifact)

In-tree copies already present in the monorepo:

- `app-mcpserver-in/services/api/lib/middleware/pii-redact.ts`
- `app-mcpserver-in/services/mcp-server/tools/payments.py`
- OVSE/KYC fields in `app-mcpserver-in/services/api/index.ts`

## Explicitly not imported

- Source `app/`, `src/`, Next/Vercel/root SEO files (public directory product)
- Source-root `packages/` (directory-side, not OS workspace)
- Generated vendor trees

## Conflicts

Target had only `README.md`. No merge conflicts. README identity rewritten to MCPServer OS while preserving the product split.

## Remaining blockers

- Residual discovery UI inside `app-mcpserver-in/apps/web` (must not replace mcpserver.in)
- One failing publication test in that residual UI
- No CI workflows
- No Docker in this runner; compose file is imported but unvalidated here
- Authority/compliance language in some imported comments overstates legal status
- Trace PII toggle is still a client checkbox (needs permissioned/audited sensitive-view later)
- UIDAI/Razorpay live credentials are not configured; keep sandbox/disabled
- Marketplace/billing not in this import as a complete subsystem
