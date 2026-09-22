// app/api/auth/token/route.ts
// OAuth 2.0 Token Endpoint (stub implementation)
// In production, this would be backed by a full auth server

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit/ratelimit';

export async function POST(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  // Rate limit token endpoint (brute force protection)
  const rlResult = await checkRateLimit(rateLimiters.auth.token, `ip:${ip}`);
  if (!rlResult.success) {
    return NextResponse.json(
      { error: 'rate_limit_exceeded', error_description: 'Too many token requests' },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const { grant_type, client_id, client_secret } = body;

    // Basic validation
    if (grant_type !== 'client_credentials') {
      return NextResponse.json(
        { error: 'unsupported_grant_type', error_description: 'Only client_credentials grant is supported' },
        { status: 400 },
      );
    }

    if (!client_id || !client_secret) {
      return NextResponse.json(
        { error: 'invalid_client', error_description: 'Client credentials required' },
        { status: 401 },
      );
    }

    // In production, verify client_id/client_secret against a database
    if (client_secret !== process.env.CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'invalid_client', error_description: 'Invalid client secret' },
        { status: 401 },
      );
    }

    // Generate JWT token
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-change-me');

    const token = await new SignJWT({
      sub: client_id,
      oid: client_id,
      ptp: 'service',
      scp: 'mcp:read mcp:execute',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer(process.env.AUTH_SERVER_URL || 'http://localhost:3000')
      .setAudience(process.env.NEXT_PUBLIC_URL || 'http://localhost:3000')
      .setIssuedAt()
      .setExpirationTime('1h')
      .setJTI()
      .sign(secret);

    return NextResponse.json({
      access_token: token,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'mcp:read mcp:execute',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 },
    );
  }
}
