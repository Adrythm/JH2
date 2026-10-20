/**
 * reference.ts — the web app's entry point to the Reference Library: adopted
 * building codes by city, Arizona building-law statutes, the residential code
 * explained, and guard-gated community design guidelines. Authored as markdown
 * in the content repo, converted to reference.json (title + rich HTML +
 * primary-source attribution + related links). Pure data — SSG and browser.
 */
import referenceJson from "./reference.json";

export interface ReferenceSource {
  title: string;
  url: string;
}
export interface ReferenceEntry {
  slug: string;
  module: string;
  title: string;
  /** Optional <title> override; the title stays the H1. See FaqItem.seoTitle. */
  seoTitle?: string;
  shortSummary: string;
  bodyHtml: string;
  metaDescription: string;
  category: string;
  refSchemaType: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceLicense: string;
  relatedTerms: string[];
  relatedFaqs: string[];
  relatedRefs: string[];
  sources: ReferenceSource[];
  updatedDate: string;
}

export interface ReferenceModuleMeta {
  slug: string;
  title: string;
  description: string;
}

/** The four Reference Library modules, in display order. */
export const REFERENCE_MODULES: ReferenceModuleMeta[] = [
  {
    slug: "building-codes",
    title: "City Building Codes",
    description:
      "The adopted building codes, permit requirements, inspections, zoning, and fees for every city and county we build in.",
  },
  {
    slug: "arizona-building-law",
    title: "Arizona Building Law",
    description:
      "The Arizona Revised Statutes that govern custom home building, contractors, liens, water, and land use, explained section by section.",
  },
  {
    slug: "code-library",
    title: "Residential Code Explained",
    description:
      "The International Residential Code in plain language, section by section, as it applies to building a home in the Arizona desert.",
  },
  {
    slug: "community-design-guidelines",
    title: "Community Design Guidelines",
    description:
      "How the design-review standards of Arizona's guard-gated and master-planned communities shape what you can build.",
  },
];

export const referenceEntries = referenceJson as unknown as ReferenceEntry[];

const byKey = new Map(referenceEntries.map((e) => [`${e.module}/${e.slug}`, e]));
const moduleBySlug = new Map(REFERENCE_MODULES.map((m) => [m.slug, m]));

export function getReferenceModule(slug: string): ReferenceModuleMeta | undefined {
  return moduleBySlug.get(slug);
}
export function getReferenceEntry(module: string, slug: string): ReferenceEntry | undefined {
  return byKey.get(`${module}/${slug}`);
}
export function getReferenceByKey(key: string): ReferenceEntry | undefined {
  return byKey.get(key);
}

/** Entries in a module, grouped by category (each group sorted by title). */
export function referencesByCategory(module: string): { category: string; entries: ReferenceEntry[] }[] {
  const groups = new Map<string, ReferenceEntry[]>();
  for (const e of referenceEntries.filter((x) => x.module === module)) {
    (groups.get(e.category) ?? groups.set(e.category, []).get(e.category)!).push(e);
  }
  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([category, entries]) => ({
      category,
      entries: entries.sort((a, b) => a.title.localeCompare(b.title)),
    }));
}

/** How many entries each module holds — shown on the hub cards. */
export function moduleCount(module: string): number {
  return referenceEntries.filter((e) => e.module === module).length;
}

// --- Per-city (jurisdiction) grouping for the building-codes module ------------
// The building-codes collection is a per-city hub-and-spoke: the module index lists
// cities, each city hub lists that city's spokes. A city is derived from an entry
// slug by longest-prefix match against the registry below; cross-city comparison
// hubs (arizona-*, corner-lot-*) fall through to the Statewide bucket.

export interface JurisdictionMeta {
  slug: string; // URL segment: /reference-library/building-codes/<slug>
  name: string;
  county: string;
  blurb: string;
}

/** Jurisdictions in display order (service-area prominence). */
export const BUILDING_CODE_JURISDICTIONS: JurisdictionMeta[] = [
  { slug: "scottsdale", name: "Scottsdale", county: "Maricopa County", blurb: "Adopted I-code editions, residential permit and inspection steps, hillside and Environmentally Sensitive Lands rules, zoning setbacks, green building, and fees for a custom home in Scottsdale." },
  { slug: "phoenix", name: "Phoenix", county: "Maricopa County", blurb: "Adopted codes, residential permit requirements, the inspection sequence, zoning setbacks, and permit and impact fees for building in the City of Phoenix." },
  { slug: "paradise-valley", name: "Paradise Valley", county: "Maricopa County", blurb: "Adopted codes, permits, inspections, hillside development rules, zoning setbacks, and fees for a custom home in the Town of Paradise Valley." },
  { slug: "fountain-hills", name: "Fountain Hills", county: "Maricopa County", blurb: "Adopted codes, permits, inspections, the residential fire sprinkler requirement, zoning setbacks, and fees for building in the Town of Fountain Hills." },
  { slug: "cave-creek", name: "Cave Creek", county: "Maricopa County", blurb: "Adopted codes, residential permits, inspections, zoning setbacks, and fees for a custom home in the Town of Cave Creek." },
  { slug: "carefree", name: "Carefree", county: "Maricopa County", blurb: "Adopted codes, permits, inspections, zoning setbacks, and fees for building in the Town of Carefree." },
  { slug: "mesa", name: "Mesa", county: "Maricopa County", blurb: "Adopted codes, permits, inspections, zoning setbacks, and permit and impact fees for a custom home in the City of Mesa." },
  { slug: "surprise", name: "Surprise", county: "Maricopa County", blurb: "Adopted codes, residential permit requirements and fees, and zoning setbacks for building a custom home in the City of Surprise." },
  { slug: "apache-junction", name: "Apache Junction", county: "Pinal County", blurb: "Adopted codes, residential permits, inspections, zoning setbacks, and fees for building in the City of Apache Junction." },
  { slug: "casa-grande", name: "Casa Grande", county: "Pinal County", blurb: "Adopted codes, permits, inspections, zoning setbacks, and fees for a custom home in the City of Casa Grande." },
  { slug: "maricopa-county", name: "Maricopa County", county: "Unincorporated", blurb: "Adopted codes, permits, inspections, septic and well rules, zoning setbacks, and fees for building in unincorporated Maricopa County, including the Rio Verde Foothills." },
  { slug: "pinal-county", name: "Pinal County", county: "Unincorporated", blurb: "The building, permit, septic, and well requirements for a custom home in unincorporated Pinal County." },
];

