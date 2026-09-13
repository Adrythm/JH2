"use client";
import { useMemo, lazy, Suspense, Fragment, type ReactNode, type ComponentType } from "react";
import { preload } from "react-dom";
import Link from "next/link";
import { m, MotionConfig } from "framer-motion";
import { Interlink, type InterlinkSection } from "@/components/Interlink";
import {
  ArrowRight,
  MapPin,
  Layers,
  DollarSign,
  CheckCircle2,
  Compass,
  Calendar,
  ClipboardList,
  FileCheck,
  Home,
  Check,
} from "lucide-react";
import type { PageData, Block } from "../data/pages";
import { FeaturedProjects } from "../components/FeaturedProjects";
import { cleanTitle } from "../lib/cleanTitle";
import dynamic from "next/dynamic";

// CityNavigator renders only on the /where-we-build hub, so it is code-split:
// every other ContentPage route (about, custom-homes, warranty, ...) stays
// free of its JS. ssr stays on (the default), so the prerendered HTML for
// /where-we-build is unchanged.
const CityNavigator = dynamic(() =>
  import("../components/CityNavigator").then((mod) => mod.CityNavigator),
);

// Floor-plan-only sections (rendered exclusively on /floor-plans) are
// code-split the same way; see src/views/ContentPageFloorPlans.tsx.
const FloorPlanWidgets = dynamic(() =>
  import("./ContentPageFloorPlans").then((mod) => mod.FloorPlanWidgets),
);
const FloorPlanTiersSection = dynamic(() =>
  import("./ContentPageFloorPlans").then((mod) => mod.FloorPlanTiersSection),
);

// The city "local guide" cards render only on region pages, so their per-city
// link table is code-split away from every other ContentPage route. ssr stays
// on (the default), so the prerendered HTML still contains the section.
const LocalGuide = dynamic(() =>
  import("./ContentPageLocalGuide").then((mod) => mod.LocalGuide),
);

// "Why build with us" transparency section. Shared with the home page, so it
// lives in components/; still code-split here for the ContentPage routes that
// do not render it.
const WhyBuild = dynamic(() =>
  import("../components/WhyBuild").then((mod) => mod.WhyBuild),
);
import { ResponsiveImage } from "../components/ResponsiveImage";
import { useContactForm } from "../contact-form";
import { EASE_OUT_EXPO } from "../motion";

// SEO head + page JSON-LD moved to the server side: the app/ route wrappers
// build metadata and <JsonLd> via src/lib/contentPageMeta.ts (the exact
// derivation this file used to feed <Seo>). This component only renders.

function norm(s: string | undefined | null) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const SERVICE_ICONS: Record<string, ComponentType<{ size?: number }>> = {
  "site selection": MapPin,
  "material selection": Layers,
  funding: DollarSign,
  "final inspections": CheckCircle2,
  design: Compass,
  "weekly updates": Calendar,
  "pre-construction": ClipboardList,
  permitting: FileCheck,
};

function iconFor(label: string) {
  return SERVICE_ICONS[label.toLowerCase().trim()] || Home;
}

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

function splitIntoSections(blocks: Block[]): Section[] {
  const sections: Section[] = [];
  let current: Section = { heading: null, blocks: [] };
  for (const b of blocks) {
    if (b.type === "h1" || b.type === "h2") {
      if (current.heading || current.blocks.length) sections.push(current);
      current = { heading: b, blocks: [] };
    } else {
      current.blocks.push(b);
    }
  }
  if (current.heading || current.blocks.length) sections.push(current);
  return sections;
}

function dedupeListsAndParagraphs(blocks: Block[]): Block[] {
  // After our extractor fix duplicates should be gone, but belt+suspenders for legacy data.
  const out: Block[] = [];
  const seen = new Set<string>();
  for (const b of blocks) {
    const key = `${b.text || b.src || ""}`;
    if (b.type === "li" || b.type === "p") {
      if (seen.has(key)) continue;
      seen.add(key);
    }
    out.push(b);
  }
  return out;
}

function isServiceGridSection(s: Section): boolean {
  const h = s.heading?.text?.toLowerCase() || "";
  if (!h.includes("full-service") && !h.includes("project management")) return false;
  const h4s = s.blocks.filter((b) => b.type === "h4").length;
  return h4s >= 4;
}

function isProcessSection(s: Section): boolean {
  const h = s.heading?.text?.toLowerCase() || "";
  if (!(h.includes("process") || h.includes("how it works"))) return false;
  const numbered = s.blocks.filter(
    (b) =>
      (b.type === "h3" || b.type === "h4") &&
      b.text &&
      /^(step\s*\d|[1-9]\.)/i.test(b.text.trim()),
  );
  const allH3 = s.blocks.filter((b) => b.type === "h3");
  return numbered.length >= 2 || allH3.length >= 3;
}

function isFloorPlanTiersSection(s: Section, nextSections: Section[]): boolean {
  // "Explore Floor Plans" h1 followed by tier triples
  const h = s.heading?.text?.toLowerCase() || "";
  if (!h.includes("floor plan") && !h.includes("explore floor")) return false;
  const h4s = s.blocks.filter((b) => b.type === "h4").length;
  return h4s >= 2;
  void nextSections;
}

function isWhyChooseSection(s: Section): boolean {
  const h = s.heading?.text?.toLowerCase() || "";
  if (!h.includes("why")) return false;
  const h3s = s.blocks.filter((b) => b.type === "h3" && b.text).length;
  return h3s >= 2;
}

