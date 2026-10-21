import type { Dataset } from "@workspace/faq";
import { escapeHtml, sanitizeHtml } from "./html";
import {
  breadcrumbJsonLd,
  detailGraphJsonLd,
  faqPageJsonLd,
  qaPageJsonLd,
} from "./jsonld";
import { ctaStrip, renderShell } from "./shell";
import type { FaqSummary } from "@workspace/faq";

const ARROW = `<span class="arrow" aria-hidden="true">&rarr;</span>`;
const SITE = "Jematell Homes";

// Maps a relatedServiceSlug (authored in the seed) to a real page on the
// jematell SPA. Slugs not in this map are skipped (never render a dead link).
const SERVICE_LINKS: Record<string, { title: string; href: string }> = {
  "custom-homes": { title: "Custom Homes", href: "/custom-homes" },
  "spec-homes": { title: "Spec Homes", href: "/spec-homes" },
  "floor-plans": { title: "Floor Plans", href: "/floor-plans" },
  "where-we-build": { title: "Where We Build", href: "/where-we-build" },
  "build-on-your-lot": { title: "Build on Your Lot", href: "/build-on-your-lot" },
  "buy-a-lot-with-us": { title: "Buy a Lot With Us", href: "/buy-a-lot-with-us" },
  casitas: { title: "Casitas and Guest Houses", href: "/casitas-and-guest-houses" },
  "where-we-build/cave-creek": { title: "Custom Homes in Cave Creek", href: "/where-we-build/cave-creek" },
  "where-we-build/fountain-hills": { title: "Custom Homes in Fountain Hills", href: "/where-we-build/fountain-hills" },
  "where-we-build/carefree": { title: "Custom Homes in Carefree", href: "/where-we-build/carefree" },
};

function questionListItem(item: FaqSummary): string {
  return `<li><a href="/faq/${item.slug}" data-testid="faq-link-${item.slug}">${escapeHtml(
    item.question,
  )}${ARROW}</a></li>`;
}

function answerHtml(answer: string, answerHtmlField: string | null): string {
  if (answerHtmlField && answerHtmlField.trim()) {
    return sanitizeHtml(answerHtmlField);
  }
  return answer
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
    .join("");
}

// ----- /faq (FAQPage) -----
export function renderFaqIndex(dataset: Dataset, baseUrl: string): string {
  const url = `${baseUrl}/faq`;
  const categories = dataset.categories().filter((c) => c.items.length > 0);
  const topics = dataset.topics();

  const topicChips = topics.length
    ? `<div class="topic-chips" aria-label="Topics">${topics
        .map(
          (t) =>
            `<a href="/faq/topics/${t.slug}" data-testid="faq-topic-${t.slug}">${escapeHtml(
              t.title,
            )}</a>`,
        )
        .join("")}</div>`
    : "";

  const sections = categories
    .map(
      (c) => `<section class="faq-cat" data-testid="faq-category-${c.slug}">
<h2>${escapeHtml(c.title)}</h2>
${c.description ? `<p class="cat-desc">${escapeHtml(c.description)}</p>` : ""}
<ul class="faq-list">${c.items.map(questionListItem).join("")}</ul>
</section>`,
    )
    .join("");

  const body = `<section class="faq-hero"><div class="container">
<div class="breadcrumb"><a href="/">Home</a><span>/</span>FAQ</div>
<p class="eyebrow">Answers</p>
<h1>Frequently Asked Questions</h1>
<p>Clear, practical answers about designing and building a custom home in Arizona.</p>
${topicChips}
</div></section>
<main><div class="container">${sections}</div></main>
${ctaStrip}`;

  // Visible answers stay on detail pages; the hub schema uses concise shortAnswers.
  const allSummaries = dataset.summaries();

  return renderShell({
    title: `Frequently Asked Questions | ${SITE}`,
    metaDescription:
      "Answers to common questions about designing and building a custom home in Arizona — process, budget, lots, and locations.",
    canonical: url,
    jsonLd: [faqPageJsonLd(allSummaries, url)],
    body,
  });
}

