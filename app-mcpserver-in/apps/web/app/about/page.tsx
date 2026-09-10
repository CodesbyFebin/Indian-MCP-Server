import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/src/components/content/Breadcrumbs";
import { DirectAnswer } from "@/src/components/content/DirectAnswer";
import { KeyTakeaways } from "@/src/components/content/KeyTakeaways";
import { TableOfContents } from "@/src/components/content/TableOfContents";
import { collectJsonLd } from "@/src/seo/schema";
import { breadcrumbJsonLd, CANONICAL_ORIGIN } from "@/src/seo/breadcrumbs";

export const metadata: Metadata = {
  title: "About MCPserver.in",
  description: "What MCPserver.in is, what it is not, the Evidence Ledger model, and the distinction between public authority and app runtime.",
  alternates: { canonical: CANONICAL_ORIGIN + "/about" },
};

const headings = [
  "What MCPserver.in is",
  "What MCPserver.in is not",
  "Public authority vs app runtime",
  "Evidence Ledger model",
  "Governance and contact",
];

export default function AboutPage() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
  ];

  const schemas = collectJsonLd([
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": CANONICAL_ORIGIN + "/about#webpage",
      url: CANONICAL_ORIGIN + "/about",
      name: "About MCPserver.in",
      description: "What MCPserver.in is, what it is not, the Evidence Ledger model, and the distinction between public authority and app runtime.",
    },
    breadcrumbJsonLd([{ name: "MCPserver.in", path: "/" }, { name: "About", path: "/about" }]),
  ]);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        {schemas.filter(Boolean).map((schema, i) => (
          <script key={`jsonld-${i}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        ))}
        <Breadcrumbs crumbs={crumbs} />

        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">About MCPserver.in</h1>

        <DirectAnswer
          text="MCPserver.in is a public knowledge resource for the Model Context Protocol ecosystem. It provides evidence-backed server discovery, technical guides, client setup documentation, and security guidance. It operates an Evidence Ledger that records primary-source provenance for every claim. It is not the official MCP registry, not a marketplace, not an app runtime, and not a rating service. The sister product app.mcpserver.in is a separate mobile-first MCP workspace application that shares contracts and evidence model but is independently deployed."
        />

        <KeyTakeaways
          items={[
            "MCPserver.in = public authority website (discovery, guides, evidence).",
            "app.mcpserver.in = mobile-first MCP workspace app (playground, skills, workflows).",
            "Shared: contracts, evidence model, registry schemas, auth primitives.",
            "Separate: deployment, runtime, UI, product scope.",
            "Evidence Ledger = source of truth for all public claims.",
            "No fabricated ratings, rankings, or compliance claims.",
          ]}
        />

        <TableOfContents headings={headings} />

        <section aria-labelledby="what-is" className="my-10">
          <h2 id="what-is" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">What MCPserver.in is</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            MCPserver.in is a public website that serves as an evidence-backed knowledge resource for the Model
            Context Protocol (MCP) ecosystem. Its core functions:
          </p>
          <ul className="list-disc list-inside space-y-3 text-slate-700 dark:text-slate-300 mb-4">
            <li><strong>Server discovery</strong> — An AI-indexed directory of MCP servers where every listed entity has passed the publication authority (verified implementation, documented capabilities, source provenance).</li>
            <li><strong>Technical guides</strong> — Learn, Build, Clients, Guides, and Security sections covering MCP fundamentals, protocol architecture, client setup, server development, troubleshooting, and security.</li>
            <li><strong>Evidence Ledger</strong> — A structured record of what was checked, where the information came from, whether it was independently verified, and when it was last reviewed. Every public claim traces to a ledger entry.</li>
            <li><strong>Methodology transparency</strong> — Explicit publication rules (isServerIndexable, isContentIndexable), comparison methodology, freshness policy, and correction process.</li>
          </ul>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            The site is designed for AI search readiness (llms.txt, JSON-LD, sitemap.xml) and human readability.
            Structured data matches visible content exactly — no hidden schema.
          </p>
        </section>

        <section aria-labelledby="what-is-not" className="my-10">
          <h2 id="what-is-not" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">What MCPserver.in is not</h2>
          <ul className="list-disc list-inside space-y-3 text-slate-700 dark:text-slate-300 mb-4">
            <li><strong>Not the official MCP registry</strong> — The authoritative registry is maintained by the Model Context Protocol project. MCPserver.in is a directory and knowledge resource that references the official registry as a source.</li>
            <li><strong>Not a marketplace</strong> — No purchase, install, or commercial transaction flows. Server entries link to source repositories and package registries.</li>
            <li><strong>Not an app runtime</strong> — MCPserver.in does not execute MCP servers, host clients, or run workflows. The sister product app.mcpserver.in provides the workspace/runtime layer.</li>
            <li><strong>Not a rating or ranking service</strong> — No stars, scores, leaderboards, or "best of" lists. Recommendations are qualified capability-fit statements backed by evidence.</li>
            <li><strong>Not a compliance or certification body</strong> — We do not issue security certifications, compliance attestations, or official status designations.</li>
            <li><strong>Not a monitoring service</strong> — The Evidence Ledger reflects review-time state, not real-time uptime, latency, or health.</li>
          </ul>
        </section>

        <section aria-labelledby="public-authority" className="my-10">
          <h2 id="public-authority" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Public authority vs app runtime</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            The MCPserver.in + app.mcpserver.in dual-product architecture:
          </p>
          <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-800 mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 text-left">
                  <th className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 w-1/2">
                    MCPserver.in (Product A)
                  </th>
                  <th className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 w-1/2">
                    app.mcpserver.in (Product B)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-300">Public authority website</td>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-300">Mobile-first MCP workspace app</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-300">Server discovery & evidence</td>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-300">MCP playground & JSON-RPC inspector</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-300">Technical guides & documentation</td>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-300">Skills automation & workflow builder</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-300">SEO/AEO/GEO optimized</td>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-300">Offline-first, touch-optimized</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-300">llms.txt, sitemap, JSON-LD</td>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-300">Multi-LLM gateway, execution history</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-300">Static/SSR (Next.js)</td>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-300">Client-heavy (Next.js + MCP client)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            Both products share the <strong>contracts package</strong> (TypeScript schemas), <strong>evidence package</strong>
            (Evidence Ledger logic, publication authority), <strong>registry package</strong> (domain types, normalization),
            <strong>auth package</strong> (primitives), and <strong>design tokens</strong>. They are independently deployable
            with separate CI/CD, infrastructure, and runtime environments.
          </p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            app.mcpserver.in is <strong>not a public authority</strong>. It consumes the public server registry
            (via the shared contracts) but does not publish server entities or editorial content. Its server
            directory is a runtime view of the same evidence-backed data, filtered for the workspace use case.
          </p>
        </section>

        <section aria-labelledby="evidence-ledger-model" className="my-10">
          <h2 id="evidence-ledger-model" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Evidence Ledger model</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            The Evidence Ledger is the single source of truth for both products. It stores:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-4">
            <li><strong>EvidenceRef</strong> — id, sourceUrl, sourceType, status (verified/unverified), lastChecked, supports[], finding, limitations.</li>
            <li><strong>Server entries</strong> — Linked to evidenceRefs; evaluated by isServerIndexable() for publication.</li>
            <li><strong>Editorial entries</strong> — Linked to evidenceRefs for factual claims; evaluated by isContentIndexable().</li>
            <li><strong>Review timestamps</strong> — reviewedAt on every entry; drives freshness flags.</li>
          </ul>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            The ledger is append-only for findings (corrections add new entries with updated reviewedAt). It is the
            build-time input for sitemap.xml, llms.txt, and all public pages. No public page is generated without
            a corresponding ledger entry that satisfies the relevant publication predicate.
          </p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            See <Link href="/evidence" className="text-blue-600 dark:text-blue-400 hover:underline">/evidence</Link>
            for the full ledger specification and <Link href="/methodology" className="text-blue-600 dark:text-blue-400 hover:underline">/methodology</Link> for the publication rules.
          </p>
        </section>

        <section aria-labelledby="governance" className="my-10">
          <h2 id="governance" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Governance and contact</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            MCPserver.in is operated by the team identified in <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">humans.txt</code>
            and <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">security.txt</code>.
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-4">
            <li>Security contact: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">security.txt</code> (RFC 9116)</li>
            <li>Team attribution: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">humans.txt</code></li>
            <li>AI crawler permissions: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">ai.txt</code> (opt-in)</li>
            <li>Agent guide: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">llms.txt</code></li>
          </ul>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Source code and issue tracker: <Link href="https://github.com/mcpserver-in/mcpserver.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">github.com/mcpserver-in/mcpserver.in</Link>
          </p>
        </section>

        <footer className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-12">
          <nav aria-label="Trust routes" className="flex flex-wrap gap-6 text-sm">
            <Link href="/evidence" className="text-blue-600 dark:text-blue-400 hover:underline">Evidence Ledger</Link>
            <Link href="/methodology" className="text-blue-600 dark:text-blue-400 hover:underline">Methodology</Link>
            <Link href="/editorial-policy" className="text-blue-600 dark:text-blue-400 hover:underline">Editorial Policy</Link>
            <Link href="/security" className="text-blue-600 dark:text-blue-400 hover:underline">Security Model</Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}