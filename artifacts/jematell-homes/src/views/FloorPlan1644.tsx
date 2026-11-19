"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { m, MotionConfig } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { CTA } from "../cta";
import { PlanHeroPicture } from "../components/PlanHeroPicture";

const FADE_IN = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 } as const,
  transition: { duration: 0.5 },
};

const DRAWINGS = [
  { label: "Floor Plan", src: "/images/plans/1644-1.png", alt: "1644 floor plan layout: 3 bed, 2 bath, 2-car garage" },
  { label: "Elevations", src: "/images/plans/1644-2.png", alt: "1644 floor plan — all four exterior elevations" },
];

// Gallery images self-hosted from public/images/cdn (was Squarespace CDN).
const GALLERY_IMGS = [
  { src: "/images/cdn/a291783f-5471-4d99-b5b0-fb1332393921__Mccartney-Lot-3-Front.webp", alt: "McCartney Spec 1644 — front exterior" },
  { src: "/images/cdn/eba33962-2329-47c6-87d4-bb67bff4c3fd__10-IMG_7202.webp", alt: "McCartney Spec 1644 — living area" },
  { src: "/images/cdn/2d2f86e9-03ec-4007-b378-d82ed906309f__12-IMG_7208.webp", alt: "McCartney Spec 1644 — great room" },
  { src: "/images/cdn/00ec9454-5496-42a7-9546-c67943192a6a__09-IMG_7223.webp", alt: "McCartney Spec 1644 — interior" },
  { src: "/images/cdn/2cb592e8-3ff4-450b-a67c-fee0dd56fdc4__08-IMG_7196.webp", alt: "McCartney Spec 1644 — kitchen" },
  { src: "/images/cdn/550dfd32-db8c-4e91-aa2c-090dd10c9abe__06-IMG_7193.webp", alt: "McCartney Spec 1644 — kitchen island" },
  { src: "/images/cdn/7830319f-f614-485d-a308-33346aceecf7__07-IMG_7190.webp", alt: "McCartney Spec 1644 — dining" },
  { src: "/images/cdn/8809b55d-5280-4cdf-b63c-b7513507b41f__13-IMG_7211.webp", alt: "McCartney Spec 1644 — hallway" },
  { src: "/images/cdn/e7eb120e-9a1e-42e9-9cdb-01e4e6848722__14-IMG_7220.webp", alt: "McCartney Spec 1644 — bedroom" },
  { src: "/images/cdn/e0549060-2dc6-4fde-b66b-cd15a1666f89__15-IMG_7214.webp", alt: "McCartney Spec 1644 — bathroom" },
];

