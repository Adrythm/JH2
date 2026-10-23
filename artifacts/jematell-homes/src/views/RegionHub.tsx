import Link from "next/link";
import { siteConfig } from "@/config/siteConfig";
import { GALLERY_PROJECTS } from "@/data/galleryProjects";

/**
 * RegionHub -- the builder layer under a /where-we-build/<town> page. Server
 * component, passed into ContentPage as its hubSlot, so the town hero and its
 * headline stay exactly as they are. It answers "custom home builder <town>"
 * searches with what the scraped page never said: who reviews and inspects a
 * build in that town, what the local rules do to a lot, homes we have built
 * there, and how to start.
 *
 * Local facts come from the site's own reference library and FAQ (each one
 * sourced to the town's code or fee schedule); business facts are only the ones
 * on file (ROC number, cost-plus with an itemized estimate and shared bids,
 * weekly written updates, licensed agents for lots). No prices or timelines.
 */
interface Point {
  title: string;
  body: string;
  href: string;
}

interface Town {
  /** Gallery `location` values that count as this town. */
  galleryLocations: string[];
  heading: string;
  lead: string;
  points: Point[];
  /**
   * Optional: what else the town allows on a lot (casitas, guest houses,
   * garages), for the "casita builder <town>" searches the page is shown for.
   * Rules come from the site's sourced casita FAQ; what we build comes from
   * the casita and RV garage service pages.
   */
  beyond?: { heading: string; points: Point[] };
}

const CASITA_TOWNS_FAQ = "/faq/do-cave-creek-fountain-hills-and-carefree-allow-casitas-and-adus";

const REF = "/reference-library/building-codes";

