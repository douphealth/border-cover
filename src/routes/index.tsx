import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Compass } from "lucide-react";
import { Checker } from "@/components/Checker";
import { seo } from "@/components/Shell";
import { datasetStats } from "@/lib/evidence";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [...seo("BorderCover Atlas — Overseas car insurance research", "Compare published overseas motor cover, trip allowances, transit-country conditions and original evidence. Personal policy confirmation remains essential."), { name: "robots", content: "noindex, nofollow" }] }),
  component: Index,
});
function Index() {
  return <>
    <section className="mx-auto max-w-7xl px-5 pb-8 pt-9 sm:pt-12"><div className="flex items-center gap-2 text-sm font-medium text-primary"><Compass className="h-4 w-4" />Independent drive-abroad research</div><div className="mt-3 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-semibold sm:text-4xl">BorderCover Atlas</h1><p className="mt-3 max-w-2xl text-base text-muted-foreground">Published car insurance terms, country by country. Your policy documents have the final word.</p></div><Link to="/methodology" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">Our evidence standard <ArrowUpRight className="h-4 w-4" /></Link></div></section>
    <section id="check" className="mx-auto max-w-7xl border-t px-5 pt-8"><Checker /></section>
    <section className="mx-auto mt-12 max-w-7xl border-t px-5 py-8"><dl className="grid grid-cols-2 gap-5 text-sm sm:grid-cols-3 lg:grid-cols-6">{[[datasetStats.namedProfiles,"Named market profiles"],[datasetStats.fallbackProfiles,"Generic fallback profiles"],[datasetStats.plans,"Plans across all profiles"],[datasetStats.countries,"Countries in register"],[datasetStats.sources,"Source records"],[datasetStats.listedJourneys,"Listed research journeys"]].map(([n,label]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-2xl font-semibold">{n}</dd></div>)}</dl></section>
  </>;
}