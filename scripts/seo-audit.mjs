#!/usr/bin/env node
/**
 * seo-audit.mjs: the technical checks every client site runs before a merge,
 * with no dependencies, on Node 18 or newer.
 *
 *   node scripts/seo-audit.mjs --dir out                 # a built static export
 *   node scripts/seo-audit.mjs --url http://localhost:5000 --pages 80   # a running site
 *
 * What it checks, per page: a title (one, 20 to 60 characters, shared with no
 * other page), a meta description (70 to 160, shared with no other page), one
 * h1, a canonical that names the page itself, no noindex on a page the
 * sitemap lists, JSON-LD that parses, images with alt text, 120 words or more
 * of body copy, and every internal link leading to a page that exists (in a
 * folder: a file; at an address: a 200 without a redirect). Across the site:
 * every sitemap entry is a live page and every page is in the sitemap.
 *
 * --expect "<path>|<words>" (repeatable) checks that a page shows a visitor
 * the words a change added, one sentence each: a page passes every check
 * above while its new FAQ answers sit in a data file its template never
 * reads (HQ's 82 town FAQs and G Brothers' 116 service FAQs, 2026-10-28).
 * A sentence found only in the page's scripts or JSON-LD says so.
 *
 * Exit code 1 when any error-level problem is found (or any problem with
 * --strict), so a build script or a CI step can fail on it. --json prints
 * the findings as JSON for a tool to read; --all lists every address, not
 * the first 20 per check; --ignore <regex> skips matching paths; --origin
 * <https://host> says which host canonicals should name: needed in --dir
 * mode, and in --url mode when the address is a local copy of the site
 * (--url http://localhost:3000 --origin https://adrythm.com), whose pages
 * name the live host and would otherwise all read as canonical elsewhere.
 *
 * The same checks run in the portal as seo_tech_audit against the live site
 * with Search Console and PageSpeed beside them (lib/seo/tech); this is the
 * copy a repo runs on its own output in seconds. Keep the two in step.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
if (args.help || (!args.dir && !args.url)) {
  console.log("Usage: seo-audit.mjs (--dir <built html dir> | --url <origin>) [--pages N] [--sitemap <file|url>] [--origin https://host] [--ignore <regex>] [--expect '<path>|<words>' ...] [--json] [--all] [--strict]");
  process.exit(args.help ? 0 : 2);
}

const LIMIT = args.all ? Infinity : 20;
const THIN_WORDS = 120;
const ignore = args.ignore ? new RegExp(args.ignore) : null;
/** The host canonicals should name, from --origin; null means the crawled address. */
const canonicalOrigin = args.origin ? new URL(args.origin).origin : null;
const bareHost = (h) => h.replace(/^www\./, "");

/* ----------------------------------------------------------------- html */

const decode = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/&rsquo;|&lsquo;/g, "'").replace(/&rdquo;|&ldquo;/g, '"').replace(/&ndash;|&mdash;/g, "-").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&amp;/g, "&");
const clean = (s) => { const t = decode(String(s ?? "")).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); return t.length ? t : null; };
const attr = (tag, name) => { const m = new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tag); return m ? decode(m[2] ?? m[3] ?? m[4] ?? "") : null; };
const hasAttr = (tag, name) => new RegExp(`\\s${name}(\\s*=|\\s|>|/)`, "i").test(tag);

