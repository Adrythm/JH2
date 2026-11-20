import lastmodJson from "@/data/lastmod.json";

/**
 * When each source's own content last changed, as scripts/lastmod.mjs reads it
 * from git history (never the build time). The sitemap's lastmod and a page's
 * JSON-LD dateModified both come from here, so the two always agree.
 * Keys: faq:<slug>, blog:<slug>, glossary:<slug>, guide:<slug>,
 * reference:<module>/<slug>, page:<key>, file:<path>.
 */
export const CONTENT_LASTMOD = lastmodJson as Record<string, string>;

/** The ISO day a source last changed, or undefined when it is not known. */
export function contentLastmod(key: string): string | undefined {
  return CONTENT_LASTMOD[key];
}
