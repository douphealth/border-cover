import { createFileRoute } from "@tanstack/react-router";
import { DocBody, PageHead, seo } from "@/components/Shell";
import { staticDocs } from "@/lib/atlas";
import { MonetizePrivacy } from "@/components/MonetizePrivacy";

const doc = staticDocs["privacy"] ?? { title: "Privacy", description: "BorderCover Atlas privacy information.", blocks: [] };
export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: seo("Privacy | BorderCover Atlas", doc.description || "Privacy for BorderCover Atlas.") }),
  component: () => (<><PageHead kicker="Privacy" title={doc.title} /><DocBody blocks={doc.blocks} /><div className="mx-auto max-w-3xl px-5"><MonetizePrivacy /></div></>),
});
