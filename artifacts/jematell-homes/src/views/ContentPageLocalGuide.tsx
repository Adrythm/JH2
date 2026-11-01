"use client";
import type { ReactNode, ComponentType } from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { Compass, Droplets, GraduationCap, HardHat, Home, MapPin } from "lucide-react";
import type { Block } from "../data/pages";

/**
 * The "Building / Construction / Activities / Education In <City>" cards on the
 * where-we-build region pages.
 *
 * This lives in its own module (dynamically imported by ContentPage) so the
 * per-city link table below never ships to the other ContentPage routes —
 * /custom-homes in particular sits close to its JS budget.
 */

const FADE_IN = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 } as const,
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

export interface GuideCard {
  title: string;
  paras: string[];
}

/**
 * The scraper nested this h3 group inside the "Full-Service Design & Project
 * Management" section, whose renderer only reads h4 + paragraph pairs. Pull the
 * groups back out so they can render on their own.
 */
export function extractLocalGuide(blocks: Block[]): GuideCard[] {
  const cards: GuideCard[] = [];
  let current: GuideCard | null = null;
  for (const b of blocks) {
    if (b.type === "h3" && b.text) {
      if (current) cards.push(current);
      current = { title: b.text, paras: [] };
    } else if (b.type === "p" && b.text && current) {
      current.paras.push(b.text);
    }
  }
  if (current) cards.push(current);
  return cards.filter((c) => c.paras.length > 0);
}

// The "con(s)tru" pattern tolerates the "Contruction" spelling some scraped
// city pages still carry.
const LOCAL_GUIDE_ICONS: Array<[RegExp, ComponentType<{ size?: number }>]> = [
  [/^building/i, Home],
  [/^new home/i, Home],
  [/^water/i, Droplets],
  [/^buying/i, Home],
  [/^con(s)?tru/i, HardHat],
  [/^activit/i, Compass],
  [/^educat/i, GraduationCap],
];

function localGuideIcon(title: string): ComponentType<{ size?: number }> {
  const t = title.trim();
  for (const [re, Icon] of LOCAL_GUIDE_ICONS) if (re.test(t)) return Icon;
  return MapPin;
}

interface GuideLink {
  re: RegExp;
  href: string;
  external?: boolean;
  /** When set, only linkify on the named city slug(s). */
  only?: string | string[];
}

/**
 * Phrase -> destination. Patterns must NOT carry the global flag (exec would
 * then keep lastIndex between calls). Specific phrases come before generic
 * fallbacks; each destination is linked at most once per section, so listing
 * both a precise and a loose pattern for one href is safe and simply widens the
 * set of city pages that get a match.
 *
 * Every internal href is a real route (checked against scripts/routes-baseline.txt)
 * and every external URL was fetched and confirmed to resolve to the official site.
 */
