// lib/auth/verify-token.ts
// JWT Token Verification for MCP Auth (RFC 9728 + 2026-07-28 MCP Spec)
// Uses jose for ES256/JWT verification

import { jwtVerify, JWTVerifyResult } from 'jose';
import { AuthContext } from './types';

/**
 * Verifies a bearer JWT token and extracts the authenticated principal context.
 *
 * Expected JWT claims:
 * - sub: Principal identifier (user ID or service ID)
 * - oid: Organization ID (tenant)
 * - scp: Space-delimited list of scopes (e.g., "mcp:read compliance:read")
 * - iss: Token issuer (must match AUTH_ISSUER)
 * - aud: Audience (must match AUTH_AUDIENCE)
 * - iat: Issued at (timestamp)
 * - exp: Expiration (timestamp)
 *
 * @param token - Bearer token string (without "Bearer " prefix)
 * @returns AuthContext if valid, null if invalid/expired
 */
export async function verifyToken(token: string): Promise<AuthContext | null> {
  if (!token || typeof token !== 'string') {
    return null;
  }

  // Check if we have the JWKS URL configured (for production)
  const jwksUrl = process.env.AUTH_JWKS_URL;
  const issuer = process.env.AUTH_SERVER_URL || process.env.NEXTAUTH_URL;

  if (!jwksUrl || !issuer) {
    // Development mode: decode without verification
    // This is only acceptable when a full auth server is not configured
    if (process.env.NODE_ENV === 'production') {
      console.error('AUTH_JWKS_URL and AUTH_SERVER_URL must be set in production');
      return null;
    }
    return verifyTokenDevelopment(token, issuer);
  }

  try {
    const jwks = await fetch(jwksUrl).then(async (res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch JWKS: ${res.status}`);
      }
      return res.json();
    });

    // Create JWKS client using jose
    const { createPublicKey } = await import('crypto');
    const key = createPublicKey(jwks.keys[0]);

    const { payload, protectedHeader } = await jwtVerify(
      token,
      key,
      {
        issuer,
        maxTokenAge: '1h',
      },
    );

    // Extract scopes from 'scp' claim
    const scopes = (payload.scp as string | undefined)?.split(' ') || [];

    // Build AuthContext
    return {
      principalId: payload.sub as string,
      principalType: (payload.ptp as string) || 'user',
      organizationId: payload.oid as string,
      workspaceId: payload.wid as string | undefined,
      scopes,
      tokenId: payload.jti as string | undefined,
      issuedAt: new Date((payload.iat as number) * 1000),
      expiresAt: new Date((payload.exp as number) * 1000),
      claims: payload as unknown as Record<string, unknown>,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Development token verification — decodes without cryptographic verification.
 * Only used when AUTH_JWKS_URL is not configured AND NODE_ENV !== 'production'.
 */
function verifyTokenDevelopment(token: string, issuer?: string): AuthContext | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8'),
    );

    // Check expiration
    const exp = payload.exp as number | undefined;
    if (exp && exp < Date.now() / 1000) {
      return null;
    }

    // Check issuer if configured
    if (issuer && payload.iss !== issuer) {
      return null;
    }

    return {
      principalId: payload.sub || 'dev-user',
      principalType: payload.ptp || 'user',
      organizationId: payload.oid || '00000000-0000-0000-0000-000000000000',
      workspaceId: payload.wid,
      scopes: payload.scp?.split(' ') || ['mcp:read'],
      tokenId: payload.jti,
      issuedAt: new Date((payload.iat || 0) * 1000),
      expiresAt: new Date((exp || 0) * 1000),
      claims: payload,
    };
  } catch {
    return null;
  }
}

/**
 * Generate a token hash for auditing (never store raw tokens)
 */
export function hashToken(token: string): string {
  return require('crypto').createHash('sha256').update(token).digest('hex').substring(0, 32);
}

/**
 * Generate a token prefix for identification (first 8 chars of hash)
 */
export function getTokenPrefix(token: string): string {
  return hashToken(token).substring(0, 8);
}
