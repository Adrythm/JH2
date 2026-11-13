import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { guideGroups } from "@/data/guides";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { pageMetadata } from "@/seo/metadata";
import { collectionJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import { CTA } from "@/cta";

const META_DESCRIPTION =
  "In-depth guides to building a custom home in Arizona: financing, pre-construction permits, rural land, choosing a builder, and a guide for each city we serve.";
const INTRO =
  "In-depth guides that walk the whole journey end to end: how to build a custom home in Arizona, construction financing, the pre-construction permit layer, building on rural land, choosing a builder, and a complete guide for every city we build in.";

export const metadata = pageMetadata({
  title: "Custom Home Building Guides",
  description: META_DESCRIPTION,
  canonical: "/guides",
});

export default function GuidesIndexPage() {
  const groups = guideGroups();

  return (
    <main className="page faq-page guides-page">
      <JsonLd
        data={collectionJsonLd({ name: "Custom Home Building Guides", description: INTRO, url: "/guides" })}
      />

      <section className="page-hero" style={{ alignItems: "center", minHeight: "65vh" }}>
        <ResponsiveImage
          name="spec-home"
          className="page-hero-bg"
          alt=""
          widths={[768, 1280, 1600]}
          sizes="100vw"
          width={1600}
          height={1066}
          priority
        />
        <div className="page-hero-overlay" style={{ background: "linear-gradient(180deg, rgba(10,12,14,0.25) 0%, rgba(10,12,14,0.45) 100%)" }} />
        <div className="container page-hero-content" style={{ textAlign: "center", maxWidth: "100%" }}>
          <h1 className="page-hero-title hero-title" style={{ textTransform: "uppercase" }}>Guides</h1>
        </div>
      </section>

      <div className="container" style={{ paddingTop: "clamp(20px, 3vw, 32px)" }}>
        <Link
          href="/resources"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-muted)",
            textDecoration: "none",
          }}
        >
          ← Resources
        </Link>
      </div>

      <section className="lib-hub section-pad" style={{ paddingTop: "clamp(24px, 3vw, 40px)" }}>
        <div className="container">
          {groups.map((g) => (
            <div key={g.label} className="lib-group" data-testid={`guides-group-${g.label.replace(/\s+/g, "-").toLowerCase()}`}>
              <div className="lib-group-label" style={{ fontSize: "20px" }}>{g.label}</div>
              <div className="lib-grid">
                {g.guides.map((guide) => (
                  <Link
                    key={guide.slug}
                    href={`/guides/${guide.slug}`}
                    className="lib-card"
                    data-testid={`guide-${guide.slug}`}
                  >
                    <span className="lib-card-count">{guide.city ? "City guide" : "Pillar guide"}</span>
                    {/* h2, not h3: the page's only heading above these is the
                        h1, so h3 skipped a level (axe heading-order). Styling
                        comes from the class, so the tag change is invisible. */}
                    <h2 className="lib-card-title">{guide.city || guide.title}</h2>
                    <p className="lib-card-desc">{guide.summary}</p>
                    <span className="lib-card-more">
                      Read the guide <ArrowRight size={15} aria-hidden="true" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <CTA />
    </main>
  );
}
