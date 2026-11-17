import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { data } from "@/lib/atlas";
import { datasetStats } from "@/lib/evidence";

const NAV = [
  { to: "/", label: "Checker" },
  { to: "/atlas", label: "Atlas" },
  { to: "/cover", label: "Insurer pages" },
  { to: "/guides", label: "Guides" },
  { to: "/methodology", label: "Methodology" },
  { to: "/sources", label: "Sources" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b glass">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brass text-primary-foreground"><Compass className="h-5 w-5" /></span>
          <span className="font-display text-lg font-semibold">BorderCover <span className="text-brass">Atlas</span></span>
        </Link>
        <nav aria-label="Main navigation" className="flex max-w-full gap-1 overflow-x-auto text-sm">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className="whitespace-nowrap rounded-full px-3 py-1.5 text-muted-foreground transition hover:text-foreground" activeProps={{ className: "bg-secondary text-foreground" }}>{n.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 text-sm md:grid-cols-3">
        <div>
          <p className="font-display text-lg">BorderCover Atlas</p>
          <p className="mt-2 text-muted-foreground">An independent, source-backed research tool for driving your own car abroad. We don't sell, quote or bind insurance.</p>
        </div>
        <div className="flex flex-col gap-2 text-muted-foreground">
          <Link to="/change-log" className="hover:text-foreground">Change log</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
        </div>
        <div className="text-xs leading-relaxed text-muted-foreground">Legacy dataset release {data.checkedOn}<br />{datasetStats.sources} source records · {datasetStats.namedProfiles} named market profiles<br />{datasetStats.fallbackProfiles} generic fallback profiles · {datasetStats.plans} plans<br /><Link to="/review" className="underline">Editorial review</Link> · Ownership and reviewer details pending.</div>
      </div>
    </footer>
  );
}

export function PageHead({ kicker, title, intro }: { kicker: string; title: string; intro?: string }) {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 animate-rise">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{kicker}</p>
      <h1 className="mt-3 max-w-4xl text-4xl leading-[1.05] md:text-6xl">{title}</h1>
      {intro && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{intro}</p>}
    </div>
  );
}

export function DocBody({ blocks }: { blocks: { t: string; x: string }[] }) {
  return (
    <article className="mx-auto max-w-3xl space-y-4 px-5 text-[1.05rem] leading-relaxed">
      {blocks.map((b, i) =>
        b.t === "h2" ? <h2 key={i} className="pt-6 text-2xl md:text-3xl">{b.x}</h2>
        : b.t === "h3" ? <h3 key={i} className="pt-3 text-xl">{b.x}</h3>
        : b.t === "li" ? <p key={i} className="border-l-2 border-primary/50 pl-4 text-muted-foreground">{b.x}</p>
        : <p key={i} className={i === 0 ? "text-xl text-foreground" : "text-muted-foreground"}>{b.x}</p>,
      )}
    </article>
  );
}

export const seo = (title: string, description: string) => [
  { title }, { name: "description", content: description },
  { property: "og:title", content: title }, { property: "og:description", content: description },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  { name: "robots", content: "noindex, nofollow" },
];
