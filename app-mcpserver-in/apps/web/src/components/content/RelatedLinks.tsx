import Link from "next/link";

interface LinkItem {
  label: string;
  href: string;
}

/**
 * RelatedLinks renders an internal-linking block. Used to satisfy the
 * six-edge rule: every indexable editorial page should link to its parent,
 * siblings, a related server entity, a client/setup page, and an adjacent
 * authority pillar. Takes an optional heading.
 */
export function RelatedLinks({ items, heading = "Related" }: { items: LinkItem[]; heading?: string }) {
  if (items.length === 0) return null;
  return (
    <section aria-label={heading} className="my-10">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">{heading}</h2>
      <ul className="space-y-2 text-sm">
        {items.map((it, i) => (
          <li key={i}>
            <Link href={it.href} className="text-blue-600 dark:text-blue-400 hover:underline">
              {it.label} →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}