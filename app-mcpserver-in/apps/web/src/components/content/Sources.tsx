interface SourceLink {
  label: string;
  url: string;
}

/**
 * Sources renders the evidence-backed reference list for an editorial page.
 * Only actual source URLs are shown — we never fabricate a reference. Renders
 * nothing when the page has no recorded sources, so a draft can never present
 * itself as better-sourced than it is.
 */
export function Sources({ sources }: { sources: SourceLink[] }) {
  if (sources.length === 0) return null;
  return (
    <section aria-label="Sources" className="my-10">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
        Sources
      </h2>
      <ul className="space-y-2 text-sm">
        {sources.map((s, i) => (
          <li key={i}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {s.label}
            </a>{" "}
            <span className="text-slate-400 dark:text-slate-500 break-all">
              {s.url}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}