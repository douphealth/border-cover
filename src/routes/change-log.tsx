import { createFileRoute } from "@tanstack/react-router";
import { PageHead, seo } from "@/components/Shell";
import { data } from "@/lib/atlas";

export const Route = createFileRoute("/change-log")({
  head: () => ({ meta: seo("Change log | BorderCover Atlas", "Dated record of every research dataset update to BorderCover Atlas.") }),
  component: () => (
    <>
      <PageHead kicker="Change log" title="What changed, and when." intro={data.release} />
      <ol className="mx-auto max-w-3xl space-y-6 border-l px-5 pl-8">
        {data.changeLog.map((c: any, i: number) => (
          <li key={i} className="relative"><span className="absolute -left-[2.35rem] top-1.5 h-3 w-3 rounded-full bg-brass" />
            <div className="font-mono text-xs text-primary">{c.date} · {c.type}</div><p className="mt-1 text-muted-foreground">{c.description}</p></li>
        ))}
      </ol>
    </>
  ),
});
