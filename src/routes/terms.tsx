import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/JsonLd";
import { DocBody, PageHead } from "@/components/Shell";
import { staticDocs } from "@/lib/atlas";
import { pageDescription, pageGraph, pageTitle, seo, staticTrail } from "@/lib/site";

const doc = staticDocs["terms"] ?? {
  title: "Terms",
  description: "BorderCover Atlas terms.",
  blocks: [],
};
const description = pageDescription(doc.description || "Terms for BorderCover Atlas.");
const trail = staticTrail("Terms", "/terms");

export const Route = createFileRoute("/terms")({
  head: () => seo(pageTitle("Terms"), description, "/terms"),
  component: () => (
    <>
      <JsonLd data={pageGraph(doc.title, description, "/terms", trail)} />
      <PageHead kicker="Terms" title={doc.title} crumbs={trail.crumbs} />
      <DocBody blocks={doc.blocks} />
    </>
  ),
});
