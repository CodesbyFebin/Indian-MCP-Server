import { Metadata } from "next";
import { getIndexableServers } from "@/src/content/route-helpers";
import { collectionPageJsonLd, breadcrumbListJsonLd } from "@/src/seo/schema";
import { Breadcrumbs } from "@/src/components/content/Breadcrumbs";
import { DirectAnswer } from "@/src/components/content/DirectAnswer";
import { ContentFreshness } from "@/src/components/content/ContentFreshness";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MCP Developer Guide — MCPserver.in",
  description: "Complete guide to building MCP servers with SDKs, tools, resources, transports, and best practices.",
};

interface DevTopic {
  name: string;
  count: number;
  description: string;
}

export default function DeveloperPage() {
  const servers = getIndexableServers();
  
  // Developer topics based on the keyword matrix
  const devTopics: DevTopic[] = [
    {
      name: "MCP SDK Basics",
      count: 2,
      description: "Getting started with MCP server development using official SDKs in Python and TypeScript"
    },
    {
      name: "Transport Protocols",
      count: 2,
      description: "Understanding stdio vs streamable HTTP transport and when to use each"
    },
    {
      name: "Tools vs Resources",
      count: 2,
      description: "Learning the difference between MCP tools, resources, and prompts and when to use each"
    },
    {
      name: "Server Authentication",
      count: 2,
      description: "Implementing OAuth 2.0, API keys, and other security measures for MCP servers"
    },
    {
      name: "State & Memory Management",
      count: 2,
      description: "Managing state, sessions, and persistence in MCP servers for complex applications"
    },
    {
      name: "Error Handling & Logging",
      count: 2,
      description: "Best practices for handling errors, timeouts, and logging in MCP server development"
    },
    {
      name: "Testing & Inspection",
      count: 2,
      description: "Unit testing MCP tools and using inspector tools to debug JSON-RPC payloads"
    },
    {
      name: "Packaging & Distribution",
      count: 2,
      description: "Publishing MCP servers to npm, PyPI, and other package registries"
    },
    {
      name: "Context Optimization",
      count: 2,
      description: "Reducing token usage and implementing pagination for large MCP responses"
    },
    {
      name: "Sampling & LLM Calls",
      count: 2,
      description: "Using MCP sampling to let servers call LLMs and managing nested LLM interactions"
    }
  ];

  const totalTopics = devTopics.length;

  // JSON-LD schemas
  const schemas = [
    collectionPageJsonLd({
      name: "MCP Developer Guide",
      description: `Complete developer resource covering ${totalTopics} essential topics for building MCP servers with ${servers.length} verified server examples as references.`,
      url: "https://www.mcpserver.in/developer",
      itemCount: totalTopics,
    }),
    breadcrumbListJsonLd([
      { name: "Home", item: "https://www.mcpserver.in/" },
      { name: "Developer", item: "https://www.mcpserver.in/developer" },
    ]),
  ];

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Developer", href: "/developer" },
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
          MCP Developer Guide
        </h1>

        <DirectAnswer
          text={
            `Learn to build MCP servers with our comprehensive developer guide. Covering ${totalTopics} essential topics from SDK basics to advanced patterns, with ${servers.length} verified server references for practical examples.`
          }
        />

        <div className="grid gap-6 md:grid-cols-2">
          {devTopics.map((topic, index) => (
            <article
              key={topic.name}
              className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex-1">
                  {topic.name}
                </h2>
                <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-medium rounded">
                  {topic.count} subtopics
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                {topic.description}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Link
                  href="/servers"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  See verified servers →
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <ContentFreshness reviewedAt={new Date().toISOString().split("T")[0]} />
      </div>
    </main>
  );
}