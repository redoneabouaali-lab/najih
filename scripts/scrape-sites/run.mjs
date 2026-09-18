// Run one or more site scrapers and save per-site JSON to content/sites/.
// Usage: node scripts/scrape-sites/run.mjs [site1 site2 ...] [--limit N]
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { OUT_DIR } from "./common.mjs";

const args = process.argv.slice(2);
const limitArg = args.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : 0;
const names = args.filter((a) => !a.startsWith("--"));

const ADAPTERS = join(import.meta.dirname, "adapters");
const files = readdirSync(ADAPTERS).filter((f) => f.endsWith(".mjs") && !f.startsWith("_"));
const available = files.map((f) => f.replace(/\.mjs$/, ""));

const targets = names.length ? names : available;
let exit = 0;

for (const name of targets) {
  if (!available.includes(name)) {
    console.error(`Unknown adapter: ${name} (available: ${available.join(", ")})`);
    exit = 1;
    continue;
  }
  const mod = await import(pathToFileURL(join(ADAPTERS, `${name}.mjs`)).href);
  try {
    const result = await mod.scrape({ limit });
    // strip transient fields (files)
    for (const l of result.lessons ?? []) delete l.files;
    writeFileSync(join(OUT_DIR, `${name}.json`), JSON.stringify({ site: result.site, lessons: result.lessons ?? [], resources: result.resources ?? [] }, null, 2), "utf8");
    console.log(`[done] ${name}: ${result.lessons?.length ?? 0} lessons, ${result.resources?.length ?? 0} resources -> content/sites/${name}.json`);
  } catch (e) {
    console.error(`[fail] ${name}:`, e);
    exit = 1;
  }
}

process.exit(exit);