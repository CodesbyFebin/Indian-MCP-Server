import { RegistryEntry } from "@/src/content/content-registry";
import { Breadcrumbs } from "@/src/components/content/Breadcrumbs";
import { TableOfContents, slugify } from "@/src/components/content/TableOfContents";
import { FAQ } from "@/src/components/content/FAQ";
import { ContentFreshness } from "@/src/components/content/ContentFreshness";
import { RelatedLinks } from "@/src/components/content/RelatedLinks";
import { articleJsonLd } from "@/src/seo/schema";

/**
 * ContentPage renders one editorial registry entry end-to-end with the
 * publication authority enforced.
 *
 * Publication rule: the page is open to crawlers (indexable) only when the
 * entry is `published` and `noindex` is not true. A non-indexable entry is
 * still rendered for humans (e.g. a developer previewing a draft) but carries
 * a visible NOT-INDEXED banner so it can never be mistaken for a public
 * authority page. This is the single place a content page makes that
 * decision — there is no parallel interpretation anywhere in the codebase.
 */
export interface ContentPageProps {
  entry?: RegistryEntry;
  indexableChildren?: RegistryEntry[];
  crumbs: { name: string; path: string }[];
}

function renderMarkdown(markdown: string): React.ReactNode[] {
  return markdown
    .split("\n\n")
    .filter(Boolean)
    .map((block, i) => {
      const h2 = block.match(/^##\s+(.*)$/);
      if (h2) return <h2 key={i}>{h2[1]}</h2>;
      const h3 = block.match(/^###\s+(.*)$/);
      if (h3) return <h3 key={i}>{h3[1]}</h3>;
      const h4 = block.match(/^####\s+(.*)$/);
      if (h4) return <h4 key={i}>{h4[1]}</h4>;
      if (block.startsWith("- ")) {
        return (
          <ul key={i}>
            {block
              .split("\n")
              .filter((l) => l.trim().startsWith("-"))
              .map((l, j) => (
                <li key={j}>{l.replace(/^-\s+/, "")}</li>
              ))}
          </ul>
        );
      }
      if (/^\d+\.\s/.test(block)) {
        return (
          <ol key={i}>
            {block
              .split("\n")
              .filter((l) => /^\d+\.\s/.test(l.trim()))
              .map((l, j) => (
                <li key={j}>{l.replace(/^\d+\.\s+/, "")}</li>
              ))}
          </ol>
        );
      }
      return <p key={i}>{block}</p>;
    });
}

export default function ContentPage({ entry, indexableChildren, crumbs = [] }: ContentPageProps) {
  const isIndexable = entry ? entry.status === "published" && !entry.noindex : false;

  const schemas: (Record<string, unknown> | null)[] = [];
  if (entry) {
    schemas.push(
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
    );
  }

  return (
    <article>
      {entry && !isIndexable && (
        <div className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
          <strong>Not indexed.</strong> This page is a draft or review copy and
          is intentionally hidden from search engines (noindex,follow).
        </div>
      )}

      <Breadcrumbs crumbs={crumbs.map(c => ({ label: c.name, href: c.path }))} />

      {entry && (
        <h1 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
          {entry.h1}
        </h1>
      )}

      {entry && entry.sections && entry.sections.length > 0 && (
        <>
          <TableOfContents headings={entry.sections.map((s) => s.heading)} />
          {entry.sections.map((section, i) => (
            <section key={i} className="my-6">
              <h2
                className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100"
                id={slugify(section.heading)}
              >
                {section.heading}
              </h2>
              <div className="space-y-3 text-slate-700 dark:text-slate-300">
                {renderMarkdown(section.markdown)}
              </div>
            </section>
          ))}
        </>
      )}

      {entry && entry.faq && entry.faq.length > 0 && (
        <FAQ faqs={entry.faq} />
      )}

      {indexableChildren && indexableChildren.length > 0 && (
        <RelatedLinks
          heading="In this collection"
          items={indexableChildren.map((c) => ({
            label: c.title,
            href: c.indexPath,
          }))}
        />
      )}

      {entry && (
        <ContentFreshness reviewedAt={entry.reviewedAt} publishedAt={entry.reviewedAt} />
      )}

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
    </article>
  );
}