import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Flag, X } from "lucide-react";
import { Button } from "./ui/button";
import { RULE_VERSION } from "@/lib/evidence";
import { submitCorrection } from "@/lib/review.functions";

export function ReportIssue({ ruleId, kind = "correction" }: { ruleId: string; kind?: "correction" | "insurer-request" }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const send = useServerFn(submitCorrection);
  return <div className="no-print">
    <Button size="sm" variant="ghost" onClick={() => setOpen(!open)}><Flag />{kind === "insurer-request" ? "My insurer isn’t listed" : "Report an issue"}</Button>
    {open && <form className="mt-3 space-y-3 border-t pt-3" onSubmit={async (e) => {
      e.preventDefault(); setState("sending");
      try { const result = await send({ data: { ruleId, version: RULE_VERSION, message, website: "", kind } }); setState(result.ok ? "sent" : "error"); } catch { setState("error"); }
    }}>
      <div className="flex items-center justify-between"><label htmlFor={`issue-${ruleId}`} className="text-sm font-semibold">{kind === "insurer-request" ? "Insurer, product and home market" : "What needs correcting?"}</label><Button type="button" size="icon" variant="ghost" aria-label="Close issue report" onClick={() => setOpen(false)}><X /></Button></div>
      <textarea id={`issue-${ruleId}`} required minLength={10} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-24 w-full rounded-md border bg-background p-3 text-sm" />
      <p className="text-xs text-muted-foreground">Do not include policy numbers or personal information. Reports are private to authorized reviewers.</p>
      <Button disabled={state === "sending" || state === "sent"} type="submit">{state === "sending" ? "Sending…" : "Send report"}</Button>
      <p role="status" className="text-sm">{state === "sent" ? "Report received. Editorial review is pending; no response time is promised." : state === "error" ? "Report could not be sent. Please try again." : ""}</p>
    </form>}
  </div>;
}