#!/usr/bin/env node
/**
 * lastmod.mjs: writes src/data/lastmod.json, the date each sitemap URL's own
 * content last changed, for <lastmod> in app/sitemap.ts.
 *
 * Google uses <lastmod> only when it is "consistently and verifiably accurate"
 * (developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
 * so a build date on every URL would teach it to ignore the field. This reads
 * git history instead: for every FAQ item, glossary term, reference entry,
 * guide, blog post and scraped page, the newest commit on main's first-parent
 * line where that entry's content changed (an entry still uncommitted in the
 * working tree counts as today); for hand-built routes, the newest commit to
 * the route's own folder or file. Shared chrome (header, footer, layout) never
 * moves a date.
 *
 *   node scripts/lastmod.mjs          write src/data/lastmod.json
 *   node scripts/lastmod.mjs --check  exit 1 when the file is out of date
 *
 * Run it after any content change, before committing (needs full git history:
 * `git fetch --unshallow` in a shallow clone).
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, "..");
const repoRoot = path.resolve(appRoot, "../..");
const outFile = path.join(appRoot, "src/data/lastmod.json");
const check = process.argv.includes("--check");

function git(args) {
  return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8", maxBuffer: 1 << 30 });
}

if (git(["rev-parse", "--is-shallow-repository"]).trim() === "true") {
  console.error("lastmod: shallow clone; run `git fetch --unshallow` first.");
  process.exit(2);
}

const today = new Date().toISOString().slice(0, 10);

/** Versions of a file on main's first-parent line, newest first, following renames. */
function versions(rel) {
  const log = git(["log", "--first-parent", "--follow", "--name-only", "--format=@@%H %cs", "HEAD", "--", rel]);
  const out = [];
  let cur = null;
  for (const line of log.split("\n")) {
    if (line.startsWith("@@")) {
      const [sha, date] = line.slice(2).split(" ");
      cur = { sha, date, path: null };
      out.push(cur);
    } else if (line.trim() && cur && !cur.path) {
      cur.path = line.trim();
    }
  }
  return out;
}

function show(sha, p) {
  try {
    return git(["show", `${sha}:${p}`]);
  } catch {
    return null; // deleted in that commit
  }
}

/**
 * For one source file and an entry splitter (text -> Map<key, content>), the
 * date each entry in the working tree reached its current content.
 */
function entryDates(rel, split) {
  const working = readFileSync(path.join(repoRoot, rel), "utf8");
  const current = split(working);
  const vs = versions(rel);
  const result = new Map();
  // Newest first: the working tree, then each commit. An entry's date is the
  // oldest version in the unbroken newest run that holds its current content.
  const head = vs[0] ? show(vs[0].sha, vs[0].path) : null;
  const headMap = head == null ? new Map() : safeSplit(split, head);
  const pending = new Map();
  for (const [k, v] of current) {
    if (headMap.get(k) !== v) result.set(k, today);
    else pending.set(k, v);
  }
  let newer = vs[0];
  for (let i = 1; i < vs.length && pending.size; i++) {
    const text = show(vs[i].sha, vs[i].path);
    const m = text == null ? new Map() : safeSplit(split, text);
    for (const [k, v] of [...pending]) {
      if (m.get(k) !== v) {
        result.set(k, newer.date);
        pending.delete(k);
      }
    }
    newer = vs[i];
  }
  for (const k of pending.keys()) result.set(k, newer ? newer.date : today);
  return result;
}

function safeSplit(split, text) {
  try {
    return split(text);
  } catch {
    return new Map();
  }
}

