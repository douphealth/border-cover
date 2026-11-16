import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHead, seo } from "@/components/Shell";
import { countries, covers, flag, insurers, markets } from "@/lib/atlas";

export const Route = createFileRoute("/cover/")({
  head: () => ({ meta: seo("Insurer × country cover pages | BorderCover Atlas", "Tier-by-tier research pages for named insurers and popular driving destinations, each linked to source evidence.") }),
  component: CoverIndex,
});

function CoverIndex() {
  const [m, setM] = useState("all");
  const [q, setQ] = useState("");
  const list = covers.filter((c) => (m === "all" || c.market === m) && (insurers.find((i) => i.id === c.insurer)!.name + countries[c.dest].name).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHead kicker={`${covers.length} research pages`} title="Your insurer. Your destination." intro="Choose a pairing for a full tier-by-tier breakdown of published cover." />
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-6 flex flex-wrap gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search insurer or country…" className="min-w-60 flex-1 rounded-full border bg-input/40 px-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          {["all", ...markets.map((x) => x.id)].map((id) => <button key={id} onClick={() => setM(id)} className={`rounded-full border px-4 py-2 text-sm font-semibold uppercase ${m === id ? "border-primary bg-primary/15" : "text-muted-foreground"}`}>{id}</button>)}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => {
            const ins = insurers.find((i) => i.id === c.insurer && i.market === c.market)!;
            return (
              <Link key={c.slug} to="/cover/$slug" params={{ slug: c.slug }} className="group flex items-center justify-between rounded-xl glass p-5 transition hover:border-primary/50">
                <div><div className="text-xs uppercase tracking-wider text-muted-foreground">{c.market.toUpperCase()} policy</div><div className="mt-1 font-display text-xl">{ins.name} <span className="text-muted-foreground">in</span> {countries[c.dest].name}</div></div>
                <span className="text-3xl transition group-hover:scale-125">{flag(c.dest)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
