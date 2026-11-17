import { ExternalLink, FileSearch } from "lucide-react";
import { sources } from "@/lib/atlas";
import { observationsFor } from "@/lib/evidence";

export function EvidenceDetails({ sourceIds }: { sourceIds: string[] }) {
  return <div className="space-y-3">{sourceIds.filter((id) => sources[id]).map((id) => {
    const s = sources[id];
    const observations = observationsFor(id);
    return <details key={id} className="evidence-detail rounded-lg border bg-card">
      <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 text-sm font-semibold"><span className="flex items-center gap-2"><FileSearch className="h-4 w-4 shrink-0 text-primary" />{s.publisher}</span><span className="text-xs font-normal text-muted-foreground">Recorded {s.checkedOn}</span></summary>
      <div className="space-y-3 border-t p-4 text-sm">
        <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-primary underline underline-offset-4">{s.title}<ExternalLink className="h-4 w-4 shrink-0" /></a>
        <p className="text-muted-foreground">{s.finding}</p>
        <dl className="grid gap-2 text-xs sm:grid-cols-2"><div><dt className="text-muted-foreground">Policy edition / section</dt><dd>{s.documentEdition ?? "Not recorded"}</dd></div><div><dt className="text-muted-foreground">Human verification / reviewer</dt><dd>Not established from imported records</dd></div><div><dt className="text-muted-foreground">Next editorial review</dt><dd>Not assigned</dd></div><div><dt className="text-muted-foreground">Legacy review note</dt><dd>{s.reviewType ?? "Not recorded"}</dd></div></dl>
        {observations.length ? observations.map((o) => <div key={o.id} className="border-l-2 border-primary pl-3"><blockquote className="leading-relaxed">“{o.quotation}”</blockquote><p className="mt-2 text-xs text-muted-foreground">{o.section} · retrieved {o.retrievedOn}. Automated observation, not human verification.</p></div>) : <p className="text-xs text-warn">Supporting quotation not yet recorded. Review the original document.</p>}
      </div>
    </details>;
  })}</div>;
}