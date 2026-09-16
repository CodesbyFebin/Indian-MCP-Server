export interface EvidenceItem {
  source: string;
  url: string;
  type: "official" | "registry" | "repository" | "documentation" | "measurement" | "editorial" | "package-registry";
  status: "verified" | "unverified";
  reviewedAt: string;
  finding: string;
  limitations?: string;
}

/**
 * EvidencePanel renders the per-claim evidence ledger for a page. It never
 * invents values — only fields actually present are rendered. This is the
 * trust surface of the publication authority; a page may be indexable only
 * when its qualifying claims carry source evidence.
 */
export function EvidencePanel({ items }: { items: EvidenceItem[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="evidence-heading" className="my-10">
      <h2
        id="evidence-heading"
        className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3"
      >
        Evidence
      </h2>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded border border-slate-200 dark:border-slate-800 p-4"
          >
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {item.source}
              </span>
              <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400">
                {item.type}
              </span>
              <span
                className={
                  item.status === "verified"
                    ? "rounded bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-400"
                    : "rounded bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-400"
                }
              >
                {item.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              Reviewed: {item.reviewedAt} ·{" "}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {item.url}
              </a>
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {item.finding}
            </p>
            {item.limitations && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                Limitation: {item.limitations}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}