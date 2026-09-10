import { Metadata } from "next";
import Link from "next/link";
import { getChildren } from "@/src/content/content-registry";
import { Breadcrumbs } from "@/src/components/content/Breadcrumbs";
import { collectJsonLd } from "@/src/seo/schema";
import { breadcrumbJsonLd, CANONICAL_ORIGIN } from "@/src/seo/breadcrumbs";

export const metadata: Metadata = {
  title: "Build MCP — MCPserver.in",
  description: "Build MCP servers and clients: TypeScript, Python, JSON-RPC, stdio, Streamable HTTP, OAuth, and publishing. Evidence-backed development guides.",
  alternates: { canonical: CANONICAL_ORIGIN + "/build" },
};

function BuildHub() {
  const buildEntries = getChildren("build");

  const schemas = collectJsonLd([
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Build MCP",
      description: "Build MCP servers and clients with evidence-backed guides for TypeScript, Python, transports, authentication, and publishing.",
      url: CANONICAL_ORIGIN + "/build",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: buildEntries.map((e, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: e.title,
          url: CANONICAL_ORIGIN + e.indexPath,
        })),
      },
    },
    breadcrumbJsonLd([{ name: "MCPserver.in", path: "/" }, { name: "Build", path: "/build" }]),
  ]);

  return (
    <>
      {schemas.filter(Boolean).map((schema, i) => (
        <script key={`jsonld-${i}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <Breadcrumbs crumbs={[{ label: "Build", href: "/build" }]} />
      <h1 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100">Build MCP</h1>
      <p className="mb-8 text-slate-600 dark:text-slate-400 max-w-2xl">
        Development guides for creating MCP servers and clients. Covers TypeScript, Python, JSON-RPC, transports, authentication, and publishing.
      </p>
      <section aria-labelledby="build-heading" className="space-y-10">
        <h2 id="build-heading" className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Development Guides
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {buildEntries.map((entry) => (
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

export default BuildHub;