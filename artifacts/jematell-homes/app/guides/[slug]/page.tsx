import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ChevronRight, Calendar, Clock, BookOpen } from "lucide-react";
import { guides, getGuide } from "@/data/guides";
import { getReferenceByKey } from "@/data/reference";
import { getGlossaryTerm } from "@/data/glossary";
import { faqDataset } from "@/data/faq";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { pageMetadata } from "@/seo/metadata";
import { articleJsonLd, breadcrumbJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import { annotateHeadings, readingTime, formatDate, prepareGuideBody } from "@/lib/detail";
import { enrichGuideBody } from "@/lib/guideEnrich";
import { DetailShell } from "@/components/DetailShell";
import { DetailDisclaimer } from "@/components/DetailParts";
import { Interlink } from "@/components/Interlink";
import { GuideNextStep } from "@/components/FaqNextStep";
import { locations } from "@/config/siteConfig";
import { relationsForGuide } from "@/lib/interlink";
import { buildInterlinkSections } from "@/lib/interlink.config";
import { ContactCta } from "@/components/ContactCta";
import { CTA } from "@/cta";

export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return pageMetadata({
    title: guide.seoTitle ?? guide.title,
    description: guide.metaDescription || guide.summary,
    canonical: `/guides/${guide.slug}`,
  });
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const prepared = prepareGuideBody(guide.bodyHtml, guide.title);
  // Resolve link clusters into readable components (accordions, term cards, reference
  // tables) before headings are annotated, and opt out of the generic "Related on this
  // site" callout, which this replaces.
  const enriched = enrichGuideBody(prepared, {
    faq: (s) => faqDataset.getItem(s),
    term: (s) => getGlossaryTerm(s),
    ref: (k) => getReferenceByKey(k),
    guide: (s) => getGuide(s),
  });
  const article = annotateHeadings(enriched, { seeAlso: false });
  const minutes = readingTime(prepared);

  const relatedGuides = guide.relatedGuides
    .map(getGuide)
    .filter((g): g is NonNullable<typeof g> => Boolean(g))
    .slice(0, 6);
  const relatedRefs = guide.relatedRefs
    .map(getReferenceByKey)
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .slice(0, 6);
  const relatedFaqs = guide.relatedFaqs
    .map((s) => faqDataset.getItem(s))
    .filter((i): i is NonNullable<typeof i> => Boolean(i))
    .slice(0, 6);
  const relatedTerms = guide.relatedTerms
    .map(getGlossaryTerm)
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .slice(0, 6);

  const path = `/guides/${guide.slug}`;
  // "Rio Verde Foothills" belongs on the Rio Verde page; a city with no town page gets none.
  const townSlug = guide.city ? locations.find((l) => guide.city!.startsWith(l.name))?.slug ?? null : null;
  const crumbs = [
    { name: "Home", url: "/" },
    { name: "Guides", url: "/guides" },
    { name: guide.title, url: path },
  ];

  const interlinks = buildInterlinkSections("guide", relationsForGuide(guide));

  const hero = (
    <section className="page-hero faq-hero faq-detail-hero">
      <ResponsiveImage name="cta-bg" className="page-hero-bg" alt="" widths={[768, 1280, 1920, 2500]} sizes="100vw" width={2500} height={1667} priority />
      <div className="page-hero-overlay" />
      <div className="container page-hero-content">
        <nav className="faq-crumbs hero-eyebrow" aria-label="Breadcrumb">
          <Link href="/guides" data-testid="guide-detail-crumb">Guides</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span>{guide.category || "Guide"}</span>
        </nav>
        <h1 className="faq-detail-title hero-title">{guide.title}</h1>
        {guide.summary ? (
          <p className="faq-detail-lede" data-testid="guide-detail-lede">{guide.summary}</p>
        ) : null}
        <div className="dt-hero-meta">
          {guide.updatedDate ? (
            <span><Calendar size={14} aria-hidden="true" /> Updated {formatDate(guide.updatedDate)}</span>
          ) : null}
          <span><Clock size={14} aria-hidden="true" /> {minutes} min read</span>
          {guide.sources?.length ? (
            <span><BookOpen size={14} aria-hidden="true" /> {guide.sources.length} sources</span>
          ) : null}
        </div>
      </div>
    </section>
  );

  return (
    <main className="page faq-page faq-detail guide-detail">
      <JsonLd
        data={[
          articleJsonLd({ title: guide.title, description: guide.summary, url: path, dateModified: guide.updatedDate }),
          breadcrumbJsonLd(crumbs),
        ]}
      />

      <DetailShell toc={article.toc} hero={hero}>
        <div className="dt-main">
          <div className="dt-back-row">
            <Link href="/guides" className="dt-back dt-back--top" data-testid="guide-detail-back">
              <ArrowLeft size={14} aria-hidden="true" />
              Guides
            </Link>
          </div>
          <div className="dt-prose" data-testid="guide-body" dangerouslySetInnerHTML={{ __html: article.html }} />
          <GuideNextStep slug={guide.slug} city={guide.city || undefined} townSlug={townSlug} />
          <Interlink sections={interlinks} testid="guide-interlink" />
          <Link href="/guides" className="dt-back" data-testid="guide-detail-all">
            All guides <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <DetailDisclaimer />
        </div>
      </DetailShell>

      <CTA />
    </main>
  );
}
