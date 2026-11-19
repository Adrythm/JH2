import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Interlink } from "@/components/Interlink";
import { siteConfig } from "@/config/siteConfig";
import { SERVICE_LINKS } from "@/data/faq";
import type { LinkItem } from "@/lib/interlink";
import { faqLinks, blogLinks, termLinks } from "@/lib/servicePageLinks";

/**
 * SpecHomesHub -- the body under /spec-homes, below the Casa Grande homes.
 * Server component, rendered by app/spec-homes/page.tsx. The hero headline
 * stays exactly as it was (Tyler keeps the service-page headlines).
 *
 * It answers what a spec house is for the "spec house" searches, then says
 * what only this builder can: spec homes on our own in-house plans, the two
 * plans going up on N. Roland Dr in Casa Grande, the ROC license and the
 * warranty. Everything else is general and linked to its source or to the
 * spec home FAQs. No prices (rule 9): cost questions lead to contact.
 */

export const SPEC_FAQ: { question: string; answer: string }[] = [
  {
    question: "What is a spec house?",
    answer:
      "A spec house, short for speculative house, is a new home a builder plans, pays for and builds before it has a buyer, then sells finished or nearly finished. The U.S. Census Bureau counts these as homes built for sale.",
  },
  {
    question: "Can I make changes to a spec home before it is finished?",
    answer:
      "It depends on how far along the home is. Once the finishes are in, a spec home is sold as built. Early in construction a few choices may still be open, so ask us where each of our homes under construction stands.",
  },
  {
    question: "Do spec homes come with a warranty?",
    answer:
      "Yes. New homes in Arizona carry an implied warranty of workmanship and habitability, and our homes also come with a warranty from us. Our warranty page explains how to send a request.",
  },
  {
    question: "Are spec homes energy efficient?",
    answer:
      "A new spec home has to meet the energy code its city or county adopted, which sets minimums for insulation, windows and cooling equipment. Ask the builder which code edition applied and what the home has beyond it.",
  },
  {
    question: "Do I need a real estate agent to buy a spec home?",
    answer:
      "No. You can buy a spec home straight from the builder. Some buyers still bring their own agent to read the contract and handle the closing, and you can do that with us too.",
  },
];

function serviceItem(key: string, blurb?: string): LinkItem | null {
  const s = SERVICE_LINKS[key];
  return s ? { to: s.href, label: s.label, kind: "service", blurb } : null;
}

