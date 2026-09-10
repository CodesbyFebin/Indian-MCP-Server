/**
 * AEO direct-answer component. Renders a 40–90 word answer immediately below
 * the page H1. It is plain server-rendered HTML — no JS, no hiding — so search
 * engines and AI answer-extractors can read it directly. Words must be factual
 * and free of marketing superlatives.
 */
export function DirectAnswer({ text }: { text: string }) {
  return (
    <p className="mb-6 text-lg leading-relaxed text-slate-700 dark:text-slate-300">
      {text}
    </p>
  );
}