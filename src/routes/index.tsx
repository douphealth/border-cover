import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Globe2, Scale } from "lucide-react";
import { Checker } from "@/components/Checker";
import { seo } from "@/components/Shell";
import { covers, data, insurers } from "@/lib/atlas";

export const Route = createFileRoute("/")({
  head: () => ({ meta: seo("BorderCover Atlas — Does your car insurance cover you abroad?", "Check in seconds whether your UK, Irish, US, Canadian, Australian or NZ car insurance covers a trip abroad, with every answer linked to the insurer's own wording.") }),
  component: Index,
});

function Index() {
  const stats = [
    [String(data.markets.length), "home markets"],
    [String(insurers.filter((i) => !i.id.startsWith("other-")).length), "named insurers"],
    [String(Object.keys(data.countries).length), "destinations"],
    [String(Object.keys(data.sources).length), "evidence records"],
  ];
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-paper [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-20 md:pt-28">
          <p className="animate-rise font-mono text-xs uppercase tracking-[0.25em] text-primary">Drive-abroad research · checked {data.checkedOn}</p>
          <h1 className="mt-5 max-w-5xl animate-rise text-5xl leading-[0.98] md:text-7xl lg:text-8xl">
            Does your car insurance <em className="text-brass not-italic">cross the border</em> with you?
          </h1>
          <p className="mt-6 max-w-2xl animate-rise text-lg text-muted-foreground md:text-xl">
            Pick your insurer, plan and route. We show what the insurer actually publishes — cover level, day limits, Green Card rules — and link every claim to its source.
          </p>
          <div className="mt-10 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-4">
            {stats.map(([n, l]) => (
              <div key={l} className="bg-background/80 p-5"><div className="font-display text-4xl text-brass">{n}</div><div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      <section id="check" className="mx-auto max-w-7xl px-5"><Checker /></section>

      <section className="mx-auto mt-24 grid max-w-7xl gap-5 px-5 md:grid-cols-3">
        {[
          { icon: Scale, t: "Evidence, not opinion", d: "Each verdict comes from a dated insurer or government document. Where we can't find one, we say so.", to: "/methodology" as const },
          { icon: Globe2, t: `${covers.length} insurer × country pages`, d: "Tier-by-tier breakdowns for the most common journeys, from AA in France to GEICO in Mexico.", to: "/cover" as const },
          { icon: BookOpen, t: "Plain-English guides", d: "Green Cards, Mexican liability, Ireland ↔ UK and more, written for the trip you're planning.", to: "/guides" as const },
        ].map((c) => (
          <Link key={c.t} to={c.to} className="group rounded-2xl glass p-7 transition hover:-translate-y-1 hover:border-primary/50">
            <c.icon className="h-6 w-6 text-primary" />
            <h3 className="mt-4 text-2xl">{c.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </section>
    </>
  );
}
