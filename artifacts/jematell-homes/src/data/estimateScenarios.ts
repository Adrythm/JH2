/**
 * estimateScenarios.ts — the fixed set of construction-loan estimates that get
 * their own prerendered page.
 *
 * Why these exist: the calculator on /financing is a client component, so a
 * crawler that does not run JavaScript sees exactly one estimate, the default
 * $900,000 Scottsdale scenario baked into the prerendered HTML. The crawlers
 * behind the AI answer engines do not run JavaScript. These pages answer the
 * question people actually ask ("what would a $1 million home in Scottsdale
 * cost per month?") in plain, already-rendered HTML, one URL per answer, the
 * same shape as the FAQ and reference-library corpora.
 *
 * The numbers come from the same @workspace/construction-loan module the
 * calculator uses, so a scenario page and the calculator can never disagree.
 * Rate assumptions are stated on every page: they are fixed at build time,
 * while the calculator loads the live 30-year fixed rate.
 */
import { TAX_LOCATIONS, type TaxLocation } from "@workspace/construction-loan";

/** Rate and schedule assumptions baked into the prerendered scenarios. */
export const SCENARIO_MORTGAGE_RATE_PCT = 6.5;
export const SCENARIO_CONSTRUCTION_RATE_PCT = 7.75;
export const SCENARIO_BUILD_MONTHS = 12;
export const SCENARIO_TERM_YEARS = 30;

export interface PricePoint {
  value: number;
  slug: string;
  /** Prose label, e.g. "$1 million". */
  label: string;
  /** Exact figure, e.g. "$1,000,000". */
  exact: string;
}

export const SCENARIO_PRICES: PricePoint[] = [
  { value: 600000, slug: "600k", label: "$600,000", exact: "$600,000" },
  { value: 800000, slug: "800k", label: "$800,000", exact: "$800,000" },
  { value: 1000000, slug: "1-million", label: "$1 million", exact: "$1,000,000" },
  { value: 1500000, slug: "1-5-million", label: "$1.5 million", exact: "$1,500,000" },
  { value: 2000000, slug: "2-million", label: "$2 million", exact: "$2,000,000" },
];

/**
 * Down payments worth publishing. Construction lenders in Arizona typically
 * want 20 to 25 percent down, so these bracket the real range; 10 percent is
 * left out because it is not a scenario most construction lenders will write.
 */
export const SCENARIO_DOWN_PCTS = [20, 25, 30];

/** Cities only: the statewide-average row is a fallback, not a place to build. */
export const SCENARIO_LOCATIONS: TaxLocation[] = TAX_LOCATIONS.filter(
  (l) => l.county !== "Statewide",
);

export interface EstimateScenario {
  slug: string;
  price: PricePoint;
  location: TaxLocation;
  downPct: number;
}

export function scenarioSlug(price: PricePoint, location: TaxLocation, downPct: number): string {
  return `${price.slug}-home-in-${location.slug}-with-${downPct}-percent-down`;
}

export const estimateScenarios: EstimateScenario[] = SCENARIO_PRICES.flatMap((price) =>
  SCENARIO_LOCATIONS.flatMap((location) =>
    SCENARIO_DOWN_PCTS.map((downPct) => ({
      slug: scenarioSlug(price, location, downPct),
      price,
      location,
      downPct,
    })),
  ),
);

const bySlug = new Map(estimateScenarios.map((s) => [s.slug, s]));

export function getEstimateScenario(slug: string): EstimateScenario | undefined {
  return bySlug.get(slug);
}

export function estimateScenarioRoutes(): string[] {
  return estimateScenarios.map((s) => `/financing/estimate/${s.slug}`);
}

/**
 * The down payment whose pages Google is asked to index: one page per budget
 * and city. The 25 and 30 percent pages repeat their 20 percent sibling with
 * one figure changed, and 135 near-identical pages read as scaled content
 * (Google's spam policies) while taking crawl from the service pages. They
 * stay published for readers, linked from their sibling, but carry noindex
 * and leave the sitemap. Reversible: drop the check to index them again.
 */
export const INDEXED_DOWN_PCT = 20;

export function isIndexedScenario(s: EstimateScenario): boolean {
  return s.downPct === INDEXED_DOWN_PCT;
}

export function noindexEstimateRoutes(): string[] {
  return estimateScenarios
    .filter((s) => !isIndexedScenario(s))
    .map((s) => `/financing/estimate/${s.slug}`);
}

/** Title used for the page, its metadata, and the links that point at it. */
export function scenarioTitle(s: EstimateScenario): string {
  return `Monthly payment on a ${s.price.label} home in ${s.location.name}, AZ with ${s.downPct}% down`;
}

/**
 * The handful of scenarios featured on /financing itself, so the calculator
 * band is followed by worked examples a crawler can read without running any
 * JavaScript. One per price point, at the most common 20 percent down, in the
 * two cities Jematell builds in most.
 */
export function featuredScenarios(): EstimateScenario[] {
  const featuredCities = ["scottsdale", "rio-verde"];
  const out: EstimateScenario[] = [];
  for (const price of SCENARIO_PRICES) {
    for (const city of featuredCities) {
      const found = estimateScenarios.find(
        (s) => s.price.slug === price.slug && s.location.slug === city && s.downPct === 20,
      );
      if (found) out.push(found);
    }
  }
  return out;
}
