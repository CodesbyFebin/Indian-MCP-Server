import { ContentFaq } from "@/src/content/content-registry";

/**
 * KeyTakeaways renders a compact "Key takeaways" box near the top of an
 * editorial page. Sources only facts already stated in the body — it does not
 * add claims of its own, honoring the no-fabrication editorial constraint.
 */
export function KeyTakeaways({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section
      aria-label="Key takeaways"
      className="my-6 rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">
        Key takeaways
      </h2>
      <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 dark:text-slate-300">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export type { ContentFaq }; // re-exported for shared consumption by FAQ component