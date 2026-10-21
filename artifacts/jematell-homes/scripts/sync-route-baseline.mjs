/**
 * sync-route-baseline.mjs — keep scripts/routes-baseline.txt in step with the
 * Reference Library route set (module index + per-city hubs + entries) whenever
 * reference.json changes. Every OTHER baseline line is preserved verbatim; only the
 * `/reference-library...` block is recomputed, so the route-parity gate blesses newly
 * synced pages without a hand-edit. Mirrors reference.ts referenceRoutes() exactly.
 *
 * Usage: node scripts/sync-route-baseline.mjs [--check]
 *   --check : report the delta and exit non-zero if out of sync (writes nothing).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const REF_JSON = join(root, "src/data/reference.json");
const BASELINE = join(here, "routes-baseline.txt");

// Must match BUILDING_CODE_JURISDICTIONS in src/data/reference.ts (display order).
const JURISDICTIONS = [
  "scottsdale", "phoenix", "paradise-valley", "fountain-hills", "cave-creek",
  "carefree", "mesa", "surprise", "apache-junction", "casa-grande", "maricopa-county", "pinal-county",
];
const STATEWIDE = "statewide";
const PER_CITY_MODULES = new Set(["building-codes"]);
const MODULES = ["building-codes", "arizona-building-law", "code-library", "community-design-guidelines"];

const byLen = [...JURISDICTIONS].sort((a, b) => b.length - a.length);
function jurisdictionSlugOf(slug) {
  for (const j of byLen) if (slug === j || slug.startsWith(`${j}-`)) return j;
  return STATEWIDE;
}

function referenceRoutes() {
  const ref = JSON.parse(readFileSync(REF_JSON, "utf8"));
  const routes = ["/reference-library"];
  for (const m of MODULES) routes.push(`/reference-library/${m}`);
  for (const m of MODULES) {
    if (!PER_CITY_MODULES.has(m)) continue;
    const entries = ref.filter((e) => e.module === m);
    const order = [...JURISDICTIONS, STATEWIDE];
    for (const j of order) {
      if (entries.some((e) => jurisdictionSlugOf(e.slug) === j)) {
        routes.push(`/reference-library/${m}/${j}`);
      }
    }
  }
  for (const e of ref) routes.push(`/reference-library/${e.module}/${e.slug}`);
  return routes;
}

function main() {
  const check = process.argv.includes("--check");
  const lines = readFileSync(BASELINE, "utf8").split(/\r?\n/);
  const hadTrailingNewline = readFileSync(BASELINE, "utf8").endsWith("\n");

  const isRef = (l) => l.trim().startsWith("/reference-library");
  const fresh = referenceRoutes();

  const oldRef = new Set(lines.filter(isRef).map((l) => l.trim()));
  const newRef = new Set(fresh);
  const added = [...newRef].filter((r) => !oldRef.has(r));
  const removed = [...oldRef].filter((r) => !newRef.has(r));

  // Single pass: preserve every non-reference line verbatim in place; replace the
  // first reference line encountered with the whole fresh block, drop the rest.
  const out = [];
  let inserted = false;
  for (const l of lines) {
    if (l.trim() === "") continue;
    if (isRef(l)) {
      if (!inserted) { out.push(...fresh); inserted = true; }
    } else {
      out.push(l);
    }
  }
  if (!inserted) out.push(...fresh);

  console.log(`reference routes: ${oldRef.size} -> ${newRef.size} | +${added.length} -${removed.length}`);
  for (const r of added.slice(0, 20)) console.log("  + " + r);
  for (const r of removed.slice(0, 20)) console.log("  - " + r);

  if (check) {
    process.exit(added.length || removed.length ? 1 : 0);
  }
  writeFileSync(BASELINE, out.join("\n") + (hadTrailingNewline ? "\n" : ""), "utf8");
  console.log(`baseline written: ${out.length} routes`);
}

main();
