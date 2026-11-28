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
  { label: "Floor Plan", src: "/images/plans/2997-1.png", alt: "2997 floor plan layout: 5 bedrooms, 3.5 baths, 2.5-car garage, two-story with bonus room" },
  { label: "Elevations", src: "/images/plans/2997-2.png", alt: "2997 plan — front, rear, left, and right exterior elevations" },
];

export interface FloorPlanGalleryImage {
  src: string;
  alt: string;
}

export default function FloorPlan2997({
  galleryImages = [],
}: {
  galleryImages?: FloorPlanGalleryImage[];
}) {
  const [lightbox, setLightbox]     = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const hasGallery = galleryImages.length > 0;

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const prev = useCallback(() =>
    setSlideIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length), [galleryImages.length]);
  const next = useCallback(() =>
    setSlideIndex((i) => (i + 1) % galleryImages.length), [galleryImages.length]);

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
      <main className="page" data-testid="page-floor-plan-2997">
        <section className="gallery-detail-hero">
          <PlanHeroPicture
            src="/images/plans/2997-rendering.png"
            alt="Rendered exterior elevation of the 2997 sq ft Jematell Homes floor plan"
          />
          <div className="page-hero-overlay" style={{ background: "linear-gradient(to top, rgba(22,22,22,0.72) 0%, rgba(22,22,22,0.2) 60%, transparent 100%)" }} />
          <div className="container page-hero-content gallery-detail-hero-content">
            <h1 className="page-hero-title hero-title">2997 Floor Plan</h1>
          </div>
        </section>

        <div className="fp1849-breadcrumb">
          <div className="container">
            <Link href="/floor-plans" className="fp1849-back" data-testid="fp2997-back">
              <ArrowLeft size={14} /> Floor Plans
            </Link>
          </div>
        </div>

        <div className="fp1849-stats">
          <div className="container">
            <div className="fp1849-stats-inner">
              <div className="fp1849-stat">
                <span className="fp1849-stat-value">2,997</span>
                <span className="fp1849-stat-label">Sq Ft</span>
              </div>
              <div className="fp1849-stat-divider" />
              <div className="fp1849-stat">
                <span className="fp1849-stat-value">5</span>
                <span className="fp1849-stat-label">Bedrooms</span>
              </div>
              <div className="fp1849-stat-divider" />
              <div className="fp1849-stat">
                <span className="fp1849-stat-value">3.5</span>
                <span className="fp1849-stat-label">Bathrooms</span>
              </div>
              <div className="fp1849-stat-divider" />
              <div className="fp1849-stat">
                <span className="fp1849-stat-value">1</span>
                <span className="fp1849-stat-label">Bonus Room</span>
              </div>
              <div className="fp1849-stat-divider" />
              <div className="fp1849-stat">
                <span className="fp1849-stat-value">2.5-Car</span>
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
            <m.p className="fp1849-plan-desc" {...FADE_IN}>Our modern farmhouse pairs single-level living with a private upstairs retreat. The main floor opens to a vaulted great room, island kitchen, and dining space that flow to a covered patio, with the owner's suite and its spa bath set apart on their own wing. Three more bedrooms and two baths give the main level room to grow, while an upstairs bonus room with a full bath makes a flexible fifth bedroom, media room, or guest suite. A covered front porch and board-and-batten exterior complete the farmhouse look.</m.p>
            <div className="fp1849-drawings-grid">
              {DRAWINGS.map((d, i) => (
                <m.figure
                  key={d.label}
                  className="fp1849-drawing-figure fp1849-drawing-clickable"
                  {...FADE_IN}
                  onClick={() => setLightbox(i)}
                  data-testid={`fp2997-drawing-${i}`}
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

        {hasGallery && (
          <section className="fp1849-gallery-section alt-bg">
            <div className="container" style={{ paddingTop: "clamp(40px, 6vw, 80px)" }}>
              <m.div className="page-section-head centered" {...FADE_IN}>
                <h2 className="heading-lg" style={{ textTransform: "uppercase" }}>See the Finished Home</h2>
                <p className="fp1849-gallery-body">The 2997 floor plan, built as our Modern Farmhouse in Rio Verde, AZ.</p>
              </m.div>
            </div>

            <m.div className="fp1849-carousel" {...FADE_IN}>
              <button
                className="fp1849-carousel-btn fp1849-carousel-prev"
                onClick={prev}
                aria-label="Previous photo"
                data-testid="fp2997-carousel-prev"
              >
                <ChevronLeft size={22} />
              </button>

              <div className="fp1849-carousel-track">
                {[0, 1, 2].map((offset) => {
                  const img = galleryImages[(slideIndex + offset) % galleryImages.length];
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
                data-testid="fp2997-carousel-next"
              >
                <ChevronRight size={22} />
              </button>

              <div className="fp1849-carousel-dots" role="tablist">
                {galleryImages.map((_, i) => (
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
                  href="/gallery/modern-farmhouse"
                  className="btn btn-primary"
                  data-testid="fp2997-gallery-link"
                >
                  View Full Gallery <ArrowRight size={16} />
                </Link>
              </m.div>
            </div>
          </section>
        )}

        <CTA bgImage="/images/fp1849-cta.jpg" />
      </main>
      {lightbox !== null && (
        <div
          className="fp1849-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={DRAWINGS[lightbox].label}
          data-testid="fp2997-lightbox"
          onClick={closeLightbox}
        >
          <button
            className="fp1849-lightbox-close"
            onClick={closeLightbox}
            aria-label="Close"
            data-testid="fp2997-lightbox-close"
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
