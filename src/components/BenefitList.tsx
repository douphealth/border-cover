import { CheckCircle2, CircleHelp, AlertTriangle, XCircle } from "lucide-react";

const names: Record<string, string> = { liability: "Legal liability", ownCar: "Own-car damage & theft", breakdown: "Breakdown & recovery", documents: "Required documents" };
const states: Record<string, string> = { published: "Published terms", "not-researched": "Not researched", "insufficient-evidence": "Insufficient evidence", "confirmation-required": "Insurer confirmation required", "explicit-exclusion": "Excluded benefit / separate cover" };
export function BenefitList({ benefits }: { benefits: Record<string, { state: string; detail: string }> }) {
  return <dl className="divide-y">{Object.entries(benefits).map(([key, b]) => {
    const Icon = b.state === "published" ? CheckCircle2 : b.state === "explicit-exclusion" ? XCircle : b.state === "confirmation-required" ? AlertTriangle : CircleHelp;
    return <div key={key} className="grid gap-2 py-4 sm:grid-cols-[180px_1fr]"><dt className="text-sm font-semibold">{names[key]}</dt><dd className="text-sm"><span className={`inline-flex items-center gap-1.5 font-medium ${b.state === "published" ? "text-primary" : b.state === "explicit-exclusion" ? "text-destructive" : "text-muted-foreground"}`}><Icon className="h-4 w-4 shrink-0" />{states[b.state]}</span><p className="mt-1 leading-relaxed text-muted-foreground">{b.detail}</p></dd></div>;
  })}</dl>;
}