const jsonArray = (keyOf) => (text) => {
  const m = new Map();
  for (const e of JSON.parse(text)) m.set(keyOf(e), JSON.stringify(e));
  return m;
};
const jsonObject = (text) => {
  const m = new Map();
  for (const [k, v] of Object.entries(JSON.parse(text))) m.set(k, JSON.stringify(v));
  return m;
};
/** FAQ seed: one `item({ ... })` block per answer, keyed by its slug. */
const faqItems = (text) => {
  const m = new Map();
  const parts = text.split(/\n[ \t]*item\(\{/).slice(1);
  for (const part of parts) {
    const end = part.search(/\n[ \t]*\}\),?[ \t]*\n/);
    const body = end >= 0 ? part.slice(0, end) : part;
    const slug = /\bslug:\s*["'`]([^"'`]+)["'`]/.exec(body);
    if (slug) m.set(slug[1], body.replace(/\s+/g, " ").trim());
  }
  return m;
};

const dates = {};
const put = (prefix, map) => {
  for (const [k, d] of map) dates[`${prefix}:${k}`] = d;
};

put("faq", entryDates("lib/faq/src/seed.ts", faqItems));
put("glossary", entryDates("artifacts/jematell-homes/src/data/glossary.json", jsonArray((e) => e.slug)));
put("reference", entryDates("artifacts/jematell-homes/src/data/reference.json", jsonArray((e) => `${e.module}/${e.slug}`)));
put("guide", entryDates("artifacts/jematell-homes/src/data/guides.json", jsonArray((e) => e.slug)));
put("blog", entryDates("clone-data/extracted/blogs.json", jsonObject));
put("page", entryDates("clone-data/extracted/pages.json", jsonObject));

// Hand-built routes: the newest commit to the route's own folder or file.
function fileDate(rel) {
  const d = git(["log", "-1", "--first-parent", "--format=%cs", "HEAD", "--", rel]).trim();
  const dirty = git(["status", "--porcelain", "--", rel]).trim();
  return dirty ? today : d || null;
}
const fileKeys = ["artifacts/jematell-homes/app/page.tsx", "artifacts/jematell-homes/src/data/estimateScenarios.ts"];
const appDir = path.join(appRoot, "app");
for (const name of readdirSync(appDir)) {
  const full = path.join(appDir, name);
  if (!statSync(full).isDirectory() || name.startsWith("%") || name.startsWith("_")) continue;
  fileKeys.push(`artifacts/jematell-homes/app/${name}/page.tsx`);
}
for (const name of readdirSync(path.join(appDir, "floor-plans"))) {
  if (statSync(path.join(appDir, "floor-plans", name)).isDirectory()) fileKeys.push(`artifacts/jematell-homes/app/floor-plans/${name}`);
}
// A view imported by exactly one route's page.tsx holds that route's content
// (CustomHomesHub, BuildOnYourLotHub...), so it counts toward the route's date.
// Views several routes share (ContentPage) do not.
const viewImports = new Map();
const importers = new Map();
for (const rel of fileKeys) {
  if (!rel.endsWith("page.tsx") || !existsSync(path.join(repoRoot, rel))) continue;
  const src = readFileSync(path.join(repoRoot, rel), "utf8");
  const views = [...src.matchAll(/from\s+"@\/views\/([^"]+)"/g)].map((m) => m[1]);
  viewImports.set(rel, views);
  for (const v of views) importers.set(v, (importers.get(v) || 0) + 1);
}
for (const rel of fileKeys) {
  if (!existsSync(path.join(repoRoot, rel))) continue;
  const own = (viewImports.get(rel) || [])
    .filter((v) => importers.get(v) === 1)
    .map((v) => ["tsx", "ts"].map((ext) => `artifacts/jematell-homes/src/views/${v}.${ext}`).find((f) => existsSync(path.join(repoRoot, f))))
    .filter(Boolean);
  const ds = [rel, ...own].map(fileDate).filter(Boolean).sort();
  if (ds.length) dates[`file:${rel.replace("artifacts/jematell-homes/", "")}`] = ds[ds.length - 1];
}

const sorted = Object.fromEntries(Object.keys(dates).sort().map((k) => [k, dates[k]]));
const text = JSON.stringify(sorted, null, 1) + "\n";
if (check) {
  const old = existsSync(outFile) ? readFileSync(outFile, "utf8") : "";
  if (old !== text) {
    console.error("lastmod: src/data/lastmod.json is out of date; run node scripts/lastmod.mjs");
    process.exit(1);
  }
  console.log(`lastmod: up to date (${Object.keys(sorted).length} sources)`);
} else {
  writeFileSync(outFile, text);
  console.log(`lastmod: wrote ${Object.keys(sorted).length} sources to src/data/lastmod.json`);
}
