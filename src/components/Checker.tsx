import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, CalendarDays, Check, ExternalLink, FileText, Plus, ShieldCheck, X } from "lucide-react";
import { countries, data, evaluateRoute, flag, HOME_DEFAULT, insurersFor, markets, sources, STATUS } from "@/lib/atlas";
import { AtlasMap } from "./AtlasMap";

export function Checker() {
  const [market, setMarket] = useState("uk");
  const list = insurersFor(market);
  const [insurer, setInsurer] = useState(list[0].id);
  const ins = list.find((i) => i.id === insurer) ?? list[0];
  const [tier, setTier] = useState(ins.tiers[0].id);
  const [stops, setStops] = useState<string[]>([HOME_DEFAULT.uk]);
  const [days, setDays] = useState(14);
  const [used, setUsed] = useState(0);

  useEffect(() => { const l = insurersFor(market); setInsurer(l[0].id); setTier(l[0].tiers[0].id); setStops([(HOME_DEFAULT as any)[market]]); }, [market]);
  useEffect(() => { if (!ins.tiers.find((t: any) => t.id === tier)) setTier(ins.tiers[0].id); }, [insurer]); // eslint-disable-line

  const home = markets.find((m) => m.id === market)!.countryCode;
  const destOptions = Object.values(countries).filter((c: any) => c.code !== home && !(home === "gb" && c.code === "ni")).sort((a: any, b: any) => a.name.localeCompare(b.name));
  const r: any = useMemo(() => evaluateRoute({ market, insurer: ins.id, tier, stops, days, used }, data), [market, ins.id, tier, stops, days, used]);
  const toggleStop = (code: string) => setStops((s) => (s.includes(code) ? (s.length > 1 ? s.filter((x) => x !== code) : s) : s.length < 5 ? [...s, code] : s));
  const st = r.error ? null : STATUS[r.status];
  const cap = r.annual ?? r.perTrip ?? r.unspecified;
  const pct = cap ? Math.min(100, ((days + (r.annual ? used : 0)) / cap) * 100) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="space-y-6 self-start rounded-2xl glass p-6 shadow-float lg:sticky lg:top-20">
        <Field n="1" label="Where is your car insured?">
          <div className="grid grid-cols-3 gap-2">
            {markets.map((m) => (
              <button key={m.id} onClick={() => setMarket(m.id)} className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${market === m.id ? "border-primary bg-primary/15 text-foreground" : "text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>
                <span className="mr-1.5">{flag(m.countryCode)}</span>{m.id.toUpperCase()}
              </button>
            ))}
          </div>
        </Field>
        <Field n="2" label="Insurer and plan">
          <select value={ins.id} onChange={(e) => setInsurer(e.target.value)} className="w-full rounded-xl border bg-input/40 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring">
            {list.map((i) => <option key={i.id} value={i.id} className="bg-popover">{i.name}</option>)}
          </select>
          <div className="mt-2 flex flex-wrap gap-2">
            {ins.tiers.map((t: any) => (
              <button key={t.id} onClick={() => setTier(t.id)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${tier === t.id ? "border-accent bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t.name}</button>
            ))}
          </div>
          {ins.intro && <p className="mt-2 text-xs text-muted-foreground">{ins.intro}</p>}
        </Field>
        <Field n="3" label={`Countries on your route (${stops.length}/5)`}>
          <div className="flex flex-wrap gap-2">
            {stops.map((c) => (
              <span key={c} className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 py-1 pl-3 pr-1 text-sm">
                {flag(c)} {countries[c].name}
                <button aria-label={`Remove ${countries[c].name}`} onClick={() => toggleStop(c)} className="rounded-full p-1 hover:bg-primary/20"><X className="h-3 w-3" /></button>
              </span>
            ))}
            {stops.length < 5 && (
              <label className="relative flex items-center gap-1 rounded-full border border-dashed px-3 py-1 text-sm text-muted-foreground hover:text-foreground">
                <Plus className="h-3.5 w-3.5" /> Add country
                <select value="" onChange={(e) => e.target.value && toggleStop(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Add country">
                  <option value="">Add</option>
                  {destOptions.filter((c: any) => !stops.includes(c.code)).map((c: any) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </label>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Tip: click any dot on the map to add or remove it.</p>
        </Field>
        <Field n="4" label="Trip length & days already used this policy year">
          <Slider label="Trip days" value={days} set={setDays} max={180} />
          <Slider label="Days already used abroad" value={used} set={setUsed} max={180} min={0} />
        </Field>
      </div>

      <div className="space-y-6">
        {r.error ? <div className="rounded-2xl border border-destructive/40 p-6 text-destructive">{r.error}</div> : (
          <div key={JSON.stringify([market, ins.id, tier, stops, days, used])} className="animate-rise overflow-hidden rounded-2xl glass shadow-float">
            <div className="border-b p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${st!.tone}`}>
                    {r.status === "confirmed" ? <ShieldCheck className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}{st!.label}
                  </span>
                  <h3 className="mt-3 text-2xl leading-tight md:text-3xl">{r.label}</h3>
                </div>
                <div className="text-right font-mono text-xs text-muted-foreground">checked<br /><span className="text-foreground">{r.checkedOn}</span></div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.reason}</p>
              {cap ? (
                <div className="mt-5">
                  <div className="mb-1.5 flex justify-between text-xs"><span className="text-muted-foreground">{r.limitText}</span><span className="font-mono">{days + (r.annual ? used : 0)} / {cap} days</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full transition-all duration-700" style={{ width: pct + "%", background: pct >= 100 ? "var(--destructive)" : "var(--gradient-brass)" }} /></div>
                </div>
              ) : <p className="mt-4 font-mono text-xs text-muted-foreground">{r.limitText}</p>}
            </div>
            {r.stops?.length > 1 && (
              <div className="grid gap-2 border-b p-6 sm:grid-cols-2">
                {r.stops.map((s: any) => (
                  <div key={s.dest.code} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-sm">
                    <span>{flag(s.dest.code)} {s.dest.name}</span>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS[s.status].dot }} title={STATUS[s.status].label} />
                  </div>
                ))}
              </div>
            )}
            <div className="grid gap-6 p-6 md:grid-cols-2">
              <div>
                <h4 className="mb-2 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-primary"><FileText className="h-3.5 w-3.5" />Documents</h4>
                <p className="text-sm font-semibold">{r.green.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{r.green.detail}</p>
              </div>
              <div>
                <h4 className="mb-2 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-primary"><CalendarDays className="h-3.5 w-3.5" />Before you go</h4>
                <ul className="space-y-1.5 text-sm">
                  {r.actionList.slice(0, 5).map((a: string) => <li key={a} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" /><span className="text-muted-foreground">{a}</span></li>)}
                </ul>
              </div>
            </div>
            <div className="border-t bg-muted/40 p-6">
              <h4 className="mb-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Evidence · {r.confidence}</h4>
              <div className="flex flex-wrap gap-2">
                {r.sourceIds.filter((id: string) => sources[id]).map((id: string) => (
                  <a key={id} href={sources[id].url} target="_blank" rel="noreferrer" className="group flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs hover:border-primary">
                    {sources[id].publisher}<ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                  </a>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{r.disclosure} <Link to="/methodology" className="underline">How we assess</Link>.</p>
            </div>
          </div>
        )}
        <AtlasMap market={market} insurer={ins.id} tier={tier} days={days} selected={stops} onPick={toggleStop} />
      </div>
    </div>
  );
}

function Field({ n, label, children }: { n: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-brass font-mono text-xs font-bold text-primary-foreground">{n}</span><span className="text-sm font-semibold">{label}</span></div>
      {children}
    </div>
  );
}
function Slider({ label, value, set, max, min = 1 }: { label: string; value: number; set: (n: number) => void; max: number; min?: number }) {
  return (
    <label className="mb-3 block">
      <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>{label}</span><span className="font-mono text-foreground">{value}</span></div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => set(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
    </label>
  );
}
