import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { DocBody, PageHead, seo } from "@/components/Shell";
import { guideDocs } from "@/lib/atlas";

export const Route = createFileRoute("/guides/$slug")({
  loader: ({ params }) => { const g = guideDocs[params.slug]; if (!g) throw notFound(); return { g }; },
  head: ({ loaderData }) => ({ meta: loaderData ? seo(`${loaderData.g.title.replace(/\.$/, "")} | BorderCover Atlas`, loaderData.g.description || loaderData.g.blocks[0]?.x || "") : [{ title: "Guide unavailable" }, { name: "robots", content: "noindex" }] }),
  component: () => {
    const { g } = Route.useLoaderData();
    return (<><PageHead kicker="Guide" title={g.title} /><DocBody blocks={g.blocks} />
      <div className="mx-auto mt-10 max-w-3xl px-5"><Link to="/" className="inline-flex rounded-full bg-brass px-6 py-3 font-semibold text-primary-foreground">Check your own trip →</Link></div></>);
  },
  notFoundComponent: () => <PageHead kicker="404" title="Guide not found." />,
});