export function SpecHomesHub() {
  const related = [
    serviceItem("floor-plans", "Build one of our plans on a lot you choose, adjusted to how you live."),
    serviceItem("custom-homes", "Design the whole home with us from the first sketch."),
    serviceItem("build-on-your-lot", "Already own land? We check the lot first, then build."),
    serviceItem("where-we-build/casa-grande", "Where our current spec homes are going up."),
  ].filter((x): x is LinkItem => Boolean(x));

  const sections = [
    {
      id: "sh-questions",
      label: "Spec home questions, answered in full",
      variant: "cards" as const,
      items: faqLinks([
        "spec-home-vs-custom-home",
        "are-spec-homes-good-quality",
        "how-are-spec-homes-built-in-arizona",
        "move-in-ready-vs-building-custom-arizona",
        "new-home-builder-warranty-arizona",
      ]),
    },
    {
      id: "sh-related",
      label: "Other ways to build with us",
      variant: "cards" as const,
      items: related,
    },
    {
      id: "sh-deeper",
      label: "Go deeper",
      variant: "feature" as const,
      items: [
        ...blogLinks([
          "spec-homes-in-arizona-what-to-look-for-before-you-sign",
          "spec-home-vs-custom-home-vs-semi-custom-finding-your-perfect-fit-in-arizona",
          "spec-homes-explained-benefits-drawbacks-and-what-to-expect-in-phoenix-and-scottsdale",
        ]),
        ...termLinks(["spec-home"]),
      ],
    },
  ];

  return (
    <>
      <section id="how-our-spec-homes-work" className="dt-section byol-overview-section">
        <div className="container">
          <div className="byol-overview" data-testid="spec-homes-answer">
            <header className="byol-overview-heading">
              <h2>How a Jematell spec home works</h2>
              <span className="byol-overview-rule" aria-hidden="true" />
            </header>
            <div className="byol-overview-body">
              <p className="byol-overview-lead">
                On a spec home we make the decisions a buyer would make on a custom build. We choose the lot, the floor plan and the
                finishes, pull the permits, carry the construction and build the house. You buy a home you can walk through, not a set
                of drawings, and you skip the months of design meetings.
              </p>
              <p>
                Our spec homes are built on our own in-house floor plans, the same plans you can build on a lot of your own. The two
                going up on N. Roland Drive are the{" "}
                <Link href="/floor-plans/1849">1849 plan</Link> and the <Link href="/floor-plans/1644">1644 plan</Link>: single-level
                homes of 1,849 and 1,644 square feet, each with 3 bedrooms, 2 bathrooms and a 2-car garage. Both put the owner&apos;s
                suite at the back of the house, away from the two secondary bedrooms at the front.
              </p>
              <p>
                A spec home is permitted and inspected like any other new house, at each stage from the foundation to the final
                inspection, so nothing is covered up before an inspector has seen it. Our{" "}
                <Link href="/reference-library/building-codes/casa-grande-building-inspections-process">Casa Grande inspections guide</Link>{" "}
                walks that sequence step by step. We are a licensed Arizona contractor, {siteConfig.contact.roc}, and a{" "}
                <Link href="/warranty">warranty</Link> comes with our homes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="spec-semi-custom-or-custom" className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="byol-overview">
            <header className="byol-overview-heading">
              <h2>Spec, semi-custom or custom: which fits you</h2>
              <span className="byol-overview-rule" aria-hidden="true" />
            </header>
            <div className="byol-overview-body">
              <p>
                We build all three, so the honest answer turns on how much time you want to spend deciding and how soon you want to
                move in.
              </p>
              <ul>
                <li>
                  <strong>A spec home</strong> suits a buyer who wants a new house soon and is happy with a plan and finishes chosen
                  for the local market. The trade-off is limited customization: once the finishes are in, you take the home as built.
                </li>
                <li>
                  <strong>A semi-custom home</strong> starts from one of our{" "}
                  <Link href="/floor-plans">floor plans</Link>, from under 2,000 to over 3,000 square feet, built as drawn or adjusted
                  to your lot and how you live. You pick the lot and the finishes; the layout is already proven.
                </li>
                <li>
                  <strong>A fully custom home</strong>{" "}is designed with you from the first sketch, around your lot&apos;s zoning, views
                  and setbacks. See <Link href="/custom-homes">custom homes</Link>, or{" "}
                  <Link href="/build-on-your-lot">building on your own lot</Link> if you already own the land.
                </li>
              </ul>
              <p>
                For the full side-by-side, see <Link href="/faq/spec-home-vs-custom-home">spec home vs custom home</Link> and{" "}
                <Link href="/faq/move-in-ready-vs-building-custom-arizona">move-in ready vs building custom</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="before-you-buy-a-spec-home" className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="byol-overview">
            <header className="byol-overview-heading">
              <h2>What to check before you buy any spec home</h2>
              <span className="byol-overview-rule" aria-hidden="true" />
            </header>
            <div className="byol-overview-body">
              <p>Whether you buy from us or from another builder, these five checks tell you more than any listing photo.</p>
              <ul>
                <li>
                  <strong>The builder&apos;s license.</strong> Look the builder up on the{" "}
                  <a href="https://roc.az.gov/" target="_blank" rel="noopener noreferrer">Arizona Registrar of Contractors</a> site and
                  read its complaint history. Ours is {siteConfig.contact.roc}.
                </li>
                <li>
                  <strong>Your own inspection.</strong> Hire an independent home inspector even on a brand-new house. The city inspector
                  checks code; your inspector works for you.
                </li>
                <li>
                  <strong>The warranty in writing.</strong> Ask what it covers and for how long, on top of{" "}
                  <Link href="/faq/arizona-implied-warranty-of-workmanship-and-habitability">Arizona&apos;s implied warranty</Link>.
                </li>
                <li>
                  <strong>How the home handles the heat.</strong> Energy efficiency is set first by the code: Casa Grande, for example,
                  enforces the{" "}
                  <Link href="/reference-library/building-codes/casa-grande-adopted-building-codes">2018 International Energy Conservation Code</Link>{" "}
                  for insulation, windows and cooling equipment. Ask which edition applied and what the home has beyond it.
                </li>
                <li>
                  <strong>The lot and its rules.</strong> Read the zoning, any HOA rules and how water, sewer or septic reach the lot,
                  because a spec home comes with the land the builder chose.
                </li>
              </ul>
              <p>
                The <a href="https://www.census.gov/construction/soc/definitions.html" target="_blank" rel="noopener noreferrer">U.S.
                Census Bureau</a> counts spec homes as homes built for sale, and most new single-family homes are built that way, so
                these checks are the same ones most new-home buyers face.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="spec-home-questions" className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="byol-overview">
            <header className="byol-overview-heading">
              <h2>Spec home questions</h2>
              <span className="byol-overview-rule" aria-hidden="true" />
            </header>
            <div className="byol-overview-body">
              {SPEC_FAQ.map((f) => (
                <div key={f.question}>
                  <h3>{f.question}</h3>
                  <p>{f.answer}</p>
                </div>
              ))}
              <p>
                Want to walk one of our homes or hear where each one stands? <Link href="/contact">Contact us</Link> or call{" "}
                {siteConfig.contact.phone.display}.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container byol-resources-container">
          <Interlink sections={sections} title="Buying a spec home in Arizona" testid="spec-homes-interlink" />
          <div className="dt-back-row" style={{ marginTop: "clamp(20px, 3vw, 32px)" }}>
            <Link href="/faq" className="dt-back" data-testid="spec-homes-faq-link">
              Every question we have answered <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
