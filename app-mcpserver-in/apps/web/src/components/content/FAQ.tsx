import { ContentFaq } from "../../content/content-registry";

/**
 * FAQ renders visible question/answer blocks AND the matching FAQPage JSON-LD.
 * The structured data is only emitted because the questions and answers are
 * genuinely visible in the page, satisfying the "schema matches content" rule.
 */
export function FAQ({ faqs }: { faqs: ContentFaq[] }) {
  if (faqs.length === 0) return null;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  });

  return (
    <section aria-labelledby="faq-heading" className="my-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <h2 id="faq-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Frequently asked questions
      </h2>
      <div className="space-y-6">
        {faqs.map((f, i) => (
          <div key={i} className="border-b border-slate-200 dark:border-slate-800 pb-6 last:border-0 last:pb-0">
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">{f.question}</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{f.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}