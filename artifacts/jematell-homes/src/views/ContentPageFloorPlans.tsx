"use client";
import Link from "next/link";
import { m } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Block } from "../data/pages";

/**
 * Floor-plan-only ContentPage sections, moved verbatim out of ContentPage.tsx.
 * Both components render exclusively on /floor-plans (FloorPlanWidgets when
 * key === "floorplans"; FloorPlanTiersSection only matches tier sections that
 * exist on that page), so ContentPage dynamic-imports this module and every
 * other content route (about, custom-homes, warranty, regions, ...) ships none
 * of this JS.
 */

// Same FADE_IN + Section shape as ContentPage.tsx (kept local so this chunk
// has no runtime import back into ContentPage; Section is structural).
const FADE_IN = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 } as const,
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

interface Section {
  heading: Block | null;
  blocks: Block[];
}

const FEATURED_PLAN_SLUGS = ["1849", "2616", "3610"];

export function FloorPlanTiersSection({ section, pageKey }: { section: Section; pageKey?: string }) {
  const allCards = Object.values(FP_EXCLUSIVES).flat();
  const featured = FEATURED_PLAN_SLUGS.map((slug) => allCards.find((c) => c.slug === slug)).filter(Boolean) as ExclusiveCard[];
  const isFloorPlansIndex = pageKey === "floorplans";
  const visibleCards = isFloorPlansIndex
    ? featured.map((c) => ({ ...c, specs: c.specs.filter((s) => s !== "11 Foot Ceilings") }))
    : featured;

  return (
    <section className="page-tiers section-pad alt-bg">
      <div className="container">
        <m.div className="page-section-head centered" {...FADE_IN}>
          <h2 className="heading-lg" style={{ textTransform: "uppercase", fontSize: "50px" }}>{section.heading?.text}</h2>
        </m.div>
        <div className="page-tiers-grid">
          {visibleCards.map((card, i) => (
            <m.article
              key={card.slug}
              className="page-tier-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link href={`/floor-plans/${card.slug}`} className="page-tier-media fp-exclusive-media" data-testid={`fp-featured-${card.slug}-img`}>
                <img {...planRenderingSrc(card.img)} alt={card.alt} loading="lazy" {...(PLAN_RENDERING_DIMS[card.img] ?? {})} />
              </Link>
              <div className="page-tier-body">
                <h3 className="page-tier-title">{card.title}</h3>
                <ul className="fp-exclusive-specs" aria-label="Plan specifications">
                  {card.specs.map((s) => <li key={s}>{s}</li>)}
                </ul>
                <p className="fp-exclusive-desc">{card.desc}</p>
                <Link href={`/floor-plans/${card.slug}`} className="page-tier-link" data-testid={`fp-featured-${card.slug}-cta`}>
                  View Plan &amp; Elevations <ArrowRight size={14} />
                </Link>
              </div>
            </m.article>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "clamp(32px, 4vw, 48px)" }}>
          <Link href="/floor-plans" className="btn btn-primary" data-testid="fp-tiers-view-all">
            View All Floor Plans
          </Link>
        </div>
      </div>
    </section>
  );
}

const FLOOR_PLAN_COLLECTIONS: Array<{
  id: string;
  title: string;
  widget: string;
  browse: string;
}> = [
  {
    id: "under-2000",
    title: "Homes Under 2,000 Sq Ft",
    widget:
      "https://www.architecturaldesigns.com/house-plan-collections/sub-2000-square-foot-homes/widget?new_window=true",
    browse:
      "https://www.architecturaldesigns.com/house-plan-collections/sub-2000-square-foot-homes",
  },
  {
    id: "2000-3000",
    title: "Homes Between 2,000 and 3,000 Sq Ft",
    widget:
      "https://www.architecturaldesigns.com/house-plan-collections/homes-between-2000-3000-square-feet/widget?new_window=true",
    browse:
      "https://www.architecturaldesigns.com/house-plan-collections/homes-between-2000-3000-square-feet",
  },
  {
    id: "over-3000",
    title: "Homes Over 3,000 Sq Ft",
    widget:
      "https://www.architecturaldesigns.com/house-plan-collections/over-3000-square-foot-homes/widget?new_window=true",
    browse:
      "https://www.architecturaldesigns.com/house-plan-collections/over-3000-square-foot-homes",
  },
];

// Jematell in-house plans that get a card above the partnered (Architectural
// Designs) widget, keyed by the collection they belong to. A collection with no
// entry here renders just the partnered widget (e.g. over-3000).
type ExclusiveCard = {
  slug: string;
  title: string;
  specs: string[];
  desc: string;
  img: string;
  alt: string;
};

/**
 * Intrinsic pixel size of every plan rendering, so each <img> can declare
 * width/height. The card sizes the image entirely in CSS, so these attributes
 * are visually inert; they exist so the browser can reserve the correct box
 * up front rather than running another layout pass as each lazy image decodes.
 * Keyed by src so the card data below stays untouched.
 */
const PLAN_RENDERING_DIMS: Record<string, { width: number; height: number }> = {
  "/images/plans/1604-rendering.png": { width: 1536, height: 1024 },
  "/images/plans/1644-rendering.png": { width: 1536, height: 1024 },
  "/images/1849-rendering-v2.png": { width: 1536, height: 1024 },
  "/images/plans/2045-rendering.png": { width: 1672, height: 941 },
  "/images/plans/2086-rendering.png": { width: 1774, height: 887 },
  "/images/plans/2194-rendering.png": { width: 1645, height: 956 },
  "/images/plans/2616-rendering.png": { width: 1774, height: 887 },
  "/images/plans/2867-rendering.png": { width: 1672, height: 940 },
  "/images/plans/2997-rendering.png": { width: 1601, height: 983 },
  "/images/plans/3094-rendering.png": { width: 1672, height: 941 },
  "/images/plans/3102-rendering.png": { width: 1672, height: 941 },
  "/images/plans/3610-rendering.png": { width: 1645, height: 956 },
  "/images/plans/3771-rendering.png": { width: 1672, height: 941 },
  "/images/plans/3970-rendering.png": { width: 1672, height: 941 },
  "/images/plans/4103-rendering.png": { width: 1672, height: 941 },
};

/**
 * Every rendering in PLAN_RENDERING_DIMS also ships as 768 and 1280 px WebP
 * beside its PNG (about 200 KB against 2.4 MB at 1280). Serve those, and keep
 * the PNG only for an image the table does not know.
 */
function planRenderingSrc(img: string): { src: string; srcSet?: string; sizes?: string } {
  if (!PLAN_RENDERING_DIMS[img] || !img.endsWith(".png")) return { src: img };
  const base = img.slice(0, -".png".length);
  return {
    src: `${base}-1280.webp`,
    srcSet: `${base}-768.webp 768w, ${base}-1280.webp 1280w`,
    sizes: "(max-width: 768px) 100vw, 50vw",
  };
}

const FP_EXCLUSIVES: Record<string, ExclusiveCard[]> = {
  "under-2000": [
    {
      slug: "1604",
      title: "The 1604 Plan",
      specs: ["1,604 Sq Ft", "3 Bedrooms", "2 Bathrooms", "2-Car Garage"],
      desc: "A thoughtfully designed single-story home, available to build on your lot.",
      img: "/images/plans/1604-rendering.png",
      alt: "Rendered exterior of the 1604 sq ft Jematell Homes floor plan",
    },
    {
      slug: "1644",
      title: "The 1644 Plan",
      specs: ["1,644 Sq Ft", "3 Bedrooms", "2 Bathrooms", "2-Car Garage"],
      desc: "A timeless single-story design, available to be built for your lot.",
      img: "/images/plans/1644-rendering.png",
      alt: "Rendered exterior of the 1644 sq ft Jematell Homes floor plan",
    },
    {
      slug: "1849",
      title: "The 1849 Plan",
      specs: ["1,849 Sq Ft", "3 Bedrooms", "2 Bathrooms", "2-Car Garage", "11 Foot Ceilings"],
      desc: "A proven single-story design, with soaring ceilings available for your lot.",
      img: "/images/1849-rendering-v2.png",
      alt: "Rendered exterior of the 1849 sq ft Jematell Homes floor plan",
    },
  ],
  "2000-3000": [
    {
      slug: "2045",
      title: "The 2045 Plan",
      specs: ["2,045 Sq Ft", "2 Bedrooms", "2.5 Bathrooms", "Attached Casita", "2.5-Car Garage"],
      desc: "A single-story home with an attached casita, available to build on your lot.",
      img: "/images/plans/2045-rendering.png",
      alt: "Rendered exterior of the 2045 sq ft Jematell Homes floor plan",
    },
    {
      slug: "2086",
      title: "The 2086 Plan",
      specs: ["2,086 Sq Ft", "3 Bedrooms", "2 Bathrooms", "1 Den/Office", "3-Car Garage"],
      desc: "A single-story home with an open great room and a roomy three-car garage, available to build on your lot.",
      img: "/images/plans/2086-rendering.png",
      alt: "Rendered exterior of the 2086 sq ft Jematell Homes floor plan",
    },
    {
      slug: "2194",
      title: "The 2194 Plan",
      specs: ["2,194 Sq Ft", "3 Bedrooms", "2 Bathrooms", "1 Den/Office", "2-Car + RV Garage"],
      desc: "A single-story plan with a dedicated RV garage, available to build on your lot.",
      img: "/images/plans/2194-rendering.png",
      alt: "Rendered exterior of the 2194 sq ft Jematell Homes floor plan",
    },
    {
      slug: "2616",
      title: "The 2616 Plan",
      specs: ["2,616 Sq Ft", "3 Bedrooms", "2.5 Bathrooms", "1 Den/Office", "3-Car Garage"],
      desc: "A spacious single-story design with a private study and gated courtyard, available to build on your lot.",
      img: "/images/plans/2616-rendering.png",
      alt: "Rendered exterior of the 2616 sq ft Jematell Homes floor plan",
    },
    {
      slug: "2867",
      title: "The 2867 Plan",
      specs: ["2,867 Sq Ft", "3 Bedrooms", "2.5 Bathrooms", "1 Den/Office", "3-Car Garage"],
      desc: "A single-story home with a private study, available to build on your lot.",
      img: "/images/plans/2867-rendering.png",
      alt: "Rendered exterior of the 2867 sq ft Jematell Homes floor plan",
    },
    {
      slug: "2997",
      title: "The 2997 Plan",
      specs: ["2,997 Sq Ft", "5 Bedrooms", "3.5 Bathrooms", "1 Bonus Room", "2.5-Car Garage"],
      desc: "A two-story modern farmhouse with an upstairs bonus room, available to build on your lot.",
      img: "/images/plans/2997-rendering.png",
      alt: "Rendered exterior of the 2997 sq ft Jematell Homes floor plan",
    },
  ],
  "over-3000": [
    {
      slug: "3094",
      title: "The 3094 Plan",
      specs: ["3,094 Sq Ft", "3 Bedrooms", "3 Bathrooms", "1 Den/Office", "4-Car Garage"],
      desc: "A single-story home with dual garages and a private study, available to build on your lot.",
      img: "/images/plans/3094-rendering.png",
      alt: "Rendered exterior of the 3094 sq ft Jematell Homes floor plan",
    },
    {
      slug: "3102",
      title: "The 3102 Plan",
      specs: ["3,102 Sq Ft", "4 Bedrooms", "3.5 Bathrooms", "1 Den/Office", "2-Car Garage"],
      desc: "A spacious single-story home with four bedrooms and an office, available to build on your lot.",
      img: "/images/plans/3102-rendering.png",
      alt: "Rendered exterior of the 3102 sq ft Jematell Homes floor plan",
    },
    {
      slug: "3610",
      title: "The 3610 Plan",
      specs: ["3,610 Sq Ft", "4 Bedrooms", "3 Bathrooms", "1 Den/Office", "4-Car Garage + Shop"],
      desc: "A single-story farmhouse with a dedicated shop and detached out building, available to build on your lot.",
      img: "/images/plans/3610-rendering.png",
      alt: "Rendered exterior of the 3610 sq ft Jematell Homes floor plan",
    },
    {
      slug: "3771",
      title: "The 3771 Plan",
      specs: ["3,771 Sq Ft", "3 Bedrooms", "4.5 Bathrooms", "1 Bonus + Den/Office", "3-Car Garage"],
      desc: "A refined single-story home with a bonus room and separate den, available to build on your lot.",
      img: "/images/plans/3771-rendering.png",
      alt: "Rendered exterior of the 3771 sq ft Jematell Homes floor plan",
    },
    {
      slug: "3970",
      title: "The 3970 Plan",
      specs: ["3,970 Sq Ft", "4 Bedrooms", "4.5 Bathrooms", "1 Den/Office", "3-Car Garage"],
      desc: "A grand single-story home built for entertaining, available to build on your lot.",
      img: "/images/plans/3970-rendering.png",
      alt: "Rendered exterior of the 3970 sq ft Jematell Homes floor plan",
    },
    {
      slug: "4103",
      title: "The 4103 Plan",
      specs: ["4,103 Sq Ft", "3 Bedrooms", "4.5 Bathrooms", "1 Bonus + Den/Office", "4-Car Garage"],
      desc: "Our largest single-story plan, with a bonus room and separate den, available to build on your lot.",
      img: "/images/plans/4103-rendering.png",
      alt: "Rendered exterior of the 4103 sq ft Jematell Homes floor plan",
    },
  ],
};

export function FloorPlanWidgets() {
  return (
    <>
      <section style={{ background: "var(--color-cream)", padding: "clamp(20px, 2.5vw, 40px) clamp(48px, 12vw, 220px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="container" style={{ width: "100%" }}>
          <m.div className="page-section-head centered" {...FADE_IN} style={{ marginBottom: 0 }}>
            <h2 className="heading-lg" style={{ textTransform: "uppercase" }}>Browse plans by size</h2>
          </m.div>
          <m.p className="page-plans-intro" {...FADE_IN}>Every home begins with the floor plan and we have plenty to choose from. Browse various styles, sizes, and configurations to find the perfect foundation for your vision. If you don’t see one you like don’t worry, our architect can create your dream home from scratch. You're also more than welcome to find a plan you want and bring it to us.</m.p>
        </div>
      </section>
      <section className="page-plans section-pad" style={{ background: "#fff", paddingTop: "clamp(24px, 3vw, 48px)" }} data-testid="floor-plan-widgets">
        <div className="container">
          <div className="page-plans-list">
            {FLOOR_PLAN_COLLECTIONS.map((c) => (
              <m.div
                key={c.id}
                className="page-plan-block"
                {...FADE_IN}
                data-testid={`floor-plan-${c.id}`}
              >
                <div className="page-plan-head">
                  <h3 className="page-plan-title">{c.title}</h3>
                </div>
                {FP_EXCLUSIVES[c.id] && (
                  <div className="fp-exclusives-inline" data-testid="floor-plan-exclusives">
                    <div className="fp-exclusives-inline-label">
                      <span className="eyebrow text-[15px]">Jematell Exclusives</span>
                    </div>
                    <div className="page-tiers-grid">
                      {FP_EXCLUSIVES[c.id].map((card) => (
                        <m.article
                          key={card.slug}
                          className="page-tier-card"
                          initial={{ opacity: 0, y: 24 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.15 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Link href={`/floor-plans/${card.slug}`} className="page-tier-media fp-exclusive-media" data-testid={`fp-exclusive-${card.slug}-img`}>
                            <img {...planRenderingSrc(card.img)} alt={card.alt} loading="lazy" {...(PLAN_RENDERING_DIMS[card.img] ?? {})} />
                          </Link>
                          <div className="page-tier-body">
                            <h3 className="page-tier-title">{card.title}</h3>
                            <ul className="fp-exclusive-specs" aria-label="Plan specifications">
                              {card.specs.filter((s) => s !== "11 Foot Ceilings").map((s) => (
                                <li key={s}>{s}</li>
                              ))}
                            </ul>
                            <p className="fp-exclusive-desc">{card.desc}</p>
                            <Link href={`/floor-plans/${card.slug}`} className="page-tier-link" data-testid={`fp-exclusive-${card.slug}-cta`}>
                              View Plan &amp; Elevations <ArrowRight size={14} />
                            </Link>
                          </div>
                        </m.article>
                      ))}
                    </div>
                  </div>
                )}
                {FP_EXCLUSIVES[c.id] && (
                  <div className="fp-partnered-label">
                    <span className="eyebrow text-[15px]" style={{ color: "var(--color-accent)" }}>Partnered Plans</span>
                  </div>
                )}
                <div className="fp-partnered-widget">
                  <iframe
                    src={c.widget}
                    title={`${c.title} house plan collection`}
                    height="580"
                    frameBorder={0}
                    allowFullScreen
                    loading="lazy"
                    data-testid={`floor-plan-iframe-${c.id}`}
                  />
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