// ----- /faq/:slug (QAPage + BreadcrumbList @graph) -----
export function renderFaqDetail(
  dataset: Dataset,
  slug: string,
  baseUrl: string,
): string | null {
  const item = dataset.getItem(slug);
  if (!item) return null;
  const detail = dataset.toDetail(item);
  const related = dataset.related(item);
  const url = `${baseUrl}/faq/${slug}`;

  // Breadcrumb third level is the primary TOPIC (Home > FAQ > Topic > Question),
  // which is the schema.org hierarchy this FAQ system is built around. Items
  // without a topic fall back to their category so the crumb is never empty.
  const primaryTopic = detail.topicSlugs
    .map((s) => dataset.getTopic(s))
    .find((t) => t !== undefined);
  const parentCrumb = primaryTopic
    ? {
        name: primaryTopic.title,
        url: `${baseUrl}/faq/topics/${primaryTopic.slug}`,
      }
    : {
        name: detail.categoryTitle,
        url: `${baseUrl}/faq#${detail.categorySlug}`,
      };
  const parentHref = primaryTopic
    ? `/faq/topics/${primaryTopic.slug}`
    : `/faq#${detail.categorySlug}`;
  const parentName = parentCrumb.name;

  const crumbs = [
    { name: "Home", url: `${baseUrl}/` },
    { name: "FAQ", url: `${baseUrl}/faq` },
    parentCrumb,
    { name: detail.question, url },
  ];

  const serviceLinks = detail.relatedServiceSlugs
    .map((s) => SERVICE_LINKS[s])
    .filter((s): s is { title: string; href: string } => s !== undefined);
  const servicesHtml = serviceLinks.length
    ? `<aside class="related related-services" data-testid="faq-related-services"><h3>Related services</h3><ul>${serviceLinks
        .map(
          (s) =>
            `<li><a href="${s.href}" data-testid="faq-service-${s.href
              .replace(/^\//, "")
              .replace(/\//g, "-")}">${escapeHtml(s.title)}${ARROW}</a></li>`,
        )
        .join("")}</ul></aside>`
    : "";

  const relatedHtml = related.length
    ? `<aside class="related" data-testid="faq-related"><h3>Related questions</h3><ul>${related
        .map(
          (r) =>
            `<li><a href="/faq/${r.slug}" data-testid="faq-related-${r.slug}">${escapeHtml(
              r.question,
            )}</a></li>`,
        )
        .join("")}</ul></aside>`
    : "";

  const pillarHtml = detail.pillarBlogSlug
    ? `<a class="pillar-link" href="/blog/${detail.pillarBlogSlug}" data-testid="faq-pillar-link">Read the full guide &rarr;</a>`
    : "";

  const updated = detail.updatedDate.slice(0, 10);

  const body = `<section class="faq-hero"><div class="container">
<div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/faq">FAQ</a><span>/</span><a href="${parentHref}">${escapeHtml(
    parentName,
  )}</a></div>
<h1>${escapeHtml(detail.question)}</h1>
</div></section>
<main><div class="container qa">
<div class="meta-row"><span class="pill">${escapeHtml(detail.categoryTitle)}</span><span>Updated ${escapeHtml(
    updated,
  )}</span></div>
<div class="answer" data-testid="faq-answer">${answerHtml(detail.answer, detail.answerHtml)}</div>
${pillarHtml}
${relatedHtml}
${servicesHtml}
</div></main>
${ctaStrip}`;

  return renderShell({
    title: `${detail.question.replace(/^\[PLACEHOLDER\]\s*/, "")} | ${SITE}`,
    metaDescription: detail.metaDescription,
    canonical: url,
    jsonLd: [detailGraphJsonLd(detail, url, crumbs)],
    body,
  });
}

// ----- /faq/topics/:slug (FAQPage) -----
export function renderFaqTopic(
  dataset: Dataset,
  slug: string,
  baseUrl: string,
): string | null {
  const topic = dataset.getTopic(slug);
  if (!topic) return null;
  const url = `${baseUrl}/faq/topics/${slug}`;

  const body = `<section class="faq-hero"><div class="container">
<div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/faq">FAQ</a><span>/</span>${escapeHtml(
    topic.title,
  )}</div>
<p class="eyebrow">Topic</p>
<h1>${escapeHtml(topic.title)}</h1>
${topic.description ? `<p>${escapeHtml(topic.description)}</p>` : ""}
</div></section>
<main><div class="container">
<ul class="faq-list">${topic.items.map(questionListItem).join("")}</ul>
</div></main>
${ctaStrip}`;

  return renderShell({
    title: `${topic.title} — FAQ | ${SITE}`,
    metaDescription: topic.metaDescription,
    canonical: url,
    jsonLd: [faqPageJsonLd(topic.items, url)],
    body,
  });
}

// Re-exported for the build-time validator.
export { breadcrumbJsonLd, faqPageJsonLd, qaPageJsonLd };
