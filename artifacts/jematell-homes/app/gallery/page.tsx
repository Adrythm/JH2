import { existsSync } from "node:fs";
import { join } from "node:path";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { pages } from "@/data/pages";
import { GALLERY_PROJECTS } from "@/data/galleryProjects";
import { pageMetadata } from "@/seo/metadata";
import { collectionJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import GalleryGrid from "@/views/GalleryGrid";

export const metadata = pageMetadata({
  title: "Custom Home Gallery in Arizona",
  description: "A selection of custom and semi-custom homes Jematell Homes has built across Arizona, each one shaped by the land it sits on and the family that calls it home.",
  canonical: "/gallery",
});

function firstImage(key: string): string {
  const p = pages[key];
  if (!p) return "";
  const img = p.blocks.find((b) => b.type === "img" && b.src);
  return img?.src || p.ogImage || "";
}

/**
 * The card's phone-sized copies: the 768w and 1280w WebP siblings of a thumb
 * (made with scripts/gen-image-variants.mjs), read from public/ at build time.
 * A card is at most a third of the screen on a computer and the full width on
 * a phone, so 1280w covers both; without them every card loaded its 0.2 to
 * 3.5MB original. A thumb with no siblings keeps its plain src.
 */
function thumbSrcSet(src: string): string | undefined {
  const m = /^(\/images\/.+)\.(webp|jpe?g|png)$/i.exec(src);
  if (!m) return undefined;
  const rungs = [768, 1280].filter((w) => existsSync(join(process.cwd(), "public", `${m[1]}-${w}.webp`)));
  return rungs.length ? rungs.map((w) => `${m[1]}-${w}.webp ${w}w`).join(", ") : undefined;
}

export default function Gallery() {
  const projects = GALLERY_PROJECTS.map((proj) => {
    const img = proj.thumb ?? firstImage(`gallery_${proj.slug}`);
    return { slug: proj.slug, title: proj.title, img, srcSet: img ? thumbSrcSet(img) : undefined };
  });

  return (
    <main className="page">
      <JsonLd
        data={collectionJsonLd({
          name: "Gallery - Jematell Homes",
          description: "Custom homes built by Jematell Homes across Arizona.",
          url: "/gallery",
        })}
      />
      <section className="page-hero" style={{ alignItems: "center", minHeight: "65vh" }}>
        {/* ResponsiveImage renders its own <picture>; the old outer wrapper's
            "/images/gallery-hero.webp" source pointed at a file that does not
            exist (only the -<width>.webp variants do). */}
        <ResponsiveImage name="gallery-hero" alt="" className="page-hero-bg" widths={[768, 1280, 1920, 2500]} sizes="100vw" width={3600} height={2400} priority />
        <div className="page-hero-overlay" style={{ background: "linear-gradient(180deg, rgba(10,12,14,0.25) 0%, rgba(10,12,14,0.45) 100%)" }} />
        <div className="container page-hero-content" style={{ textAlign: "center", maxWidth: "100%" }}>
          <h1 className="page-hero-title">OUR PORTFOLIO</h1>
        </div>
      </section>
      <section className="section-pad" style={{ background: "var(--color-bg)", paddingTop: "48px" }}>
        <div className="gallery-page-inner">
          <GalleryGrid projects={projects} />
        </div>
      </section>
    </main>
  );
}
