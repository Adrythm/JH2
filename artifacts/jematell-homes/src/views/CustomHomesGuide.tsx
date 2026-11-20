import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/siteConfig";

/**
 * CustomHomesGuide -- new body sections under /custom-homes, rendered by
 * app/custom-homes/page.tsx after CustomHomesHub, inside ContentPage's
 * hubSlot. A file of its own because CustomHomesHub.tsx is on the Repl drift
 * list (Work item 1482): the Repl's copy of that file differs from main, and a
 * run does not touch it until that is decided.
 *
 * It answers the "custom house builder" searches the page is meant to own
 * (what a custom home builder does, how to choose one, custom vs semi-custom
 * vs spec, building vs buying, where we build), then says what only this
 * builder can: single-family homes only, ROC# 339367, cost-plus with an
 * itemized estimate and the subcontractor bids, a flat-rate quote on in-house
 * plans, itemized allowances, the draw schedule up front, a written update
 * every week, licensed real estate agents on staff, and the homes in the
 * gallery. The hero headline stays exactly as it was (Tyler keeps the
 * service-page headlines). No prices (rule 9): cost questions lead to the cost
 * FAQs and to contact.
 */

export const CUSTOM_HOMES_FAQ: { question: string; answer: string }[] = [
  {
    question: "What does a custom house builder do?",
    answer:
      "A custom house builder builds one home for one owner, to a design made for that owner and that lot. The builder checks the lot, works with the architect and engineer on the plans, pulls the permit, hires and schedules the trades, passes each inspection and hands over the keys with a written warranty.",
  },
  {
    question: "Which new home builder is best?",
    answer:
      "The best builder for you holds an active Arizona ROC license for residential work, explains how it prices the home before you sign, puts every allowance and change in writing, tells you how often you will hear from it, and lets you walk homes it has finished. Ask every builder you are comparing the same questions and compare the answers in writing.",
  },
  {
    question: "Is building a custom home cheaper than buying?",
    answer:
      "Usually not up front. An existing home of the same size often costs less, because a custom build pays for land work, permits and new materials at today's prices. What you get for the difference is a home planned for your lot and the way you live, with nothing to remodel. A spec home or one of our in-house plans sits between the two.",
  },
  {
    question: "Why should I choose a custom home over a pre-built home?",
    answer:
      "Choose custom when the lot, the layout or the finishes matter more to you than moving in soon. You decide the floor plan, the views it faces, the garage and casita, and every finish, and you see each part of the house before the walls close.",
  },
  {
    question: "Can I build a second house on my property?",
    answer:
      "Often, yes. Many Phoenix-area towns allow a detached guest house or casita on a single-family lot, within their own rules on size, height and setbacks. We build casitas and guest houses with a new custom home or on a lot you already own.",
  },
  {
    question: "Do you need to own land to build a custom home?",
    answer:
      "No. Licensed real estate agents on our staff help clients find and buy a lot, and we check the lot for utilities, access and grading before you commit to it.",
  },
  {
    question: "How long does it take to build a custom home?",
    answer:
      "It depends on the design, the lot and the size of the home. Plan review and permitting alone take 2 to 4 months, depending on jurisdiction, before construction starts. On every build we send a written update each week, so you always know what was finished and what is next.",
  },
];

