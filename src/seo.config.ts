import { covers, countries, guideDocs, insurers } from "@/lib/atlas";
// Site-wide SEO settings used by src/lib/seo-edge.ts, /sitemap.xml and /llms.txt.
export type SeoPage = { path: string; title: string; section?: string; desc?: string; lastmod?: string };

export const SEO = {
  origin: "https://bordercover.shop",
  pagesDevHost: "border-cover.pages.dev",
  name: "BorderCover Atlas",
  description: "Research on published overseas motor insurance cover, trip allowances and transit-country conditions, with original evidence. Personal policy confirmation remains essential.",
  lang: "en",
  logo: "/favicon.svg" as string | undefined,
  sameAs: [] as string[],
  sectionNames: {} as Record<string, string>,
  keepTrailingSlash: false,
};

export const LLMS_NOTES: string[] = [
  "Research preview: confirm cover with your insurer before travel."
];

export function seoPages(): SeoPage[] {
  return [
    { path: "/", title: "BorderCover Atlas — Overseas car insurance research", section: "Start here" },
    { path: "/atlas", title: "Coverage Atlas — interactive map", section: "Start here" },
    { path: "/cover", title: "Insurer × country cover pages", section: "Start here" },
    { path: "/guides", title: "Driving abroad guides", section: "Guides" },
    { path: "/methodology", title: "Methodology", section: "About the research" },
    { path: "/sources", title: "Sources", section: "About the research" },
    { path: "/change-log", title: "Change log", section: "About the research" },
    ...Object.entries(guideDocs).map(([slug, g]) => ({ path: `/guides/${slug}`, title: g.title.replace(/\.$/, ""), section: "Guides", desc: g.description })),
    ...covers.map((c) => ({ path: `/cover/${c.slug}`, title: `Does ${insurers.find((i) => i.id === c.insurer && i.market === c.market)?.name ?? c.insurer} car insurance cover ${countries[c.dest]?.name ?? c.dest}?`, section: "Insurer cover pages" })),
  ];
}
