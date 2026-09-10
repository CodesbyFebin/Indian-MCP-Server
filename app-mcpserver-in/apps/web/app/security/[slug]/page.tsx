import { makeDynamicEntry } from "@/src/components/content/DynamicEntryPage";

const { generateStaticParams, generateMetadata, Page } = makeDynamicEntry("security");

export { generateStaticParams, generateMetadata };
export default Page;