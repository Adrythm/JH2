"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { m, MotionConfig } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { CTA } from "../cta";
import { PlanHeroPicture } from "../components/PlanHeroPicture";

/**
 * Generic floor-plan detail page. Content is passed in per plan so the many
 * Jematell-exclusive plans share one implementation (hero, stat bar, clickable
 * floor-plan/elevation drawings with lightbox, and an optional finished-home
 * carousel). The earlier one-file-per-plan components (FloorPlan1849, etc.)
 * predate this and are left as-is.
 */

const FADE_IN = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 } as const,
  transition: { duration: 0.5 },
};

export interface PlanStat {
  value: string;
  label: string;
}
export interface PlanDrawing {
  label: string;
  src: string;
  alt: string;
}
export interface PlanImage {
  src: string;
  alt: string;
  /** WebP candidates for the carousel; the src stays the fallback. */
  srcSet?: string;
}

/**
 * The Crist Residence originals are 4 to 13MB JPEGs, each with a WebP copy
 * of a few hundred KB beside it (src/data/crist.ts). The carousel takes the
 * WebP when an image names no srcSet of its own.
 */
const CRIST_JPG = /^(\/images\/gallery\/crist\/[^/]+)\.jpg$/;
function carouselSrcSet(image: PlanImage): string | undefined {
  if (image.srcSet) return image.srcSet;
  const m = CRIST_JPG.exec(image.src);
  return m ? `${m[1]}.webp` : undefined;
}
export interface PlanGallery {
  heading: string;
  subtext: string;
  images: PlanImage[];
  linkHref: string;
  linkLabel: string;
}

export interface FloorPlanDetailProps {
  planId: string;
  heroSrc: string;
  heroAlt: string;
  title: string;
  stats: PlanStat[];
  planDesc: string;
  drawings: PlanDrawing[];
  gallery?: PlanGallery | null;
}

export default function FloorPlanDetail({
  planId,
  heroSrc,
  heroAlt,
  title,
  stats,
  planDesc,
  drawings,
  gallery = null,
}: FloorPlanDetailProps) {
  const [lightbox, setLightbox]     = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const galleryImages = gallery?.images ?? [];
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
      <main className="page" data-testid={`page-floor-plan-${planId}`}>
        <section className="gallery-detail-hero">
          <PlanHeroPicture src={heroSrc} alt={heroAlt} />
          <div className="page-hero-overlay" style={{ background: "linear-gradient(to top, rgba(22,22,22,0.72) 0%, rgba(22,22,22,0.2) 60%, transparent 100%)" }} />
          <div className="container page-hero-content gallery-detail-hero-content">
            <h1 className="page-hero-title hero-title">{title}</h1>
          </div>
        </section>

        <div className="fp1849-breadcrumb">
          <div className="container">
            <Link href="/floor-plans" className="fp1849-back" data-testid={`fp${planId}-back`}>
              <ArrowLeft size={14} /> Floor Plans
            </Link>
          </div>
        </div>

        <div className="fp1849-stats">
          <div className="container">
            <div className="fp1849-stats-inner">
              {stats.map((s, i) => (
                <div key={s.label} style={{ display: "contents" }}>
                  {i > 0 && <div className="fp1849-stat-divider" />}
                  <div className="fp1849-stat">
                    <span className="fp1849-stat-value">{s.value}</span>
                    <span className="fp1849-stat-label">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="section-pad fp1849-plan-section" style={{ paddingTop: "clamp(24px, 3vw, 40px)" }}>
          <div className="container">
            <m.div className="page-section-head centered" {...FADE_IN}>
              <h2 className="heading-lg" style={{ textTransform: "uppercase" }}>{drawings.length > 1 ? "Floor Plan & Elevations" : "Floor Plan"}</h2>
            </m.div>
            <m.p className="fp1849-plan-desc" {...FADE_IN}>{planDesc}</m.p>
            <div className="fp1849-drawings-grid">
              {drawings.map((d, i) => (
                <m.figure
                  key={d.label}
                  className="fp1849-drawing-figure fp1849-drawing-clickable"
                  {...FADE_IN}
                  onClick={() => setLightbox(i)}
                  data-testid={`fp${planId}-drawing-${i}`}
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

        {hasGallery && gallery && (
          <section className="fp1849-gallery-section alt-bg">
            <div className="container" style={{ paddingTop: "clamp(40px, 6vw, 80px)" }}>
              <m.div className="page-section-head centered" {...FADE_IN}>
                <h2 className="heading-lg" style={{ textTransform: "uppercase" }}>{gallery.heading}</h2>
                <p className="fp1849-gallery-body">{gallery.subtext}</p>
              </m.div>
            </div>

            <m.div className="fp1849-carousel" {...FADE_IN}>
              <button
                className="fp1849-carousel-btn fp1849-carousel-prev"
                onClick={prev}
                aria-label="Previous photo"
                data-testid={`fp${planId}-carousel-prev`}
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
                      srcSet={carouselSrcSet(img)}
                      sizes="(max-width: 600px) 100vw, 33vw"
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
                data-testid={`fp${planId}-carousel-next`}
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
                  href={gallery.linkHref}
                  className="btn btn-primary"
                  data-testid={`fp${planId}-gallery-link`}
                >
                  {gallery.linkLabel} <ArrowRight size={16} />
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
          aria-label={drawings[lightbox].label}
          data-testid={`fp${planId}-lightbox`}
          onClick={closeLightbox}
        >
          <button
            className="fp1849-lightbox-close"
            onClick={closeLightbox}
            aria-label="Close"
            data-testid={`fp${planId}-lightbox-close`}
          >
            <X size={22} />
          </button>
          <img
            src={drawings[lightbox].src}
            alt={drawings[lightbox].alt}
            className="fp1849-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </MotionConfig>
  );
}
