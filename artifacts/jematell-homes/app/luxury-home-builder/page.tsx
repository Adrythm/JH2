import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { pageMetadata } from "@/seo/metadata";
import { serviceJsonLd, breadcrumbJsonLd, faqPageJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import { Interlink } from "@/components/Interlink";
import { CTA } from "@/cta";
import { siteConfig } from "@/config/siteConfig";
import { faqLinks, refLinks, guideLinks } from "@/lib/servicePageLinks";

/**
 * /luxury-home-builder -- the service page for the luxury builder searches.
 * "luxury home builder" and "luxury home builders near me" showed the site
 * on page one only through the Business Profile's link, and "phoenix luxury
 * home builders" found no page at all (Search Console, 28 days to
 * 2026-11-23). The owner agreed the site may describe Jematell as a luxury
 * home builder (question 4627). Every statement about the business below is
 * a fact on record (the Custom Homes page's promises, the license, the lender
 * position, the service area); the luxury build detail is linked to the guide
 * and FAQs that carry it. No prices: this is a service page (rule 9e).
 */
const PATH = "/luxury-home-builder";

export const metadata = pageMetadata({
  title: "Phoenix and Scottsdale Luxury Home Builder",
  description:
    "Luxury home builder for Phoenix, Scottsdale, Paradise Valley and Cave Creek: how we design, price and build a high-end custom home on your lot, step by step.",
  canonical: PATH,
  image: "/images/spec-home.jpg",
});

const TOWNS: { slug: string; name: string; note: string }[] = [
  { slug: "scottsdale", name: "Scottsdale", note: "north Scottsdale view lots under the Environmentally Sensitive Lands rules, and HOA design review" },
  { slug: "paradise-valley", name: "Paradise Valley", note: "one-acre lots, the 25 percent floor-area cap, hillside rules and the Town's own permit" },
  { slug: "cave-creek", name: "Cave Creek", note: "rural desert yards, well or hauled water, septic and dark-sky rules" },
  { slug: "carefree", name: "Carefree", note: "deep yards, boulders, the 24 foot height cap and dark-sky rules" },
  { slug: "fountain-hills", name: "Fountain Hills", note: "hillside lots with views, and the town's fire sprinkler rule" },
  { slug: "rio-verde", name: "Rio Verde", note: "county land with room for a casita and an RV garage, where most of our gallery homes stand" },
  { slug: "phoenix", name: "Phoenix", note: "infill and teardown lots in established neighborhoods, up to one-acre estate lots" },
];

const DESIGN_REVIEW = [
  "how-does-hoa-design-review-affect-building-a-custom-home",
  "do-i-have-to-use-an-approved-builder-list-in-a-gated-arizona-community",
  "how-tall-can-a-custom-home-be-in-a-gated-or-hillside-community-in-arizona",
  "what-are-lrv-paint-color-rules-in-north-scottsdale-luxury-communities",
  "what-is-a-building-envelope-or-naos-easement-on-an-arizona-custom-lot",
  "what-roof-types-and-slopes-do-luxury-arizona-communities-allow",
];
const ROOMS = [
  "how-do-large-glass-walls-and-sliding-pocket-doors-perform-in-arizona-heat",
  "how-do-you-design-a-single-level-luxury-floor-plan-in-arizona",
  "what-is-a-spa-style-primary-bathroom-and-what-does-it-include",
  "what-is-a-courtyard-home-and-does-the-design-work-in-the-arizona-desert",
  "how-do-you-design-indoor-outdoor-living-flow-for-an-arizona-custom-home",
  "what-is-desert-contemporary-architecture-and-is-it-right-for-arizona",
];
const CHOOSING = [
  "how-to-verify-an-arizona-contractor-license-with-the-roc",
  "how-do-i-check-a-custom-home-builders-references-and-past-work",
  "how-do-i-compare-custom-home-builder-bids-and-quotes-in-arizona",
  "cost-plus-vs-fixed-price-home-contract",
  "red-flags-a-custom-home-builder-is-not-legitimate-arizona",
];
const LAW = [
  "building-codes/scottsdale-environmentally-sensitive-lands-ordinance",
  "community-design-guidelines/scottsdale-esl-ordinance-and-design-review-explained",
  "community-design-guidelines/troon-north-scottsdale-design-guidelines",
];

const LUXURY_QA = [
  {
    question: "Are you a luxury home builder?",
    answer: `Yes. Jematell Homes is a family-owned, licensed Arizona custom home builder, ${siteConfig.contact.roc}, based in Scottsdale. We design and build high-end custom homes across Phoenix, Scottsdale, Paradise Valley, Cave Creek, Carefree, Fountain Hills, Rio Verde and the rest of the Valley.`,
  },
  {
    question: "Can you build a luxury home on a lot I already own?",
    answer:
      "Yes. Building on your own lot is most of what we do. We check the lot for utilities, access and grading before design starts, then handle the permits, engineering, site prep and the build. If you do not have a lot yet, licensed real estate agents on our team can help you find and buy one.",
  },
  {
    question: "How do you price a luxury custom home?",
    answer:
      "On a cost-plus build you get an itemized cost estimate before we break ground, and we share the actual subcontractor bids with you, so you can see what every part of the home costs. For our in-house plans or a simpler custom home, we can quote a flat-rate build cost up front instead. We confirm the number before work starts.",
  },
  {
    question: "Can I use my own lender?",
    answer:
      "Yes. We are a builder, not a lender. You can use any construction lender, and we coordinate the draws, inspections and closing paperwork with the one you choose. If you would like, we can introduce loan officers we know who handle custom builds; that is free and never required.",
  },
  {
    question: "How long do plans and permits take?",
    answer:
      "Allow 2 to 4 months for plan review and permitting, depending on the city or county. A lot inside an HOA or a gated community also goes through the community's design review, so we bring the community's guidelines into the design early.",
  },
  {
    question: "Can a guest casita be built with the house?",
    answer:
      "Yes. We build detached casitas and guest houses with a new custom home, planned with the main house from the first sketch so the yard, the utilities and the views work for both, and sized to the town's size, height and setback rules.",
  },
];

export default function LuxuryHomeBuilderPage() {
  const sections = [
    {
      id: "luxury-design-review",
      label: "Design review and lot rules",
      kicker: "Most luxury lots in the Valley answer to an HOA or a city overlay as well as the building code.",
      variant: "cards" as const,
      items: [...faqLinks(DESIGN_REVIEW), ...refLinks(LAW)],
    },
    {
      id: "luxury-rooms",
      label: "Planning the house",
      variant: "accordion" as const,
      items: faqLinks(ROOMS, { full: true }),
    },
    {
      id: "luxury-choosing",
      label: "Choosing your builder",
      variant: "list" as const,
      items: faqLinks(CHOOSING),
    },
    {
      id: "luxury-reading",
      label: "Go deeper",
      variant: "feature" as const,
      items: guideLinks([
        "luxury-home-construction-arizona",
        "choosing-a-custom-home-builder-in-arizona-complete-guide",
        "arizona-home-styles-guide",
      ]),
    },
  ];

  return (
    <main className="page faq-page">
      <JsonLd
        data={[
          serviceJsonLd({
            name: "Luxury Custom Home Building",
            description: metadata.description as string,
            url: PATH,
          }),
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Custom Homes", url: "/custom-homes" },
            { name: "Luxury Home Builder", url: PATH },
          ]),
          faqPageJsonLd({
            url: PATH,
            items: LUXURY_QA.map((qa) => ({ question: qa.question, shortAnswer: qa.answer })),
          }),
        ]}
      />

      <section className="page-hero" style={{ alignItems: "center", minHeight: "65vh" }}>
        <ResponsiveImage name="cta-bg" className="page-hero-bg" alt="" widths={[768, 1280, 1920, 2500]} sizes="100vw" width={2500} height={1667} priority />
        <div className="page-hero-overlay" style={{ background: "linear-gradient(180deg, rgba(10,12,14,0.25) 0%, rgba(10,12,14,0.55) 100%)" }} />
        <div className="container page-hero-content" style={{ textAlign: "center", maxWidth: "100%" }}>
          <h1 className="page-hero-title hero-title" style={{ textTransform: "uppercase" }}>
            Luxury Home Builder in Phoenix and Scottsdale
          </h1>
        </div>
      </section>

      <section className="dt-section" style={{ paddingTop: "clamp(32px, 4vw, 56px)" }}>
        <div className="container container-narrow">
          <div className="dt-prose" data-testid="luxury-answer">
            <p>
              Jematell Homes is a family-owned luxury home builder based in Scottsdale. We design and build high-end custom homes
              across Phoenix, Scottsdale, Paradise Valley, Cave Creek, Carefree, Fountain Hills and Rio Verde, on a lot you already own
              or one we help you find. We are a licensed Arizona general contractor, {siteConfig.contact.roc}, and we build
              single-family homes only.
            </p>
            <p>
              What makes a home a luxury home is mostly planning you never see: a lot read before anything is drawn, a full set of
              drawings priced as the design grows, a structure and a building envelope made for big glass and desert sun, and a builder
              who tells you every week where the job stands. That is how we run every build. Our guide to{" "}
              <Link href="/guides/luxury-home-construction-arizona">luxury home construction in Arizona</Link> goes room by room
              through what changes in a high-end build.
            </p>
            <p>
              Thinking about a luxury custom home in the Phoenix area? Call{" "}
              <a href={siteConfig.contact.phone.href}>{siteConfig.contact.phone.display}</a> or{" "}
              <Link href="/contact">tell us about your lot</Link>. You can also see every type of home we build on our{" "}
              <Link href="/custom-homes">custom homes</Link> page.
            </p>
          </div>
        </div>
      </section>

      <section className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container container-narrow">
          <div className="dt-prose" data-testid="luxury-process">
            <h2>How we build a luxury home with you</h2>
            <ol>
              <li>
                <strong>We start with the lot.</strong>{" "}Before design, we check the lot for utilities, access and grading, and we find
                out how much of it you can build on. On a north Scottsdale view lot, part of the land often has to stay natural desert
                as <Link href="/faq/what-is-a-building-envelope-or-naos-easement-on-an-arizona-custom-lot">NAOS</Link>, so the buildable
                area is smaller than the lot. No lot yet? Licensed real estate agents on our team can help you{" "}
                <Link href="/buy-a-lot-with-us">find and buy one</Link>.
              </li>
              <li>
                <strong>We design it with you and your team.</strong>{" "}A high-end home usually needs an architect or designer, a
                structural engineer and often an interior designer. We bring the drawings and the budget together as the design grows,
                so a conflict is found on paper rather than on site. Prefer to start from a plan? Our{" "}
                <Link href="/floor-plans">floor plans</Link> can be built as drawn or adjusted to your lot and how you live.
              </li>
              <li>
                <strong>We price it before we break ground.</strong>{" "}On a cost-plus build you get an itemized cost estimate, and we
                share the actual subcontractor bids with you, so you can see what every part of the home costs. On our in-house plans
                or a simpler custom home, we can quote a flat-rate build cost up front instead.
              </li>
              <li>
                <strong>We take it through design review and permits.</strong>{" "}Many luxury lots sit inside an HOA or a gated community
                with its own design guidelines, on top of the city or county permit. Allow 2 to 4 months for plan review and
                permitting, depending on where you build.
              </li>
              <li>
                <strong>We build it and report every week.</strong>{" "}Each week of construction you get a written update: what was
                finished, what is scheduled next, and any decision we need from you. You also get the full draw schedule at the start,
                and we work with any construction lender you choose; see <Link href="/financing">financing your build</Link>.
              </li>
              <li>
                <strong>We stand behind it.</strong>{" "}Every home comes with our builder warranty. See{" "}
                <Link href="/warranty">what our warranty covers</Link>.
              </li>
            </ol>

            <h2>Where we build luxury homes</h2>
            <p>
              Each town in our service area brings its own lot rules, so a luxury home in Paradise Valley is planned differently from
              one in Cave Creek. Our town pages cover each one in detail:
            </p>
            <ul>
              {TOWNS.map((t) => (
                <li key={t.slug}>
                  <Link href={`/where-we-build/${t.slug}`}>{t.name}</Link>: {t.note}.
                </li>
              ))}
            </ul>
            <p>
              We also build in Mesa, Gilbert, Chandler, Queen Creek, Surprise and Pinal County. See{" "}
              <Link href="/where-we-build">every town we build in</Link>.
            </p>

            <h2>How to choose a luxury home builder in Phoenix</h2>
            <p>
              Reputable new home builders in Phoenix are easy to check, and the checks matter more at the high end, where the contract
              is larger and the house takes longer to build. Before you sign with anyone, us included:
            </p>
            <ul>
              <li>
                <strong>Check the license.</strong>{" "}Look the builder up on the Arizona Registrar of Contractors search and confirm an
                active license in a class that covers a whole house. Our page on{" "}
                <Link href="/faq/how-to-verify-an-arizona-contractor-license-with-the-roc">verifying an Arizona contractor license</Link>{" "}
                shows how. Ours is {siteConfig.contact.roc}.
              </li>
              <li>
                <strong>See homes they finished.</strong>{" "}Ask for homes you can visit and owners you can call. Our{" "}
                <Link href="/gallery">gallery</Link> shows the homes we have built, most of them in Rio Verde.
              </li>
              <li>
                <strong>Read how the price is built.</strong>{" "}A cost-plus contract and a fixed price handle overruns differently.
                Ask what is in each allowance and how an overage is billed. See{" "}
                <Link href="/faq/cost-plus-vs-fixed-price-home-contract">cost-plus vs. fixed price</Link>.
              </li>
              <li>
                <strong>Ask how you will hear from them.</strong>{" "}A long build goes better when you know what happened each week
                without having to call.
              </li>
              <li>
                <strong>Ask about design review.</strong>{" "}If your lot is in a gated community, ask whether the builder has taken
                plans through that kind of review and how they fit it around the city&apos;s permit. See{" "}
                <Link href="/faq/do-i-have-to-use-an-approved-builder-list-in-a-gated-arizona-community">approved builder lists</Link>.
              </li>
            </ul>

            <h2>What a luxury home costs to build in Phoenix</h2>
            <p>
              The price of a luxury custom home in the Phoenix area depends on the lot, the size, the structure and the finishes more
              than on any one number per square foot. A rocky hillside lot needs more excavation, retaining walls and longer utility
              runs. Open rooms and walls of glass need engineered beams and better glass. Selections and allowances move the rest. We
              price your home from your plans and confirm it before work starts. For the area&apos;s typical build costs, see{" "}
              <Link href="/faq/how-much-does-it-cost-to-build-a-custom-home-in-scottsdale">what a custom home costs in Scottsdale</Link>,{" "}
              <Link href="/faq/how-much-does-it-cost-to-build-a-custom-home-in-paradise-valley">in Paradise Valley</Link> and{" "}
              <Link href="/faq/cost-to-build-a-house-per-square-foot-in-arizona">per square foot across Arizona</Link>.
            </p>

            <h2>Luxury spec homes</h2>
            <p>
              Want a new home without the full design process? We also build{" "}
              <Link href="/spec-homes">move-in ready spec homes</Link> on our own floor plans in the Phoenix area.
            </p>

            <h2>Questions about building a luxury home with us</h2>
            {LUXURY_QA.map((qa) => (
              <div key={qa.question}>
                <h3>{qa.question}</h3>
                <p>{qa.answer}</p>
              </div>
            ))}
          </div>
          <div className="dt-back-row" style={{ marginTop: "clamp(20px, 3vw, 32px)" }}>
            <Link href="/faq/topics/luxury-features" className="dt-back" data-testid="luxury-topic-link">
              Every luxury home question we have answered <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container container-narrow">
          <Interlink sections={sections} title="Building a luxury home in Arizona" testid="luxury-interlink" />
        </div>
      </section>

      <CTA />
    </main>
  );
}
