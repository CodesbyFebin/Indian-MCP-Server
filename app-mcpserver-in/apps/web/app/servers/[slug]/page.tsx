import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getIndexableServers, getServerEntry, getServerVerificationDecision, isServerIndexableEntry } from "@/src/content/server-registry";
import { softwareApplicationJsonLd, breadcrumbListJsonLd } from "@/src/seo/schema";
import { Breadcrumbs } from "@/src/components/content/Breadcrumbs";
import { EvidencePanel, EvidenceItem } from "@/src/components/content/EvidencePanel";
import { FAQ } from "@/src/components/content/FAQ";
import { ContentFreshness } from "@/src/components/content/ContentFreshness";
import { RelatedLinks } from "@/src/components/content/RelatedLinks";
import { DirectAnswer } from "@/src/components/content/DirectAnswer";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Build evidence panel items from server entry's evidenceRefs.
 * In a full implementation, these would be resolved from the Evidence Ledger.
 * For now, we construct them from the known evidence IDs.
 */
function buildEvidenceItems(entry: Awaited<ReturnType<typeof getServerEntry>>): EvidenceItem[] {
  if (!entry) return [];

  const evidenceMap: Record<string, EvidenceItem> = {
    "ev-mcp-servers-github-2026-08-22": {
      source: "MCP Servers GitHub Repository",
      url: "https://github.com/modelcontextprotocol/servers",
      type: "repository",
      status: "verified",
      reviewedAt: "2026-08-22",
      finding: "src/ directory lists: everything, fetch, filesystem, git, memory, sequentialthinking, time. No postgres server directory exists.",
      limitations: "Repository listing is accurate at time of check; new servers may be added without notice.",
    },
    "ev-npm-mcp-server-postgres-2026-08-22": {
      source: "npm — mcp-server-postgres",
      url: "https://registry.npmjs.org/mcp-server-postgres",
      type: "package-registry",
      status: "verified",
      reviewedAt: "2026-08-22",
      finding: "Version 0.0.1-security. Description: 'security holding package'. No tools, configuration, or implementation documented.",
      limitations: "This is a standard npm security-holder release for a reclaimed or abandoned package name. Does not represent functional software.",
    },
    "ev-pypi-mcp-server-postgres-2026-08-22": {
      source: "PyPI — mcp-server-postgres",
      url: "https://pypi.org/project/mcp-server-postgres/",
      type: "package-registry",
      status: "verified",
      reviewedAt: "2026-08-22",
      finding: "Version 0.1.0. Summary: 'Add your description here'. No dependencies, no classifiers, no documentation.",
      limitations: "Appears to be an unmaintained initial upload placeholder.",
    },
    "ev-mcp-specification-2026-08-22": {
      source: "Model Context Protocol Specification",
      url: "https://modelcontextprotocol.io/specification",
      type: "official",
      status: "verified",
      reviewedAt: "2026-08-22",
      finding: "MCP specification defines tools/list and tools/call. A database server would expose tools through this interface. The spec does not mandate any particular tool names or database schema.",
      limitations: "Specification describes the protocol shape, not any particular server implementation.",
    },
  };

  return entry.evidenceRefs
    .map((id) => evidenceMap[id])
    .filter((item): item is EvidenceItem => item !== undefined);
}

/**
 * Build FAQ items from server entry.
 * Only includes FAQs backed by evidence.
 */
