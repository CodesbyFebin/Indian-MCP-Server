import { Metadata } from "next";
import Link from "next/link";
import { getChildren, getIndexableEntries } from "@/src/content/content-registry";
import { Breadcrumbs } from "@/src/components/content/Breadcrumbs";
import { collectJsonLd } from "@/src/seo/schema";
import { breadcrumbJsonLd, CANONICAL_ORIGIN } from "@/src/seo/breadcrumbs";

export const metadata: Metadata = {
  title: "MCP Clients — MCPserver.in",
  description: "MCP client libraries and applications: Claude Desktop, Cursor, VS Code, Codex, and more. Setup, configuration, and verified compatible servers.",
  alternates: { canonical: CANONICAL_ORIGIN + "/clients" },
};

function ClientsHub() {
  const clientEntries = getChildren("clients");

  const schemas = collectJsonLd([
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "MCP Clients",
      description: "MCP client libraries and applications with setup guides and verified compatible servers.",
      url: CANONICAL_ORIGIN + "/clients",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: clientEntries.map((e, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: e.title,
          url: CANONICAL_ORIGIN + e.indexPath,
        })),
      },
    },
    breadcrumbJsonLd([{ name: "MCPserver.in", path: "/" }, { name: "Clients", path: "/clients" }]),
  ]);

  return (
    <>
      {schemas.filter(Boolean).map((schema, i) => (
        <script key={`jsonld-${i}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <Breadcrumbs crumbs={[{ label: "Clients", href: "/clients" }]} />
      <h1 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100">MCP Clients</h1>
      <p className="mb-8 text-slate-600 dark:text-slate-400 max-w-2xl">
        Client libraries and applications that speak the Model Context Protocol. Each guide covers setup, configuration, authentication, and evidence-backed compatible servers.
      </p>
      <section aria-labelledby="clients-heading" className="space-y-10">
        <h2 id="clients-heading" className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Available Clients
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clientEntries.map((entry) => (
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

export default ClientsHub;