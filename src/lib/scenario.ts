import { z } from "zod";
import { data, evaluateRoute } from "./atlas";
import { RELEASE_ID } from "./provenance";

export const scenarioSchema = z.object({
  market: z.string(), insurer: z.string(), tier: z.string(),
  stops: z.array(z.string()).min(1).max(5),
  days: z.number().int().min(1).max(180), used: z.number().int().min(0).max(180).nullable(),
  departure: z.string().default(""), returnDate: z.string().default(""), renewal: z.string().default(""),
  releaseId: z.string().default(RELEASE_ID).refine((v) => v === RELEASE_ID, "This historical research release is unavailable; it cannot be replayed against current rules."),
}).superRefine((s, ctx) => {
  const r = evaluateRoute(s, data);
  if (r.error) ctx.addIssue({ code: "custom", message: r.error });
});
export type Scenario = z.infer<typeof scenarioSchema>;
export const defaultScenario: Scenario = { market: "uk", insurer: "aa", tier: "silver", stops: ["fr"], days: 14, used: 0, departure: "", returnDate: "", renewal: "", releaseId: RELEASE_ID };

export function parseScenario(hash: string): Scenario | null {
  try {
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const raw = params.get("trip");
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || typeof value.releaseId !== "string") return null;
    const parsed = scenarioSchema.safeParse(value);
    return parsed.success ? parsed.data : null;
  } catch { return null; }
}

export function scenarioHash(s: Scenario) {
  return `#${new URLSearchParams({ trip: JSON.stringify(scenarioSchema.parse(s)) }).toString()}`;
}