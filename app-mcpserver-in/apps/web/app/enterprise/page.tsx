import { Metadata } from "next";
import { getIndexableServers } from "@/src/content/route-helpers";
import { collectionPageJsonLd, breadcrumbListJsonLd } from "@/src/seo/schema";
import { Breadcrumbs } from "@/src/components/content/Breadcrumbs";
import { DirectAnswer } from "@/src/components/content/DirectAnswer";
import { ContentFreshness } from "@/src/components/content/ContentFreshness";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Enterprise MCP — MCPserver.in",
  description: "Enterprise-grade MCP server deployment, security, and infrastructure guidance for production AI systems.",
};

interface EnterpriseGroup {
  name: string;
  count: number;
  servers: Awaited<ReturnType<typeof getIndexableServers>>[0][];
}

export default function EnterprisePage() {
  const servers = getIndexableServers();
  
  // Group servers by enterprise-relevant capabilities
  const enterpriseCapabilities = [
    "streamable-http",
    "oauth",
    "api-key",
    "observability",
    "load-balancing",
    "rate-limiting",
    "audit-logging"
  ];
  
  const enterpriseGroups: EnterpriseGroup[] = enterpriseCapabilities
    .map((capability) => ({
      name: capability,
      servers: servers.filter((s) => s.capabilities?.includes(capability) ?? false),
      count: 0,
    }))
    .filter((g) => g.servers.length > 0)
    .map((g) => ({ ...g, count: g.servers.length }))
    .sort((a, b) => b.count - a.count);

  const totalServers = servers.length;
  const totalEnterpriseCapabilities = enterpriseGroups.length;

  // JSON-LD schemas
  const schemas = [
    collectionPageJsonLd({
      name: "Enterprise MCP",
      description: `Enterprise-grade MCP server deployment guidance covering ${totalEnterpriseCapabilities} key infrastructure areas for ${totalServers} verified servers.`,
      url: "https://www.mcpserver.in/enterprise",
      itemCount: totalEnterpriseCapabilities,
    }),
    breadcrumbListJsonLd([
      { name: "Home", item: "https://www.mcpserver.in/" },
      { name: "Enterprise", item: "https://www.mcpserver.in/enterprise" },
    ]),
  ];

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Enterprise", href: "/enterprise" },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto max-w-4xl px-4 py-8">
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
          Enterprise MCP Infrastructure
        </h1>

        <DirectAnswer
          text={
            `MCPserver.in provides enterprise deployment guidance for ${totalServers} verified ${totalServers === 1 ? "server" : "servers"} across ${totalEnterpriseCapabilities} ${totalEnterpriseCapabilities === 1 ? "capability" : "capabilities"} critical for production AI systems. Only servers that pass the publication authority (verified implementation with evidence) appear here.`
          }
        />

        {enterpriseGroups.length === 0 ? (
          <div className="mt-8 text-center text-slate-500 dark:text-slate-400">
            <p className="text-lg">No enterprise capabilities documented yet.</p>
            <p className="mt-2">Enterprise deployment patterns appear when servers with verified enterprise capabilities are published.</p>
          </div>
        ) : (
          <section className="mt-8 space-y-6" role="list">
            {enterpriseGroups.map((group) => (
              <article
                key={group.name}
                className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {group.name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-800 text-xs font-medium rounded">{group.count}</span>
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {group.count} {group.count === 1 ? "server" : "servers"} with verified enterprise capability
                    </p>
                  </div>
                  <Link
                    href={`/servers?capability=${encodeURIComponent(group.name)}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View servers →
                  </Link>
                </div>
                
                {group.servers.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {group.servers.slice(0, 6).map((server) => (
                      <li key={server.slug}>
                        <Link
                          href={server.indexPath}
                          className="block text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-slate-600 dark:hover:text-slate-400 truncate max-w-[180px]"
                        >
                          {server.name}
                        </Link>
                      </li>
                    ))}
                    {group.servers.length > 6 && (
                      <li className="text-sm text-slate-500 dark:text-slate-400 italic">
                        +{group.servers.length - 6} more
                      </li>
                    )}
                  </ul>
                )}
              </article>
            ))}
          </section>
        )}

        <ContentFreshness reviewedAt={new Date().toISOString().split("T")[0]} />
      </div>
    </main>
  );
}