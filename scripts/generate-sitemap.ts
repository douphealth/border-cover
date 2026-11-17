import { writeFile } from "node:fs/promises";
import { covers, insurers } from "../src/lib/atlas";
import { isIndexEligible } from "../src/lib/evidence";

const origin = process.env["PUBLIC_SITE_ORIGIN"];
if (!origin || !/^https:\/\//.test(origin) || /localhost|id-preview--/.test(origin)) throw new Error("Provide the verified production HTTPS origin; previews must not be indexed.");
const base = new URL(origin).origin;
const urls = covers.filter((c) => {
  const insurer = insurers.find((i) => i.id === c.insurer && i.market === c.market);
  return insurer?.tiers.every((t: { id: string }) => isIndexEligible(c.insurer, t.id, c.dest));
}).map((c) => `${base}/cover/${c.slug}`);
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${url.replaceAll("&", "&amp;")}</loc></url>`).join("")}</urlset>\n`;
await writeFile("public/sitemap.xml", xml);
console.log(`${urls.length} eligible research pages written. Robots and canonical metadata require a separate launch review.`);