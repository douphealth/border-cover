import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { evidenceSchema } from "../src/lib/provenance";

// Offline release tooling only; never imported into SSR or browser code.
const research = evidenceSchema.parse(JSON.parse(await readFile("src/data/evidence.json", "utf8")));
if (!/^[a-z0-9.-]+$/.test(research.version)) throw new Error("Unsafe release identifier");
const files = ["src/data/policies.json", "src/data/evidence.json", "src/lib/engine.ts", "src/lib/provenance.ts"];
const snapshot = { version: research.version, status: "research-preview", files: await Promise.all(files.map(async (path) => { const content = await readFile(path, "utf8"); return { path, sha256: createHash("sha256").update(content).digest("hex"), content }; })) };
await mkdir("research-releases", { recursive: true });
await writeFile(`research-releases/${research.version}.json`, JSON.stringify(snapshot, null, 2) + "\n", { flag: "wx" });
console.log(`Archived immutable preview release ${research.version}; existing releases cannot be overwritten.`);