const TOWNS: Record<string, Town> = {
  scottsdale: {
    galleryLocations: ["Scottsdale"],
    heading: "A custom home builder based in Scottsdale",
    lead:
      "Our office is in Scottsdale, and building here is work we know closely. A new home inside city limits is permitted, reviewed and inspected by the City of Scottsdale, and on the north and east desert lots the Environmentally Sensitive Lands rules decide how much of the lot you can build on before a floor plan is drawn.",
    points: [
      {
        title: "Desert lots and the ESL overlay",
        body: "On roughly 134 square miles of north and east Scottsdale, each lot must keep part of its land as Natural Area Open Space, from about 15% on flat desert up to 80% on steep hillside. We plan the house inside what is left.",
        href: `${REF}/scottsdale-environmentally-sensitive-lands-ordinance`,
      },
      {
        title: "Zoning sets where the house sits",
        body: "Scottsdale's single-family districts run from R1-7 to R1-190, each with its own yards. An R1-43 lot, for example, needs 40 foot front, 20 foot side and 35 foot rear yards under a 30 foot height cap.",
        href: `${REF}/scottsdale-residential-zoning-and-setbacks`,
      },
      {
        title: "City permit, then staged inspections",
        body: "Plans go through the city's plan review before the permit issues, and the build is inspected in stages through final and the Certificate of Occupancy. We run that process for you.",
        href: `${REF}/scottsdale-residential-building-permit-requirements`,
      },
    ],
    beyond: {
      heading: "Casitas, guest houses and ADUs in Scottsdale",
      points: [
        {
          title: "One attached and one detached ADU",
          body: "Under Ordinance 4687, adopted in September 2025, a single-family Scottsdale lot can hold one attached and one detached ADU. The first is capped at 1,000 square feet or 75% of the main home, whichever is less, and a second at 500 square feet. A detached unit in the rear yard can sit five feet from a side or rear lot line and ten feet from the house.",
          href: "/faq/adu-and-casita-rules-in-scottsdale-arizona",
        },
        {
          title: "Guest house or rentable ADU",
          body: "Scottsdale keeps a separate guest house category for family and visitors, which cannot be rented on its own. A rented ADU needs the owner living on the property, so what the unit is for is settled before it is designed.",
          href: "/faq/can-i-rent-out-my-casita-or-adu-in-scottsdale-arizona",
        },
        {
          title: "Casitas and guest houses we build",
          body: "We design and build detached casitas and guest houses as part of a new custom home or on a lot you already own, placed inside the lot's yards and, on a desert lot, outside its protected open space.",
          href: "/casitas-and-guest-houses",
        },
      ],
    },
  },
  "cave-creek": {
    galleryLocations: ["Cave Creek"],
    heading: "Building a custom home in Cave Creek",
    lead:
      "In the Town of Cave Creek the Town is the permitting authority, and most lots are large Desert Rural parcels with deep yards, a private well or hauled water, and a septic system. A Cave Creek home is designed around the land and the town's desert and dark-sky rules from the first sketch.",
    points: [
      {
        title: "Desert Rural zoning",
        body: "DR-190, DR-89 and DR-70 lots need 60 foot front and rear yards and 30 foot sides, with lot coverage capped at 10%. DR-43 lots allow 15%. Height tops out at 25 feet.",
        href: `${REF}/cave-creek-residential-zoning-and-setbacks`,
      },
      {
        title: "The 2024 codes, since January 2026",
        body: "Cave Creek moved to the 2024 International Residential and Building codes on January 1, 2026, so a plan drawn to an older edition needs updating before it is submitted.",
        href: `${REF}/cave-creek-adopted-building-codes`,
      },
      {
        title: "Dark-sky lighting and native desert",
        body: "Outdoor lighting is shielded and aimed down, protected desert plants are inventoried and kept or relocated, and grading is limited. These are part of the plan review, not an afterthought.",
        href: "/faq/desert-and-dark-sky-design-rules-cave-creek-carefree",
      },
    ],
    beyond: {
      heading: "Casitas, guest houses and garages on a Cave Creek lot",
      points: [
        {
          title: "Detached living quarters on Desert Rural lots",
          body: "Cave Creek allows a detached casita or guest house only in its Desert Rural zones, as space for your own household and guests. On a Single Residence lot the code does not allow detached living quarters, so the zone decides the question before any design.",
          href: CASITA_TOWNS_FAQ,
        },
        {
          title: "Casitas and guest houses we build",
          body: "We design and build detached casitas and guest houses as part of a new custom home or on a lot you already own, inside the same yards, 25 foot height cap and native habitat corridor as the house.",
          href: "/casitas-and-guest-houses",
        },
        {
          title: "RV garages",
          body: "A large desert lot has room for an RV garage. Door height, ceiling, slab and hookups are planned with the house, inside the same yards and lot coverage limits.",
          href: "/rv-garages",
        },
      ],
    },
  },
  "casa-grande": {
    galleryLocations: ["Casa Grande", "Arizona City"],
    heading: "A home builder for Casa Grande and Pinal County",
    lead:
      "We build in and around Casa Grande, including spec homes on our own floor plans. The first question for any lot here is whether it sits inside city limits, where the City of Casa Grande issues the permit, or in unincorporated Pinal County, which runs its own process and codes. We confirm that before anything is designed.",
    points: [
      {
        title: "City limits or county land",
        body: "A parcel a few hundred feet outside the city line falls under Pinal County Community Development instead of the city. The application, fees and code edition change with it.",
        href: "/faq/how-permitting-works-in-pinal-county",
      },
      {
        title: "Casa Grande zoning and setbacks",
        body: "The city's R-1 zone needs a 7,000 square foot lot, a 15 foot front yard, a 20 foot setback for a street-facing garage and a 20 foot rear yard, with a 28 foot height limit. Rural zones run deeper.",
        href: `${REF}/casa-grande-residential-zoning-and-setbacks`,
      },
      {
        title: "Permit review and impact fees",
        body: "Plans go to the city's Development Center for a multi-discipline review, and the city's development impact fees are due before the permit issues, so they belong in the budget from the start.",
        href: `${REF}/casa-grande-residential-building-permit-requirements`,
      },
    ],
  },
  carefree: {
    galleryLocations: ["Carefree"],
    heading: "Building a custom home in Carefree",
    lead:
      "The Town of Carefree issues its own building permits, and its residential zones are built for low homes on large desert lots: deep yards, a 24 foot height cap, and in most cases a private well and septic rather than town water and sewer.",
    points: [
      {
        title: "Deep yards and a low roofline",
        body: "Rural-70 lots need 60 foot front and rear yards and 30 foot sides at 13% lot coverage, Rural-43 lots 40 foot front and rear yards at 17%. Every residential zone caps height at 24 feet.",
        href: `${REF}/carefree-residential-zoning-and-setbacks`,
      },
      {
        title: "Well and septic on most lots",
        body: "Because most Carefree lots use a private well and septic, the town charges no water or sewer impact fees, and the water and septic plan is part of the site design.",
        href: `${REF}/carefree-building-permit-and-impact-fees`,
      },
      {
        title: "Dark-sky and desert design",
        body: "Shielded outdoor lighting, protected native plants and limited grading shape how a Carefree home looks and sits on its lot.",
        href: "/faq/desert-and-dark-sky-design-rules-cave-creek-carefree",
      },
    ],
    beyond: {
      heading: "Casitas and guest houses on a Carefree lot",
      points: [
        {
          title: "Guest houses, leased only with the home",
          body: "Carefree allows guest houses and accessory buildings, but they may not be rented apart from the main house, and no part of an accessory structure may rise more than 16 feet above its design grade.",
          href: CASITA_TOWNS_FAQ,
        },
        {
          title: "Casitas and guest houses we build",
          body: "We design and build detached casitas and guest houses as part of a new custom home or on a lot you already own, sized and placed to the town's height limit and yards.",
          href: "/casitas-and-guest-houses",
        },
      ],
    },
  },
  "fountain-hills": {
    galleryLocations: ["Fountain Hills"],
    heading: "Building a custom home in Fountain Hills",
    lead:
      "The Town of Fountain Hills permits and inspects new homes itself, builds to the 2024 codes for applications from September 2025 on, and asks for a few things most neighboring cities do not, starting with fire sprinklers in nearly every new home.",
    points: [
      {
        title: "Fire sprinklers are required",
        body: "Fountain Hills adopted its home sprinkler rule in 2008, before Arizona's 2009 limit on new mandates, so it still applies to essentially every new home, garages included.",
        href: `${REF}/fountain-hills-fire-sprinkler-requirements`,
      },
      {
        title: "Hillside lots and zoning",
        body: "Zoning runs from R1-6 to R1-190. An R1-43 lot needs a 40 foot front yard, 30 foot sides and a 40 foot rear yard at 20% coverage, under a 30 foot height cap.",
        href: `${REF}/fountain-hills-residential-zoning-and-setbacks`,
      },
      {
        title: "Community design review",
        body: "Many Fountain Hills communities, FireRock among them, review plans for height, roof slope and colors before the town ever sees them. We design to those rules first.",
        href: "/reference-library/community-design-guidelines/firerock-fountain-hills-design-guidelines",
      },
    ],
    beyond: {
      heading: "Casitas and guest houses in Fountain Hills",
      points: [
        {
          title: "Guest houses for your household, not rentals",
          body: "Fountain Hills allows a guest house for the people who live on the lot, their guests and household staff, and its zoning bars renting it or using it to earn income. One single-family home is allowed per lot.",
          href: CASITA_TOWNS_FAQ,
        },
        {
          title: "Casitas and guest houses we build",
          body: "We design and build detached casitas and guest houses as part of a new custom home or on a lot you already own, to the town's yards, height cap and any community design review.",
          href: "/casitas-and-guest-houses",
        },
      ],
    },
  },
  "rio-verde": {
    galleryLocations: ["Rio Verde"],
    heading: "Rio Verde custom homes, built by a builder who works here",
    lead:
      "Most of the homes in our gallery are in Rio Verde. Rio Verde and the Rio Verde Foothills are unincorporated Maricopa County, so the county reviews the plans and inspects the build, and in the Foothills there is no municipal water line: every home runs on a private well or hauled water.",
    points: [
      {
        title: "Water decides the plan and the loan",
        body: "A well or a hauled-water tank is part of the site plan from day one, and the choice affects which loans and appraisals work. We plan the water source and the financing together.",
        href: "/faq/can-you-build-a-custom-home-in-rio-verde-foothills-without-city-water",
      },
      {
        title: "County zoning on acre lots",
        body: "The Rural-43 zone common around Rio Verde needs 40 foot front and rear yards and 20 foot sides, with a 35 foot height limit and 25% lot coverage.",
        href: `${REF}/maricopa-county-residential-zoning-and-setbacks`,
      },
      {
        title: "County codes and inspections",
        body: "Unincorporated Maricopa County builds to the 2018 codes and inspects at set points from foundation to final. We handle the permit and schedule the inspections.",
        href: "/faq/what-building-codes-apply-in-rio-verde-foothills-arizona",
      },
    ],
    beyond: {
      heading: "Casitas, guest houses and ADUs on a Rio Verde lot",
      points: [
        {
          title: "Two ADUs under the county rule",
          body: "Since January 2026, state law A.R.S. 11-810.01 requires Maricopa County to allow one attached and one detached ADU wherever a single-family home is allowed. Each can be at least 75% of the main home or 1,000 square feet, whichever is less, and the county cannot ask for side or rear setbacks over five feet or extra parking.",
          href: "/faq/what-hb-2720-changed-for-adus-in-arizona",
        },
        {
          title: "A third unit on an acre or more",
          body: "Most Foothills lots are an acre or larger, which allows one more detached ADU. The county requires one unit on the lot to carry a recorded affordable-housing deed restriction before the permit for that extra unit issues.",
          href: "/faq/how-many-adus-per-property-arizona",
        },
        {
          title: "Casitas and guest houses we build",
          body: "We design and build detached casitas and guest houses with a new custom home or on a lot you already own, with the septic system sized for the second dwelling and the well or hauled-water supply planned to serve both.",
          href: "/casitas-and-guest-houses",
        },
      ],
    },
  },
  "paradise-valley": {
    galleryLocations: ["Paradise Valley"],
    heading: "Building a custom home in Paradise Valley",
    lead:
      "In Paradise Valley the Town reviews the plans, issues the permit and inspects the build. It is an estate town: the base R-43 district needs a full acre per home, the house may cover only a quarter of the lot, and on sloped ground the Town's hillside rules limit how much of the land can be graded. Those rules set the size and shape of the house before a floor plan is drawn.",
    points: [
      {
        title: "One acre, a 25% floor-area cap, 24 feet",
        body: "An R-43 lot needs 40 foot front and rear yards and 20 foot sides (40 feet for a second story), total floor area is capped at 25% of the lot, and a lot under three acres is held to 24 feet of height.",
        href: `${REF}/paradise-valley-residential-zoning-and-setbacks`,
      },
      {
        title: "Hillside lots",
        body: "On a building site with a slope of 10% or more, Article XXII caps the share of the land you may disturb, from 60% at a 10% slope to about 13% at 25%, and a Hillside Building Committee reviews the plans.",
        href: `${REF}/paradise-valley-hillside-development-requirements`,
      },
      {
        title: "The 2015 codes, a cycle behind",
        body: "The Town enforces the 2015 International Residential Code with the 2014 electrical code and the 2021 fire code, so a plan set drawn for a newer-code city needs reworking before it is submitted.",
        href: `${REF}/paradise-valley-adopted-building-codes`,
      },
    ],
  },
  phoenix: {
    galleryLocations: ["Phoenix"],
    heading: "Building a custom home in Phoenix",
    lead:
      "Inside Phoenix city limits the City of Phoenix reviews the plans, issues the permit and inspects the build. Phoenix moved to its 2024 Building Construction Code on August 1, 2025, and zoning runs from small R1-6 lots to one-acre RE-43 lots, so the lot's district sets the size and shape of the house before design starts.",
    points: [
      {
        title: "The 2024 codes, since August 2025",
        body: "Phoenix adopted the 2024 International Residential and Building codes and the 2023 National Electrical Code, with local amendments, effective August 1, 2025.",
        href: `${REF}/phoenix-adopted-building-codes`,
      },
      {
        title: "Zoning from R1-6 to RE-43",
        body: "An R1-6 lot allows a 15 foot front and 10 foot side yard; an RE-43 acre lot needs a 40 foot front and 30 foot sides, both with a height limit near 30 feet.",
        href: `${REF}/phoenix-residential-zoning-and-setbacks`,
      },
      {
        title: "Impact fees depend on where the lot is",
        body: "Most Phoenix impact fees apply only in the city's designated growth areas, not the built-out core, so two lots across town can carry very different fees.",
        href: `${REF}/phoenix-building-permit-and-impact-fees`,
      },
    ],
    beyond: {
      heading: "Teardown lots, casitas and ADUs in Phoenix",
      points: [
        {
          title: "Infill and teardown lots",
          body: "Many Phoenix custom homes go up where an older house stands today. The demolition is its own permit, and on a house built before the 1980s an asbestos survey and any abatement come first, so they are an early line in the plan. An infill lot almost always has city water and sewer at the street, confirmed with a will-serve letter.",
          href: "/guides/building-a-custom-home-in-phoenix-complete-guide",
        },
        {
          title: "Two ADUs on a single-family lot",
          body: "Under Phoenix Zoning Ordinance Section 706, a single-family lot can hold two accessory dwelling units. On a lot up to 10,000 square feet each one is capped at 1,000 square feet, a detached unit in a required yard is held to 15 feet, and the city cannot require extra parking. An ADU may be leased long term but not run as a short-term rental.",
          href: "/faq/adu-and-casita-rules-in-phoenix-arizona",
        },
        {
          title: "Casitas and guest houses we build",
          body: "We design and build detached casitas and guest houses as part of a new custom home or on a lot you already own, placed and sized to the lot's yards and the city's ADU rules.",
          href: "/casitas-and-guest-houses",
        },
      ],
    },
  },
  "apache-junction": {
    galleryLocations: ["Apache Junction"],
    heading: "Building a new home in Apache Junction",
    lead:
      "We build new custom homes in Apache Junction and the Pinal County land around it. Inside city limits the City of Apache Junction permits and inspects the build; just outside, Pinal County does, with its own process. We confirm which applies, and what the ground is like, before anything is designed.",
    points: [
      {
        title: "City limits or county land",
        body: "A parcel just outside the city line falls under Pinal County Community Development, with a different application, fees and code edition.",
        href: "/faq/how-permitting-works-in-pinal-county",
      },
      {
        title: "Zoning from RS-GR to RS-5",
        body: "An RS-GR lot of 1.25 acres needs a 40 foot front yard, 20 foot sides and a 40 foot rear yard; an RS-7 lot needs 20 foot front and rear yards and 7 foot sides.",
        href: `${REF}/apache-junction-residential-zoning-and-setbacks`,
      },
      {
        title: "Earth fissures and subsidence",
        body: "Parts of Pinal County have mapped earth fissures and sinking ground, which can change where a house sits on the lot and what foundation it needs. We check before design.",
        href: "/faq/earth-fissures-and-land-subsidence-in-pinal-county",
      },
    ],
  },
  surprise: {
    galleryLocations: ["Surprise"],
    heading: "Building a custom home in Surprise",
    lead:
      "Inside Surprise city limits the City of Surprise reviews the plans, issues the permit and inspects the build. Surprise moved to the 2024 International Codes on January 1, 2026, and its single-family zoning sorts lots into categories by size, from small R-1 lots to one-acre rural homesites, so the lot's category and any Planned Area Development it sits in shape the house before design starts.",
    points: [
      {
        title: "The 2024 codes, since January 2026",
        body: "Surprise adopted the 2024 International Residential and Building codes and the 2023 National Electrical Code, with local amendments, by Ordinance 2025-14. Custom home plans submitted on or after January 1, 2026 must meet them.",
        href: `${REF}/surprise-adopted-building-codes`,
      },
      {
        title: "Lot size sets the yards",
        body: "An R-1 Category B lot of 8,000 to 11,999 square feet needs a 12 foot front, 20 foot rear and 5 and 10 foot side yards; a one-acre lot needs 30 foot front and rear yards and 20 foot sides. R-1 homes top out at 35 feet.",
        href: `${REF}/surprise-residential-zoning-and-setbacks`,
      },
      {
        title: "A complete package, then city review",
        body: "Surprise takes applications online and reviews plans in ProjectDox. The package needs a soils report and structural calculations, and a home with no fire hydrant within 400 feet, or too little water flow, needs fire sprinklers. We handle the permit for you.",
        href: `${REF}/surprise-residential-building-permit-requirements`,
      },
    ],
  },
};

