import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sources } from "./atlas";

export const reportSchema = z.object({ ruleId: z.string().min(1).max(200), version: z.string().min(1).max(80), message: z.string().trim().min(10).max(2000), website: z.string().max(0).default("") });

export const submitCorrection = createServerFn({ method: "POST" }).inputValidator(reportSchema).handler(async ({ data }) => {
  // Intentionally public, insert-only. No browser role has direct report-table access.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("correction_reports").insert({ rule_id: data.ruleId, rule_version: data.version, message: data.message });
  if (error) { console.error("Correction insert failed", error.code); return { ok: false }; }
  return { ok: true };
});

export const reviewQueue = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: permitted, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "reviewer" });
  if (error || !permitted) return { permitted: false, reports: [], reviews: [], observations: [] };
  const [reports, reviews, observations] = await Promise.all([
    context.supabase.from("correction_reports").select("id,rule_id,rule_version,message,status,created_at").order("created_at", { ascending: false }).limit(100),
    context.supabase.from("evidence_reviews").select("*").order("created_at", { ascending: false }).limit(100),
    context.supabase.from("source_observations").select("*").order("observed_at", { ascending: false }).limit(100),
  ]);
  if (reports.error || reviews.error || observations.error) throw new Error("Review records could not be loaded.");
  return { permitted: true, reports: reports.data ?? [], reviews: reviews.data ?? [], observations: observations.data ?? [] };
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