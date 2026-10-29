"use client";
import { useState, useEffect, useCallback, lazy, Suspense, Fragment } from "react";
import { m, useReducedMotion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { GALLERY_BY_SLUG } from "../data/galleryProjects";
import { locations, locationHref } from "../config/siteConfig";
import { cristImages, CRIST_HERO_JPG, CRIST_HERO_WEBP } from "../data/crist";

function isLocalPath(src: string): boolean {
  return src.startsWith("/") || src.startsWith("./") || !src.startsWith("http");
}

function webpPath(jpgSrc: string): string {
  return jpgSrc.replace(/\.jpe?g$/i, ".webp");
}

const isDev = process.env.NODE_ENV !== "production";

/** Where a project's stat leads: its town page, or the page for its build type. */
function statHref(label: string, value: string): string | undefined {
  if (label === "Location") {
    const town = locations.find((l) => l.name === value);
    return town ? locationHref(town.slug) : undefined;
  }
  if (label === "Build Type") {
    if (value === "Custom") return "/custom-homes";
    if (value === "Spec") return "/spec-homes";
  }
  return undefined;
}

const statLinkStyle = { color: "inherit", textDecoration: "underline", textUnderlineOffset: "4px" } as const;

/**
 * Many project photos were uploaded with their camera file name as the alt
 * text ("018_Aerial View (1).jpg", "DJI_20260125135231_0049_D.jpg"). Turn a
 * file name into words about the photo and the project; leave real alt text as
 * it is.
 */
function photoAlt(raw: string | undefined, slug: string, title: string): string {
  const proj = GALLERY_BY_SLUG[slug];
  const kind = proj?.buildType === "Spec" ? "spec home" : "custom home";
  const where = proj?.location ? ` in ${proj.location}, AZ` : "";
  const project = title ? `${title}, a Jematell ${kind}${where}` : "";
  const alt = (raw ?? "").trim();
  if (!alt) return project;
  if (!/\.(jpe?g|png|webp|heic)$/i.test(alt)) return alt;
  const drone = /(^|[^a-z])DJI[_-]/i.test(alt);
  const words = alt
    .replace(/\.(jpe?g|png|webp|heic)$/i, "")
    .replace(/\b(DJI|DSC|IMG)[_-]?[\d_]*[A-Z]?\b/gi, " ")
    .replace(/\(\d+\)/g, " ")
    .replace(/[_\-]+/g, " ")
    .replace(/\b\d+[a-z]?\b/gi, " ")
    .replace(/\b(I{1,3}|IV|V)\b/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !w.includes("."))
    .join(" ");
  const label = /screenshot/i.test(words) ? "" : words || (drone ? "Aerial view" : "");
  if (!label) return project;
  const phrase = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
  return project ? `${phrase} of the ${project}` : phrase;
}

function StatValue({ label, value }: { label: string; value: string }) {
  const href = statHref(label, value);
  return href ? (
    <Link href={href} className="gallery-detail-stat-value" style={statLinkStyle}>
      {value}
    </Link>
  ) : (
    <span className="gallery-detail-stat-value">{value}</span>
  );
}

const DevDraggableGallery = isDev
  ? lazy(() =>
      import("../dev/DevDraggableGallery").then((m) => ({
        default: m.DevDraggableGallery,
      }))
    )
  : null;

export interface GalleryDetailImage {
  src: string;
  alt?: string;
}

interface NormalizedImage {
  src: string;
  webp?: string;
  alt: string;
}

function GalleryLightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: NormalizedImage[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const img = images[index];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="gallery-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Photo lightbox"
      onClick={onClose}
    >
      <button
        className="gallery-lightbox-close"
        onClick={onClose}
        aria-label="Close"
        data-testid="gallery-lightbox-close"
      >
        <X size={22} />
      </button>

      {images.length > 1 && (
        <>
          <button
            className="gallery-lightbox-nav gallery-lightbox-prev"
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            aria-label="Previous photo"
            data-testid="gallery-lightbox-prev"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            className="gallery-lightbox-nav gallery-lightbox-next"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            aria-label="Next photo"
            data-testid="gallery-lightbox-next"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      <div className="gallery-lightbox-content" onClick={(e) => e.stopPropagation()}>
        {img.webp ? (
          <picture>
            <source srcSet={img.webp} type="image/webp" />
            <img src={img.src} alt={img.alt} className="gallery-lightbox-img" />
          </picture>
        ) : (
          <img src={img.src} alt={img.alt} className="gallery-lightbox-img" />
        )}
      </div>

      {images.length > 1 && (
        <span className="gallery-lightbox-counter" aria-live="polite">
          {index + 1} / {images.length}
        </span>
      )}
    </div>
  );
}

interface GalleryDetailProps {
  slug: string;
  title?: string;
  ogImage?: string;
  images?: GalleryDetailImage[];
}

export default function GalleryDetail({ slug, title = "", ogImage, images: rawImages = [] }: GalleryDetailProps) {
  const images = rawImages.map((img) => ({ ...img, alt: photoAlt(img.alt, slug, title) }));
  const reduce = useReducedMotion();
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Compute the normalised image list up-front (always, to satisfy Rules of Hooks)
  const isCrist = slug === "skinner-custom";
  const cristImgs = isCrist ? cristImages() : [];

  const normalized: NormalizedImage[] = isCrist
    ? cristImgs.map((img) => ({ src: img.jpg, webp: img.webp, alt: img.alt }))
    : images.map((img) => ({
        src: img.src,
        webp: isLocalPath(img.src) ? webpPath(img.src) : undefined,
        alt: img.alt || title,
      }));

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const openLightbox = useCallback((i: number) => setLightboxIdx(i), []);
  const onPrev = useCallback(
    () => setLightboxIdx((i) => (i === null ? null : (i - 1 + normalized.length) % normalized.length)),
    [normalized.length],
  );
  const onNext = useCallback(
    () => setLightboxIdx((i) => (i === null ? null : (i + 1) % normalized.length)),
    [normalized.length],
  );

  if (isCrist) {
    const devImages = isDev
      ? cristImgs.map((img, i) => ({
          key: img.jpg.split("/").pop()!.replace(/\.(jpg|jpeg|webp)$/i, ""),
          src: img.jpg,
          webp: img.webp,
          alt: img.alt,
          eager: i < 6,
        }))
      : null;

    return (
      <main className="page">
        <section className="gallery-detail-hero">
          <picture className="gallery-detail-hero-picture">
            <source srcSet={CRIST_HERO_WEBP} type="image/webp" />
            <img src={CRIST_HERO_JPG} alt="Skinner Custom" className="page-hero-bg" loading="eager" />
          </picture>
          <div
            className="page-hero-overlay"
            style={{ background: "linear-gradient(to top, rgba(22,22,22,0.72) 0%, rgba(22,22,22,0.2) 60%, transparent 100%)" }}
          />
          <div className="container page-hero-content gallery-detail-hero-content">
            <h1 className="page-hero-title">Skinner Custom</h1>
          </div>
        </section>
        <div className="gallery-detail-stats">
          <div className="container">
            <div className="gallery-detail-stats-layout">
              <div className="gallery-detail-stats-nav">
                <Link href="/gallery" className="dt-back gallery-detail-stats-back" data-testid="gallery-detail-back-crist" style={{ marginTop: 0 }}>
                  <ArrowLeft size={14} aria-hidden="true" />
                  Gallery
                </Link>
              </div>
              <div className="gallery-detail-stats-inner">
                <div className="gallery-detail-stat">
                  <StatValue label="Build Type" value="Custom" />
                  <span className="gallery-detail-stat-label">Build Type</span>
                </div>
                <div className="gallery-detail-stat-divider" />
                <div className="gallery-detail-stat">
                  <StatValue label="Location" value="Surprise" />
                  <span className="gallery-detail-stat-label">Location</span>
                </div>
                <div className="gallery-detail-stat-divider" />
                <div className="gallery-detail-stat">
                  <span className="gallery-detail-stat-value">2026</span>
                  <span className="gallery-detail-stat-label">Completed</span>
                </div>
              </div>
              <div className="gallery-detail-stats-nav" />
            </div>
          </div>
        </div>

        <section className="section-pad" style={{ background: "var(--color-bg)", paddingTop: 0 }}>
          <div className="gallery-masonry-wrap">
            {isDev && DevDraggableGallery && devImages ? (
              <Suspense fallback={null}>
                <DevDraggableGallery
                  initialImages={devImages}
                  slug="crist"
                  masonryClass="gallery-masonry gallery-masonry-crist"
                  onImageClick={openLightbox}
                />
              </Suspense>
            ) : (
              <div className="gallery-masonry gallery-masonry-crist">
                {cristImgs.map((img, i) => (
                  <m.figure
                    key={i}
                    className="gallery-masonry-item gallery-masonry-item-clickable"
                    initial={reduce ? false : { opacity: 0, y: 20 }}
                    whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.55, delay: (i % 5) * 0.06 }}
                    onClick={() => openLightbox(i)}
                  >
                    <picture>
                      <source srcSet={img.webp} type="image/webp" />
                      <img src={img.jpg} alt={img.alt} loading={i < 6 ? "eager" : "lazy"} />
                    </picture>
                  </m.figure>
                ))}
              </div>
            )}
          </div>
        </section>

        {lightboxIdx !== null && (
          <GalleryLightbox
            images={normalized}
            index={lightboxIdx}
            onClose={closeLightbox}
            onPrev={onPrev}
            onNext={onNext}
          />
        )}
      </main>
    );
  }

  // ── Generic gallery (all other slugs) ────────────────────────────────────
  const devImages = isDev
    ? images.map((img, i) => ({
        key: img.src,
        src: img.src,
        webp: isLocalPath(img.src) ? webpPath(img.src) : undefined,
        alt: img.alt || title,
        eager: i < 4,
      }))
    : null;

  const proj = GALLERY_BY_SLUG[slug];
  const stats = [
    proj?.buildType && { value: proj.buildType, label: "Build Type" },
    proj?.location  && { value: proj.location,  label: "Location" },
    proj?.completed && { value: proj.completed, label: "Completed" },
  ].filter(Boolean) as { value: string; label: string }[];

  return (
    <main className="page">
      <section className="gallery-detail-hero">
        {ogImage ? (
          isLocalPath(ogImage) ? (
            <picture className="gallery-detail-hero-picture">
              <source srcSet={webpPath(ogImage)} type="image/webp" />
              <img src={ogImage} alt="" className="page-hero-bg" loading="eager" />
            </picture>
          ) : (
            <img src={ogImage} alt="" className="page-hero-bg" loading="eager" />
          )
        ) : null}
        <div className="page-hero-overlay" />
        <div className="container page-hero-content gallery-detail-hero-content">
          <h1 className="page-hero-title">{title}</h1>
        </div>
      </section>

      {stats.length > 0 && (
        <div className="gallery-detail-stats">
          <div className="container">
            <div className="gallery-detail-stats-layout">
              <div className="gallery-detail-stats-nav">
                <Link href="/gallery" className="dt-back gallery-detail-stats-back" data-testid="gallery-detail-back" style={{ marginTop: 0 }}>
                  <ArrowLeft size={14} aria-hidden="true" />
                  Gallery
                </Link>
              </div>
              <div className="gallery-detail-stats-inner">
                {stats.map((s, i) => (
                  <Fragment key={s.label}>
                    {i > 0 && <div className="gallery-detail-stat-divider" />}
                    <div className="gallery-detail-stat">
                      <StatValue label={s.label} value={s.value} />
                      <span className="gallery-detail-stat-label">{s.label}</span>
                    </div>
                  </Fragment>
                ))}
              </div>
              <div className="gallery-detail-stats-nav" />
            </div>
          </div>
        </div>
      )}

      <section className="section-pad" style={{ background: "var(--color-bg)", paddingTop: 0 }}>
        <div className="gallery-masonry-wrap">
          {isDev && DevDraggableGallery && devImages ? (
            <Suspense fallback={null}>
              <DevDraggableGallery
                initialImages={devImages}
                slug={slug}
                masonryClass="gallery-masonry"
                onImageClick={openLightbox}
              />
            </Suspense>
          ) : (
            <div className="gallery-masonry">
              {images.map((img, i) => (
                <m.figure
                  key={i}
                  className="gallery-masonry-item gallery-masonry-item-clickable"
                  initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                  whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.55, delay: (i % 4) * 0.07 }}
                  onClick={() => openLightbox(i)}
                >
                  {isLocalPath(img.src) ? (
                    <picture>
                      <source srcSet={webpPath(img.src)} type="image/webp" />
                      <img src={img.src} alt={img.alt || title} loading={i < 4 ? "eager" : "lazy"} />
                    </picture>
                  ) : (
                    <img src={img.src} alt={img.alt || title} loading={i < 4 ? "eager" : "lazy"} />
                  )}
                </m.figure>
              ))}
            </div>
          )}
        </div>
      </section>

      {lightboxIdx !== null && (
        <GalleryLightbox
          images={normalized}
          index={lightboxIdx}
          onClose={closeLightbox}
          onPrev={onPrev}
          onNext={onNext}
        />
      )}
    </main>
  );
}
