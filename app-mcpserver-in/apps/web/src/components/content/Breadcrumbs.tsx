import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

/**
 * Breadcrumbs render a visible navigation trail and embed the matching
 * BreadcrumbList JSON-LD so the visible markup and structured data agree.
 * Anything that is indexable must carry breadcrumbs (homepage excluded).
 */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  if (crumbs.length === 0) return null;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `https://www.mcpserver.in${c.href}` } : {}),
    })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:underline">Home</Link>
          </li>
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={i} className="flex items-center gap-1">
                <span aria-hidden="true">›</span>
                {c.href && !isLast ? (
                  <Link href={c.href} className="hover:underline">{c.label}</Link>
                ) : (
                  <span aria-current={isLast ? "page" : undefined} className="text-slate-700 dark:text-slate-300">
                    {c.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}