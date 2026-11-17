import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { countries, covers, guideDocs, insurers } from "@/lib/atlas";
import { relatedFromGuide, relatedGuidesForCover } from "@/lib/related";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  INDEXING_BLOCKED,
  SITE_URL,
  coverDescription,
  coverGraph,
  coverTitle,
  faqEntities,
  guideDescription,
  guideGraph,
  guideTitle,
  homeGraph,
  isCoverIndexable,
  llmsTxt,
  pageDescription,
  pageTitle,
  robotsTxt,
  seo,
  sitemapEntries,
  sitemapXml,
} from "@/lib/site";

const titles = [
  HOME_TITLE,
  pageTitle("Coverage atlas"),
  pageTitle("Insurer and country pages"),
  pageTitle("Drive-abroad insurance guides"),
  pageTitle("Methodology"),
  pageTitle("Evidence register"),
  pageTitle("Change log"),
  pageTitle("Privacy"),
  pageTitle("Terms"),
  pageTitle("Editorial review"),
  ...Object.values(guideDocs).map((guide) => guideTitle(guide.title)),
  ...covers.map((cover) => {
    const insurer = insurers.find(
      (item) => item.id === cover.insurer && item.market === cover.market,
    );
    const destination = countries[cover.dest];
    if (!insurer || !destination) throw new Error(`Missing label for ${cover.slug}`);
    return coverTitle(insurer.name, destination.name);
  }),
];

const descriptions = [
  HOME_DESCRIPTION,
  ...Object.values(guideDocs).map((guide) => guideDescription(guide)),
  ...covers.map((cover) => {
    const insurer = insurers.find(
      (item) => item.id === cover.insurer && item.market === cover.market,
    );
    const destination = countries[cover.dest];
    if (!insurer || !destination) throw new Error(`Missing label for ${cover.slug}`);
    return coverDescription(insurer.name, destination.name);
  }),
];