export function hasRegionHub(region: string): boolean {
  return region in TOWNS;
}

export function RegionHub({ region, cityName }: { region: string; cityName: string }) {
  const town = TOWNS[region];
  if (!town) return null;
  const built = GALLERY_PROJECTS.filter((p) => p.location && town.galleryLocations.includes(p.location));
  const { roc, phone } = siteConfig.contact;
  return (
    <section id="builder-in-town" className="dt-section byol-overview-section">
      <div className="container">
        <div className="byol-overview" data-testid="region-builder-answer">
          <header className="byol-overview-heading">
            <span className="eyebrow">Custom home builder in {cityName}, AZ</span>
            <h2>{town.heading}</h2>
            <span className="byol-overview-rule" aria-hidden="true" />
          </header>
          <div className="byol-overview-body">
            <p className="byol-overview-lead">{town.lead}</p>
            <p>
              Jematell Homes is a family-owned builder and a licensed Arizona general contractor, {roc}. You work with the people who build
              the home. On a cost-plus build you get an itemized estimate before we break ground and see the actual subcontractor bids, and
              every week of construction you get a written update on what was finished and what comes next.
            </p>
            <h3>What shapes a build in {cityName}</h3>
            <ul>
              {town.points.map((pt) => (
                <li key={pt.href}>
                  <strong>{pt.title}.</strong> {pt.body} <Link href={pt.href}>Read more</Link>
                </li>
              ))}
            </ul>
            {town.beyond ? (
              <>
                <h3>{town.beyond.heading}</h3>
                <ul>
                  {town.beyond.points.map((pt) => (
                    <li key={pt.href}>
                      <strong>{pt.title}.</strong> {pt.body} <Link href={pt.href}>Read more</Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            {built.length > 0 ? (
              <>
                <h3>Homes we have built in and around {cityName}</h3>
                <ul>
                  {built.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/gallery/${p.slug}`}>{p.title}</Link>, {p.meta.replace(" · ", ", ")}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            <p>
              Already own a lot in {cityName}? Start with <Link href="/build-on-your-lot">building on your own lot</Link>, where we look at
              what the land allows first. Still looking? Licensed real estate agents on our staff help clients find one. See how we run a
              build on the <Link href="/custom-homes">custom homes</Link> page, or <Link href="/contact">contact us</Link> or call{" "}
              <a href={phone.href}>{phone.display}</a> to talk about your project.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