const LOCAL_GUIDE_LINKS: GuideLink[] = [
  // ---- Internal: services ----
  { re: /custom home builder/i, href: "/custom-homes" },
  { re: /custom home building/i, href: "/custom-homes" },
  { re: /custom residences/i, href: "/custom-homes" },
  { re: /custom home/i, href: "/custom-homes" },
  { re: /hiking trails/i, href: "https://www.phoenix.gov/administration/departments/parks/activities-facilities/trails.html", external: true, only: "phoenix" },
  { re: /private lot/i, href: "/build-on-your-lot" },
  // ---- Internal: permitting ----
  { re: /city permitting departments/i, href: "/faq/topics/building-permits-arizona" },
  { re: /permitting process/i, href: "/faq/topics/building-permits-arizona" },
  { re: /permitting requirements/i, href: "/faq/topics/building-permits-arizona" },
  { re: /local permitting/i, href: "/faq/topics/building-permits-arizona" },
  { re: /permitting/i, href: "/faq/topics/building-permits-arizona" },
  // ---- Internal: zoning ----
  { re: /planning and zoning guidelines/i, href: "/faq/topics/zoning-setbacks-adus" },
  { re: /zoning requirements/i, href: "/faq/topics/zoning-setbacks-adus" },
  { re: /zoning standards/i, href: "/faq/topics/zoning-setbacks-adus" },
  { re: /zoning/i, href: "/faq/topics/zoning-setbacks-adus" },
  // ---- Internal: process / site conditions ----
  { re: /final walkthrough/i, href: "/faq/what-is-a-punch-list-and-final-walkthrough" },
  { re: /HOA communities/i, href: "/faq/how-does-hoa-design-review-affect-building-a-custom-home" },
  { re: /desert soil conditions/i, href: "/faq/topics/foundations-and-soils" },
  { re: /desert terrain/i, href: "/faq/topics/desert-build-essentials" },

  // ---- External: Scottsdale ----
  // Matched without the possessive so the curly apostrophe in "PGA Tour's" is
  // never part of the pattern.
  { re: /Phoenix Open/i, href: "https://www.wmphoenixopen.com", external: true },
  { re: /Scottsdale Quarter/i, href: "https://www.scottsdalequarter.com", external: true },
  { re: /McCormick-Stillman Railroad Park/i, href: "https://therailroadpark.com", external: true },
  { re: /OdySea Aquarium/i, href: "https://www.odyseaaquarium.com", external: true },
  { re: /Scottsdale Unified School District/i, href: "https://www.susd.org", external: true },
  { re: /Scottsdale Community College/i, href: "https://www.scottsdalecc.edu", external: true },
  // ---- External: Phoenix ----
  { re: /Arizona State University/i, href: "https://www.asu.edu", external: true },
  { re: /licensed real estate agents/i, href: "/buy-a-lot-with-us", only: "scottsdale" },
  {
    re: /Environmentally Sensitive Lands Ordinance/i,
    href: "/reference-library/building-codes/scottsdale-environmentally-sensitive-lands-ordinance",
    only: "scottsdale",
  },
  {
    re: /Scottsdale zoning and setbacks/i,
    href: "/reference-library/building-codes/scottsdale-residential-zoning-and-setbacks",
    only: "scottsdale",
  },
  { re: /casitas and guest houses/i, href: "/casitas-and-guest-houses", only: "scottsdale" },
  { re: /Scottsdale ADU and casita rules/i, href: "/faq/adu-and-casita-rules-in-scottsdale-arizona", only: "scottsdale" },
  {
    re: /Scottsdale building cost guide/i,
    href: "/faq/how-much-does-it-cost-to-build-a-custom-home-in-scottsdale",
    only: "scottsdale",
  },
  // ---- Internal: Cave Creek local guide ----
  { re: /licensed real estate agents/i, href: "/buy-a-lot-with-us", only: "cave-creek" },
  { re: /lot you already own/i, href: "/build-on-your-lot", only: "cave-creek" },
  {
    re: /complete guide to building a custom home in Cave Creek/i,
    href: "/guides/building-a-custom-home-in-cave-creek-complete-guide",
    only: "cave-creek",
  },
  {
    re: /Cave Creek zoning and setbacks/i,
    href: "/reference-library/building-codes/cave-creek-residential-zoning-and-setbacks",
    only: "cave-creek",
  },
  {
    re: /Cave Creek adopted building codes/i,
    href: "/reference-library/building-codes/cave-creek-adopted-building-codes",
    only: "cave-creek",
  },
  {
    re: /Cave Creek building inspections/i,
    href: "/reference-library/building-codes/cave-creek-building-inspections-process",
    only: "cave-creek",
  },
  {
    re: /desert and dark-sky design rules/i,
    href: "/faq/desert-and-dark-sky-design-rules-cave-creek-carefree",
    only: "cave-creek",
  },
  { re: /shared well agreements/i, href: "/faq/what-is-a-shared-well-agreement-in-arizona", only: "cave-creek" },
  {
    re: /Cave Creek casita rules/i,
    href: "/faq/do-cave-creek-fountain-hills-and-carefree-allow-casitas-and-adus",
    only: "cave-creek",
  },
  { re: /casitas and guest houses/i, href: "/casitas-and-guest-houses", only: "cave-creek" },
  { re: /RV garage/i, href: "/rv-garages", only: "cave-creek" },
  {
    re: /Cave Creek building cost guide/i,
    href: "/faq/how-much-does-it-cost-to-build-a-custom-home-in-cave-creek",
    only: "cave-creek",
  },
  // ---- Internal: Carefree local guide ----
  { re: /licensed real estate agents/i, href: "/buy-a-lot-with-us", only: "carefree" },
  { re: /lot you already own/i, href: "/build-on-your-lot", only: "carefree" },
  {
    re: /complete guide to building a custom home in Carefree/i,
    href: "/guides/building-a-custom-home-in-carefree-complete-guide",
    only: "carefree",
  },
  {
    re: /Carefree zoning and setbacks/i,
    href: "/reference-library/building-codes/carefree-residential-zoning-and-setbacks",
    only: "carefree",
  },
  {
    re: /Carefree adopted building codes/i,
    href: "/reference-library/building-codes/carefree-adopted-building-codes",
    only: "carefree",
  },
  {
    re: /Carefree residential permit requirements/i,
    href: "/reference-library/building-codes/carefree-residential-building-permit-requirements",
    only: "carefree",
  },
  {
    re: /Carefree building inspections/i,
    href: "/reference-library/building-codes/carefree-building-inspections-process",
    only: "carefree",
  },
  {
    re: /desert and dark-sky design rules/i,
    href: "/faq/desert-and-dark-sky-design-rules-cave-creek-carefree",
    only: "carefree",
  },
  {
    re: /Carefree Ranch design guidelines/i,
    href: "/reference-library/community-design-guidelines/carefree-ranch-lone-mountain-design-guidelines",
    only: "carefree",
  },
  {
    re: /Maricopa County septic and well requirements/i,
    href: "/reference-library/building-codes/maricopa-county-septic-and-well-requirements",
    only: "carefree",
  },
  {
    re: /Carefree guest house rules/i,
    href: "/faq/do-cave-creek-fountain-hills-and-carefree-allow-casitas-and-adus",
    only: "carefree",
  },
  { re: /casitas and guest houses/i, href: "/casitas-and-guest-houses", only: "carefree" },
  {
    re: /Carefree building cost guide/i,
    href: "/faq/how-much-does-it-cost-to-build-a-custom-home-in-carefree",
    only: "carefree",
  },
  // ---- Internal: Apache Junction local guide ----
  { re: /licensed real estate agents/i, href: "/buy-a-lot-with-us", only: "apache-junction" },
  { re: /lot you already own/i, href: "/build-on-your-lot", only: "apache-junction" },
  {
    re: /complete guide to building a custom home in Apache Junction/i,
    href: "/guides/building-a-custom-home-in-apache-junction-complete-guide",
    only: "apache-junction",
  },
  {
    re: /Apache Junction zoning and setbacks/i,
    href: "/reference-library/building-codes/apache-junction-residential-zoning-and-setbacks",
    only: "apache-junction",
  },
  {
    re: /Pinal County zoning and setbacks/i,
    href: "/reference-library/building-codes/pinal-county-residential-zoning-and-setbacks",
    only: "apache-junction",
  },
  {
    re: /Apache Junction adopted building codes/i,
    href: "/reference-library/building-codes/apache-junction-adopted-building-codes",
    only: "apache-junction",
  },
  {
    re: /Apache Junction residential permit requirements/i,
    href: "/reference-library/building-codes/apache-junction-residential-building-permit-requirements",
    only: "apache-junction",
  },
  {
    re: /Apache Junction building inspections/i,
    href: "/reference-library/building-codes/apache-junction-building-inspections-process",
    only: "apache-junction",
  },
  {
    re: /Pinal County septic and well requirements/i,
    href: "/reference-library/building-codes/pinal-county-septic-and-well-requirements",
    only: "apache-junction",
  },
  {
    re: /whether you need a soil test/i,
    href: "/faq/do-i-need-a-soil-test-to-build-a-house-in-arizona",
    only: "apache-junction",
  },
  {
    re: /Apache Junction building cost guide/i,
    href: "/faq/how-much-does-it-cost-to-build-a-custom-home-in-apache-junction",
    only: "apache-junction",
  },
  {
    re: /Apache Junction permit and impact fees/i,
    href: "/reference-library/building-codes/apache-junction-building-permit-and-impact-fees",
    only: "apache-junction",
  },
  // ---- Internal: Surprise local guide ----
  { re: /licensed real estate agents/i, href: "/buy-a-lot-with-us", only: "surprise" },
  { re: /lot you already own/i, href: "/build-on-your-lot", only: "surprise" },
  { re: /Skinner Custom home/i, href: "/gallery/skinner-custom", only: "surprise" },
  {
    re: /Surprise zoning and setbacks/i,
    href: "/reference-library/building-codes/surprise-residential-zoning-and-setbacks",
    only: "surprise",
  },
  { re: /HOA may add design review/i, href: "/faq/how-does-hoa-design-review-affect-building-a-custom-home", only: "surprise" },
  {
    re: /Surprise adopted building codes/i,
    href: "/reference-library/building-codes/surprise-adopted-building-codes",
    only: "surprise",
  },
  {
    re: /Surprise residential permit requirements/i,
    href: "/reference-library/building-codes/surprise-residential-building-permit-requirements",
    only: "surprise",
  },
  {
    re: /floodplain use permit/i,
    href: "/faq/do-i-need-a-floodplain-use-permit-to-build-near-a-wash-in-maricopa-county",
    only: "surprise",
  },
  {
    re: /a home with no fire hydrant/i,
    href: "/faq/how-does-a-rural-arizona-home-with-no-fire-hydrant-meet-fire-protection",
    only: "surprise",
  },
  {
    re: /whether you need a soil test/i,
    href: "/faq/do-i-need-a-soil-test-to-build-a-house-in-arizona",
    only: "surprise",
  },
  {
    re: /state ADU law/i,
    href: "/reference-library/arizona-building-law/ars-9-461-18-municipal-adu-law-arizona",
    only: "surprise",
  },
  {
    re: /which Arizona cities must allow ADUs/i,
    href: "/faq/which-arizona-cities-are-required-to-allow-adus",
    only: "surprise",
  },
  { re: /casitas and guest houses/i, href: "/casitas-and-guest-houses", only: "surprise" },
  { re: /an RV garage/i, href: "/rv-garages", only: "surprise" },
  {
    re: /Surprise building cost guide/i,
    href: "/faq/how-much-does-it-cost-to-build-a-custom-home-in-surprise",
    only: "surprise",
  },
  // ---- External: Cave Creek + Carefree ----
  { re: /local events/i, href: "https://www.cavecreekaz.gov/254/Tourist-Info", external: true, only: "cave-creek" },
  { re: /Cave Creek Unified School District/i, href: "https://www.ccusd93.org", external: true },
  { re: /Carefree Town Center/i, href: "https://www.carefree.org/page/carefree-town-center", external: true },
  // ---- External: Fountain Hills ----
  { re: /scenic walking trails/i, href: "https://www.fountainhillsaz.gov/295/McDowell-Mountain-Preserve-Trails", external: true, only: "fountain-hills" },
  // fhusd.org serves a mismatched certificate; fhschools.org is the live site.
  { re: /Fountain Hills Unified School District/i, href: "https://www.fhschools.org", external: true },
  { re: /licensed real estate agents/i, href: "/buy-a-lot-with-us", only: "fountain-hills" },
  {
    re: /Fountain Hills fire sprinkler requirements/i,
    href: "/reference-library/building-codes/fountain-hills-fire-sprinkler-requirements",
    only: "fountain-hills",
  },
  {
    re: /Fountain Hills zoning and setbacks/i,
    href: "/reference-library/building-codes/fountain-hills-residential-zoning-and-setbacks",
    only: "fountain-hills",
  },
  {
    re: /FireRock Ridge/i,
    href: "/reference-library/community-design-guidelines/firerock-fountain-hills-design-guidelines",
    only: "fountain-hills",
  },
  {
    re: /Fountain Hills guest house rules/i,
    href: "/faq/do-cave-creek-fountain-hills-and-carefree-allow-casitas-and-adus",
    only: "fountain-hills",
  },
  { re: /casitas and guest houses/i, href: "/casitas-and-guest-houses", only: "fountain-hills" },
  {
    re: /Fountain Hills building cost guide/i,
    href: "/faq/how-much-does-it-cost-to-build-a-custom-home-in-fountain-hills",
    only: "fountain-hills",
  },
  // ---- Internal: Rio Verde local guide ----
  { re: /licensed real estate agents/i, href: "/buy-a-lot-with-us", only: "rio-verde" },
  { re: /lot you already own/i, href: "/build-on-your-lot", only: "rio-verde" },
  {
    re: /how to get water to a home in Rio Verde Foothills/i,
    href: "/faq/how-to-get-water-to-a-home-in-rio-verde-foothills",
    only: "rio-verde",
  },
  {
    re: /building in Rio Verde Foothills without city water/i,
    href: "/faq/can-you-build-a-custom-home-in-rio-verde-foothills-without-city-water",
    only: "rio-verde",
  },
  {
    re: /Maricopa County septic and well requirements/i,
    href: "/reference-library/building-codes/maricopa-county-septic-and-well-requirements",
    only: "rio-verde",
  },
  {
    re: /building on rural land in Rio Verde/i,
    href: "/faq/what-do-i-need-to-build-on-rural-land-in-rio-verde-arizona",
    only: "rio-verde",
  },
  {
    re: /Maricopa County zoning and setbacks/i,
    href: "/reference-library/building-codes/maricopa-county-residential-zoning-and-setbacks",
    only: "rio-verde",
  },
  {
    re: /Maricopa County grading and drainage permit/i,
    href: "/reference-library/building-codes/maricopa-county-grading-and-drainage-permit",
    only: "rio-verde",
  },
  {
    re: /county ADU law/i,
    href: "/reference-library/arizona-building-law/ars-11-810-01-county-adu-law-arizona",
    only: "rio-verde",
  },
  { re: /casitas and guest houses/i, href: "/casitas-and-guest-houses", only: "rio-verde" },
  {
    re: /Rio Verde building cost guide/i,
    href: "/faq/how-much-does-it-cost-to-build-a-custom-home-in-rio-verde",
    only: "rio-verde",
  },
  // ---- External: Casa Grande ----
  { re: /regional parks/i, href: "https://casagrandeaz.gov/250/Facilities-Parks-Trails", external: true, only: "casa-grande" },
  { re: /Casa Grande Union High School District/i, href: "https://www.cguhsd.org", external: true },
  { re: /Central Arizona College/i, href: "https://www.centralaz.edu", external: true },
  { re: /spec homes/i, href: "/spec-homes", only: "casa-grande" },
  { re: /Designation of Assured Water Supply/i, href: "https://www.azwater.com/news/docs/NR_ADAWS_Designation.pdf", external: true, only: "casa-grande" },
  { re: /construction financing/i, href: "/financing", only: "casa-grande" },
  { re: /100-year water rule/i, href: "/faq/assured-vs-adequate-water-supply-and-the-100-year-rule", only: "casa-grande" },
  // ---- External: Apache Junction ----
  { re: /Lost Dutchman State Park/i, href: "https://azstateparks.com/lost-dutchman", external: true },
  { re: /Apache Junction Unified School District/i, href: "https://www.ajusd.org", external: true },
  // ---- External: Surprise ----
  { re: /Surprise Stadium/i, href: "https://surpriseaz.gov/1034/Surprise-Stadium", external: true },
  { re: /Dysart Unified School District/i, href: "https://www.dysart.org", external: true },
  {
    re: /Lake Pleasant Regional Park/i,
    href: "https://www.maricopacountyparks.net/park-locator/lake-pleasant-regional-park/",
    external: true,
  },
];

