import { NextResponse } from "next/server";
import { getIndexableServers } from "@/src/content/server-registry";
import { CANONICAL_ORIGIN } from "@/src/seo/breadcrumbs";

/**
 * Registry JSON endpoint — machine-readable server index
 * 
 * Returns all indexable servers (passing isServerIndexable()) in a format
 * suitable for programmatic consumption by MCP clients, registries, and tools.
 * 
 * Follows the server.json metadata convention for MCP server discovery.
 */
export async function GET() {
  const servers = getIndexableServers();
  const now = new Date().toISOString();
  
  const registry = {
    metadata: {
      name: "MCPserver.in Registry",
      description: "Public authority for MCP server discovery with evidence-backed verification",
      version: "1.0.0",
      canonicalOrigin: CANONICAL_ORIGIN,
      generatedAt: now,
      totalServers: servers.length,
      publicationAuthority: "isServerIndexable() from @mcp/servers-registry",
      evidenceLedger: `${CANONICAL_ORIGIN}/evidence`,
    },
    servers: servers.map((server) => ({
      // Core identity (required by server.json spec)
      name: server.name,
      slug: server.slug,
      description: server.description,
      version: server.version,
      
      // Capabilities (tools, resources, prompts)
      capabilities: server.capabilities,
      
      // Transport & authentication
      transports: server.transports,
      authentication: server.authentication,
      
      // Discovery
      repository: server.repository,
      documentation: server.documentationUrl,
      categories: server.categories,
      tags: server.tags,
      
      // Verification & provenance
      verificationStatus: server.verificationStatus,
      verificationSummary: server.verificationSummary,
      evidenceRefs: server.evidenceRefs,
      lastVerifiedAt: server.lastVerifiedAt,
      
      // Canonical URL
      url: `${CANONICAL_ORIGIN}${server.indexPath}`,
      
      // Registry metadata
      createdAt: server.createdAt,
      updatedAt: server.updatedAt,
    })),
  };
  
  return NextResponse.json(registry, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}