function buildFaqs(entry: Awaited<ReturnType<typeof getServerEntry>>): { question: string; answer: string }[] {
  if (!entry || entry.slug !== "mcp-server-postgres") return [];

  return [
    {
      question: "Is there an official mcp-server-postgres maintained by the MCP project?",
      answer: "No. The official MCP servers repository (github.com/modelcontextprotocol/servers) does not currently list a Postgres server among its maintained implementations. The repository is open to contributions, so this status may change.",
    },
    {
      question: "What do the npm and PyPI packages named mcp-server-postgres contain?",
      answer: "As of 2026-08-22, both are package-name security holders or initial-upload placeholders with no functional implementation. They should not be installed expecting a working Postgres MCP server.",
    },
    {
      question: "What would a Postgres MCP server need to implement?",
      answer: "Per the MCP specification, it would need to implement the MCP server lifecycle, expose one or more tools through tools/list, handle tools/call requests against a live PostgreSQL connection, and support at least one transport (stdio or HTTP). The specific tool names, argument schemas, and connection mechanism are implementation choices.",
    },
    {
      question: "Is read-only access the right posture for a database MCP server?",
      answer: "Many MCP server implementations and security guidance recommend exposing read-only tool access when the caller is an AI agent. Granting write access means any tool call the agent makes can modify database state. Whether a given server implementation enforces read-only mode is a property of that implementation and should be verified before use.",
    },
    {
      question: "Where can I find verified Postgres-compatible MCP servers?",
      answer: "Check the server directory at MCPserver.in/servers as individual servers complete verification. Community implementations also exist independently; evaluate them against the methodology described in the editorial policy before use.",
    },
    {
      question: "What is the MCPserver.in verification status for mcp-server-postgres?",
      answer: "Not verified. The publication authority requires a non-placeholder implementation with documented capabilities, source provenance, and verification evidence. None of those conditions is currently met for this package name.",
    },
  ];
}

/**
 * Build community patterns for conceptual documentation.
 * These are clearly labeled as patterns, not verified implementations.
 */
function buildCommunityPatterns() {
  return [
    {
      heading: "Transport",
      detail:
        "Community reports describe stdio (local) and Streamable HTTP (remote) as the two transport forms used by database MCP servers. The MCP specification defines both. No verified Postgres-specific implementation has been independently reviewed.",
    },
    {
      heading: "Connection mechanism",
      detail:
        "A database MCP server must establish and manage a database connection. How credentials are supplied (environment variables, connection URI, config file) varies by implementation. No verified Postgres server documents its specific mechanism.",
    },
    {
      heading: "Read-only vs read-write",
      detail:
        "Security guidance across MCP server documentation consistently recommends read-only tool exposure when an AI agent is the caller. Whether any particular Postgres server implements read-only mode is implementation-specific.",
    },
  ];
}

/**
 * Build common configuration parameters table.
 * Clearly labeled as community-documented patterns, not verified.
 */
function buildConfigTable() {
  return [
    {
      parameter: "DATABASE_URL",
      purpose: "Connection string for the Postgres instance",
      evidenceStatus: "Community-documented pattern; not verified against this server",
    },
    {
      parameter: "POSTGRES_HOST",
      purpose: "Database host address",
      evidenceStatus: "Community-documented pattern",
    },
    {
      parameter: "POSTGRES_PORT",
      purpose: "Port (default 5432)",
      evidenceStatus: "Community-documented pattern",
    },
    {
      parameter: "POSTGRES_DB",
      purpose: "Database name",
      evidenceStatus: "Community-documented pattern",
    },
    {
      parameter: "POSTGRES_USER / POSTGRES_PASSWORD",
      purpose: "Credentials for database authentication",
      evidenceStatus: "Community-documented pattern",
    },
    {
      parameter: "READ_ONLY",
      purpose: "When set, restrict exposed tools to read-only queries",
      evidenceStatus: "Community-documented pattern",
    },
  ];
}

