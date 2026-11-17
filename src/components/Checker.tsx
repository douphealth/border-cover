import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Check, ChevronDown, MapPin, Printer, Search, Share2, ShieldCheck, X } from "lucide-react";
import { countries, data, evaluateRoute, flag, HOME_DEFAULT, insurersFor, markets, STATUS } from "@/lib/atlas";
import { eligibleCountries, RULE_VERSION } from "@/lib/evidence";
import { defaultScenario, parseScenario, scenarioHash, type Scenario } from "@/lib/scenario";
import { AtlasMap } from "./AtlasMap";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { BenefitList } from "./BenefitList";
import { EvidenceDetails } from "./EvidenceDetails";
import { ReportIssue } from "./ReportIssue";

export function Checker() {
  const [scenario, setScenario] = useState<Scenario>(defaultScenario);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState("");
  const [printedOn, setPrintedOn] = useState("");
  useEffect(() => {
    const restore = () => { const s = parseScenario(window.location.hash); if (s) setScenario(s); else if (window.location.hash.includes("trip=")) setNotice("This trip link is invalid. Default selections are shown."); };
    restore(); window.addEventListener("hashchange", restore);
    return () => window.removeEventListener("hashchange", restore);
  }, []);
  const { market, insurer, tier, stops, days, used } = scenario;
  const list = insurersFor(market);
  const ins = list.find((i) => i.id === insurer) ?? list[0];
  const patch = (value: Partial<Scenario>) => setScenario((s) => ({ ...s, ...value }));
  const r: any = useMemo(() => evaluateRoute(scenario, data), [scenario]);
  const toggleStop = (code: string) => setScenario((s) => ({ ...s, stops: s.stops.includes(code) ? s.stops.length > 1 ? s.stops.filter((c) => c !== code) : s.stops : s.stops.length < 5 ? [...s.stops, code] : s.stops }));
  const options = eligibleCountries(market).filter((c) => !stops.includes(c.code) && c.name.toLowerCase().includes(query.toLowerCase()));
  const status = !r.error ? STATUS[r.status] : null;
  const changeMarket = (m: string) => {
    const first = insurersFor(m)[0];
    if (!first) return;
    patch({ market: m, insurer: first.id, tier: first.tiers[0].id, stops: [HOME_DEFAULT[m as keyof typeof HOME_DEFAULT]] });
  };
  return <div className="grid items-start gap-8 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
    <aside className="no-print space-y-7 lg:sticky lg:top-24">
      <Field n="01" label="Where is your car insured?">
        <div className="grid grid-cols-3 gap-2">{markets.map((m) => <Button key={m.id} variant={market === m.id ? "default" : "outline"} aria-pressed={market === m.id} onClick={() => changeMarket(m.id)}>{flag(m.countryCode)} {m.id.toUpperCase()}</Button>)}</div>
        <p className="mt-2 text-xs text-muted-foreground">Research preview · published terms, not personal approval.</p>
      </Field>
      <Field n="02" label="Insurer and plan">
        <label htmlFor="insurer" className="sr-only">Insurer</label><select id="insurer" value={ins.id} onChange={(e) => { const next = list.find((i) => i.id === e.target.value); if (next) patch({ insurer: next.id, tier: next.tiers[0].id }); }} className="h-11 w-full rounded-md border bg-card px-3 text-sm">{list.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select>
        <div className="mt-3 flex flex-wrap gap-2">{ins.tiers.map((t: any) => <Button key={t.id} size="sm" variant={tier === t.id ? "secondary" : "outline"} aria-pressed={tier === t.id} className={tier === t.id ? "border border-primary" : ""} onClick={() => patch({ tier: t.id })}>{tier === t.id && <Check />}{t.name}</Button>)}</div>
      </Field>
      <Field n="03" label={`Destination & transit countries · ${stops.length}/5`}>
        <div className="flex flex-wrap gap-2">{stops.map((c) => <span key={c} className="flex items-center gap-2 rounded-md border bg-card py-1 pl-3 text-sm">{flag(c)} {countries[c].name}<Button size="icon" variant="ghost" disabled={stops.length === 1} aria-label={`Remove ${countries[c].name}`} onClick={() => toggleStop(c)}><X /></Button></span>)}</div>
        {stops.length < 5 && <Button variant="outline" className="mt-3 w-full justify-between" onClick={() => setAdding(!adding)} aria-expanded={adding}><span className="flex items-center gap-2"><MapPin />Add country</span><ChevronDown /></Button>}
        {adding && stops.length < 5 && <div className="mt-2 rounded-md border bg-card p-2"><label className="relative block"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input autoFocus aria-label="Search countries" placeholder="Search country…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" /></label><div className="mt-2 max-h-48 overflow-y-auto">{options.map((c) => <Button key={c.code} variant="ghost" className="w-full justify-start" onClick={() => { toggleStop(c.code); setAdding(false); setQuery(""); }}>{flag(c.code)} {c.name}</Button>)}{!options.length && <p className="p-2 text-sm text-muted-foreground">No matching countries.</p>}</div></div>}
      </Field>
      <Field n="04" label="Trip duration & policy-year usage">
        <NumberRange label="Trip days" value={days} onChange={(days) => patch({ days, departure: "", returnDate: "", renewal: "" })} min={1} />
        <label className="mb-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={used === null} onChange={(e) => patch({ used: e.target.checked ? null : 0 })} />Previous days abroad are unknown</label>
        {used !== null && <NumberRange label="Days already used abroad" value={used} min={0} onChange={(used) => patch({ used })} />}
        <details className="mt-4 border-t pt-3"><summary className="cursor-pointer text-sm font-semibold">Travel dates & renewal</summary><div className="mt-3 grid gap-3">{([['departure', 'Departure date'], ['returnDate', 'Return date'], ['renewal', 'Policy renewal date']] as const).map(([key, label]) => <label key={key} className="text-xs text-muted-foreground">{label}<Input className="mt-1" type="date" value={scenario[key]} onChange={(e) => patch({ [key]: e.target.value })} /></label>)}<p className="text-xs text-muted-foreground">Both departure and return days count. No renewal reset is assumed without policy wording.</p><Button size="sm" variant="ghost" onClick={() => patch({ departure: "", returnDate: "", renewal: "" })}>Clear dates</Button></div></details>
      </Field>
    </aside>
    <div className="min-w-0 space-y-6 print-result">
      {r.error ? <div role="alert" className="rounded-lg border border-destructive p-6 text-destructive">{r.error}</div> : <section className="result-summary rounded-lg border bg-card shadow-float">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-medium text-muted-foreground">{stops.map((c) => countries[c].name).join(' → ')} · {ins.name} {r.tier.name}</p><span className={`mt-3 inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-semibold ${status.tone}`}>{r.status === "confirmed" ? <ShieldCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}{status.label}</span></div><div className="no-print flex gap-1"><Button variant="ghost" size="icon" title="Share trip" aria-label="Share trip" onClick={async () => { const url = `${window.location.origin}/${scenarioHash(scenario)}`; try { await navigator.clipboard.writeText(url); setNotice("Trip link copied. Anyone with it can read these selections."); } catch { setNotice(url); } }}><Share2 /></Button><Button variant="ghost" size="icon" title="Print checklist" aria-label="Print checklist" onClick={() => { setPrintedOn(new Date().toISOString().slice(0,10)); setTimeout(() => window.print(), 100); }}><Printer /></Button></div></div>
          <h2 className="mt-4 text-2xl font-semibold leading-snug sm:text-3xl">{r.annual !== null ? `Published equivalent cover: up to ${r.annual} days per policy year` : r.label}</h2>
          {r.annual !== null && <div className="mt-5 grid gap-4 border-y py-4 sm:grid-cols-2"><div><p className="text-xs text-muted-foreground">Your entered usage</p><p className="mt-1 font-semibold">{r.days} trip days + {used === null ? "unknown" : used} previously used</p></div><div><p className="text-xs text-muted-foreground">Remaining after this trip</p><p className={`mt-1 font-semibold ${r.exceeded ? "text-warn" : "text-primary"}`}>{r.crossesRenewal ? "Renewal counting needs confirmation" : r.remainingAfterTrip === null ? "Cannot calculate without previous usage" : `${r.remainingAfterTrip} days${r.exceeded ? " · enhanced allowance exceeded" : ""}`}</p></div></div>}
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{r.reason}</p>
          <p className="mt-3 text-sm font-semibold">Personal cover still depends on your policy documents.</p>
          <p className="mt-2 text-xs text-muted-foreground">{r.limitText}</p>
          {!!r.extra?.length && <ul className="mt-4 space-y-2 text-xs text-muted-foreground">{r.extra.map((x: string) => <li key={x} className="flex gap-2"><AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warn" />{x}</li>)}</ul>}
        </div>
        <div className="border-t px-5 sm:px-7">{r.stops.map((s: any) => <details key={s.dest.code} open={r.stops.length === 1} className="border-b last:border-b-0"><summary className="cursor-pointer py-4 text-sm font-semibold">{flag(s.dest.code)} {s.dest.name} <span className={`ml-2 text-xs ${STATUS[s.status].tone.split(' ')[0]}`}>{STATUS[s.status].label}</span></summary><BenefitList benefits={s.benefits} /><ReportIssue ruleId={`${market}/${ins.id}/${tier}/${s.dest.code}`} /></details>)}</div>
        <div className="border-t p-5 sm:p-7"><h3 className="font-semibold">Before you go</h3><ul className="mt-3 space-y-3">{r.actionList.map((a: string) => <li key={a}><label className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"><input type="checkbox" className="mt-1 shrink-0 accent-primary" />{a}</label></li>)}</ul></div>
        <div className="border-t bg-muted/40 p-5 sm:p-7"><h3 className="mb-3 font-semibold">Evidence & recorded dates</h3><EvidenceDetails sourceIds={r.sourceIds} /><p className="mt-4 text-xs leading-relaxed text-muted-foreground">{r.disclosure} <Link to="/methodology" className="underline">Research standards</Link>.</p><p className="mt-2 text-xs text-muted-foreground">Rule version {RULE_VERSION} · legacy dataset release {data.checkedOn}{printedOn && ` · checklist printed ${printedOn}`}</p></div>
      </section>}
      {notice && <p role="status" className="no-print break-all text-sm text-primary">{notice}</p>}
      <details className="no-print border-y py-4"><summary className="cursor-pointer text-sm font-semibold">Destination atlas <span className="ml-2 font-normal text-muted-foreground">{eligibleCountries(market).length} international destinations</span></summary><div className="mt-4"><AtlasMap market={market} insurer={ins.id} tier={tier} days={r.error ? days : r.days} used={used} departure={scenario.departure} returnDate={scenario.returnDate} renewal={scenario.renewal} selected={stops} onPick={toggleStop} /></div></details>
    </div>
  </div>;
}

function Field({ n, label, children }: { n: string; label: string; children: React.ReactNode }) {
  return <div><h2 className="mb-3 flex items-center gap-3 text-sm font-semibold"><span className="font-mono text-xs text-primary">{n}</span>{label}</h2>{children}</div>;
}
function NumberRange({ label, value, onChange, min }: { label: string; value: number; onChange: (n: number) => void; min: number }) {
  return <div className="mb-4"><div className="mb-2 flex items-center justify-between gap-2"><label htmlFor={`${label}-number`} className="text-sm text-muted-foreground">{label}</label><Input id={`${label}-number`} type="number" min={min} max={180} value={value} onChange={(e) => { if (e.target.value !== "") onChange(Number(e.target.value)); }} className="w-20 text-right font-mono" /></div><input aria-label={`${label} slider`} type="range" min={min} max={180} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-primary" /></div>;
}