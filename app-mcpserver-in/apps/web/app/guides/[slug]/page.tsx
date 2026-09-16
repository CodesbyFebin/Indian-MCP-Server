import { makeDynamicEntry } from "@/src/components/content/DynamicEntryPage";

const { generateStaticParams, generateMetadata, Page } = makeDynamicEntry("guides");

export { generateStaticParams, generateMetadata };
export default Page;