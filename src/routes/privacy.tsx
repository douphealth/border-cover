import { createFileRoute } from "@tanstack/react-router";
import { DocBody, PageHead, seo } from "@/components/Shell";
import { staticDocs } from "@/lib/atlas";

const doc = staticDocs["privacy"]!;
export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: seo("Privacy | BorderCover Atlas", doc.description || "Privacy for BorderCover Atlas.") }),
  component: () => (<><PageHead kicker="Privacy" title={doc.title} /><DocBody blocks={doc.blocks} /></>),
});
