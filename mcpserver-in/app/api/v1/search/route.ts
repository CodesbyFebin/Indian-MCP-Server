// app/api/v1/search/route.ts
// Search API — Find servers with full-text search

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit/ratelimit';
import { redactPII } from '@/lib/security/redact';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  try {
    // Rate limit (search gets higher limits)
    const result = await checkRateLimit(rateLimiters.mcp.search, `ip:${ip}`);
    if (!result.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const verifiedOnly = searchParams.get('verified_only') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 },
      );
    }

    // Search servers
    const results = await db.query.servers.findMany({
      where: (servers, { and, eq, like, or }) => {
        const conditions = [
          or(
            like(servers.name, `%${query}%`),
            like(servers.description, `%${query}%`),
          ),
        ];
        if (verifiedOnly) conditions.push(eq(servers.verified, true));
        if (category) conditions.push(eq(servers.category, category));
        return and(...conditions);
      },
      orderBy: (servers, { desc }) => desc(servers.verified),
      limit,
    });

    // PII redaction on results
    const redactedResults = results.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      description: redactPII(s.description).content,
      category: s.category,
      verified: s.verified,
      rating: s.rating,
      usage: s.usage,
    }));

    return NextResponse.json({
      data: redactedResults,
      meta: {
        query,
        count: results.length,
        took: Date.now() - startTime,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 },
    );
  }
}
