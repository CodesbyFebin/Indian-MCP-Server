import { Metadata } from "next";
import { getIndexableServers, getAllCategories } from "@/src/content/route-helpers";
import { collectionPageJsonLd, breadcrumbListJsonLd } from "@/src/seo/schema";
import { Breadcrumbs } from "@/src/components/content/Breadcrumbs";
import { DirectAnswer } from "@/src/components/content/DirectAnswer";
import { ContentFreshness } from "@/src/components/content/ContentFreshness";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Categories — MCPserver.in",
  description: "Browse MCP servers by category. Only verified, evidence-backed servers are listed.",
};

interface CategoryGroup {
  name: string;
  count: number;
  servers: Awaited<ReturnType<typeof getIndexableServers>>[0][];
}

export default function CategoriesPage() {
  const servers = getIndexableServers();
  const allCategories = getAllCategories();

  // Group servers by category
  const categoryGroups: CategoryGroup[] = allCategories
    .map((category) => ({
      name: category,
      servers: servers.filter((s) => s.categories?.includes(category) ?? false),
      count: 0,
    }))
    .filter((g) => g.servers.length > 0)
    .map((g) => ({ ...g, count: g.servers.length }))
    .sort((a, b) => b.count - a.count);

  const totalServers = servers.length;
  const totalCategories = categoryGroups.length;

  // JSON-LD schemas
  const schemas = [
    collectionPageJsonLd({
      name: "Categories",
      description: `Browse ${totalServers} verified MCP servers across ${totalCategories} categories.`,
      url: "https://www.mcpserver.in/categories",
      itemCount: totalCategories,
    }),
    breadcrumbListJsonLd([
      { name: "Home", item: "https://www.mcpserver.in/" },
      { name: "Servers", item: "https://www.mcpserver.in/servers" },
      { name: "Categories", item: "https://www.mcpserver.in/categories" },
    ]),
  ];

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Servers", href: "/servers" },
    { label: "Categories", href: "/categories" },
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
          Categories
        </h1>

        <DirectAnswer
          text={
            `MCPserver.in organizes ${totalServers} verified ${totalServers === 1 ? "server" : "servers"} across ${totalCategories} ${totalCategories === 1 ? "category" : "categories"}. Only servers that pass the publication authority (verified implementation with evidence) appear here.`
          }
        />

        {categoryGroups.length === 0 ? (
          <div className="mt-8 text-center text-slate-500 dark:text-slate-400">
            <p className="text-lg">No categories available yet.</p>
            <p className="mt-2">Categories appear when servers with verified categories are published.</p>
          </div>
        ) : (
          <ul className="mt-8 space-y-4" role="list">
            {categoryGroups.map((group) => (
              <li key={group.name}>
                <Link
                  href={`/servers?category=${encodeURIComponent(group.name)}`}
                  className="block rounded border border-slate-200 dark:border-slate-800 p-5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {group.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {group.count} {group.count === 1 ? "server" : "servers"}
                      </p>
                    </div>
                    <span className="text-slate-400 dark:text-slate-500" aria-hidden="true">
                      →
                    </span>
                  </div>
                  {group.servers.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {group.servers.slice(0, 5).map((server) => (
                        <li key={server.slug}>
                          <Link
                            href={server.indexPath}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {server.name}
                          </Link>
                        </li>
                      ))}
                      {group.servers.length > 5 && (
                        <li className="text-sm text-slate-500 dark:text-slate-400">
                          +{group.servers.length - 5} more
                        </li>
                      )}
                    </ul>
                  )}
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