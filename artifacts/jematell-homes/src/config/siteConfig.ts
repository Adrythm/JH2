/**
 * siteConfig.ts — the single source of truth for brand, contact, social, and
 * the canonical service/location lists. Components, the nav, and the footer all
 * read from here; no brand or contact string is hardcoded in JSX. Re-skin or
 * re-point the whole site by editing this file.
 */

export interface LocationItem {
  /** URL slug under /where-we-build/. */
  slug: string;
  name: string;
  /** A short, editorial one-line descriptor of the region's character. */
  tagline: string;
}

export interface ServiceItem {
  label: string;
  href: string;
}

/** The regions Jematell builds in, in display order. */
export const locations: LocationItem[] = [
  { slug: "scottsdale", name: "Scottsdale", tagline: "Foothill estates & golf-course living" },
  { slug: "paradise-valley", name: "Paradise Valley", tagline: "Acre estates below Camelback" },
  { slug: "rio-verde", name: "Rio Verde", tagline: "Open desert skies & gated calm" },
  { slug: "phoenix", name: "Phoenix", tagline: "Modern homes at the valley's heart" },
  { slug: "cave-creek", name: "Cave Creek", tagline: "Rugged Sonoran charm & big views" },
  { slug: "fountain-hills", name: "Fountain Hills", tagline: "Hillside homes above the fountain" },
  { slug: "carefree", name: "Carefree", tagline: "Boulder serenity & dark desert skies" },
  { slug: "casa-grande", name: "Casa Grande", tagline: "Wide-open land & room to grow" },
  {
    slug: "apache-junction",
    name: "Apache Junction",
    tagline: "Superstition Mountain backdrops",
  },
  { slug: "surprise", name: "Surprise", tagline: "Sun-drenched West Valley living" },
];

/** The "Homes" offering pages. */
export const services: ServiceItem[] = [
  { label: "Custom Homes", href: "/custom-homes" },
  { label: "Spec Homes", href: "/spec-homes" },
  { label: "Floor Plans", href: "/floor-plans" },
];

/** Build the canonical route for a location slug. */
export const locationHref = (slug: string) => `/where-we-build/${slug}`;

export const siteConfig = {
  brand: { name: "Jematell Homes", href: "/" },
  /** The universal CTA. It opens the contact form rather than navigating. */
  cta: { label: "Start Your Build" },
  blurb:
    "A family-owned Arizona home builder bringing passion, integrity, and a personal touch to every project.",
  tagline: "Quietly Luxurious Arizona Living.",
  contact: {
    phone: { display: "(602) 421-5576", href: "tel:6024215576" },
    sms: { display: "Text (602) 421-5576", href: "sms:6024215576" },
    email: { display: "info@jematellhomes.com", href: "mailto:info@jematellhomes.com" },
    address: {
      lines: ["8350 E Raintree Dr Ste 210", "Scottsdale, AZ 85260"],
      street: "8350 E Raintree Dr Ste 210",
      city: "Scottsdale",
      region: "AZ",
      postalCode: "85260",
      country: "US",
    },
    /** Office hours, as the Google Business Profile shows them. */
    hours: "Mon to Fri, 8am to 5pm",
    roc: "ROC# 339367",
  },
  social: {
    instagram: "https://www.instagram.com/jematellhomes/",
    facebook: "https://www.facebook.com/JematellHomes/",
  },
  /**
   * The preferred construction lender featured on /financing. Contact fields
   * render only when filled in, so leave any unknown value as "" until the
   * lender provides it.
   */
  financing: {
    lender: {
      bank: "Western Bank",
      officer: "Naceem Pagani",
      phone: { display: "", href: "" },
      email: "",
      url: "",
      nmls: "",
    },
  },
} as const;
