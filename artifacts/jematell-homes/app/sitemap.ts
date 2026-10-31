import type { MetadataRoute } from "next";
import { SITE_URL } from "@/seo/siteMeta";
import { getAllRoutes, blogSlugs } from "@/lib/routeList";
import { noindexEstimateRoutes } from "@/data/estimateScenarios";
import { faqDataset } from "@/data/faq";
import { referenceEntries, jurisdictionSlugOf } from "@/data/reference";
import { glossaryTerms } from "@/data/glossary";
import { guides } from "@/data/guides";
import { pages } from "@/data/pages";
import lastmodJson from "@/data/lastmod.json";

export const dynamic = "force-static";

/** Routes that carry noindex metadata and must not appear in the sitemap. */
const NOINDEX_ROUTES = new Set(["/thank-you", ...noindexEstimateRoutes()]);

/**
 * When each source's own content last changed (scripts/lastmod.mjs reads it
 * from git history; never the build time). A route's lastmod is the newest of
 * its sources; a route with none gets no lastmod rather than a guess.
 */
const LASTMOD = lastmodJson as Record<string, string>;

/** Scraped-page keys whose route is not /<key> (mirrors contentPageMeta). */
const PAGE_KEY_BY_PATH: Record<string, string> = {
  "/spec-homes": "spechomes",
  "/floor-plans": "floorplans",
  "/about": "aboutus",
  "/privacy": "privacypolicy",
};

function newest(keys: string[]): string | undefined {
  let best: string | undefined;
  for (const k of keys) {
    const d = LASTMOD[k];
    if (d && (!best || d > best)) best = d;
  }
  return best;
}

function sourcesFor(route: string): string[] {
  const seg = route.split("/").filter(Boolean);
  if (seg.length === 0) return ["file:app/page.tsx"];
  const [top, a, b] = seg;
  switch (top) {
    case "faq":
      if (!a) return faqDataset.all().map((i) => `faq:${i.slug}`);
      if (a === "topics" && b)
        return faqDataset
          .all()
          .filter((i) => i.topicSlugs.includes(b))
          .map((i) => `faq:${i.slug}`);
      return [`faq:${a}`];
    case "glossary":
      return a ? [`glossary:${a}`] : glossaryTerms.map((t) => `glossary:${t.slug}`);
    case "guides":
      return a ? [`guide:${a}`] : guides.map((g) => `guide:${g.slug}`);
    case "blog":
      return a ? [`blog:${a}`] : blogSlugs().map((s) => `blog:${s}`);
    case "reference-library": {
      if (!a) return referenceEntries.map((e) => `reference:${e.module}/${e.slug}`);
      const inModule = referenceEntries.filter((e) => e.module === a);
      if (!b) return inModule.map((e) => `reference:${e.module}/${e.slug}`);
      if (inModule.some((e) => e.slug === b)) return [`reference:${a}/${b}`];
      return inModule.filter((e) => jurisdictionSlugOf(e.slug) === b).map((e) => `reference:${e.module}/${e.slug}`);
    }
    case "where-we-build":
      return a ? [`page:${a}`] : ["page:where-we-build", "file:app/where-we-build/page.tsx"];
    case "gallery":
      return a ? [`page:gallery_${a}`] : ["file:app/gallery/page.tsx"];
    case "floor-plans":
      return a ? [`file:app/floor-plans/${a}`] : ["page:floorplans", "file:app/floor-plans/page.tsx"];
    case "financing":
      return a === "estimate" ? ["file:src/data/estimateScenarios.ts"] : ["file:app/financing/page.tsx"];
    default: {
      const key = PAGE_KEY_BY_PATH[route] ?? top;
      return pages[key] ? [`page:${key}`, `file:app/${top}/page.tsx`] : [`file:app/${top}/page.tsx`];
    }
  }
}

/** sitemap.xml: every indexable route, with lastmod where its content's last change is known. */
export default function sitemap(): MetadataRoute.Sitemap {
  return getAllRoutes()
    .filter((r) => !NOINDEX_ROUTES.has(r))
    .map((r) => {
      const d = newest(sourcesFor(r));
      return d ? { url: `${SITE_URL}${r}`, lastModified: d } : { url: `${SITE_URL}${r}` };
    });
}
