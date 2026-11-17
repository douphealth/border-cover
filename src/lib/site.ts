import {
  data,
  type Block,
  type CoverPage,
  type Doc,
  covers,
  countries,
  guideDocs,
  insurers,
} from "@/lib/atlas";
import { isIndexEligible } from "@/lib/evidence";
import { previewSafeguardNote } from "@/lib/release-notes";

/**
 * Production origin. Override at build time with VITE_SITE_URL, SITE_URL or PUBLIC_SITE_ORIGIN.
 * Canonicals always use this origin, including on preview hosts.
 */
export const DEFAULT_SITE_URL = "https://bordercover.shop";

/**
 * Public launch is blocked pending qualified legal review (roadmap).
 * While this is true, every page sends noindex and robots.txt disallows all crawlers.
 * Set it to false only after that review; insurer-country pages still need isCoverIndexable.
 */
export const INDEXING_BLOCKED = true;

export const OG_IMAGE_PATH = "/og.jpg";
export const OG_IMAGE_ALT = "A silver car on a winding Mediterranean coastal road";

export const HOME_TITLE = "BorderCover Atlas — Overseas car insurance research";
export const HOME_DESCRIPTION =
  "Compare published overseas motor cover, trip allowances, transit-country conditions and original evidence. Personal policy confirmation remains essential.";

const BRAND = "BorderCover Atlas";
const MONTHS: Record<string, string> = {
  January: "01",
  February: "02",
  March: "03",
  April: "04",
  May: "05",
  June: "06",
  July: "07",
  August: "08",
  September: "09",
  October: "10",
  November: "11",
  December: "12",
};

export function siteOrigin(raw: string): string {
  const trimmed = raw.trim();
  const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  if (url.protocol !== "https:" && url.protocol !== "http:")
    throw new Error("SITE_URL must use http or https");
  return url.origin;
}

function readBuildEnv(name: string): string | undefined {
  const value = (import.meta.env as unknown as Record<string, string | undefined>)[name];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export const SITE_URL = siteOrigin(
  readBuildEnv("VITE_SITE_URL") ||
    readBuildEnv("SITE_URL") ||
    readBuildEnv("PUBLIC_SITE_ORIGIN") ||
    DEFAULT_SITE_URL,
);

export function absoluteUrl(path: string, origin = SITE_URL): string {
  if (path === "/") return `${origin}/`;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function robotsContent(indexable: boolean): string {
  if (INDEXING_BLOCKED || !indexable) return "noindex, nofollow";
  return "index, follow";
}

export function pageTitle(specific: string): string {
  const clean = specific.replace(/\s+/g, " ").trim().replace(/\.$/, "");
  if (clean.length <= 60 && (clean.startsWith(BRAND) || clean.includes(`| ${BRAND}`))) return clean;
  const branded = `${clean} | ${BRAND}`;
  if (branded.length <= 60) return branded;
  if (clean.length <= 60) return clean;
  const sliced = clean.slice(0, 60);
  const word = sliced.replace(/\s+\S*$/, "").trimEnd();
  return word.length >= 24 ? word : sliced.trimEnd();
}

export function pageDescription(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 160) return clean;
  const sliced = clean.slice(0, 160);
  const word = sliced.replace(/\s+\S*$/, "").trimEnd();
  return word.length >= 80 ? word : sliced.trimEnd();
}

export function coverTitle(insurer: string, destination: string): string {
  return pageTitle(`${insurer} in ${destination}`);
}

export function coverDescription(insurer: string, destination: string): string {
  return pageDescription(
    `${insurer} in ${destination}: published plan terms, day limits, border documents and source links. This does not confirm personal cover.`,
  );
}

export function guideTitle(title: string): string {
  return pageTitle(title);
}

export function guideDescription(doc: Doc): string {
  return pageDescription(doc.description || doc.blocks[0]?.x || "");
}

type SeoOptions = {
  indexable?: boolean;
  type?: "website" | "article";
};

export function seo(title: string, description: string, path: string, options?: SeoOptions) {
  const indexable = options?.indexable ?? true;
  const url = absoluteUrl(path);
  const image = absoluteUrl(OG_IMAGE_PATH);
  const meta = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: options?.type ?? "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: OG_IMAGE_ALT },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "robots", content: robotsContent(indexable) },
  ];
  return { meta, links: [{ rel: "canonical", href: url }] };
}

export function unavailableHead(title: string, description: string) {
  return {
    meta: [
      { title: pageTitle(title) },
      { name: "description", content: pageDescription(description) },
      { name: "robots", content: "noindex, nofollow" },
    ],
  };
}

export function isCoverIndexable(cover: CoverPage): boolean {
  const insurer = insurers.find(
    (item) => item.id === cover.insurer && item.market === cover.market,
  );
  if (!insurer || !countries[cover.dest]) return false;
  return insurer.tiers.every((tier: { id: string }) =>
    isIndexEligible(cover.insurer, tier.id, cover.dest),
  );
}

