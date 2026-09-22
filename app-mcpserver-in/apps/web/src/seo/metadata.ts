import type { Metadata } from "next";
import { absoluteUrl } from "@/src/seo/breadcrumbs";
import type { RegistryEntry } from "@/src/content/content-registry";

/**
 * Build Next.js Metadata for a registry entry, honoring the publication
 * authority. Only entries the authority indexes are exposed to crawlers.
 *
 * CRITICAL: a non-indexable entry (draft, review, stale, retired, or with
 * `noindex: true`) MUST be surfaced to crawlers as noindex,follow. We do that
 * here so every route template applies the rule with no per-file drift.
 */
export function entryMetadata(entry: RegistryEntry | undefined): Metadata {
  if (!entry) {
    return {
      title: "MCPserver.in",
      description: "Public authority for MCP server discovery.",
      robots: { index: false, follow: true },
    };
  }

  const indexable = entry.status === "published" && !entry.noindex;
  const robots = indexable
    ? { index: true, follow: true }
    : { index: false, follow: true };

  const canonical = indexable
    ? absoluteUrl(entry.indexPath)
    : absoluteUrl("/");

  return {
    title: entry.metaTitle,
    description: entry.metaDescription,
    robots,
    alternates: { canonical },
    openGraph: {
      title: entry.metaTitle,
      description: entry.metaDescription,
      url: canonical,
      siteName: "MCPserver.in",
      type: "website",
    },
  };
}