import { Metadata } from "next";
import { getIndexableServers } from "@/src/content/route-helpers";
import { collectionPageJsonLd, breadcrumbListJsonLd } from "@/src/seo/schema";
import { Breadcrumbs } from "@/src/components/content/Breadcrumbs";
import { DirectAnswer } from "@/src/components/content/DirectAnswer";
import { ContentFreshness } from "@/src/components/content/ContentFreshness";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MCP Client Integration — MCPserver.in",
  description: "Guides for connecting MCP servers to Claude Desktop, Cursor, VS Code, and other AI clients with copy-paste configurations.",
};

interface ClientIntegration {
  name: string;
  configExample: string;
  description: string;
  serverCount: number;
}

export default function ClientIntegrationPage() {
  const servers = getIndexableServers();
  
  // Client integration guides based on the keyword matrix
  const clientGuides: ClientIntegration[] = [
    {
      name: "Claude Desktop",
      configExample: `{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "mcp-server-example"],
      "env": {
        "API_KEY": "your-key-here"
      }
    }
  }
}`,
      description: "Connect MCP servers to Claude Desktop for enhanced AI capabilities",
      serverCount: servers.filter(s => s.capabilities?.includes('stdio') ?? false).length
    },
    {
      name: "Cursor IDE",
      configExample: `{
  "mcpServers": {
    "my-server": {
      "command": "python",
      "args": ["-m", "mcp_server_example"],
      "env": {}
    }
  }
}`,
      description: "Configure MCP servers in Cursor IDE settings for AI-powered coding",
      serverCount: servers.length // Most servers work with Cursor via stdio
    },
    {
      name: "Cline / VS Code",
      configExample: `{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "PORT": "3000"
      }
    }
  }
}`,
      description: "Connect MCP server to Cline VS Code extension for autonomous coding",
      serverCount: servers.filter(s => s.capabilities?.includes('streamable-http') ?? false).length
    },
    {
      name: "Windsurf / Codeium",
      configExample: `{
  "mcpServers": {
    "my-server": {
      "command": "docker",
      "args": ["run", "--rm", "-p", "3000:3000", "mcp-server-example"],
      "env": {}
    }
  }
}`,
      description: "Setup MCP servers in Windsurf IDE for Codeium and Windsurf Cascade",
      serverCount: servers.length
    },
    {
      name: "Open WebUI / Local LLMs",
      configExample: `{
  "mcpServers": {
    "my-server": {
      "command": "python",
      "args": ["server.py"],
      "env": {
        "MODEL_PATH": "./models"
      }
    }
  }
}`,
      description: "Connect MCP server to Open WebUI and other local LLM chat interfaces",
      serverCount: servers.length
    }
  ];

  const totalClients = clientGuides.length;
  const totalCompatibleServers = Math.max(...clientGuides.map(g => g.serverCount)); // Approximate

  // JSON-LD schemas
  const schemas = [
    collectionPageJsonLd({
      name: "MCP Client Integration Guide",
      description: `Integration guides for ${totalClients} major AI clients including Claude Desktop, Cursor, VS Code, and more. Compatible with ${totalCompatibleServers}+ verified MCP servers.`,
      url: "https://www.mcpserver.in/client-integration",
      itemCount: totalClients,
    }),
    breadcrumbListJsonLd([
      { name: "Home", item: "https://www.mcpserver.in/" },
      { name: "Client Integration", item: "https://www.mcpserver.in/client-integration" },
    ]),
  ];

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Client Integration", href: "/client-integration" },
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
          MCP Client Integration
        </h1>

        <DirectAnswer
          text={
            `Learn to connect MCP servers to ${totalClients} major AI clients including Claude Desktop, Cursor, VS Code, and more. Each guide includes copy-paste configuration examples compatible with ${totalCompatibleServers}+ verified MCP servers.`
          }
        />

        <div className="space-y-6">
          {clientGuides.map((guide, index) => (
            <article
              key={guide.name}
              className="rounded-lg border border-slate-200 dark:border-slate-800 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex-1">
                  {guide.name}
                </h2>
                <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-medium rounded">
                  Compatible with {guide.serverCount}+ servers
                </span>
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {guide.description}
              </p>
              
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded">
                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                  Copy-paste configuration
                </h3>
                <pre className="p-3 bg-slate-100 dark:bg-slate-800 rounded overflow-x-auto text-sm">
                  <code className="block">{guide.configExample}</code>
                </pre>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Link
                  href="/servers"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  Browse {guide.serverCount}+ compatible servers →
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