export const STATEWIDE_JURISDICTION: JurisdictionMeta = {
  slug: "statewide",
  name: "Statewide & Cross-City",
  county: "Arizona",
  blurb: "How the adopted code editions, permit fees, and setback rules compare across the Arizona cities and counties we build in.",
};

const PER_CITY_MODULES = new Set(["building-codes"]);
export function moduleIsPerCity(module: string): boolean {
  return PER_CITY_MODULES.has(module);
}

const JURISDICTIONS_BY_LEN = [...BUILDING_CODE_JURISDICTIONS].sort(
  (a, b) => b.slug.length - a.slug.length,
);

/** City slug for a building-codes entry slug ("statewide" for cross-city hubs). */
export function jurisdictionSlugOf(entrySlug: string): string {
  for (const j of JURISDICTIONS_BY_LEN) {
    if (entrySlug === j.slug || entrySlug.startsWith(`${j.slug}-`)) return j.slug;
  }
  return STATEWIDE_JURISDICTION.slug;
}

export function getJurisdiction(module: string, citySlug: string): JurisdictionMeta | undefined {
  if (!moduleIsPerCity(module)) return undefined;
  if (citySlug === STATEWIDE_JURISDICTION.slug) return STATEWIDE_JURISDICTION;
  return BUILDING_CODE_JURISDICTIONS.find((j) => j.slug === citySlug);
}

export interface JurisdictionGroup {
  jurisdiction: JurisdictionMeta;
  entries: ReferenceEntry[];
}

/** building-codes entries grouped by city, in registry order (statewide last). Only
 *  jurisdictions that actually have entries are returned. */
export function jurisdictionsInModule(module: string): JurisdictionGroup[] {
  if (!moduleIsPerCity(module)) return [];
  const entries = referenceEntries.filter((e) => e.module === module);
  const order = [...BUILDING_CODE_JURISDICTIONS, STATEWIDE_JURISDICTION];
  return order
    .map((jurisdiction) => ({
      jurisdiction,
      entries: entries
        .filter((e) => jurisdictionSlugOf(e.slug) === jurisdiction.slug)
        .sort((a, b) => a.title.localeCompare(b.title)),
    }))
    .filter((g) => g.entries.length > 0);
}

// Logical reading order for a city hub's spokes (falls back to alphabetical).
const CATEGORY_ORDER = [
  "Adopted Codes",
  "Permits",
  "Inspections",
  "Zoning & Setbacks",
  "City Special Topics",
  "Site and Utilities",
];
function categoryRank(c: string): number {
  const i = CATEGORY_ORDER.indexOf(c);
  return i === -1 ? CATEGORY_ORDER.length : i;
}

/** One city's entries grouped by category, in logical reading order (city hub page). */
export function referencesForCity(
  module: string,
  citySlug: string,
): { category: string; entries: ReferenceEntry[] }[] {
  const groups = new Map<string, ReferenceEntry[]>();
  for (const e of referenceEntries.filter(
    (x) => x.module === module && jurisdictionSlugOf(x.slug) === citySlug,
  )) {
    (groups.get(e.category) ?? groups.set(e.category, []).get(e.category)!).push(e);
  }
  return [...groups.entries()]
    .sort((a, b) => categoryRank(a[0]) - categoryRank(b[0]) || a[0].localeCompare(b[0]))
    .map(([category, entries]) => ({
      category,
      entries: entries.sort((a, b) => a.title.localeCompare(b.title)),
    }));
}

/** All Reference Library in-app paths — consumed by the prerender route list. */
export function referenceRoutes(): string[] {
  const routes = ["/reference-library"];
  for (const m of REFERENCE_MODULES) routes.push(`/reference-library/${m.slug}`);
  for (const m of REFERENCE_MODULES) {
    for (const g of jurisdictionsInModule(m.slug)) {
      routes.push(`/reference-library/${m.slug}/${g.jurisdiction.slug}`);
    }
  }
  for (const e of referenceEntries) routes.push(`/reference-library/${e.module}/${e.slug}`);
  return routes;
}
