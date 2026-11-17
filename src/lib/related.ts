import { countries, covers, guideDocs, insurers } from "@/lib/atlas";

const GUIDES_BY_COVER: Record<string, string[]> = {
  "uk:fr": ["uk-car-insurance-in-france", "uk-green-card-rules"],
  "uk:es": ["uk-green-card-rules"],
  "uk:ie": ["uk-car-insurance-in-ireland", "uk-green-card-rules"],
  "ie:fr": ["irish-car-insurance-in-france"],
  "ie:gb": ["ie-car-insurance-in-uk"],
  "us:ca": ["us-car-insurance-in-canada"],
  "us:mx": ["us-car-insurance-in-mexico"],
  "au:nz": ["australia-car-insurance-in-new-zealand"],
  "nz:au": ["new-zealand-car-insurance-in-australia"],
};

const COVER_BY_GUIDE: Record<string, string> = {
  "uk-car-insurance-in-france": "aa-car-insurance-in-france",
  "uk-car-insurance-in-ireland": "aa-car-insurance-in-ireland",
  "uk-green-card-rules": "aa-car-insurance-in-france",
  "ie-car-insurance-in-uk": "aviva-ie-car-insurance-in-united-kingdom",
  "irish-car-insurance-in-france": "aviva-ie-car-insurance-in-france",
  "us-car-insurance-in-canada": "progressive-car-insurance-in-canada",
  "us-car-insurance-in-mexico": "progressive-car-insurance-in-mexico",
  "australia-car-insurance-in-new-zealand": "racv-car-insurance-in-new-zealand",
  "new-zealand-car-insurance-in-australia": "ami-car-insurance-in-australia",
};

export type RelatedLink = { href: string; label: string };

function guideLink(slug: string): RelatedLink | undefined {
  const guide = guideDocs[slug];
  if (!guide) return undefined;
  return { href: `/guides/${slug}`, label: guide.title.replace(/\.$/, "") };
}

function coverLink(slug: string): RelatedLink | undefined {
  const cover = covers.find((item) => item.slug === slug);
  if (!cover) return undefined;
  const insurer = insurers.find(
    (item) => item.id === cover.insurer && item.market === cover.market,
  );
  const destination = countries[cover.dest];
  if (!insurer || !destination) return undefined;
  return { href: `/cover/${slug}`, label: `${insurer.name} in ${destination.name}` };
}

export function relatedGuidesForCover(market: string, destination: string): RelatedLink[] {
  const slugs =
    GUIDES_BY_COVER[`${market}:${destination}`] ?? (market === "uk" ? ["uk-green-card-rules"] : []);
  const links = slugs.flatMap((slug) => {
    const link = guideLink(slug);
    return link ? [link] : [];
  });
  links.push({ href: "/methodology", label: "Research methodology" });
  return links;
}

export function relatedFromGuide(slug: string): RelatedLink[] {
  const links: RelatedLink[] = [];
  const coverSlug = COVER_BY_GUIDE[slug];
  const cover = coverSlug ? coverLink(coverSlug) : undefined;
  if (cover) links.push(cover);
  if (slug.startsWith("uk-") && slug !== "uk-green-card-rules") {
    const greenCard = guideLink("uk-green-card-rules");
    if (greenCard) links.push(greenCard);
  }
  if (slug === "uk-green-card-rules") {
    for (const related of ["uk-car-insurance-in-france", "uk-car-insurance-in-ireland"]) {
      const link = guideLink(related);
      if (link) links.push(link);
    }
  }
  links.push(
    { href: "/methodology", label: "Research methodology" },
    { href: "/sources", label: "Evidence register" },
  );
  return links;
}
