// lib/rate-limit/ratelimit.ts
// Upstash Redis-based rate limiter
// Provides per-principal rate limiting with standard limits

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error(
    'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables are required',
  );
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Standard rate limits for different scopes
export const rateLimiters = {
  // API endpoint limits
  api: {
    // Standard API clients: 60 requests/minute
    standard: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1m'),
      prefix: 'mcp:api:standard',
      analytics: true,
    }),

    // Unauthenticated: 10 requests/minute
    anonymous: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1m'),
      prefix: 'mcp:api:anonymous',
      analytics: true,
    }),
  },

  // MCP tool execution limits
  mcp: {
    // Read tools: 30 requests/minute
    read: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1m'),
      prefix: 'mcp:tools:read',
      analytics: true,
    }),

    // Write tools: 10 requests/minute
    write: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1m'),
      prefix: 'mcp:tools:write',
      analytics: true,
    }),

    // Search: 20 requests/minute
    search: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1m'),
      prefix: 'mcp:tools:search',
      analytics: true,
    }),
  },

  // Auth endpoints
  auth: {
    // Login attempts: 5 requests/minute (brute force protection)
    login: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1m'),
      prefix: 'mcp:auth:login',
      analytics: true,
    }),

    // Token requests: 30 requests/minute
    token: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1m'),
      prefix: 'mcp:auth:token',
      analytics: true,
    }),
  },
};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

/**
 * Check rate limit for a given key and rate limiter
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  key: string,
): Promise<RateLimitResult> {
  const result = await limiter.limit(key);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: new Date(result.reset),
    ...(result.success ? {} : { retryAfter: 60 }),
  };
}
