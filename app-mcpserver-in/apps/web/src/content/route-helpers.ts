import {
  contentRegistry,
  getChildren,
  RegistryEntry,
  ContentType,
} from "@/src/content/content-registry";
import {
  getServerEntry,
  getIndexableServers,
  getAllPublishedServers,
  getServersByCategory,
  getServersByCapability,
  ServerEntry,
  ServerEvidenceRef,
  getServerVerificationDecision,
} from "@/src/content/server-registry";

/**
 * Route helpers for the dynamic editorial route shells. Route templates are
 * thin: they delegate all publication logic to the content registry and the
 * ContentPage template so no single page file restates the authority rule.
 */

/** Server registry helpers for /servers aggregate and individual pages. */
export const serverRegistryHelpers = {
  getServerEntry,
  getIndexableServers,
  getAllPublishedServers,
  getServersByCategory,
  getServersByCapability,
  getServerVerificationDecision,
};

/** Re-export server registry functions for direct import. */
export {
  getIndexableServers,
  getServerEntry,
  getAllPublishedServers,
  getServersByCategory,
  getServersByCapability,
  getServerVerificationDecision,
};

/**
 * Cross-system linking: resolve editorial content's relatedServerSlugs
 * through the server registry's publication authority.
 * Only returns servers that pass isServerIndexable().
 */
export function getRelatedPublicServers(
  entry: { relatedServerSlugs?: string[] },
): ServerEntry[] {
  if (!entry.relatedServerSlugs || entry.relatedServerSlugs.length === 0) {
    return [];
  }
  return entry.relatedServerSlugs
    .map((slug) => getServerEntry(`/servers/${slug}`))
    .filter((server): server is ServerEntry => server !== undefined)
    .filter((server) => server.isVerified);
}

/**
 * Get all unique categories from indexable servers.
 */
export function getAllCategories(): string[] {
  const servers = getIndexableServers();
  const categories = new Set<string>();
  servers.forEach((s) => s.categories?.forEach((c) => categories.add(c)));
  return Array.from(categories).sort();
}

/**
 * Get all unique capabilities from indexable servers.
 */
export function getAllCapabilities(): string[] {
  const servers = getIndexableServers();
  const capabilities = new Set<string>();
  servers.forEach((s) => s.capabilities?.forEach((c) => capabilities.add(c)));
  return Array.from(capabilities).sort();
}

/** All entries (aggregate or leaf) for a top-level parent path. */
export function entriesForParent(parent: string): RegistryEntry[] {
  return getChildren(parent).sort((a, b) => a.title.localeCompare(b.title));
}

/** Find a single entry by parent + slug using the keyed registry. */
export function entryBySlug(parent: string, slug: string): RegistryEntry | undefined {
  return contentRegistry[`/${parent}/${slug}`];
}

/** The aggregate (collection) entry for a parent, if one exists. */
export function collectionFor(parent: string): RegistryEntry | undefined {
  return contentRegistry[`/${parent}`];
}

/** Slugs eligible for static generation for a parent. */
export function staticSlugsFor(parent: string): string[] {
  return entriesForParent(parent)
    .filter((e) => e.type !== "category")
    .map((e) => e.slug);
}

/** Children of an entry, excluding itself (for the "In this collection" block). */
export function siblingEntries(entry: RegistryEntry): RegistryEntry[] {
  return getChildren(entry.parent).filter((e) => e.slug !== entry.slug);
}

/** Human label for the collection a child belongs to. */
export function parentLabel(parent: string): string {
  switch (parent) {
    case "learn":
      return "Learn";
    case "clients":
      return "Clients";
    case "guides":
      return "Guides";
    case "build":
      return "Build";
    case "security":
      return "Security";
    case "servers":
      return "Servers";
    default:
      return parent.charAt(0).toUpperCase() + parent.slice(1);
  }
}

export type { ContentType };
export type { RegistryEntry };
export type { ServerEntry } from "@/src/content/server-registry";