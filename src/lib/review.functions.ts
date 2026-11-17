import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sources } from "./atlas";
import { canIndependentlyApprove, publishedResearch } from "./provenance";

export const reportSchema = z.object({ ruleId: z.string().min(1).max(200), version: z.string().min(1).max(80), message: z.string().trim().min(10).max(2000), website: z.string().max(0).default(""), kind: z.enum(["correction", "insurer-request"]).default("correction") });

export const submitCorrection = createServerFn({ method: "POST" }).inputValidator(reportSchema).handler(async ({ data }) => {
  // Intentionally public, insert-only. No browser role has direct report-table access.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("correction_reports").insert({ rule_id: data.ruleId, rule_version: data.version, message: data.message, kind: data.kind });
  if (error) { console.error("Correction insert failed", error.code); return { ok: false }; }
  return { ok: true };
});

export const reviewQueue = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: permitted, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "reviewer" });
  if (error || !permitted) return { permitted: false, userId: context.userId, reports: [], reviews: [], observations: [], tasks: [] };
  const [reports, reviews, observations, tasks] = await Promise.all([
    context.supabase.from("correction_reports").select("id,rule_id,rule_version,message,status,created_at,kind").order("created_at", { ascending: false }).limit(100),
    context.supabase.from("evidence_reviews").select("*").order("created_at", { ascending: false }).limit(100),
    context.supabase.from("source_observations").select("*").order("observed_at", { ascending: false }).limit(100),
    context.supabase.from("review_tasks").select("*").order("created_at", { ascending: false }).limit(100),
  ]);
  if (reports.error || reviews.error || observations.error || tasks.error) throw new Error("Review records could not be loaded.");
  return { permitted: true, userId: context.userId, reports: reports.data ?? [], reviews: reviews.data ?? [], observations: observations.data ?? [], tasks: tasks.data ?? [] };
});

const reviewSchema = z.object({ sourceId: z.string().refine((id) => Boolean(sources[id])), ruleId: z.string().min(1).max(200), quotation: z.string().min(20).max(8000), section: z.string().min(1).max(500), edition: z.string().min(1).max(500), reviewer: z.string().min(2).max(120), due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), conflicts: z.string().max(2000).default("") });
export const saveReview = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(reviewSchema).handler(async ({ data, context }) => {
  const { data: permitted } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "reviewer" });
  if (!permitted) throw new Error("Reviewer access required.");
  const { error } = await context.supabase.from("evidence_reviews").insert({ source_id: data.sourceId, rule_id: data.ruleId, quotation: data.quotation, section: data.section, policy_edition: data.edition, reviewer_name: data.reviewer, review_due: data.due, conflicts: data.conflicts, created_by: context.userId });
  if (error) throw new Error("Review could not be saved.");
  return { ok: true };
});

export const approveReview = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.string().uuid() })).handler(async ({ data, context }) => {
  const { data: permitted } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "reviewer" });
  if (!permitted) throw new Error("Reviewer access required.");
  const { data: draft } = await context.supabase.from("evidence_reviews").select("created_by").eq("id", data.id).eq("status", "draft").maybeSingle();
  if (!draft || !canIndependentlyApprove(draft.created_by, context.userId, Boolean(permitted))) throw new Error("A different authorized reviewer must approve this draft.");
  const { data: rows, error } = await context.supabase.from("evidence_reviews").update({ status: "approved" }).eq("id", data.id).eq("status", "draft").select("id");
  if (error || !rows?.length) throw new Error("Draft could not be approved.");
  return { ok: true };
});

export const resolveCorrection = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.string().uuid() })).handler(async ({ data, context }) => {
  const { data: permitted } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "reviewer" });
  if (!permitted) throw new Error("Reviewer access required.");
  const { error } = await context.supabase.from("correction_reports").update({ status: "resolved" }).eq("id", data.id);
  if (error) throw new Error("Report could not be resolved.");
  return { ok: true };
});

export const publishedEvidence = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!key || !url) return [];
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  } } });
  const { data, error } = await client.from("approved_evidence").select("source_id,rule_id,quotation,section,policy_edition,reviewer_name,review_due,human_verified_at,conflicts").limit(500);
  if (error) return [];
  return data ?? [];
});
export const updateReviewTask = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.string().uuid(), action: z.enum(["claim", "resolve"]) })).handler(async ({ data, context }) => {
  const { data: permitted } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "reviewer" });
  if (!permitted) throw new Error("Reviewer access required.");
  let query = context.supabase.from("review_tasks").update(data.action === "claim" ? { assigned_to: context.userId } : { status: "resolved", resolved_at: new Date().toISOString() }).eq("id", data.id).eq("status", "open");
  query = data.action === "claim" ? query.is("assigned_to", null) : query.eq("assigned_to", context.userId);
  const { data: rows, error } = await query.select("id");
  if (error || !rows?.length) throw new Error("Claim this task before resolving it, or refresh its status.");
  return { ok: true };
});

export const exportApprovedResearch = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(z.object({ version: z.string().regex(/^atlas-rules-\d+\.\d+$/) })).handler(async ({ data, context }) => {
  const { data: permitted } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "reviewer" });
  if (!permitted) throw new Error("Reviewer access required.");
  const { data: rows, error } = await context.supabase.from("evidence_reviews").select("*").eq("status", "approved").gt("review_due", new Date().toISOString().slice(0,10));
  if (error) throw new Error("Approved evidence could not be exported.");
  const observations = [];
  const claims = [];
  for (const claim of publishedResearch.claims) {
    const matching = rows?.filter((r) => r.rule_id === claim.id && r.approved_by && r.approved_by !== r.created_by && !r.conflicts && r.human_verified_at) ?? [];
    if (!matching.length) continue;
    const ids = [];
    for (const row of matching) {
      const hash = async (id: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${data.version}:${id}`)))).map((b) => b.toString(16).padStart(2,"0")).join("");
      ids.push(row.id);
      observations.push({ id: row.id, sourceId: row.source_id, retrievedOn: row.created_at.slice(0,10), quotation: row.quotation, section: row.section, humanVerifiedOn: row.human_verified_at?.slice(0,10) ?? null, reviewer: row.reviewer_name, reviewDue: row.review_due, effectiveFrom: null, policyEdition: row.policy_edition, conflicts: [], authorId: await hash(row.created_by), approvedBy: await hash(row.approved_by ?? "") });
    }
    claims.push({ ...claim, observationIds: ids });
  }
  if (!claims.length) throw new Error("No current independently approved claims match the structured claim IDs. Export is blocked.");
  return { version: data.version, observations, claims };
});
