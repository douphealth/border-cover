import { describe, expect, it } from "vitest";
import { reportSchema } from "@/lib/review.functions";
describe("Private corrections", () => {
  it("accepts a concrete bounded report", () => { expect(reportSchema.safeParse({ruleId:"uk/aa/silver/fr",version:"atlas-rules-2.1",message:"The policy edition reference needs checking.",website:""}).success).toBe(true); });
  it("rejects empty report text", () => { expect(reportSchema.safeParse({ruleId:"uk/aa/silver/fr",version:"atlas-rules-2.1",message:"",website:""}).success).toBe(false); });
  it("rejects oversized report text", () => { expect(reportSchema.safeParse({ruleId:"uk/aa/silver/fr",version:"atlas-rules-2.1",message:"x".repeat(2001),website:""}).success).toBe(false); });
});