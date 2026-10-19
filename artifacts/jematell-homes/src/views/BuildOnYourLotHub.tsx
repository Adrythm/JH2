import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Interlink } from "@/components/Interlink";
import { locations } from "@/config/siteConfig";
import { SERVICE_LINKS } from "@/data/faq";
import type { LinkItem } from "@/lib/interlink";
import { faqLinks, guideLinks, blogLinks, termLinks } from "@/lib/servicePageLinks";

/**
 * BuildOnYourLotHub -- the hub layer under /build-on-your-lot. Server
 * component, rendered by the app/ wrapper and passed into ContentPage as a
 * slot, so the existing page (hero, intro, why choose us, process, floor
 * plans) stays exactly as it was and the corpus is layered beneath it.
 *
 * Why: "build on your lot arizona" (626 impressions in 90 days) ranked the
 * blog post at 7.9 while this service page had 8 impressions. The post keeps
 * its content and now links up here; this page becomes the cluster hub that
 * the land, water, permit and financing answers all point to.
 *
 * Every number on this page comes from a FAQ short answer, a guide summary or
 * a blog description rendered through servicePageLinks; the prose below only
 * says what the existing page already says about how Jematell works.
 */
const LAND = [
  "how-do-i-buy-land-to-build-a-house-in-arizona",
  "buying-raw-land-vs-a-finished-lot",
  "how-do-i-know-if-my-lot-is-in-the-city-or-unincorporated-county-arizona",
  "how-do-i-confirm-legal-access-to-a-rural-lot",
  "what-is-the-biggest-house-i-can-build-on-my-lot-in-arizona",
  "what-is-a-building-envelope-or-naos-easement-on-an-arizona-custom-lot",
  "do-i-need-a-floodplain-use-permit-to-build-near-a-wash-in-maricopa-county",
  "do-i-need-a-soils-or-geotechnical-report-and-what-triggers-special-foundation-requirements-in-arizona",
  "earth-fissures-and-land-subsidence-in-pinal-county",
];
const WATER = [
  "do-you-need-a-well-permit-or-adequate-water-supply-determination-to-build-in-maricopa-county",
  "how-deep-do-you-have-to-drill-a-well-in-arizona",
  "what-is-a-shared-well-agreement-in-arizona",
  "what-is-a-perc-test-and-do-i-need-one",
  "how-close-can-a-well-be-to-a-septic-system-in-arizona",
  "septic-permits-and-the-transfer-of-ownership-inspection",
  "how-much-does-it-cost-to-extend-power-or-utilities-to-a-rural-arizona-lot",
  "can-you-finance-a-hauled-water-or-cistern-home-with-a-usda-or-va-loan-in-arizona",
];
const PERMITS = [
  "what-are-the-steps-to-building-a-custom-home-in-arizona",
  "how-long-does-it-take-to-get-a-building-permit-in-arizona",
  "do-i-need-a-grading-or-earthwork-permit-and-swppp-before-i-break-ground-in-arizona",
  "what-inspections-are-required-when-building-a-house-in-arizona",
  "how-long-does-it-take-to-build-a-custom-home-in-arizona",
  "can-i-live-on-site-in-an-rv-while-building",
];
const MONEY = [
  "how-much-should-i-budget-for-site-work",
  "cost-to-build-a-house-per-square-foot-in-arizona",
  "can-i-use-my-land-equity-as-the-down-payment-on-a-construction-loan",
  "land-and-construction-loan-arizona",
  "construction-loan-requirements-arizona",
];

function serviceItem(key: string): LinkItem | null {
  const s = SERVICE_LINKS[key];
  return s ? { to: s.href, label: s.label, kind: "service" } : null;
}

export function BuildOnYourLotHub() {
  const cityItems = locations
    .map((l) => serviceItem(`where-we-build/${l.slug}`))
    .filter((x): x is LinkItem => Boolean(x));
  const financing = serviceItem("financing");

  const sections = [
    {
      id: "byol-land",
      label: "Start with the land, not the floor plan",
      kicker: "What to confirm before you close on a lot, or before you draw a line on one you already own.",
      variant: "cards" as const,
      items: faqLinks(LAND),
    },
    {
      id: "byol-water",
      label: "Water, septic and power",
      kicker: "On a private lot the utilities are yours to solve. The short answers, with the full ones one click away.",
      variant: "accordion" as const,
      items: faqLinks(WATER, { full: true }),
    },
    {
      id: "byol-permits",
      label: "Permits and the timeline",
      variant: "list" as const,
      items: [...faqLinks(PERMITS), ...guideLinks(["the-pre-construction-permit-layer-in-arizona"])],
    },
    {
      id: "byol-money",
      label: "Budget and financing",
      variant: "cards" as const,
      items: [...faqLinks(MONEY), ...(financing ? [financing] : [])],
    },
    {
      id: "byol-cities",
      label: "Where we build on private lots",
      variant: "chips" as const,
      items: cityItems,
    },
    {
      id: "byol-deeper",
      label: "Go deeper",
      variant: "feature" as const,
      items: [
        ...blogLinks(["building-on-your-own-lot-arizona"]),
        ...guideLinks(["building-a-custom-home-on-rural-arizona-land", "how-to-build-a-custom-home-in-arizona"]),
        ...faqLinks(["what-is-build-on-your-lot-home-building"]),
        ...termLinks(["build-on-your-lot"]),
      ],
    },
  ];

  return (
    <>
      <section id="how-it-works" className="dt-section byol-overview-section">
        <div className="container">
          <div className="byol-overview" data-testid="byol-answer">
            <header className="byol-overview-heading">
              <span className="eyebrow">Build on your lot</span>
              <h2>How building on your own lot works</h2>
              <span className="byol-overview-rule" aria-hidden="true" />
            </header>
            <div className="byol-overview-body">
              <p className="byol-overview-lead">
              Building on your own lot means you own the land, or are buying it, and hire us to design and build the home on it, rather
              than buying a home inside a builder&apos;s subdivision. It gives you the most say over location, lot character and how the
              home sits on the ground. It also means the land decides most of what comes next.
              </p>
              <p>
              Before a floor plan matters, a lot has to answer a set of questions: what the zoning and setbacks allow, whether access is
              legal and recorded, whether water comes from the city, a well or a hauled-water tank, whether sewer is available or a septic
              system is needed, where power is and what it costs to bring in, what the soil is made of, and whether any of the lot sits in
              a floodplain. Which city or county issues the permit changes the answers, so we start there.
              </p>
              <div className="byol-overview-scope" aria-label="What we evaluate">
                <span>Land &amp; access</span>
                <span>Water &amp; utilities</span>
                <span>Soil &amp; drainage</span>
                <span>Permits &amp; budget</span>
              </div>
              <p>
              That is the work Jematell Homes takes on with you: site evaluation and feasibility, floor plan selection and customization,
              permits and approvals, and budget planning and financing, from the first walk of the lot to move-in day. The sections below
              are the questions we get asked most, answered from our own library.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container byol-resources-container">
          <Interlink sections={sections} title="Your lot, answered" testid="byol-interlink" />
          <div className="dt-back-row" style={{ marginTop: "clamp(20px, 3vw, 32px)" }}>
            <Link href="/faq/topics/buying-land-to-build" className="dt-back" data-testid="byol-topic-link">
              Every land question we have answered <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
