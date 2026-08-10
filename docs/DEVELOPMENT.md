# Development

## Prerequisites

- Node.js 22+
- Corepack / pnpm 10+
- Docker Engine or Docker Desktop

## Local TypeScript development

```bash
corepack enable
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

The control plane listens on `http://localhost:3001` and the gateway on `http://localhost:3002`.

## Docker Compose

From `deploy/compose`:

```bash
cp .env.example .env
docker compose up --build
```

Verify:

```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
curl -i -X POST http://localhost:3002/mcp
```

The first two requests should return JSON with `status: ok`. The MCP endpoint currently returns HTTP 501 because the real MCP session/router implementation is planned for PR #3.

## Database

PostgreSQL is initialized from `packages/contracts/schema.sql` on first container startup. Data is persisted in the `postgres_data` volume.

To reset the local database:

```bash
docker compose down -v
docker compose up --build
```

Do not use `down -v` against production data.
