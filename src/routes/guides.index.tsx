import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { PageHead } from "@/components/Shell";
import { guideDocs } from "@/lib/atlas";
import { itemListNode, pageDescription, pageGraph, pageTitle, seo, staticTrail } from "@/lib/site";

const title = "Know the rules before the border.";
const description = pageDescription(
  "Plain-English guides to Green Cards, Mexican liability, Ireland–UK driving and more.",
);
const trail = staticTrail("Guides", "/guides");

export const Route = createFileRoute("/guides/")({
  head: () => seo(pageTitle("Drive-abroad insurance guides"), description, "/guides"),
  component: () => (
    <>
      <JsonLd
        data={pageGraph(title, description, "/guides", trail, [
          itemListNode(
            "Drive-abroad insurance guides",
            Object.entries(guideDocs).map(([slug, guide]) => ({
              name: guide.title.replace(/\.$/, ""),
              path: `/guides/${slug}`,
              description: guide.blocks[0]?.x || guide.description,
            })),
          ),
        ])}
      />
      <PageHead kicker="Guides" title={title} intro={description} crumbs={trail.crumbs} />
      <div className="mx-auto grid max-w-7xl gap-4 px-5 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(guideDocs).map(([slug, g], i) => (
          <Link
            key={slug}
            to="/guides/$slug"
            params={{ slug }}
            className="group flex min-h-56 flex-col justify-between rounded-2xl glass p-7 transition hover:-translate-y-1 hover:border-primary/50"
          >
            <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h2 className="text-2xl">{g.title.replace(/\.$/, "")}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{g.blocks[0]?.x}</p>
            </div>
            <ArrowUpRight className="h-5 w-5 self-end text-primary transition group-hover:rotate-45" />
          </Link>
        ))}
      </div>
    </>
  ),
});
