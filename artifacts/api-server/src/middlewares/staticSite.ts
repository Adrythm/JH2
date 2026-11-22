/**
 * staticSite.ts — production serving for the Jematell Homes Next static export.
 *
 * The site is `output: "export"` with trailingSlash:false, so canonical URLs
 * have no trailing slash and pages live in out/ as <route>.html (or
 * <route>/index.html). A plain static host can't resolve extensionless URLs to
 * .html, emit real 301s for the old-site URL migration, or serve precompressed
 * variants — so the api-server (which already owns /api) serves the site too:
 *
 *   1. Old-site URLs listed in redirects.json get a real permanent 301 to
 *      their new equivalent (single hop, no chains). The map ships empty until
 *      the Squarespace launch cutover fills it.
 *   2. Trailing-slash requests for extensionless pages 301 to the canonical
 *      slashless URL.
 *   3. Files are served from out/ with correct content types, long immutable
 *      caching for hashed /_next/static/ assets, weak ETags, and
 *      Accept-Encoding negotiation against the .br/.gz siblings written by
 *      the site build's precompress step (falls back to the raw file).
 *   4. Unknown URLs get the exported 404.html with a real 404 status, and so
 *      do the export's own missing-page files (/404, /_not-found and their
 *      .html names). A page's export file name (/index.html, /<route>.html)
 *      301s to its clean URL, so no page has a second address.
 *
 * Adapted from the G Brothers production site server (same semantics, inverted
 * trailing-slash convention).
 */
