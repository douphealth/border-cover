import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { sources } from "@/lib/atlas";

export const Route = createFileRoute("/api/public/jobs/source-check")({ server: { handlers: { POST: async ({ request }) => {
  const failure = await authenticateCronRequest(request);
  if (failure) return failure;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // Only bundled publisher URLs are allowed. Do not follow redirects to arbitrary hosts.
  const candidates = Object.values(sources).filter((s) => s.liveMonitorAvailable);
  const checked = await Promise.all(candidates.map(async (source) => {
    let http_status: number | null = null, content_hash: string | null = null, outcome = "unavailable";
    try {
      const response = await fetch(source.url, { redirect: "manual", signal: AbortSignal.timeout(5000), headers: { Accept: "text/html" } });
      http_status = response.status;
      if (response.ok) {
        const reader = response.body?.getReader();
        let size = 0; const chunks: Uint8Array[] = [];
        if (reader) { while (true) { const part = await reader.read(); if (part.done) break; size += part.value.length; if (size > 1000000) { await reader.cancel(); throw new Error("Source too large"); } chunks.push(part.value); } }
        const buffer = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
        const digest = await crypto.subtle.digest("SHA-256", buffer);
        content_hash = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2,"0")).join("");
        const { data: previous } = await supabaseAdmin.from("source_observations").select("content_hash").eq("source_id", source.id).not("content_hash","is",null).order("observed_at", { ascending: false }).limit(1);
        outcome = previous?.[0]?.content_hash && previous[0].content_hash !== content_hash ? "changed-review-required" : "retrieved-not-human-verified";
      } else outcome = response.status >= 300 && response.status < 400 ? "redirect-manual-review" : "broken-or-blocked";
    } catch { outcome = "unavailable-manual-review"; }
    const { error } = await supabaseAdmin.from("source_observations").insert({ source_id: source.id, http_status, content_hash, outcome });
    return { sourceId: source.id, outcome: error ? "observation-save-failed" : outcome };
  }));
  return Response.json({ checked }, { headers: { "Cache-Control": "no-store" } });
} } } });