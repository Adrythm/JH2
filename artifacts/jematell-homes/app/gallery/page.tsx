import Link from "next/link";
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
      <section className="section-pad" style={{ background: "var(--color-bg)", paddingTop: "48px", paddingBottom: 0 }}>
        <div className="container" style={{ maxWidth: "820px" }}>
          <h2>Homes we have built across Arizona</h2>
          <p>
            Every home here was built by Jematell Homes, a family-owned custom home builder based in
            Scottsdale. Most are custom homes in Rio Verde, from the Modern Farmhouse and Twilight House
            to the Rio Verde RV build. You will also find a custom home in Arizona City and spec homes in
            Cave Creek and Casa Grande.
          </p>
          <p>
            Each project shows how a home fits its lot. Many owners already had their land, which is what
            our <Link href="/build-on-your-lot">Build on Your Lot</Link> service is for: we check the lot for
            utilities, access and grading first, then handle permits, engineering, site prep and the build.
          </p>
          <p>
            Want a home like these? Start with <Link href="/custom-homes">Custom Homes</Link> for a home
            designed around you, or <Link href="/spec-homes">Spec Homes</Link> for a move-in ready new home.
            See <Link href="/where-we-build">where we build</Link> for the towns we serve, including{" "}
            <Link href="/where-we-build/rio-verde">Rio Verde</Link>,{" "}
            <Link href="/where-we-build/cave-creek">Cave Creek</Link> and{" "}
            <Link href="/where-we-build/casa-grande">Casa Grande</Link>. During the build you get a written
            update every week. Call <a href="tel:6024215576">(602) 421-5576</a> or tell us about your lot
            on the <Link href="/contact">contact page</Link>.
          </p>
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
