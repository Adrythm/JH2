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
}

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
        body: "Unincorporated Maricopa County builds to the 2018 codes and inspects at set points from foundation to final. We schedule and attend every inspection.",
        href: "/faq/what-building-codes-apply-in-rio-verde-foothills-arizona",
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
