// app/.well-known/oauth-protected-resource/route.ts
// RFC 9728 - OAuth 2.0 Protected Resource Metadata
// Served alongside the MCP endpoint to advertise auth requirements

import { protectedResourceHandler } from 'mcp-handler';

export const GET = protectedResourceHandler({
  resource: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/mcp`,
  authorizationServers: [process.env.AUTH_SERVER_URL || 'http://localhost:3000'],
  scopesSupported: ['mcp:read', 'compliance:read', 'deploy:write'],
  bearerMethodsSupported: ['header'],
});
