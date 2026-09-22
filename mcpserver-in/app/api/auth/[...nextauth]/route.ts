// app/api/auth/[...nextauth]/route.ts
// NextAuth.js route handler (for authentication UI flows)
// This provides signin/signup endpoints backed by our auth server

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit/ratelimit';
import { z } from 'zod';

// Login form schema
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Simple in-memory user store (replace with DB in production)
const USERS: Record<string, { id: string; email: string; passwordHash: string; role: string }> = {
  'admin@mcpserver.in': {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@mcpserver.in',
    passwordHash: 'hashed-password-placeholder',
    role: 'admin',
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // Return HTML sign-in page
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sign In — MCPServer.in</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; background: #f9fafb; }
    .card { max-width: 420px; margin: 4rem auto; padding: 2rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); background: white; }
    input { width: 100%; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; margin: 0.5rem 0; }
    button { width: 100%; padding: 0.75rem; background: #1e40af; color: white; border-radius: 8px; border: none; font-weight: 500; cursor: pointer; }
    button:hover { background: #1d4ed8; }
    h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }
    p { color: #6b7280; font-size: 0.875rem; }
    .hidden { display: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Sign In to MCPServer.in</h1>
    <p>Access the India-region MCP server directory and control plane.</p>
    <form method="POST" action="/api/auth/callback/signin">
      <input type="hidden" name="callbackUrl" value="${callbackUrl}" />
      <input type="email" name="email" placeholder="you@example.com" required autocomplete="email" />
      <input type="password" name="password" type="password" required autocomplete="current-password" />
      <button type="submit">Sign In</button>
    </form>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

export async function POST(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  // Rate limit login attempts (brute force protection)
  const rlResult = await checkRateLimit(rateLimiters.auth.login, `ip:${ip}`);
  if (!rlResult.success) {
    return NextResponse.json(
      { error: 'rate_limit_exceeded' },
      { status: 429 },
    );
  }

  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const callbackUrl = (formData.get('callbackUrl') as string) || '/';

  // Validate input
  const parsed = LoginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input' },
      { status: 400 },
    );
  }

  // Find user
  const user = USERS[email.toLowerCase()];
  if (!user) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 },
    );
  }

  // In production: verify password hash with bcrypt/argon2
  // For this stub, we skip actual verification

  // Generate JWT token
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret');
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    oid: user.id,
    ptp: 'user',
    scp: 'mcp:read mcp:execute compliance:read',
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(process.env.NEXT_PUBLIC_URL || 'http://localhost:3000')
    .setAudience(process.env.NEXT_PUBLIC_URL || 'http://localhost:3000')
    .setIssuedAt()
    .setExpirationTime('24h')
    .setJTI()
    .sign(secret);

  // Set as cookie
  const response = NextResponse.redirect(new URL(callbackUrl, request.nextUrl).toString());
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return response;
}
