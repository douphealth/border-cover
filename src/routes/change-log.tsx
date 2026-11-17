import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/JsonLd";
import { PageHead } from "@/components/Shell";
import { data } from "@/lib/atlas";
import { previewSafeguardNote } from "@/lib/release-notes";
import { itemListNode, pageDescription, pageGraph, pageTitle, seo, staticTrail } from "@/lib/site";

const description = pageDescription(
  "Dated record of every research dataset update to BorderCover Atlas.",
);
const trail = staticTrail("Change log", "/change-log");
const notes = [
  previewSafeguardNote,
  ...(data.changeLog as { date: string; type: string; description: string }[]),
];

export const Route = createFileRoute("/change-log")({
  head: () => seo(pageTitle("Change log"), description, "/change-log"),
  component: () => (
    <>
      <JsonLd
        data={pageGraph("What changed, and when.", description, "/change-log", trail, [
          itemListNode(
            "Research updates",
            notes.map((note) => ({
              name: `${note.date} · ${note.type}`,
              description: note.description,
            })),
          ),
        ])}
      />
      <PageHead
        kicker="Change log"
        title="What changed, and when."
        intro="Public research updates; software changes and automated source observations are not new human policy approval."
        crumbs={trail.crumbs}
      />
      <ol className="mx-auto max-w-3xl space-y-6 border-l px-5 pl-8">
        {notes.map((note) => (
          <li key={`${note.date}-${note.type}`} className="relative">
            <span className="absolute -left-[2.35rem] top-1.5 h-3 w-3 rounded-full bg-brass" />
            <div className="font-mono text-xs text-primary">
              {note.date} · {note.type}
            </div>
            <p className="mt-1 text-muted-foreground">{note.description}</p>
          </li>
        ))}
      </ol>
    </>
  ),
});
