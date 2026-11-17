import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { JsonLd } from "@/components/JsonLd";
import { PageHead } from "@/components/Shell";
import { countries, covers, flag, insurers, markets } from "@/lib/atlas";
import { itemListNode, pageDescription, pageGraph, pageTitle, seo, staticTrail } from "@/lib/site";

const title = "Your insurer. Your destination.";
const description = pageDescription(
  "Tier-by-tier research pages for named insurers and popular driving destinations, each linked to source evidence.",
);
const trail = staticTrail("Insurer pages", "/cover");

export const Route = createFileRoute("/cover/")({
  head: () => seo(pageTitle("Insurer and country pages"), description, "/cover"),
  component: CoverIndex,
});

function CoverIndex() {
  const [m, setM] = useState("all");
  const [q, setQ] = useState("");
  const list = covers.filter(
    (c) =>
      (m === "all" || c.market === m) &&
      ((insurers.find((i) => i.id === c.insurer)?.name ?? "") + countries[c.dest].name)
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  return (
    <>
      <JsonLd
        data={pageGraph(title, description, "/cover", trail, [
          itemListNode(
            "Insurer and country research pages",
            covers.flatMap((cover) => {
              const insurer = insurers.find(
                (item) => item.id === cover.insurer && item.market === cover.market,
              );
              const destination = countries[cover.dest];
              if (!insurer || !destination) return [];
              return [
                { name: `${insurer.name} in ${destination.name}`, path: `/cover/${cover.slug}` },
              ];
            }),
          ),
        ])}
      />
      <PageHead
        kicker={`${covers.length} research pages`}
        title={title}
        intro="Choose a pairing for a full tier-by-tier breakdown of published cover."
        crumbs={trail.crumbs}
      />
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-6 flex flex-wrap gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search insurer or country"
            placeholder="Search insurer or country…"
            className="min-w-60 flex-1 rounded-full border bg-input/40 px-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {["all", ...markets.map((x) => x.id)].map((id) => (
            <Button
              variant="outline"
              key={id}
              onClick={() => setM(id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold uppercase ${m === id ? "border-primary bg-primary/15" : "text-muted-foreground"}`}
            >
              {id}
            </Button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => {
            const ins = insurers.find((i) => i.id === c.insurer && i.market === c.market);
            if (!ins) return null;
            return (
              <Link
                key={c.slug}
                to="/cover/$slug"
                params={{ slug: c.slug }}
                className="group flex items-center justify-between rounded-xl glass p-5 transition hover:border-primary/50"
              >
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    {c.market.toUpperCase()} policy
                  </div>
                  <div className="mt-1 font-display text-xl">
                    {ins.name} <span className="text-muted-foreground">in</span>{" "}
                    {countries[c.dest].name}
                  </div>
                </div>
                <span className="text-3xl transition group-hover:scale-125">{flag(c.dest)}</span>
              </Link>
            );
          })}
        </div>
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground">No research page matches that search.</p>
        )}
      </div>
    </>
  );
}
