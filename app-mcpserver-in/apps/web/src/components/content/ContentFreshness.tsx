export interface FreshnessProps {
  publishedAt?: string;
  updatedAt?: string;
  reviewedAt?: string;
  protocolRevision?: string;
}

/**
 * ContentFreshness renders review/publish metadata. Dates must reflect a
 * genuine review — this component never sets "today" at build time. Omitted
 * fields are simply not rendered.
 */
export function ContentFreshness({
  publishedAt,
  updatedAt,
  reviewedAt,
  protocolRevision,
}: FreshnessProps) {
  const rows: { label: string; value: string }[] = [];
  if (publishedAt) rows.push({ label: "Published", value: publishedAt });
  if (updatedAt) rows.push({ label: "Updated", value: updatedAt });
  if (reviewedAt) rows.push({ label: "Last reviewed", value: reviewedAt });
  if (protocolRevision) rows.push({ label: "Protocol revision", value: protocolRevision });

  if (rows.length === 0) return null;

  return (
    <footer className="mt-10 border-t border-slate-200 dark:border-slate-800 pt-4">
      <dl className="grid grid-cols-1 gap-2 text-xs text-slate-500 dark:text-slate-500 sm:grid-cols-2">
        {rows.map((r, i) => (
          <div key={i} className="flex gap-2">
            <dt className="font-medium text-slate-400 dark:text-slate-500">{r.label}:</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
    </footer>
  );
}