export type Crumb = { href: string; label: string };

export function pageTrail(items: Crumb[]) {
  return {
    crumbs: items,
    node: breadcrumbNode(items.map((item) => ({ name: item.label, path: item.href }))),
  };
}

export function staticTrail(label: string, path: string) {
  return pageTrail([
    { href: "/", label: "Home" },
    { href: path, label },
  ]);
}

export function guideCrumbs(slug: string, title: string) {
  return pageTrail([
    { href: "/", label: "Home" },
    { href: "/guides", label: "Guides" },
    { href: `/guides/${slug}`, label: title },
  ]);
}

export function coverCrumbs(insurer: string, destination: string, slug: string) {
  return pageTrail([
    { href: "/", label: "Home" },
    { href: "/cover", label: "Insurer pages" },
    { href: `/cover/${slug}`, label: `${insurer} in ${destination}` },
  ]);
}

export function researchCheckedDate(blocks: { x: string }[]): string | undefined {
  for (const block of blocks) {
    const match = block.x.match(/checked (\d{1,2}) ([A-Za-z]+) (\d{4})/);
    if (!match) continue;
    const month = MONTHS[match[2] ?? ""];
    const day = match[1];
    const year = match[3];
    if (!month || !day || !year) continue;
    return `${year}-${month}-${day.padStart(2, "0")}`;
  }
  return undefined;
}

export function faqEntities(blocks: Block[]) {
  const entities: Record<string, unknown>[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (!block || (block.t !== "h2" && block.t !== "h3") || !block.x.trim().endsWith("?")) continue;
    const parts: string[] = [];
    for (let j = i + 1; j < blocks.length; j++) {
      const next = blocks[j];
      if (!next || next.t === "h2" || next.t === "h3") break;
      if (next.t === "p" || next.t === "li") parts.push(next.x);
    }
    if (!parts.length) continue;
    entities.push({
      "@type": "Question",
      name: block.x,
      acceptedAnswer: { "@type": "Answer", text: parts.join(" ") },
    });
  }
  return entities;
}

export function organizationNode() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND,
    url: `${SITE_URL}/`,
    description:
      "An independent, source-backed research tool for driving your own car abroad. We don't sell, quote or bind insurance.",
    logo: `${SITE_URL}/favicon.svg`,
  };
}

export function jsonLd(nodes: Record<string, unknown>[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

function breadcrumbNode(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function webPageNode(name: string, description: string, path: string) {
  return {
    "@type": "WebPage",
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: "en",
  };
}

export function itemListNode(
  name: string,
  items: { name: string; path?: string; description?: string }[],
) {
  return {
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path ? { url: absoluteUrl(item.path) } : {}),
      ...(item.description ? { description: item.description } : {}),
    })),
  };
}

export function homeGraph() {
  return jsonLd([
    organizationNode(),
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: BRAND,
      url: `${SITE_URL}/`,
      description: HOME_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en",
    },
    {
      "@type": "WebApplication",
      name: BRAND,
      url: `${SITE_URL}/`,
      applicationCategory: "ReferenceApplication",
      operatingSystem: "Web",
      description: HOME_DESCRIPTION,
    },
  ]);
}

export function pageGraph(
  name: string,
  description: string,
  path: string,
  trail: ReturnType<typeof pageTrail>,
  extra: Record<string, unknown>[] = [],
) {
  return jsonLd([organizationNode(), webPageNode(name, description, path), trail.node, ...extra]);
}

export function guideGraph(slug: string, doc: Doc) {
  const path = `/guides/${slug}`;
  const description = guideDescription(doc);
  const checked = researchCheckedDate(doc.blocks);
  const faqs = faqEntities(doc.blocks);
  const article: Record<string, unknown> = {
    "@type": "Article",
    headline: doc.title,
    description,
    mainEntityOfPage: absoluteUrl(path),
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}/#organization` },
    ...(checked ? { dateModified: checked } : {}),
  };
  const nodes: Record<string, unknown>[] = [
    organizationNode(),
    article,
    guideCrumbs(slug, doc.title).node,
  ];
  if (faqs.length) nodes.push({ "@type": "FAQPage", mainEntity: faqs });
  return jsonLd(nodes);
}

export function coverGraph(args: {
  insurer: string;
  destination: string;
  slug: string;
  plans: { name: string; label: string }[];
}) {
  const path = `/cover/${args.slug}`;
  return jsonLd([
    organizationNode(),
    webPageNode(
      `Does ${args.insurer} cover you in ${args.destination}?`,
      coverDescription(args.insurer, args.destination),
      path,
    ),
    coverCrumbs(args.insurer, args.destination, args.slug).node,
    itemListNode(
      `${args.insurer} plans for ${args.destination}`,
      args.plans.map((plan) => ({ name: plan.name, description: plan.label })),
    ),
  ]);
}

