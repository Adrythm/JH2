import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/siteConfig";

/**
 * BuildOnYourLotGuide -- new body sections under /build-on-your-lot, rendered
 * by app/build-on-your-lot/page.tsx after BuildOnYourLotHub, inside
 * ContentPage's hubSlot. A file of its own because BuildOnYourLotHub.tsx is on
 * the Repl drift list (Work item 1482): the Repl's copy of that file differs
 * from main, and a run does not touch it until that is decided.
 *
 * It answers the "build a house" searches the page is meant to own (the
 * stages of building a house, whether you can build one yourself, how a loan
 * to build works, what drives the cost), then says what only this builder can:
 * the lot check first, weekly written updates, the draw schedule up front,
 * itemized estimates with the subcontractor bids on cost-plus builds, ROC#
 * 339367. The hero headline stays exactly as it was (Tyler keeps the
 * service-page headlines). No prices (rule 9): cost questions lead to the
 * cost FAQs and to contact.
 */

export const BUILD_ON_YOUR_LOT_FAQ: { question: string; answer: string }[] = [
  {
    question: "What are the stages of building a house?",
    answer:
      "A house is built in a fixed order: check the lot, design and engineer the home, get the permit, do the site work, pour the foundation, frame and dry in the shell, run the plumbing, electrical and mechanical rough-ins, insulate and hang drywall, finish the outside and the inside, then pass the final inspection. The city or county inspects each stage before the next one covers it.",
  },
  {
    question: "Can I build a house myself in Arizona?",
    answer:
      "Yes, on land you own. A.R.S. 32-1121 lets an owner act as their own contractor without a license, as long as any trade work that needs a license is done by a licensed contractor. You still pull the permit and pass every inspection, and selling or renting the home within a year of completion is treated as proof you built it to sell.",
  },
  {
    question: "Can you get a loan to build a house on land you own?",
    answer:
      "Yes. A construction loan pays for the build in stages, called draws, as each phase is finished and inspected, and you pay interest only on what has been drawn. Many lenders let the equity in a lot you own count toward the down payment, valued by appraisal.",
  },
  {
    question: "How long do the permits take before you can build a house in Arizona?",
    answer:
      "Allow 2 to 4 months for plan review and permitting, depending on the city or county. A city's published review target covers one review pass, not the whole approval, so plan for corrections and resubmittals.",
  },
  {
    question: "Can you show me an example floor plan for a square house?",
    answer:
      "Our floor plans page has each of our in-house plans with its layout drawing. A square plan usually puts the great room and kitchen in the middle with the bedrooms at the corners. Fewer corners and one simple roof mean less framing and less outside wall to build, which is one reason square and rectangular plans are common.",
  },
  {
    question: "Do I need to own land before I talk to a builder?",
    answer:
      "No. If you do not have a lot yet, our licensed real estate agents on staff can help you find and buy one, and we check it for utilities, access and grading before you commit.",
  },
  {
    question: "Can you build a house on a lot with no city water or sewer?",
    answer:
      "Yes. Wells, septic systems and hauled-water setups are routine on the rural lots we build on in Rio Verde, Cave Creek, Carefree and unincorporated Maricopa County. They add site work, so we check for them when we first walk the lot.",
  },
];

