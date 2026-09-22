// app/api/v1/servers/route.ts
// REST API — List and create MCP servers
// Public read, authenticated write

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { servers } from '@/lib/db/schema';
import { verifyToken } from '@/lib/auth/verify-token';
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit/ratelimit';
import { logAuditEvent } from '@/lib/audit/logger';
import crypto from 'crypto';
import { z } from 'zod';

const ServerCreateSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().min(1),
  category: z.string(),
  transport: z.enum(['stdio', 'streamable_http']),
  repoUrl: z.string().url(),
  packageUrl: z.string().url().optional(),
  versionPin: z.string().optional(),
  region: z.string().default('asia-south1'),
  serverJson: z.record(z.unknown()),
  tools: z.array(z.unknown()).default([]),
});

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  try {
    // Rate limit
    const result = await checkRateLimit(rateLimiters.api.standard, `ip:${ip}`);
    if (!result.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('q');
    const verified = searchParams.get('verified') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    // Build query
    const allServers = await db.query.servers.findMany({
      where: (servers, { and, eq, like }) => {
        const conditions = [];
        if (category) conditions.push(eq(servers.category, category));
        if (search) conditions.push(like(servers.name, `%${search}%`));
        if (verified) conditions.push(eq(servers.verified, true));
        return and(...conditions);
      },
      orderBy: (servers, { desc }) => desc(servers.createdAt),
      limit,
    });

    return NextResponse.json({
      data: allServers,
      meta: {
        count: allServers.length,
        limit,
        filters: { category, search, verified },
      },
    });
  } catch (error) {
    await logAuditEvent({
      tenantId: ip,
      userId: 'anonymous',
      toolName: 'GET /api/v1/servers',
      status: 'error',
      latencyMs: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    // Authenticate
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authContext = await verifyToken(token);
    if (!authContext) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 },
        {
          headers: {
            'WWW-Authenticate': 'Bearer realm="api", error="invalid_token"',
          },
        },
      );
    }

    // Check scope
    if (!authContext.scopes.includes('deploy:write')) {
      return NextResponse.json(
        { error: 'Insufficient scope. Requires: deploy:write' },
        { status: 403 },
      );
    }

    // Parse and validate body
    const body = await request.json();
    const parsed = ServerCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Check for duplicate slug
    const existing = await db.query.servers.findFirst({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Server with slug "${data.slug}" already exists` },
        { status: 409 },
      );
    }

    // Create server
    const [newServer] = await db
      .insert(servers)
      .values({
        id: crypto.randomUUID(),
        slug: data.slug,
        name: data.name,
        description: data.description,
        category: data.category,
        transport: data.transport,
        repoUrl: data.repoUrl,
        packageUrl: data.packageUrl,
        versionPin: data.versionPin,
        region: data.region,
        verified: false,
        serverJson: data.serverJson,
        tools: data.tools,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Invalidate cache
    const { revalidateTag } = await import('next/cache');
    revalidateTag('servers', 'max');

    // Audit log
    await logAuditEvent({
      tenantId: authContext.organizationId,
      userId: authContext.principalId,
      toolName: 'POST /api/v1/servers',
      status: 'success',
      latencyMs: Date.now() - startTime,
    });

    return NextResponse.json(
      { data: newServer },
      { status: 201, headers: { 'X-Request-Id': requestId } },
    );
  } catch (error) {
    console.error('Create server error:', error);

    await logAuditEvent({
      tenantId: 'unknown',
      userId: 'unknown',
      toolName: 'POST /api/v1/servers',
      status: 'error',
      latencyMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
