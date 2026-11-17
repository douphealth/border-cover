import { z } from "zod";
import evidence from "@/data/evidence.json";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((v) => { const t = Date.parse(`${v}T00:00:00Z`); return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === v; });
const observation = z.object({ id: z.string().min(1), sourceId: z.string().min(1), retrievedOn: date, quotation: z.string().min(20), section: z.string().min(1), humanVerifiedOn: date.nullable(), reviewer: z.string().min(2).nullable(), reviewDue: date.nullable(), effectiveFrom: date.nullable(), policyEdition: z.string().min(1).nullable(), conflicts: z.array(z.string()), approvedBy: z.string().nullable().optional(), authorId: z.string().nullable().optional(), availability: z.enum(["available", "unavailable"]).optional() });
const claim = z.object({ id: z.string().min(1), market: z.string().min(1), insurer: z.string().min(1), product: z.string().min(1), tier: z.string().min(1), destinationScope: z.string().min(1), rule: z.string().min(1), value: z.union([z.number(), z.boolean(), z.string()]), observationIds: z.array(z.string()).min(1) });
export const evidenceSchema = z.object({ version: z.string().min(1), observations: z.array(observation), claims: z.array(claim) }).superRefine((v, ctx) => {
  for (const rows of [v.observations, v.claims]) if (new Set(rows.map((r) => r.id)).size !== rows.length) ctx.addIssue({ code: "custom", message: "Duplicate evidence IDs" });
  for (const c of v.claims) for (const id of c.observationIds) if (!v.observations.some((o) => o.id === id)) ctx.addIssue({ code: "custom", message: `Missing observation ${id}` });
});
export type Observation = z.infer<typeof observation>;
export const publishedResearch = evidenceSchema.parse(evidence);
export const RELEASE_ID = publishedResearch.version;
export function observationState(o: Observation, today: string) {
  if (o.conflicts.length) return "conflicting";
  if (o.availability === "unavailable") return "unavailable";
  if (!o.humanVerifiedOn || !o.reviewer || !o.policyEdition || !o.reviewDue || !o.approvedBy || !o.authorId || o.authorId === o.approvedBy) return "unreviewed";
  if (o.reviewDue <= today) return "overdue";
  return "current";
}
export function claimEvidence(market: string, insurer: string, tier: string, destination: string, destinations: string[], today: string) {
  return publishedResearch.claims.filter((c) => c.market === market && c.insurer === insurer && (c.tier === "all" || c.tier === tier) && (c.destinationScope === destination || (c.destinationScope === "verifiedDestinationsExceptIreland" && destination !== "ie" && destinations.includes(destination))))
    .map((c) => ({ ...c, observations: c.observationIds.flatMap((id) => { const o = publishedResearch.observations.find((o) => o.id === id); return o ? [{ ...o, state: observationState(o, today) }] : []; }) }));
}
export function canIndependentlyApprove(author: string, approver: string, permitted: boolean) { return permitted && author.length > 0 && approver.length > 0 && author !== approver; }