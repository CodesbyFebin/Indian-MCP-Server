import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/src/components/content/Breadcrumbs";
import { DirectAnswer } from "@/src/components/content/DirectAnswer";
import { getIndexableServers, collectionFor, ServerEntry } from "@/src/content/route-helpers";

export const metadata: Metadata = {
  title: "MCPserver.in — Server Directory",
  description: "AI-indexed directory of MCP servers with evidence verification",
};

function ServerCard({ server }: { server: ServerEntry }) {
  const decision = server.isVerified ? "Verified" : "Not Verified";
  const decisionClass = server.isVerified
    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
    : "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";

  return (
    <article className="rounded-lg border border-slate-200 dark:border-slate-800 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          <Link href={server.indexPath} className="hover:underline">
            {server.name}
          </Link>
        </h3>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${decisionClass}`}>
          {decision}
        </span>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
        {server.description}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {server.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-400"
          >
            {tag}
          </span>
        ))}
        {server.tags.length > 4 && (
          <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-500 dark:text-slate-500">
            +{server.tags.length - 4} more
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span>v{server.version}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={server.updatedAt}>
          {new Date(server.updatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </time>
      </div>
    </article>
  );
}

export default function ServersPage() {
  const indexableServers = getIndexableServers();
  const collection = collectionFor("servers");

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Servers", href: "/servers" },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* Breadcrumbs + JSON-LD */}
        <Breadcrumbs crumbs={crumbs} />

        {/* JSON-LD: CollectionPage + ItemList + BreadcrumbList */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "CollectionPage",
                  "@id": "https://www.mcpserver.in/servers#collection",
                  url: "https://www.mcpserver.in/servers",
                  name: "MCP Server Directory",
                  description:
                    "AI-indexed directory of MCP servers with evidence verification",
                  mainEntity: {
                    "@type": "ItemList",
                    itemListElement: indexableServers.map((server, i) => ({
                      "@type": "ListItem",
                      position: i + 1,
                      item: {
                        "@type": "SoftwareApplication",
                        "@id": `https://www.mcpserver.in${server.indexPath}#server`,
                        url: `https://www.mcpserver.in${server.indexPath}`,
                        name: server.name,
                        description: server.description,
                        applicationCategory: "DeveloperApplication",
                        operatingSystem: "cross-platform",
                        isAccessibleForFree: true,
                      },
                    })),
                  },
                },
                {
                  "@type": "BreadcrumbList",
                  itemListElement: [
                    {
                      "@type": "ListItem",
                      position: 1,
                      name: "Home",
                      item: "https://www.mcpserver.in/",
                    },
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: "Servers",
                      item: "https://www.mcpserver.in/servers",
                    },
                  ],
                },
              ],
            }),
          }}
        />

        {/* H1 */}
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          {collection?.h1 ?? "Server Directory"}
        </h1>

        {/* Direct Answer */}
        <DirectAnswer
          text={
            indexableServers.length > 0
              ? `The MCPserver.in directory lists ${indexableServers.length} verified MCP server${indexableServers.length !== 1 ? "s" : ""} that satisfy the publication authority: published, evidence-backed, and verified. Each server entry documents its capabilities, transport, authentication, and read/write behavior with source provenance.`
              : "No servers currently satisfy the publication authority. Entries in the registry that do not meet the isServerIndexable() criteria are tracked internally but not listed publicly."
          }
        />

        {/* Methodology link */}
        <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
          <Link
            href="/methodology"
            className="text-blue-600 dark:text-blue-400 hover:underline underline-offset-2"
          >
            How servers qualify for this directory →
          </Link>
        </p>

        {/* Server Grid */}
        {indexableServers.length > 0 ? (
          <section aria-labelledby="servers-heading" className="mb-12">
            <h2
              id="servers-heading"
              className="sr-only"
            >
              Verified MCP Servers
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {indexableServers.map((server) => (
                <ServerCard key={server.indexPath} server={server} />
              ))}
            </div>
          </section>
        ) : (
          <section aria-labelledby="empty-heading" className="mb-12">
            <h2 id="empty-heading" className="sr-only">
              No verified servers
            </h2>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-8 text-center">
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                No MCP servers currently satisfy the publication authority.
                Servers must be published, have verified evidence, and pass the
                <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">isServerIndexable()</code>
                criteria to appear here.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tracked servers that do not meet the criteria are documented
                individually (e.g.,{" "}
                <Link
                  href="/servers/mcp-server-postgres"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  mcp-server-postgres
                </Link>
                ) but are not listed in the public directory.
              </p>
            </div>
          </section>
        )}

        {/* Trust routes */}
        <nav aria-label="Trust and methodology" className="border-t border-slate-200 dark:border-slate-800 pt-6">
          <ul className="flex flex-wrap gap-6 text-sm">
            <li>
              <Link
                href="/evidence"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Evidence Ledger
              </Link>
            </li>
            <li>
              <Link
                href="/methodology"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Publication Methodology
              </Link>
            </li>
            <li>
              <Link
                href="/editorial-policy"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Editorial Policy
              </Link>
            </li>
            <li>
              <Link
                href="/security"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Security Model
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </main>
  );
}