export type SitemapEntry = { path: string; lastmod?: string };

function entry(path: string, lastmod: string | undefined): SitemapEntry {
  return lastmod ? { path, lastmod } : { path };
}

export function sitemapEntries(): SitemapEntry[] {
  const datasetDate = String(data.checkedOn);
  const guideDates = Object.values(guideDocs)
    .map((doc) => researchCheckedDate(doc.blocks))
    .filter((date): date is string => Boolean(date))
    .sort();
  const changeDates = [
    previewSafeguardNote.date,
    ...(data.changeLog as { date: string }[]).map((item) => item.date),
  ].sort();
  const entries: SitemapEntry[] = [
    entry("/", datasetDate),
    entry("/atlas", datasetDate),
    entry("/cover", datasetDate),
    entry("/guides", guideDates.at(-1)),
    entry("/methodology", datasetDate),
    entry("/sources", datasetDate),
    entry("/change-log", changeDates.at(-1)),
    entry("/privacy", undefined),
    entry("/terms", undefined),
  ];
  for (const slug of Object.keys(guideDocs).sort()) {
    const doc = guideDocs[slug];
    if (!doc) continue;
    entries.push(entry(`/guides/${slug}`, researchCheckedDate(doc.blocks)));
  }
  for (const cover of [...covers].sort((a, b) => a.slug.localeCompare(b.slug))) {
    if (isCoverIndexable(cover)) entries.push(entry(`/cover/${cover.slug}`, datasetDate));
  }
  return entries;
}

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function sitemapXml(origin = SITE_URL): string {
  const urls = sitemapEntries()
    .map((item) => {
      const loc = absoluteUrl(item.path, origin);
      const lastmod = item.lastmod ? `<lastmod>${item.lastmod}</lastmod>` : "";
      return `<url><loc>${xmlEscape(loc)}</loc>${lastmod}</url>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Indexing hold: robots.txt disallows crawling and pages send noindex until qualified legal review. Do not submit this sitemap until that hold is lifted. Insurer-country URLs are included only when every plan passes claim-level indexing eligibility. -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`;
}

export function robotsTxt(origin = SITE_URL): string {
  return [
    "# Indexing hold: public launch is blocked pending qualified legal review.",
    "# User-agent: * also covers GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot,",
    "# ClaudeBot, Google-Extended, Applebot-Extended and Bingbot. They stay disallowed",
    "# until that review is complete. Do not switch this file to Allow before then.",
    "User-agent: *",
    "Disallow: /",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
}

export function llmsTxt(origin = SITE_URL): string {
  const guides = Object.entries(guideDocs)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([slug, doc]) =>
        `- [${doc.title.replace(/\.$/, "")}](${absoluteUrl(`/guides/${slug}`, origin)}): ${doc.description}`,
    );
  return [
    "# BorderCover Atlas",
    "",
    "> An independent, source-backed research tool for driving your own car abroad. It does not sell, quote or bind insurance. Personal policy confirmation remains essential.",
    "",
    "Public crawling is disallowed until qualified legal review. robots.txt uses `Disallow: /` for every user agent, and HTML pages send `noindex`.",
    "",
    "## Key pages",
    "",
    `- [Checker](${absoluteUrl("/", origin)}): ${HOME_DESCRIPTION}`,
    `- [Atlas](${absoluteUrl("/atlas", origin)}): Published policy terms and unresolved conditions, country by country.`,
    `- [Insurer pages](${absoluteUrl("/cover", origin)}): Tier-by-tier research pages for named insurers and driving destinations.`,
    `- [Guides](${absoluteUrl("/guides", origin)}): Plain-English guides to Green Cards, Mexican liability, Ireland–UK driving and more.`,
    `- [Methodology](${absoluteUrl("/methodology", origin)}): How published wording is compared, and what a result does not confirm.`,
    `- [Evidence register](${absoluteUrl("/sources", origin)}): Original documents, observed quotations and separately approved editorial evidence.`,
    `- [Change log](${absoluteUrl("/change-log", origin)}): Dated record of research dataset updates.`,
    `- [Privacy](${absoluteUrl("/privacy", origin)}): How trip selections, fragment links, correction reports and reviewer accounts are handled.`,
    `- [Terms](${absoluteUrl("/terms", origin)}): Limitations of the research and the need to confirm a personal policy.`,
    "",
    "## Guides",
    "",
    ...guides,
    "",
    "## Limits",
    "",
    "Coverage statements describe published insurer and government documents. They are not a quotation, a certificate of insurance, or legal advice. Insurer-country URLs stay out of the sitemap until every plan on the page passes claim-level indexing eligibility. The private editorial workspace is not listed.",
    "",
  ].join("\n");
}
