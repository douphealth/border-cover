import { describe, expect, it } from "vitest";
import policies from "@/data/policies.json";
import evidence from "@/data/evidence.json";
import covers from "@/data/cover-pages.json";
import { evaluate, evaluateRoute, tripDates } from "@/lib/engine";
import { datasetStats, eligibleCountries } from "@/lib/evidence";
import { defaultScenario, parseScenario, scenarioHash } from "@/lib/scenario";

const aa = (tier = "silver", days = 14, used: number | null = 0, destination = "fr") => evaluate({ market: "uk", insurer: "aa", tier, days, used, destination }, policies);
describe("Published allowances and unresolved inputs", () => {
  it("AA Silver has 30 policy-year days and 16 remain after 14 + 0", () => { const r = aa(); expect(r.annual).toBe(30); expect(r.remainingAfterTrip).toBe(16); });
  it("Silver exact allowance is accepted but 31 days loses enhanced cover", () => { expect(aa("silver",30).status).toBe("confirmed"); expect(aa("silver",31).status).toBe("limited"); expect(aa("silver",31).level).toBe("minimum"); });
  it("Gold publishes 90 days with a 90/91 boundary", () => { expect(aa("gold",90).annual).toBe(90); expect(aa("gold",90).status).toBe("confirmed"); expect(aa("gold",91).status).toBe("limited"); });
  it("Platinum publishes 90 days with a 90/91 boundary", () => { expect(aa("platinum",90).annual).toBe(90); expect(aa("platinum",90).status).toBe("confirmed"); expect(aa("platinum",91).status).toBe("limited"); });
  it("previous usage consumes the same allowance", () => { expect(aa("silver",14,16).remainingAfterTrip).toBe(0); expect(aa("silver",14,17).exceeded).toBe(true); });
  it("exhausted allowance does not fabricate an uninsured verdict", () => { expect(aa("silver",1,30).status).toBe("limited"); expect(aa("silver",1,30).benefits.liability.state).toBe("published"); });
  it("Ireland is outside AA's foreign-use annual allowance", () => { expect(aa("silver",180,90,"ie").annual).toBeNull(); expect(aa("silver",180,90,"ie").status).toBe("confirmed"); });
  it("unknown previous usage cannot yield a positive annual assessment", () => { expect(aa("silver",14,null).status).toBe("needs-check"); expect(aa("silver",14,null).remainingAfterTrip).toBeNull(); });
  it("unresearched insurer evidence is not an invented exclusion", () => { const r = evaluate({ market:"au", insurer:"other-au", tier:"unknown",destination:"fr",days:14,used:0 },policies); expect(r.error).toBeUndefined(); expect(r.status).toBe("needs-check"); expect(r.benefits.liability.state).toBe("not-researched"); });
  it("AMI published territorial exclusion stays explicit", () => { const ins = policies.insurers.find((i) => i.id === "ami"); const r = evaluate({market:"nz",insurer:"ami",tier:ins?.tiers[0].id,destination:"au",days:14,used:0},policies); expect(r.status).toBe("not-covered"); });
  it("a route counts trip days once while reporting every stop", () => { const r = evaluateRoute({market:"uk",insurer:"aa",tier:"silver",days:14,used:0,stops:["fr","be"]},policies); expect(r.stops).toHaveLength(2); expect(r.remainingAfterTrip).toBe(16); expect(r.stops.map((s) => s.dest.code)).toEqual(["fr","be"]); });
  it("unresolved transit country prevents a positive route", () => { expect(evaluateRoute({market:"uk",insurer:"aa",tier:"silver",days:14,used:0,stops:["fr","us"]},policies).status).toBe("needs-check"); });
  it("date counts include departure and return", () => { expect(tripDates({departure:"2026-12-01",returnDate:"2026-12-14"}).days).toBe(14); });
  it("renewal crossings require confirmation without automatic reset", () => { const r = evaluate({market:"uk",insurer:"aa",tier:"silver",destination:"fr",days:14,used:0,departure:"2026-12-01",returnDate:"2026-12-14",renewal:"2026-12-10"},policies); expect(r.crossesRenewal).toBe(true); expect(r.status).toBe("needs-check"); });
  it("renewal on departure is not an in-trip transition", () => { expect(tripDates({departure:"2026-12-01",returnDate:"2026-12-14",renewal:"2026-12-01"}).crossesRenewal).toBe(false); });
  it("invalid calendar dates fail", () => { expect(tripDates({departure:"2026-02-30",returnDate:"2026-03-01"}).error).toBeDefined(); });
  it("negative prior usage fails", () => { expect(aa("silver",14,-1).error).toBeDefined(); });
});
describe("Dataset integrity and sharing", () => {
  it("counts distinguish 24 named and 6 generic profiles", () => { expect(datasetStats.namedProfiles).toBe(24); expect(datasetStats.fallbackProfiles).toBe(6); expect(datasetStats.countries).toBe(58); expect(eligibleCountries("uk")).toHaveLength(56); });
  it("all listed cover pages resolve an insurer and destination", () => { for (const c of covers) { expect(policies.insurers.some((i) => i.id===c.insurer && i.market===c.market)).toBe(true); expect(Object.keys(policies.countries)).toContain(c.dest); } });
  it("every insurer source resolves", () => { for (const i of policies.insurers) for (const id of i.sourceIds) expect(Object.keys(policies.sources)).toContain(id); });
  it("observed AA claims match the rule data", () => { for (const c of evidence.claims.filter((c) => c.rule==="annual")) { expect(aa(c.tier).annual).toBe(c.value); } });
  it("share link preserves exact scenario including unknown usage", () => { const s = {...defaultScenario,used:null,stops:["fr","be"]}; expect(parseScenario(scenarioHash(s))).toEqual(s); });
  it("invalid shared inputs are rejected", () => { expect(parseScenario('#trip='+encodeURIComponent(JSON.stringify({...defaultScenario,days:-1})))).toBeNull(); });
});