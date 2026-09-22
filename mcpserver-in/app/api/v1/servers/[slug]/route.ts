// app/api/v1/servers/[slug]/route.ts
// REST API — Get, update, delete a single server

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { servers } from '@/lib/db/schema';
import { verifyToken } from '@/lib/auth/verify-token';
import { logAuditEvent } from '@/lib/audit/logger';
import crypto from 'crypto';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const { slug } = await params;

    const server = await db.query.servers.findFirst({
      where: { slug },
    });

    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: server,
      meta: {
        evidenceCount: 0, // Will be populated with evidence query
        lastUpdated: server.updatedAt,
      },
    });
  } catch (error) {
    await logAuditEvent({
      tenantId: 'anonymous',
      userId: 'anonymous',
      toolName: 'GET /api/v1/servers/[slug]',
      status: 'error',
      latencyMs: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const { slug } = await params;

    // Authenticate
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authContext = await verifyToken(token);
    if (!authContext) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!authContext.scopes.includes('deploy:write')) {
      return NextResponse.json(
        { error: 'Insufficient scope. Requires: deploy:write' },
        { status: 403 },
      );
    }

    // Get existing server
    const existing = await db.query.servers.findFirst({
      where: { slug },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }

    // Parse body
    const body = await request.json();

    // Update server
    const [updated] = await db
      .update(servers)
      .set({
        name: body.name || existing.name,
        description: body.description || existing.description,
        category: body.category || existing.category,
        transport: body.transport || existing.transport,
        repoUrl: body.repoUrl || existing.repoUrl,
        packageUrl: body.packageUrl || existing.packageUrl,
        versionPin: body.versionPin ?? existing.versionPin,
        region: body.region || existing.region,
        serverJson: body.serverJson || existing.serverJson,
        tools: body.tools || existing.tools,
        verified: body.verified ?? existing.verified,
        status: body.status || existing.status,
        updatedAt: new Date(),
      })
      .where((s, { eq }) => eq(s.slug, slug))
      .returning();

    const { revalidateTag } = await import('next/cache');
    revalidateTag('servers', 'max');

    await logAuditEvent({
      tenantId: authContext.organizationId,
      userId: authContext.principalId,
      serverId: updated.id,
      toolName: 'PATCH /api/v1/servers/[slug]',
      status: 'success',
      latencyMs: Date.now() - startTime,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    await logAuditEvent({
      tenantId: 'unknown',
      userId: 'unknown',
      toolName: 'PATCH /api/v1/servers/[slug]',
      status: 'error',
      latencyMs: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const startTime = Date.now();

  try {
    const { slug } = await params;

    // Authenticate
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authContext = await verifyToken(token);
    if (!authContext) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!authContext.scopes.includes('deploy:write')) {
      return NextResponse.json(
        { error: 'Insufficient scope' },
        { status: 403 },
      );
    }

    // Soft delete (mark as deleted instead of actual deletion)
    const [deleted] = await db
      .update(servers)
      .set({
        status: 'deleted',
        updatedAt: new Date(),
      })
      .where((s, { eq }) => eq(s.slug, slug))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }

    const { revalidateTag } = await import('next/cache');
    revalidateTag('servers', 'max');

    await logAuditEvent({
      tenantId: authContext.organizationId,
      userId: authContext.principalId,
      serverId: deleted.id,
      toolName: 'DELETE /api/v1/servers/[slug]',
      status: 'success',
      latencyMs: Date.now() - startTime,
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