const CHECKS: { name: string; body: ReactNode }[] = [
  {
    name: "A license for the work",
    body: (
      <>
        A custom home in Arizona needs a contractor licensed for residential building. Look the number up on the{" "}
        <a href="https://roc.az.gov/search" target="_blank" rel="noopener noreferrer">
          Arizona Registrar of Contractors license search
        </a>{" "}
        and check that the license is active and the name matches the company.{" "}
        <Link href="/faq/how-to-verify-an-arizona-contractor-license-with-the-roc">How to verify a contractor license</Link>{" "}
        shows each step. Ours is {siteConfig.contact.roc}.
      </>
    ),
  },
  {
    name: "How the home is priced",
    body: (
      <>
        Ask whether the bid is cost-plus or a fixed price, because two bids cannot be compared until you know.{" "}
        <Link href="/faq/cost-plus-vs-fixed-price-home-contract">Cost-plus vs fixed-price contracts</Link> covers the trade-offs.
        On a cost-plus build we give you an itemized cost estimate before we break ground and share the actual subcontractor
        bids. On our in-house plans and simpler custom homes we can quote a flat-rate build cost up front.
      </>
    ),
  },
  {
    name: "Allowances you can trust",
    body: (
      <>
        An allowance set too low makes a bid look cheaper than the house will be. Ask for each one itemized, as ours are:
        flooring, cabinets, counters and fixtures each carry their own line before you choose a finish. See{" "}
        <Link href="/faq/what-is-a-builder-allowance-and-what-happens-if-you-go-over">what happens if you go over an allowance</Link>
        .
      </>
    ),
  },
  {
    name: "A contract that follows the law",
    body: (
      <>
        Arizona&apos;s{" "}
        <a href="https://www.azleg.gov/ars/32/01158.htm" target="_blank" rel="noopener noreferrer">
          A.R.S. 32-1158
        </a>{" "}
        says what a home construction contract must state, including the price and each progress payment.{" "}
        <Link href="/faq/what-to-include-in-custom-home-contract">What to include in a custom home contract</Link> lists the rest.
        We give you the full draw schedule at the start, so you know which stage releases which payment.
      </>
    ),
  },
  {
    name: "How often you will hear from them",
    body: (
      <>
        A build runs for many months of decisions. Ask who your contact is and how often you get an update. With us it is a
        written update every week of construction: what was finished, what is scheduled next, and any decision we need from you.
      </>
    ),
  },
  {
    name: "Homes you can see",
    body: (
      <>
        Quality and craftsmanship show best in a home that has been lived in for a few years. Ask to see finished work and talk
        to past clients. Our <Link href="/gallery">gallery</Link> shows the homes we have finished, most of them in Rio Verde.{" "}
        <Link href="/faq/how-do-i-check-a-custom-home-builders-references-and-past-work">How to check references and past work</Link>{" "}
        has the questions to ask.
      </>
    ),
  },
  {
    name: "A warranty in writing",
    body: (
      <>
        Ask what the warranty covers, for how long, and how a claim is handled. Read{" "}
        <Link href="/faq/how-long-does-a-builder-warranty-last-arizona">how long a builder warranty lasts in Arizona</Link>, then
        see <Link href="/warranty">our home warranty</Link>.
      </>
    ),
  },
];

const TOWNS: { slug: string; name: string; note: string }[] = [
  { slug: "scottsdale", name: "Scottsdale", note: "where our office is" },
  { slug: "paradise-valley", name: "Paradise Valley", note: "acre lots with their own size and height limits" },
  { slug: "rio-verde", name: "Rio Verde", note: "where most of the homes in our gallery were built" },
  { slug: "cave-creek", name: "Cave Creek", note: "rural lots, and a spec home we finished in 2026" },
  { slug: "carefree", name: "Carefree", note: "desert lots that often need a well and septic" },
  { slug: "fountain-hills", name: "Fountain Hills", note: "hillside desert lots" },
  { slug: "phoenix", name: "Phoenix", note: "infill and teardown lots in the city" },
  { slug: "surprise", name: "Surprise", note: "in the West Valley" },
  { slug: "casa-grande", name: "Casa Grande", note: "Pinal County, with two spec homes finished in 2026" },
];

