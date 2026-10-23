/**
 * interlink.ts — the resolution half of the interlinking engine.
 *
 * Every resource detail page (faq, glossary, guide, reference) wants to end with
 * a set of "keep exploring" sections. Curated links alone cannot carry that:
 * measured against the live data, 96% of glossary terms have zero relatedFaqs,
 * 23% of reference pages have zero relatedTerms, 53% of guides have zero
 * relatedGuides, and 67 of 245 reference pages have no inbound related-link at
 * all. A presentation-only fix would just render empty boxes more prettily.
 *
 * So this module resolves each relation in two passes:
 *   1. CURATED  — the entry's own hand-authored slugs, in authored order.
 *   2. DERIVED  — computed from real signals (shared category, shared module,
 *      shared topic/tag, glossary terms actually mentioned in the body) when the
 *      curated list is short, marked so the UI can label them honestly.
 *
 * Everything here is pure and deterministic: it runs at build time under static
 * export, so no Math.random, no Date.now, and identical input always yields
 * identical output (otherwise SSG output churns between builds).
 */
import { faqDataset, SERVICE_LINKS } from "@/data/faq";
import { locations } from "@/config/siteConfig";
import { glossaryTerms, getGlossaryTerm, type GlossaryTerm } from "@/data/glossary";
import {
  referenceEntries,
  getReferenceByKey,
  referencesForCity,
  jurisdictionSlugOf,
  moduleIsPerCity,
  BUILDING_CODE_JURISDICTIONS,
  REFERENCE_MODULES,
  type JurisdictionMeta,
  type ReferenceEntry,
} from "@/data/reference";
import { guides, getGuide, type Guide } from "@/data/guides";

/** What kind of thing a link points at. Drives the icon and the accent colour. */
export type LinkKind = "faq" | "glossary" | "reference" | "guide" | "service" | "blog";

export interface LinkItem {
  to: string;
  label: string;
  kind: LinkKind;
  /** Short supporting line. Card and accordion variants show it; list does not. */
  blurb?: string;
  /** Tiny qualifier, e.g. the reference module or glossary category. */
  meta?: string;
  /** True when this came from a signal rather than an authored link. */
  derived?: boolean;
}

export type SourceKind = "faq" | "glossary" | "reference" | "guide" | "region" | "jurisdiction";

/* ------------------------------------------------------------------ *
 * shaping helpers
 * ------------------------------------------------------------------ */

const MODULE_TITLE = new Map(REFERENCE_MODULES.map((m) => [m.slug, m.title]));

