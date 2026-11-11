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

export default function Gallery() {
  const projects = GALLERY_PROJECTS.map((proj) => ({
    slug: proj.slug,
    title: proj.title,
    img: proj.thumb ?? firstImage(`gallery_${proj.slug}`),
  }));

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
