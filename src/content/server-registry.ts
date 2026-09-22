/**
 * MCPserver.in Server Registry — Web Adapter
 *
 * Thin projection layer over the shared registry package.
 * The authoritative server data and publication logic live in @mcp/servers-registry.
 * This file adapts the shared types for the Next.js web app and provides
 * route helpers that delegate to isServerIndexable().
 *
 * Do NOT maintain duplicate server entity data here.
 * Server records should originate from the shared registry/evidence layer.
 */

import { isServerIndexable, isServerIndexableEntry } from "@mcp/servers-registry";

/** Re-export the authoritative publication predicate for runtime guards. */
export { isServerIndexable, isServerIndexableEntry };

/**
 * ServerEntry defines the web projection of a server entity.
 * Does NOT extend RegistryEntry - we only include fields we actually use.
 * Fields without evidence should be null/undefined, not fabricated.
 */
export interface ServerEntry {
  /** Unique identifier */
  id: string;
  /** Entry type - always "server" for this registry */
  type: "server";
  /** Display name */
  name: string;
  /** Description (evidence-backed) */
  description: string;
  /** URL-safe slug */
  slug: string;
  /** Version string - null if no verified version exists */
  version: string | null;
  /** Verified capabilities (tools, resources, prompts) */
  capabilities: string[] | null;
  /** Tags for grouping/filtering */
  tags: string[];
  /** Legacy evidence references (deprecated - use evidenceRefs) */
  evidence: string[];
  /** Evidence reference IDs from the Evidence Ledger */
  evidenceRefs: string[];
  /** Verification status */
  verificationStatus: "verified" | "unverified" | "pending";
  /** Publication status */
  publicationStatus: "draft" | "published" | "archived";
  /** Creator of this registry entry */
  creator: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Canonical URL path for this server entity */
  indexPath: string;
  /** Last verified date (ISO string) */
  lastVerifiedAt?: string | null;
  /** Repository URL (GitHub/GitLab) where source can be inspected */
  repository?: string | null;
  /** Documentation URL (official docs, README) */
  documentationUrl?: string | null;
  /** Supported transports (stdio, streamable-http, etc.) */
  transports?: string[] | null;
  /** Supported authentication methods */
  authentication?: string[] | null;
  /** Categories for grouping (distinct from tags) */
  categories?: string[] | null;
  /** Human-readable verification summary from publication decision */
  verificationSummary?: string;
  /** Whether this server has completed full verification (passes isServerIndexable) */
  isVerified: boolean;
}

/**
 * Evidence reference from the Evidence Ledger (matches @mcp/servers-evidence EvidenceRef)
 */
export interface ServerEvidenceRef {
  id: string;
  sourceUrl: string;
  sourceType: "official" | "registry" | "repository" | "documentation" | "package-registry" | "measurement" | "editorial";
  status: "verified" | "unverified";
  lastChecked: string | null;
  supports: string[];
  finding: string;
  limitations?: string;
}

/**
 * Compute the publication decision for a server entry using the
 * centralized isServerIndexable() from the shared registry package.
 */
function computePublicationDecision(entry: Pick<ServerEntry, "publicationStatus" | "verificationStatus" | "evidenceRefs">): {
  indexable: boolean;
  reason: string;
  decidedAt: string;
} {
  const published = entry.publicationStatus === "published";
  const evidenceCount = entry.evidenceRefs?.length ?? 0;
  const evidenceVerified = entry.verificationStatus === "verified" && evidenceCount > 0;

  // Map verificationStatus to isServerIndexable's status type
  const statusForIndexable = published
    ? "published"
    : entry.verificationStatus === "pending"
    ? "draft"
    : "unverified";

  return isServerIndexable(published, evidenceCount, evidenceVerified, statusForIndexable);
}

/**
 * Create a server entry with publication authority evaluation.
 * This is the adapter's entry point — it takes raw data and applies the
 * shared publication logic.
 */
function createServerEntry(
  entry: Omit<ServerEntry, "indexPath" | "isVerified" | "verificationSummary"> & { indexPath: string }
): ServerEntry {
  const decision = computePublicationDecision(entry);

  return {
    ...entry,
    indexPath: entry.indexPath,
    isVerified: decision.indexable,
    verificationSummary: decision.reason,
  };
}

/**
 * Server Registry — maps canonical paths to server entries.
 * In production, this data should come from the shared registry package
 * (e.g., a JSON export from the Evidence Ledger). For now, it contains
 * a single seed entry for demonstration.
 */
export const serverRegistry: Record<string, ServerEntry> = {
  "/servers/mcp-server-postgres": createServerEntry({
    id: "mcp-server-postgres",
    type: "server",
    name: "mcp-server-postgres",
    description: "No verified implementation exists under this name as of 2026-08-22. See evidence panel for primary-source findings.",
    slug: "mcp-server-postgres",
    version: null, // Unknown - no verified version
    capabilities: null, // Null - no verified capabilities
    tags: [], // Empty - no verified tags (all previous tags lacked evidence)
    evidence: [], // Legacy field from RegistryEntry
    evidenceRefs: [
      "ev-mcp-servers-github-2026-08-22",
      "ev-npm-mcp-server-postgres-2026-08-22",
      "ev-pypi-mcp-server-postgres-2026-08-22",
      "ev-mcp-specification-2026-08-22",
    ],
    verificationStatus: "unverified",
    publicationStatus: "published",
    creator: "MCPserver.in Evidence Ledger",
    createdAt: "2026-08-22T00:00:00Z",
    updatedAt: "2026-08-22T00:00:00Z",
    indexPath: "/servers/mcp-server-postgres",
    lastVerifiedAt: "2026-08-22",
    repository: "https://github.com/modelcontextprotocol/servers",
    documentationUrl: null,
    transports: null,
    authentication: null,
    categories: [], // Empty - no verified categories
  }),
};

/** All registered server paths */
export const serverPaths = Object.keys(serverRegistry);

/**
 * Look up a server entry by canonical path, or return undefined.
 * Exported helper so route templates never reach for missing entries.
 */
export function getServerEntry(indexPath: string): ServerEntry | undefined {
  return serverRegistry[indexPath];
}

/**
 * Get all servers that satisfy the publication authority (indexable).
 * These are the servers that appear in the public directory and sitemap.
 * Delegates to the shared isServerIndexable() via computePublicationDecision.
 */
export function getIndexableServers(): ServerEntry[] {
  return Object.values(serverRegistry).filter((entry) => entry.isVerified);
}

/**
 * Get all servers with published status (including unverified/not-indexable).
 * Used for internal/admin views where all tracked servers are visible.
 */
export function getAllPublishedServers(): ServerEntry[] {
  return Object.values(serverRegistry).filter((entry) => entry.publicationStatus === "published");
}

/**
 * Get servers by category/tag for category pages.
 * Only returns indexable servers.
 */
export function getServersByCategory(category: string): ServerEntry[] {
  return getIndexableServers().filter((entry) =>
    entry.categories?.includes(category) ?? false
  );
}

/**
 * Get servers by capability for capabilities pages.
 * Only returns indexable servers.
 */
export function getServersByCapability(capability: string): ServerEntry[] {
  return getIndexableServers().filter((entry) =>
    entry.capabilities?.includes(capability) ?? false
  );
}

/**
 * Get the verification decision for a server using the shared authority.
 */
export function getServerVerificationDecision(entry: ServerEntry): {
  indexable: boolean;
  reason: string;
  decidedAt: string;
} {
  return computePublicationDecision(entry);
}