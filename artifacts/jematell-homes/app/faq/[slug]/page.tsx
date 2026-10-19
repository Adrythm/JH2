import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { faqDataset, SERVICE_LINKS } from "@/data/faq";
import { blogs } from "@/data/blogs";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { pageMetadata } from "@/seo/metadata";
import { qaPageJsonLd, breadcrumbJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import { annotateHeadings } from "@/lib/detail";
import { DetailShell } from "@/components/DetailShell";
import { DetailDisclaimer } from "@/components/DetailParts";
import { Interlink } from "@/components/Interlink";
import { relationsForFaq } from "@/lib/interlink";
import { buildInterlinkSections } from "@/lib/interlink.config";
import { CTA } from "@/cta";
import { FaqNextStep } from "@/components/FaqNextStep";

export const dynamicParams = false;

export function generateStaticParams() {
  return faqDataset.all().map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = faqDataset.getItem(slug);
  if (!item) return {};
  const detail = faqDataset.toDetail(item);
  return pageMetadata({
    title: detail.seoTitle ?? detail.question,
    description: detail.metaDescription,
    canonical: `/faq/${detail.slug}`,
  });
}

function cleanTitle(t: string) {
  return t.replace(/\s*[—–-]\s*Jematell Homes\s*$/i, "").trim();
}

export default async function FaqDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = faqDataset.getItem(slug);
  if (!item) notFound();
  const detail = faqDataset.toDetail(item);
  const related = faqDataset.related(item);
  const article = annotateHeadings(detail.answerHtml || "");
  const path = `/faq/${detail.slug}`;
  const primaryTopic = (() => {
    for (const ts of detail.topicSlugs) {
      const t = faqDataset.getTopic(ts);
      if (t) return { slug: t.slug, title: t.title };
    }
    return null;
  })();
  const crumbs = [
    { name: "Home", url: "/" },
    { name: "FAQ", url: "/faq" },
    ...(primaryTopic ? [{ name: primaryTopic.title, url: `/faq/topics/${primaryTopic.slug}` }] : []),
    { name: detail.question, url: path },
  ];
  const services = detail.relatedServiceSlugs
    .map((s) => SERVICE_LINKS[s])
    .filter((s): s is { label: string; href: string } => Boolean(s));
  const pillar =
    detail.pillarBlogSlug && blogs[detail.pillarBlogSlug]
      ? { slug: detail.pillarBlogSlug, title: cleanTitle(blogs[detail.pillarBlogSlug].title) }
      : null;
  const paragraphs = detail.answer.split(/\n{2,}/).filter(Boolean);

  const interlinks = buildInterlinkSections("faq", relationsForFaq(detail, related, services, pillar));

  const hero = (
    <section className="page-hero faq-detail-hero" style={{ alignItems: "center", minHeight: "65vh" }}>
      <ResponsiveImage name="spec-home" className="page-hero-bg" alt="" widths={[768, 1280, 1600, 2000, 2500]} sizes="100vw" width={2500} height={1667} priority />
      <div className="page-hero-overlay" />
      <div className="container page-hero-content" style={{ textAlign: "center", maxWidth: "100%" }}>
        <h1 className="page-hero-title hero-title">{detail.question}</h1>
      </div>
    </section>
  );

  return (
    <main className="page faq-page faq-detail">
      <JsonLd
        data={[
          // QAPage, not FAQPage: this page is one question with one
          // authoritative answer, and FAQPage markup earns nothing outside
          // government and health sites since Google's 2023 restriction.
          // dateModified is deliberately not passed: every entry in the FAQ
          // seed carries the same 2026-01-01 placeholder, so publishing it
          // would assert the same review date on all 350 pages, which is worse
          // than asserting none. Pass detail.updatedDate here once the seed
          // stamps real per-answer dates.
          qaPageJsonLd({
            url: path,
            question: detail.question,
            answer: detail.answer,
            ...(detail.categoryTitle ? { topic: detail.categoryTitle } : {}),
          }),
          breadcrumbJsonLd(crumbs),
        ]}
      />

      <DetailShell toc={article.toc} hero={hero}>
        <div className="dt-main">
          <div className="dt-back-row">
            <Link href="/faq" className="dt-back dt-back--top" data-testid="faq-detail-back-faq">
              <ArrowLeft size={14} aria-hidden="true" />
              FAQ
            </Link>
            {primaryTopic && (
              <Link
                href={`/faq/topics/${primaryTopic.slug}`}
                className="dt-back dt-back--top"
                data-testid="faq-detail-back"
              >
                <ArrowLeft size={14} aria-hidden="true" />
                {primaryTopic.title}
              </Link>
            )}
          </div>
          {detail.shortAnswer ? (
            <div className="dt-answer-card" data-testid="faq-short-answer">
              <span className="dt-answer-card-label">The short answer</span>
              <p>{detail.shortAnswer}</p>
            </div>
          ) : null}
          <div className="dt-prose" data-testid="faq-answer">
            {detail.answerHtml ? (
              <div dangerouslySetInnerHTML={{ __html: article.html }} />
            ) : (
              paragraphs.map((p, i) => <p key={i}>{p}</p>)
            )}
          </div>
          <FaqNextStep slug={detail.slug} categorySlug={detail.categorySlug} />
          <Interlink sections={interlinks} testid="faq-interlink" />
          <Link href="/faq" className="dt-back" data-testid="faq-detail-all">
            All questions <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <DetailDisclaimer />
        </div>
      </DetailShell>

      <CTA />
    </main>
  );
}
