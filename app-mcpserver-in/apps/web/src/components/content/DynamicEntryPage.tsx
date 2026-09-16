import ContentPage from "@/src/components/content/ContentPage";
import { buildDynamicMeta } from "@/src/seo/dynamic-meta";
import { entryBySlug, parentLabel, siblingEntries, entriesForParent } from "@/src/content/route-helpers";

/**
 * Shared shell for every /<parent>/[slug] editorial page. Each route file calls
 * makeDynamicEntry("learn") (its own folder's parent) and re-exports the three
 * Next.js page responsibilities. All publication logic is delegated to the
 * content registry and ContentPage — this file does not restate the authority
 * rule, so the parent branch cannot drift from it.
 */

type PageProps = { params: { slug: string } };

interface DynamicEntry {
  generateStaticParams: () => { slug: string }[];
  generateMetadata: (props: PageProps) => ReturnType<typeof buildDynamicMeta>;
  Page: (props: PageProps) => Promise<React.ReactElement>;
}

export function makeDynamicEntry(parent: string): DynamicEntry {
  function generateStaticParams() {
    return entriesForParent(parent)
      .filter((e) => e.type !== "category")
      .map((e) => ({ slug: e.slug }));
  }

  function generateMetadata({ params }: PageProps) {
    const entry = entryBySlug(parent, params.slug);
    return buildDynamicMeta(entry);
  }

  async function Page({ params }: PageProps) {
    const entry = entryBySlug(parent, params.slug);
    if (!entry) {
      // Next dev/preview: notFound() renders the 404. Clients see a clean 404.
      return (
        <ContentPage
          entry={undefined}
          crumbs={[{ name: parentLabel(parent), path: `/${parent}` }]}
        />
      );
    }
    return (
      <ContentPage
        entry={entry}
        indexableChildren={siblingEntries(entry)}
        crumbs={[{ name: parentLabel(parent), path: `/${parent}` }]}
      />
    );
  }

  return { generateStaticParams, generateMetadata, Page };
}