export async function generateStaticParams() {
  const servers = getIndexableServers();
  return servers.map((server) => ({ slug: server.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getServerEntry(`/servers/${slug}`);

  if (!entry) {
    return {
      title: "Server not found — MCPserver.in",
    };
  }

  const decision = getServerVerificationDecision(entry);

  return {
    title: `${entry.name} — MCPserver.in`,
    description: entry.description,
    openGraph: {
      title: `${entry.name} — MCPserver.in`,
      description: entry.description,
      type: "website",
    },
    other: {
      "x-verification-status": decision.indexable ? "indexable" : "not-indexable",
      "x-verification-reason": decision.reason,
    },
  };
}

/** Static-only route: no dynamic params beyond what generateStaticParams provides. */
export const dynamicParams = false;

export default async function ServerDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const indexPath = `/servers/${slug}`;
  const entry = getServerEntry(indexPath);

  // Runtime publication guard — authoritative check using isServerIndexable
  if (!entry || !isServerIndexableEntry(entry)) {
    notFound();
  }

  const decision = getServerVerificationDecision(entry);
  const evidenceItems = buildEvidenceItems(entry);
  const faqs = buildFaqs(entry);
  const communityPatterns = buildCommunityPatterns();
  const configTable = buildConfigTable();
  const allServers = getIndexableServers();

  // Build JSON-LD schemas
  const schemas: (Record<string, unknown> | null)[] = [];

  // WebPage + SoftwareApplication
  schemas.push(
    softwareApplicationJsonLd({
      name: entry.name,
      description: entry.description,
      url: `https://www.mcpserver.in${entry.indexPath}`,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "cross-platform",
      version: entry.version ?? undefined,
      author: {
        "@type": "Organization",
        name: entry.creator,
        url: "https://www.mcpserver.in",
      },
      offers: null, // No verified offer/pricing
      aggregateRating: null, // No verified rating
    }),
  );

  // BreadcrumbList
  schemas.push(
    breadcrumbListJsonLd([
      { name: "Home", item: "https://www.mcpserver.in/" },
      { name: "Servers", item: "https://www.mcpserver.in/servers" },
      { name: entry.name, item: `https://www.mcpserver.in${entry.indexPath}` },
    ]),
  );

  // FAQPage if FAQs exist
  if (faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer,
        },
      })),
    });
  }

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Servers", href: "/servers" },
    { label: entry.name, href: entry.indexPath },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        {/* NOT-INDEXED banner if not verified */}
        {!decision.indexable && (
          <div className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
            <strong>Not indexed.</strong> This server does not meet the publication
            authority requirements (verified implementation with evidence).
            Reason: <code>{decision.reason}</code>.
          </div>
        )}

        <Breadcrumbs crumbs={crumbs} />

        {/* JSON-LD schemas */}
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

        {/* H1 + TL;DR DirectAnswer */}
        <h1 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
          {entry.name}
        </h1>

        <DirectAnswer
          text={
            decision.indexable
              ? `${entry.name} is a verified MCP server with documented capabilities and evidence-backed implementation.`
              : `As of ${entry.lastVerifiedAt ?? "the last review date"}, there is no verified, maintained implementation of ${entry.name}. The package name exists as a placeholder (npm security holder / PyPI initial upload) with no functional code.`
          }
        />

        {/* Concept section */}
        <section aria-labelledby="concept-heading" className="my-10">
          <h2 id="concept-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
            Concept
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            A Postgres MCP server is software that sits between an MCP client
            (such as Claude Desktop, Cursor, or another MCP host) and a running
            PostgreSQL instance. It translates MCP tool-call requests into
            database operations and returns results in the MCP response format.
            The server implements the MCP server lifecycle defined by the{" "}
            <a
              href="https://modelcontextprotocol.io/specification"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Model Context Protocol specification
            </a>
            .
          </p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            The protocol layer is well-defined. What varies across implementations
            is which tools are exposed, what arguments those tools accept, how
            the database connection is established, and what access controls are
            enforced. Because no verified implementation exists under this package
            name, those specifics cannot be stated here.
          </p>
        </section>

        {/* Evidence Panel */}
        {evidenceItems.length > 0 && (
          <EvidencePanel items={evidenceItems} />
        )}

        {/* Community-documented patterns */}
        <section aria-labelledby="patterns-heading" className="my-10">
          <h2
            id="patterns-heading"
            className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3"
          >
            Community-documented patterns
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            The following are patterns described in community discourse and the
            MCP specification. They are not verified against a specific
            implementation named mcp-server-postgres.
          </p>
          <div className="space-y-4">
            {communityPatterns.map((p, i) => (
              <div key={i} className="border-l-2 border-slate-300 dark:border-slate-700 pl-4">
                <h3 className="font-medium text-slate-900 dark:text-slate-100">
                  {p.heading}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {p.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Configuration table */}
        <section aria-labelledby="config-heading" className="my-10">
          <h2
            id="config-heading"
            className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3"
          >
            Configuration
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Without a verified implementation, specific environment variable names
            and their meanings cannot be stated with confidence. The patterns
            below reflect what community MCP database integrations commonly
            document; treat them as indicative, not authoritative.
          </p>

          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Commonly documented parameters
          </h3>
          <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-800 mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 text-left">
                  <th className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    Parameter
                  </th>
                  <th className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    Purpose
                  </th>
                  <th className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    Evidence status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {configTable.map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 font-mono text-slate-800 dark:text-slate-200">
                      {row.parameter}
                    </td>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
                      {row.purpose}
                    </td>
                    <td className="px-4 py-2 text-amber-600 dark:text-amber-400">
                      {row.evidenceStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            Treat these parameters as a starting point for evaluation, not
            confirmed configuration. Verify against the specific implementation
            you install.
          </p>
        </section>

        {/* Security Considerations */}
        <section aria-labelledby="security-heading" className="my-10">
          <h2
            id="security-heading"
            className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3"
          >
            Security considerations
          </h2>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 text-sm">
            <li>
              <strong>Direct database access</strong> — an MCP server with live
              database credentials can execute any query the connected role
              permits. Read-only mode is strongly recommended for AI-agent
              callers.
            </li>
            <li>
              <strong>Credential storage</strong> — database credentials should
              not appear in tool arguments, logs, or chat history. Use
              environment variables or a secrets manager, not inline config.
            </li>
            <li>
              <strong>Network exposure</strong> — expose a Postgres MCP server
              only over authenticated channels. Do not expose a database-connected
              server without transport-layer authentication (OAuth, bearer token,
              or equivalent).
            </li>
            <li>
              <strong>Query scope</strong> — restrict the server to the minimum
              table and column access required. A narrow schema scope reduces
              blast radius.
            </li>
            <li>
              <strong>Verification</strong> — before installing any Postgres MCP
              server, inspect its source code for what queries it can execute and
              what access it grants.
            </li>
          </ul>
          <p className="mt-4 text-sm">
            <Link
              href="/security/mcp-security"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              MCP security overview →
            </Link>
          </p>
        </section>

        {/* FAQ */}
        {faqs.length > 0 && (
          <section aria-labelledby="faq-heading" className="my-10">
            <h2
              id="faq-heading"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4"
            >
              Frequently asked questions
            </h2>
            <FAQ faqs={faqs} />
          </section>
        )}

        {/* Related servers */}
        <section aria-labelledby="related-heading" className="my-10">
          <h2
            id="related-heading"
            className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3"
          >
            Related
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/guides/mcp-servers-for-databases"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                MCP servers for databases →
              </Link>
            </li>
            <li>
              <Link
                href="/guides/postgres-mcp-server"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Postgres MCP server guide →
              </Link>
            </li>
            <li>
              <Link
                href="/security/mcp-security"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                MCP security overview →
              </Link>
            </li>
            <li>
              <Link
                href="/learn/mcp-server"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                What is an MCP server? →
              </Link>
            </li>
            <li>
              <Link
                href="/servers"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Server directory →
              </Link>
            </li>
            {allServers.length > 1 && (
              <>
                <li>
                  <Link
                    href="/servers"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View all verified servers ({allServers.length}) →
                  </Link>
                </li>
              </>
            )}
          </ul>
        </section>

        {/* Freshness */}
        <footer className="border-t border-slate-200 dark:border-slate-800 pt-4 text-xs text-slate-500 dark:text-slate-500">
          <p>
            Evidence last reviewed: <strong>{entry.lastVerifiedAt ?? "N/A"}</strong> ·
            Sources checked: npm registry, PyPI, github.com/modelcontextprotocol/servers (src/ directory listing)
          </p>
          <p className="mt-1">
            This page reflects the publication authority rule:{" "}
            <code>isServerIndexable()</code>. Status is{" "}
            <strong>{decision.indexable ? "indexable" : "not indexable"}</strong>{" "}
            — {decision.reason}.
          </p>
        </footer>
      </div>
    </main>
  );
}