/** First sentence, capped. Used as the card/accordion supporting line. */
function firstSentence(text: string, max = 150): string {
  const clean = (text || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const cut = clean.search(/[.!?]\s/);
  const s = cut > 0 ? clean.slice(0, cut + 1) : clean;
  return s.length > max ? s.slice(0, max).replace(/\s+\S*$/, "") + "..." : s;
}

const faqItem = (f: { slug: string; question: string; shortAnswer?: string }, derived?: boolean): LinkItem => ({
  to: `/faq/${f.slug}`,
  label: f.question,
  kind: "faq",
  blurb: firstSentence(f.shortAnswer || ""),
  derived,
});

const termItem = (t: GlossaryTerm, derived?: boolean): LinkItem => ({
  to: `/glossary/${t.slug}`,
  label: t.term,
  kind: "glossary",
  blurb: firstSentence(t.shortDefinition || ""),
  meta: t.category || undefined,
  derived,
});

const refItem = (r: ReferenceEntry, derived?: boolean): LinkItem => ({
  to: `/reference-library/${r.module}/${r.slug}`,
  label: r.title,
  kind: "reference",
  blurb: firstSentence(r.shortSummary || ""),
  meta: MODULE_TITLE.get(r.module) || undefined,
  derived,
});

const guideItem = (g: Guide, derived?: boolean): LinkItem => ({
  to: `/guides/${g.slug}`,
  label: g.title,
  kind: "guide",
  blurb: firstSentence((g as { summary?: string }).summary || ""),
  derived,
});

/** Keep first occurrence of each destination, drop self, cap length. */
function dedupe(items: LinkItem[], selfPath: string, limit: number): LinkItem[] {
  const seen = new Set<string>([selfPath]);
  const out: LinkItem[] = [];
  for (const it of items) {
    if (!it || seen.has(it.to)) continue;
    seen.add(it.to);
    out.push(it);
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * Curated first, then derived only if we are still short of `limit`. Derived
 * links are a floor, not a replacement: a page with good authored links never
 * shows computed ones.
 */
function fill(curated: LinkItem[], derive: () => LinkItem[], selfPath: string, limit: number): LinkItem[] {
  const first = dedupe(curated, selfPath, limit);
  if (first.length >= Math.min(3, limit)) return first;
  return dedupe([...first, ...derive()], selfPath, limit);
}

/* ------------------------------------------------------------------ *
 * derivation signals
 * ------------------------------------------------------------------ */

/**
 * Names a term can realistically be written as in running prose. Glossary titles
 * are disambiguated ("Abandonment (Construction Contract)", "Arizona Registrar
 * of Contractors (ROC)", "Blue Stake / Arizona 811 (utility locating)"), so a
 * literal match on the full title finds nothing. We match the base name, any
 * parenthetical abbreviation, and each side of a slash.
 */
function termAliases(term: string): string[] {
  const out: string[] = [];
  const base = term.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  if (base) out.push(base);
  for (const m of term.matchAll(/\(([^)]+)\)/g)) {
    const inner = m[1].trim();
    // keep short abbreviations (ROC, AHJ, CO), drop descriptive parentheticals
    if (inner && inner.length <= 12 && !inner.includes(" ")) out.push(inner);
  }
  for (const part of base.split("/")) {
    const p = part.trim();
    if (p && p !== base) out.push(p);
  }
  return [...new Set(out)].filter((a) => a.length >= 3);
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Word-boundary match so a 3-letter abbreviation cannot match inside a word. */
function mentionsAlias(hay: string, term: string): boolean {
  return termAliases(term).some((a) => new RegExp(`\\b${escapeRe(a)}\\b`, "i").test(hay));
}

/** Glossary terms whose name actually appears in a body, longest name first. */
function termsMentionedIn(html: string, limit: number): GlossaryTerm[] {
  const hay = (html || "").replace(/<[^>]+>/g, " ");
  if (!hay) return [];
  return [...glossaryTerms]
    .sort((a, b) => b.term.length - a.term.length)
    .filter((t) => mentionsAlias(hay, t.term))
    .slice(0, limit);
}

/** FAQs sharing a topic or category, ranked by overlap then dataset order. */
function faqsBySignal(topicSlugs: string[], categorySlug: string | undefined, limit: number) {
  const wanted = new Set(topicSlugs);
  return faqDataset
    .all()
    .map((f) => {
      const overlap = (f.topicSlugs || []).filter((t) => wanted.has(t)).length;
      const cat = categorySlug && f.categorySlug === categorySlug ? 1 : 0;
      return { f, score: overlap * 2 + cat };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.f);
}

/**
 * Searchable text per FAQ, built once for the whole render rather than per page.
 * There are ~350 FAQs and ~330 resource pages, so rebuilding this inline would
 * mean scanning the full answer corpus a hundred thousand times per build.
 */
const FAQ_INDEX = faqDataset.all().map((f) => ({
  f,
  question: f.question,
  brief: f.shortAnswer || "",
  body: f.answer || "",
}));

/**
 * FAQs that actually talk about a term, ranked by where the term appears. A
 * match in the question outranks the short answer, which outranks the body, so
 * the accordion leads with the FAQ whose title is genuinely on topic rather than
 * one that mentions the term once in passing.
 */
function faqsMentioning(phrase: string, limit: number) {
  if (!phrase || phrase.length < 3) return [];
  return FAQ_INDEX.map((r) => {
    const score =
      (mentionsAlias(r.question, phrase) ? 4 : 0) +
      (mentionsAlias(r.brief, phrase) ? 2 : 0) +
      (mentionsAlias(r.body, phrase) ? 1 : 0);
    return { f: r.f, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.f);
}

/* ------------------------------------------------------------------ *
 * public resolvers, one per source kind
 * ------------------------------------------------------------------ */

export interface RelationSet {
  /** bucket id -> resolved items. Empty buckets are omitted by the config layer. */
  [bucket: string]: LinkItem[];
}

export function relationsForGlossary(term: GlossaryTerm): RelationSet {
  const self = `/glossary/${term.slug}`;
  const curatedTerms = term.relatedTerms.map(getGlossaryTerm).filter(Boolean) as GlossaryTerm[];
  const curatedFaqs = term.relatedFaqs.map((s) => faqDataset.getItem(s)).filter(Boolean);

  return {
    terms: fill(
      curatedTerms.map((t) => termItem(t)),
      () =>
        glossaryTerms
          .filter((t) => t.slug !== term.slug && t.category && t.category === term.category)
          .slice(0, 8)
          .map((t) => termItem(t, true)),
      self,
      6,
    ),
    // The big one: 96% of terms have no curated FAQ link, so almost every page
    // here is answered by the derived pass rather than authored data.
    faqs: fill(
      curatedFaqs.map((f) => faqItem(f as never)),
      () => faqsMentioning(term.term, 6).map((f) => faqItem(f, true)),
      self,
      4,
    ),
    references: fill(
      [],
      () =>
        referenceEntries
          .filter((r) => (r.relatedTerms || []).includes(term.slug))
          .slice(0, 6)
          .map((r) => refItem(r, true)),
      self,
      4,
    ),
    guides: fill(
      [],
      () => guides.filter((g) => (g.relatedTerms || []).includes(term.slug)).slice(0, 3).map((g) => guideItem(g, true)),
      self,
      3,
    ),
  };
}

export function relationsForReference(entry: ReferenceEntry): RelationSet {
  const self = `/reference-library/${entry.module}/${entry.slug}`;
  const curatedRefs = (entry.relatedRefs || []).map(getReferenceByKey).filter(Boolean) as ReferenceEntry[];
  const curatedFaqs = (entry.relatedFaqs || []).map((s) => faqDataset.getItem(s)).filter(Boolean);
  const curatedTerms = (entry.relatedTerms || []).map(getGlossaryTerm).filter(Boolean) as GlossaryTerm[];

  return {
    references: fill(
      curatedRefs.map((r) => refItem(r)),
      () =>
        referenceEntries
          .filter((r) => r.slug !== entry.slug && r.module === entry.module && r.category === entry.category)
          .slice(0, 8)
          .map((r) => refItem(r, true)),
      self,
      6,
    ),
    faqs: fill(
      curatedFaqs.map((f) => faqItem(f as never)),
      () => faqsMentioning(entry.category || "", 4).map((f) => faqItem(f, true)),
      self,
      4,
    ),
    terms: fill(
      curatedTerms.map((t) => termItem(t)),
      () => termsMentionedIn(entry.bodyHtml || "", 6).map((t) => termItem(t, true)),
      self,
      6,
    ),
    guides: fill(
      [],
      () =>
        guides
          .filter((g) => (g.relatedRefs || []).some((k) => String(k).endsWith(entry.slug)))
          .slice(0, 3)
          .map((g) => guideItem(g, true)),
      self,
      3,
    ),
    // The way back to the business from a code page. A Scottsdale setback
    // rule links to the Scottsdale city page; a statute or IRC section, which
    // has no city, links to the service pages instead.
    services: dedupe(
      [
        ...(moduleIsPerCity(entry.module)
          ? cityPagesForJurisdiction(jurisdictionSlugOf(entry.slug))
          : []),
        ...serviceItems(["build-on-your-lot", "custom-homes"]),
      ],
      self,
      3,
    ),
  };
}

/* ------------------------------------------------------------------ *
 * City page <-> Reference Library city hub
 *
 * The building-codes module is a per-jurisdiction hub-and-spoke, and every
 * jurisdiction we build in has a city page under /where-we-build. Until now
 * the two never linked to each other except through the nav: the Scottsdale
 * codes hub earned 855 impressions in a month while the Scottsdale city page
 * earned 115. These resolvers give each side a descriptive path to the other.
 *
 * A city page can span more than one jurisdiction (Casa Grande builds fall
 * under the city or unincorporated Pinal County), and a jurisdiction can map
 * to no city page yet (Paradise Valley, Mesa). Both maps are explicit so that
 * adding a city page or a jurisdiction is a one-line change here, and the
 * city-page side is keyed on SERVICE_LINKS so a page that does not exist is
 * simply skipped rather than linked to a 404.
 * ------------------------------------------------------------------ */

const BUILDING_CODES = "building-codes";

/** City page slug -> jurisdiction slugs whose rules apply on that page's lots. */
const CITY_JURISDICTIONS: Record<string, string[]> = {
  scottsdale: ["scottsdale"],
  phoenix: ["phoenix"],
  "cave-creek": ["cave-creek"],
  "fountain-hills": ["fountain-hills"],
  carefree: ["carefree"],
  "casa-grande": ["casa-grande", "pinal-county"],
  "apache-junction": ["apache-junction", "pinal-county"],
  "rio-verde": ["maricopa-county"],
  "paradise-valley": ["paradise-valley"],
  surprise: ["surprise"],
};

/** Jurisdiction slug -> city page slugs where those rules apply. */
const JURISDICTION_CITIES: Record<string, string[]> = {};
for (const [city, js] of Object.entries(CITY_JURISDICTIONS)) {
  for (const j of js) (JURISDICTION_CITIES[j] ??= []).push(city);
}

/** Jurisdiction slug -> the place names a guide's `city` field or a FAQ question might use. */
const JURISDICTION_PLACE_NAMES: Record<string, string[]> = {
  "maricopa-county": ["Maricopa County", "Rio Verde"],
  "pinal-county": ["Pinal County", "Casa Grande", "Apache Junction"],
};

function jurisdictionMeta(slug: string): JurisdictionMeta | undefined {
  return BUILDING_CODE_JURISDICTIONS.find((j) => j.slug === slug);
}

function serviceItems(keys: string[], derived = true): LinkItem[] {
  return keys
    .map((k) => SERVICE_LINKS[k])
    .filter((s): s is { label: string; href: string } => Boolean(s))
    .map((s) => ({ to: s.href, label: s.label, kind: "service" as const, derived }));
}

function cityPagesForJurisdiction(jslug: string): LinkItem[] {
  return serviceItems((JURISDICTION_CITIES[jslug] || []).map((c) => `where-we-build/${c}`));
}

/**
 * The town page for a building-codes entry whose jurisdiction IS that town
 * (a Scottsdale setback rule -> /where-we-build/scottsdale). County and
 * statewide entries return null: their lots span several towns.
 */
export function townPageForReference(entry: ReferenceEntry): { name: string; href: string } | null {
  if (!moduleIsPerCity(entry.module)) return null;
  const j = jurisdictionSlugOf(entry.slug);
  if (!(JURISDICTION_CITIES[j] || []).includes(j)) return null;
  const link = SERVICE_LINKS[`where-we-build/${j}`];
  const loc = locations.find((l) => l.slug === j);
  return link && loc ? { name: loc.name, href: link.href } : null;
}

function hubItem(j: JurisdictionMeta): LinkItem {
  return {
    to: `/reference-library/${BUILDING_CODES}/${j.slug}`,
    label: `${j.name} Building Codes`,
    kind: "reference",
    blurb: firstSentence(j.blurb),
    meta: MODULE_TITLE.get(BUILDING_CODES),
    derived: true,
  };
}

function guidesForPlaces(names: string[]): LinkItem[] {
  return guides
    .filter((g) => g.city && names.some((n) => g.city.startsWith(n)))
    .map((g) => guideItem(g, true));
}

/**
 * FAQs whose QUESTION names the place. Case-sensitive on the proper noun and
 * question-only on purpose: faqsMentioning() also scores answer bodies, where
 * "no surprises" and "carefree" are ordinary words. Cost questions first, since
 * they are the highest-intent ones for someone reading a city page.
 */
function faqsForPlaces(names: string[], limit: number): LinkItem[] {
  const res = names.map((n) => new RegExp(`\\b${escapeRe(n)}\\b`));
  return FAQ_INDEX.filter((r) => res.some((re) => re.test(r.question)))
    .map((r) => ({ r, cost: /cost|price|budget|how much/i.test(r.question) ? 0 : 1 }))
    .sort((a, b) => a.cost - b.cost)
    .slice(0, limit)
    .map((x) => faqItem(x.r.f, true));
}

/** "Keep exploring" for a /where-we-build city page. */
export function relationsForRegion(citySlug: string, cityName: string): RelationSet {
  const self = `/where-we-build/${citySlug}`;
  const js = (CITY_JURISDICTIONS[citySlug] || []).map(jurisdictionMeta).filter(Boolean) as JurisdictionMeta[];
  const refs: LinkItem[] = [];
  for (const j of js) {
    refs.push(hubItem(j));
    // Round-robin across categories (adopted codes, permits, inspections,
    // zoning, fees...) so the block shows one spoke of each kind before a
    // second permit type crowds out the zoning page.
    const groups = referencesForCity(BUILDING_CODES, j.slug).map((g) => [...g.entries]);
    for (let round = 0; groups.some((g) => g.length > round); round++) {
      for (const g of groups) if (g[round]) refs.push(refItem(g[round], true));
    }
  }
  return {
    references: dedupe(refs, self, 6),
    guides: dedupe(guidesForPlaces([cityName]), self, 2),
    faqs: dedupe(faqsForPlaces([cityName], 4), self, 4),
  };
}

/** "Keep exploring" for a /reference-library/building-codes/<jurisdiction> hub. */
export function relationsForJurisdiction(j: JurisdictionMeta): RelationSet {
  const self = `/reference-library/${BUILDING_CODES}/${j.slug}`;
  const names = JURISDICTION_PLACE_NAMES[j.slug] || [j.name];
  return {
    services: dedupe(
      [...cityPagesForJurisdiction(j.slug), ...serviceItems(["build-on-your-lot", "where-we-build"])],
      self,
      3,
    ),
    guides: dedupe(guidesForPlaces(names), self, 2),
    faqs: dedupe(faqsForPlaces(names, 4), self, 4),
  };
}

export function relationsForGuide(guide: Guide): RelationSet {
  const self = `/guides/${guide.slug}`;
  const curatedFaqs = (guide.relatedFaqs || []).map((s) => faqDataset.getItem(s)).filter(Boolean);
  const curatedGuides = (guide.relatedGuides || []).map(getGuide).filter(Boolean) as Guide[];
  const curatedRefs = (guide.relatedRefs || []).map(getReferenceByKey).filter(Boolean) as ReferenceEntry[];
  const curatedTerms = (guide.relatedTerms || []).map(getGlossaryTerm).filter(Boolean) as GlossaryTerm[];

  return {
    faqs: fill(curatedFaqs.map((f) => faqItem(f as never)), () => [], self, 6),
    guides: fill(
      curatedGuides.map((g) => guideItem(g)),
      () => guides.filter((g) => g.slug !== guide.slug).slice(0, 4).map((g) => guideItem(g, true)),
      self,
      3,
    ),
    references: fill(curatedRefs.map((r) => refItem(r)), () => [], self, 6),
    terms: fill(curatedTerms.map((t) => termItem(t)), () => [], self, 8),
  };
}

/* ------------------------------------------------------------------ *
 * FAQ -> service derivation
 *
 * Every seed entry authors relatedServiceSlugs, but 272 of 350 author exactly
 * ["custom-homes"], so before this the "Related services" block was the same
 * one link on almost every page and no FAQ pointed at a city page, financing,
 * floor plans or the portfolio from its body. The maps below answer "what
 * would this reader do next?" per topic; the city the question names wins
 * first, since a Rio Verde well question belongs on the Rio Verde page.
 * Curated slugs still come first (fill() only derives when they are short).
 * ------------------------------------------------------------------ */

/** Topic slug -> service slugs (keys of SERVICE_LINKS), most relevant first. */
const TOPIC_SERVICES: Record<string, string[]> = {
  "buying-land-to-build": ["buy-a-lot-with-us", "build-on-your-lot"],
  "rural-water-and-septic": ["build-on-your-lot", "buy-a-lot-with-us"],
  "rio-verde-water": ["where-we-build/rio-verde", "build-on-your-lot"],
  "budgeting-a-custom-home": ["financing", "floor-plans"],
  "per-city-cost": ["financing", "floor-plans"],
  "construction-financing": ["financing", "build-on-your-lot"],
  "choosing-a-custom-home-builder": ["custom-homes", "gallery"],
  "building-permits-arizona": ["build-on-your-lot", "where-we-build"],
  "pre-construction-permits": ["build-on-your-lot", "where-we-build"],
  "zoning-setbacks-adus": ["casitas", "build-on-your-lot"],
  "adus-and-casitas": ["casitas", "build-on-your-lot"],
  "desert-build-essentials": ["floor-plans", "gallery"],
  "foundations-and-soils": ["build-on-your-lot", "buy-a-lot-with-us"],
  "luxury-features": ["gallery", "floor-plans"],
  "architectural-styles": ["gallery", "floor-plans"],
  "rv-garages": ["rv-garages", "rv-garage-build"],
  "remodeling-and-additions": ["custom-homes", "gallery"],
  "warranty-and-defects": ["warranty", "custom-homes"],
};

/**
 * Case-sensitive on purpose: questions write place names as proper nouns, and
 * "surprise" or "carefree" in lower case are ordinary words, not the towns.
 */
const CITY_MENTIONS = locations.map((l) => ({
  key: `where-we-build/${l.slug}`,
  re: new RegExp(`\\b${escapeRe(l.name)}\\b`),
}));

function derivedServices(detail: { question: string; topicSlugs?: string[] }): LinkItem[] {
  const keys: string[] = [];
  for (const c of CITY_MENTIONS) if (c.re.test(detail.question)) keys.push(c.key);
  for (const t of detail.topicSlugs || []) for (const k of TOPIC_SERVICES[t] || []) keys.push(k);
  keys.push("custom-homes");
  return keys
    .map((k) => SERVICE_LINKS[k])
    .filter((s): s is { label: string; href: string } => Boolean(s))
    .map((s) => ({ to: s.href, label: s.label, kind: "service" as const, derived: true }));
}

export function relationsForFaq(
  detail: { slug: string; question: string; topicSlugs?: string[]; categorySlug?: string; relatedFaqSlugs?: string[] },
  related: { slug: string; question: string; shortAnswer?: string }[],
  services: { href: string; label: string }[],
  pillar?: { slug: string; title: string } | null,
): RelationSet {
  const self = `/faq/${detail.slug}`;
  return {
    faqs: fill(
      related.map((f) => faqItem(f)),
      () => faqsBySignal(detail.topicSlugs || [], detail.categorySlug, 6).map((f) => faqItem(f, true)),
      self,
      6,
    ),
    services: fill(
      services.map((s) => ({ to: s.href, label: s.label, kind: "service" as const })),
      () => derivedServices(detail),
      self,
      4,
    ),
    terms: fill(
      [],
      () => termsMentionedIn(detail.question, 4).map((t) => termItem(t, true)),
      self,
      4,
    ),
    references: fill(
      [],
      () =>
        referenceEntries
          .filter((r) => (r.relatedFaqs || []).includes(detail.slug))
          .slice(0, 4)
          .map((r) => refItem(r, true)),
      self,
      4,
    ),
    deeper: pillar ? [{ to: `/blog/${pillar.slug}`, label: pillar.title, kind: "blog" as const }] : [],
  };
}
