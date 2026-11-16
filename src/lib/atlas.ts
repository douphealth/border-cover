import policies from "@/data/policies.json";
import coverPages from "@/data/cover-pages.json";
import guides from "@/data/guides.json";
import pages from "@/data/pages.json";
import { evaluate, evaluateRoute, greenCard, getMatrixSample, HOME_DEFAULT } from "./engine";

export const data: any = policies;
export { evaluate, evaluateRoute, greenCard, getMatrixSample, HOME_DEFAULT };

export type Status = "confirmed" | "minimum" | "liability" | "limited" | "needs-check" | "not-covered";
export const STATUS: Record<string, { label: string; tone: string; dot: string }> = {
  confirmed: { label: "Published full cover", tone: "text-ok border-ok/40 bg-ok/10", dot: "var(--ok)" },
  minimum: { label: "Legal minimum only", tone: "text-warn border-warn/40 bg-warn/10", dot: "var(--warn)" },
  liability: { label: "Liability published", tone: "text-info border-info/40 bg-info/10", dot: "var(--info)" },
  limited: { label: "Limited / days exceeded", tone: "text-warn border-warn/40 bg-warn/10", dot: "var(--warn)" },
  "needs-check": { label: "Needs insurer check", tone: "text-muted-foreground border-border bg-muted", dot: "var(--muted-foreground)" },
  "not-covered": { label: "Not covered", tone: "text-destructive border-destructive/40 bg-destructive/10", dot: "var(--destructive)" },
};

export const markets: any[] = data.markets;
export const countries: Record<string, any> = data.countries;
export const insurers: any[] = data.insurers;
export const sources: Record<string, any> = data.sources;
export const insurersFor = (m: string) => insurers.filter((i) => i.market === m);
export const flag = (code: string) =>
  code === "ni" ? "🇬🇧" : code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

export type CoverPage = { market: string; insurer: string; dest: string; slug: string };
export const covers = coverPages as CoverPage[];
export const coverBySlug = (s: string) => covers.find((c) => c.slug === s);

export type Block = { t: string; x: string };
export type Doc = { title: string; description: string; blocks: Block[] };
export const guideDocs = guides as Record<string, Doc>;
export const staticDocs = pages as Record<string, Doc>;

export function evaluateCover(c: CoverPage, days = 14) {
  const ins = insurers.find((i) => i.id === c.insurer && i.market === c.market);
  return ins.tiers.map((t: any) => evaluate({ market: c.market, insurer: c.insurer, tier: t.id, destination: c.dest, days, used: 0 }, data));
}

// Approximate centroids [lon, lat] for the atlas map
export const COORDS: Record<string, [number, number]> = {
  at:[14.5,47.5],be:[4.5,50.6],bg:[25.3,42.7],hr:[16,45.2],cy:[33.2,35],cz:[15.3,49.8],dk:[9.5,56],ee:[25,58.7],fi:[26,62.5],fr:[2.3,46.6],de:[10.4,51.1],gr:[22,39.1],hu:[19.4,47.2],ie:[-8,53.2],it:[12.6,42.8],lv:[24.6,56.9],lt:[23.9,55.2],lu:[6.1,49.8],mt:[14.4,35.9],nl:[5.3,52.2],pl:[19.1,52],pt:[-8.2,39.6],ro:[25,45.9],sk:[19.7,48.7],si:[14.9,46.1],es:[-3.7,40.4],se:[16,62],is:[-18.6,64.9],li:[9.55,47.15],no:[9,61],ad:[1.5,42.5],ba:[17.7,44.2],gi:[-5.35,36.1],mc:[7.42,43.74],me:[19.3,42.7],sm:[12.45,43.94],rs:[20.9,44],ch:[8.2,46.8],va:[12.45,41.9],gb:[-2,53.5],al:[20,41.1],az:[47.6,40.1],md:[28.4,47.4],mk:[21.7,41.6],tr:[35.2,39],ua:[31.2,49],us:[-98,39],ca:[-106,56],mx:[-102,23.6],au:[134,-25.3],nz:[172,-41.5],ma:[-7.1,31.8],tn:[9.5,33.9],il:[34.9,31],jp:[138,36.2],za:[24,-29],ae:[54,24],ni:[-6.7,54.6],
};