/** What a page says about itself, by regex: enough for built HTML. */
export function readHtml(html) {
  const head = /<head[\s>][\s\S]*?<\/head>/i.exec(html)?.[0] ?? html.slice(0, 20000);
  const title = clean(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(head)?.[1]);
  const metas = [...head.matchAll(/<meta\s[^>]*>/gi)].map((m) => m[0]);
  const metaNamed = (n) => metas.filter((t) => (attr(t, "name") ?? "").toLowerCase() === n).map((t) => attr(t, "content") ?? "");
  const description = clean(metaNamed("description")[0]);
  const robots = [...metaNamed("robots"), ...metaNamed("googlebot")].join(",").toLowerCase();
  const noindex = /\bnoindex\b|\bnone\b/.test(robots);
  const viewport = metaNamed("viewport").length > 0;
  const links = [...head.matchAll(/<link\s[^>]*>/gi)].map((m) => m[0]);
  const canonical = links.filter((t) => /\bcanonical\b/i.test(attr(t, "rel") ?? "")).map((t) => attr(t, "href"))[0] ?? null;
  const lang = attr(/<html(?:\s[^>]*)?>/i.exec(html)?.[0] ?? "", "lang");
  const h1 = [...html.matchAll(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/gi)].map((m) => clean(m[1]) ?? "").filter(Boolean);
  let ldBlocks = 0, ldErrors = 0; const ldTypes = new Set();
  for (const m of html.matchAll(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    ldBlocks++;
    try {
      const parsed = JSON.parse(m[1].trim());
      const walk = (n, d = 0) => { if (d > 6 || n == null) return; if (Array.isArray(n)) return n.forEach((x) => walk(x, d + 1)); if (typeof n === "object") { const t = n["@type"]; if (typeof t === "string") ldTypes.add(t); else if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && ldTypes.add(x)); if (n["@graph"]) walk(n["@graph"], d + 1); } };
      walk(parsed);
    } catch { ldErrors++; }
  }
  const anchors = [...html.matchAll(/<a\s[^>]*>/gi)].map((m) => attr(m[0], "href")).filter((h) => h && !/^(mailto:|tel:|sms:|javascript:|#)/i.test(h));
  const imgs = [...html.matchAll(/<img\s[^>]*>/gi)].map((m) => m[0]);
  const imagesWithoutAlt = imgs.filter((t) => !hasAttr(t, "alt") && !/\srole\s*=\s*["']?(presentation|none)/i.test(t)).length;
  let body = /<body[\s>][\s\S]*?<\/body>/i.exec(html)?.[0] ?? html;
  body = body.replace(/<(script|style|noscript|template|svg|nav|header|footer)[\s>][\s\S]*?<\/\1>/gi, " ");
  const words = (clean(body) ?? "").split(" ").filter((w) => /[A-Za-z0-9]/.test(w)).length;
  return { title, description, noindex, viewport, canonical, lang, h1, jsonLd: { blocks: ldBlocks, errors: ldErrors, types: [...ldTypes] }, links: [...new Set(anchors)], images: { total: imgs.length, withoutAlt: imagesWithoutAlt }, words };
}

/** Text folded for a contains-check: case, curly quotes, dashes and spaces read alike (lib/seo/tech/html.ts foldText). */
export const foldText = (s) => String(s).normalize("NFKC").toLowerCase().replace(/[\u2018\u2019\u02bc\u2032]/g, "'").replace(/[\u201c\u201d\u2033]/g, '"').replace(/[\u2010-\u2015\u2212]/g, "-").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

/** What a visitor can read on a page, and everything its markup carries including scripts, both folded. */
export function pageTexts(html) {
  const body = /<body[\s>][\s\S]*?<\/body>/i.exec(html)?.[0] ?? html;
  const visible = foldText(decode(body.replace(/<(script|style|noscript|template)[\s>][\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, "")));
  const source = foldText(decode(html.replace(/<[^>]+>/g, " ")));
  return { visible, source };
}

/* ------------------------------------------------------------ the pages */

const normPath = (p) => { const q = p.replace(/[?#].*$/, ""); return q === "" ? "/" : q; };
const samePage = (a, b) => normPath(a).replace(/\/+$/, "") === normPath(b).replace(/\/+$/, "");

async function pagesFromDir(dir) {
  const out = new Map();
  const files = [];
  const walk = async (d) => { for (const e of await fs.readdir(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== "_next" && e.name !== "node_modules") await walk(p); } else if (e.isFile() && e.name.endsWith(".html")) files.push(p); } };
  await walk(dir);
  for (const f of files) {
    const rel = path.relative(dir, f).split(path.sep).join("/");
    let p = "/" + rel;
    if (rel === "index.html") p = "/";
    else if (rel.endsWith("/index.html")) p = "/" + rel.slice(0, -"index.html".length);
    else if (rel.endsWith(".html")) p = "/" + rel.slice(0, -5);
    if (/^\/(404|500|_error)(\.html)?$/.test(p) || ignore?.test(p)) continue;
    const html = await fs.readFile(f, "utf8");
    out.set(p, { path: p, status: 200, read: readHtml(html), file: f });
  }
  const exists = async (p) => {
    const rel = normPath(p).replace(/^\//, "");
    const candidates = rel === "" ? ["index.html"] : rel.endsWith("/") ? [`${rel}index.html`, rel.slice(0, -1) + ".html"] : [rel, `${rel}.html`, `${rel}/index.html`];
    for (const c of candidates) { try { const st = await fs.stat(path.join(dir, c)); if (st.isFile()) return c.endsWith(".html") ? "page" : "file"; } catch { /* next */ } }
    return null;
  };
  const html = async (p) => {
    const rel = normPath(p).replace(/^\//, "").replace(/\/+$/, "");
    for (const c of rel === "" ? ["index.html"] : [`${rel}.html`, `${rel}/index.html`, rel]) { try { return await fs.readFile(path.join(dir, c), "utf8"); } catch { /* next */ } }
    return null;
  };
  return { pages: out, resolve: exists, html, origin: args.origin ?? null, mode: "dir" };
}

async function fetchChain(url, method = "GET") {
  const chain = [];
  let next = url;
  for (let hop = 0; hop < 8; hop++) {
    let res;
    try { res = await fetch(next, { method, redirect: "manual", headers: { "User-Agent": "AdrythmSeoAudit/1.0", Accept: "text/html,*/*;q=0.5" }, signal: AbortSignal.timeout(15000) }); }
    catch { chain.push({ url: next, status: 599 }); return { status: 599, finalUrl: next, chain, html: null }; }
    const loc = res.headers.get("location");
    chain.push({ url: next, status: res.status });
    if (res.status >= 300 && res.status < 400 && loc) { next = new URL(loc, next).href; continue; }
    const type = res.headers.get("content-type") ?? "";
    const html = method === "GET" && res.ok && /html/i.test(type) ? await res.text() : null;
    if (method === "HEAD") { try { await res.arrayBuffer(); } catch { /* drained */ } }
    return { status: res.status, finalUrl: next, chain, html };
  }
  return { status: 310, finalUrl: next, chain, html: null };
}

async function pagesFromUrl(origin) {
  const base = new URL(origin);
  const max = Number(args.pages ?? 200);
  const pages = new Map();
  const status = new Map();
  const queue = ["/"];
  const seen = new Set(["/"]);
  let inFlight = 0;
  // A local copy's sitemap and absolute links name the live host: those are this site's pages too.
  const ownHosts = new Set([bareHost(base.hostname), ...(canonicalOrigin ? [bareHost(new URL(canonicalOrigin).hostname)] : [])]);
  const internal = (href, from) => { try { const u = new URL(href, new URL(from, base).href); if (!ownHosts.has(bareHost(u.hostname))) return null; return u.pathname + u.search; } catch { return null; } };
  for (const u of await readSitemap(args.sitemap ?? new URL("/sitemap.xml", base).href, true)) { const p = internal(u, "/"); if (p && !seen.has(normPath(p))) { seen.add(normPath(p)); queue.push(normPath(p)); } }
  const worker = async () => {
    while (queue.length && pages.size + inFlight < max) {
      const p = queue.shift();
      if (ignore?.test(p)) continue;
      inFlight++;
      const got = await fetchChain(new URL(p, base).href);
      const redirected = got.chain.length > 1;
      const finalPath = (() => { try { const u = new URL(got.finalUrl); return u.pathname + u.search; } catch { return p; } })();
      status.set(p, { status: got.status, redirected, finalPath });
      if (got.status === 200 && got.html && !redirected) {
        const read = readHtml(got.html);
        pages.set(p, { path: p, status: 200, read });
        for (const href of read.links) { const ip = internal(href, p); if (!ip) continue; const n = normPath(ip); if (!seen.has(n)) { seen.add(n); queue.push(n); } }
      } else if (got.status === 200 && redirected && !seen.has(normPath(finalPath))) { seen.add(normPath(finalPath)); queue.push(normPath(finalPath)); }
      inFlight--;
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  // Whatever is still queued is checked for status alone.
  const rest = queue.splice(0);
  await Promise.all(Array.from({ length: 6 }, async () => { while (rest.length) { const p = rest.shift(); if (status.has(p)) continue; const got = await fetchChain(new URL(p, base).href, "HEAD"); status.set(p, { status: got.status, redirected: got.chain.length > 1, finalPath: p }); } }));
  const resolve = async (p) => {
    const n = normPath(p);
    const s = status.get(n) ?? status.get(n.replace(/\/+$/, "")) ?? status.get(n + "/");
    if (!s) { const got = await fetchChain(new URL(n, base).href, "HEAD"); status.set(n, { status: got.status, redirected: got.chain.length > 1, finalPath: n }); return got.status === 200 ? (got.chain.length > 1 ? "redirect" : "page") : null; }
    return s.status === 200 ? (s.redirected ? "redirect" : "page") : null;
  };
  const html = async (p) => { const got = await fetchChain(new URL(p, base).href); return got.status === 200 ? got.html : null; };
  return { pages, resolve, html, origin: base.origin, mode: "url", truncated: pages.size >= max };
}

async function readSitemap(where, quiet = false) {
  let xml;
  try { xml = /^https?:\/\//i.test(where) ? await (await fetch(where, { signal: AbortSignal.timeout(15000) })).text() : await fs.readFile(where, "utf8"); }
  catch { if (!quiet) console.error(`sitemap not readable: ${where}`); return []; }
  if (!/<(urlset|sitemapindex)[\s>]/i.test(xml)) return [];
  const urls = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((m) => decode(m[1]));
  if (/<sitemapindex[\s>]/i.test(xml)) { const all = []; for (const u of urls) all.push(...(await readSitemap(/^https?:\/\//i.test(where) ? u : path.join(path.dirname(where), path.basename(new URL(u).pathname)), true))); return all; }
  return urls;
}

/* --------------------------------------------------------------- checks */

async function audit() {
  const site = args.dir ? await pagesFromDir(args.dir) : await pagesFromUrl(args.url);
  const sitemapWhere = args.sitemap ?? (args.dir ? path.join(args.dir, "sitemap.xml") : new URL("/sitemap.xml", site.origin).href);
  const sitemapUrls = sitemapWhere ? await readSitemap(sitemapWhere, true) : [];
  const sitemapPaths = new Set(sitemapUrls.map((u) => { try { return normPath(new URL(u).pathname); } catch { return normPath(u); } }));
  const findings = [];
  const add = (id, level, title, rows, hint = "") => { if (rows.length) findings.push({ id, level, title, count: rows.length, rows: rows.slice(0, LIMIT), hint }); };
  const pages = [...site.pages.values()].filter((p) => !p.read.noindex || sitemapPaths.has(normPath(p.path)));
  const indexable = pages.filter((p) => !p.read.noindex);
  const canonOrigin = canonicalOrigin ?? site.origin;
  const ownHosts = new Set([site.origin, canonicalOrigin].filter(Boolean).map((o) => bareHost(new URL(o).hostname)));
  const isSelfCanonical = (p) => { if (!p.read.canonical) return false; try { const c = new URL(p.read.canonical, canonOrigin ?? "https://x.invalid"); return samePage(c.pathname, p.path) && (!canonOrigin || c.origin === canonOrigin); } catch { return false; } };
  const own = indexable.filter((p) => !p.read.canonical || isSelfCanonical(p));

  add("title-missing", "error", "Pages with no title", indexable.filter((p) => !p.read.title).map((p) => ({ path: p.path })));
  const byTitle = group(own.filter((p) => p.read.title), (p) => p.read.title.toLowerCase());
  add("title-shared", "error", "Pages sharing a title", [...byTitle.entries()].filter(([, ps]) => ps.length > 1).flatMap(([t, ps]) => ps.map((p) => ({ path: p.path, title: t, sharedWith: ps.filter((o) => o !== p).map((o) => o.path).slice(0, 5) }))), "Give each page a title that says what only it is about.");
  add("title-length", "warn", "Titles outside 20 to 60 characters", own.filter((p) => p.read.title && (p.read.title.length > 60 || p.read.title.length < 20)).map((p) => ({ path: p.path, length: p.read.title.length, title: p.read.title })));
  add("description-missing", "error", "Pages with no meta description", indexable.filter((p) => !p.read.description).map((p) => ({ path: p.path })));
  const byDesc = group(own.filter((p) => p.read.description), (p) => p.read.description.toLowerCase());
  add("description-shared", "warn", "Pages sharing a description", [...byDesc.entries()].filter(([, ps]) => ps.length > 1).flatMap(([, ps]) => ps.map((p) => ({ path: p.path, sharedWith: ps.filter((o) => o !== p).map((o) => o.path).slice(0, 5) }))));
  add("description-length", "warn", "Descriptions outside 70 to 160 characters", own.filter((p) => p.read.description && (p.read.description.length < 70 || p.read.description.length > 160)).map((p) => ({ path: p.path, length: p.read.description.length })));
  add("h1-missing", "error", "Pages with no h1", indexable.filter((p) => p.read.h1.length === 0).map((p) => ({ path: p.path })));
  add("h1-multiple", "warn", "Pages with more than one h1", indexable.filter((p) => p.read.h1.length > 1).map((p) => ({ path: p.path, h1s: p.read.h1.slice(0, 3) })));
  add("canonical-missing", "warn", "Pages with no canonical", indexable.filter((p) => !p.read.canonical).map((p) => ({ path: p.path })));
  add("canonical-elsewhere", "error", "Pages whose canonical names another address", indexable.filter((p) => p.read.canonical && !isSelfCanonical(p)).map((p) => ({ path: p.path, canonical: p.read.canonical })), "Right only for a deliberate copy; an original points at itself.");
  add("noindex-in-sitemap", "error", "Pages the sitemap lists that are noindex", [...site.pages.values()].filter((p) => p.read.noindex && sitemapPaths.has(normPath(p.path))).map((p) => ({ path: p.path })));
  add("jsonld-invalid", "error", "Pages whose JSON-LD does not parse", pages.filter((p) => p.read.jsonLd.errors > 0).map((p) => ({ path: p.path, blocks: p.read.jsonLd.blocks, errors: p.read.jsonLd.errors })));
  const home = site.pages.get("/");
  if (home && !home.read.jsonLd.types.some((t) => /Organization|LocalBusiness|Business|Service|Plumber|Electrician|Contractor|Store|Dentist|Agent/i.test(t))) findings.push({ id: "jsonld-home", level: "warn", title: "The home page has no Organization or LocalBusiness structured data", count: 1, rows: [{ path: "/", types: home.read.jsonLd.types }], hint: "" });
  add("images-alt", "warn", "Images with no alt text", pages.filter((p) => p.read.images.withoutAlt > 0).map((p) => ({ path: p.path, withoutAlt: p.read.images.withoutAlt, images: p.read.images.total })).sort((a, b) => b.withoutAlt - a.withoutAlt), `${pages.reduce((a, p) => a + p.read.images.withoutAlt, 0)} images in all.`);
  add("thin", "warn", `Pages under ${THIN_WORDS} words of body copy`, indexable.filter((p) => p.path !== "/" && p.read.words < THIN_WORDS).map((p) => ({ path: p.path, words: p.read.words })).sort((a, b) => a.words - b.words));
  add("viewport-lang", "warn", "Pages with no viewport tag or no lang attribute", pages.filter((p) => !p.read.viewport || !p.read.lang).map((p) => ({ path: p.path, viewport: p.read.viewport, lang: p.read.lang })));

  // Internal links.
  const broken = []; const toRedirect = []; const checked = new Map();
  for (const p of pages) {
    for (const href of p.read.links) {
      let target;
      try { const u = new URL(href, site.origin ?? `https://x.invalid${p.path}`); if (site.origin && !ownHosts.has(bareHost(u.hostname))) continue; if (!site.origin && /^[a-z]+:\/\//i.test(href)) continue; target = u.pathname + u.search; } catch { continue; }
      if (ignore?.test(target)) continue;
      if (/\.(xml|txt|pdf|jpe?g|png|gif|svg|webp|ico|css|js|mp4|zip)$/i.test(target) && args.dir) { if (!(await site.resolve(target))) broken.push({ path: p.path, href: target }); continue; }
      let r = checked.get(target);
      if (r === undefined) { r = await site.resolve(target); checked.set(target, r); }
      if (!r) broken.push({ path: p.path, href: target });
      else if (r === "redirect") toRedirect.push({ path: p.path, href: target });
    }
  }
  add("link-broken", "error", "Internal links to pages that do not exist", broken, args.dir ? "Resolved against the built folder: a path with no .html, index.html or file behind it." : "A 4xx, 5xx or no answer.");
  add("link-redirect", "warn", "Internal links that go through a redirect", toRedirect, "Link to the address the page lands on.");

  // Words a change was meant to put on a page.
  const expectRows = [];
  for (const e of [].concat(args.expect ?? [])) {
    const bar = String(e).indexOf("|");
    const where = bar > 0 ? normPath(String(e).slice(0, bar).trim()) : "";
    const words = bar > 0 ? String(e).slice(bar + 1).trim() : "";
    if (!where || !words) { expectRows.push({ path: String(e).slice(0, 80), says: "not <path>|<words>" }); continue; }
    const html = await site.html(where);
    if (html == null) { expectRows.push({ path: where, says: "no page" }); continue; }
    const t = pageTexts(html);
    const w = foldText(words);
    if (!t.visible.includes(w)) expectRows.push({ path: where, text: words.slice(0, 80), says: t.source.includes(w) ? "in scripts or data only" : "not on the page" });
  }
  add("text-missing", "error", "Words a change added that a visitor cannot read", expectRows, "Render them from the template; a sentence only in scripts or JSON-LD is in data the page never shows.");

  // The sitemap against the pages.
  if (sitemapPaths.size) {
    const missing = [];
    // At an address every entry not crawled is a HEAD, so the check is pooled and capped at twice the page budget.
    const entries = [...sitemapPaths];
    const cap = site.mode === "dir" ? entries.length : Math.min(entries.length, Number(args.pages ?? 200) * 2);
    let i = 0;
    await Promise.all(Array.from({ length: site.mode === "dir" ? 1 : 6 }, async () => {
      while (i < cap) {
        const sp = entries[i++];
        const r = site.mode === "dir" ? await site.resolve(sp) : (site.pages.has(sp) || site.pages.has(sp.replace(/\/+$/, "")) || site.pages.has(sp + "/") ? "page" : await site.resolve(sp));
        if (r !== "page") missing.push({ path: sp, says: r === "redirect" ? "redirects" : "no page" });
      }
    }));
    add("sitemap-dead", "error", "Sitemap entries with no live page behind them", missing, cap < entries.length ? `${entries.length - cap} entries beyond the page budget were not checked.` : "");
    add("sitemap-missing", "warn", "Pages the sitemap leaves out", indexable.filter((p) => !sitemapPaths.has(normPath(p.path)) && !sitemapPaths.has(normPath(p.path).replace(/\/+$/, "")) && !sitemapPaths.has(normPath(p.path) + "/") && isSelfCanonicalOrNone(p)).map((p) => ({ path: p.path })));
  } else if (sitemapWhere) findings.push({ id: "sitemap-none", level: "warn", title: `No sitemap read at ${sitemapWhere}`, count: 1, rows: [], hint: "" });

  function isSelfCanonicalOrNone(p) { return !p.read.canonical || isSelfCanonical(p); }
  return { mode: site.mode, origin: site.origin, canonicalOrigin: canonOrigin, pages: site.pages.size, sitemapEntries: sitemapPaths.size, truncated: site.truncated ?? false, findings };
}

function group(items, by) { const m = new Map(); for (const i of items) { const k = by(i); m.set(k, [...(m.get(k) ?? []), i]); } return m; }

function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const k = a.slice(2);
    const flag = ["json", "all", "strict", "help"].includes(k);
    if (k === "expect") { o.expect = [...(o.expect ?? []), argv[++i]]; continue; }
    o[k] = flag ? true : argv[++i];
  }
  return o;
}

/* --------------------------------------------------------------- output */

const result = await audit();
const errors = result.findings.filter((f) => f.level === "error");
const warns = result.findings.filter((f) => f.level === "warn");
if (args.json) {
  console.log(JSON.stringify({ ...result, ok: errors.length === 0 && (!args.strict || warns.length === 0) }, null, 1));
} else {
  console.log(`seo-audit: ${result.pages} pages (${result.mode}${result.origin ? `, ${result.origin}` : ""}${result.canonicalOrigin && result.canonicalOrigin !== result.origin ? `, canonicals on ${result.canonicalOrigin}` : ""}), ${result.sitemapEntries} sitemap entries${result.truncated ? ", page limit reached" : ""}`);
  for (const f of [...errors, ...warns]) {
    console.log(`\n${f.level === "error" ? "ERROR" : "warn "} ${f.id}: ${f.title} (${f.count})${f.hint ? `\n      ${f.hint}` : ""}`);
    for (const r of f.rows) console.log(`      ${r.path}${Object.entries(r).filter(([k]) => k !== "path").map(([k, v]) => ` ${k}=${Array.isArray(v) ? v.join(",") : v}`).join("")}`);
    if (f.count > f.rows.length) console.log(`      ... ${f.count - f.rows.length} more (--all lists them)`);
  }
  console.log(`\n${errors.length} error check${errors.length === 1 ? "" : "s"}, ${warns.length} warning check${warns.length === 1 ? "" : "s"}.`);
}
process.exit(errors.length > 0 || (args.strict && warns.length > 0) ? 1 : 0);
