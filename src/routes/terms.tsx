import { createFileRoute } from "@tanstack/react-router";
import { DocBody, PageHead, seo } from "@/components/Shell";
import { staticDocs } from "@/lib/atlas";

const doc = staticDocs["terms"] ?? { title: "Terms", description: "BorderCover Atlas terms.", blocks: [] };
export const Route = createFileRoute("/terms")({
  head: () => ({ meta: seo("Terms | BorderCover Atlas", doc.description || "Terms for BorderCover Atlas.") }),
  component: () => (<><PageHead kicker="Terms" title={doc.title} /><DocBody blocks={doc.blocks} /></>),
});
