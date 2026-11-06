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
  title: "Scottsdale Guest House and Casita Builder",
  description:
    "Guest house and casita builder in Scottsdale and the Valley: Scottsdale's guest house and ADU rules, what moves the cost, and how Jematell Homes builds it.",
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
              word for the same building. A guest house is a separate category in cities like Scottsdale: it cannot be rented apart from
              the main home, it shares the main home&apos;s utilities, and it often has no full kitchen. Which one you build decides the size
              cap, the utilities, and whether it can ever earn rent, so it is the first decision we make with you.
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
          <div className="dt-prose" data-testid="casitas-scottsdale">
            <h2>Building a guest house or casita in Scottsdale</h2>
            <p>
              Scottsdale lets you build a guest house or an ADU behind a single-family home, and the city treats them as two different
              buildings. Choose by how you will use it, because the choice sets the size limit, the utilities and the approval steps.
            </p>
            <h3>A guest house, for family and visitors</h3>
            <ul>
              <li>It is detached, and it may not be rented apart from the main home.</li>
              <li>
                There is no limit on how many you build, but all guest houses on the lot together can be no larger than half the floor
                area of the main home. Next to a 4,000 square foot home, that is up to 2,000 square feet of guest space.
              </li>
              <li>It shares the main home&apos;s electric, water, sewer and gas service.</li>
              <li>
                A guest house built after January 1, 2025 needs a private deed restriction that keeps it a guest house. The owner records
                it before the permit is approved.
              </li>
              <li>
                It follows the accessory building setback and lot coverage rules of the zoning ordinance, and it is approved through a
                building permit review of the plans.
              </li>
            </ul>
            <h3>An ADU, a casita you can rent</h3>
            <ul>
              <li>
                Ordinance 4687, adopted September 30, 2025, allows one attached and one detached ADU on a single-family lot, and a third
                detached unit on a lot of an acre or more when one unit is kept as restricted-affordable housing.
              </li>
              <li>
                The first ADU can be 1,000 square feet or 75 percent of the main home, whichever is less. A second or third ADU is capped
                at 500 square feet.
              </li>
              <li>
                Electric and gas are metered apart from the main home, and the unit needs its own outside entrance, its own address and a
                path to the street.
              </li>
              <li>
                A detached ADU sits in the rear yard, as close as five feet to a side or rear lot line, at least ten feet from the main
                home, with at least 50 square feet of private outdoor space that is at least five feet deep.
              </li>
              <li>
                If you rent it, long term or short term, you must live on the property, and no more than six adults may live on the lot
                in total.
              </li>
              <li>Approval starts with a pre-application and a meeting with city staff, then an administrative review, then the building permit.</li>
            </ul>
            <p>
              So how big can a casita or guest house be in Scottsdale? An ADU tops out at 1,000 square feet, while all guest houses
              together can reach half the main home, so next to a large home the guest house can be the bigger building. If you want
              space to rent, now or later, build it as an ADU from the start, since a guest house is deed restricted to guest use. The
              city&apos;s own pages on{" "}
              <a href="https://www.scottsdaleaz.gov/codes-and-ordinances/guest-houses" target="_blank" rel="noopener noreferrer">
                guest houses
              </a>{" "}
              and{" "}
              <a href="https://www.scottsdaleaz.gov/codes-and-ordinances/accessory-dwelling-units" target="_blank" rel="noopener noreferrer">
                ADUs
              </a>{" "}
              set out each rule. Our answers on{" "}
              <Link href="/faq/adu-and-casita-rules-in-scottsdale-arizona">Scottsdale&apos;s ADU and casita rules</Link> and{" "}
              <Link href="/faq/can-i-rent-out-my-casita-or-adu-in-scottsdale-arizona">renting a casita in Scottsdale</Link> go deeper, and{" "}
              <Link href="/where-we-build/scottsdale">building in Scottsdale</Link> covers the rest of the lot.
            </p>

            <h2>How we build your casita or guest house</h2>
            <ol>
              <li>
                <strong>We look at the lot.</strong> We check it for utilities, access and grading, find where your city lets a detached
                building sit, and tell you whether a guest house or an ADU fits what you want the space for: guests, a parent, a home office
                or gym, or rent.
              </li>
              <li>
                <strong>We design it with the house.</strong> With a new custom home, the casita is planned with the main home from the
                first sketch, so the yard, the utilities and the views work for both. On a lot you already own, we design it around what
                is there.
              </li>
              <li>
                <strong>We price it before work starts.</strong> We price it from your plans and confirm the number before anything is
                built.
              </li>
              <li>
                <strong>We take it through permits.</strong> We handle the city&apos;s review and the permit. For plan review and
                permitting, allow 2 to 4 months, depending on jurisdiction.
              </li>
              <li>
                <strong>We build it and report every week.</strong> Each week of construction you get a written update: what was
                finished, what is scheduled next, and any decision we need from you.
              </li>
            </ol>
            <p>
              Planning a casita or guest house in Scottsdale, Paradise Valley, Cave Creek or Rio Verde? Call{" "}
              <a href={siteConfig.contact.phone.href}>{siteConfig.contact.phone.display}</a> or <Link href="/contact">tell us about your lot</Link>.
            </p>
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