/**
 * Turn a paragraph into nodes with the mapped phrases linked. `used` is shared
 * across the whole section so a destination is linked once, not in every card.
 */
export function linkifyGuideText(text: string, used: Set<string>, citySlug?: string): ReactNode[] {
  const found: Array<{ start: number; end: number; link: GuideLink }> = [];
  for (const link of LOCAL_GUIDE_LINKS) {
    if (used.has(link.href)) continue;
    if (link.only) {
      const allowed = Array.isArray(link.only) ? link.only : [link.only];
      if (!citySlug || !allowed.includes(citySlug)) continue;
    }
    const m = link.re.exec(text);
    if (m) found.push({ start: m.index, end: m.index + m[0].length, link });
  }
  // Earliest first; on a tie prefer the longer phrase ("custom home builder"
  // over "custom home").
  found.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));

  const chosen: typeof found = [];
  let cursor = 0;
  for (const f of found) {
    if (f.start < cursor) continue; // overlaps something already taken
    if (used.has(f.link.href)) continue; // destination already linked
    chosen.push(f);
    used.add(f.link.href);
    cursor = f.end;
  }
  if (!chosen.length) return [text];

  const out: ReactNode[] = [];
  let pos = 0;
  chosen.forEach((f, i) => {
    if (f.start > pos) out.push(text.slice(pos, f.start));
    const label = text.slice(f.start, f.end);
    out.push(
      f.link.external ? (
        <a
          key={i}
          href={f.link.href}
          className="local-guide-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
        </a>
      ) : (
        <Link key={i} href={f.link.href} className="local-guide-link">
          {label}
        </Link>
      ),
    );
    pos = f.end;
  });
  if (pos < text.length) out.push(text.slice(pos));
  return out;
}

export function LocalGuide({ blocks, cityName, citySlug }: { blocks: Block[]; cityName: string; citySlug?: string }) {
  const cards = extractLocalGuide(blocks);
  if (!cards.length) return null;
  // Shared across all cards so each destination is linked once per section.
  const usedLinks = new Set<string>();
  return (
    <section className="local-guide section-pad" data-testid="local-guide">
      <div className="container">
        <m.div className="page-section-head centered" {...FADE_IN}>
          <h2 className="heading-lg local-guide-h2">Living and Building in {cityName}</h2>
        </m.div>
        <div className="local-guide-grid">
          {cards.map((c, i) => {
            const Icon = localGuideIcon(c.title);
            return (
              <m.article
                key={i}
                className="local-guide-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: Math.min(i, 4) * 0.07 }}
              >
                <div className="local-guide-head">
                  <span className="local-guide-icon" aria-hidden="true">
                    <Icon size={20} />
                  </span>
                  <h3 className="local-guide-title">{c.title}</h3>
                </div>
                {c.paras.map((p, j) => (
                  <p key={j} className="local-guide-p">{linkifyGuideText(p, usedLinks, citySlug)}</p>
                ))}
              </m.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
