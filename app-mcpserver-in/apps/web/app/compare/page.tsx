import { Metadata } from "next";
import { getIndexableEntries } from "@/src/content/content-registry";
import { collectionPageJsonLd, breadcrumbListJsonLd } from "@/src/seo/schema";
import { Breadcrumbs } from "@/src/components/content/Breadcrumbs";
import { DirectAnswer } from "@/src/components/content/DirectAnswer";
import { ContentFreshness } from "@/src/components/content/ContentFreshness";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MCP Server Comparisons — MCPserver.in",
  description: "Evidence-based MCP server comparisons. Only published when both sides are verified and meaningful differences exist.",
};

export default function ComparePage() {
  const indexableEntries = getIndexableEntries();
  const comparisons = indexableEntries.filter((e) => e.type === "comparison");

  const totalComparisons = comparisons.length;

  // JSON-LD schemas
  const schemas = [
    collectionPageJsonLd({
      name: "MCP Server Comparisons",
      description: `Evidence-based MCP server comparisons. ${totalComparisons} ${totalComparisons === 1 ? "comparison" : "comparisons"} published.`,
      url: "https://www.mcpserver.in/compare",
      itemCount: totalComparisons,
    }),
    breadcrumbListJsonLd([
      { name: "Home", item: "https://www.mcpserver.in/" },
      { name: "Guides", item: "https://www.mcpserver.in/guides" },
      { name: "Comparisons", item: "https://www.mcpserver.in/compare" },
    ]),
  ];

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Guides", href: "/guides" },
    { label: "Comparisons", href: "/compare" },
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
          MCP Server Comparisons
        </h1>

        <DirectAnswer
          text={
            totalComparisons > 0
              ? `MCPserver.in publishes ${totalComparisons} evidence-based server comparison${totalComparisons === 1 ? "" : "s"}. Each comparison requires both sides to be verified, real decision intent to exist, and meaningful capability differences to document.`
              : "No evidence-based MCP server comparisons are published yet. Comparisons require two or more verified servers with documented capability differences and real search intent."
          }
        />

        {totalComparisons === 0 ? (
          <div className="mt-8 text-center text-slate-500 dark:text-slate-400">
            <p className="text-lg">No comparisons published.</p>
            <p className="mt-2">
              A comparison is published only when both sides pass the publication authority
              (verified implementation with evidence), a real reader decision exists, and
              non-trivial differences are documented.
            </p>
            <p className="mt-4">
              <Link href="/guides/best-mcp-servers" className="text-blue-600 dark:text-blue-400 hover:underline">
                View selection criteria →
              </Link>
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-4" role="list">
            {comparisons.map((entry) => (
              <li key={entry.indexPath}>
                <Link
                  href={entry.indexPath}
                  className="block rounded border border-slate-200 dark:border-slate-800 p-5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {entry.h1}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {entry.metaDescription}
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