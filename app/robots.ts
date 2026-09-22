import { MetadataRoute } from "next";
import { CANONICAL_ORIGIN } from "@/seo/breadcrumbs";

/**
 * robots.txt rules for AI crawlers.
 *
 * Separates training crawlers (opt-out by default) from search/answer
 * crawlers (opt-in) — the standard practice for sites that want to appear
 * in AI-powered search and citation surfaces without feeding model training
 * corpora. Adjust the opt-out list if that stance changes.
 *
 * robots.txt is a voluntary directive, not an access control: a scraper can
 * ignore it or spoof its user-agent. It is not this site's enforcement
 * boundary — see the note at the bottom of the generated file.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      // Training crawlers: opt-out.
      { userAgent: "Google-Extended", disallow: "/" },
      { userAgent: "GPTBot", disallow: "/" },
      { userAgent: "CCBot", disallow: "/" },
      { userAgent: "Bytespider", disallow: "/" },
      // Search / answer crawlers: opt-in.
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "Claude-SearchBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
    ],
    sitemap: `${CANONICAL_ORIGIN}/sitemap.xml`,
  };
}
