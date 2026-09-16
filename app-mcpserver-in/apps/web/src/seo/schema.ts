import { RegistryEntry, ContentFaq } from "@/src/content/content-registry";
import { absoluteUrl, CANONICAL_ORIGIN } from "@/src/seo/breadcrumbs";

/**
 * JSON-LD schema builders for the public authority site.
 *
 * CONSTRAINTS honored here:
 *  - No AggregateRating, Review, Offer, PriceSpecification, or Certification
 *    schema is emitted unless real data exists — we never emit them.
 *  - Every @id / url resolves to the canonical origin.
 *  - FAQPage is emitted only when there are real FAQ entries.
 */

export interface SeoEntry {
  slug: string;
  title: string;
  description: string;
  h1?: string;
  sections?: { heading: string; markdown: string }[];
  faq?: ContentFaq[];
  schemaType: RegistryEntry["schemaType"];
  searchable?: boolean;
  noindex?: boolean;
  indexableUrl?: string;
  reviewedAt?: string;
}

/** Base SoftwareApplication / WebSite entity for the platform. */
export function siteSoftwareJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MCPserver.in",
    url: CANONICAL_ORIGIN,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description:
      "Public authority for MCP server discovery with evidence-backed verification.",
    publisher: {
      "@type": "Organization",
      name: "MCPserver.in",
      url: CANONICAL_ORIGIN,
    },
  };
}

/** Article / Collection schema for one editorial entity. */
export function articleJsonLd(entry: SeoEntry): Record<string, unknown> {
  const url = absoluteUrl(entry.indexableUrl ?? `/${entry.slug}`);
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.h1 ?? entry.title,
    name: entry.title,
    description: entry.description,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    publisher: {
      "@type": "Organization",
      name: "MCPserver.in",
      url: CANONICAL_ORIGIN,
    },
    inLanguage: "en",
    datePublished: entry.reviewedAt || undefined,
    dateModified: entry.reviewedAt || undefined,
    author: {
      "@type": "Organization",
      name: "MCPserver.in Editorial",
      url: CANONICAL_ORIGIN,
    },
  };
  if (entry.faq && entry.faq.length > 0) {
    base.mainEntity = {
      "@type": "FAQPage",
      mainEntity: entry.faq.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer,
        },
      })),
    };
  }
  return base;
}

/** Collect all JSON-LD blocks for a page in a single script tag-ready array. */
export function collectJsonLd(
  schemas: (Record<string, unknown> | null)[],
): Record<string, unknown>[] {
  return schemas.filter(Boolean) as Record<string, unknown>[];
}

/** SoftwareApplication JSON-LD for a server entity. */
export function softwareApplicationJsonLd(params: {
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  version?: string;
  author: {
    "@type": "Organization";
    name: string;
    url: string;
  };
  offers?: null;
  aggregateRating?: null;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: params.name,
    description: params.description,
    url: params.url,
    applicationCategory: params.applicationCategory,
    operatingSystem: params.operatingSystem,
    version: params.version,
    author: params.author,
    // Never emit offers/aggregateRating without verified data
    offers: params.offers,
    aggregateRating: params.aggregateRating,
  };
}

/** BreadcrumbList JSON-LD. */
export function breadcrumbListJsonLd(
  items: { name: string; item: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

/** CollectionPage JSON-LD for category/capability listing pages. */
export function collectionPageJsonLd(params: {
  name: string;
  description: string;
  url: string;
  itemCount: number;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: params.name,
    description: params.description,
    url: params.url,
    about: {
      "@type": "ItemList",
      numberOfItems: params.itemCount,
    },
  };
}