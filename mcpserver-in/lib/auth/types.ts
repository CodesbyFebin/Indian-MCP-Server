// lib/auth/types.ts
// Authentication and authorization types for MCP gateway

export type PrincipalType = 'user' | 'agent' | 'service' | 'system';
export type AuthScope =
  | 'mcp:read'
  | 'mcp:execute'
  | 'compliance:read'
  | 'deploy:write'
  | 'admin:full';

export interface AuthContext {
  principalId: string;
  principalType: PrincipalType;
  organizationId: string;
  workspaceId?: string;
  scopes: AuthScope[];
  tokenId?: string;
  issuedAt: Date;
  expiresAt: Date;
  claims?: Record<string, unknown>;
}

export interface AuthValidator {
  validate(token: string): Promise<AuthContext | null>;
  authenticate(headers: Headers): Promise<AuthContext | null>;
}

export interface JWKSConfig {
  url: string;
  issuer: string;
  audience?: string;
}
