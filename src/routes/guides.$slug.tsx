import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { JsonLd } from "@/components/JsonLd";
import { PageHead, DocBody, RelatedLinks } from "@/components/Shell";
import { guideDocs } from "@/lib/atlas";
import { relatedFromGuide } from "@/lib/related";
import {
  guideCrumbs,
  guideDescription,
  guideGraph,
  guideTitle,
  seo,
  unavailableHead,
} from "@/lib/site";

export const Route = createFileRoute("/guides/$slug")({
  loader: ({ params }) => {
    const g = guideDocs[params.slug];
    if (!g) throw notFound();
    return { g, slug: params.slug };
  },
  head: ({ loaderData }) =>
    loaderData
      ? seo(
          guideTitle(loaderData.g.title),
          guideDescription(loaderData.g),
          `/guides/${loaderData.slug}`,
          { type: "article" },
        )
      : unavailableHead(
          "Guide unavailable",
          "That guide is not in the BorderCover Atlas research set.",
        ),
  component: GuidePage,
  notFoundComponent: () => <PageHead kicker="404" title="Guide not found." />,
});

function GuidePage() {
  const { g, slug } = Route.useLoaderData();
  const trail = guideCrumbs(slug, g.title);
  return (
    <>
      <JsonLd data={guideGraph(slug, g)} />
      <PageHead kicker="Guide" title={g.title} crumbs={trail.crumbs} />
      <DocBody blocks={g.blocks} />
      <RelatedLinks links={relatedFromGuide(slug)} />
      <div className="mx-auto mt-10 max-w-3xl px-5">
        <Link
          to="/"
          className="inline-flex rounded-full bg-brass px-6 py-3 font-semibold text-primary-foreground"
        >
          Check your own trip →
        </Link>
      </div>
    </>
  );
}
