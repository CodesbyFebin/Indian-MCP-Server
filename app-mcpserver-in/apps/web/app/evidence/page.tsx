import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/src/components/content/Breadcrumbs";
import { DirectAnswer } from "@/src/components/content/DirectAnswer";
import { KeyTakeaways } from "@/src/components/content/KeyTakeaways";
import { TableOfContents } from "@/src/components/content/TableOfContents";
import { collectJsonLd } from "@/src/seo/schema";
import { breadcrumbJsonLd, CANONICAL_ORIGIN } from "@/src/seo/breadcrumbs";

export const metadata: Metadata = {
  title: "Evidence Ledger — MCPserver.in",
  description: "How MCPserver.in evaluates, verifies, and publishes MCP server and editorial content. Evidence provenance, verification states, and publication requirements.",
  alternates: { canonical: CANONICAL_ORIGIN + "/evidence" },
};

const headings = [
  "What the Evidence Ledger is",
  "Source types and provenance",
  "Verification states",
  "Measured vs declared",
  "Review dates and freshness",
  "Publication requirements",
  "Limitations and corrections",
];

export default function EvidencePage() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Evidence Ledger", href: "/evidence" },
  ];

  const schemas = collectJsonLd([
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": CANONICAL_ORIGIN + "/evidence#webpage",
      url: CANONICAL_ORIGIN + "/evidence",
      name: "Evidence Ledger",
      description: "How MCPserver.in evaluates, verifies, and publishes MCP server and editorial content.",
    },
    breadcrumbJsonLd([{ name: "MCPserver.in", path: "/" }, { name: "Evidence Ledger", path: "/evidence" }]),
  ]);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        {schemas.filter(Boolean).map((schema, i) => (
          <script key={`jsonld-${i}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        ))}
        <Breadcrumbs crumbs={crumbs} />

        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Evidence Ledger</h1>

        <DirectAnswer
          text="The Evidence Ledger is the source-of-truth layer behind every public page on MCPserver.in. It records what was checked, where the information came from, whether it was independently verified or only declared by a maintainer, and when it was last reviewed. No public claim — server capability, compatibility, or editorial recommendation — appears without a corresponding ledger entry."
        />

        <KeyTakeaways
          items={[
            "Every public server entity and editorial page has a ledger entry with source URLs and verification status.",
            "Sources are classified: official, registry, repository, documentation, package-registry, measurement, editorial.",
            "Verification state is explicit: verified (independently confirmed) or unverified (maintainer declaration only).",
            "Measured capabilities (independently tested) are distinguished from declared capabilities (maintainer assertion).",
            "Review dates are mandatory; stale entries are flagged and may be moved to quarantine.",
            "Publication requires: published status + evidence + verified evidence + no noindex flag.",
          ]}
        />

        <TableOfContents headings={headings} />

        <section aria-labelledby="what-is" className="my-10">
          <h2 id="what-is" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">What the Evidence Ledger is</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            The Evidence Ledger is a structured record that backs every indexable claim on MCPserver.in. It is not a
            marketing database and it is not a popularity index. It is an audit trail: for each server entity or
            editorial assertion, the ledger stores the primary sources that were consulted, the verification outcome,
            and the date of the last review.
          </p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            The ledger exists because AI-assisted discovery surfaces claims faster than humans can manually verify
            them. By making provenance explicit and machine-readable, the ledger lets both human readers and AI
            answer-extractors trace any claim back to its origin.
          </p>
        </section>

        <section aria-labelledby="source-types" className="my-10">
          <h2 id="source-types" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Source types and provenance</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            Every ledger entry carries a source type. The classification determines how much weight the evidence
            carries in the publication decision:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-4">
            <li><strong>official</strong> — Authoritative project sources (e.g., modelcontextprotocol.io, github.com/modelcontextprotocol).</li>
            <li><strong>registry</strong> — Machine-readable registries or package indexes (npm, PyPI, official MCP registry).</li>
            <li><strong>repository</strong> — Source code repositories (GitHub, GitLab) where implementation can be inspected.</li>
            <li><strong>documentation</strong> — Published docs, README files, API references.</li>
            <li><strong>package-registry</strong> — Package metadata from npm, PyPI, crates.io, etc.</li>
            <li><strong>measurement</strong> — Independent test runs, benchmark results, or capability probes executed by MCPserver.in.</li>
            <li><strong>editorial</strong> — Internal analysis, methodology documents, or synthesis pages produced by MCPserver.in.</li>
          </ul>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Higher-trust sources (official, measurement, repository) carry more weight than lower-trust sources
            (package-registry, editorial). A claim supported only by editorial synthesis without primary source
            backing will not satisfy the publication authority for server entities.
          </p>
        </section>

        <section aria-labelledby="verification-states" className="my-10">
          <h2 id="verification-states" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Verification states</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            Each evidence reference has a verification status:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-4">
            <li><strong>verified</strong> — The claim was independently confirmed against a primary source (source code, live endpoint, official documentation). The finding is reproducible.</li>
            <li><strong>unverified</strong> — The claim comes from a maintainer declaration, marketing material, or secondary source without independent confirmation. It is recorded but does not satisfy the publication authority for server entities.</li>
          </ul>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            A server entity requires <strong>at least one verified evidence reference</strong> to pass
            <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">isServerIndexable()</code>.
            Editorial pages require verified evidence for any factual claim about external systems.
          </p>
        </section>

        <section aria-labelledby="measured-vs-declared" className="my-10">
          <h2 id="measured-vs-declared" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Measured vs declared</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            This distinction is critical for server capabilities:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-4">
            <li><strong>Declared</strong> — The maintainer states the server supports a capability (e.g., "supports OAuth"). This is a declaration.</li>
            <li><strong>Measured</strong> — MCPserver.in or a trusted third party has tested the capability (e.g., completed an OAuth flow against the server and received a valid token). This is a measurement.</li>
          </ul>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Declarations alone do not flip a server to verified. Measurements are required for indexable status.
            Where a capability is declared but not measured, the ledger records it as unverified and the server
            remains non-indexable until measurement is completed.
          </p>
        </section>

        <section aria-labelledby="review-dates" className="my-10">
          <h2 id="review-dates" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Review dates and freshness</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            Every ledger entry has a <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">reviewedAt</code>
            timestamp. Entries older than 90 days without a new review are flagged as potentially stale. The editorial
            process reviews flagged entries on a rolling basis.
          </p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            Stale entries do not automatically become non-indexable, but they are candidates for quarantine if
            the underlying system has changed (new major version, repository archived, domain expired).
          </p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            The <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">reviewedAt</code> date
            on each public page reflects the ledger's most recent review, not the page publish date.
          </p>
        </section>

        <section aria-labelledby="publication-requirements" className="my-10">
          <h2 id="publication-requirements" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Publication requirements</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            For a server entity to be indexable (appear in <code>/servers</code> and sitemap):
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-4">
            <li>Publication status = <code>published</code></li>
            <li>Evidence count {'>'} 0</li>
            <li>At least one evidence reference with status = <code>verified</code></li>
            <li>No <code>noindex</code> flag</li>
          </ul>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            For an editorial page to be indexable:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-4">
            <li>Status = <code>published</code></li>
            <li>No <code>noindex</code> flag</li>
            <li>Required content sections exist</li>
            <li>Required evidence/source references exist</li>
          </ul>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            These rules are enforced at build time. The static generation pipeline filters through the appropriate
            publication authority before emitting any public route.
          </p>
        </section>

        <section aria-labelledby="limitations" className="my-10">
          <h2 id="limitations" className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Limitations and corrections</h2>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-4">
            <li>The ledger reflects the state of knowledge at the time of review. It is not a real-time monitoring system.</li>
            <li>Source availability varies: some repositories are private, some package registries lack metadata, some servers have no public documentation.</li>
            <li>Measurement capacity is limited. Not every declared capability can be independently tested.</li>
            <li>Corrections are published as ledger updates with a new <code>reviewedAt</code> date and a note describing the change.</li>
          </ul>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            If you identify an error in the ledger, use the correction process described in the
            <Link href="/editorial-policy" className="text-blue-600 dark:text-blue-400 hover:underline">Editorial Policy</Link>.
          </p>
        </section>

        <footer className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-12">
          <nav aria-label="Trust routes" className="flex flex-wrap gap-6 text-sm">
            <Link href="/methodology" className="text-blue-600 dark:text-blue-400 hover:underline">Methodology</Link>
            <Link href="/editorial-policy" className="text-blue-600 dark:text-blue-400 hover:underline">Editorial Policy</Link>
            <Link href="/about" className="text-blue-600 dark:text-blue-400 hover:underline">About MCPserver.in</Link>
            <Link href="/security" className="text-blue-600 dark:text-blue-400 hover:underline">Security Model</Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}