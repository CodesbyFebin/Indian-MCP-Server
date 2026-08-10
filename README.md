# MCPServer OS

Open-source, self-hosted control plane for MCP infrastructure.

> This repository contains the MCPServer OS foundation: shared contracts, PostgreSQL schema, control-plane API, MCP gateway, Docker Compose deployment, and CI.

## Status

🚧 Foundation / PR #1

## Quick start

```bash
corepack enable
pnpm install
pnpm dev
```

For the containerized stack:

```bash
cd deploy/compose
cp .env.example .env
docker compose up --build
```

See `docs/DEVELOPMENT.md` and `docs/ARCHITECTURE.md` for details.

## License

Apache-2.0. See `LICENSE`.
