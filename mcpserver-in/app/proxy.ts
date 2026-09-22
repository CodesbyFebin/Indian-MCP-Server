// app/proxy.ts
// Next.js 16: proxy.ts replaces deprecated middleware.ts
// Runs on Node.js runtime and can modify outgoing requests

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit/ratelimit';

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const startTime = Date.now();

  // ============================================================
  // Rate Limiting — Anonymous for non-auth routes
  // ============================================================

  if (url.pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    // Skip rate limiting for auth endpoints (they have their own stricter limits)
    if (url.pathname.startsWith('/api/auth/')) {
      return NextResponse.next();
    }

    // Apply standard API rate limit for anonymous requests
    // Authenticated requests will be checked in the route handler with principal-specific limits
    try {
      const result = await checkRateLimit(rateLimiters.api.anonymous, `ip:${ip}`);

      if (!result.success) {
        return NextResponse.json(
          {
            error: {
              code: 429,
              message: 'Rate limit exceeded. Please try again later.',
              retryAfter: result.retryAfter,
            },
          },
          { status: 429, headers: { 'Retry-After': String(result.retryAfter || 60) } },
        );
      }
    } catch {
      // Rate limiter unavailable — allow request to proceed
      // In production, you might want to fail closed instead
    }
  }

  // ============================================================
  // Security headers
  // ============================================================

  // Clone the request headers and add security headers
  const response = NextResponse.next();

  // DPDP Compliance: Set data residency headers
  const region = process.env.NEXT_PUBLIC_REGION || 'asia-south1';
  response.headers.set('X-Data-Residency', region);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');

  // CSP for the application
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.mcpserver.in",
    "frame-ancestors 'none'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  return response;
}
