import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { EvidenceDetails } from "@/components/EvidenceDetails";
import { ClaimEvidence } from "@/components/ClaimEvidence";
import { BenefitList } from "@/components/BenefitList";
import { ReportIssue } from "@/components/ReportIssue";
import { useState } from "react";
import { PageHead, seo } from "@/components/Shell";
import { countries, coverBySlug, covers, evaluateCover, flag, insurers, sources, STATUS } from "@/lib/atlas";
import { OfferSlot } from "@/components/OfferSlot";

export const Route = createFileRoute("/cover/$slug")({
  loader: ({ params }) => { const c = coverBySlug(params.slug); if (!c) throw notFound(); const ins = insurers.find((i) => i.id === c.insurer && i.market === c.market); if (!ins) throw notFound(); return { c, insName: ins.name, destName: countries[c.dest].name }; },
  head: ({ loaderData }) => ({ meta: loaderData ? seo(`Does ${loaderData.insName} car insurance cover ${loaderData.destName}? | BorderCover Atlas`, `${loaderData.insName} cover in ${loaderData.destName} by plan: cover level, day limits, Green Card rules and source links.`) : [{ title: "Page unavailable" }, { name: "robots", content: "noindex" }] }),
  component: CoverPage,
  notFoundComponent: () => <PageHead kicker="404" title="We don't have that pairing yet." />,
});

function CoverPage() {
  const { c, insName, destName } = Route.useLoaderData();
  const [days, setDays] = useState(14);
  const results = evaluateCover(c, days);
  const ins = insurers.find((i) => i.id === c.insurer && i.market === c.market);
  if (!ins || !results.length) return <PageHead kicker="Unavailable" title="This pairing needs review." />;
  const srcIds = [...new Set(results.flatMap((r: any) => r.sourceIds))] as string[];
  const related = covers.filter((x) => x.insurer === c.insurer && x.slug !== c.slug);
  return (
    <>
      <PageHead kicker={`${c.market.toUpperCase()} policy · ${flag(c.dest)} ${destName}`} title={`Does ${insName} cover you in ${destName}?`} intro={ins.intro} />
      <div className="mx-auto max-w-7xl space-y-8 px-5">
        <label className="flex max-w-md items-center gap-4 rounded-full glass px-5 py-3 text-sm text-muted-foreground">Trip length <input type="range" min={1} max={180} value={days} onChange={(e) => setDays(+e.target.value)} className="flex-1 accent-[var(--primary)]" /><span className="w-14 font-mono text-foreground">{days} days</span></label>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {results.map((r: any) => (
            <div key={r.tier.id} className="flex flex-col rounded-2xl glass p-6 shadow-float">
              <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-2xl">{r.tier.name}</h2><span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${STATUS[r.status].tone}`}>{STATUS[r.status].label}</span></div>
              <p className="mt-3 font-semibold">{r.label}</p>
              <p className="mt-2 text-sm text-muted-foreground">{r.reason}</p>
              <p className="mt-3 text-sm font-semibold">This does not confirm your personal cover. Policy edition unknown; claim review incomplete.</p><BenefitList benefits={r.benefits} /><ClaimEvidence claims={r.claims} /><ReportIssue ruleId={`${c.market}/${c.insurer}/${r.tier.id}/${c.dest}`} /><p className="mt-4 rounded-lg bg-muted px-3 py-2 font-mono text-xs">{r.limitText}</p>
              {r.extra?.length > 0 && <ul className="mt-3 space-y-1 text-xs text-muted-foreground">{r.extra.map((e: string) => <li key={e}>• {e}</li>)}</ul>}
            </div>
          ))}
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl glass p-6"><h3 className="text-xl">Documents at the border</h3><p className="mt-2 font-semibold">{results[0].green.title}</p><p className="mt-1 text-sm text-muted-foreground">{results[0].green.detail}</p></div>
          <div className="rounded-2xl glass p-6"><h3 className="text-xl">Three questions for {insName}</h3>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
              <li>Does my schedule and policy edition include {destName} at my plan level?</li>
              <li>How many days abroad have I used this policy year, and how many remain?</li>
              <li>What proof of insurance should I carry, and are breakdown and legal costs included?</li>
            </ol></div>
        </div>
        <div className="rounded-2xl glass p-6"><h3 className="text-xl">Evidence</h3>
          <div className="mt-4"><EvidenceDetails sourceIds={srcIds} /></div>
          <p className="mt-4 text-xs text-muted-foreground">{results[0].disclosure}</p>
        </div>
        {related.length > 0 && <div className="flex flex-wrap gap-2">{related.map((x) => <Link key={x.slug} to="/cover/$slug" params={{ slug: x.slug }} className="rounded-full border px-4 py-2 text-sm hover:border-primary">{flag(x.dest)} {insName} in {countries[x.dest].name}</Link>)}</div>}
      </div>
      <OfferSlot id="breakdown-cover" context={destName} />
    </>
  );
}
