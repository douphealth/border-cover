import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/JsonLd";
import { DocBody, PageHead } from "@/components/Shell";
import { staticDocs } from "@/lib/atlas";
import { pageDescription, pageGraph, pageTitle, seo, staticTrail } from "@/lib/site";

const doc = staticDocs["methodology"] ?? {
  title: "Research methodology",
  description: "BorderCover Atlas research standards.",
  blocks: [],
};
const description = pageDescription(doc.description || "Methodology for BorderCover Atlas.");
const trail = staticTrail("Methodology", "/methodology");

export const Route = createFileRoute("/methodology")({
  head: () => seo(pageTitle("Methodology"), description, "/methodology"),
  component: () => (
    <>
      <JsonLd data={pageGraph(doc.title, description, "/methodology", trail)} />
      <PageHead kicker="Methodology" title={doc.title} crumbs={trail.crumbs} />
      <DocBody blocks={doc.blocks} />
    </>
  ),
});
