import { makeDynamicEntry } from "@/src/components/content/DynamicEntryPage";

const { generateStaticParams, generateMetadata, Page } = makeDynamicEntry("learn");

export { generateStaticParams, generateMetadata };
export default Page;