export function CustomHomesGuide() {
  const phone = siteConfig.contact.phone;
  return (
    <>
      <section id="custom-house-builder" className="dt-section">
        <div className="container">
          <div className="byol-overview">
            <header className="byol-overview-heading">
              <h2>What a custom house builder does, and how we build</h2>
              <span className="byol-overview-rule" aria-hidden="true" />
            </header>
            <div className="byol-overview-body">
              <p className="byol-overview-lead">
                A custom house builder builds one home for one owner, to a design made for that owner and that lot, instead of
                repeating a plan across a subdivision. Jematell Homes is a family-owned custom home builder in Scottsdale. We are a
                licensed Arizona contractor, {siteConfig.contact.roc}, and we build single-family homes only, from a single-story
                plan home to a luxury custom home, across the Phoenix metro.
              </p>
              <p>On a custom home we take on the whole job, in this order:</p>
              <ul>
                <li>
                  <strong>The lot.</strong>{" "}Zoning, setbacks, access, water, sewer or septic, and power decide what the house can
                  be, so we check them first.{" "}
                  <Link href="/faq/how-to-find-out-if-you-can-build-on-a-lot-in-arizona">How to find out if you can build on a lot</Link>{" "}
                  lists the checks.
                </li>
                <li>
                  <strong>The design.</strong>{" "}You work with our architect to turn your ideas into plans, or start from one of
                  our <Link href="/floor-plans">in-house floor plans</Link> and change it to fit. An engineer designs the
                  foundation and framing for your soils.
                </li>
                <li>
                  <strong>The permit.</strong>{" "}We submit the plans and answer the reviewer&apos;s comments. Allow 2 to 4 months
                  for plan review and permitting, depending on jurisdiction.
                </li>
                <li>
                  <strong>The build.</strong>{" "}We hire and schedule the trades, buy the materials, and walk each milestone with
                  you. The city or county inspects every stage before the next one covers it.
                </li>
                <li>
                  <strong>The keys.</strong>{" "}A final walkthrough, the certificate of occupancy, and a written warranty that
                  starts the day you move in.
                </li>
              </ul>
              <p>
                Money is where most builds go wrong, so we settle it first. You know how your home is priced, what the draw
                schedule is and what every allowance covers, all in writing, before we break ground. If you need a construction
                loan, our <Link href="/financing">financing page</Link> explains how one works with us.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="custom-semi-custom-or-spec" className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="byol-overview">
            <header className="byol-overview-heading">
              <h2>Custom, semi-custom or a spec home</h2>
              <span className="byol-overview-rule" aria-hidden="true" />
            </header>
            <div className="byol-overview-body">
              <p>We build all three. Which one fits depends on how much of the home you want to decide, and how soon you want to move in.</p>
              <ul>
                <li>
                  <strong>Fully custom.</strong>{" "}The plan is drawn for you and your lot. Every room, view, ceiling height and
                  finish is your choice. It takes the longest, because the design comes before the permit.
                </li>
                <li>
                  <strong>One of our plans, made yours.</strong>{" "}Our in-house plans run from the 1604 to the 4103, from under
                  2,000 to over 3,000 square feet. The 2045, for example, is a single-story home with 2 bedrooms, 2.5 baths, an
                  attached casita and a 2.5-car garage. We build a plan as drawn or adjust it to the lot and how you live, and on
                  these plans we can quote a flat-rate build cost up front.
                </li>
                <li>
                  <strong>A spec home.</strong>{" "}A move-in ready home we build on our own plans, for buyers who want a new home
                  without the design process. See our <Link href="/spec-homes">spec homes</Link>.
                </li>
              </ul>
              <p>
                <Link href="/faq/semi-custom-vs-fully-custom-home-arizona">Semi-custom vs fully custom</Link> compares the first
                two in detail. Already own the land? Start with <Link href="/build-on-your-lot">building on your own lot</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="choosing-a-custom-home-builder" className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="byol-overview">
            <header className="byol-overview-heading">
              <h2>How to choose a custom home builder in Arizona</h2>
              <span className="byol-overview-rule" aria-hidden="true" />
            </header>
            <div className="byol-overview-body">
              <p>
                The{" "}
                <a href="https://roc.az.gov/before-hire" target="_blank" rel="noopener noreferrer">
                  Arizona Registrar of Contractors
                </a>{" "}
                tells buyers to get written estimates from at least three contractors. These are the checks that separate them,
                with how each one works with us:
              </p>
              <ol>
                {CHECKS.map((c) => (
                  <li key={c.name}>
                    <strong>{c.name}.</strong>{" "}{c.body}
                  </li>
                ))}
              </ol>
              <p>
                A good builder is glad to answer all of these in writing.{" "}
                <Link href="/faq/what-questions-should-i-ask-a-custom-home-builder-before-hiring">
                  The questions to ask a custom home builder before hiring
                </Link>{" "}
                has the full list.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="build-or-buy" className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="byol-overview">
            <header className="byol-overview-heading">
              <h2>Building a custom home or buying one</h2>
              <span className="byol-overview-rule" aria-hidden="true" />
            </header>
            <div className="byol-overview-body">
              <p>
                An existing home usually costs less up front than building a custom one of the same size. Building pays for land
                work, permits and new materials at today&apos;s prices. Buying often means paying again later to remodel what does
                not fit.
              </p>
              <p>What moves the cost of a custom home most:</p>
              <ul>
                <li>
                  <strong>The lot.</strong>{" "}A well, a septic system, a long power run or heavy grading. Wells, septic and hauled
                  water are routine on the rural lots we build on in the Rio Verde Foothills, Cave Creek, Carefree and
                  unincorporated Maricopa County.
                </li>
                <li>
                  <strong>The size and the shape.</strong>{" "}Square footage, the number of corners and rooflines, and one story or
                  two.
                </li>
                <li>
                  <strong>The finishes.</strong>{" "}Counters, flooring, windows and fixtures move the total more than most other
                  choices.
                </li>
                <li>
                  <strong>The town.</strong>{" "}Permit, plan review and impact fees differ by city and county.
                </li>
              </ul>
              <p>
                For area-wide figures, see{" "}
                <Link href="/faq/cost-to-build-a-house-per-square-foot-in-arizona">
                  the cost per square foot to build a house in Arizona
                </Link>{" "}
                and <Link href="/faq/is-it-cheaper-to-buy-or-build-a-house-in-arizona">whether it is cheaper to buy or build</Link>.
                For your own lot and plan, ask us for an estimate.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="where-we-build-custom-homes" className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="byol-overview">
            <header className="byol-overview-heading">
              <h2>Where we build custom homes</h2>
              <span className="byol-overview-rule" aria-hidden="true" />
            </header>
            <div className="byol-overview-body">
              <p>
                We build across the Phoenix metro and in Pinal County. Each town has its own lot rules and its own review, and each
                page below covers them:
              </p>
              <ul>
                {TOWNS.map((t) => (
                  <li key={t.slug}>
                    <Link href={`/where-we-build/${t.slug}`}>Custom homes in {t.name}</Link>, {t.note}.
                  </li>
                ))}
              </ul>
              <p>
                We also build in Mesa, Chandler, Gilbert, Queen Creek, Apache Junction and Maricopa. Want a guest house with the
                main home? See <Link href="/casitas-and-guest-houses">casitas and guest houses</Link>, or an{" "}
                <Link href="/rv-garages">RV garage</Link> planned with the house.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="custom-home-questions" className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="byol-overview">
            <header className="byol-overview-heading">
              <h2>Questions about hiring a custom home builder</h2>
              <span className="byol-overview-rule" aria-hidden="true" />
            </header>
            <div className="byol-overview-body">
              {CUSTOM_HOMES_FAQ.map((f) => (
                <div key={f.question}>
                  <h3>{f.question}</h3>
                  <p>{f.answer}</p>
                </div>
              ))}
              <p>
                Planning a custom home? <Link href="/contact">Contact us</Link> or call{" "}
                <a href={phone.href}>{phone.display}</a>, and we will start with your lot and your plans.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
