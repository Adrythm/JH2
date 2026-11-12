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
  {
    re: /Scottsdale's adopted building codes/i,
    href: "/reference-library/building-codes/scottsdale-adopted-building-codes",
    only: "scottsdale",
  },
  {
    re: /online permit portal/i,
    href: "/reference-library/building-codes/scottsdale-residential-building-permit-requirements",
    only: "scottsdale",
  },
  {
    re: /inspects in stages/i,
    href: "/reference-library/building-codes/scottsdale-building-inspections-process",
    only: "scottsdale",
  },
  {
    re: /Green Building Program/i,
    href: "/reference-library/building-codes/scottsdale-green-building-program",
    only: "scottsdale",
  },
  {
    re: /Troon North/i,
    href: "/reference-library/community-design-guidelines/troon-north-scottsdale-design-guidelines",
    only: "scottsdale",
  },
  {
    re: /A\.R\.S\. 33-1817/i,
    href: "/reference-library/arizona-building-law/ars-33-1817-hoa-design-review-arizona",
    only: "scottsdale",
  },
  {
    re: /HOA design review fees/i,
    href: "/faq/how-much-are-hoa-design-review-fees-for-a-custom-home-in-arizona",
    only: "scottsdale",
  },
  {
    re: /ROC's free license search/i,
    href: "/faq/how-to-verify-an-arizona-contractor-license-with-the-roc",
    only: "scottsdale",
  },
  {
    re: /green flags of a good custom home builder/i,
    href: "/faq/what-are-the-green-flags-of-a-good-custom-home-builder",
    only: "scottsdale",
  },
  // ---- Internal: Paradise Valley local guide ----
  {
    re: /R-43 district/i,
    href: "/reference-library/building-codes/paradise-valley-residential-zoning-and-setbacks",
    only: "paradise-valley",
  },
  {
    re: /2015 International Residential Code/i,
    href: "/reference-library/building-codes/paradise-valley-adopted-building-codes",
    only: "paradise-valley",
  },
  {
    re: /Hillside Development Regulations/i,
    href: "/reference-library/building-codes/paradise-valley-hillside-development-requirements",
    only: "paradise-valley",
  },
  {
    re: /Rule 370/i,
    href: "/faq/can-i-tear-down-an-existing-house-and-rebuild-on-the-same-lot-in-arizona",
    only: "paradise-valley",
  },
  {
    re: /state law that makes larger Arizona cities allow accessory dwelling units/i,
    href: "/faq/which-arizona-cities-are-required-to-allow-adus",
    only: "paradise-valley",
  },
  { re: /casitas and guest houses/i, href: "/casitas-and-guest-houses", only: "paradise-valley" },
  { re: /lot you already own/i, href: "/build-on-your-lot", only: "paradise-valley" },
  {
    re: /fence or site wall/i,
    href: "/reference-library/building-codes/paradise-valley-fence-and-site-wall-permit",
    only: "paradise-valley",
  },
  {
    re: /grading permit/i,
    href: "/reference-library/building-codes/paradise-valley-grading-and-drainage-permit",
    only: "paradise-valley",
  },
  {
    re: /municipal impact fee/i,
    href: "/reference-library/building-codes/paradise-valley-building-permit-and-impact-fees",
    only: "paradise-valley",
  },
  {
    re: /Paradise Valley building cost guide/i,
    href: "/faq/how-much-does-it-cost-to-build-a-custom-home-in-paradise-valley",
    only: "paradise-valley",
  },
  {
    re: /pool or spa/i,
    href: "/reference-library/building-codes/paradise-valley-pool-spa-barrier-permit",
    only: "paradise-valley",
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
  // ---- Chandler local guide ----
  { re: /licensed real estate agents/i, href: "/buy-a-lot-with-us", only: "chandler" },
  { re: /lot you already own/i, href: "/build-on-your-lot", only: "chandler" },
  { re: /Chapter 35 of the City Code/i, href: "https://www.chandleraz.gov/government/departments/development-services/planning-and-zoning/zoning-code-and-zoning-code-amendments", external: true, only: "chandler" },
  { re: /whether a lot is in the city or unincorporated county/i, href: "/faq/how-do-i-know-if-my-lot-is-in-the-city-or-unincorporated-county-arizona", only: "chandler" },
  { re: /HOA design review answer/i, href: "/faq/how-does-hoa-design-review-affect-building-a-custom-home", only: "chandler" },
  { re: /Ordinance No\. 5108/i, href: "https://www.chandleraz.gov/sites/default/files/departments/development-services/City-of-Chandler-Amendments-to-the-2024-International-Codes.pdf", external: true, only: "chandler" },
  { re: /Citizen Access portal/i, href: "https://www.chandleraz.gov/government/departments/development-services/building-safety-plan-review-permits-and-inspections", external: true, only: "chandler" },
  { re: /how to find out if you can build on a lot in Arizona/i, href: "/faq/how-to-find-out-if-you-can-build-on-a-lot-in-arizona", only: "chandler" },
  { re: /Arizona ADU requirements/i, href: "/faq/arizona-adu-requirements", only: "chandler" },
  { re: /casitas and guest houses/i, href: "/casitas-and-guest-houses", only: "chandler" },
  { re: /cost per square foot in Arizona/i, href: "/faq/cost-to-build-a-house-per-square-foot-in-arizona", only: "chandler" },
  { re: /building permit costs in Arizona/i, href: "/faq/building-permit-cost-arizona", only: "chandler" },
  { re: /in-house floor plans/i, href: "/floor-plans", only: "chandler" },
  { re: /construction financing/i, href: "/financing", only: "chandler" },
  { re: /how to check a builder's license/i, href: "/faq/how-to-verify-an-arizona-contractor-license-with-the-roc", only: "chandler" },
  // ---- Queen Creek local guide ----
  { re: /licensed real estate agents/i, href: "/buy-a-lot-with-us", only: "queen-creek" },
  { re: /lot you already own/i, href: "/build-on-your-lot", only: "queen-creek" },
  { re: /Ordinance 869-25/i, href: "https://queencreekaz.granicus.com/MetaViewer.php?view_id=3&clip_id=1710&meta_id=98931", external: true, only: "queen-creek" },
  { re: /HOA design review answer/i, href: "/faq/how-does-hoa-design-review-affect-building-a-custom-home", only: "queen-creek" },
  { re: /whether a lot is in the city or unincorporated county/i, href: "/faq/how-do-i-know-if-my-lot-is-in-the-city-or-unincorporated-county-arizona", only: "queen-creek" },
  { re: /how permitting works in Pinal County/i, href: "/faq/how-permitting-works-in-pinal-county", only: "queen-creek" },
  { re: /Chapter 7 of the Town Code/i, href: "https://queencreek.municipalcodeonline.com/book?type=ordinances#name=CHAPTER_7_BUILDINGS_AND_BUILDING_REGULATIONS", external: true, only: "queen-creek" },
  { re: /how to find out if you can build on a lot in Arizona/i, href: "/faq/how-to-find-out-if-you-can-build-on-a-lot-in-arizona", only: "queen-creek" },
  { re: /Ordinance 850-24/i, href: "https://queencreekaz.granicus.com/MetaViewer.php?view_id=3&clip_id=1558&meta_id=82049", external: true, only: "queen-creek" },
  { re: /RV garages/i, href: "/rv-garages", only: "queen-creek" },
  { re: /Arizona ADU requirements/i, href: "/faq/arizona-adu-requirements", only: "queen-creek" },
  { re: /casitas and guest houses/i, href: "/casitas-and-guest-houses", only: "queen-creek" },
  { re: /cost per square foot in Arizona/i, href: "/faq/cost-to-build-a-house-per-square-foot-in-arizona", only: "queen-creek" },
  { re: /building permit costs in Arizona/i, href: "/faq/building-permit-cost-arizona", only: "queen-creek" },
  { re: /in-house floor plans/i, href: "/floor-plans", only: "queen-creek" },
  { re: /construction financing/i, href: "/financing", only: "queen-creek" },
  { re: /how to check a builder's license/i, href: "/faq/how-to-verify-an-arizona-contractor-license-with-the-roc", only: "queen-creek" },
  // ---- Gilbert local guide ----
  { re: /licensed real estate agents/i, href: "/buy-a-lot-with-us", only: "gilbert" },
  { re: /lot you already own/i, href: "/build-on-your-lot", only: "gilbert" },
  { re: /planning manager described them in 2024/i, href: "https://www.gilbertsunnews.com/news/new-casita-law-preempts-gilbert-s-regulations/article_1c16921a-1a07-11ef-adc3-f34c12d8a798.html", external: true, only: "gilbert" },
  { re: /HOA design review answer/i, href: "/faq/how-does-hoa-design-review-affect-building-a-custom-home", only: "gilbert" },
  { re: /case Z2021006/i, href: "https://www.maricopa.gov/AgendaCenter/ViewFile/Item/7944?fileID=69396", external: true, only: "gilbert" },
  { re: /whether a lot is in the city or unincorporated county/i, href: "/faq/how-do-i-know-if-my-lot-is-in-the-city-or-unincorporated-county-arizona", only: "gilbert" },
  { re: /Maricopa County residential zoning/i, href: "/reference-library/building-codes/maricopa-county-residential-zoning-and-setbacks", only: "gilbert" },
  { re: /Arizona building code editions by city/i, href: "/reference-library/building-codes/arizona-building-code-editions-by-city", only: "gilbert" },
  { re: /how to find out if you can build on a lot in Arizona/i, href: "/faq/how-to-find-out-if-you-can-build-on-a-lot-in-arizona", only: "gilbert" },
  { re: /A\.R\.S\. 9-461\.18/i, href: "/reference-library/arizona-building-law/ars-9-461-18-municipal-adu-law-arizona", only: "gilbert" },
  { re: /Arizona ADU requirements/i, href: "/faq/arizona-adu-requirements", only: "gilbert" },
  { re: /casitas and guest houses/i, href: "/casitas-and-guest-houses", only: "gilbert" },
  { re: /RV garages/i, href: "/rv-garages", only: "gilbert" },
  { re: /cost per square foot in Arizona/i, href: "/faq/cost-to-build-a-house-per-square-foot-in-arizona", only: "gilbert" },
  { re: /building permit costs in Arizona/i, href: "/faq/building-permit-cost-arizona", only: "gilbert" },
  { re: /in-house floor plans/i, href: "/floor-plans", only: "gilbert" },
  { re: /construction financing/i, href: "/financing", only: "gilbert" },
  { re: /how to check a builder's license/i, href: "/faq/how-to-verify-an-arizona-contractor-license-with-the-roc", only: "gilbert" },
  // ---- Maricopa local guide ----
  { re: /licensed real estate agents/i, href: "/buy-a-lot-with-us", only: "maricopa" },
  { re: /lot you already own/i, href: "/build-on-your-lot", only: "maricopa" },
  { re: /Administrative Design Review/i, href: "https://www.maricopa-az.gov/files/assets/city/v/1/development-services/documents/handouts-guidelines-resources/adr-process-guide-july2021.pdf", external: true, only: "maricopa" },
  { re: /HOA design review answer/i, href: "/faq/how-does-hoa-design-review-affect-building-a-custom-home", only: "maricopa" },
  { re: /Pinal County residential zoning/i, href: "/reference-library/building-codes/pinal-county-residential-zoning-and-setbacks", only: "maricopa" },
  { re: /whether a lot is in the city or unincorporated county/i, href: "/faq/how-do-i-know-if-my-lot-is-in-the-city-or-unincorporated-county-arizona", only: "maricopa" },
  { re: /Designation of Assured Water Supply/i, href: "https://www.maricopa-az.gov/Maricopa-eNews/Conservative-Water-Efforts-Pay-off-for-Maricopa", external: true, only: "maricopa" },
  { re: /Pinal County septic and well page/i, href: "/reference-library/building-codes/pinal-county-septic-and-well-requirements", only: "maricopa" },
  { re: /fissure maps/i, href: "https://azgs.arizona.edu/geohazards/arizona-geohazards-resources/earth-fissures-subsidence", external: true, only: "maricopa" },
  { re: /earth fissures in Pinal County/i, href: "/faq/earth-fissures-and-land-subsidence-in-pinal-county", only: "maricopa" },
  { re: /approved the 2024 International Codes/i, href: "https://www.maricopa-az.gov/Maricopa-eNews/PUBLIC-NOTICE-City-of-Maricopa-Building-Codes-Implementation", external: true, only: "maricopa" },
  { re: /2018 codes the county adopted/i, href: "/reference-library/building-codes/pinal-county-adopted-building-codes", only: "maricopa" },
  { re: /Casa Grande is on 2018/i, href: "/reference-library/building-codes/casa-grande-adopted-building-codes", only: "maricopa" },
  { re: /Arizona building code editions by city/i, href: "/reference-library/building-codes/arizona-building-code-editions-by-city", only: "maricopa" },
  { re: /published targets/i, href: "https://www.maricopa-az.gov/files/assets/city/v/2/development-services/documents/plan-review-turnaround-times-final.pdf", external: true, only: "maricopa" },
  { re: /how to find out if you can build on a lot in Arizona/i, href: "/faq/how-to-find-out-if-you-can-build-on-a-lot-in-arizona", only: "maricopa" },
  { re: /A\.R\.S\. 9-461\.18/i, href: "/reference-library/arizona-building-law/ars-9-461-18-municipal-adu-law-arizona", only: "maricopa" },
  { re: /whether an HOA can block an ADU/i, href: "/faq/can-my-hoa-block-an-adu-if-the-city-allows-it-in-arizona", only: "maricopa" },
  { re: /casitas and guest houses/i, href: "/casitas-and-guest-houses", only: "maricopa" },
  { re: /RV garages/i, href: "/rv-garages", only: "maricopa" },
  { re: /cost per square foot in Arizona/i, href: "/faq/cost-to-build-a-house-per-square-foot-in-arizona", only: "maricopa" },
  { re: /building permit costs in Arizona/i, href: "/faq/building-permit-cost-arizona", only: "maricopa" },
  { re: /in-house floor plans/i, href: "/floor-plans", only: "maricopa" },
  { re: /spec homes/i, href: "/spec-homes", only: "maricopa" },
  { re: /custom home in Arizona City/i, href: "/gallery/az-city-custom", only: "maricopa" },
  { re: /two spec homes in Casa Grande/i, href: "/where-we-build/casa-grande", only: "maricopa" },
  { re: /construction financing/i, href: "/financing", only: "maricopa" },
  { re: /how to check a builder's license/i, href: "/faq/how-to-verify-an-arizona-contractor-license-with-the-roc", only: "maricopa" },
  // ---- Internal: Mesa local guide ----
  { re: /licensed real estate agents/i, href: "/buy-a-lot-with-us", only: "mesa" },
  { re: /lot you already own/i, href: "/build-on-your-lot", only: "mesa" },
  {
    re: /Mesa zoning and setbacks/i,
    href: "/reference-library/building-codes/mesa-residential-zoning-and-setbacks",
    only: "mesa",
  },
  {
    re: /Mesa adopted building codes/i,
    href: "/reference-library/building-codes/mesa-adopted-building-codes",
    only: "mesa",
  },
  {
    re: /Mesa residential permit requirements/i,
    href: "/reference-library/building-codes/mesa-residential-building-permit-requirements",
    only: "mesa",
  },
  {
    re: /Mesa building inspections/i,
    href: "/reference-library/building-codes/mesa-building-inspections-process",
    only: "mesa",
  },
  {
    re: /Mesa building cost guide/i,
    href: "/faq/how-much-does-it-cost-to-build-a-custom-home-in-mesa",
    only: "mesa",
  },
  {
    re: /Mesa permit and impact fees/i,
    href: "/reference-library/building-codes/mesa-building-permit-and-impact-fees",
    only: "mesa",
  },
  { re: /Mesa ADU and casita rules/i, href: "/faq/adu-and-casita-rules-in-mesa-arizona", only: "mesa" },
  { re: /casitas and guest houses/i, href: "/casitas-and-guest-houses", only: "mesa" },
  { re: /in-house floor plans/i, href: "/floor-plans", only: "mesa" },
  { re: /construction financing/i, href: "/financing", only: "mesa" },
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
  // ---- Internal: Phoenix local guide ----
  {
    re: /licensed real estate agents/i,
    href: "/buy-a-lot-with-us",
    only: "phoenix",
  },
  {
    re: /lot you already own/i,
    href: "/build-on-your-lot",
    only: "phoenix",
  },
  {
    re: /complete guide to building a custom home in Phoenix/i,
    href: "/guides/building-a-custom-home-in-phoenix-complete-guide",
    only: "phoenix",
  },
  {
    re: /Phoenix zoning and setbacks/i,
    href: "/reference-library/building-codes/phoenix-residential-zoning-and-setbacks",
    only: "phoenix",
  },
  {
    re: /Phoenix adopted building codes/i,
    href: "/reference-library/building-codes/phoenix-adopted-building-codes",
    only: "phoenix",
  },
  {
    re: /Phoenix residential permit requirements/i,
    href: "/reference-library/building-codes/phoenix-residential-building-permit-requirements",
    only: "phoenix",
  },
  {
    re: /Phoenix building inspections/i,
    href: "/reference-library/building-codes/phoenix-building-inspections-process",
    only: "phoenix",
  },
  {
    re: /Phoenix ADU and casita rules/i,
    href: "/faq/adu-and-casita-rules-in-phoenix-arizona",
    only: "phoenix",
  },
  {
    re: /casitas and guest houses/i,
    href: "/casitas-and-guest-houses",
    only: "phoenix",
  },
  {
    re: /Phoenix permit and impact fees/i,
    href: "/reference-library/building-codes/phoenix-building-permit-and-impact-fees",
    only: "phoenix",
  },
  {
    re: /Phoenix building cost guide/i,
    href: "/faq/how-much-does-it-cost-to-build-a-custom-home-in-phoenix",
    only: "phoenix",
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
  { re: /An R-1 lot/i, href: "/reference-library/building-codes/casa-grande-residential-zoning-and-setbacks", only: "casa-grande" },
  { re: /Pinal County's rules/i, href: "/reference-library/building-codes/pinal-county-residential-zoning-and-setbacks", only: "casa-grande" },
  { re: /2018 International Residential Code/i, href: "/reference-library/building-codes/casa-grande-adopted-building-codes", only: "casa-grande" },
  { re: /Development Center/i, href: "/reference-library/building-codes/casa-grande-residential-building-permit-requirements", only: "casa-grande" },
  { re: /Pinal County septic permit/i, href: "/reference-library/building-codes/pinal-county-septic-and-well-requirements", only: "casa-grande" },
  { re: /Certificate of Occupancy/i, href: "/reference-library/building-codes/casa-grande-building-inspections-process", only: "casa-grande" },
  // ---- External: Apache Junction ----
  { re: /Lost Dutchman State Park/i, href: "https://azstateparks.com/lost-dutchman", external: true },
  { re: /Apache Junction Unified School District/i, href: "https://www.ajusd.org", external: true },
  // ---- External: Surprise ----
  { re: /Surprise Stadium/i, href: "https://surpriseaz.gov/surprise-stadium", external: true },
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
