import { Metadata } from "next";
import Link from "next/link";
import { getChildren, getIndexableEntries, RegistryEntry } from "@/src/content/content-registry";
import { Breadcrumbs } from "@/src/components/content/Breadcrumbs";
import { articleJsonLd, collectJsonLd } from "@/src/seo/schema";
import { breadcrumbJsonLd, CANONICAL_ORIGIN } from "@/src/seo/breadcrumbs";

export const metadata: Metadata = {
  title: "Learn — MCPserver.in",
  description: "MCP fundamentals, protocol architecture, tools, resources, and implementation guides. Evidence-backed technical authority.",
  alternates: { canonical: CANONICAL_ORIGIN + "/learn" },
};

function LearnHub() {
  const allEntries = getIndexableEntries();
  const learnEntries = getChildren("learn");

  const schemas = collectJsonLd([
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Learn",
      description: "MCP fundamentals, protocol architecture, tools, resources, and implementation guides.",
      url: CANONICAL_ORIGIN + "/learn",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: learnEntries.map((e, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: e.title,
          url: CANONICAL_ORIGIN + e.indexPath,
        })),
      },
    },
    breadcrumbJsonLd([{ name: "MCPserver.in", path: "/" }, { name: "Learn", path: "/learn" }]),
  ]);

  return (
    <>
      {schemas.filter(Boolean).map((schema, i) => (
        <script key={`jsonld-${i}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <Breadcrumbs crumbs={[{ label: "Learn", href: "/learn" }]} />
      <h1 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100">Learn MCP</h1>
      <p className="mb-8 text-slate-600 dark:text-slate-400 max-w-2xl">
        Evidence-backed fundamentals, protocol architecture, tools, resources, and implementation guides for the Model Context Protocol.
      </p>
      <section aria-labelledby="pillars-heading" className="space-y-10">
        <h2 id="pillars-heading" className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          MCP Fundamentals
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {learnEntries.map((entry) => (
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

export default LearnHub;