const STAGES: { name: string; body: ReactNode }[] = [
  {
    name: "Check the lot",
    body: (
      <>
        Zoning and setbacks, legal access, water, sewer or septic, power, soils and any floodplain. These decide what the house
        can be, so we walk the lot first.{" "}
        <Link href="/faq/how-to-find-out-if-you-can-build-on-a-lot-in-arizona">How to find out if you can build on a lot</Link>{" "}
        lists the checks.
      </>
    ),
  },
  {
    name: "Design and engineering",
    body: (
      <>
        Choose one of our <Link href="/floor-plans">floor plans</Link> and fit it to the lot, or design one from scratch. A
        licensed engineer designs the foundation and framing for your soils.
      </>
    ),
  },
  {
    name: "Building permit",
    body: (
      <>
        The plans go to your city or county for review. Allow 2 to 4 months for plan review and permitting, depending on
        jurisdiction. <Link href="/faq/how-long-does-it-take-to-get-a-building-permit-in-arizona">Permit times by city</Link>.
      </>
    ),
  },
  {
    name: "Site work",
    body: (
      <>
        Clearing, grading and the building pad, plus trenches for water, sewer or septic, and power. A large lot may need a{" "}
        <Link href="/faq/do-i-need-a-grading-or-earthwork-permit-and-swppp-before-i-break-ground-in-arizona">
          grading permit and a stormwater plan
        </Link>{" "}
        before work starts.
      </>
    ),
  },
  {
    name: "Foundation",
    body: (
      <>
        Under-slab plumbing goes in, then the footings and slab. Much of the Phoenix area sits on expansive clay, which is{" "}
        <Link href="/faq/why-post-tension-slabs-arizona">why post-tension slabs are common here</Link>. The footing is
        inspected before any concrete is poured.
      </>
    ),
  },
  {
    name: "Framing and dry-in",
    body: (
      <>
        Walls, roof trusses and sheathing go up, then the roof, windows and exterior doors, so the shell is closed to the
        weather.
      </>
    ),
  },
  {
    name: "Rough-ins",
    body: (
      <>
        Plumbing, electrical, heating and cooling, and gas lines are run through the open walls and inspected before anything
        covers them. It is the best time for a{" "}
        <Link href="/faq/what-is-a-pre-drywall-walkthrough-on-a-custom-home">pre-drywall walkthrough</Link>.
      </>
    ),
  },
  {
    name: "Insulation and drywall",
    body: <>Insulation is checked against the energy code, then the drywall is hung and finished.</>,
  },
  {
    name: "Exterior finish",
    body: (
      <>
        Lath and stucco or other siding, then paint, the driveway and the final grading that carries water away from the
        house. <Link href="/faq/are-stucco-homes-good-for-arizona">Why stucco suits Arizona</Link>.
      </>
    ),
  },
  {
    name: "Interior finish",
    body: <>Flooring, cabinets, counters, tile, interior doors and trim, lights, plumbing fixtures and paint.</>,
  },
  {
    name: "Final inspection and keys",
    body: (
      <>
        The final inspection leads to the{" "}
        <Link href="/faq/what-is-a-certificate-of-occupancy-and-how-do-i-get-one">certificate of occupancy</Link>, then a
        walkthrough with us and the keys. Our <Link href="/warranty">warranty</Link> starts there.
      </>
    ),
  },
];

