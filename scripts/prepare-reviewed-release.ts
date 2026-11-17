import { readFile, writeFile } from "node:fs/promises";
import { evidenceSchema, observationState, validatePolicyReferences } from "../src/lib/provenance";

// Local reviewed-release preparation only. It never publishes or mutates Cloud.
const input = process.argv[2];
if (!input) throw new Error("Provide the authorized approved-research export path.");
const research = evidenceSchema.parse(JSON.parse(await readFile(input, "utf8")));
const policies = JSON.parse(await readFile("src/data/policies.json", "utf8"));
if (!validatePolicyReferences(research, policies)) throw new Error("Claims do not match the policy dataset or source references.");
if (!research.claims.length || !research.observations.every((o) => observationState(o, new Date().toISOString().slice(0,10)) === "current")) throw new Error("Only current independently approved evidence may enter a reviewed release.");
const output = process.argv[3] ?? "/tmp/reviewed-evidence.json";
await writeFile(output, JSON.stringify(research, null, 2) + "\n", { flag: "wx" });
console.log("Validated reviewed candidate written; adopt with a reviewed dataset revision, run tests, and archive before publishing. No live rules changed.");