import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AtlasMap } from "@/components/AtlasMap";
import { JsonLd } from "@/components/JsonLd";
import { PageHead } from "@/components/Shell";
import { flag, insurersFor, markets } from "@/lib/atlas";
import { pageDescription, pageGraph, pageTitle, seo, staticTrail } from "@/lib/site";

const title = "See your cover, country by country.";
const description = pageDescription(
  "Published policy terms and unresolved conditions. Your policy documents determine personal cover.",
);
const trail = staticTrail("Atlas", "/atlas");

export const Route = createFileRoute("/atlas")({
  head: () => seo(pageTitle("Coverage atlas"), description, "/atlas"),
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
  const [used, setUsed] = useState<number | null>(0);
  return (
    <>
      <JsonLd data={pageGraph(title, description, "/atlas", trail)} />
      <PageHead
        kicker="Interactive atlas"
        title={title}
        intro={description}
        crumbs={trail.crumbs}
      />
      <div className="mx-auto max-w-7xl space-y-5 px-5">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl glass p-4">
          {markets.map((m) => (
            <Button
              variant="outline"
              key={m.id}
              onClick={() => {
                setMarket(m.id);
                const l = insurersFor(m.id);
                setInsurer(l[0].id);
                setTier(l[0].tiers[0].id);
              }}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${market === m.id ? "border-primary bg-primary/15" : "text-muted-foreground"}`}
            >
              {flag(m.countryCode)} {m.id.toUpperCase()}
            </Button>
          ))}
          <select
            value={ins.id}
            onChange={(e) => setInsurer(e.target.value)}
            className="rounded-full border bg-input/40 px-4 py-1.5 text-sm"
          >
            {list.map((i) => (
              <option key={i.id} value={i.id} className="bg-popover">
                {i.name}
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            {ins.tiers.map((x: any) => (
              <Button
                variant="outline"
                key={x.id}
                onClick={() => setTier(x.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${t === x.id ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
              >
                {x.name}
              </Button>
            ))}
          </div>
          <label className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
            Trip{" "}
            <input
              type="range"
              min={1}
              max={180}
              value={days}
              onChange={(e) => setDays(+e.target.value)}
              className="accent-[var(--primary)]"
            />
            <span className="w-14 font-mono text-foreground">{days} d</span>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm">
            Days already used abroad
            <Input
              aria-label="Days already used abroad"
              type="number"
              min={0}
              max={180}
              value={used ?? ""}
              disabled={used === null}
              onChange={(e) => setUsed(+e.target.value)}
            />
          </label>
          <label className="text-sm">
            <input
              type="checkbox"
              checked={used === null}
              onChange={(e) => setUsed(e.target.checked ? null : 0)}
            />{" "}
            Previous usage unknown
          </label>
        </div>
        <AtlasMap used={used} key={market} market={market} insurer={ins.id} tier={t} days={days} />
      </div>
    </>
  );
}
