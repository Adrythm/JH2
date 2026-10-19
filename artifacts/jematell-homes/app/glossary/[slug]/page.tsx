import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ChevronRight, Clock } from "lucide-react";
import { glossaryTerms, getGlossaryTerm } from "@/data/glossary";
import { faqDataset } from "@/data/faq";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { pageMetadata } from "@/seo/metadata";
import { definedTermJsonLd, breadcrumbJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import { annotateHeadings, readingTime } from "@/lib/detail";
import { DetailDisclaimer } from "@/components/DetailParts";
import { Interlink } from "@/components/Interlink";
import { GlossaryNextStep } from "@/components/FaqNextStep";
import { relationsForGlossary } from "@/lib/interlink";
import { buildInterlinkSections } from "@/lib/interlink.config";
import { CTA } from "@/cta";

export const dynamicParams = false;

export function generateStaticParams() {
  return glossaryTerms.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) return {};
  return pageMetadata({
    title: term.seoTitle ?? term.term,
    description: term.metaDescription || term.shortDefinition,
    canonical: `/glossary/${term.slug}`,
  });
}

export default async function GlossaryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) notFound();

  const article = annotateHeadings(term.definitionHtml || "");
  const minutes = readingTime(term.definitionHtml || "");
  const interlinks = buildInterlinkSections("glossary", relationsForGlossary(term));

  const path = `/glossary/${term.slug}`;
  const crumbs = [
    { name: "Home", url: "/" },
    { name: "Glossary", url: "/glossary" },
    { name: term.term, url: path },
  ];

  return (
    <main className="page faq-page faq-detail glossary-detail">
      <JsonLd
        data={[
          definedTermJsonLd({ term: term.term, definition: term.shortDefinition, url: path }),
          breadcrumbJsonLd(crumbs),
        ]}
      />

      <section className="page-hero faq-hero faq-detail-hero page-hero-short">
        <ResponsiveImage name="cta-bg" className="page-hero-bg" alt="" widths={[768, 1280, 1920, 2500]} sizes="100vw" width={2500} height={1667} priority />
        <div className="page-hero-overlay" />
        <div className="container page-hero-content">
          <nav className="faq-crumbs hero-eyebrow" aria-label="Breadcrumb">
            <Link href="/glossary" data-testid="glossary-detail-crumb">Glossary</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span>{term.category || "Term"}</span>
          </nav>
          <h1 className="faq-detail-title hero-title">{term.term}</h1>
          <div className="dt-hero-meta">
            <span><Clock size={14} aria-hidden="true" /> {minutes} min read</span>
          </div>
        </div>
      </section>

      <section className="dt-section">
        <div className="container">
          <div style={{ maxWidth: 720, marginInline: "auto" }}>
            <div className="dt-main">
              <div className="dt-back-row">
                <Link href="/glossary" className="dt-back dt-back--top" data-testid="glossary-detail-back">
                  <ArrowLeft size={14} aria-hidden="true" />
                  Glossary
                </Link>
              </div>
              {term.shortDefinition ? (
                <div className="dt-answer-card" data-testid="glossary-short">
                  <span className="dt-answer-card-label">In short</span>
                  <p>{term.shortDefinition}</p>
                </div>
              ) : null}

              <div className="dt-prose" data-testid="glossary-definition" dangerouslySetInnerHTML={{ __html: article.html }} />
              <GlossaryNextStep slug={term.slug} category={term.category} />

              <Interlink sections={interlinks} testid="glossary-interlink" />

              <Link href="/glossary" className="dt-back" data-testid="glossary-detail-all">
                All terms <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <DetailDisclaimer />
            </div>
          </div>
        </div>
      </section>

      <CTA />
    </main>
  );
}
