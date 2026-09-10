import { makeDynamicEntry } from "@/src/components/content/DynamicEntryPage";

const { generateStaticParams, generateMetadata, Page } = makeDynamicEntry("clients");

export { generateStaticParams, generateMetadata };
export default Page;