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
    { path: "/", title: "BorderCover Atlas", section: "Start here" },
  ];
}
