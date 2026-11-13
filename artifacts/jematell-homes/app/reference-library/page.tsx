import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { REFERENCE_MODULES, moduleCount } from "@/data/reference";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { pageMetadata } from "@/seo/metadata";
import { collectionJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import { CTA } from "@/cta";

const META_DESCRIPTION =
  "Arizona building codes by city, the state statutes that govern a build, the residential code section by section, and gated community design guidelines.";
const INTRO =
  "The source material behind every answer, in plain language: the adopted building codes for each city we serve, the Arizona statutes that govern a build, the residential code explained section by section, and the design guidelines of the guard-gated communities.";

export const metadata = pageMetadata({
  title: "Reference Library",
  description: META_DESCRIPTION,
  canonical: "/reference-library",
});

export default function ReferenceIndexPage() {
  return (
    <main className="page faq-page reference-page">
      <JsonLd
        data={collectionJsonLd({ name: "Reference Library", description: INTRO, url: "/reference-library" })}
      />

      <section className="page-hero faq-hero" style={{ alignItems: "center", minHeight: "65vh" }}>
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
          <h1 className="page-hero-title hero-title" style={{ textTransform: "uppercase" }}>Reference Library</h1>
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
          <div className="lib-grid" data-testid="reference-modules">
            {REFERENCE_MODULES.map((m) => (
              <Link
                key={m.slug}
                href={`/reference-library/${m.slug}`}
                className="lib-card"
                data-testid={`reference-module-${m.slug}`}
              >
                <span className="lib-card-count">{moduleCount(m.slug)} entries</span>
                <h2 className="lib-card-title">{m.title}</h2>
                <p className="lib-card-desc">{m.description}</p>
                <span className="lib-card-more">
                  Browse <ArrowRight size={15} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </main>
  );
}