describe("Search metadata", () => {
  it("keeps the legal-review indexing hold", () => {
    expect(INDEXING_BLOCKED).toBe(true);
    expect(seo(HOME_TITLE, HOME_DESCRIPTION, "/").meta).toContainEqual({
      name: "robots",
      content: "noindex, nofollow",
    });
    const robots = robotsTxt();
    expect(robots).toMatch(/^User-agent: \*$/m);
    expect(robots).toMatch(/^Disallow: \/$/m);
    expect(robots.split("\n").some((line) => line.startsWith("Allow:"))).toBe(false);
    expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
    expect(readFileSync("public/robots.txt", "utf8")).toBe(robots);
  });

  it("uses one production origin for canonical URLs", () => {
    expect(SITE_URL).toBe("https://bordercover.shop");
    const head = seo(HOME_TITLE, HOME_DESCRIPTION, "/");
    expect(head.links).toContainEqual({ rel: "canonical", href: "https://bordercover.shop/" });
    expect(head.meta).toContainEqual({ property: "og:url", content: "https://bordercover.shop/" });
    expect(head.meta).toContainEqual({
      property: "og:image",
      content: "https://bordercover.shop/og.jpg",
    });
    const nested = seo("Atlas", "Map", "/atlas");
    expect(nested.links[0]).toEqual({ rel: "canonical", href: "https://bordercover.shop/atlas" });
  });

  it("keeps titles and descriptions within search limits and unique", () => {
    expect(new Set(titles).size).toBe(titles.length);
    for (const title of titles) expect(title.length).toBeLessThanOrEqual(60);
    for (const description of descriptions) {
      expect(description.length).toBeGreaterThan(40);
      expect(description.length).toBeLessThanOrEqual(160);
    }
    expect(pageTitle("A".repeat(80)).length).toBeLessThanOrEqual(60);
    expect(pageDescription("word ".repeat(50)).length).toBeLessThanOrEqual(160);
  });

  it("lists launch-candidate URLs and withholds ineligible insurer pages", () => {
    const entries = sitemapEntries();
    const paths = entries.map((entry) => entry.path);
    expect(paths).toContain("/");
    expect(paths).toContain("/guides/uk-car-insurance-in-france");
    expect(paths).toContain("/methodology");
    expect(paths).not.toContain("/review");
    expect(paths.some((path) => path.startsWith("/cover/"))).toBe(false);
    expect(
      isCoverIndexable(covers.find((cover) => cover.slug === "aa-car-insurance-in-france")!),
    ).toBe(false);
    expect(readFileSync("public/sitemap.xml", "utf8")).toBe(sitemapXml());
    const xml = sitemapXml();
    expect(xml.startsWith("<?xml")).toBe(true);
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(xml.match(/<loc>/g)?.length).toBe(entries.length);
    expect(xml).toContain("<lastmod>2026-11-01</lastmod>");
    expect(xml).toContain("<lastmod>2026-10-30</lastmod>");
    expect(xml).not.toContain("localhost");
  });

  it("publishes an llms.txt summary from real pages", () => {
    const text = llmsTxt();
    expect(readFileSync("public/llms.txt", "utf8")).toBe(text);
    expect(text).toContain("https://bordercover.shop/methodology");
    expect(text).toContain("Disallow: /");
    expect(text).not.toContain("/review");
    for (const slug of Object.keys(guideDocs))
      expect(text).toContain(`https://bordercover.shop/guides/${slug}`);
  });

  it("builds JSON-LD from visible research content", () => {
    const home = JSON.parse(JSON.stringify(homeGraph())) as { "@graph": { "@type": string }[] };
    expect(home["@graph"].map((node) => node["@type"])).toEqual([
      "Organization",
      "WebSite",
      "WebApplication",
    ]);
    const guide = guideDocs["uk-car-insurance-in-france"];
    if (!guide) throw new Error("Missing France guide");
    const graph = JSON.parse(JSON.stringify(guideGraph("uk-car-insurance-in-france", guide))) as {
      "@graph": Record<string, unknown>[];
    };
    const serialized = JSON.stringify(graph);
    expect(serialized).not.toContain("aggregateRating");
    expect(serialized).not.toContain("HowTo");
    expect(serialized).not.toContain("price");
    const faqs = graph["@graph"].find((node) => node["@type"] === "FAQPage") as
      { mainEntity: { name: string; acceptedAnswer: { text: string } }[] } | undefined;
    expect(faqs?.mainEntity.length).toBeGreaterThan(0);
    const visible = guide.blocks.map((block) => block.x).join("\n");
    for (const faq of faqs?.mainEntity ?? []) {
      expect(visible).toContain(faq.name);
      expect(visible).toContain(faq.acceptedAnswer.text.split(" ").slice(0, 8).join(" "));
      expect(faqEntities(guide.blocks).some((entity) => entity["name"] === faq.name)).toBe(true);
    }
    const cover = coverGraph({
      insurer: "AA",
      destination: "France",
      slug: "aa-car-insurance-in-france",
      plans: [{ name: "Silver", label: "Published overseas cover" }],
    });
    expect(JSON.stringify(cover)).not.toContain("FAQPage");
    expect(JSON.stringify(cover)).toContain("Published overseas cover");
  });

  it("links guides and insurer pages that exist", () => {
    for (const link of relatedGuidesForCover("uk", "fr")) {
      expect(link.href.startsWith("/")).toBe(true);
      if (link.href.startsWith("/guides/"))
        expect(guideDocs[link.href.slice("/guides/".length)]).toBeTruthy();
    }
    expect(
      relatedFromGuide("uk-car-insurance-in-france").some(
        (link) => link.href === "/cover/aa-car-insurance-in-france",
      ),
    ).toBe(true);
    expect(
      relatedGuidesForCover("uk", "es").some(
        (link) => link.href === "/guides/uk-car-insurance-in-france",
      ),
    ).toBe(false);
  });

  it("ships a public IndexNow key and the branded share image", () => {
    const keys = readdirSync("public").filter((file) => /^[0-9a-f]{32}\.txt$/.test(file));
    expect(keys).toHaveLength(1);
    const filename = keys[0];
    if (!filename) throw new Error("Missing IndexNow key");
    expect(readFileSync(`public/${filename}`, "utf8").trim()).toBe(filename.replace(/\.txt$/, ""));
    const og = readFileSync("public/og.jpg");
    expect(og[0]).toBe(0xff);
    expect(og[1]).toBe(0xd8);
  });
});
