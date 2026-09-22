// app/.well-known/oauth-authorization-server/route.ts
// OAuth 2.0 Authorization Server Metadata (RFC 8414)

import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.AUTH_SERVER_URL || 'http://localhost:3000';

  return NextResponse.json({
    // RFC 8414 - Authorization Server Metadata
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/api/auth/signin`,
    token_endpoint: `${baseUrl}/api/auth/token`,
    revocation_endpoint: `${baseUrl}/api/auth/revoke`,
    userinfo_endpoint: `${baseUrl}/api/auth/userinfo`,
    jwks_uri: `${baseUrl}/api/auth/jwks`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
    id_token_signing_alg_values_supported: ['RS256'],
    token_endpoint_auth_signing_alg_values_supported: ['RS256'],
    scopes_supported: ['mcp:read', 'compliance:read', 'deploy:write', 'openid', 'profile', 'email'],
    code_challenge_methods_supported: ['S256'],
    // MCP-specific
    mcp: {
      protocolVersion: '2026-07-28',
      transportsSupported: ['http'],
      capabilitiesSupported: ['tools', 'resources', 'prompts'],
    },
  });
}
