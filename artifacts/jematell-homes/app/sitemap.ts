import type { MetadataRoute } from "next";
import { SITE_URL } from "@/seo/siteMeta";
import { getAllRoutes } from "@/lib/routeList";
import { noindexEstimateRoutes } from "@/data/estimateScenarios";

export const dynamic = "force-static";

/** Routes that carry noindex metadata and must not appear in the sitemap. */
const NOINDEX_ROUTES = new Set(["/thank-you", ...noindexEstimateRoutes()]);

/** sitemap.xml — same URL set as the old prerender (no lastmod/priority, matching the previous output). */
export default function sitemap(): MetadataRoute.Sitemap {
  return getAllRoutes()
    .filter((r) => !NOINDEX_ROUTES.has(r))
    .map((r) => ({ url: `${SITE_URL}${r}` }));
}
