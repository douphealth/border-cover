import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AtlasMap } from "@/components/AtlasMap";
import { PageHead, seo } from "@/components/Shell";
import { flag, insurersFor, markets } from "@/lib/atlas";

export const Route = createFileRoute("/atlas")({
  head: () => ({ meta: seo("Coverage Atlas — Interactive map | BorderCover Atlas", "Explore every destination on an interactive map, coloured by what your insurer and plan publish for driving abroad.") }),
  component: AtlasPage,
});

function AtlasPage() {
  const [market, setMarket] = useState("uk");
  const list = insurersFor(market);
  const [insurer, setInsurer] = useState(list[0].id);
  const ins = list.find((i) => i.id === insurer) ?? list[0];
  const [tier, setTier] = useState(ins.tiers[0].id);
  const t = ins.tiers.find((x: any) => x.id === tier) ? tier : ins.tiers[0].id;
  const [days, setDays] = useState(14);
  return (
    <>
      <PageHead kicker="Interactive atlas" title="See your cover, country by country." intro="Every line is a published answer. Hover a destination for detail; change plan or trip length and watch the map redraw." />
      <div className="mx-auto max-w-7xl space-y-5 px-5">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl glass p-4">
          {markets.map((m) => (
            <button key={m.id} onClick={() => { setMarket(m.id); const l = insurersFor(m.id); setInsurer(l[0].id); setTier(l[0].tiers[0].id); }} className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${market === m.id ? "border-primary bg-primary/15" : "text-muted-foreground"}`}>{flag(m.countryCode)} {m.id.toUpperCase()}</button>
          ))}
          <select value={ins.id} onChange={(e) => setInsurer(e.target.value)} className="rounded-full border bg-input/40 px-4 py-1.5 text-sm">
            {list.map((i) => <option key={i.id} value={i.id} className="bg-popover">{i.name}</option>)}
          </select>
          <div className="flex gap-1">{ins.tiers.map((x: any) => <button key={x.id} onClick={() => setTier(x.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${t === x.id ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>{x.name}</button>)}</div>
          <label className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">Trip <input type="range" min={1} max={180} value={days} onChange={(e) => setDays(+e.target.value)} className="accent-[var(--primary)]" /><span className="w-14 font-mono text-foreground">{days} d</span></label>
        </div>
        <AtlasMap key={market} market={market} insurer={ins.id} tier={t} days={days} />
      </div>
    </>
  );
}
