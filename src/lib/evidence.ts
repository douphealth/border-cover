import evidence from "@/data/evidence.json";
import { data, covers, countries, insurers, markets, sources } from "./atlas";

export const RULE_VERSION = evidence.version;
export const datasetStats = {
  markets: markets.length,
  namedProfiles: insurers.filter((i) => !i.id.startsWith("other-")).length,
  fallbackProfiles: insurers.filter((i) => i.id.startsWith("other-")).length,
  plans: insurers.reduce((n, i) => n + i.tiers.length, 0),
  countries: Object.keys(countries).length,
  sources: Object.keys(sources).length,
  listedJourneys: covers.length,
};

export function eligibleCountries(market: string) {
  const home = markets.find((m) => m.id === market)?.countryCode;
  return Object.values(countries).filter((c) => c.code !== home && !(home === "gb" && c.code === "ni")).sort((a, b) => a.name.localeCompare(b.name));
}

export function observationsFor(sourceId: string) {
  return evidence.observations.filter((o) => o.sourceId === sourceId);
}

export function claimsFor(insurer: string, tier: string, destination: string) {
  const profile = insurers.find((i) => i.id === insurer);
  return evidence.claims.filter((c) => c.insurer === insurer && (c.tier === "all" || c.tier === tier) &&
    (c.destinationScope === destination || (c.destinationScope === "verifiedDestinationsExceptIreland" && destination !== "ie" && profile?.verifiedDestinations?.includes(destination))));
}

// Eligibility is deliberately strict: an imported date is not named human approval.
export function isIndexEligible(insurer: string, tier: string, destination: string) {
  const claims = claimsFor(insurer, tier, destination);
  return claims.length > 0 && claims.every((c) => c.observationIds.every((id) => {
    const o = evidence.observations.find((x) => x.id === id);
    return Boolean(o?.humanVerifiedOn && o?.reviewer && o?.policyEdition);
  }));
}

export function reviewGaps() {
  return Object.values(sources).map((s) => ({
    sourceId: s.id, title: s.title, url: s.url, recordedOn: s.checkedOn,
    edition: s.documentEdition ?? null,
    quotations: observationsFor(s.id).length,
    humanVerifiedOn: null,
    issues: ["Named editorial review required", ...(!s.documentEdition ? ["Policy edition not recorded"] : []), ...(!observationsFor(s.id).length ? ["Supporting quotation missing"] : [])],
  }));
}

export const datasetRelease = data.checkedOn;