function isLocationEditorialSection(s: Section): boolean {
  // Multiple h3s like "Building In X", "Construction In X", "Activities In X"
  // — each card must have meaningful paragraph payload, else this is a bare tier list.
  const h3s = s.blocks.filter((b) => b.type === "h3").length;
  const ps = s.blocks.filter((b) => b.type === "p" && (b.text || "").length > 40).length;
  return !s.heading && h3s >= 3 && ps >= h3s;
}

function isTierListSection(s: Section): boolean {
  // Heading-less group of h3s with little/no body content (e.g. floor-plan tiers from sparse pages)
  const h3s = s.blocks.filter((b) => b.type === "h3").length;
  const ps = s.blocks.filter((b) => b.type === "p").length;
  return !s.heading && h3s >= 2 && ps < h3s;
}

const REGION_PROCESS_SECTION: Section = {
  heading: { type: "h2", text: "Our Process" },
  blocks: [
    { type: "h3", text: "INTRODUCTION" },
    { type: "p", text: "Contact us via our contact form and we will reach out to you to learn more about your project's budget, timeline, and vision." },
    { type: "h3", text: "DESIGN" },
    { type: "p", text: "We will collaborate with our architect who will turn your ideas into plans, carefully refining every detail to bring your vision to life." },
    { type: "h3", text: "BUILD" },
    { type: "p", text: "Construction begins! We will work to build your house on time and within budget. We provide weekly updates and perform project milestone walkthroughs with you." },
    { type: "h3", text: "COMPLETION" },
    { type: "p", text: "Your house is finished! We will do a thorough final walkthrough to address any final adjustments. You'll then receive the keys to your dream home." },
  ],
};

