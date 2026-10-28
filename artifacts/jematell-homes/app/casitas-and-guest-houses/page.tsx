import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { pageMetadata } from "@/seo/metadata";
import { serviceJsonLd, breadcrumbJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import { Interlink } from "@/components/Interlink";
import { CTA } from "@/cta";
import { siteConfig } from "@/config/siteConfig";
import { faqLinks, refLinks, guideLinks, blogLinks, termLinks } from "@/lib/servicePageLinks";

/**
 * /casitas-and-guest-houses -- the service page for the casita, guest house
 * and ADU cluster. Search Console showed "guest house builder scottsdale" and
 * the casita queries landing on a glossary term and two blog posts because no
 * service page existed. Every fact below is lifted from the FAQ short answers,
 * the two ADU statutes and the ADU guide, all of which are linked in place, so
 * the page never says something the corpus does not.
 */
const PATH = "/casitas-and-guest-houses";

export const metadata = pageMetadata({
  title: "Casita and Guest House Builder in Arizona",
  description:
    "Jematell Homes designs and builds casitas, guest houses and ADUs across Scottsdale, Phoenix and the Valley: what your city allows in 2026, what it costs, and how we build it.",
  canonical: PATH,
  image: "/images/spec-home.jpg",
});

const CITY_RULES = [
  "adu-and-casita-rules-in-scottsdale-arizona",
  "adu-and-casita-rules-in-phoenix-arizona",
  "adu-and-casita-rules-in-mesa-arizona",
  "do-cave-creek-fountain-hills-and-carefree-allow-casitas-and-adus",
  "adu-setback-and-size-rules-by-city-in-arizona",
  "arizona-adu-requirements",
];
const CITY_META: Record<string, string> = {
  "adu-and-casita-rules-in-scottsdale-arizona": "Scottsdale",
  "adu-and-casita-rules-in-phoenix-arizona": "Phoenix",
  "adu-and-casita-rules-in-mesa-arizona": "Mesa",
  "do-cave-creek-fountain-hills-and-carefree-allow-casitas-and-adus": "Cave Creek, Fountain Hills, Carefree",
  "adu-setback-and-size-rules-by-city-in-arizona": "City by city",
  "arizona-adu-requirements": "Statewide",
};
const COST = [
  "cost-to-build-casita-arizona",
  "cost-to-build-adu-arizona",
  "how-much-does-a-garage-conversion-cost-in-arizona",
  "does-adding-a-casita-or-addition-raise-my-property-taxes-in-arizona",
];
const PLANNING = [
  "casita-vs-guest-house-vs-adu-arizona",
  "can-i-build-a-guest-house-without-a-kitchen-in-arizona",
  "can-i-convert-a-guest-house-into-a-rentable-adu-in-arizona",
  "can-i-rent-out-my-casita-or-adu-in-scottsdale-arizona",
  "can-my-hoa-block-an-adu-if-the-city-allows-it-in-arizona",
  "how-many-adus-per-property-arizona",
  "where-should-you-place-a-casita-or-guest-suite-in-a-custom-home-layout",
  "how-do-you-cool-a-casita-or-guest-suite-separately-from-the-main-house-in-arizona",
  "why-did-the-plan-reviewer-reject-my-casita-or-guest-house-bedroom-egress",
  "how-to-add-a-casita-or-detached-structure-to-an-existing-home-arizona",
  "can-you-build-a-casita-above-or-beside-an-rv-garage-arizona",
];
const LAW = [
  "arizona-building-law/ars-9-461-18-municipal-adu-law-arizona",
  "arizona-building-law/ars-11-810-01-county-adu-law-arizona",
];
const LAW_FAQS = ["what-hb-2720-changed-for-adus-in-arizona", "which-arizona-cities-are-required-to-allow-adus"];
const READING = [
  "guest-house-casita-adu-scottsdale",
  "guest-house-amp-adu-essentials-building-casitas-in-phoenix-under-new-laws",
  "modern-casita-and-guest-house-design-trends",
];

export default function CasitasPage() {
  const sections = [
    {
      id: "casitas-cities",
      label: "The rules in your city",
      kicker: "Each city we build in sets its own size cap, setbacks and rental rules. The short version for each, with the full answer one click away.",
      variant: "cards" as const,
      items: faqLinks(CITY_RULES, { meta: CITY_META }),
    },
    {
      id: "casitas-cost",
      label: "What it costs",
      variant: "list" as const,
      items: faqLinks(COST),
    },
    {
      id: "casitas-planning",
      label: "Plan it right",
      kicker: "The questions that decide whether you build a guest house or a rentable casita, and where it goes.",
      variant: "accordion" as const,
      items: faqLinks(PLANNING, { full: true }),
    },
    {
      id: "casitas-law",
      label: "The law behind it",
      variant: "cards" as const,
      items: [...refLinks(LAW), ...faqLinks(LAW_FAQS)],
    },
    {
      id: "casitas-reading",
      label: "Go deeper",
      variant: "feature" as const,
      items: [
        ...guideLinks(["adus-casitas-and-guest-houses-in-arizona-complete-guide"]),
        ...blogLinks(READING),
        ...termLinks(["casita", "jadu"]),
      ],
    },
  ];

  return (
    <main className="page faq-page">
      <JsonLd
        data={[
          serviceJsonLd({
            name: "Casita, Guest House and ADU Construction",
            description: metadata.description as string,
            url: PATH,
          }),
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Casitas and Guest Houses", url: PATH },
          ]),
        ]}
      />

      <section className="page-hero" style={{ alignItems: "center", minHeight: "65vh" }}>
        <ResponsiveImage name="spec-home" className="page-hero-bg" alt="" widths={[768, 1280, 1600, 2000, 2500]} sizes="100vw" width={2500} height={1667} priority />
        <div className="page-hero-overlay" style={{ background: "linear-gradient(180deg, rgba(10,12,14,0.25) 0%, rgba(10,12,14,0.55) 100%)" }} />
        <div className="container page-hero-content" style={{ textAlign: "center", maxWidth: "100%" }}>
          <span className="eyebrow" style={{ display: "block", color: "var(--color-bone)", marginBottom: "clamp(16px, 2vw, 24px)" }}>
            Casitas, guest houses and ADUs
          </span>
          <h1 className="page-hero-title hero-title" style={{ textTransform: "uppercase" }}>
            Casita and Guest House Builder in Arizona
          </h1>
        </div>
      </section>

      <section className="dt-section" style={{ paddingTop: "clamp(32px, 4vw, 56px)" }}>
        <div className="container container-narrow">
          <div className="dt-prose" data-testid="casitas-answer">
            <p>
              A casita, guest house or accessory dwelling unit (ADU) is a second living space on the same lot as your home.
              Arizona&apos;s 2024 ADU law, <Link href="/reference-library/arizona-building-law/ars-9-461-18-municipal-adu-law-arizona">A.R.S. 9-461.18</Link>,
              requires cities over 75,000 people, including Phoenix, Scottsdale, Mesa, Chandler and Gilbert, to allow at least one attached
              and one detached ADU on a single-family lot, with setbacks capped at five feet and size at 1,000 square feet or 75 percent of
              the main home, whichever is less. Counties follow <Link href="/reference-library/arizona-building-law/ars-11-810-01-county-adu-law-arizona">A.R.S. 11-810.01</Link>.
              Smaller towns like Cave Creek, Carefree and Fountain Hills are not bound by the mandate and allow guest space rather than
              rentable units.
            </p>
            <p>
              The words matter. An ADU is the legal term for a self-contained second home you can rent. A casita is the everyday Southwest
              word for the same building. A guest house is a stricter category in cities like Scottsdale: it cannot be rented, is capped
              smaller, and often has no full kitchen. Which one you build decides the size cap, the utilities, and whether it can ever earn
              rent, so it is the first decision we make with you.
            </p>
            <p>
              Jematell Homes designs and builds detached casitas and guest houses as part of a new custom home or on a lot you already own,
              across Scottsdale, Phoenix, Cave Creek, Rio Verde and the rest of our service area. The cost depends on the size, whether it
              has a kitchen, the utilities your lot needs and what your city requires, so we price it from your plans and confirm the
              number before work starts; the guides below explain what moves the price. We are a licensed Arizona general contractor,{" "}
              {siteConfig.contact.roc}.
            </p>
            <p>
              Not sure where to start? Tell us about your lot and what you want the space for, and we will tell you which kind of building
              your city allows. <Link href="/contact">Contact us</Link> or call {siteConfig.contact.phone.display}. Building a whole new
              home with a guest space included? See our <Link href="/custom-homes">custom homes</Link>, or start with{" "}
              <Link href="/build-on-your-lot">building on your own lot</Link>.
            </p>
          </div>
          <div className="dt-back-row" style={{ marginTop: "clamp(20px, 3vw, 32px)" }}>
            <Link href="/faq/topics/adus-and-casitas" className="dt-back" data-testid="casitas-topic-link">
              Every casita and ADU question we have answered <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container container-narrow">
          <Interlink sections={sections} title="Building a casita in Arizona" testid="casitas-interlink" />
        </div>
      </section>

      <CTA />
    </main>
  );
}
