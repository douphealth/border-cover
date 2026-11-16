import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { PageHead, seo } from "@/components/Shell";
import { sources } from "@/lib/atlas";

export const Route = createFileRoute("/sources")({
  head: () => ({ meta: seo("Evidence register — all sources | BorderCover Atlas", "Every insurer and government document behind BorderCover Atlas, with publisher, finding and date checked.") }),
  component: SourcesPage,
});

function SourcesPage() {
  const all = Object.values(sources) as any[];
  const types = [...new Set(all.map((s) => s.recordType))];
  const [t, setT] = useState("all");
  return (
    <>
      <PageHead kicker={`${all.length} records`} title="The evidence register." intro="Every verdict traces back to one of these documents." />
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-5 flex flex-wrap gap-2">{["all", ...types].map((x) => <button key={x} onClick={() => setT(x)} className={`rounded-full border px-4 py-1.5 text-sm ${t === x ? "border-primary bg-primary/15" : "text-muted-foreground"}`}>{x}</button>)}</div>
        <div className="overflow-hidden rounded-2xl glass">
          {all.filter((s) => t === "all" || s.recordType === t).map((s) => (
            <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="grid gap-2 border-b p-5 transition last:border-0 hover:bg-muted/50 md:grid-cols-[1fr_2fr_auto]">
              <div><div className="text-xs text-muted-foreground">{s.publisher}</div><div className="flex items-center gap-1.5 font-semibold">{s.title}<ExternalLink className="h-3.5 w-3.5 opacity-50" /></div></div>
              <p className="text-sm text-muted-foreground">{s.finding}</p>
              <span className="font-mono text-xs text-muted-foreground">{s.checkedOn}</span>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