import type { Request, Response, NextFunction } from "express";
import { existsSync, readFileSync, statSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
// When bundled, `here` is artifacts/api-server/dist; in tsx dev it is
// artifacts/api-server/src/middlewares. Walk up until the artifacts dir.
function defaultSiteDir(): string {
  let d = here;
  for (let i = 0; i < 6; i++) {
    const candidate = join(d, "jematell-homes", "out");
    if (existsSync(candidate)) return candidate;
    d = resolve(d, "..");
  }
  return resolve(here, "..", "..", "jematell-homes", "out");
}

const OUT_DIR = process.env["STATIC_DIR"]
  ? resolve(process.env["STATIC_DIR"])
  : defaultSiteDir();
const REDIRECTS_FILE =
  process.env["REDIRECTS_FILE"] || resolve(OUT_DIR, "..", "redirects.json");

function loadRedirects(): Record<string, string> {
  try {
    return JSON.parse(readFileSync(REDIRECTS_FILE, "utf8"));
  } catch {
    return {};
  }
}
const REDIRECTS: Record<string, string> = loadRedirects();

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

const COMPRESSIBLE = new Set([
  ".html", ".js", ".mjs", ".css", ".json", ".txt", ".xml", ".svg", ".map", ".webmanifest",
]);
const IMAGE_OR_FONT = new Set([
  ".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".ico", ".svg",
  ".woff", ".woff2", ".ttf",
]);

function extOf(p: string): string {
  const last = p.split("/").pop() ?? "";
  const i = last.lastIndexOf(".");
  return i >= 0 ? last.slice(i).toLowerCase() : "";
}

const isFilePath = (p: string) => extOf(p) !== "";

/** Canonicalize a request path to the site's no-trailing-slash convention. */
function normalizePath(raw: string | undefined): string {
  let path = (raw || "/").split("?")[0]!.split("#")[0]!;
  try {
    path = decodeURIComponent(path);
  } catch {
    /* keep raw on malformed encoding */
  }
  if (!path.startsWith("/")) path = "/" + path;
  path = path.replace(/\/{2,}/g, "/");
  if (path === "/") return "/";
  return path.replace(/\/+$/, "");
}

/** Resolve a canonical page/asset path to a file inside out/, guarding traversal. */
function resolveFile(path: string): string | null {
  if (path === "/") {
    return join(OUT_DIR, "index.html");
  }
  const rel = path.replace(/^\/+/, "");
  const candidates = isFilePath(path)
    ? [rel]
    : [`${rel}.html`, join(rel, "index.html")];
  for (const c of candidates) {
    const full = normalize(join(OUT_DIR, c));
    if (!full.startsWith(OUT_DIR)) return null; // path traversal attempt
    if (existsSync(full)) {
      try {
        if (statSync(full).isFile()) return full;
      } catch {
        /* fall through */
      }
    }
  }
  return null;
}

/** Addresses of the exported missing-page screen, which must answer 404. */
const NOT_FOUND_KEYS = new Set(["/404", "/404.html", "/_not-found", "/_not-found.html"]);

/**
 * The clean URL a page's export file name stands for (/index.html -> /,
 * /custom-homes.html -> /custom-homes), or null when the path is not such a
 * twin or no page lives at the clean URL (then it 404s as before).
 */
export function htmlTwinTarget(key: string): string | null {
  if (key === "/index" || key === "/index.html") return "/";
  if (!key.endsWith(".html")) return null;
  const clean = key.slice(0, -".html".length).replace(/\/index$/, "");
  if (!clean || clean === "/") return "/";
  if (NOT_FOUND_KEYS.has(clean)) return null;
  return resolveFile(clean) ? clean : null;
}

function cacheControlFor(file: string, ext: string): string {
  const norm = file.replace(/\\/g, "/");
  if (norm.includes("/_next/static/")) return "public, max-age=31536000, immutable";
  if (ext === ".html") return "public, max-age=0, must-revalidate";
  if (IMAGE_OR_FONT.has(ext)) return "public, max-age=2592000"; // 30 days, not content-hashed
  return "public, max-age=3600"; // sitemap/robots/manifest etc.
}

/** Pick the smallest precompressed sibling the client accepts, if any. */
function negotiate(req: Request, file: string, ext: string): { file: string; encoding: string } | null {
  if (!COMPRESSIBLE.has(ext)) return null;
  const accepts = String(req.headers["accept-encoding"] || "");
  if (/\bbr\b/.test(accepts) && existsSync(file + ".br")) return { file: file + ".br", encoding: "br" };
  if (/\bgzip\b/.test(accepts) && existsSync(file + ".gz")) return { file: file + ".gz", encoding: "gzip" };
  return null;
}

async function send(req: Request, res: Response, file: string, status = 200): Promise<void> {
  const ext = extOf(file.replace(/\\/g, "/"));
  const s = await stat(file);
  const etag = `W/"${s.size.toString(16)}-${Math.floor(s.mtimeMs).toString(16)}"`;

  res.status(status);
  res.set("Content-Type", MIME[ext] || "application/octet-stream");
  res.set("Cache-Control", cacheControlFor(file, ext));
  res.set("ETag", etag);
  if (COMPRESSIBLE.has(ext)) res.set("Vary", "Accept-Encoding");

  // Conditional request: the client already has this exact version.
  if (status === 200 && req.headers["if-none-match"] === etag) {
    res.status(304).end();
    return;
  }

  const variant = negotiate(req, file, ext);
  if (variant) res.set("Content-Encoding", variant.encoding);

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  const body = await readFile(variant ? variant.file : file);
  res.end(body);
}

async function serve404(req: Request, res: Response): Promise<void> {
  const file = join(OUT_DIR, "404.html");
  if (existsSync(file)) {
    await send(req, res, file, 404);
  } else {
    res.status(404).type("text/plain").send("404 Not Found");
  }
}

export function staticSiteAvailable(): boolean {
  return existsSync(join(OUT_DIR, "index.html"));
}

/** The directory the static export is served from, for callers that need to read it. */
export function staticSiteDir(): string {
  return OUT_DIR;
}

export function staticSiteInfo(): string {
  return `${OUT_DIR} (${Object.keys(REDIRECTS).length} redirects)`;
}

export async function staticSite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }
    const rawPath = (req.originalUrl || req.url || "/").split("?")[0]!;
    if (rawPath.startsWith("/api/") || rawPath === "/api") {
      next();
      return;
    }

    const key = normalizePath(rawPath);

    // 1. Explicit old-site -> new-site 301 (single hop).
    const target = REDIRECTS[key];
    if (target) {
      res.set("Cache-Control", "no-cache");
      res.redirect(301, target);
      return;
    }

    // 1b. Squarespace blog category/tag/author archive listings have no new-site
    //     equivalent; consolidate them all to the blog index rather than 404.
    //     Individual posts (/blog-articles/<slug>) are exact entries handled in
    //     step 1, so only archive URLs reach this rule.
    if (/^\/blog-articles\/(category|tag|author)[/_]/.test(key)) {
      res.set("Cache-Control", "no-cache");
      res.redirect(301, "/blog");
      return;
    }

    // 1c. The missing-page screens Next exports as files of their own (404.html,
    //     _not-found.html) answer with a real 404, never a 200 at their own address.
    if (NOT_FOUND_KEYS.has(key)) {
      await serve404(req, res);
      return;
    }

    // 1d. A page's export file name is not a second address for it: /index,
    //     /index.html and /<page>.html 301 to the page's clean URL (single hop).
    const twin = htmlTwinTarget(key);
    if (twin) {
      res.set("Cache-Control", "no-cache");
      res.redirect(301, twin);
      return;
    }

    // 2. Canonical 301: trailing-slash request for a page that exists slashless.
    if (rawPath !== "/" && /\/+$/.test(rawPath) && !isFilePath(key) && resolveFile(key)) {
      res.set("Cache-Control", "no-cache");
      res.redirect(301, key || "/");
      return;
    }

    // 3. Serve a real file from out/.
    const file = resolveFile(key);
    if (file) {
      await send(req, res, file);
      return;
    }

    // 4. True 404.
    await serve404(req, res);
  } catch (e) {
    next(e);
  }
}
