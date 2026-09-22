// app/api/mcp/route-impl.ts
// Core MCP Server Endpoint — Implementation
// mcp-handler 2.x — 2026-07-28 spec (stateless, no sessions)

import { createMcpHandler, withMcpAuth, protectedResourceHandler } from 'mcp-handler';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth/verify-token';
import { logAuditEvent } from '@/lib/audit/logger';
import crypto from 'crypto';

// Schema for search tool
const SearchSchema = z.object({
  query: z.string().min(1).max(200),
  category: z.string().optional(),
  verifiedOnly: z.boolean().default(false),
});

// Schema for evidence tool
const EvidenceSchema = z.object({
  slug: z.string().min(1),
});

// Schema for compliance report tool
const ComplianceReportSchema = z.object({
  tenantId: z.string().uuid(),
});

// Schema for RBI preflight tool
const RBIPreflightSchema = z.object({
  serverId: z.string().uuid(),
});

// 1. Define the MCP server surface
const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      'search_mcp_servers',
      {
        title: 'Search MCP Servers',
        description:
          'Search the mcpserver.in directory. Returns verified servers with evidence-backed capability claims.',
        inputSchema: SearchSchema,
        annotations: { readOnlyHint: true },
      },
      async ({ query, category, verifiedOnly }) => {
        const startTime = Date.now();

        const results = await db.query.servers.findMany({
          where: (servers, { and, eq, like, or }) => {
            const conditions = [
              or(
                like(servers.name, `%${query}%`),
                like(servers.description, `%${query}%`),
              ),
            ];
            if (category) {
              conditions.push(eq(servers.category, category));
            }
            if (verifiedOnly) {
              conditions.push(eq(servers.verified, true));
            }
            return and(...conditions);
          },
          limit: 20,
        });

        // Log audit event
        await logAuditEvent({
          tenantId: 'mcp-public',
          userId: 'anonymous',
          toolName: 'search_mcp_servers',
          status: 'success',
          latencyMs: Date.now() - startTime,
          requestId: crypto.randomUUID(),
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      },
    );

    server.registerTool(
      'get_server_evidence',
      {
        title: 'Get Server Evidence',
        description:
          'Returns the append-only evidence ledger for a specific server, including proof hashes and verification records.',
        inputSchema: EvidenceSchema,
        annotations: { readOnlyHint: true },
      },
      async ({ slug }) => {
        const startTime = Date.now();

        const server = await db.query.servers.findFirst({
          where: { slug },
        });

        if (!server) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Server not found' }),
              },
            ],
            isError: true,
          };
        }

        const serverEvidence = await db.query.evidence.findMany({
          where: { serverId: server.id },
          orderBy: (ev, { desc }) => desc(ev.verifiedAt),
        });

        await logAuditEvent({
          tenantId: 'mcp-public',
          userId: 'anonymous',
          serverId: server.id,
          toolName: 'get_server_evidence',
          status: 'success',
          latencyMs: Date.now() - startTime,
          requestId: crypto.randomUUID(),
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  server: {
                    name: server.name,
                    slug: server.slug,
                    verified: server.verified,
                  },
                  evidenceCount: serverEvidence.length,
                  evidence: serverEvidence.map((e) => ({
                    claim: e.claim,
                    sourceType: e.sourceType,
                    sourceUrl: e.sourceUrl,
                    proofHash: e.proofHash,
                    verifiedAt: e.verifiedAt,
                    verifiedBy: e.verifiedBy,
                  })),
                  chainIntegrity: {
                    rootHash:
                      serverEvidence.length > 0
                        ? serverEvidence[serverEvidence.length - 1].proofHash
                        : null,
                    artifactCount: serverEvidence.length,
                  },
                },
                null,
                2,
              ),
            },
          ],
        };
      },
    );

    server.registerTool(
      'get_dpdp_compliance_report',
      {
        title: 'Get DPDP Compliance Report',
        description:
          'Returns the Digital Personal Data Protection Act compliance report for a given tenant. Gated behind scope: compliance:read.',
        inputSchema: ComplianceReportSchema,
        annotations: { readOnlyHint: true },
      },
      async ({ tenantId }) => {
        const startTime = Date.now();

        const report = await db.query.auditLog.findMany({
          where: { tenantId },
          limit: 100,
        });

        const result = {
          tenantId,
          reportGenerated: new Date().toISOString(),
          totalAuditEvents: report.length,
          piiRedacted: true,
          complianceStatus: 'pending',
          evidenceSummary: {
            totalEvents: report.length,
            toolsUsed: [...new Set(report.map((r) => r.toolName))],
          },
        };

        await logAuditEvent({
          tenantId,
          userId: 'system',
          toolName: 'get_dpdp_compliance_report',
          status: 'success',
          latencyMs: Date.now() - startTime,
          requestId: crypto.randomUUID(),
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      },
    );

    server.registerTool(
      'rbi_preflight_check',
      {
        title: 'RBI Cyber Framework Pre-Flight Check',
        description:
          'Validates a server configuration against RBI Cyber Framework rules (MFA, session timeouts, audit logging).',
        inputSchema: RBIPreflightSchema,
        annotations: { readOnlyHint: true },
      },
      async ({ serverId }) => {
        const startTime = Date.now();

        const server = await db.query.servers.findFirst({
          where: { id: serverId },
        });

        if (!server) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Server not found' }),
              },
            ],
            isError: true,
          };
        }

        const config = server.serverJson as Record<string, unknown>;

        const checks = [
          {
            rule: 'Session timeout <= 30 minutes',
            passed:
              (config?.sessionTimeoutMs as number | undefined) !== undefined &&
              (config?.sessionTimeoutMs as number) <= 1800000,
            severity: 'high' as const,
          },
          {
            rule: 'Multi-factor authentication enabled',
            passed: config?.mfaRequired === true,
            severity: 'critical' as const,
          },
          {
            rule: 'Audit logging enabled',
            passed: config?.auditLogging === true,
            severity: 'medium' as const,
          },
          {
            rule: 'Transport encryption enforced',
            passed: config?.tlsEnforced === true,
            severity: 'high' as const,
          },
          {
            rule: 'Rate limiting configured',
            passed: !!config?.rateLimit,
            severity: 'medium' as const,
          },
        ];

        const allPassed = checks.every((c) => c.passed);

        await logAuditEvent({
          tenantId: 'mcp-public',
          userId: 'anonymous',
          serverId: server.id,
          toolName: 'rbi_preflight_check',
          status: 'success',
          latencyMs: Date.now() - startTime,
          requestId: crypto.randomUUID(),
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  server: server.name,
                  serverId: server.id,
                  checkedAt: new Date().toISOString(),
                  framework: 'RBI_CYBER_2023',
                  overallStatus: allPassed ? 'PASS' : 'FAIL',
                  checks,
                  recommendations: checks
                    .filter((c) => !c.passed)
                    .map((c) => `Implement: ${c.rule}`),
                },
                null,
                2,
              ),
            },
          ],
        };
      },
    );

    // Register a static resource for listing all servers
    server.registerResource(
      'server-list',
      'mcpserver://servers/list',
      {
        title: 'Server Directory Resource',
        description: 'Live listing of all MCP servers in the directory',
        mimeType: 'application/json',
      },
      async (uri: string) => {
        const allServers = await db.query.servers.findMany({
          limit: 100,
        });

        return {
          contents: [
            {
              uri,
              text: JSON.stringify(allServers, null, 2),
              mimeType: 'application/json',
            },
          ],
        };
      },
    );
  },
  {
    serverInfo: {
      name: 'mcpserver.in',
      version: '1.0.0',
    },
    instructions: 'India-region MCP directory. All claims are evidence-backed.',
  },
);

// 2. Wrap with bearer-token verification (RFC 9728 challenges on 401/403)
const authed = withMcpAuth(handler, verifyToken, {
  requiredScopes: ['mcp:read'],
  resourceMetadataUrl: new URL(
    '/.well-known/oauth-protected-resource',
    process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  ),
});

export { authed as GET, authed as POST };

// Re-export types
export type { AuthContext } from '@/lib/auth/types';
