import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/src/components/content/Breadcrumbs";
import { DirectAnswer } from "@/src/components/content/DirectAnswer";
import { KeyTakeaways } from "@/src/components/content/KeyTakeaways";
import { TableOfContents } from "@/src/components/content/TableOfContents";
import { collectJsonLd } from "@/src/seo/schema";
import { breadcrumbJsonLd, CANONICAL_ORIGIN } from "@/src/seo/breadcrumbs";

export const metadata: Metadata = {
  title: "Editorial Policy — MCPserver.in",
  description: "MCPserver.in editorial standards: no fabricated facts, evidence requirements, best/recommendation methodology, commercial independence, stale content handling, and correction process.",
  alternates: { canonical: CANONICAL_ORIGIN + "/editorial-policy" },
};

const headings = [
  "No fabricated facts",
  "Evidence requirements",
  "Best and recommendation methodology",
  "Commercial independence",
  "Stale content handling",
  "Correction process",
];

export default function EditorialPolicyPage() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Editorial Policy", href: "/editorial-policy" },
  ];

  const schemas = collectJsonLd([
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": CANONICAL_ORIGIN + "/editorial-policy#webpage",
      url: CANONICAL_ORIGIN + "/editorial-policy",
      name: "Editorial Policy",
      description: "MCPserver.in editorial standards: no fabricated facts, evidence requirements, best/recommendation methodology, commercial independence, stale content handling, and correction process.",
    },
    breadcrumbJsonLd([{ name: "MCPserver.in", path: "/" }, { name: "Editorial Policy", path: "/editorial-policy" }]),
  ]);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        {schemas.filter(Boolean).map((schema, i) => (
          <script key={`jsonld-${i}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        ))}
        <Breadcrumbs crumbs={crumbs} />

        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Editorial Policy</h1>

        <DirectAnswer
          text="MCPserver.in is an evidence-backed knowledge resource for the Model Context Protocol ecosystem. We do not fabricate facts, ratings, or rankings. Every public claim traces to a primary source in the Evidence Ledger. Recommendations are qualified by evidenced capability fit, not subjective scores. Commercial relationships do not influence publication decisions. Stale content is flagged and reviewed. Corrections are transparent and update the ledger."
        />

        <KeyTakeaways
          items={[
            "Zero tolerance for fabricated facts: ratings, reviews, pricing, popularity, certifications, uptime, compatibility.",
            "Every factual claim about an external system requires a ledger entry with a primary source URL.",
            "Recommendations = evidenced capability fit for a use case, never numeric scores or star ratings.",
            "No commercial influence on server eligibility, editorial coverage, or comparison outcomes.",
            "Stale entries flagged at 90 days (servers) / 180 days (editorial); quarantine if underlying system changed.",
            "Corrections update the ledger, bump reviewedAt, add a change note, and regenerate affected pages.",
          ]}
        />

        <TableOfContents headings={headings} />

        <section aria-labelledby="no-fabricated" className="my-10">
          <h2 id="no-fabricated" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">No fabricated facts</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            The following categories of information are <strong>never fabricated</strong> on MCPserver.in. If authoritative
            evidence does not exist, the value is stated as "Unknown" or "Not verified":
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-4">
            <li>Ratings, review scores, or star ratings</li>
            <li>Pricing, licensing costs, or commercial terms</li>
            <li>Download counts, usage statistics, or popularity metrics</li>
            <li>Security certifications (SOC 2, ISO 27001, FedRAMP, etc.)</li>
            <li>Compliance certifications (GDPR, HIPAA, PCI-DSS, etc.)</li>
            <li>Uptime guarantees, SLA commitments, or latency benchmarks</li>
            <li>Regional availability or data residency claims</li>
            <li>Maintainer status (active, inactive, abandoned, deprecated)</li>
            <li>Compatibility matrices (client × server, transport × server)</li>
            <li>Transport support (stdio, HTTP, SSE, WebSocket) without verification</li>
            <li>Authentication support (OAuth, API key, mTLS, etc.) without verification</li>
            <li>Official status, endorsement, or affiliation claims</li>
          </ul>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            This rule applies to server entities, editorial pages, comparison tables, and all structured data
            (JSON-LD). Any schema property that would imply a fabricated value (e.g., <code>aggregateRating</code>,
            <code>review</code>, <code>offers</code>, <code>certification</code>) is omitted unless real evidence exists.
          </p>
        </section>

        <section aria-labelledby="evidence-requirements" className="my-10">
          <h2 id="evidence-requirements" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Evidence requirements</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            A claim is eligible for publication only when the Evidence Ledger contains a reference that satisfies:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-4">
            <li><strong>Primary source</strong> — The reference points to the authoritative origin (repository, official docs, package registry, specification). Secondary sources (blog posts, aggregators, forums) are supplementary only.</li>
            <li><strong>Verifiable</strong> — A human or automated process can independently reach the same conclusion from the source.</li>
            <li><strong>Current</strong> — The source reflects the state of the system at or near the <code>reviewedAt</code> date.</li>
            <li><strong>Specific</strong> — The finding addresses the exact claim (e.g., "tool X accepts parameter Y" not "server has tools").</li>
          </ul>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            For server entities, at least one <strong>verified</strong> evidence reference is mandatory for indexable
            status. Unverified references (maintainer declarations) are recorded but do not satisfy the publication
            authority.
          </p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            For editorial pages, factual claims about external systems (clients, servers, protocols, specifications)
            require ledger-backed evidence. Analysis, synthesis, and methodology explanations produced by MCPserver.in
            are labeled as editorial sources.
          </p>
        </section>

        <section aria-labelledby="best-methodology" className="my-10">
          <h2 id="best-methodology" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Best and recommendation methodology</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            MCPserver.in does not produce "best of" lists, top-N rankings, or scored leaderboards. The methodology
            for any recommendation or qualified-for statement:
          </p>
          <ol className="list-decimal list-inside space-y-3 text-slate-700 dark:text-slate-300 mb-4">
            <li><strong>Define the use case</strong> — What task or workflow does the user need to accomplish?</li>
            <li><strong>Identify candidate servers</strong> — Filter the indexable server registry by relevant tags/capabilities.</li>
            <li><strong>Apply selection criteria</strong> — Documented capability match, transport fit, auth compatibility, read/write posture, maintenance signals.</li>
            <li><strong>Evidence each criterion</strong> — Every criterion row in a comparison table cites a ledger finding.</li>
            <li><strong>State limitations</strong> — Known gaps, unverified claims, and version-specific caveats are explicit.</li>
            <li><strong>Publish the methodology</strong> — The comparison page links to /methodology and the relevant ledger entries.</li>
          </ol>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            <strong>Prohibited language:</strong> "best", "top", "#1", "highest rated", "most popular", "fastest",
            "recommended" without qualification. "Qualified for [use case] because [evidenced reason]" is the
            required framing.
          </p>
        </section>

        <section aria-labelledby="commercial-independence" className="my-10">
          <h2 id="commercial-independence" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Commercial independence</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            MCPserver.in has no commercial relationship with any MCP server maintainer, client vendor, or platform
            provider that influences:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-4">
            <li>Server eligibility or indexable status</li>
            <li>Editorial coverage decisions</li>
            <li>Comparison selection or outcomes</li>
            <li>Recommendation language</li>
            <li>Ledger findings or verification states</li>
          </ul>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            If a commercial relationship ever exists (sponsorship, partnership, affiliate), it will be disclosed
            on the affected page and in the ledger. The publication authority rules remain unchanged regardless
            of any commercial relationship.
          </p>
        </section>

        <section aria-labelledby="stale-content" className="my-10">
          <h2 id="stale-content" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Stale content handling</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            Freshness is tracked via the ledger's <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">reviewedAt</code>
            field. The stale threshold:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-4">
            <li>Server entities: 90 days</li>
            <li>Editorial pages: 180 days</li>
            <li>Trust routes: 180 days</li>
          </ul>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            When an entry exceeds its threshold:
          </p>
          <ol className="list-decimal list-inside space-y-3 text-slate-700 dark:text-slate-300 mb-4">
            <li>The entry is flagged in the editorial queue.</li>
            <li>An editor reviews the underlying system (repository activity, releases, docs, domain status).</li>
            <li>If the system is unchanged: the ledger is re-verified, <code>reviewedAt</code> is updated, and the entry remains published.</li>
            <li>If the system has changed materially: the ledger is updated with new findings, <code>reviewedAt</code> is updated, and the page is regenerated.</li>
            <li>If the system is archived, deleted, or the domain expired: the entry moves to <code>quarantine</code> status and becomes non-indexable.</li>
          </ol>
        </section>

        <section aria-labelledby="correction-process" className="my-10">
          <h2 id="correction-process" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Correction process</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            Corrections follow the same process as described in /methodology:
          </p>
          <ol className="list-decimal list-inside space-y-3 text-slate-700 dark:text-slate-300 mb-4">
            <li>Error identified (internal review, reader report, maintainer contact).</li>
            <li>Ledger entry updated with corrected finding.</li>
            <li><code>reviewedAt</code> updated to correction date.</li>
            <li>Correction note added: "Corrected [date]: [what was wrong] → [what is correct]. Source: [URL]."</li>
            <li>Affected pages regenerated on next build.</li>
            <li>If publication eligibility changes, sitemap and llms.txt regenerated.</li>
          </ol>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            To report an error, use the contact information in <code>security.txt</code> or the GitHub repository
            issue tracker linked from /about.
          </p>
        </section>

        <footer className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-12">
          <nav aria-label="Trust routes" className="flex flex-wrap gap-6 text-sm">
            <Link href="/evidence" className="text-blue-600 dark:text-blue-400 hover:underline">Evidence Ledger</Link>
            <Link href="/methodology" className="text-blue-600 dark:text-blue-400 hover:underline">Methodology</Link>
            <Link href="/about" className="text-blue-600 dark:text-blue-400 hover:underline">About MCPserver.in</Link>
            <Link href="/security" className="text-blue-600 dark:text-blue-400 hover:underline">Security Model</Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}