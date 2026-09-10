import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEntry, getIndexableEntries, getChildren } from "@/src/content/content-registry";
import { articleJsonLd, breadcrumbListJsonLd } from "@/src/seo/schema";
import { Breadcrumbs } from "@/src/components/content/Breadcrumbs";
import { ContentFreshness } from "@/src/components/content/ContentFreshness";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const terms = getChildren("glossary");
  return terms.map((term) => ({ slug: term.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(`/glossary/${slug}`);

  if (!entry) {
    return { title: "Glossary term not found — MCPserver.in" };
  }

  return {
    title: `${entry.h1} — MCPserver.in Glossary`,
    description: entry.metaDescription,
    openGraph: {
      title: `${entry.h1} — MCPserver.in Glossary`,
      description: entry.metaDescription,
      type: "website",
    },
  };
}

export default async function GlossaryTermPage({ params }: PageProps) {
  const { slug } = await params;
  const indexPath = `/glossary/${slug}`;
  const entry = getEntry(indexPath);

  if (!entry) {
    notFound();
  }

  const allTerms = getChildren("glossary");

  // JSON-LD schemas
  const schemas = [
    articleJsonLd({
      slug: entry.slug,
      title: entry.title,
      description: entry.metaDescription,
      h1: entry.h1,
      sections: entry.sections,
      faq: entry.faq,
      schemaType: entry.schemaType,
      indexableUrl: entry.indexPath,
      reviewedAt: entry.reviewedAt,
    }),
    breadcrumbListJsonLd([
      { name: "Home", item: "https://www.mcpserver.in/" },
      { name: "Glossary", item: "https://www.mcpserver.in/glossary" },
      { name: entry.h1, item: `https://www.mcpserver.in${entry.indexPath}` },
    ]),
  ];

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Glossary", href: "/glossary" },
    { label: entry.h1, href: entry.indexPath },
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

        <h1 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
          {entry.h1}
        </h1>

        {entry.sections && entry.sections.length > 0 && (
          <>
            {entry.sections.map((section, i) => (
              <section key={i} className="my-6">
                <h2
                  className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100"
                >
                  {section.heading}
                </h2>
                <div className="space-y-3 text-slate-700 dark:text-slate-300">
                  {section.markdown
                    .split("\n\n")
                    .filter(Boolean)
                    .map((block, j) => {
                      if (block.startsWith("- ")) {
                        return (
                          <ul key={j} className="list-disc list-inside space-y-1">
                            {block
                              .split("\n")
                              .filter((l) => l.trim().startsWith("-"))
                              .map((l, k) => (
                                <li key={k}>{l.replace(/^-\s+/, "")}</li>
                              ))}
                          </ul>
                        );
                      }
                      if (/^\d+\.\s/.test(block)) {
                        return (
                          <ol key={j} className="list-decimal list-inside space-y-1">
                            {block
                              .split("\n")
                              .filter((l) => /^\d+\.\s/.test(l.trim()))
                              .map((l, k) => (
                                <li key={k}>{l.replace(/^\d+\.\s+/, "")}</li>
                              ))}
                          </ol>
                        );
                      }
                      return <p key={j}>{block}</p>;
                    })}
                </div>
              </section>
            ))}
          </>
        )}

        {entry.faq && entry.faq.length > 0 && (
          <section aria-labelledby="faq-heading" className="my-10">
            <h2
              id="faq-heading"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4"
            >
              Frequently asked questions
            </h2>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: entry.faq.map((f) => ({
                    "@type": "Question",
                    name: f.question,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: f.answer,
                    },
                  })),
                }),
              }}
            />
            <div className="space-y-6">
              {entry.faq.map((f, i) => (
                <div
                  key={i}
                  className="border-b border-slate-200 dark:border-slate-800 pb-6 last:border-0 last:pb-0"
                >
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                    {f.question}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {f.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related terms */}
        <section aria-labelledby="related-heading" className="my-10">
          <h2
            id="related-heading"
            className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3"
          >
            Related terms
          </h2>
          <ul className="space-y-2 text-sm">
            {allTerms
              .filter((t) => t.slug !== slug)
              .slice(0, 8)
              .map((term) => (
                <li key={term.slug}>
                  <Link
                    href={term.indexPath}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {term.h1}
                  </Link>
                </li>
              ))}
            {allTerms.length > 9 && (
              <li>
                <Link
                  href="/glossary"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View all {allTerms.length} glossary terms →
                </Link>
              </li>
            )}
          </ul>
        </section>

        <ContentFreshness reviewedAt={entry.reviewedAt ?? new Date().toISOString().split("T")[0]} />
      </div>
    </main>
  );
}