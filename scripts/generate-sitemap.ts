import { writeFile } from "node:fs/promises";
import { llmsTxt, robotsTxt, SITE_URL, sitemapEntries, sitemapXml } from "../src/lib/site.ts";

await writeFile("public/sitemap.xml", sitemapXml());
await writeFile("public/robots.txt", robotsTxt());
await writeFile("public/llms.txt", llmsTxt());
const eligibleCovers = sitemapEntries().filter((entry) => entry.path.startsWith("/cover/")).length;
console.log(
  `${sitemapEntries().length} sitemap URLs for ${SITE_URL} (${eligibleCovers} insurer-country pages). Robots still disallow crawling pending legal review.`,
);
