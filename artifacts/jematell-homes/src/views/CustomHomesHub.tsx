import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Interlink } from "@/components/Interlink";
import { locations, siteConfig } from "@/config/siteConfig";
import { SERVICE_LINKS } from "@/data/faq";
import type { LinkItem } from "@/lib/interlink";
import { faqLinks, guideLinks, blogLinks } from "@/lib/servicePageLinks";

/**
 * CustomHomesHub -- the builder layer under /custom-homes. Server component,
 * rendered by app/custom-homes/page.tsx and passed into ContentPage as a slot,
 * so the existing hero and headline stay exactly as they were (Tyler keeps the
 * headline) and the body below them finally answers "custom home builder
 * Scottsdale" searches: who we are, how a build is priced and run, where we
 * build, and the questions a buyer asks while comparing builders.
 *
 * Facts used are only the ones on file for the business: ROC number, cost-plus
 * with an itemized estimate and shared subcontractor bids, a flat-rate quote on
 * in-house plans, a written update every week, the draw schedule up front,
 * financing, a warranty, and licensed real estate agents on staff. No prices,
 * timelines or counts appear here.
 */
const CHOOSING = [
  "choosing-a-custom-home-builder",
  "how-do-i-compare-custom-home-builder-bids-and-quotes-in-arizona",
  "how-do-i-check-a-custom-home-builders-references-and-past-work",
  "custom-home-builder-vs-general-contractor",
  "do-i-need-an-architect-to-build-a-custom-home-in-arizona",
];
const CONTRACT = [
  "cost-plus-vs-fixed-price-home-contract",
  "budgeting-a-custom-home",
  "can-a-home-builder-raise-the-price-after-you-sign-in-arizona",
  "how-are-builder-allowance-overages-billed-on-a-cost-plus-vs-fixed-price-contract",
  "land-and-construction-loan-arizona",
  "construction-loan-requirements-arizona",
];
const PROCESS = [
  "how-does-the-custom-home-building-process-work",
  "what-are-the-steps-to-building-a-custom-home-in-arizona",
  "how-long-does-it-take-to-build-a-custom-home-in-arizona",
  "how-do-finish-selections-work-in-a-custom-home",
  "how-important-is-communication-with-your-builder-during-a-custom-build",
  "how-do-builders-handle-warranty-callbacks-and-the-one-year-walkthrough",
];

function serviceItem(key: string, blurb?: string): LinkItem | null {
  const s = SERVICE_LINKS[key];
  return s ? { to: s.href, label: s.label, kind: "service", blurb } : null;
}

export function CustomHomesHub() {
  const cityItems = locations
    .map((l) => serviceItem(`where-we-build/${l.slug}`))
    .filter((x): x is LinkItem => Boolean(x));
  const related = [
    serviceItem("build-on-your-lot", "Own a lot, or about to buy one? We start with what the land allows."),
    serviceItem("spec-homes", "A finished or in-progress home you can buy without designing from scratch."),
    serviceItem("floor-plans", "Our in-house plans, a faster start for a simpler custom home."),
    { to: "/casitas-and-guest-houses", label: "Casitas and Guest Houses", kind: "service", blurb: "A guest house or rentable casita, alone or with the main home." } as LinkItem,
    serviceItem("financing", "How a construction loan works with us."),
    serviceItem("warranty"),
  ].filter((x): x is LinkItem => Boolean(x));

  const sections = [
    {
      id: "ch-choosing",
      label: "Choosing a custom home builder",
      kicker: "What to ask, and what to compare, before you sign with anyone.",
      variant: "cards" as const,
      items: faqLinks(CHOOSING),
    },
    {
      id: "ch-contract",
      label: "Contracts, budget and loans",
      variant: "list" as const,
      items: faqLinks(CONTRACT),
    },
    {
      id: "ch-process",
      label: "How a build runs",
      variant: "accordion" as const,
      items: faqLinks(PROCESS, { full: true }),
    },
    {
      id: "ch-related",
      label: "Other ways to build with us",
      variant: "cards" as const,
      items: related,
    },
    {
      id: "ch-cities",
      label: "Where we build",
      variant: "chips" as const,
      items: cityItems,
    },
    {
      id: "ch-deeper",
      label: "Go deeper",
      variant: "feature" as const,
      items: [
        ...guideLinks(["how-to-build-a-custom-home-in-arizona"]),
        ...blogLinks([
          "choosing-the-best-home-builder-in-scottsdale-key-considerations-for-2026",
          "questions-to-ask-custom-home-builder-arizona",
          "rio-verde-vs-scottsdale-custom-home",
        ]),
      ],
    },
  ];

  return (
    <>
      <section id="custom-home-builder" className="dt-section byol-overview-section">
        <div className="container">
          <div className="byol-overview" data-testid="custom-homes-answer">
            <header className="byol-overview-heading">
              <span className="eyebrow">Scottsdale custom home builder</span>
              <h2>A Scottsdale custom home builder, start to finish</h2>
              <span className="byol-overview-rule" aria-hidden="true" />
            </header>
            <div className="byol-overview-body">
              <p className="byol-overview-lead">
                Jematell Homes is a family-owned custom home builder with an office in Scottsdale, building across Scottsdale, Phoenix,
                Rio Verde, Cave Creek, Fountain Hills, Carefree and the rest of the Phoenix metro. We are a licensed Arizona general
                contractor, {siteConfig.contact.roc}, and one team handles the work from the first sketch to the keys.
              </p>
              <p>
                You can bring a finished set of plans, start from one of our in-house floor plans, or design with us. Either way you
                work with the people who will build the home, and you hear from us every week: a written update on what was finished,
                what is scheduled next, and any decision we need from you.
              </p>
              <div className="byol-overview-scope" aria-label="How we work">
                <span>Cost-plus with an itemized estimate</span>
                <span>Subcontractor bids shared</span>
                <span>Draw schedule up front</span>
                <span>Weekly written updates</span>
              </div>
              <p>
                On a cost-plus build you receive an itemized cost estimate before we break ground, and we share the actual subcontractor
                bids so you can see what each part of the home costs. For our in-house plans and simpler custom homes we can quote a
                flat-rate build cost up front instead. You also get the full draw schedule at the start, so you know how and when
                payments are made during construction.
              </p>
              <p>
                Need land? Licensed real estate agents on our staff help clients find and buy a lot, and financing is available. If you already own a lot, start with{" "}
                <Link href="/build-on-your-lot">building on your own lot</Link>. For a guest house or casita, see{" "}
                <Link href="/casitas-and-guest-houses">casitas and guest houses</Link>. When you are ready to talk about your project,{" "}
                <Link href="/contact">contact us</Link> or call {siteConfig.contact.phone.display}.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container byol-resources-container">
          <Interlink sections={sections} title="Building a custom home in Arizona, answered" testid="custom-homes-interlink" />
          <div className="dt-back-row" style={{ marginTop: "clamp(20px, 3vw, 32px)" }}>
            <Link href="/faq" className="dt-back" data-testid="custom-homes-faq-link">
              Every question we have answered <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
