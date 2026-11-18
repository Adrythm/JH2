import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pageMetadata } from "@/seo/metadata";
import { serviceJsonLd, breadcrumbJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import { Interlink } from "@/components/Interlink";
import { CTA } from "@/cta";
import { siteConfig } from "@/config/siteConfig";
import { pages } from "@/data/pages";
import { GALLERY_BY_SLUG } from "@/data/galleryProjects";
import { faqLinks, blogLinks, termLinks } from "@/lib/servicePageLinks";

/**
 * /rv-garages -- the service page for the RV garage cluster. A prior analysis
 * found 4,726 impressions across 47 RV-garage queries landing on a 404, and
 * the RV garage FAQs still hold hundreds of impressions with almost no clicks.
 * Every dimension and price below comes from the RV garage FAQ short answers,
 * linked in place; the proof is the RV garage home in the gallery.
 */
const PATH = "/rv-garages";
const PROOF_SLUG = "rio-verde-rv";

export const metadata = pageMetadata({
  title: "RV Garage Builder in Arizona: Sizes, Cost, Rules",
  description:
    "Custom RV garages and RV garage homes in Scottsdale, Rio Verde and the Phoenix metro: door heights by RV class, 2026 costs, zoning limits and a Rio Verde build.",
  canonical: PATH,
  image: "/images/rv-garage-rio-verde.jpg",
});

const SIZING = [
  "rv-garage-dimensions-arizona",
  "rv-garage-door-height-and-size-arizona",
  "how-thick-should-an-rv-garage-slab-be-arizona",
  "rv-garage-hookups-and-utilities-arizona",
  "attached-vs-detached-rv-garage-arizona",
];
const COST_RULES = [
  "cost-to-build-an-rv-garage-in-arizona",
  "can-you-build-a-casita-above-or-beside-an-rv-garage-arizona",
];
const READING = ["designing-a-custom-rv-garage", "why-adding-an-rv-garage-is-a-smart-investment-for-your-arizona-home"];

export default function RvGaragesPage() {
  const proof = GALLERY_BY_SLUG[PROOF_SLUG];
  const proofImage = pages[`gallery_${PROOF_SLUG}`]?.ogImage;
  const heroImage = proofImage || pages["build-on-your-lot"]?.ogImage;

  const sections = [
    {
      id: "rv-sizing",
      label: "Size it to your coach",
      kicker: "Door, ceiling, bay, depth, slab and hookups. The numbers that get an RV garage right the first time.",
      variant: "accordion" as const,
      items: faqLinks(SIZING, { full: true }),
    },
    {
      id: "rv-cost",
      label: "Cost, and living space above it",
      variant: "cards" as const,
      items: faqLinks(COST_RULES),
    },
    {
      id: "rv-reading",
      label: "Go deeper",
      variant: "list" as const,
      items: [...blogLinks(READING), ...termLinks(["rv-garage"])],
    },
  ];

  return (
    <main className="page faq-page">
      <JsonLd
        data={[
          serviceJsonLd({
            name: "RV Garage Construction",
            description: metadata.description as string,
            url: PATH,
            ...(proofImage ? { image: proofImage } : {}),
          }),
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "RV Garages", url: PATH },
          ]),
        ]}
      />

      <section className="page-hero" style={{ alignItems: "center", minHeight: "65vh" }}>
        {heroImage ? (
          // The RV garage home we built in Rio Verde, same photo as its gallery page.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroImage} className="page-hero-bg" alt="" fetchPriority="high" />
        ) : null}
        <div className="page-hero-overlay" style={{ background: "linear-gradient(180deg, rgba(10,12,14,0.25) 0%, rgba(10,12,14,0.55) 100%)" }} />
        <div className="container page-hero-content" style={{ textAlign: "center", maxWidth: "100%" }}>
          <span className="eyebrow" style={{ display: "block", color: "var(--color-bone)", marginBottom: "clamp(16px, 2vw, 24px)" }}>
            RV and motorcoach garages
          </span>
          <h1 className="page-hero-title hero-title" style={{ textTransform: "uppercase" }}>
            RV Garage Builder in Arizona
          </h1>
        </div>
      </section>

      <section className="dt-section" style={{ paddingTop: "clamp(32px, 4vw, 56px)" }}>
        <div className="container container-narrow">
          <div className="dt-prose" data-testid="rv-answer">
            <p>
              An RV garage, sometimes called a motorcoach garage, is an oversized enclosed garage built to keep a recreational vehicle
              indoors, with a tall door and a high ceiling. Most RV garage doors are 12, 14 or 16 feet tall and 12 to 16 feet wide. A
              12 foot door fits a camper van or a small Class C. A 14 foot door fits most Class A motorhomes at the 13.5 foot legal
              height. A 16 foot door leaves room for any future rig.
            </p>
            <p>
              For a large Class A, plan a 14 to 16 foot door, a 16 to 18 foot interior ceiling, a 14 to 16 foot wide bay and 40 to 50
              feet of depth, and measure your coach with its rooftop air conditioners on before anything is drawn. A loaded Class A can
              weigh 30,000 pounds, so the slab is 6 to 8 inches of reinforced or post-tension concrete over a compacted base, not the 4
              inches under a car garage. A full RV garage also needs a 50-amp, 240-volt outlet, a water line, a sewer dump or macerator,
              ventilation, and in Arizona a mini-split for cooling, all roughed in during the build.
            </p>
            <p>
              The tall door and roof drive what an RV garage costs, and our{" "}
              <Link href="/faq/cost-to-build-an-rv-garage-in-arizona">RV garage cost answer</Link> breaks it down. Local zoning also
              caps how tall the building can be, so we confirm your limit before we design. Jematell
              Homes builds RV garages as part of a new custom home, attached or detached, across Scottsdale, Rio Verde, Cave Creek and
              the Phoenix metro, and can add a casita above or beside it. Licensed Arizona general contractor, {siteConfig.contact.roc}.
            </p>
          </div>
        </div>
      </section>

      <section className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container container-narrow">
          <div className="dt-prose" data-testid="rv-lot-rules">
            <h2>Where an RV garage can go on your lot</h2>
            <p>
              An RV garage is usually the tallest and longest building on the lot after the house, so zoning decides where it sits
              before the floor plan does. The rules change at the city line. These are the places we build most, and each one handles
              a tall garage differently.
            </p>
            <h3>Scottsdale</h3>
            <p>
              Scottsdale caps building height at 30 feet in its single-family R1 districts. Inside the Environmentally Sensitive Lands
              (ESL) overlay in north Scottsdale, the City holds a home to 24 feet, measured from natural grade and counting the ridge,
              parapets and rooftop equipment. An attached RV bay is part of the home, so a 16 foot door and an 18 foot ceiling leave
              about 6 feet for the roof framing under that cap, and the roof shape gets settled early.
            </p>
            <p>
              A detached garage may sit closer to the side and rear lines than the house, but the City steps a tall accessory
              building back. For each foot of height over 10 feet, it has to move at least one more foot away from the property line,
              measured at its highest point. A detached RV garage with a 22 foot ridge sits 12 feet farther from the line than the
              base setback alone would allow. Our{" "}
              <Link href="/reference-library/building-codes/scottsdale-residential-zoning-and-setbacks">Scottsdale zoning and setbacks guide</Link>{" "}
              has the district yards, and{" "}
              <Link href="/where-we-build/scottsdale">building in Scottsdale</Link> covers the rest of the lot.
            </p>
            <h3>Rio Verde Foothills and other county land</h3>
            <p>
              Outside city limits, Maricopa County zoning applies. On an RU-43 acre, a detached garage, shop or barn may sit 3 feet
              from an interior side or rear line, while its front and street-side setbacks match the house: 40 feet and 20 feet. The
              county&apos;s 25% lot coverage cap counts every building together, so the house, the RV garage and any casita share one
              footprint. That is why an RV bay on a one-acre lot is drawn on the same site plan as the home, not added later.
            </p>
            <p>
              Most county lots run on a septic system. A dump connection in the RV bay sends black-tank waste into the same tank and
              leach field as the house, so the septic design has to count the garage from the start. See{" "}
              <Link href="/reference-library/building-codes/maricopa-county-residential-zoning-and-setbacks">Maricopa County zoning and setbacks</Link>,{" "}
              <Link href="/faq/rv-garage-hookups-and-utilities-arizona">RV garage hookups and utilities</Link> and{" "}
              <Link href="/where-we-build/rio-verde">building in Rio Verde</Link>.
            </p>
            <h3>Queen Creek</h3>
            <p>
              In Queen Creek&apos;s rural districts, a garage or workshop that is not a dwelling follows the accessory building rules
              and does not have to match the home&apos;s design. A 2024 amendment added 5% of lot coverage for accessory buildings and
              set their side setback at 10 feet on the larger lots, which leaves room for an RV garage beside the house. See{" "}
              <Link href="/where-we-build/queen-creek">building in Queen Creek</Link>.
            </p>
            <p>
              Cave Creek, Carefree, Fountain Hills and our other towns set their own heights and yards, and an HOA or a community&apos;s
              design guidelines can be stricter than the town. Our{" "}
              <Link href="/where-we-build">town pages</Link> cover each one.
            </p>

            <h2>How we plan an RV garage with your home</h2>
            <ol>
              <li>
                <strong>Measure the coach, and the next one.</strong> We take the height with the rooftop air units on, the length with
                any hitch, and ask whether a trailer, a tow car or a bigger rig may join it later.
              </li>
              <li>
                <strong>Fit it to the lot.</strong> We check the lot for utilities, access and grading, then run the setbacks, height
                limit and lot coverage for the house and the RV bay together, before a plan is drawn.
              </li>
              <li>
                <strong>Pick attached or detached.</strong> The roofline, the fire separation and how you use the bay decide it. Our{" "}
                <Link href="/faq/attached-vs-detached-rv-garage-arizona">attached vs detached comparison</Link> walks through both.
              </li>
              <li>
                <strong>Rough in the systems with the slab.</strong> The 50-amp outlet, the water line, the dump or macerator, the floor
                drain and the mini-split go in while the slab is open, so nothing is trenched across a finished floor later.
              </li>
              <li>
                <strong>Permit and build it with the house.</strong> An RV garage is far larger than the small sheds the codes let you
                build without a permit, so it goes through plan review and gets a building permit. For plan review and permitting,
                allow 2 to 4 months, depending on jurisdiction. During the build you get a written update every week.
              </li>
            </ol>
            <p>
              Planning a home with an RV garage in Scottsdale, Rio Verde, Cave Creek or Queen Creek? Call{" "}
              <a href={siteConfig.contact.phone.href}>{siteConfig.contact.phone.display}</a> or{" "}
              <Link href="/contact">tell us about your lot and your coach</Link>. If you do not have land yet,{" "}
              <Link href="/build-on-your-lot">building on your own lot</Link> explains how we help you find one.
            </p>
          </div>
        </div>
      </section>

      {proof ? (
        <section className="dt-section" style={{ paddingTop: 0 }}>
          <div className="container container-narrow">
            <Link href={`/gallery/${PROOF_SLUG}`} className="lib-card" data-testid="rv-proof" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "20px" }}>
              {proofImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={proofImage} alt={`${proof.title}, an RV garage home Jematell Homes built in ${proof.location}, Arizona`} loading="lazy" style={{ width: "100%", height: "auto", display: "block", borderRadius: "4px" }} />
              ) : null}
              <span className="lib-card-count">Built by Jematell Homes</span>
              <h2 className="lib-card-title">{proof.title}</h2>
              <p className="lib-card-desc">
                An RV garage home we completed in {proof.location}, Arizona in {proof.completed}. See the finished build in the gallery.
              </p>
              <span className="lib-card-more">
                See the project <ArrowRight size={15} aria-hidden="true" />
              </span>
            </Link>
          </div>
        </section>
      ) : null}

      <section className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container container-narrow">
          <Interlink sections={sections} title="Building an RV garage in Arizona" testid="rv-interlink" />
          <div className="dt-back-row" style={{ marginTop: "clamp(20px, 3vw, 32px)" }}>
            <Link href="/faq/topics/rv-garages" className="dt-back" data-testid="rv-topic-link">
              Every RV garage question we have answered <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <CTA />
    </main>
  );
}
