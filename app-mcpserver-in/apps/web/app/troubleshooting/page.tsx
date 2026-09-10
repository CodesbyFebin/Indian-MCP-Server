import { Metadata } from "next";
import { getIndexableServers } from "@/src/content/route-helpers";
import { collectionPageJsonLd, breadcrumbListJsonLd } from "@/src/seo/schema";
import { Breadcrumbs } from "@/src/components/content/Breadcrumbs";
import { DirectAnswer } from "@/src/components/content/DirectAnswer";
import { FAQ } from "@/src/components/content/FAQ";
import { ContentFreshness } from "@/src/components/content/ContentFreshness";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MCP Troubleshooting — MCPserver.in",
  description: "Comprehensive troubleshooting guide for common MCP server and client issues with step-by-step solutions.",
};

interface IssueGroup {
  name: string;
  count: number;
  issues: Array<{ question: string; answer: string }>;
}

export default function TroubleshootingPage() {
  const servers = getIndexableServers();
  
  // Common troubleshooting issues based on the keyword matrix
  const troubleshootingIssues: IssueGroup[] = [
    {
      name: "Stdio Timeouts",
      count: 2,
      issues: [
        {
          question: "How to fix MCP stdio connection timeout errors?",
          answer: "Increase the timeout value in your MCP client configuration. For Claude Desktop, add \"timeout\": 30000 to your server config. Ensure your server isn't blocking on long-running operations without sending intermediate responses.",
        },
        {
          question: "MCP server keeps crashing on startup how to fix?",
          answer: "Check server logs for startup errors. Common causes include missing dependencies, port conflicts, or configuration issues. Run the server manually with npm start or python -m server to see detailed error output.",
        }
      ]
    },
    {
      name: "JSON/Parse Errors",
      count: 2,
      issues: [
        {
          question: "How to fix MCP non-JSON lines transport corruption?",
          answer: "Ensure your server only sends valid JSON-RPC messages over the transport. No console.log, debug output, or non-JSON data should be sent over stdio/HTTP transports. Separate logging from protocol messages.",
        },
        {
          question: "MCP server returning invalid JSON payload fix",
          answer: "Validate your JSON responses are properly formatted. Use JSON.stringify() when sending data and ensure no circular references or undefined values are included in responses.",
        }
      ]
    },
    {
      name: "Client Disconnects",
      count: 2,
      issues: [
        {
          question: "How to fix Claude Desktop disconnecting from MCP server?",
          answer: "Check that your server sends initialized notification after capabilities exchange. Ensure you're handling the initialize request properly and sending the initialized notification before accepting tool calls.",
        },
        {
          question: "MCP client unexpectedly closes connection troubleshoot",
          answer: "Verify your server is sending proper JSON-RPC responses (not just notifications) for requests. Every tools/list, resources/list, and initialize request must have a corresponding response.",
        }
      ]
    },
    {
      name: "Permission Denied",
      count: 2,
      issues: [
        {
          question: "How to fix MCP server permission denied local files?",
          answer: "Ensure the server process has filesystem permissions to access the requested files. On macOS/Linux, check file permissions and ensure the server runs with sufficient access. Consider running with explicit directory permissions.",
        },
        {
          question: "MCP tool execution blocked by OS security fix",
          answer: "On macOS, you may need to grant terminal or IDE access to control your computer in System Settings > Privacy & Security. On Windows, check antivirus/firewall settings blocking the server process.",
        }
      ]
    },
    {
      name: "Tool Not Found",
      count: 2,
      issues: [
        {
          question: "How to fix MCP tool not found or not registered error?",
          answer: "Verify the tool name in your client request exactly matches what the server exposes in tools/list. Check for typos, case sensitivity, and ensure the server actually registered the tool during initialization.",
        },
        {
          question: "MCP server tools list empty in client how to fix",
          answer: "Ensure your server is properly calling tools/list in the initialization sequence and returning the correct schema. Check that tools are registered before sending the initialized notification.",
        }
      ]
    },
    {
      name: "High Latency",
      count: 2,
      issues: [
        {
          question: "How to fix high latency in remote MCP server calls?",
          answer: "For Streamable HTTP servers, ensure you're using persistent connections and not reconnecting for each request. Consider deploying closer to your users geographically or using a CDN for the HTTP endpoint.",
        },
        {
          question: "MCP streamable HTTP slow response time optimize",
          answer: "Implement connection pooling, use HTTP/2 if possible, compress responses when beneficial, and ensure your server isn't doing expensive synchronous operations on the request thread.",
        }
      ]
    },
    {
      name: "Context Overflow",
      count: 2,
      issues: [
        {
          question: "How to fix MCP tool response exceeding context window?",
          answer: "Implement pagination or truncation for large responses. For resources, use substring or range reading. For tools, consider returning summaries or asking the client to request specific portions of large datasets.",
        },
        {
          question: "MCP server returning too much data truncate fix",
          answer: "Add parameters to your tools for limit/offset or page size. For file reading tools, support byte ranges. Always consider the LLM's context window when designing tool responses."
        }
      ]
    },
    {
      name: "Docker/Container Issues",
      count: 2,
      issues: [
        {
          question: "How to fix MCP server failing inside Docker container?",
          answer: "Ensure your Dockerfile exposes the correct ports (if using HTTP) and that the container has necessary permissions. For stdio containers, verify stdin/stdout are properly connected. Check container logs for startup errors.",
        },
        {
          question: "MCP stdio transport not working in Docker compose fix",
          answer: "In docker-compose, ensure you're not trying to access stdio from outside the container. For stdio MCP servers in containers, you need to exec into the container or use container-specific communication methods.",
        }
      ]
    },
    {
      name: "Environment Variables",
      count: 2,
      issues: [
        {
          question: "How to pass environment variables to MCP server correctly?",
          answer: "Set environment variables before starting the server process. For npm: DATABASE_URL=value npm start. For Docker: use env_file or environment: in compose. For PM2: use ecosystem.config.js with env section.",
        },
        {
          question: "MCP server cannot read API keys from env fix",
          answer: "Verify the env var name matches exactly what your server code expects. Check that variables are loaded before your server initialization runs. Use console.log(process.env.VAR_NAME) to debug early in startup.",
        }
      ]
    },
    {
      name: "Version Mismatches",
      count: 2,
      issues: [
        {
          question: "How to fix MCP protocol version mismatch client server?",
          answer: "Ensure both client and server are using compatible MCP specification versions. Check your client's MCP version requirement and update your server to match or exceed it. The version is negotiated during initialize.",
        },
        {
          question: "Update MCP server to latest spec version guide",
          answer: "Review the latest MCP specification at modelcontextprotocol.io/specification. Update your server implementation to handle any new required fields or changed behaviors in the initialize sequence and notification handling."
        }
      ]
    }
  ];

  const totalIssues = troubleshootingIssues.reduce((sum, group) => sum + group.count, 0);

  // JSON-LD schemas
  const schemas = [
    collectionPageJsonLd({
      name: "MCP Troubleshooting Guide",
      description: `Comprehensive troubleshooting for ${totalIssues} common MCP server and client issues across ${troubleshootingIssues.length} categories.`,
      url: "https://www.mcpserver.in/troubleshooting",
      itemCount: totalIssues,
    }),
    breadcrumbListJsonLd([
      { name: "Home", item: "https://www.mcpserver.in/" },
      { name: "Troubleshooting", item: "https://www.mcpserver.in/troubleshooting" },
    ]),
    // FAQPage schema for AEO
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: troubleshootingIssues
        .flatMap(group => group.issues)
        .map(issue => ({
          "@type": "Question",
          name: issue.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: issue.answer,
          },
        }))
    }
  ];

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Troubleshooting", href: "/troubleshooting" },
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
          MCP Troubleshooting Guide
        </h1>

        <DirectAnswer
          text={
            `Find solutions to ${totalIssues} common MCP server and client issues. Each troubleshooting guide includes step-by-step fixes, root cause explanations, and prevention tips for ${troubleshootingIssues.length} issue categories.`
          }
        />

        <section className="mt-8 space-y-6">
          {troubleshootingIssues.map((group, groupIndex) => (
            <section key={group.name} className="border-t pt-6 first:border-t-0">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3 mb-4">
                {group.name}
                <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-medium rounded">{group.count} issues</span>
              </h2>
              
              <div className="space-y-3">
                {group.issues.map((issue, issueIndex) => (
                  <div key={`${group.name}-${issueIndex}`} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">{issue.question}</h3>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{issue.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </section>

        <ContentFreshness reviewedAt={new Date().toISOString().split("T")[0]} />
      </div>
    </main>
  );
}