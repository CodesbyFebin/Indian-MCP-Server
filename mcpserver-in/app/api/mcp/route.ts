// app/api/mcp/route.ts
// Core MCP Server Endpoint — 2026-07-28 Spec
// Delegates to route-impl.ts for the full handler implementation

export { authed as GET, authed as POST } from './route-impl';
