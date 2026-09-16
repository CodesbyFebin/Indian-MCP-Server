import { MetadataRoute } from "next";
import { getIndexableEntries } from "@/src/content/content-registry";
import { getIndexableServers } from "@/src/content/server-registry";
import { CANONICAL_ORIGIN } from "@/src/seo/breadcrumbs";

/**
 * Sitemap generation combining editorial content and server entities.
 * 
 * Only includes:
 * - Editorial: entries with status="published" AND noindex !== true
 * - Servers: entries that pass isServerIndexable() (verified + evidence)
 * 
 * Excludes: draft, noindex, quarantine, unverified, retired
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = CANONICAL_ORIGIN;
  const now = new Date();

  // Editorial cohort
  const editorialEntries = getIndexableEntries();
  const editorialUrls: MetadataRoute.Sitemap = editorialEntries.map((entry) => ({
    url: `${baseUrl}${entry.indexPath}`,
    lastModified: entry.reviewedAt ? new Date(entry.reviewedAt) : now,
    changeFrequency: "weekly" as const,
    priority: entry.type === "category" || entry.type === "capability" ? 0.8 : 0.7,
  }));

  // Server cohort
  const serverEntries = getIndexableServers();
  const serverUrls: MetadataRoute.Sitemap = serverEntries.map((entry) => ({
    url: `${baseUrl}${entry.indexPath}`,
    lastModified: entry.updatedAt ? new Date(entry.updatedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Static core pages
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/servers`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/capabilities`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/evidence`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/methodology`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/editorial-policy`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  // Combine all, deduplicate by URL
  const allUrls = [...staticUrls, ...editorialUrls, ...serverUrls];
  const uniqueUrls = new Map<string, MetadataRoute.Sitemap[0]>();
  
  for (const url of allUrls) {
    if (!uniqueUrls.has(url.url)) {
      uniqueUrls.set(url.url, url);
    }
  }

  return Array.from(uniqueUrls.values()).sort((a, b) => a.url.localeCompare(b.url));
}