import { createFileRoute } from "@tanstack/react-router";
import { DocBody, PageHead, seo } from "@/components/Shell";
import { staticDocs } from "@/lib/atlas";

const doc = staticDocs["methodology"];
export const Route = createFileRoute("/methodology")({
  head: () => ({ meta: seo("Methodology | BorderCover Atlas", doc.description || "Methodology for BorderCover Atlas.") }),
  component: () => (<><PageHead kicker="Methodology" title={doc.title} /><DocBody blocks={doc.blocks} /></>),
});
