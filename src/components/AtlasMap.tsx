import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { eligibleCountries } from "@/lib/evidence";
import { COORDS, countries, data, evaluate, flag, STATUS } from "@/lib/atlas";

const VIEWS = {
  world: { lon: [-170, 180], lat: [-50, 72] },
  europe: { lon: [-25, 50], lat: [30, 68] },
} as const;

type Props = { market: string; insurer: string; tier: string; days: number; used?: number | null; departure?: string; returnDate?: string; renewal?: string; onPick?: (code: string) => void; selected?: string[] };

export function AtlasMap({ market, insurer, tier, days, used = 0, departure = "", returnDate = "", renewal = "", onPick, selected = [] }: Props) {
  const defaultView = market === "uk" || market === "ie" ? "europe" : "world";
  const [view, setView] = useState<keyof typeof VIEWS>(defaultView);
  const [hover, setHover] = useState<string | null>(null);
  const W = 1000, H = 560;
  const v = VIEWS[view];
  const proj = ([lon, lat]: [number, number]) => [((lon - v.lon[0]) / (v.lon[1] - v.lon[0])) * W, ((v.lat[1] - lat) / (v.lat[1] - v.lat[0])) * H] as [number, number];
  const home = data.markets.find((m: any) => m.id === market)?.countryCode;
  const results = useMemo(() => {
    const out: Record<string, any> = {};
    for (const code of Object.keys(countries)) {
      if (code === home || (home === "gb" && code === "ni")) continue;
      const r = evaluate({ market, insurer, tier, destination: code, days, used, departure, returnDate, renewal }, data);
      if (!("error" in r)) out[code] = r;
    }
    return out;
  }, [market, insurer, tier, days, used, departure, returnDate, renewal, home]);
  const counts = Object.values(results).reduce((a: any, r: any) => ((a[r.status] = (a[r.status] || 0) + 1), a), {});
  const [hx, hy] = proj(COORDS[home] ?? [0, 0]);
  const hv = hover ? results[hover] : null;

  return (
    <div className="relative overflow-hidden rounded-lg border bg-card">
      <p className="border-b px-5 py-3 text-xs text-muted-foreground">{Object.keys(results).length} eligible international destinations. Domestic destinations excluded. Counts include countries outside the current map view.</p>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
        <div className="flex gap-1 rounded-full bg-muted p-1 text-xs font-semibold">
          {(["europe", "world"] as const).map((k) => (
            <Button variant="ghost" size="sm" key={k} onClick={() => setView(k)} className={`rounded-full px-3 py-1.5 capitalize transition ${view === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{k}</Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {Object.entries(STATUS).filter(([k]) => counts[k]).map(([k, s]: [string, any]) => (
            <span key={k} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: s.dot }} />{s.label} <b className="font-mono text-foreground">{counts[k]}</b></span>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full grid-paper" role="img" aria-label="Map of destinations coloured by cover status">
        {Array.from({ length: 13 }).map((_, i) => <line key={"v" + i} x1={(i * W) / 12} x2={(i * W) / 12} y1={0} y2={H} stroke="var(--grid)" />)}
        {Object.entries(results).map(([code, r]: any) => {
          const c = COORDS[code]; if (!c) return null;
          const [x, y] = proj(c); if (x < -20 || x > W + 20 || y < -20 || y > H + 20) return null;
          const mx = (hx + x) / 2, my = Math.min(hy, y) - Math.abs(x - hx) * 0.18 - 10;
          const active = hover === code || selected.includes(code);
          return <path key={view + market + insurer + tier + code} d={`M${hx},${hy} Q${mx},${my} ${x},${y}`} fill="none" stroke={STATUS[r.status].dot} strokeOpacity={active ? 0.95 : 0.22} strokeWidth={active ? 2 : 1} className="route-line" />;
        })}
        {Object.entries(results).map(([code, r]: any) => {
          const c = COORDS[code]; if (!c) return null;
          const [x, y] = proj(c); if (x < -20 || x > W + 20 || y < -20 || y > H + 20) return null;
          const sel = selected.includes(code);
          return (
            <g key={code} role={onPick ? "button" : undefined} tabIndex={0} aria-label={`${countries[code].name}: ${STATUS[r.status].label}`} onFocus={() => setHover(code)} onBlur={() => setHover(null)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick?.(code); } }} className="cursor-pointer" onMouseEnter={() => setHover(code)} onMouseLeave={() => setHover(null)} onClick={() => onPick?.(code)}>
              <circle cx={x} cy={y} r={14} fill="transparent" />
              {sel && <circle cx={x} cy={y} r={9} fill="none" stroke="var(--primary)" strokeWidth={2} />}
              <circle cx={x} cy={y} r={hover === code ? 7 : 4.5} fill={STATUS[r.status].dot} stroke="var(--background)" strokeWidth={1.5} style={{ transition: "r .2s" }} />
            </g>
          );
        })}
        <circle cx={hx} cy={hy} r={4} fill="var(--primary)" className="pulse-ring" />
        <circle cx={hx} cy={hy} r={6} fill="var(--primary)" stroke="var(--background)" strokeWidth={2} />
      </svg>
      <details className="border-t p-4"><summary className="cursor-pointer text-sm font-semibold">All destination results</summary><div className="mt-3 grid max-h-80 gap-1 overflow-y-auto sm:grid-cols-2">{eligibleCountries(market).map((c) => <Button key={c.code} variant="ghost" className="h-auto min-h-10 justify-between gap-2 whitespace-normal text-left text-xs" onClick={() => onPick?.(c.code)}><span>{flag(c.code)} {c.name}</span><span>{results[c.code] ? STATUS[results[c.code].status].label : "Invalid scenario"}</span></Button>)}</div></details>
      {hv && (
        <div className="pointer-events-none absolute bottom-4 left-4 max-w-xs rounded-xl glass p-4 text-sm shadow-float animate-rise">
          <div className="font-display text-lg">{flag(hv.dest.code)} {hv.dest.name}</div>
          <div className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS[hv.status].tone}`}>{STATUS[hv.status].label}</div>
          <p className="mt-2 text-xs text-muted-foreground">{hv.limitText}</p>
          <p className="mt-1 text-xs text-muted-foreground">{hv.green.title}</p>
        </div>
      )}
    </div>
  );
}
