import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ChevronRight, ExternalLink, Clock, Calendar } from "lucide-react";
import {
  referenceEntries,
  getReferenceEntry,
  getReferenceModule,
  getJurisdiction,
  referencesForCity,
  jurisdictionsInModule,
  REFERENCE_MODULES,
} from "@/data/reference";
import { ReferenceCityHub } from "@/views/ReferenceCityHub";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { pageMetadata } from "@/seo/metadata";
import { techArticleJsonLd, breadcrumbJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import { annotateHeadings, readingTime, formatDate } from "@/lib/detail";
import { DetailDisclaimer } from "@/components/DetailParts";
import { Interlink } from "@/components/Interlink";
import { relationsForReference, relationsForJurisdiction, townPageForReference } from "@/lib/interlink";
import { ReferenceNextStep } from "@/components/FaqNextStep";
import { buildInterlinkSections } from "@/lib/interlink.config";
import { ContactCta } from "@/components/ContactCta";
import { CTA } from "@/cta";
import { ReferenceDetailShell } from "@/views/ReferenceDetailShell";

export const dynamicParams = false;

export function generateStaticParams() {
  const params = referenceEntries.map((e) => ({ module: e.module, slug: e.slug }));
  // per-city hub pages share this [slug] segment (App Router has no sibling dynamic route)
  for (const m of REFERENCE_MODULES) {
    for (const g of jurisdictionsInModule(m.slug)) {
      params.push({ module: m.slug, slug: g.jurisdiction.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string; slug: string }>;
}): Promise<Metadata> {
  const { module: moduleSlug, slug } = await params;
  const jurisdiction = getJurisdiction(moduleSlug, slug);
  const moduleMeta = getReferenceModule(moduleSlug);
  if (jurisdiction && moduleMeta) {
    return pageMetadata({
      title: jurisdiction.seoTitle ?? `${jurisdiction.name} Building Codes`,
      description: jurisdiction.metaDescription ?? jurisdiction.blurb,
      canonical: `/reference-library/${moduleSlug}/${slug}`,
    });
  }
  const entry = getReferenceEntry(moduleSlug, slug);
  if (!entry) return {};
  return pageMetadata({
    title: entry.seoTitle ?? entry.title,
    description: entry.metaDescription || entry.shortSummary,
    canonical: `/reference-library/${entry.module}/${entry.slug}`,
  });
}

export default async function ReferenceDetailPage({
  params,
}: {
  params: Promise<{ module: string; slug: string }>;
}) {
  const { module: moduleSlug, slug } = await params;
  const meta = getReferenceModule(moduleSlug);
  const jurisdiction = getJurisdiction(moduleSlug, slug);
  if (meta && jurisdiction) {
    return (
      <ReferenceCityHub
        meta={meta}
        jurisdiction={jurisdiction}
        groups={referencesForCity(moduleSlug, slug)}
        crossLinks={buildInterlinkSections("jurisdiction", relationsForJurisdiction(jurisdiction))}
      />
    );
  }
  const entry = getReferenceEntry(moduleSlug, slug);
  if (!entry || !meta) notFound();

  const article = annotateHeadings(entry.bodyHtml || "");
  const minutes = readingTime(entry.bodyHtml || "");

  const interlinks = buildInterlinkSections("reference", relationsForReference(entry));

  const path = `/reference-library/${entry.module}/${entry.slug}`;
  const crumbs = [
    { name: "Home", url: "/" },
    { name: "Reference Library", url: "/reference-library" },
    { name: meta.title, url: `/reference-library/${meta.slug}` },
    { name: entry.title, url: path },
  ];
  const excerptOnly = entry.sourceLicense === "copyrighted";

  const hero = (
    <section className="page-hero faq-hero faq-detail-hero">
      <ResponsiveImage name="cta-bg" className="page-hero-bg" alt="" widths={[768, 1280, 1920, 2500]} sizes="100vw" width={2500} height={1667} priority />
      <div className="page-hero-overlay" />
      <div className="container page-hero-content">
        <nav className="faq-crumbs hero-eyebrow" aria-label="Breadcrumb">
          <Link href="/reference-library" data-testid="reference-detail-crumb">Reference Library</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link href={`/reference-library/${meta.slug}`} data-testid="reference-detail-crumb-module">{meta.title}</Link>
        </nav>
        <h1 className="faq-detail-title hero-title">{entry.title}</h1>
        {entry.shortSummary ? (
          <p className="faq-detail-lede" data-testid="reference-detail-lede">{entry.shortSummary}</p>
        ) : null}
        <div className="dt-hero-meta">
          {entry.updatedDate ? (
            <span><Calendar size={14} aria-hidden="true" /> Updated {formatDate(entry.updatedDate)}</span>
          ) : null}
          <span><Clock size={14} aria-hidden="true" /> {minutes} min read</span>
        </div>
      </div>
    </section>
  );

  const facts = (
    <div className="dt-facts" data-testid="reference-facts">
      <div className="dt-facts-title">At a glance</div>
      <div className="dt-facts-row">
        <span className="dt-facts-k">Collection</span>
        <span className="dt-facts-v">{meta.title}</span>
      </div>
      {entry.category ? (
        <div className="dt-facts-row">
          <span className="dt-facts-k">Topic</span>
          <span className="dt-facts-v">{entry.category}</span>
        </div>
      ) : null}
      <div className="dt-facts-row">
        <span className="dt-facts-k">Source</span>
        <span className="dt-facts-v">
          {excerptOnly ? (
            <span className="dt-badge dt-badge--warm">Excerpt only</span>
          ) : (
            <span className="dt-badge">Public source</span>
          )}
        </span>
      </div>
      {entry.updatedDate ? (
        <div className="dt-facts-row">
          <span className="dt-facts-k">Updated</span>
          <span className="dt-facts-v">{formatDate(entry.updatedDate)}</span>
        </div>
      ) : null}
    </div>
  );

  return (
    <main className="page faq-page faq-detail reference-detail">
      <JsonLd
        data={[
          techArticleJsonLd({ title: entry.title, description: entry.shortSummary, url: path, section: meta.title, dateModified: entry.updatedDate }),
          breadcrumbJsonLd(crumbs),
        ]}
      />

      <ReferenceDetailShell toc={article.toc} hero={hero} facts={facts}>
        <div className="dt-main">
          <div className="dt-back-row">
            <Link href={`/reference-library/${meta.slug}`} className="dt-back dt-back--top" data-testid="reference-detail-back">
              <ArrowLeft size={14} aria-hidden="true" />
              {meta.title}
            </Link>
          </div>
          {entry.sourceUrl ? (
            <a
              href={entry.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="dt-source-card"
              data-citations="true"
              data-testid="reference-source"
            >
              <span className="dt-source-card-label">Primary source</span>
              <span className="dt-source-card-title">
                {entry.sourceTitle || entry.sourceUrl} <ExternalLink size={16} aria-hidden="true" />
              </span>
              {excerptOnly ? (
                <span className="dt-source-card-note">
                  This page summarizes and quotes limited excerpts for commentary and education. See the source for the full, authoritative text.
                </span>
              ) : null}
            </a>
          ) : null}

          <div className="dt-prose" data-testid="reference-body" dangerouslySetInnerHTML={{ __html: article.html }} />

          <ReferenceNextStep category={entry.category} town={townPageForReference(entry)} />

          <Interlink sections={interlinks} testid="reference-interlink" />

          <Link href={`/reference-library/${meta.slug}`} className="dt-back" data-testid="reference-detail-all">
            All {meta.title} <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <DetailDisclaimer />
        </div>
      </ReferenceDetailShell>

      <CTA />
    </main>
  );
}
