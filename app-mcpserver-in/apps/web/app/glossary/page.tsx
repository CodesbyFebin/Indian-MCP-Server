import { Metadata } from "next";
import { getChildren, getIndexableEntries } from "@/src/content/content-registry";
import { collectionPageJsonLd, breadcrumbListJsonLd } from "@/src/seo/schema";
import { Breadcrumbs } from "@/src/components/content/Breadcrumbs";
import { DirectAnswer } from "@/src/components/content/DirectAnswer";
import { ContentFreshness } from "@/src/components/content/ContentFreshness";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MCP Glossary — MCPserver.in",
  description: "Core MCP terms and concepts with evidence-backed definitions.",
};

export default function GlossaryPage() {
  const indexableEntries = getIndexableEntries();
  const glossaryTerms = getChildren("glossary");

  const totalTerms = glossaryTerms.length;

  // JSON-LD schemas
  const schemas = [
    collectionPageJsonLd({
      name: "MCP Glossary",
      description: `Core MCP terms and concepts. ${totalTerms} defined terms with evidence-backed definitions.`,
      url: "https://www.mcpserver.in/glossary",
      itemCount: totalTerms,
    }),
    breadcrumbListJsonLd([
      { name: "Home", item: "https://www.mcpserver.in/" },
      { name: "Glossary", item: "https://www.mcpserver.in/glossary" },
    ]),
  ];

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Glossary", href: "/glossary" },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Breadcrumbs crumbs={crumbs} />

        {schemas
          .filter(Boolean)
          .map((schema, i) => {
            const script = JSON.stringify(schema);
            return (
              <script
                key={`jsonld-${i}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: script }}
              />
            );
          })}

        <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
          MCP Glossary
        </h1>

        <DirectAnswer
          text={
            totalTerms > 0
              ? `The MCP Glossary defines ${totalTerms} core terms and concepts. Each definition is evidence-backed and includes the protocol-level mechanics you need to understand MCP servers, clients, and the JSON-RPC layer.`
              : "No glossary terms published yet."
          }
        />

        {totalTerms === 0 ? (
          <div className="mt-8 text-center text-slate-500 dark:text-slate-400">
            <p className="text-lg">No glossary terms published.</p>
            <p className="mt-2">Terms will appear here when added to the editorial registry.</p>
          </div>
        ) : (
          <ul className="mt-8 space-y-3" role="list">
            {glossaryTerms.map((term) => (
              <li key={term.indexPath}>
                <Link
                  href={term.indexPath}
                  className="block rounded border border-slate-200 dark:border-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                    {term.h1}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {term.metaDescription}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <ContentFreshness reviewedAt={new Date().toISOString().split("T")[0]} />
      </div>
    </main>
  );
}