export function BuildOnYourLotGuide() {
  const phone = siteConfig.contact.phone;
  return (
    <>
      <section id="stages-of-building-a-house" className="dt-section">
        <div className="container">
          <div className="byol-overview">
            <header className="byol-overview-heading">
              <h2>The stages of building a house on your lot</h2>
              <span className="byol-overview-rule" aria-hidden="true" />
            </header>
            <div className="byol-overview-body">
              <p className="byol-overview-lead">
                To build a house on land you own, you check the lot, design the home to fit it, get the permit, then build in a
                set order from the ground up. Each stage is inspected before the next one hides it, under the building code your
                city or county has adopted.
              </p>
              <ol>
                {STAGES.map((s) => (
                  <li key={s.name}>
                    <strong>{s.name}.</strong>{" "}{s.body}
                  </li>
                ))}
              </ol>
              <p>
                The full order of inspections, with the code section behind each, is in{" "}
                <Link href="/faq/what-inspections-are-required-when-building-a-house-in-arizona">
                  what inspections are required when building a house in Arizona
                </Link>
                . On every build we send you a written update each week of construction: what was finished, what is next, and any
                decision we need from you.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="can-you-build-a-house-yourself" className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="byol-overview">
            <header className="byol-overview-heading">
              <h2>Can you build a house yourself in Arizona?</h2>
              <span className="byol-overview-rule" aria-hidden="true" />
            </header>
            <div className="byol-overview-body">
              <p>
                Yes, on land you own. Arizona&apos;s owner-builder exemption,{" "}
                <a href="https://www.azleg.gov/ars/32/01121.htm" target="_blank" rel="noopener noreferrer">
                  A.R.S. 32-1121
                </a>
                , lets you act as your own general contractor without a license. A few things come with it:
              </p>
              <ul>
                <li>
                  <strong>Licensed trades.</strong>{" "}You can do the work yourself or with your own employees, but any trade work
                  that needs a license, such as electrical or plumbing, must go to a licensed contractor.
                </li>
                <li>
                  <strong>The same permits and inspections.</strong>{" "}The building department holds you to the same code and the
                  same inspection stages as any builder.
                </li>
                <li>
                  <strong>The one-year rule.</strong>{" "}Selling or renting the home within a year of completion is treated as
                  proof you built it to sell.
                </li>
                <li>
                  <strong>Financing.</strong>{" "}Fewer lenders make construction loans to owner-builders.{" "}
                  <Link href="/faq/owner-builder-construction-loan-arizona">Owner-builder construction loans</Link> covers who
                  does.
                </li>
              </ul>
              <p>
                <Link href="/faq/can-i-build-my-own-house-in-arizona">Can I build my own house in Arizona?</Link> goes through the
                rules in full. If you would rather have a licensed builder run the schedule, the trades and the inspections, we are
                Arizona contractor {siteConfig.contact.roc}, and you can check any builder&apos;s license with the{" "}
                <a href="https://roc.az.gov/before-hire" target="_blank" rel="noopener noreferrer">
                  Arizona Registrar of Contractors
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="paying-to-build-a-house" className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="byol-overview">
            <header className="byol-overview-heading">
              <h2>Paying to build a house on land you own</h2>
              <span className="byol-overview-rule" aria-hidden="true" />
            </header>
            <div className="byol-overview-body">
              <p>
                Most people pay for the build with a construction loan. It pays out in stages, called draws, as each phase is
                finished and inspected, and you pay interest only on what has been drawn so far. If you own your lot, many lenders
                let its equity count toward the down payment (
                <Link href="/faq/can-i-use-my-land-equity-as-the-down-payment-on-a-construction-loan">how land equity works</Link>
                ), and a{" "}
                <Link href="/faq/single-close-vs-two-close-construction-loan-in-arizona">single-close or two-close loan</Link>{" "}
                decides whether you qualify once or twice. Our <Link href="/financing">financing page</Link> walks through the
                options.
              </p>
              <p>What moves the cost of building a house on your own lot:</p>
              <ul>
                <li>
                  <strong>The lot itself.</strong>{" "}A well, a septic system, a long power line or heavy grading can add more than
                  people expect. See{" "}
                  <Link href="/faq/how-much-should-i-budget-for-site-work">how much to budget for site work</Link>.
                </li>
                <li>
                  <strong>The size and the plan.</strong>{" "}Square footage, the number of corners and rooflines, and a single or
                  second story.
                </li>
                <li>
                  <strong>Finishes.</strong>{" "}Counters, flooring, windows and fixtures move the total more than most other
                  choices.
                </li>
                <li>
                  <strong>Where you build.</strong>{" "}Permit, plan review and impact fees differ by city and county.
                </li>
              </ul>
              <p>
                Area-wide figures are in{" "}
                <Link href="/faq/cost-to-build-a-house-per-square-foot-in-arizona">
                  the cost per square foot to build a house in Arizona
                </Link>
                . For your own lot and plan, on a cost-plus build you get an itemized cost estimate before we break ground and see
                the actual subcontractor bids. On our in-house plans or a simpler custom home we can quote a flat-rate build cost up
                front instead. Either way you get the full draw schedule at the start.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="build-a-house-questions" className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="byol-overview">
            <header className="byol-overview-heading">
              <h2>Questions about building a house on your lot</h2>
              <span className="byol-overview-rule" aria-hidden="true" />
            </header>
            <div className="byol-overview-body">
              {BUILD_ON_YOUR_LOT_FAQ.map((f) => (
                <div key={f.question}>
                  <h3>{f.question}</h3>
                  <p>{f.answer}</p>
                </div>
              ))}
              <p>
                Own land, or looking at a lot? <Link href="/contact">Contact us</Link> or call{" "}
                <a href={phone.href}>{phone.display}</a>, and we will start with the lot.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
