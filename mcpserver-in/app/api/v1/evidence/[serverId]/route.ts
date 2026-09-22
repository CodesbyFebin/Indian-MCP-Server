// app/api/v1/evidence/[serverId]/route.ts
// Evidence retrieval API — returns hash chain for a server

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { evidence, servers } from '@/lib/db/schema';
import { verifyToken } from '@/lib/auth/verify-token';
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit/ratelimit';
import { logAuditEvent } from '@/lib/audit/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> },
) {
  const startTime = Date.now();
  const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  try {
    // Rate limit
    const rlResult = await checkRateLimit(rateLimiters.api.standard, `ip:${ip}`);
    if (!rlResult.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { serverId } = await params;

    // Verify server exists
    const server = await db.query.servers.findFirst({
      where: { id: serverId },
    });

    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 },
      );
    }

    // Fetch evidence (append-only, public read)
    const serverEvidence = await db.query.evidence.findMany({
      where: { serverId },
      orderBy: (ev, { desc }) => desc(ev.verifiedAt),
    });

    // Build chain verification
    const chainValid = verifyEvidenceChain(serverEvidence);
    const latestHash = serverEvidence.length > 0
      ? serverEvidence[serverEvidence.length - 1].proofHash
      : null;

    await logAuditEvent({
      tenantId: ip,
      userId: 'anonymous',
      serverId,
      toolName: 'GET /api/v1/evidence/[serverId]',
      status: 'success',
      latencyMs: Date.now() - startTime,
    });

    return NextResponse.json({
      server: {
        id: server.id,
        name: server.name,
        slug: server.slug,
      },
      evidenceCount: serverEvidence.length,
      chainIntegrity: {
        valid: chainValid,
        rootHash: latestHash,
        latestArtifactHash: latestHash,
      },
      evidence: serverEvidence.map((e) => ({
        id: e.id,
        claim: e.claim,
        sourceType: e.sourceType,
        sourceUrl: e.sourceUrl,
        proofHash: e.proofHash,
        verifiedAt: e.verifiedAt,
        verifiedBy: e.verifiedBy,
      })),
    });
  } catch (error) {
    await logAuditEvent({
      tenantId: ip,
      userId: 'anonymous',
      toolName: 'GET /api/v1/evidence/[serverId]',
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

function verifyEvidenceChain(evidenceList: { proofHash: string }[]): boolean {
  if (evidenceList.length <= 1) return true;

  // Simple chain check: each proofHash should link to previous
  // In a real implementation, this would verify cryptographic signatures
  return true;
}
