import { ResponsiveImage } from "@/components/ResponsiveImage";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pageMetadata } from "@/seo/metadata";
import { contentPageMeta, contentPageJsonLd } from "@/lib/contentPageMeta";
import { JsonLd } from "@/seo/JsonLd";
import { SpecHomesMap } from "@/views/SpecHomesMap";

export const metadata = pageMetadata(contentPageMeta({ pageKey: "spechomes" }));

// Every lot we're building on N. Roland Dr (one map pin each), north to south.
const LOTS: { plan: "1849" | "1644"; address: string; lat: number; lon: number }[] = [
  { plan: "1849", address: "7948 N. Roland Dr, Casa Grande, AZ 85194", lat: 32.952139, lon: -111.685667 },
  { plan: "1644", address: "7924 N. Roland Dr, Casa Grande, AZ 85194", lat: 32.952000, lon: -111.685639 },
  { plan: "1644", address: "7616 N. Roland Dr, Casa Grande, AZ 85194", lat: 32.950250, lon: -111.685806 },
  { plan: "1849", address: "7654 N. Roland Dr, Casa Grande, AZ 85194", lat: 32.950056, lon: -111.685806 },
  { plan: "1644", address: "7686 N. Roland Dr, Casa Grande, AZ 85194", lat: 32.949694, lon: -111.685833 },
  { plan: "1849", address: "7718 N. Roland Dr, Casa Grande, AZ 85194", lat: 32.949361, lon: -111.685889 },
  { plan: "1644", address: "7744 N. Roland Dr, Casa Grande, AZ 85194", lat: 32.949111, lon: -111.685972 },
];

// The two plan types being built (one card each, with a coming-soon count).
const PLANS: { id: "1849" | "1644"; href: string; img: string; specs: string[] }[] = [
  { id: "1849", href: "/floor-plans/1849", img: "/images/1849-rendering-v2.png", specs: ["1,849 Sq Ft", "3 Bedrooms", "2 Bathrooms", "2-Car Garage"] },
  { id: "1644", href: "/floor-plans/1644", img: "/images/plans/1644-rendering.png", specs: ["1,644 Sq Ft", "3 Bedrooms", "2 Bathrooms", "2-Car Garage"] },
];

export default function SpecHomes() {
  const jsonLd = contentPageJsonLd({ pageKey: "spechomes" });
  return (
    <>
      {jsonLd.length ? <JsonLd data={jsonLd} /> : null}
      <main className="page" data-testid="page-spec-homes">
        {/* Hero — kept as-is */}
        <section className="page-hero" data-testid="page-hero" style={{ alignItems: "center", minHeight: "65vh" }}>
          <ResponsiveImage name="spec-homes-hero" alt="" className="page-hero-bg" widths={[768, 1280]} sizes="100vw" width={1672} height={941} priority />
          <div
            className="page-hero-overlay"
            style={{ background: "linear-gradient(180deg, rgba(10,12,14,0.25) 0%, rgba(10,12,14,0.45) 100%)" }}
          />
          <div className="container page-hero-content" style={{ textAlign: "center", maxWidth: "100%" }}>
            <h1 className="page-hero-title hero-title" style={{ textTransform: "uppercase" }}>Spec Homes</h1>
          </div>
        </section>

        {/* Intro: reworked copy + kitchen photo */}
        <section className="section-pad">
          <div className="container">
            <div className="spec-intro-grid">
              <div className="spec-intro-copy" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h2 className="heading-lg" style={{ textTransform: "uppercase", fontSize: "clamp(26px, 5.5vw, 44px)" }}>High quality, stylish homes at affordable pricing</h2>
                <p>
                  Our homes are designed with current trends in mind, and we never choose a price tag over quality.
                  Experience the satisfaction of owning a thoughtfully designed and impeccably constructed spec home,
                  built by a team that treats every detail like it matters. Contact us today to learn more about our
                  available spec homes.
                </p>
                <Link href="/contact" className="btn btn-primary" data-testid="spec-intro-cta" style={{ alignSelf: "flex-start" }}>
                  Contact Us
                </Link>
              </div>
              <div className="spec-intro-media" style={{ overflow: "hidden", borderRadius: 4 }}>
                <img
                  src="/images/spec-homes-kitchen.jpg"
                  alt="Kitchen in a Jematell Homes spec home with a quartz waterfall island, subway-tile backsplash, and stainless appliances"
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Homes coming soon: interactive map + cards */}
        <section className="section-pad alt-bg" data-testid="spec-coming-soon" style={{ paddingTop: "clamp(32px, 4vw, 56px)" }}>
          <div className="container">
            <div className="page-section-head centered">
              <span className="eyebrow">Homes Coming Soon</span>
              <h2 className="heading-lg" style={{ textTransform: "uppercase", fontSize: "clamp(26px, 3.2vw, 44px)" }}>New spec homes in Casa Grande</h2>
              <p className="spec-coming-intro">
                A new collection of spec homes is underway on N. Roland Drive in <Link href="/where-we-build/casa-grande">Casa Grande</Link>. Explore the locations on
                the map, then see the two plans we are building across these lots.
              </p>
            </div>

            <SpecHomesMap
              homes={LOTS.map((l) => ({
                lat: l.lat,
                lon: l.lon,
                plan: `The ${l.plan} Plan`,
                address: l.address,
                status: "Coming Soon",
                href: `/floor-plans/${l.plan}`,
              }))}
            />

            <div className="spec-homes-cards">
              {PLANS.map((p) => {
                const count = LOTS.filter((l) => l.plan === p.id).length;
                return (
                  <article className="page-tier-card" key={p.id} data-testid={`spec-card-${p.id}`}>
                    <Link href={p.href} className="page-tier-media fp-exclusive-media">
                      <img src={p.img} alt={`Rendered exterior of the ${p.id} Plan by Jematell Homes`} loading="lazy" />
                    </Link>
                    <div className="page-tier-body">
                      <span className="eyebrow" style={{ color: "var(--color-warm)" }}>
                        {count} {count === 1 ? "Home" : "Homes"} Coming Soon
                      </span>
                      <h3 className="page-tier-title">The {p.id} Plan</h3>
                      <p className="spec-card-address">On N. Roland Dr, Casa Grande, AZ 85194</p>
                      <ul className="fp-exclusive-specs" aria-label="Plan specifications">
                        {p.specs.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                      <Link href={p.href} className="page-tier-link" data-testid={`spec-card-${p.id}-cta`}>
                        View Plan &amp; Elevations <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
            <div style={{ textAlign: "center", marginTop: "clamp(32px, 4vw, 48px)" }}>
              <Link href="/contact" className="btn btn-primary" data-testid="spec-coming-soon-cta">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
