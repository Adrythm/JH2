/**
 * routeList.ts — the full list of in-app paths, ported verbatim from
 * entry-server.tsx getRoutes(). Single source for sitemap.xml and the
 * route-parity gate (scripts/route-parity.mjs compares the export output and
 * scripts/routes-baseline.txt against this list). Every dynamic route's
 * generateStaticParams derives from the same data modules, so the three views
 * cannot drift silently.
 */
import { pages } from "../data/pages";
import { blogs } from "../data/blogs";
import { locations, locationHref } from "../config/siteConfig";
import { faqRoutes } from "../data/faq";
import { glossaryRoutes } from "../data/glossary";
import { referenceRoutes } from "../data/reference";
import { guideRoutes } from "../data/guides";
import { estimateScenarioRoutes } from "../data/estimateScenarios";

function isRealPost(slug: string): boolean {
  if (slug === "blog-articles") return false;
  if (/[%+]/.test(slug)) return false;
  if (/^(category_|tag_|author_)/i.test(slug)) return false;
  return true;
}

/** Blog slugs that get real pages (mirrors the old prerender filter). */
export function blogSlugs(): string[] {
  return Object.keys(blogs).filter(isRealPost);
}

/** Gallery detail slugs: the hand-built Skinner Custom page + every scraped gallery_ page. */
export function gallerySlugs(): string[] {
  const slugs = new Set<string>(["skinner-custom"]);
  for (const key of Object.keys(pages)) {
    if (key.startsWith("gallery_")) slugs.add(key.slice("gallery_".length));
  }
  return Array.from(slugs);
}

/** The full list of in-app paths to export. Single source for the sitemap. */
export function getAllRoutes(): string[] {
  const routes = new Set<string>([
    "/",
    "/gallery",
    "/custom-homes",
    "/spec-homes",
    "/floor-plans",
    "/floor-plans/1849",
    "/floor-plans/1644",
    "/floor-plans/1604",
    "/floor-plans/2616",
    "/floor-plans/2867",
    "/floor-plans/2086",
    "/floor-plans/2194",
    "/floor-plans/2997",
    "/floor-plans/2045",
    "/floor-plans/3094",
    "/floor-plans/3102",
    "/floor-plans/3610",
    "/floor-plans/3771",
    "/floor-plans/3970",
    "/floor-plans/4103",
    "/where-we-build",
    "/build-on-your-lot",
    "/buy-a-lot-with-us",
    "/casitas-and-guest-houses",
    "/rv-garages",
    "/about",
    "/contact",
    "/warranty",
    "/privacy",
    "/thank-you",
    "/blog",
    "/llm-info",
    "/for-agents",
    "/disclaimer",
    "/financing",
    "/resources",
  ]);
  for (const loc of locations) routes.add(locationHref(loc.slug));
  for (const slug of gallerySlugs()) routes.add(`/gallery/${slug}`);
  for (const slug of blogSlugs()) routes.add(`/blog/${slug}`);
  for (const r of faqRoutes()) routes.add(r);
  for (const r of glossaryRoutes()) routes.add(r);
  for (const r of referenceRoutes()) routes.add(r);
  for (const r of guideRoutes()) routes.add(r);
  for (const r of estimateScenarioRoutes()) routes.add(r);
  return Array.from(routes);
}
