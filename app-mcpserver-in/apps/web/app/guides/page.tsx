import { Metadata } from "next";
import Link from "next/link";
import { getChildren } from "@/src/content/content-registry";
import { Breadcrumbs } from "@/src/components/content/Breadcrumbs";
import { collectJsonLd } from "@/src/seo/schema";
import { breadcrumbJsonLd, CANONICAL_ORIGIN } from "@/src/seo/breadcrumbs";

export const metadata: Metadata = {
  title: "MCP Guides — MCPserver.in",
  description: "Practical MCP guides: choosing servers, troubleshooting, databases, browsers, productivity, DevOps, enterprise, and client-specific setup. Evidence-backed.",
  alternates: { canonical: CANONICAL_ORIGIN + "/guides" },
};

function GuidesHub() {
  const guideEntries = getChildren("guides");

  const schemas = collectJsonLd([
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "MCP Guides",
      description: "Practical MCP guides for choosing servers, troubleshooting, databases, browsers, productivity, DevOps, and enterprise use cases.",
      url: CANONICAL_ORIGIN + "/guides",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: guideEntries.map((e, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: e.title,
          url: CANONICAL_ORIGIN + e.indexPath,
        })),
      },
    },
    breadcrumbJsonLd([{ name: "MCPserver.in", path: "/" }, { name: "Guides", path: "/guides" }]),
  ]);

  return (
    <>
      {schemas.filter(Boolean).map((schema, i) => (
        <script key={`jsonld-${i}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <Breadcrumbs crumbs={[{ label: "Guides", href: "/guides" }]} />
      <h1 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100">MCP Guides</h1>
      <p className="mb-8 text-slate-600 dark:text-slate-400 max-w-2xl">
        Practical guides for using MCP in real scenarios: choosing servers, troubleshooting, databases, browser automation, productivity, DevOps, and enterprise deployment.
      </p>
      <section aria-labelledby="guides-heading" className="space-y-10">
        <h2 id="guides-heading" className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Practical Guides
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guideEntries.map((entry) => (
            <article key={entry.indexPath} className="rounded-lg border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                <Link href={entry.indexPath} className="hover:underline">{entry.title}</Link>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-3">
                {entry.metaDescription}
              </p>
              <Link href={entry.indexPath} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Read →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default GuidesHub;