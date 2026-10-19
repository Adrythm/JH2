"use client";
import { m } from "framer-motion";
import Link from "next/link";
import { EASE_OUT_EXPO, FADE_IN_UP_PROPS } from "../motion";
import { GALLERY_PROJECTS } from "../data/galleryProjects";
import { ResponsiveImage } from "./ResponsiveImage";

/**
 * FeaturedProjects: moved verbatim out of src/sections.tsx. It is the one home
 * section that ContentPage (/custom-homes) also renders; keeping it in its own
 * module means content routes do not pull the rest of the home sections
 * (Hero/About/Process/Reviews) into their route JS. sections.tsx re-exports it
 * so the home page import is unchanged.
 */

// Hardcoded (not sourced from the full clone-data/pages.json — that dataset
// is large and only meant to be pulled into route-level lazy chunks, never
// the eagerly-loaded homepage bundle).
/**
 * These three cards used to render a bare <img> pointed at the full-size
 * original: the Skinner photo alone is 6188x4125 / 4.1MB, delivered into a card
 * that is never wider than ~421px. Every visitor who scrolled the home page (or
 * opened /custom-homes) paid ~5MB for three thumbnails.
 *
 * They now go through ResponsiveImage, which serves the WebP ladder generated
 * by scripts/gen-image-variants.mjs and keeps the untouched original .jpg as
 * the <picture> fallback. This is resolution matching, not recompression of
 * anything that ships today — the originals on disk are byte-for-byte
 * unchanged, and the largest rung is still there for any viewport that wants
 * it. `widths` must match the -<w>.webp siblings that actually exist on disk.
 */
const FEATURED_PROJECT_IMAGES: Record<
  string,
  { name: string; widths: number[]; width: number; height: number }
> = {
  "skinner-custom": {
    name: "gallery/crist/10-DSC05808",
    widths: [768, 1280, 1920, 2500],
    width: 6188,
    height: 4125,
  },
  "modern-farmhouse": {
    name: "gallery/modern-farmhouse/kitchen-hero",
    widths: [768, 1280, 1920],
    width: 2000,
    height: 1333,
  },
  "rio-verde-farmhouse": {
    name: "gallery/rio-verde-farmhouse/kitchen-hero",
    widths: [768, 1280, 1920],
    width: 2000,
    height: 1333,
  },
};

// Grid is 3-up above 900px (container caps at 1440px, so ~421px per card),
// 2-up to 900px, 1-up to 600px.
const FEATURED_PROJECT_SIZES =
  "(min-width: 1440px) 421px, (min-width: 901px) 30vw, (min-width: 601px) 45vw, 90vw";

const FEATURED_PROJECT_SLUGS = ["skinner-custom", "modern-farmhouse", "rio-verde-farmhouse"];

export function FeaturedProjects() {
  const projects = FEATURED_PROJECT_SLUGS.map((slug) => {
    const proj = GALLERY_PROJECTS.find((p) => p.slug === slug);
    if (!proj) return null;
    return { ...proj, image: FEATURED_PROJECT_IMAGES[slug] ?? null };
  }).filter((p): p is NonNullable<typeof p> => p !== null);

  return (
    <section className="featured-projects section-pad">
      <div className="container">
        <m.div {...FADE_IN_UP_PROPS}>
          <h2 className="heading-md featured-projects-heading" style={{ fontSize: '55px', textTransform: 'uppercase' }}>CUSTOM Homes We've Built</h2>
        </m.div>
        <div className="gallery-grid featured-projects-grid">
          {projects.map((proj, i) => (
            <m.div
              key={proj.slug}
              className="gallery-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: EASE_OUT_EXPO }}
            >
              <Link href={`/gallery/${proj.slug}`} data-testid={`featured-project-${proj.slug}`}>
                <div className={`gallery-card-media${proj.image ? "" : " gallery-card-placeholder"}`}>
                  {proj.image && (
                    <ResponsiveImage
                      name={proj.image.name}
                      alt={proj.title}
                      widths={proj.image.widths}
                      sizes={FEATURED_PROJECT_SIZES}
                      width={proj.image.width}
                      height={proj.image.height}
                    />
                  )}
                  <div className="gallery-card-overlay">
                    <h3 className="gallery-card-title">{proj.title}</h3>
                  </div>
                </div>
                <div className="gallery-card-meta">
                  <div className="gallery-card-text">
                    <span className="gallery-card-sub">{proj.meta}</span>
                  </div>
                  <span className="gallery-card-arrow">→</span>
                </div>
              </Link>
            </m.div>
          ))}
        </div>
        <m.div className="featured-projects-cta" {...FADE_IN_UP_PROPS}>
          <Link href="/gallery" className="btn btn-primary" data-testid="link-view-full-gallery">
            View Full Gallery
          </Link>
        </m.div>
      </div>
    </section>
  );
}
