import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Interlink } from "@/components/Interlink";
import { siteConfig } from "@/config/siteConfig";
import { SERVICE_LINKS } from "@/data/faq";
import type { LinkItem } from "@/lib/interlink";
import { faqLinks, blogLinks, termLinks } from "@/lib/servicePageLinks";

/**
 * FloorPlansHub -- the body under /floor-plans, below the plan collections.
 * Server component, rendered by app/floor-plans/page.tsx through ContentPage's
 * hubSlot. The hero headline stays exactly as it was (Tyler keeps the
 * service-page headlines).
 *
 * It answers the "floor plans" searches (what a floor plan is, how to read
 * one, the common layouts, how to choose one for an Arizona lot, whether a
 * builder's plan can be changed), then says what only this builder can: the
 * in-house plans from the 1604 to the 4103, built as drawn or adjusted to the
 * lot, partnered plans, a plan you bring, or a design from scratch. No prices
 * (rule 9): plan cost questions lead to the FAQ and to contact.
 */

export const FLOOR_PLAN_FAQ: { question: string; answer: string }[] = [
  {
    question: "What is a floor plan?",
    answer:
      "A floor plan is a scaled drawing of a home seen from above. It shows each room with its size, the walls, doors and windows, and how you move from one space to the next, so you can judge a layout before anything is built.",
  },
  {
    question: "Can I modify a builder's standard floor plan to fit my needs?",
    answer:
      "Often, yes. With us, any of our in-house plans can be built as drawn or adjusted to your lot and how you live. Changes are easiest while the plans are being drawn, before they are stamped and sent for permit, so bring your list of changes to the first meeting.",
  },
  {
    question: "Can I bring my own floor plan to a builder?",
    answer:
      "Yes. You are welcome to find a plan you like and bring it to us. Expect it to need local work before it can be permitted: structural engineering for Arizona soils, energy code updates for your city, and changes to fit your lot's setbacks.",
  },
  {
    question: "What is the most popular floor plan?",
    answer:
      "Around Phoenix and Scottsdale, the layout we see again and again is a single-story home with an open great room in the middle and the owner's suite on the opposite side from the other bedrooms, opening to a covered patio.",
  },
  {
    question: "How do I make a floor plan for a house?",
    answer:
      "Start with a list of rooms and how you use them, then the lot: its size, setbacks and the direction the sun comes from. Sketch how the rooms connect, then have a designer, architect or design-build builder draw it to scale as construction drawings the city will accept.",
  },
  {
    question: "Do house plans need an architect's stamp in Arizona?",
    answer:
      "Not always. Arizona law lets a person who is not a registered architect design a detached single-family home. The structure often still needs a licensed engineer, depending on the soils, the spans and what your city or county asks for at plan review.",
  },
];

function serviceItem(key: string, blurb?: string): LinkItem | null {
  const s = SERVICE_LINKS[key];
  return s ? { to: s.href, label: s.label, kind: "service", blurb } : null;
}

