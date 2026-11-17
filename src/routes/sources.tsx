import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHead, seo } from "@/components/Shell";
import { EvidenceDetails } from "@/components/EvidenceDetails";
import { Button } from "@/components/ui/button";
import { sources } from "@/lib/atlas";
import { datasetStats, marketResearch } from "@/lib/evidence";
import { markets } from "@/lib/atlas";
import { publishedEvidence } from "@/lib/review.functions";

const evidenceOptions = queryOptions({ queryKey: ["approved-evidence"], queryFn: () => publishedEvidence() });
export const Route = createFileRoute("/sources")({ loader: ({ context }) => context.queryClient.ensureQueryData(evidenceOptions), head: () => ({ meta: seo("Evidence register | BorderCover Atlas", "Original documents, historical dates, exact observed quotations and separately approved editorial evidence.") }), component: SourcesPage });
function SourcesPage() {
  const all = Object.values(sources);
  const types = [...new Set(all.map((s) => s.recordType))];
  const [type, setType] = useState("all");
  const { data: approved } = useSuspenseQuery(evidenceOptions);
  return <><PageHead kicker={`${all.length} source records`} title="The evidence register." intro="Historical source records and automated observations are not fresh human verification." /><div className="mx-auto max-w-5xl space-y-6 px-5"><section className="border-b pb-6"><h2 className="text-xl font-semibold">Research inventory, not verified cover</h2><p className="mt-3 text-sm text-muted-foreground">{datasetStats.namedProfiles} named profiles + {datasetStats.fallbackProfiles} generic guidance profiles; {datasetStats.plans} tiers across both. {datasetStats.countries} countries include home markets; the checker excludes your home country. {datasetStats.listedJourneys} listed insurer/country pages are editorial selections, not all possible combinations.</p><div className="mt-4 space-y-2">{markets.map((m) => <p key={m.id} className="text-sm">{m.id.toUpperCase()} · {marketResearch(m.id).label} · {marketResearch(m.id).current}/{marketResearch(m.id).total} current claim records</p>)}</div></section><div className="flex flex-wrap gap-2">{["all", ...types].map((t) => <Button key={t} variant={type === t ? "default" : "outline"} onClick={() => setType(t)}>{t}</Button>)}</div><EvidenceDetails sourceIds={all.filter((s) => type === "all" || s.recordType === type).map((s) => s.id)} /><section className="border-t pt-6"><h2 className="text-xl font-semibold">Approved editorial revisions</h2>{!approved.length ? <p className="mt-3 text-sm text-muted-foreground">No named human approvals published yet.</p> : approved.map((a, i) => <div key={i} className="border-b py-4"><p className="text-sm font-semibold">{a.source_id} · {a.policy_edition}</p><blockquote className="my-2 text-sm">{a.quotation}</blockquote><p className="text-xs text-muted-foreground">{a.reviewer_name} · verified {a.human_verified_at} · review due {a.review_due}</p><p className="text-xs text-muted-foreground">{a.conflicts}</p></div>)}</section></div></>;
}