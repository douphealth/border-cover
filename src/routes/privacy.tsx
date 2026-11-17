import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/JsonLd";
import { DocBody, PageHead } from "@/components/Shell";
import { staticDocs } from "@/lib/atlas";
import { pageDescription, pageGraph, pageTitle, seo, staticTrail } from "@/lib/site";

const doc = staticDocs["privacy"] ?? {
  title: "Privacy",
  description: "BorderCover Atlas privacy information.",
  blocks: [],
};
const description = pageDescription(doc.description || "Privacy for BorderCover Atlas.");
const trail = staticTrail("Privacy", "/privacy");

export const Route = createFileRoute("/privacy")({
  head: () => seo(pageTitle("Privacy"), description, "/privacy"),
  component: () => (
    <>
      <JsonLd data={pageGraph(doc.title, description, "/privacy", trail)} />
      <PageHead kicker="Privacy" title={doc.title} crumbs={trail.crumbs} />
      <DocBody blocks={doc.blocks} />
    </>
  ),
});
