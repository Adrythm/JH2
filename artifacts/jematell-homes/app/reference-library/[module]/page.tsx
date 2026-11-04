import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import {
  REFERENCE_MODULES,
  getReferenceModule,
  referencesByCategory,
  moduleCount,
  moduleIsPerCity,
  jurisdictionsInModule,
} from "@/data/reference";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { pageMetadata } from "@/seo/metadata";
import { collectionJsonLd, breadcrumbJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import { CTA } from "@/cta";

export const dynamicParams = false;

export function generateStaticParams() {
  return REFERENCE_MODULES.map((m) => ({ module: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string }>;
}): Promise<Metadata> {
  const { module: moduleSlug } = await params;
  const meta = getReferenceModule(moduleSlug);
  if (!meta) return {};
  return pageMetadata({
    title: meta.seoTitle ?? meta.title,
    description: meta.description,
    canonical: `/reference-library/${meta.slug}`,
  });
}

export default async function ReferenceModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: moduleSlug } = await params;
  const meta = getReferenceModule(moduleSlug);
  if (!meta) notFound();

  const groups = referencesByCategory(meta.slug);
  const path = `/reference-library/${meta.slug}`;
  const count = moduleCount(meta.slug);
  const crumbs = [
    { name: "Home", url: "/" },
    { name: "Reference Library", url: "/reference-library" },
    { name: meta.title, url: path },
  ];

  return (
    <main className="page faq-page reference-page">
      <JsonLd
        data={[
          collectionJsonLd({ name: meta.title, description: meta.description, url: path }),
          breadcrumbJsonLd(crumbs),
        ]}
      />

      <section className="page-hero faq-hero">
        <ResponsiveImage name="spec-home" className="page-hero-bg" alt="" widths={[768, 1280, 1600]} sizes="100vw" width={1600} height={1066} priority />
        <div className="page-hero-overlay" />
        <div className="container page-hero-content">
          <nav className="faq-crumbs hero-eyebrow" aria-label="Breadcrumb">
            <Link href="/reference-library" data-testid="reference-module-crumb">Reference Library</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span>{count} entries</span>
          </nav>
          <h1 className="page-hero-title" style={{ textTransform: "uppercase" }}>{meta.title}</h1>
          <p className="page-hero-sub hero-subtitle">{meta.description}</p>
        </div>
      </section>

      <section className="lib-hub section-pad" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="dt-back-row" style={{ marginTop: 32 }}>
            <Link href="/reference-library" className="dt-back dt-back--top" data-testid="reference-module-back">
              <ArrowLeft size={14} aria-hidden="true" />
              Reference Library
            </Link>
          </div>
          {moduleIsPerCity(meta.slug) ? (
            <div className="lib-grid" data-testid="reference-city-grid">
              {jurisdictionsInModule(meta.slug).map((g) => (
                <Link
                  key={g.jurisdiction.slug}
                  href={`/reference-library/${meta.slug}/${g.jurisdiction.slug}`}
                  className="lib-card"
                  data-testid={`reference-city-${g.jurisdiction.slug}`}
                >
                  {/* h2: directly under the page h1 — h3 skipped a level. */}
                  <h2 className="lib-card-title">{g.jurisdiction.name}</h2>
                  <p className="lib-card-desc">{g.jurisdiction.blurb}</p>
                  <span className="lib-card-more">
                    {g.entries.length} {g.entries.length === 1 ? "page" : "pages"} <ArrowRight size={15} aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            groups.map((g) => (
              <div key={g.category || "all"} className="lib-group" data-testid={`reference-category-${g.category}`}>
                {g.category ? <div className="lib-group-label">{g.category}</div> : null}
                <div className="lib-grid">
                  {g.entries.map((e) => (
                    <Link
                      key={e.slug}
                      href={`/reference-library/${e.module}/${e.slug}`}
                      className="lib-card"
                      data-testid={`reference-entry-${e.slug}`}
                    >
                      <h2 className="lib-card-title">{e.title}</h2>
                      <p className="lib-card-desc">{e.shortSummary}</p>
                      <span className="lib-card-more">
                        Read the reference <ArrowRight size={15} aria-hidden="true" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}

          <Link href="/reference-library" className="dt-back" data-testid="reference-module-all">
            All collections <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <CTA />
    </main>
  );
}
