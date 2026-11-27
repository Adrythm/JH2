"use client";
import { useState } from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { locations, locationHref } from "../config/siteConfig";
import { FADE_IN_UP_PROPS } from "../motion";
import { cityHeroWidths } from "../data/cityHeroWidths";
import cdnImageLadders from "../data/cdnImageLadders.json";

/**
 * Premium, expanding image-accordion that leads the /where-we-build page.
 *
 * Each city is a tall panel that grows when it becomes active (hover, focus, or
 * keyboard tab) — revealing its imagery and an explicit "Explore" affordance —
 * while the others recede to slim spines with vertical labels. The whole panel
 * is a single <Link>, so it is fully keyboard reachable and focusing it expands
 * it. On narrow viewports the accordion relaxes into a stacked grid of cards.
 *
 * The flex-grow animation rides the site's shared easing (defined in the CSS,
 * matching EASE_OUT_EXPO) and is fully disabled under prefers-reduced-m.
 */

const FALLBACK_IMAGE =
  "/images/cdn/cb106191-10f5-42ca-bd2a-4b2f12503dae__53-DJI_20260125135120_0044_D.webp";

const LOCAL_CITY_HERO: Record<string, string> = {
  "scottsdale":      "/images/city-hero-scottsdale.jpg",
  "rio-verde":       "/images/city-hero-rio-verde.jpg",
  "phoenix":         "/images/city-hero-phoenix.jpg",
  "cave-creek":      "/images/city-hero-cave-creek.jpg",
  "fountain-hills":  "/images/city-hero-fountain-hills.jpg",
  "carefree":        "/images/city-hero-carefree.jpg",
  "casa-grande":     "/images/city-hero-casa-grande.jpg",
  "apache-junction": "/images/city-hero-apache-junction.jpg",
  "surprise":        "/images/city-hero-surprise.jpg",
};

function cityImage(slug: string, images?: Record<string, string>): string {
  return LOCAL_CITY_HERO[slug] || images?.[slug] || FALLBACK_IMAGE;
}

/* The card photos are the town heroes (226KB to 3.2MB JPGs) or, for the
 * other towns, their cdn/ share photo (161 to 636KB). Both have WebP rungs on
 * disk (the town heroes' and src/data/cdnImageLadders.json), so a phone takes
 * the 768w copy. On desktop each image is a fixed 520px wide and up to 600px
 * tall with object-fit: cover, so a landscape photo renders about 1000px wide.
 * This component is code-split to /where-we-build, so the ladder list adds
 * nothing to other routes. */
const CARD_SIZES = "(min-width: 769px) 1000px, 100vw";
const CDN_LADDERS = cdnImageLadders as Record<string, { widths: number[]; width: number }>;
function cityImageSrcSet(slug: string, src: string): { srcSet: string; sizes: string } | Record<string, never> {
  const heroWidths = LOCAL_CITY_HERO[slug] ? cityHeroWidths[slug] : undefined;
  if (heroWidths) {
    const base = `/images/city-hero-${slug}`;
    return { srcSet: heroWidths.map((w) => `${base}-${w}.webp ${w}w`).join(", "), sizes: CARD_SIZES };
  }
  const ladder = CDN_LADDERS[src];
  if (!ladder) return {};
  const base = src.replace(/\.webp$/, "");
  return {
    srcSet: ladder.widths.map((w) => `${base}-${w}.webp ${w}w`).join(", ") + `, ${src} ${ladder.width}w`,
    sizes: CARD_SIZES,
  };
}

export function CityNavigator({ images }: { images?: Record<string, string> } = {}) {
  const [active, setActive] = useState(0);

  return (
    <section className="city-nav section-pad" aria-labelledby="city-nav-heading">
      <div className="container">
        <m.div className="city-nav-head" {...FADE_IN_UP_PROPS} style={{ textAlign: "center" }}>
          <span className="eyebrow">Explore by Region</span>
          <h2 className="heading-lg" id="city-nav-heading" style={{ textTransform: "uppercase", whiteSpace: "nowrap" }}>
            Find your place in the desert
          </h2>
          <p className="city-nav-intro">
            From the foothills of Scottsdale to the open skies of Casa Grande, we build across
            Arizona&rsquo;s most sought-after communities. Choose a region to see where your home
            could take shape.
          </p>
        </m.div>

        <ul
          className="city-nav-track"
          role="list"
          onMouseLeave={() => setActive(0)}
          data-testid="city-nav-track"
        >
          {locations.map((loc, i) => {
            const isActive = i === active;
            return (
              <li
                key={loc.slug}
                className="city-nav-item"
                data-active={isActive}
                style={{ flexGrow: isActive ? 5 : 1 }}
              >
                {/* No aria-label: it replaced the accessible name with text that
                    doesn't contain the card's visible tagline (WCAG 2.5.3
                    label-in-name). The link's real content — city name +
                    tagline — is the better accessible name anyway. */}
                <Link
                  href={locationHref(loc.slug)}
                  className="city-nav-link"
                  data-testid={`city-nav-${loc.slug}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                >
                  <img
                    className="city-nav-img"
                    src={cityImage(loc.slug, images)}
                    {...cityImageSrcSet(loc.slug, cityImage(loc.slug, images))}
                    alt=""
                    loading="eager"
                  />
                  <span className="city-nav-overlay" aria-hidden="true" />
                  <span className="city-nav-index" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="city-nav-body">
                    <span className="city-nav-name">{loc.name}</span>
                    <span className="city-nav-tagline">{loc.tagline}</span>
                    <span className="city-nav-cta">
                      Explore <ArrowUpRight size={16} />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <m.div className="city-nav-lot-ctas" {...FADE_IN_UP_PROPS}>
          <Link href="/build-on-your-lot" className="city-nav-lot-card" data-testid="city-nav-build-on-your-lot">
            <span className="city-nav-lot-eyebrow">Already own land?</span>
            <span className="city-nav-lot-title-row">
              <span className="city-nav-lot-title">Build on Your Lot</span>
              <ArrowRight size={20} className="city-nav-lot-arrow" />
            </span>
            <p className="city-nav-lot-sub">We build on your homesite. Full design-to-keys management on land you own.</p>
          </Link>
          <Link href="/buy-a-lot-with-us" className="city-nav-lot-card" data-testid="city-nav-buy-a-lot-with-us">
            <span className="city-nav-lot-eyebrow">Need land first?</span>
            <span className="city-nav-lot-title-row">
              <span className="city-nav-lot-title">Buy a Lot With Us</span>
              <ArrowRight size={20} className="city-nav-lot-arrow" />
            </span>
            <p className="city-nav-lot-sub">We help you find and secure the right homesite in your target community.</p>
          </Link>
        </m.div>
      </div>
    </section>
  );
}

export default CityNavigator;
