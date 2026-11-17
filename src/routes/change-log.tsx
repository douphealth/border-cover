import { createFileRoute } from "@tanstack/react-router";
import { PageHead, seo } from "@/components/Shell";
import { data } from "@/lib/atlas";

export const Route = createFileRoute("/change-log")({
  head: () => ({ meta: seo("Change log | BorderCover Atlas", "Dated record of every research dataset update to BorderCover Atlas.") }),
  component: () => (
    <>
      <PageHead kicker="Change log" title="What changed, and when." intro="Public research updates; software changes and automated source observations are not new human policy approval." />
      <ol className="mx-auto max-w-3xl space-y-6 border-l px-5 pl-8">
        <li className="text-sm"><div className="font-mono text-xs text-primary">2026-11-17 · research-preview safeguards</div><p className="mt-2 text-muted-foreground">Release 2.2 separates generic guidance from insurer research, suppresses unresolved allowance calculations, links recorded AA claims and requires independent evidence approval. No new human policy approvals are claimed.</p></li>
        {data.changeLog.map((c: any, i: number) => (
          <li key={i} className="relative"><span className="absolute -left-[2.35rem] top-1.5 h-3 w-3 rounded-full bg-brass" />
            <div className="font-mono text-xs text-primary">{c.date} · {c.type}</div><p className="mt-1 text-muted-foreground">{c.description}</p></li>
        ))}
      </ol>
    </>
  ),
});
