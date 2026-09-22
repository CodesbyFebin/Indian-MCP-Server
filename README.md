# MCPServer OS

Evidence-first control plane for Model Context Protocol infrastructure.

Deploy · Govern · Observe · Audit · Recover

> **Product split**
>
> - [mcpserver.in](https://mcpserver.in) — public discovery and evidence
> - [app.mcpserver.in](https://app.mcpserver.in) — execution / governance control plane (this repository)

This repository is **not** the canonical public MCP directory. Imported web routes that still look like a directory are residual source-branch surfaces and must not replace [mcpserver.in](https://mcpserver.in).

## Status

Foundation import from `CodesbyFebin/mcp-servers-master` branch `kilo/orbital-eagle-zbx` (`f0010c7862b327429457e4305ba9fe233a56ccab`).

Not production-ready. See `reports/` for evidence.

## Layout

```
app-mcpserver-in/   control-plane monorepo (packages, services, apps, deploy)
tools/              provenance copies of branch-level DPDP / UPI artifacts
docs/               OS-level documentation
reports/            forensic audit and migration evidence
```

## Quick start

```bash
corepack enable
cd app-mcpserver-in
pnpm install --frozen-lockfile
pnpm compile
```

Container stack (imported; not yet production-validated):

```bash
cd app-mcpserver-in/deploy/docker
docker compose config
```

## Language

This product maps **technical evidence**. It does not grant legal certification, UIDAI approval, RBI compliance, or DPDP certification.

## License

Apache-2.0. See `LICENSE`.