export function FloorPlansHub() {
  const phone = siteConfig.contact.phone;
  const related = [
    serviceItem("build-on-your-lot", "Already own land? We check the lot first, then fit the plan to it."),
    serviceItem("custom-homes", "Design the whole home with us from the first sketch."),
    serviceItem("spec-homes", "Move-in ready homes we build on our own plans."),
    serviceItem("casitas", "A casita or guest house beside a plan, or built into one."),
  ].filter((x): x is LinkItem => Boolean(x));

  const sections = [
    {
      id: "fp-questions",
      label: "Floor plan questions, answered in full",
      variant: "cards" as const,
      items: faqLinks([
        "open-concept-vs-split-bedroom-floor-plan-which-is-right-for-an-arizona-home",
        "how-do-you-design-a-single-level-luxury-floor-plan-in-arizona",
        "can-i-change-the-floor-plan-during-a-custom-build",
        "stock-house-plans-vs-custom-designed-plans",
        "how-big-should-a-custom-home-be-and-how-do-you-plan-the-room-program",
        "do-house-plans-need-an-engineer-or-architect-stamp",
      ]),
    },
    {
      id: "fp-related",
      label: "Other ways to build with us",
      variant: "cards" as const,
      items: related,
    },
    {
      id: "fp-deeper",
      label: "Go deeper",
      variant: "feature" as const,
      items: [
        ...blogLinks(["how-to-choose-the-right-floor-plan", "rio-verde-floor-plans-desert-living"]),
        ...termLinks(["semi-custom-home", "site-plan"]),
      ],
    },
  ];

  return (
    <>
      <section id="how-our-floor-plans-work" className="dt-section byol-overview-section">
        <div className="container">
          <div className="byol-overview" data-testid="floor-plans-answer">
            <header className="byol-overview-heading">
              <h2>How our floor plans work</h2>
              <span className="byol-overview-rule" aria-hidden="true" />
            </header>
            <div className="byol-overview-body">
              <p className="byol-overview-lead">
                A floor plan is the scaled drawing of a home seen from above: every room with its size, the walls, doors and
                windows, and the path you walk from the front door to the back patio. It is the first decision on any build,
                and the one that is hardest to change once the walls are up.
              </p>
              <p>
                Our in-house plans run from the <Link href="/floor-plans/1604">1604 plan</Link> to the{" "}
                <Link href="/floor-plans/4103">4103 plan</Link>, from under 2,000 to over 3,000 square feet. Each one can be
                built on your lot as drawn, or adjusted to the lot and to how you live. If none of them fits, the partnered
                plans above add many more by size, you can bring a plan you found yourself, or our architect can design
                the home from scratch as a <Link href="/custom-homes">fully custom home</Link>.
              </p>
              <p>
                Whichever plan you start from, we build it as a licensed Arizona contractor, {siteConfig.contact.roc}, with
                a written update every week of construction. For plan review and permitting, allow 2 to 4 months, depending
                on jurisdiction.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="types-of-floor-plans" className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="byol-overview">
            <header className="byol-overview-heading">
              <h2>The floor plan types we build most</h2>
              <span className="byol-overview-rule" aria-hidden="true" />
            </header>
            <div className="byol-overview-body">
              <p>Most layouts are a mix of a few ideas. These are the ones our plans are built around.</p>
              <ul>
                <li>
                  <strong>Single-story.</strong>{" "}Every one of our in-house plans is single-story except the{" "}
                  <Link href="/floor-plans/2997">2997</Link>, a two-story modern farmhouse with an upstairs bonus room. One level
                  means no stairs, a roof that shades the whole home, and every room a step from the patio. See{" "}
                  <Link href="/faq/single-story-vs-two-story-home-in-arizona">single-story vs two-story in Arizona</Link>.
                </li>
                <li>
                  <strong>Open concept with split bedrooms.</strong>{" "}The kitchen, dining and living room share one great room,
                  and the owner&apos;s suite sits on the far side from the other bedrooms for privacy. Our{" "}
                  <Link href="/faq/open-concept-vs-split-bedroom-floor-plan-which-is-right-for-an-arizona-home">open-concept vs split-bedroom guide</Link>{" "}
                  explains why the two work together.
                </li>
                <li>
                  <strong>A casita or multi-generational suite.</strong>{" "}The <Link href="/floor-plans/2045">2045 plan</Link>{" "}
                  has an attached casita, so a parent, a grown child or a guest gets a space of their own under the same roof.
                  More in <Link href="/faq/what-is-a-multigenerational-or-next-gen-home-and-how-do-you-design-one">next-gen home design</Link>{" "}
                  and on our <Link href="/casitas-and-guest-houses">casitas and guest houses</Link> page.
                </li>
                <li>
                  <strong>Room for the toys.</strong>{" "}The <Link href="/floor-plans/2194">2194 plan</Link> adds an RV garage to a
                  2-car garage, and the <Link href="/floor-plans/3610">3610 plan</Link> pairs a 4-car garage with a shop and a
                  detached out building. Our <Link href="/rv-garages">RV garages</Link> page covers sizing.
                </li>
                <li>
                  <strong>A den or office.</strong>{" "}Most of our plans over 2,000 square feet carry a den or office, and the{" "}
                  <Link href="/floor-plans/3771">3771</Link> and <Link href="/floor-plans/4103">4103</Link> add a bonus room as well.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="how-to-read-a-floor-plan" className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="byol-overview">
            <header className="byol-overview-heading">
              <h2>How to read a floor plan</h2>
              <span className="byol-overview-rule" aria-hidden="true" />
            </header>
            <div className="byol-overview-body">
              <p>A plan sheet packs a lot into lines and numbers. Read it in this order.</p>
              <ul>
                <li>
                  <strong>Room sizes.</strong>{" "}Dimensions read width by length in feet and inches, so 14&apos;0&quot; x 16&apos;6&quot;
                  is a room 14 feet wide and 16 and a half feet long. Picture your own furniture in it, not the furniture drawn.
                </li>
                <li>
                  <strong>Walls, doors and windows.</strong>{" "}Thick lines are walls. A door shows as a gap with an arc for the way it
                  swings, and a window as thin lines set into the wall. Check that doors do not swing into each other.
                </li>
                <li>
                  <strong>The square footage.</strong>{" "}Ask whether the number counts only the cooled living area or also the
                  garage and the covered patio, because plans are not always counted the same way.
                </li>
                <li>
                  <strong>How you move through it.</strong>{" "}Trace a day: groceries from the garage to the kitchen, laundry to the
                  bedrooms, guests from the entry to a bathroom. Long trips and dead ends show up fast.
                </li>
                <li>
                  <strong>What the code asks of each room.</strong>{" "}Every bedroom needs an emergency escape window or door{" "}
                  (<Link href="/reference-library/code-library/irc-r310-emergency-escape-and-rescue-openings">IRC R310</Link>), and
                  rooms have minimum ceiling heights (<Link href="/reference-library/code-library/irc-r305-ceiling-height">IRC R305</Link>).
                  The <a href="https://codes.iccsafe.org/content/IRC2021P1" target="_blank" rel="noopener noreferrer">International
                  Residential Code</a> sets both, as your city adopts it.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="choosing-a-floor-plan-for-your-lot" className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="byol-overview">
            <header className="byol-overview-heading">
              <h2>Choosing a floor plan for an Arizona lot</h2>
              <span className="byol-overview-rule" aria-hidden="true" />
            </header>
            <div className="byol-overview-body">
              <p>
                A plan that looks right online can still be wrong for your land. Before you fall for one, check it against the lot.
              </p>
              <ul>
                <li>
                  <strong>Setbacks and lot width.</strong>{" "}Zoning sets how close the house can sit to each property line, which
                  decides how wide a plan fits. See the setback rules for{" "}
                  <Link href="/reference-library/building-codes/scottsdale-residential-zoning-and-setbacks">Scottsdale</Link>,{" "}
                  <Link href="/reference-library/building-codes/phoenix-residential-zoning-and-setbacks">Phoenix</Link> and{" "}
                  <Link href="/reference-library/building-codes/maricopa-county-residential-zoning-and-setbacks">Maricopa County</Link>.
                </li>
                <li>
                  <strong>The sun.</strong>{" "}West-facing glass takes the hardest afternoon heat. A plan that faces its great room and
                  patio north or east, or shades the west side, is easier to keep cool.
                </li>
                <li>
                  <strong>The view and the patio.</strong>{" "}Turn the plan so the rooms you use most open to the view and to a
                  covered patio, not to the neighbor&apos;s wall.
                </li>
                <li>
                  <strong>HOA and community rules.</strong>{" "}Some communities set the roof height, the style or the colors.
                  Read them before you choose a two-story plan or a modern elevation.
                </li>
                <li>
                  <strong>Engineering.</strong>{" "}Under{" "}
                  <a href="https://www.azleg.gov/ars/32/00144.htm" target="_blank" rel="noopener noreferrer">A.R.S. 32-144</a>, a
                  detached single-family home can be designed by someone who is not a registered architect, but the foundation and
                  framing often need a licensed engineer. Our{" "}
                  <Link href="/faq/do-house-plans-need-an-engineer-or-architect-stamp">stamp guide</Link> explains when.
                </li>
              </ul>
              <p>
                If you already own land, start with <Link href="/build-on-your-lot">building on your lot</Link>: we check the lot
                first, then fit the plan to it. Changing the layout later costs more the further the build has gone, as{" "}
                <Link href="/faq/can-i-change-the-floor-plan-during-a-custom-build">changing a floor plan during a build</Link> shows.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="floor-plan-questions" className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="byol-overview">
            <header className="byol-overview-heading">
              <h2>Floor plan questions</h2>
              <span className="byol-overview-rule" aria-hidden="true" />
            </header>
            <div className="byol-overview-body">
              {FLOOR_PLAN_FAQ.map((f) => (
                <div key={f.question}>
                  <h3>{f.question}</h3>
                  <p>{f.answer}</p>
                </div>
              ))}
              <p>
                Found a plan you like, or want to change one of ours? <Link href="/contact">Contact us</Link> or call{" "}
                <a href={phone.href}>{phone.display}</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="dt-section" style={{ paddingTop: 0 }}>
        <div className="container byol-resources-container">
          <Interlink sections={sections} title="Choosing a floor plan in Arizona" testid="floor-plans-interlink" />
          <div className="dt-back-row" style={{ marginTop: "clamp(20px, 3vw, 32px)" }}>
            <Link href="/faq" className="dt-back" data-testid="floor-plans-faq-link">
              Every question we have answered <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
