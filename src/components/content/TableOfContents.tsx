/**
 * Table of Contents. Generates anchor links for the article's primary
 * headings. Uses anchor IDs derived from the heading text — the subject
 * page must render matching ids='heading-slug' on its <h2> elements.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function TableOfContents({ headings }: { headings: string[] }) {
  if (headings.length === 0) return null;
  return (
    <nav
      aria-label="Table of contents"
      className="mb-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4"
    >
      <p className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
        On this page
      </p>
      <ol className="space-y-1 text-sm">
        {headings.map((h, i) => (
          <li key={i}>
            <a href={`#${slugify(h)}`} className="toc-link text-slate-600 dark:text-slate-300">
              {h}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export { slugify };