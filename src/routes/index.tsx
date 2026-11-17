import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, BookOpen, Compass, MapPin, Route as RouteIcon } from "lucide-react";
import { Checker } from "@/components/Checker";
import { seo } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import rivieraDrive from "@/assets/riviera-drive.jpg";


export const Route = createFileRoute("/")({
  head: () => ({ meta: [...seo("BorderCover Atlas — Overseas car insurance research", "Compare published overseas motor cover, trip allowances, transit-country conditions and original evidence. Personal policy confirmation remains essential.")] }),
  component: Index,
});
function Index() {
  return <div className="home-page">
    <section className="drive-hero relative isolate overflow-hidden">
      <img src={rivieraDrive} alt="A silver car on a winding Mediterranean coastal road" width={1920} height={1024} fetchPriority="high" className="drive-hero-image absolute inset-0 h-full w-full object-cover" />
      <div className="drive-hero-shade absolute inset-0" />
      <div className="relative mx-auto flex h-full max-w-7xl items-center px-5 sm:px-8">
        <div className="hero-copy max-w-xl py-10">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-hero-muted"><Compass className="h-4 w-4" />Independent drive-abroad research</p>
          <h1 className="hero-title mt-5 text-5xl leading-[1.04] sm:text-6xl">BorderCover <span className="block italic text-hero-accent">Atlas</span></h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-hero-muted">The open road. The finer print.<br />Published car insurance terms, country by country.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="hero-primary h-11 px-5"><a href="#check">Check your journey <ArrowDown className="hero-arrow" /></a></Button>
            <Button asChild variant="ghost" size="lg" className="hero-secondary h-11 px-4"><Link to="/atlas">Explore the atlas <ArrowUpRight /></Link></Button>
          </div>
        </div>
        <div className="hero-roadmark absolute bottom-7 right-8 hidden items-center gap-3 text-xs text-hero-foreground md:flex" aria-hidden="true"><span className="roadmark-line" /><MapPin className="h-4 w-4" /><span className="font-mono">Beyond the border</span></div>
      </div>
    </section>
    <div className="research-ribbon border-b bg-card">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 text-xs sm:px-8">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground"><span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" />Published terms, not promises</span><span className="flex items-center gap-2"><RouteIcon className="h-4 w-4 text-primary" />Your policy has the final word</span></div>
        <Link to="/methodology" className="group inline-flex items-center gap-2 font-semibold text-primary">Our evidence standard <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
      </div>
    </div>
    <section id="check" className="home-checker mx-auto max-w-7xl px-5 pb-6 pt-8 sm:px-8 sm:pt-10">
      <div className="checker-heading mb-7 flex flex-wrap items-end justify-between gap-3 border-b pb-5"><div><p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">Your next journey</p><h2 className="text-2xl font-semibold">A little research. A clearer road ahead.</h2></div><span className="flex items-center gap-2 text-xs text-muted-foreground"><span className="research-dot h-1.5 w-1.5 rounded-full bg-primary" />Personal cover is not confirmed</span></div>
      <Checker />
    </section>
    <section className="mx-auto mt-10 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t px-5 py-8 sm:px-8"><p className="text-sm text-muted-foreground">Good decisions start with the original wording.</p><Link to="/sources" className="group inline-flex items-center gap-2 text-sm font-semibold text-primary">Inspect research scope and evidence <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link></section>
  </div>;
}