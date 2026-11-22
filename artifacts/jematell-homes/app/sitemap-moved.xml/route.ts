import { SITE_URL } from "@/seo/siteMeta";
import redirects from "../../redirects.json";

export const dynamic = "force-static";

/**
 * sitemap-moved.xml — the old site's addresses that now 301 (redirects.json).
 *
 * Google only learns an old address moved when it fetches it again. On
 * 2026-11-22 URL Inspection still held /rio-verde as an indexed page of its
 * own (last crawl 2026-10-16), so /where-we-build/rio-verde stayed
 * "Discovered - currently not indexed" behind it. Listing the moved
 * addresses in a sitemap of their own, as Google's site-move guide does with
 * the old URLs' sitemap, gets them fetched and the 301s seen.
 *
 * Kept out of robots.txt and sitemap.xml on purpose: it is submitted in
 * Search Console, where its "URL is a redirect" warnings are expected, and
 * the site audits that read sitemap.xml stay clean. Remove it once Search
 * Console shows none of these indexed.
 */
const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export function GET() {
  const sources = Object.keys(redirects as Record<string, string>)
    .filter((p) => p.startsWith("/"))
    .sort();
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sources
      .map((p) => `  <url><loc>${escapeXml(`${SITE_URL}${p}`)}</loc></url>`)
      .join("\n") +
    `\n</urlset>\n`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
