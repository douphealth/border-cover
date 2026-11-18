// Partner / affiliate slots. A slot stays invisible until its url is set.
// Add your tracking link to "url" (and the programme name to "partner"), commit, push: Cloudflare deploys it.
// Per-item links (e.g. one product page per device) go in OFFER_LINKS keyed by item slug; they override the slot url.
export type OfferSlotId = "breakdown-cover";
export type OfferSlot = { heading: string; body: string; cta: string; url: string; partner: string };

export const OFFER_SLOTS: Record<OfferSlotId, OfferSlot> = {
  "breakdown-cover": { heading: "European breakdown cover for {context}", body: "Breakdown cover is separate from motor insurance. Check the policy lists {context} and covers your trip length.", cta: "Compare breakdown cover", url: "", partner: "" },
};

export const OFFER_LINKS: Record<string, string> = {};
