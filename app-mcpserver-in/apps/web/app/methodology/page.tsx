import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/src/components/content/Breadcrumbs";
import { DirectAnswer } from "@/src/components/content/DirectAnswer";
import { KeyTakeaways } from "@/src/components/content/KeyTakeaways";
import { TableOfContents } from "@/src/components/content/TableOfContents";
import { collectJsonLd } from "@/src/seo/schema";
import { breadcrumbJsonLd, CANONICAL_ORIGIN } from "@/src/seo/breadcrumbs";

export const metadata: Metadata = {
  title: "Publication Methodology — MCPserver.in",
  description: "How MCPserver.in evaluates server eligibility, editorial content eligibility, comparisons, recommendations, freshness, and handles unknown data and corrections.",
  alternates: { canonical: CANONICAL_ORIGIN + "/methodology" },
};

const headings = [
  "Server eligibility",
  "Editorial content eligibility",
  "Comparisons and recommendations",
  "Freshness and review cadence",
  "Unknown-data handling",
  "Corrections process",
];

export default function MethodologyPage() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Methodology", href: "/methodology" },
  ];

  const schemas = collectJsonLd([
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": CANONICAL_ORIGIN + "/methodology#webpage",
      url: CANONICAL_ORIGIN + "/methodology",
      name: "Publication Methodology",
      description: "How MCPserver.in evaluates server eligibility, editorial content eligibility, comparisons, recommendations, freshness, and handles unknown data and corrections.",
    },
    breadcrumbJsonLd([{ name: "MCPserver.in", path: "/" }, { name: "Methodology", path: "/methodology" }]),
  ]);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        {schemas.filter(Boolean).map((schema, i) => (
          <script key={`jsonld-${i}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        ))}
        <Breadcrumbs crumbs={crumbs} />

        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Publication Methodology</h1>

        <DirectAnswer
          text="MCPserver.in publishes only what can be evidenced. Server eligibility requires a non-placeholder implementation, documented capabilities, identifiable maintainer, and verifiable source provenance. Editorial content requires published status, required sections, and source references. Comparisons are published only when both sides are evidence-backed and meaningful differences exist. Unknown remains unknown — no fabricated ratings, rankings, or certifications."
        />

        <KeyTakeaways
          items={[
            "Server publication: isServerIndexable() = published + evidence + verified + no noindex.",
            "Editorial publication: isContentIndexable() = published + no noindex + required content + required evidence.",
            "Comparisons require two qualified entities, real decision context, and non-trivial differences.",
            "No fake ratings, stars, or compliance claims without authoritative evidence.",
            "Stale content is flagged at 90 days; corrections update reviewedAt with a change note.",
            "Indexed legacy URLs are evaluated via Milestone 7 canonical-owner analysis before any redirect.",
          ]}
        />

        <TableOfContents headings={headings} />

        <section aria-labelledby="server-eligibility" className="my-10">
          <h2 id="server-eligibility" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Server eligibility</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            A server entity becomes a public, indexable page on MCPserver.in only when it satisfies the centralized
            publication authority <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">isServerIndexable()</code>.
            This function evaluates four conditions:
          </p>
          <ol className="list-decimal list-inside space-y-3 text-slate-700 dark:text-slate-300 mb-4">
            <li><strong>Published status</strong> — The server entry in the registry has <code>publicationStatus: "published"</code>. Draft, unverified, and archived entries are never indexable.</li>
            <li><strong>Evidence exists</strong> — At least one evidence reference is recorded in the ledger (<code>evidenceRefs.length {'>'} 0</code>).</li>
            <li><strong>Evidence is verified</strong> — At least one evidence reference has <code>status: "verified"</code>, meaning the capability was independently confirmed against a primary source.</li>
            <li><strong>No noindex flag</strong> — The entry does not carry an explicit <code>noindex: true</code> override.</li>
          </ol>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            These conditions are necessary and sufficient. Historical Google indexing, popularity, or maintainer
            reputation do not override the Evidence Ledger rules.
          </p>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2 mt-6">What qualifies as a non-placeholder implementation</h3>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-4">
            <li>Source code is publicly accessible (repository URL in ledger).</li>
            <li>The server implements the MCP initialization handshake and at least one primitive (tools, resources, or prompts).</li>
            <li>The server exposes at least one tool with a declared input schema.</li>
            <li>The server is installable/runnable (package, container, or binary with documented launch instructions).</li>
          </ul>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2 mt-6">What disqualifies a server</h3>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-4">
            <li>Security-holding package names (e.g., npm <code>*-security</code> placeholders).</li>
            <li>Initial-upload placeholders on PyPI/npm with no implementation.</li>
            <li>Announcements, RFCs, or design docs without working code.</li>
            <li>Forks or copies without independent maintenance.</li>
          </ul>
        </section>

        <section aria-labelledby="editorial-eligibility" className="my-10">
          <h2 id="editorial-eligibility" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Editorial content eligibility</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            Editorial pages (Learn, Clients, Build, Guides, Security) use a separate predicate:
            <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">isContentIndexable()</code>.
            This predicate <strong>never overrides server publication rules</strong>. It evaluates:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-4">
            <li>Status = <code>published</code></li>
            <li>No <code>noindex</code> flag</li>
            <li>Required content sections exist (TL;DR, substantive body, evidence/sources)</li>
            <li>Required evidence/source references exist for factual claims</li>
          </ul>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Draft, review, quarantine, and retired editorial entries are never indexable.
          </p>
        </section>

        <section aria-labelledby="comparisons" className="my-10">
          <h2 id="comparisons" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Comparisons and recommendations</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            MCPserver.in publishes a comparison page only when all of the following are true:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-4">
            <li>Two or more server entities satisfy the server publication authority (both are indexable).</li>
            <li>A real search intent exists — users face a genuine decision between the options.</li>
            <li>Meaningful, evidenced differences exist (capabilities, transport, auth, read/write behavior, limitations).</li>
          </ul>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            Comparison tables are structured data drawn from the Evidence Ledger. They compare:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-4">
            <li>Capabilities exposed (tools, resources, prompts)</li>
            <li>Transport (stdio, Streamable HTTP, SSE)</li>
            <li>Authentication (none, bearer, OAuth, API key)</li>
            <li>Read/write behavior (read-only, mutating, mixed)</li>
            <li>Known limitations (from ledger findings)</li>
            <li>Use-case fit</li>
          </ul>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            <strong>We never use:</strong> numeric scores, star ratings, "#1" claims, "fastest", "most popular",
            "best" without qualification. Recommendations are framed as "qualified for [use case] because [evidenced reason]".
          </p>
        </section>

        <section aria-labelledby="freshness" className="my-10">
          <h2 id="freshness" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Freshness and review cadence</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            Every indexable entity has a <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">reviewedAt</code>
            timestamp sourced from the Evidence Ledger. The review cadence:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-4">
            <li><strong>Server entities</strong> — Reviewed when a new version is released, when the repository has significant commits, or at least every 90 days.</li>
            <li><strong>Editorial pages</strong> — Reviewed when the underlying protocol, client, or ecosystem changes materially, or at least every 180 days.</li>
            <li><strong>Trust routes</strong> (/evidence, /methodology, /editorial-policy, /about) — Reviewed on process changes or quarterly.</li>
          </ul>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            The <code>reviewedAt</code> date on each page is the ledger's most recent review date. It is not a
            "last modified" timestamp for typographical edits.
          </p>
        </section>

        <section aria-labelledby="unknown-data" className="my-10">
          <h2 id="unknown-data" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Unknown-data handling</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            The core truth rule: <strong>Unknown remains unknown.</strong> We never fabricate:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-4">
            <li>Ratings, reviews, or scores</li>
            <li>Pricing, downloads, or usage statistics</li>
            <li>Popularity rankings</li>
            <li>Security or compliance certifications</li>
            <li>Uptime, latency, or region claims</li>
            <li>Maintainer status (active/inactive/abandoned)</li>
            <li>Compatibility matrices without evidence</li>
            <li>Transport or authentication support without verification</li>
            <li>Official status or endorsement</li>
          </ul>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            When evidence is absent, the page states "Unknown" or "Not verified" explicitly. Absence of evidence
            is not evidence of absence — it is simply unknown.
          </p>
        </section>

        <section aria-labelledby="corrections" className="my-10">
          <h2 id="corrections" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Corrections process</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            When an error is identified in the Evidence Ledger or on a public page:
          </p>
          <ol className="list-decimal list-inside space-y-3 text-slate-700 dark:text-slate-300 mb-4">
            <li>The ledger entry is updated with the corrected finding.</li>
            <li>The <code>reviewedAt</code> timestamp is updated to the correction date.</li>
            <li>A correction note is added to the ledger entry describing what changed and why.</li>
            <li>The affected public page(s) are regenerated on the next build.</li>
            <li>If the correction changes publication eligibility (indexable → non-indexable or vice versa),
                the sitemap and llms.txt are regenerated accordingly.</li>
          </ol>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Corrections are not hidden. The ledger is the source of truth; public pages are a projection of it.
          </p>
        </section>

        <footer className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-12">
          <nav aria-label="Trust routes" className="flex flex-wrap gap-6 text-sm">
            <Link href="/evidence" className="text-blue-600 dark:text-blue-400 hover:underline">Evidence Ledger</Link>
            <Link href="/editorial-policy" className="text-blue-600 dark:text-blue-400 hover:underline">Editorial Policy</Link>
            <Link href="/about" className="text-blue-600 dark:text-blue-400 hover:underline">About MCPserver.in</Link>
            <Link href="/security" className="text-blue-600 dark:text-blue-400 hover:underline">Security Model</Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}