const CTA_KEYWORDS = /\b(begin|start|ready|let['\u2019]?s|contact us|schedule|get in touch|book|inquire|reach out)\b/i;
function isLikelyCTA(text: string | undefined): boolean {
  if (!text) return false;
  if (text.length > 80) return false;
  return CTA_KEYWORDS.test(text);
}

const CITY_HERO_WIDTHS: Record<string, number[]> = {
  "scottsdale":      [768, 1280, 1500],
  "rio-verde":       [768, 1280, 1500],
  "phoenix":         [768, 1280, 1920, 2500],
  "cave-creek":      [768, 1280, 1500],
  "fountain-hills":  [768, 1280, 1920, 2500],
  "carefree":        [768, 1280, 1500],
  "casa-grande":     [768, 1280, 1920, 2500],
  "apache-junction": [768, 1280, 1500],
  "surprise":        [768, 1280, 1920, 2500],
};

function CityHeroPicture({ slug }: { slug: string }) {
  const widths = CITY_HERO_WIDTHS[slug];
  if (!widths) return null;
  const base = `/images/city-hero-${slug}`;
  const largest = widths[widths.length - 1];
  const avifSrcset = widths.map((w) => `${base}-${w}.avif ${w}w`).join(", ");
  const webpSrcset = widths.map((w) => `${base}-${w}.webp ${w}w`).join(", ");
  // Preload must mirror the AVIF rung (first supported <source>) or
  // AVIF-capable browsers double-download — see ResponsiveImage.
  preload(`${base}.jpg`, {
    as: "image",
    fetchPriority: "high",
    imageSrcSet: avifSrcset,
    imageSizes: "100vw",
    type: "image/avif",
  });
  return (
    <picture>
      <source type="image/avif" srcSet={avifSrcset} sizes="100vw" />
      <source type="image/webp" srcSet={webpSrcset} sizes="100vw" />
      <img
        src={`${base}.jpg`}
        alt=""
        className="page-hero-bg"
        loading="eager"
        fetchPriority="high"
        width={largest}
      />
    </picture>
  );
}

/* Local heroes with generated variant ladders render through ResponsiveImage
 * (picture + preload). Widths list exactly the files on disk — the generator
 * never upscales, so smaller sources only have the 768/1280 rungs. */
const LOCAL_HERO_PICTURES: Record<
  string,
  { name: string; widths: number[]; width: number; height: number }
> = {
  "where-we-build": { name: "where-we-build-hero", widths: [768, 1280, 1920, 2500], width: 2533, height: 1219 },
  "build-on-your-lot": { name: "build-on-your-lot-hero", widths: [768, 1280], width: 1672, height: 941 },
  "buy-a-lot-with-us": { name: "buy-a-lot-with-us-hero", widths: [768, 1280], width: 1537, height: 1023 },
  "aboutus": { name: "about-hero", widths: [768, 1280], width: 1448, height: 1086 },
};

/* Heroes that still ship a single file (no variant ladder on disk). */
const LOCAL_HERO_IMAGES: Record<string, string> = {
  "spechomes": "/images/spec-homes-hero-2.jpg",
};

/* Squarespace-era cdn/ heroes (pages.json `ogImage`) that now have generated
 * ladders. These arrive as one 377-888KB webp with no smaller rung, so a phone
 * downloaded the full desktop file — Lighthouse's image-delivery insight scored
 * it as the page's single largest waste. Keyed by the exact ogImage path so an
 * unlisted image simply falls through to the old single-file path.
 *
 * Ladders were generated with `--from-lossy` (higher quality, no 2500 rung —
 * the untouched original IS the top rung and stays the <img> fallback). To add
 * one: run the generator, then add the entry here. */
const CDN_HERO_LADDERS: Record<string, { widths: number[]; width: number; height: number }> = {
  "/images/cdn/1770054676656__06-Kitchen.webp": { widths: [768, 1280, 1920], width: 2500, height: 1667 },
  "/images/cdn/9dd598a4-90af-45ab-b64c-e6173da0836e__11-Kitchen.webp": { widths: [768, 1280, 1920], width: 2500, height: 1667 },
  "/images/cdn/349e0c45-d74f-4339-8962-191661b5c87b__natur-wunderland-uH3wpt7gKnQ-unsplash.webp": { widths: [768, 1280, 1920], width: 2500, height: 1875 },
  "/images/cdn/d3a7f535-7f88-4e72-a8bb-004f7aaab0a9__009_Master-Bathroom-1.webp": { widths: [768, 1280, 1920], width: 2500, height: 1667 },
};

/** <picture> + matching preload for a cdn hero that has a generated ladder. */
function CdnHeroPicture({ src }: { src: string }) {
  const ladder = CDN_HERO_LADDERS[src];
  if (!ladder) return null;
  const base = src.replace(/\.webp$/, "");
  // The original (full-size, untouched) is the last rung so wide viewports and
  // any srcset miss still land on the pristine file.
  const srcSet =
    ladder.widths.map((w) => `${base}-${w}.webp ${w}w`).join(", ") +
    `, ${src} ${ladder.width}w`;
  preload(src, {
    as: "image",
    fetchPriority: "high",
    imageSrcSet: srcSet,
    imageSizes: "100vw",
    type: "image/webp",
  });
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes="100vw"
      alt=""
      className="page-hero-bg"
      loading="eager"
      fetchPriority="high"
      width={ladder.width}
      height={ladder.height}
    />
  );
}

function PageHero({
  data,
  slug,
  citySlug,
  hideDescription,
  galleryStyle,
}: {
  data: PageData;
  slug?: string;
  citySlug?: string;
  hideDescription?: boolean;
  galleryStyle?: boolean;
}) {
  const rawTitle = cleanTitle(data.title);
  const title = slug === "floorplans"
    ? "Floor Plans"
    : slug === "custom-homes"
    ? "Custom Homes"
    : citySlug
    ? rawTitle.replace(/^Custom Home Builder in /i, "").replace(/, AZ.*$/i, "")
    : rawTitle;
  const hasCityHero = citySlug != null && citySlug in CITY_HERO_WIDTHS;
  const localPicture = slug ? LOCAL_HERO_PICTURES[slug] : undefined;
  const localHero = slug ? LOCAL_HERO_IMAGES[slug] : undefined;
  const heroSrc = localHero || data.ogImage;
  const cdnLadder = heroSrc ? CDN_HERO_LADDERS[heroSrc] : undefined;
  // Single-file heroes still deserve an early preload — without one the
  // browser discovers the LCP image only after CSS, ~1s late on mobile.
  // (Laddered heroes emit their own srcset-matched preload in their component.)
  if (!hasCityHero && !localPicture && !cdnLadder && heroSrc) {
    preload(heroSrc, { as: "image", fetchPriority: "high" });
  }
  return (
    <section
      className="page-hero"
      data-testid="page-hero"
      style={galleryStyle ? { alignItems: "center", minHeight: "65vh" } : undefined}
    >
      {hasCityHero ? (
        <CityHeroPicture slug={citySlug!} />
      ) : localPicture ? (
        <ResponsiveImage
          name={localPicture.name}
          alt=""
          className="page-hero-bg"
          widths={localPicture.widths}
          sizes="100vw"
          width={localPicture.width}
          height={localPicture.height}
          priority
        />
      ) : cdnLadder ? (
        <CdnHeroPicture src={heroSrc!} />
      ) : heroSrc ? (
        <img src={heroSrc} alt="" className="page-hero-bg" loading="eager" fetchPriority="high" />
      ) : null}
      <div
        className="page-hero-overlay"
        style={galleryStyle ? { background: "linear-gradient(180deg, rgba(10,12,14,0.25) 0%, rgba(10,12,14,0.45) 100%)" } : undefined}
      />
      <div
        className="container page-hero-content"
        style={galleryStyle ? { textAlign: "center", maxWidth: "100%" } : undefined}
      >
        {/* initial opacity 0.01, not 0: the SSR style would otherwise make the
            H1 permanently ineligible as an LCP candidate (Chrome ignores
            elements first-painted at opacity 0) — see transitions.css. */}
        {galleryStyle ? (
          <h1 className="page-hero-title hero-title" style={{ textTransform: "uppercase" }}>{title}</h1>
        ) : (
          <m.div
            initial={{ opacity: 0.01, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <span className="eyebrow page-hero-eyebrow">Jematell Homes</span>
            <h1 className="page-hero-title">{title}</h1>
            {data.description && !hideDescription ? (
              <p className="page-hero-sub">{data.description}</p>
            ) : null}
          </m.div>
        )}
      </div>
    </section>
  );
}

function IntroSection({
  subtitle,
  intro,
  image,
  centered,
  horizontal,
  subtitleNowrap,
  subtitleTwoLine,
  editorial,
}: {
  subtitle?: string;
  intro?: string;
  image?: { src: string; alt?: string };
  centered?: boolean;
  horizontal?: boolean;
  subtitleNowrap?: boolean;
  subtitleTwoLine?: boolean;
  editorial?: boolean;
}) {
  if (!subtitle && !intro && !image) return null;

  if (editorial && subtitle && image) {
    return (
      <section className="page-intro page-intro--editorial" style={{ backgroundColor: 'var(--color-bone)' }}>
        <div className="container">
          <m.div className="pie-head" {...FADE_IN}>
            <h2 className="pie-title">{subtitle}</h2>
          </m.div>
          <div className="pie-body">
            <m.figure
              className="pie-figure"
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.65 }}
            >
              <img src={image.src} alt={image.alt || ""} loading="lazy" />
            </m.figure>
            <m.div className="pie-copy" {...FADE_IN}>
              {intro ? <p className="pie-lead">{intro}</p> : null}
            </m.div>
          </div>
        </div>
      </section>
    );
  }

  if (horizontal) {
    return (
      <section className="page-intro page-intro--horizontal" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="container">
          {subtitle ? (
            <m.div className="page-intro-h-heading" {...FADE_IN}>
              <h2 className="heading-lg page-intro-title">{subtitle}</h2>
            </m.div>
          ) : null}
          <div className="page-intro-h-body">
            {intro ? (
              <m.p className="page-intro-p page-intro-h-copy" {...FADE_IN}>{intro}</m.p>
            ) : null}
            {image ? (
              <m.figure
                className="page-intro-h-figure"
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.65 }}
              >
                <img src={image.src} alt={image.alt || ""} loading="lazy" />
              </m.figure>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="page-intro"
      style={centered
        ? { backgroundColor: 'var(--color-bone)', display: "flex", alignItems: "center", justifyContent: "center", minHeight: "30vh", padding: "4rem 0" }
        : { backgroundColor: 'var(--color-bone)' }}
    >
      <div className="container">
        <div className={`page-intro-grid ${image ? "with-image" : "no-image"}${centered ? " centered" : ""}`}>
          <m.div className="page-intro-copy" {...FADE_IN} style={centered ? { textAlign: "center" } : undefined}>
            {subtitle ? (
              <h2 className="heading-lg page-intro-title" style={{ fontSize: subtitleNowrap ? 'clamp(18px, 2.4vw, 36px)' : subtitleTwoLine ? 'clamp(22px, 2.7vw, 38px)' : 'clamp(28px, 3.6vw, 48px)', textTransform: 'uppercase', ...(subtitleNowrap ? { whiteSpace: 'nowrap' } : {}) }}>
                {subtitle.split('\n').map((line, i, arr) => (
                  <span key={i}>{line}{i < arr.length - 1 ? <br /> : null}</span>
                ))}
              </h2>
            ) : null}
            {intro ? <p className="page-intro-p">{intro}</p> : null}
          </m.div>
          {image ? (
            <m.figure
              className="page-intro-figure"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55 }}
            >
              <img src={image.src} alt={image.alt || ""} loading="lazy" />
            </m.figure>
          ) : null}
        </div>
      </div>
    </section>
  );
}

