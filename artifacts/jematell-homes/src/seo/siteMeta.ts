/**
 * siteMeta.ts — derived, SEO-facing facts about the site. Pulls from siteConfig
 * (the single source of truth) and exposes the production origin, default head
 * values, a URL absolutizer, and the site-wide JSON-LD graph (emitted once per
 * page). Page-specific JSON-LD lives in jsonld.ts.
 */
import { siteConfig, locations } from "../config/siteConfig";

/** Production origin used for canonical URLs, OG tags, sitemap, and JSON-LD. */
export const SITE_URL = "https://jematellhomes.com";

export const DEFAULT_DESCRIPTION =
  "Jematell Homes is a family-owned Arizona custom home builder serving Scottsdale, Rio Verde, and the greater Phoenix metro: semi-custom and fully custom homes built with passion, integrity, and a personal touch.";

export const DEFAULT_OG_IMAGE = "/opengraph.jpg";

/**
 * The Google Business Profile, as Google addresses it: the listing's Maps
 * page by its cid, and the office pin it shows. The hours below are the
 * listing's (Monday to Friday, 8 to 5). Keep these in step with the listing.
 */
export const GOOGLE_MAPS_URL = "https://www.google.com/maps?cid=3907188539355189707";
export const OFFICE_GEO = { latitude: 33.6189919, longitude: -111.8989709 };

/** Turn a site-relative path (or pass-through absolute URL) into an absolute URL. */
export function absoluteUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return SITE_URL;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return SITE_URL + (pathOrUrl.startsWith("/") ? pathOrUrl : "/" + pathOrUrl);
}

/**
 * The site-wide JSON-LD graph: Organization + GeneralContractor (LocalBusiness)
 * + WebSite. Emitted exactly once per page. Page components must NOT re-emit any
 * of these @types — they add only page-specific types (Service, BlogPosting,
 * BreadcrumbList, FAQPage, etc.).
 */
export function buildSiteJsonLd(): object[] {
  const { brand, contact, social } = siteConfig;
  const addr = contact.address;
  const postalAddress = {
    "@type": "PostalAddress",
    streetAddress: addr.street,
    addressLocality: addr.city,
    addressRegion: addr.region,
    postalCode: addr.postalCode,
    addressCountry: addr.country,
  };
  // Every profile that verifiably belongs to this company. sameAs is how a
  // search engine or an AI system decides that the "Jematell Homes" on Houzz
  // and the one here are the same entity, so the list should stay complete;
  // these mirror the profiles published on /llm-info.
  const sameAs = [
    social.instagram,
    social.facebook,
    // Google Business Profile (the share link, and the listing's own Maps
    // address by its cid, which is what ties this page to the listing)
    "https://maps.app.goo.gl/pSjm2LpxCc5CcTVD8",
    GOOGLE_MAPS_URL,
    "https://www.houzz.com/pro/jematellhomes",
    "https://www.buildzoom.com/contractor/jematell-homes-llc",
    "https://www.yelp.com/biz/jematell-homes-scottsdale",
  ];

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": SITE_URL + "/#organization",
    name: brand.name,
    legalName: "Jematell Homes, LLC",
    url: SITE_URL,
    logo: absoluteUrl("/images/logo.png"),
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    description: DEFAULT_DESCRIPTION,
    slogan: siteConfig.tagline,
    foundingDate: "2022-07-13",
    founder: {
      "@type": "Person",
      "@id": SITE_URL + "/#founder",
      name: "Joseph Telles",
      jobTitle: "President, Founder",
    },
    email: contact.email.display,
    telephone: contact.phone.display,
    address: postalAddress,
    knowsAbout: [
      "Custom home construction",
      "Spec homes",
      "Home building in Arizona",
      "Build on your lot",
      "Semi-custom homes",
      "Casitas and guest houses",
      "RV garages",
    ],
    sameAs,
  };

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    "@id": SITE_URL + "/#business",
    name: brand.name,
    url: SITE_URL,
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    logo: absoluteUrl("/images/logo.png"),
    telephone: contact.phone.display,
    email: contact.email.display,
    priceRange: "$$$",
    foundingDate: "2022-07-13",
    address: postalAddress,
    geo: {
      "@type": "GeoCoordinates",
      latitude: OFFICE_GEO.latitude,
      longitude: OFFICE_GEO.longitude,
    },
    hasMap: GOOGLE_MAPS_URL,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "17:00",
      },
    ],
    // Every town with a page under /where-we-build, so the business's
    // service area here matches the site's own town pages.
    areaServed: locations.map((l) => ({
      "@type": "City",
      name: l.name,
      containedInPlace: { "@type": "State", name: "Arizona" },
    })),
    parentOrganization: { "@id": SITE_URL + "/#organization" },
    sameAs,
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_URL + "/#website",
    url: SITE_URL,
    name: brand.name,
    publisher: { "@id": SITE_URL + "/#organization" },
    potentialAction: {
      "@type": "SearchAction",
      target: SITE_URL + "/blog?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return [organization, localBusiness, website];
}
