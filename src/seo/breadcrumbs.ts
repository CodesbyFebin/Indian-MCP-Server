/**
 * SEO breadcrumb helpers.
 *
 * CRITICAL CONSTRAINT: every canonical signal on the public site must agree on
 * the canonical origin. The public authority origin is fixed here so route
 * templates, BreadcrumbList JSON-LD, and canonical links all resolve to the
 * same https://www.mcpserver.in host.
 */

export const CANONICAL_ORIGIN = "https://www.mcpserver.in";

export interface Crumb {
  name: string;
  path: string; // absolute path, e.g. "/learn/model-context-protocol"
}

export function absoluteUrl(path: string): string {
  return `${CANONICAL_ORIGIN}${path.startsWith("/") ? path : "/" + path}`;
}

/**
 * Build the JSON-LD BreadcrumbList for a given trail. The first crumb should
 * be the home page. Objects follow schema.org BreadcrumbList and every URL is
 * the canonical origin.
 */
export function breadcrumbJsonLd(trail: Crumb[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

/** Default trail for the home page. */
export function homeCrumb(): Crumb[] {
  return [{ name: "MCPserver.in", path: "/" }];
}