const SERVICE_GRID_ORDER = [
  "funding",
  "site selection",
  "design",
  "material selection",
  "permitting",
  "pre-construction",
  "pre construction",
  "final inspections",
  "weekly updates",
];

function ServiceGridSection({ section }: { section: Section }) {
  const items: Array<{ title: string; body: string }> = [];
  let title: string | null = null;
  for (const b of section.blocks) {
    if (b.type === "h4" && b.text) {
      title = b.text;
    } else if (b.type === "p" && b.text && title) {
      items.push({ title, body: b.text });
      title = null;
    }
  }
  items.sort((a, b) => {
    const ai = SERVICE_GRID_ORDER.indexOf(a.title.toLowerCase());
    const bi = SERVICE_GRID_ORDER.indexOf(b.title.toLowerCase());
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  return (
    <section className="page-services section-pad">
      <div className="container">
        <m.div className="page-section-head" {...FADE_IN}>
          <h2 className="heading-lg" style={{ fontSize: '50px', textTransform: 'uppercase', whiteSpace: 'nowrap', textAlign: 'center' }}>{section.heading?.text}</h2>
        </m.div>
        <div className="page-services-grid">
          {items.map((it, i) => {
            const Icon = iconFor(it.title);
            return (
              <m.div
                key={i}
                className="page-service-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <div className="page-service-icon">
                  <Icon size={22} />
                </div>
                <h3 className="page-service-title">{it.title}</h3>
                <p className="page-service-body">{it.body}</p>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProcessSection({ section }: { section: Section }) {
  const steps: Array<{ title: string; body: string }> = [];
  let title: string | null = null;
  for (const b of section.blocks) {
    if ((b.type === "h3" || b.type === "h4") && b.text) {
      title = b.text;
    } else if (b.type === "p" && b.text && title) {
      steps.push({ title, body: b.text });
      title = null;
    }
  }
  const isFeaturedLayout = steps.length === 4;

  return (
    <section className={isFeaturedLayout ? "process page-process-featured section-pad" : "page-process section-pad"}>
      <div className="container">
        <m.div className="page-section-head centered" {...FADE_IN}>
          <h2 className="heading-lg" style={{ textTransform: "uppercase", fontSize: "50px", whiteSpace: "nowrap" }}>{section.heading?.text}</h2>
        </m.div>
        {isFeaturedLayout ? (
          <div className="process-grid">
            {steps.map((s, i) => {
              const num = String(i + 1).padStart(2, "0");
              const featured = i === steps.length - 1;
              return (
                <m.div
                  key={i}
                  className={`process-card process-card--${num}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: Math.min(i, 5) * 0.06, duration: 0.5, ease: EASE_OUT_EXPO }}
                >
                  {featured && (
                    <ResponsiveImage
                      name="completion-reveal"
                      className="process-bg"
                      alt="Finished primary bathroom in a completed Jematell home"
                      widths={[768, 1280, 1600]}
                      sizes="(min-width: 900px) 33vw, 100vw"
                      width={1600}
                      height={1066}
                    />
                  )}
                  <div className="process-num">{num}</div>
                  <div>
                    <h3>{s.title.replace(/^(step\s*\d+:?\s*|[1-9]\.\s*)/i, "")}</h3>
                    <p>{s.body}</p>
                  </div>
                </m.div>
              );
            })}
          </div>
        ) : (
          <ol className="page-process-list">
            {steps.map((s, i) => (
              <m.li
                key={i}
                className="page-process-step"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className="page-process-num">{String(i + 1).padStart(2, "0")}</div>
                <div className="page-process-body">
                  <h3 className="page-process-title">{s.title.replace(/^(step\s*\d+:?\s*|[1-9]\.\s*)/i, "")}</h3>
                  <p>{s.body}</p>
                </div>
              </m.li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function WhyChooseSection({ section, extraSection }: { section: Section; extraSection?: Section }) {
  type Feature = { title: string; body: string; bullets: string[] };
  const features: Feature[] = [];
  let current: Partial<Feature> | null = null;
  for (const b of section.blocks) {
    if (b.type === "h3" && b.text) {
      if (current?.title) features.push({ ...(current as Feature), bullets: current.bullets || [] });
      current = { title: b.text.replace(/^[1-9]\.\s*/, ""), body: "", bullets: [] };
    } else if (b.type === "p" && b.text && current) {
      if (!current.body) current.body = b.text;
      else current.body += " " + b.text;
    } else if (b.type === "li" && b.text && current) {
      (current.bullets ||= []).push(b.text);
    }
  }
  if (current?.title) features.push({ ...(current as Feature), bullets: current.bullets || [] });

  return (
    <section className="page-why section-pad">
      <div className="container">
        <m.div className="page-section-head" {...FADE_IN}>
          <h2 className="heading-lg" style={{ textTransform: "uppercase", fontSize: "50px" }}>{section.heading?.text}</h2>
        </m.div>
        <div className="page-why-cards">
          {features.map((f, i) => (
            <m.div
              key={i}
              className="page-why-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className="page-why-card-num">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="page-why-card-title">{f.title}</h3>
              {f.body ? <p className="page-why-card-body">{f.body}</p> : null}
              {f.bullets.length ? (
                <ul className="page-why-card-bullets">
                  {f.bullets.map((bl, j) => (
                    <li key={j}><span className="page-why-dot" />{bl}</li>
                  ))}
                </ul>
              ) : null}
            </m.div>
          ))}
        </div>
        {extraSection ? (() => {
          const ddParas: string[] = [];
          const ddBullets: string[] = [];
          for (const b of extraSection.blocks) {
            if (b.type === "p" && b.text) ddParas.push(b.text);
            else if (b.type === "li" && b.text) ddBullets.push(b.text);
          }
          return (
            <m.div className="page-why-dd" {...FADE_IN}>
              {extraSection.heading ? (
                <h2 className="page-why-dd-title">{extraSection.heading.text}</h2>
              ) : null}
              {ddParas[0] ? <p className="page-why-dd-lead">{ddParas[0]}</p> : null}
              {ddParas[1] ? <p className="page-why-dd-intro">{ddParas[1]}</p> : null}
              {ddBullets.length ? (
                <ul className="page-why-dd-bullets">
                  {ddBullets.map((bl, j) => (
                    <li key={j}><span className="page-why-dot" />{bl}</li>
                  ))}
                </ul>
              ) : null}
              {ddParas[2] ? <p className="page-why-dd-close">{ddParas[2]}</p> : null}
            </m.div>
          );
        })() : null}
      </div>
    </section>
  );
}

function TierListSection({ section, eyebrow }: { section: Section; eyebrow?: string }) {
  const tiers = section.blocks.filter((b) => b.type === "h3" && b.text).map((b) => b.text!);
  if (!tiers.length) return null;
  return (
    <section className="page-tiers section-pad alt-bg">
      <div className="container">
        {eyebrow ? (
          <m.div className="page-section-head centered" {...FADE_IN}>
            <span className="eyebrow">{eyebrow}</span>
          </m.div>
        ) : null}
        <div className="page-tiers-grid">
          {tiers.map((t, i) => (
            <m.article
              key={i}
              className="page-tier-card tier-card-bare"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className="page-tier-body">
                <span className="eyebrow">Tier {String.fromCharCode(64 + i + 1)}</span>
                <h3 className="page-tier-title">{t}</h3>
                <Link href="/contact" className="page-tier-link" data-testid={`tier-${i}-cta`}>
                  Discuss this plan <ArrowRight size={14} />
                </Link>
              </div>
            </m.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocationEditorialSection({ section }: { section: Section }) {
  const cards: Array<{ title: string; paras: string[] }> = [];
  let current: { title: string; paras: string[] } | null = null;
  for (const b of section.blocks) {
    if (b.type === "h3" && b.text) {
      if (current) cards.push(current);
      current = { title: b.text, paras: [] };
    } else if (b.type === "p" && b.text && current) {
      current.paras.push(b.text);
    }
  }
  if (current) cards.push(current);

  return (
    <section className="page-editorial section-pad alt-bg">
      <div className="container">
        <div className="page-editorial-grid">
          {cards.map((c, i) => (
            <m.div
              key={i}
              className="page-editorial-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <h3 className="page-editorial-title">{c.title}</h3>
              {c.paras.map((p, j) => (
                <p key={j} className="page-editorial-p">
                  {p}
                </p>
              ))}
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SplitSection({
  section,
  index,
  forceReverse,
}: {
  section: Section;
  index: number;
  forceReverse?: boolean;
}) {
  // Generic alternating section: title + paragraphs (+ first image as media)
  const paras: string[] = [];
  let img: { src: string; alt?: string } | null = null;
  const subheads: Array<{ title: string; body: string[] }> = [];
  let currentSub: { title: string; body: string[] } | null = null;
  const bullets: string[] = [];

  const BLOCKED_IMGS = ["ac32514a-52c9-496a-970e-ccea56485718"];
  const BLOCKED_PARAS = ["Whether you already have an area in mind or are just beginning your search"];
  const REWRITE_PARAS: Record<string, string> = {
    "We help you avoid costly mistakes by identifying potential issues early, including:":
      "We help you avoid costly mistakes by identifying potential issues early.",
  };
  for (const b of section.blocks) {
    if (b.type === "img" && b.src && !img && !BLOCKED_IMGS.some(id => b.src!.includes(id))) {
      img = { src: b.src, alt: b.alt };
    } else if (b.type === "h3" || b.type === "h4") {
      if (currentSub) subheads.push(currentSub);
      currentSub = { title: b.text || "", body: [] };
    } else if (b.type === "p" && b.text && !BLOCKED_PARAS.some(s => b.text!.startsWith(s))) {
      const t = REWRITE_PARAS[b.text] ?? b.text;
      if (currentSub) currentSub.body.push(t);
      else paras.push(t);
    } else if (b.type === "li" && b.text) {
      bullets.push(b.text);
    }
  }
  if (currentSub) subheads.push(currentSub);

  const headingVisible = section.heading && section.heading.text !== "Start Your Search Today";
  if (!headingVisible && !img && paras.length === 0 && bullets.length === 0 && subheads.length === 0) {
    return null;
  }

  const isOdd = forceReverse || index % 2 === 1;

  return (
    <section
      className={`page-split section-pad ${isOdd ? "alt-bg" : ""}`}
      style={forceReverse ? { paddingTop: "clamp(24px, 3vw, 48px)" } : undefined}
    >
      <div className="container">
        <div
          className={`page-split-grid ${img ? "with-media" : "no-media"} ${isOdd ? "reverse" : ""}`}
          style={forceReverse && img ? { gridTemplateColumns: "560px 1fr", gap: "clamp(32px, 5vw, 80px)" } : undefined}
        >
          <m.div className="page-split-copy" {...FADE_IN}>
            {section.heading && section.heading.text !== "Start Your Search Today" ? (
              <h2 className="heading-lg page-split-title">{section.heading.text}</h2>
            ) : null}
            {paras.map((p, i) => (
              <p key={i} className="page-split-p" style={{ fontSize: '20px' }}>
                {p}
              </p>
            ))}
            {bullets.length ? (
              <ul className="page-split-bullets">
                {bullets.map((b, i) => (
                  <li key={i}>
                    <Check size={14} /> {b}
                  </li>
                ))}
              </ul>
            ) : null}
            {subheads.length ? (
              <div className="page-split-subheads">
                {subheads.map((s, i) => (
                  <div key={i} className="page-split-subhead">
                    <h3>{s.title}</h3>
                    {s.body.map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}
          </m.div>
          {img ? (
            <m.figure
              className="page-split-figure"
              style={forceReverse ? { aspectRatio: "4/3" } : undefined}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55 }}
            >
              <img src={img.src} alt={img.alt || ""} loading="lazy" />
            </m.figure>
          ) : null}
        </div>
      </div>
    </section>
  );
}

type ProseNode =
  | { kind: "block"; block: Block; index: number }
  | { kind: "list"; items: Block[]; startIndex: number };

function groupProseBlocks(blocks: Block[]): ProseNode[] {
  const nodes: ProseNode[] = [];
  let i = 0;
  while (i < blocks.length) {
    if (blocks[i].type === "li") {
      const items: Block[] = [];
      const startIndex = i;
      while (i < blocks.length && blocks[i].type === "li") {
        items.push(blocks[i]);
        i++;
      }
      nodes.push({ kind: "list", items, startIndex });
    } else {
      nodes.push({ kind: "block", block: blocks[i], index: i });
      i++;
    }
  }
  return nodes;
}

function ProseSection({ section }: { section: Section }) {
  // Used for legal-style long-form content (Privacy)
  const nodes = groupProseBlocks(section.blocks);
  return (
    <section className="page-prose section-pad">
      <div className="container container-readable">
        {section.heading ? (
          <h2 className="heading-md page-prose-h">{section.heading.text}</h2>
        ) : null}
        {nodes.map((node) => {
          if (node.kind === "list") {
            return (
              <ul key={node.startIndex} className="page-prose-list">
                {node.items.map((item, j) => (
                  <li key={j} className="page-prose-li">{item.text}</li>
                ))}
              </ul>
            );
          }
          const { block: b, index: i } = node;
          if (b.type === "h3") return <h3 key={i} className="page-prose-h3">{b.text}</h3>;
          if (b.type === "h4") return <h4 key={i} className="page-prose-h4">{b.text}</h4>;
          if (b.type === "p") return <p key={i} className="page-prose-p">{b.text}</p>;
          if (b.type === "img" && b.src)
            return (
              <figure key={i} className="page-figure">
                <img src={b.src} alt={b.alt || ""} loading="lazy" />
              </figure>
            );
          return null;
        })}
      </div>
    </section>
  );
}

// Architectural Designs house-plan collections, embedded as their responsive
// widget iframes (the same embeds the old Squarespace floor-plans page used).
// Each tier also deep-links to the full collection on architecturaldesigns.com,
// which is the more "native" path: faster than the iframe, works if the embed is
// ever blocked, and is where a visitor can actually open and save a plan.
function renderCtaTitle(title: string) {
  const words = title.trim().split(/\s+/);
  if (words.length < 2) return title;
  const mid = Math.ceil(words.length / 2);
  const first = words.slice(0, mid).join(" ");
  const second = words.slice(mid).join(" ");
  return (
    <>
      <span className="cta-title-line">{first}</span>
      <span className="cta-title-line cta-title-line--accent">{second}</span>
    </>
  );
}

function PageCTA({ title, body, bgImage }: { title?: string; body?: string; bgImage?: string }) {
  const { open: openContactForm } = useContactForm();
  return (
    <section className="cta">
      {bgImage
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
            <span className="eyebrow" style={{ color: "var(--color-bone)" }}>Build With Us</span>
            <h2 className="heading-lg cta-title" style={{ textTransform: "uppercase" }}>
              {renderCtaTitle(title || "Begin Your Build")}
            </h2>
            <p style={{ marginInline: "auto" }}>
              {body ||
                "Relax while we manage every detail, throughout the entire process. Tell us about your vision, and we'll be in touch to schedule a consultation."}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              data-testid="page-cta"
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

interface Props {
  pageKey?: string;
  isRegion?: boolean;
  /** Region slug for isRegion pages. The router build read this from useParams; the app/ wrapper now passes it in. */
  region?: string;
  /** The page record for this route. Provided by the app/ server wrapper so the full pages dataset never ships in the client bundle. */
  data: PageData;
  /** slug -> ogImage map for the CityNavigator (where-we-build only), provided by the server wrapper for the same reason. */
  cityImages?: Record<string, string>;
  /** Resolved "keep exploring" sections for a city page (Reference Library hub and spokes, the city guide, city FAQs). Plain items, resolved by the server wrapper. */
  interlinks?: InterlinkSection[];
  /** Server-rendered hub content for a service page (e.g. /build-on-your-lot), placed after the scraped sections and before the CTA. */
  hubSlot?: ReactNode;
}

export default function ContentPage({ pageKey, isRegion, region, data, cityImages, interlinks, hubSlot }: Props) {
  const key = isRegion ? region || "" : pageKey || "";

  const layout = useMemo(() => {
    if (!data) return null;
    const blocks = dedupeListsAndParagraphs(data.blocks);

    // Extract intro pieces (skip lead img since hero uses ogImage)
    let i = 0;
    // Skip leading hero image
    while (i < blocks.length && blocks[i].type === "img") i++;
    // Skip a leading on-page h1 headline. Either it just echoes the page title,
    // or it sits directly above an h2/h3 subtitle (the real intro heading) — e.g.
    // location pages render [h1 "RIO VERDE"][h2 "BUILD A HOME IN RIO VERDE"][p].
    // Without this, the h1 falls through, leaving the intro copy column empty.
    while (
      i < blocks.length &&
      blocks[i].type === "h1" &&
      blocks[i].text &&
      (cleanTitle(data.title).toLowerCase() === blocks[i].text!.toLowerCase() ||
        (blocks[i + 1] != null &&
          (blocks[i + 1].type === "h2" || blocks[i + 1].type === "h3")))
    )
      i++;

    let subtitle: string | undefined;
    let intro: string | undefined;
    let introImg: { src: string; alt?: string } | undefined;
    // When the intro heading is identical to the hero description, keep it as the
    // intro heading and hide the description in the hero instead — so the tagline
    // shows exactly once and the intro section isn't left headingless.
    let heroDescDup = false;

    const descNorm = norm(data.description);
    if (i < blocks.length && (blocks[i].type === "h2" || blocks[i].type === "h3")) {
      const candidate = blocks[i].text || "";
      subtitle = candidate;
      if (norm(candidate) === descNorm) heroDescDup = true;
      i++;
    }
    if (i < blocks.length && blocks[i].type === "p") {
      const candidate = blocks[i].text || "";
      if (norm(candidate) !== descNorm) intro = candidate;
      i++;
    }
    // Look ahead for an early image to pair with the intro
    for (let j = i; j < Math.min(i + 4, blocks.length); j++) {
      if (blocks[j].type === "img" && blocks[j].src) {
        introImg = { src: blocks[j].src!, alt: blocks[j].alt };
        blocks.splice(j, 1);
        break;
      }
    }

    // Detect trailing CTA: final heading (h1/h2, e.g. "BEGIN YOUR BUILD",
    // "LET'S MAKE...") + optional p. Squarespace tagged some of these CTAs as h2,
    // which previously slipped past detection and rendered as a button-less,
    // half-finished section mid-page. Require keyword intent so legit final
    // headings like "WARRANTY" or "THANK YOU!" are not truncated.
    let ctaTitle: string | undefined;
    let ctaBody: string | undefined;
    for (let j = blocks.length - 1; j >= Math.max(i, blocks.length - 4); j--) {
      if ((blocks[j].type === "h1" || blocks[j].type === "h2") && isLikelyCTA(blocks[j].text)) {
        ctaTitle = blocks[j].text;
        if (blocks[j + 1] && blocks[j + 1].type === "p") {
          ctaBody = blocks[j + 1].text;
        }
        blocks.length = j; // truncate
        break;
      }
    }

    const remaining = blocks.slice(i);
    const sections = splitIntoSections(remaining);

    return { subtitle, intro, introImg, sections, ctaTitle, ctaBody, heroDescDup };
  }, [data]);

  // Unknown keys are guarded in the app/ wrappers via notFound() before this
  // component ever renders; this is a client-side belt and suspenders only.
  if (!data) return null;
  if (!layout) return null;

  const { subtitle, intro, introImg, sections, ctaTitle, ctaBody, heroDescDup } = layout;

  // Privacy policy gets its own typographic treatment
  const isLegal = /privacy/i.test(data.title);

  const tierEyebrow = key === "floorplans" ? "Floor plans" : undefined;

  // Bare city name for the local guide headings, derived the same way PageHero
  // derives its title (e.g. "Custom Home Builder in Phoenix, AZ" -> "Phoenix").
  const cityName = isRegion
    ? cleanTitle(data.title)
        .replace(/^Custom Home Builder in /i, "")
        .replace(/,\s*AZ.*$/i, "")
        .trim()
    : "";

  return (
    <MotionConfig reducedMotion="user">
      <main className="page" data-testid={`page-${key}`}>
        <PageHero data={data} slug={key} citySlug={isRegion ? key : undefined} hideDescription={heroDescDup} galleryStyle={isRegion || key === "warranty" || key === "privacypolicy" || key === "custom-homes" || key === "where-we-build" || key === "build-on-your-lot" || key === "buy-a-lot-with-us" || key === "floorplans" || key === "spechomes" || key === "aboutus"} />
        {key === "where-we-build" ? <CityNavigator images={cityImages} /> : null}
        {key !== "floorplans" && <IntroSection
          subtitle={subtitle}
          intro={key === "warranty" && intro
            ? intro.replace("Please contact Jematell Homes or call", "Please contact your Jematell Homes contact or call")
            : intro}
          image={key === "where-we-build"
            ? { src: "/images/where-we-build-interior.jpg", alt: "Luxury primary bathroom in a completed Jematell home in Arizona" }
            : key === "build-on-your-lot"
            ? { src: "/images/build-on-your-lot-intro.jpg", alt: "Bright white kitchen with quartz island in a completed Jematell home" }
            : key === "buy-a-lot-with-us"
            ? { src: "/images/buy-a-lot-with-us-intro.jpg", alt: "Spa-style primary bathroom with walk-in shower and freestanding tub in a completed Jematell home" }
            : introImg}
          centered={key === "warranty"}
          horizontal={key === "where-we-build"}
          subtitleNowrap={key === "scottsdale" || key === "rio-verde" || key === "cave-creek" || key === "fountain-hills" || key === "carefree" || key === "casa-grande" || key === "apache-junction"}
          subtitleTwoLine={key === "buy-a-lot-with-us"}
          editorial={isRegion || key === "custom-homes" || key === "build-on-your-lot" || key === "buy-a-lot-with-us"}
        />}

        {/* Sits directly under the intro on every city page and on
            /custom-homes. The home page renders it separately in app/page.tsx. */}
        {(isRegion || key === "custom-homes") && <WhyBuild />}

        {isLegal
          ? sections.map((s, i) => <ProseSection key={i} section={s} />)
          : key === "floorplans"
          ? <FloorPlanWidgets />
          : sections.map((s, i) => {
              if (isServiceGridSection(s)) return (
                <Fragment key={i}>
                  <ServiceGridSection section={s} />
                  {isRegion && <ProcessSection section={REGION_PROCESS_SECTION} />}
                  {isRegion && <LocalGuide blocks={s.blocks} cityName={cityName} citySlug={key} />}
                </Fragment>
              );
              if (isProcessSection(s)) return <ProcessSection key={i} section={s} />;
              if (isFloorPlanTiersSection(s, sections.slice(i + 1)))
                return <FloorPlanTiersSection key={i} section={s} pageKey={key} />;
              if (isWhyChooseSection(s)) {
                const next = sections[i + 1];
                const isDueDiligence = next?.heading?.text?.toLowerCase().includes("due diligence");
                return <WhyChooseSection key={i} section={s} extraSection={isDueDiligence ? next : undefined} />;
              }
              if (sections[i - 1] && isWhyChooseSection(sections[i - 1]) && s.heading?.text?.toLowerCase().includes("due diligence")) return null;
              if (isLocationEditorialSection(s)) return <LocationEditorialSection key={i} section={s} />;
              if (isTierListSection(s))
                return <TierListSection key={i} section={s} eyebrow={tierEyebrow} />;
              return <SplitSection key={i} section={s} index={i} forceReverse={key === "where-we-build"} />;
            })}



        {key === "custom-homes" && <FeaturedProjects />}

        {isRegion && interlinks && interlinks.length > 0 ? (
          <section className="section-pad region-interlink">
            <div className="container">
              <Interlink sections={interlinks} title={`Building in ${cityName}`} testid="region-interlink" />
            </div>
          </section>
        ) : null}

        {hubSlot}

        {key !== "warranty" && <PageCTA title={ctaTitle ? cleanTitle(ctaTitle) : undefined} body={ctaBody} bgImage={key === "custom-homes" ? "/images/custom-homes-cta.jpg" : undefined} />}
      </main>
    </MotionConfig>
  );
}
