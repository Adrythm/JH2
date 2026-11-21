"use client";
import { ResponsiveImage } from "./components/ResponsiveImage";
import { ArrowRight } from "lucide-react";
import { useContactForm } from "./contact-form";

/**
 * Backdrops passed as bgImage that have a WebP ladder in public/images
 * (scripts/gen-image-variants.mjs). The original JPEG is 3600x2400 and 7.4MB;
 * served raw it was the heaviest file on every floor plan page. Through the
 * ladder a phone takes the 768w rung (about 25KB). The original stays the
 * <img> fallback.
 */
const BG_LADDERS: Record<string, { name: string; widths: number[]; width: number; height: number }> = {
  "/images/fp1849-cta.jpg": { name: "fp1849-cta", widths: [768, 1280, 1920, 2500], width: 3600, height: 2400 },
};

export function CTA({ bgImage }: { bgImage?: string } = {}) {
  const { open: openContactForm } = useContactForm();
  const ladder = bgImage ? BG_LADDERS[bgImage] : undefined;

  return (
    <section className="cta" id="contact">
      {ladder
        ? <ResponsiveImage
            name={ladder.name}
            className="cta-bg"
            alt=""
            widths={ladder.widths}
            sizes="100vw"
            width={ladder.width}
            height={ladder.height}
          />
        : bgImage
        ? <img src={bgImage} className="cta-bg" alt="" aria-hidden="true" loading="lazy" />
        : <ResponsiveImage
            name="cta-bg"
            className="cta-bg"
            alt="Desert landscape"
            widths={[768, 1280, 1920, 2500]}
            sizes="100vw"
            width={2500}
            height={1667}
          />
      }
      <div className="cta-overlay" />

      <div className="container">
        <div
          className="cta-grid"
          style={{ gridTemplateColumns: "1fr", textAlign: "center", maxWidth: 760, marginInline: "auto" }}
        >
          <div className="cta-content">
            <span className="eyebrow" style={{ color: 'var(--color-bone)' }}>Build With Us</span>
            <h2 className="heading-lg" style={{ textTransform: 'uppercase' }}>Begin Your Build</h2>
            <p style={{ marginInline: "auto" }}>
              Relax while we manage every detail, throughout the entire process. Tell us about your vision, and we'll be in touch to schedule a consultation.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              data-testid="cta-button"
              onClick={openContactForm}
              style={{ marginTop: 32 }}
            >
              Start Your Build <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
