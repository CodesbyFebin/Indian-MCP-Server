# Architecture

MCPServer OS is the execution and evidence control plane for verified MCP infrastructure.

- Public discovery remains at mcpserver.in.
- This repo consumes verified identities; it must re-resolve them server-side before deploy.
- Shared contracts live in `app-mcpserver-in/packages/contracts`.
- Runtime services live in `app-mcpserver-in/services`.
- Docker Compose and Caddy configs live in `app-mcpserver-in/deploy`.

See `reports/TARGET-ARCHITECTURE.md` for the intended package map and trust boundaries.