export default function FloorPlan1644() {
  const [lightbox, setLightbox]     = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const prev = useCallback(() =>
    setSlideIndex((i) => (i - 1 + GALLERY_IMGS.length) % GALLERY_IMGS.length), []);
  const next = useCallback(() =>
    setSlideIndex((i) => (i + 1) % GALLERY_IMGS.length), []);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeLightbox(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, closeLightbox]);

  return (
    <MotionConfig reducedMotion="user">
      <main className="page" data-testid="page-floor-plan-1644">
        <section className="gallery-detail-hero">
          <PlanHeroPicture
            src="/images/plans/1644-rendering.png"
            alt="Rendered exterior elevation of the 1644 sq ft Jematell Homes floor plan"
          />
          <div className="page-hero-overlay" style={{ background: "linear-gradient(to top, rgba(22,22,22,0.72) 0%, rgba(22,22,22,0.2) 60%, transparent 100%)" }} />
          <div className="container page-hero-content gallery-detail-hero-content">
            <h1 className="page-hero-title hero-title">1644 Floor Plan</h1>
          </div>
        </section>

        <div className="fp1849-breadcrumb">
          <div className="container">
            <Link href="/floor-plans" className="fp1849-back" data-testid="fp1644-back">
              <ArrowLeft size={14} /> Floor Plans
            </Link>
          </div>
        </div>

        <div className="fp1849-stats">
          <div className="container">
            <div className="fp1849-stats-inner">
              <div className="fp1849-stat">
                <span className="fp1849-stat-value">1,644</span>
                <span className="fp1849-stat-label">Sq Ft</span>
              </div>
              <div className="fp1849-stat-divider" />
              <div className="fp1849-stat">
                <span className="fp1849-stat-value">3</span>
                <span className="fp1849-stat-label">Bedrooms</span>
              </div>
              <div className="fp1849-stat-divider" />
              <div className="fp1849-stat">
                <span className="fp1849-stat-value">2</span>
                <span className="fp1849-stat-label">Bathrooms</span>
              </div>
              <div className="fp1849-stat-divider" />
              <div className="fp1849-stat">
                <span className="fp1849-stat-value">2-Car</span>
                <span className="fp1849-stat-label">Garage</span>
              </div>
            </div>
          </div>
        </div>

        <section className="section-pad fp1849-plan-section" style={{ paddingTop: "clamp(24px, 3vw, 40px)" }}>
          <div className="container">
            <m.div className="page-section-head centered" {...FADE_IN}>
              <h2 className="heading-lg" style={{ textTransform: "uppercase" }}>Floor Plan &amp; Elevations</h2>
            </m.div>
            <m.p className="fp1849-plan-desc" {...FADE_IN}>This thoughtfully designed single-level home maximizes every square foot with an open and inviting layout. The heart of the home features a spacious great room that flows into the dining area and island kitchen, creating the perfect setting for everyday living and entertaining. Two secondary bedrooms are privately positioned near the front of the home with a shared full bath, while the secluded owner's suite is tucked away at the rear and offers a spa-inspired bathroom, generous walk-in closet, and direct access to the covered patio. Additional conveniences, including a dedicated laundry room, welcoming covered entry, and two-car garage, provide both comfort and functionality.</m.p>
            <div className="fp1849-drawings-grid">
              {DRAWINGS.map((d, i) => (
                <m.figure
                  key={d.label}
                  className="fp1849-drawing-figure fp1849-drawing-clickable"
                  {...FADE_IN}
                  onClick={() => setLightbox(i)}
                  data-testid={`fp1644-drawing-${i}`}
                >
                  <span className="fp1849-drawing-label">
                    {d.label}
                    <span className="fp1849-zoom-hint" aria-hidden="true"><ZoomIn size={13} /> Enlarge</span>
                  </span>
                  <img src={d.src} alt={d.alt} className="fp1849-drawing-img" loading="lazy" />
                </m.figure>
              ))}
            </div>
          </div>
        </section>

        <section className="fp1849-gallery-section alt-bg">
          <div className="container" style={{ paddingTop: "clamp(40px, 6vw, 80px)" }}>
            <m.div className="page-section-head centered" {...FADE_IN}>
              <h2 className="heading-lg" style={{ textTransform: "uppercase" }}>See the Finished Home</h2>
              <p className="fp1849-gallery-body">The 1644 floor plan built in Casa Grande, AZ.</p>
            </m.div>
          </div>

          <m.div className="fp1849-carousel" {...FADE_IN}>
            <button
              className="fp1849-carousel-btn fp1849-carousel-prev"
              onClick={prev}
              aria-label="Previous photo"
              data-testid="fp1644-carousel-prev"
            >
              <ChevronLeft size={22} />
            </button>

            <div className="fp1849-carousel-track">
              {[0, 1, 2].map((offset) => {
                const img = GALLERY_IMGS[(slideIndex + offset) % GALLERY_IMGS.length];
                return (
                  <img
                    key={`${slideIndex}-${offset}`}
                    src={img.src}
                    alt={img.alt}
                    className="fp1849-carousel-img"
                    loading="lazy"
                  />
                );
              })}
            </div>

            <button
              className="fp1849-carousel-btn fp1849-carousel-next"
              onClick={next}
              aria-label="Next photo"
              data-testid="fp1644-carousel-next"
            >
              <ChevronRight size={22} />
            </button>

            <div className="fp1849-carousel-dots" role="tablist">
              {GALLERY_IMGS.map((_, i) => (
                <button
                  key={i}
                  className={`fp1849-carousel-dot${i === slideIndex ? " active" : ""}`}
                  onClick={() => setSlideIndex(i)}
                  aria-label={`Photo ${i + 1}`}
                  aria-selected={i === slideIndex}
                  role="tab"
                />
              ))}
            </div>
          </m.div>

          <div className="container" style={{ paddingBottom: "clamp(40px, 6vw, 80px)" }}>
            <m.div style={{ textAlign: "center", marginTop: "32px" }} {...FADE_IN}>
              <Link
                href="/gallery/mccartney-spec-1644"
                className="btn btn-primary"
                data-testid="fp1644-gallery-link"
              >
                View Full Gallery <ArrowRight size={16} />
              </Link>
            </m.div>
          </div>
        </section>

        <CTA bgImage="/images/fp1849-cta.jpg" />
      </main>
      {lightbox !== null && (
        <div
          className="fp1849-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={DRAWINGS[lightbox].label}
          data-testid="fp1644-lightbox"
          onClick={closeLightbox}
        >
          <button
            className="fp1849-lightbox-close"
            onClick={closeLightbox}
            aria-label="Close"
            data-testid="fp1644-lightbox-close"
          >
            <X size={22} />
          </button>
          <img
            src={DRAWINGS[lightbox].src}
            alt={DRAWINGS[lightbox].alt}
            className="fp1849-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </MotionConfig>
  );
}
