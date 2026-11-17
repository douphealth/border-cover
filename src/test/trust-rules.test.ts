import { describe, expect, it } from "vitest";
import policies from "@/data/policies.json";
import evidence from "@/data/evidence.json";
import { evaluate, evaluateRoute } from "@/lib/engine";
import { canIndependentlyApprove, evidenceSchema, observationState, publishedResearch } from "@/lib/provenance";
import { defaultScenario, parseScenario, scenarioHash } from "@/lib/scenario";
import { isIndexEligible } from "@/lib/evidence";

describe("Uncertainty and provenance boundaries", () => {
  for (const i of policies.insurers.filter((i) => i.id.startsWith("other-"))) it(`${i.market} generic profile cannot identify insurer-specific cover`, () => {
    const r = evaluate({ market: i.market, insurer: i.id, tier: i.tiers[0].id, destination: "fr", days: 14, used: 0 }, policies);
    expect(r.status).toBe("needs-check"); expect(r.annual).toBeNull(); expect(r.benefits.liability.state).toBe("not-researched"); expect(r.benefits.ownCar.state).toBe("not-researched");
  });
  it("unknown previous usage returns no remaining calculation", () => { const r = evaluateRoute({ ...defaultScenario, used: null }, policies); expect(r.remaining).toBeNull(); expect(r.remainingAfterTrip).toBeNull(); });
  it("renewal crossing returns no definitive unused allowance", () => { const r = evaluateRoute({ ...defaultScenario, departure: "2026-12-01", returnDate: "2026-12-14", renewal: "2026-12-10" }, policies); expect(r.remaining).toBeNull(); expect(r.remainingAfterTrip).toBeNull(); expect(r.status).toBe("needs-check"); });
  it("Silver allowance minus one is within the published cap", () => { expect(evaluateRoute({ ...defaultScenario, days: 29 }, policies).status).toBe("confirmed"); });
  it("unsupported tiers fail validation", () => { expect(evaluateRoute({ ...defaultScenario, tier: "invented" }, policies).error).toBeDefined(); });
  it("missing claim observations block publication", () => { expect(evidenceSchema.safeParse({ ...evidence, claims: [{ ...evidence.claims[0], observationIds: [] }] }).success).toBe(false); });
  it("duplicate claim IDs fail validation", () => { expect(evidenceSchema.safeParse({ ...evidence, claims: [evidence.claims[0], evidence.claims[0]] }).success).toBe(false); });
  it("invalid evidence calendar dates fail validation", () => { expect(evidenceSchema.safeParse({ ...evidence, observations: [{ ...evidence.observations[0], retrievedOn: "2026-02-30" }] }).success).toBe(false); });
  const reviewed = { ...publishedResearch.observations[0], humanVerifiedOn: "2026-11-17", reviewer: "Example reviewer", policyEdition: "Example edition", reviewDue: "2026-12-01", authorId: "author", approvedBy: "approver" };
  it("material conflict is retained even with review attribution", () => { expect(observationState({ ...reviewed, conflicts: ["Different territorial clause"] }, "2026-11-17")).toBe("conflicting"); });
  it("review due today is overdue", () => { expect(observationState(reviewed, "2026-12-01")).toBe("overdue"); });
  it("unavailable source is not current research", () => { expect(observationState({ ...reviewed, availability: "unavailable" }, "2026-11-17")).toBe("unavailable"); });
  it("self approval is forbidden", () => { expect(canIndependentlyApprove("author", "author", true)).toBe(false); });
  it("independent approval requires reviewer permission", () => { expect(canIndependentlyApprove("author", "approver", false)).toBe(false); expect(canIndependentlyApprove("author", "approver", true)).toBe(true); });
  it("partial AA allowance evidence cannot qualify a full page for indexing", () => { expect(isIndexEligible("aa", "silver", "fr", "2026-11-17")).toBe(false); });
  it("new share links pin their research release", () => { expect(parseScenario(scenarioHash(defaultScenario))?.releaseId).toBe("atlas-rules-2.2"); });
  it("unavailable historical release never replays against new rules", () => { expect(parseScenario(`#trip=${encodeURIComponent(JSON.stringify({ ...defaultScenario, releaseId: "atlas-rules-2.1" }))}`)).toBeNull(); });
});