import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { blogs } from "@/data/blogs";
import faqCrossLinks from "@/data/faqCrossLinks.json";
import { blogSlugs } from "@/lib/routeList";
import { pageMetadata } from "@/seo/metadata";
import { articleJsonLd, breadcrumbJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import { BlogPostBody } from "@/views/BlogPostBody";

export const dynamicParams = false;

type Callout = { href: string; kicker: string; title: string; body: string; cta: string };

/**
 * Posts that carry a service's search ranking link up to the service page.
 * The BYOL post ranks 7.9 for "build on your lot arizona" while the service
 * page had 8 impressions; the casita posts held the "guest house builder
 * scottsdale" queries before the casita page existed. The posts keep their
 * content; this adds the way through to the page that converts.
 */
const SERVICE_CALLOUTS: Record<string, Callout> = {
  "building-on-your-own-lot-arizona": {
    href: "/build-on-your-lot",
    kicker: "Build on your lot",
    title: "Ready to build on land you own?",
    body: "Jematell Homes handles site evaluation, permits, budget and financing on private lots across the Phoenix metro and Pinal County. The service page gathers every land, water, permit and financing answer in one place.",
    cta: "See how we build on your lot",
  },
  "guest-house-casita-adu-scottsdale": {
    href: "/casitas-and-guest-houses",
    kicker: "Casitas and guest houses",
    title: "Planning a casita or guest house?",
    body: "What each city allows in 2026, what it costs, and how Jematell Homes builds them, with the rules for Scottsdale, Phoenix, Mesa and the small towns side by side.",
    cta: "See our casita and guest house page",
  },
  "guest-house-amp-adu-essentials-building-casitas-in-phoenix-under-new-laws": {
    href: "/casitas-and-guest-houses",
    kicker: "Casitas and guest houses",
    title: "Planning a casita or guest house?",
    body: "What each city allows in 2026, what it costs, and how Jematell Homes builds them, with the rules for Scottsdale, Phoenix, Mesa and the small towns side by side.",
    cta: "See our casita and guest house page",
  },
  "modern-casita-and-guest-house-design-trends": {
    href: "/casitas-and-guest-houses",
    kicker: "Casitas and guest houses",
    title: "Planning a casita or guest house?",
    body: "What each city allows in 2026, what it costs, and how Jematell Homes builds them, with the rules for Scottsdale, Phoenix, Mesa and the small towns side by side.",
    cta: "See our casita and guest house page",
  },
  "designing-a-custom-rv-garage": {
    href: "/rv-garages",
    kicker: "RV garages",
    title: "Building an RV garage?",
    body: "Door heights by RV class, slab and hookup numbers, 2026 cost and the zoning height cap, plus the RV garage home we built in Rio Verde.",
    cta: "See our RV garage page",
  },
  "why-adding-an-rv-garage-is-a-smart-investment-for-your-arizona-home": {
    href: "/rv-garages",
    kicker: "RV garages",
    title: "Building an RV garage?",
    body: "Door heights by RV class, slab and hookup numbers, 2026 cost and the zoning height cap, plus the RV garage home we built in Rio Verde.",
    cta: "See our RV garage page",
  },
};

/**
 * Every other post gets a topic-matched way through to the page that
 * converts. Until 2026-10 the other 41 posts had no link out of their body
 * at all (the scraped text mentions "our Custom Homes page" as plain words),
 * so a reader who finished an article had nowhere to go but the footer.
 * First matching rule wins; the copy says only what the business does.
 */
const TOPIC_CALLOUTS: { test: RegExp; callout: Callout }[] = [
  {
    test: /rio-verde/,
    callout: {
      href: "/where-we-build/rio-verde",
      kicker: "Rio Verde",
      title: "Building in Rio Verde?",
      body: "See the homes we have built in Rio Verde and the local rules that shape a build there, from county permits and inspections to the lot, water and septic questions to settle before design starts.",
      cta: "See our Rio Verde page",
    },
  },
  {
    test: /spec-home/,
    callout: {
      href: "/spec-homes",
      kicker: "Spec homes",
      title: "Looking at a spec home?",
      body: "See the spec homes Jematell Homes builds in the Phoenix area, with their floor plans, and how a spec home compares with a custom build on your own lot.",
      cta: "See our spec homes",
    },
  },
  {
    test: /financ/,
    callout: {
      href: "/financing",
      kicker: "Financing",
      title: "Planning to finance a new build?",
      body: "How construction financing works when you build with Jematell Homes, and the draw schedule you get at the start, so you know when each payment comes due.",
      cta: "See how financing works with us",
    },
  },
  {
    test: /floor-plan/,
    callout: {
      href: "/floor-plans",
      kicker: "Floor plans",
      title: "Starting from a plan?",
      body: "Browse our in-house floor plans. On our own plans we can quote a flat-rate build cost up front, and any plan can be changed to fit your lot.",
      cta: "Browse our floor plans",
    },
  },
  {
    test: /(^|-)(lot|land|outside-the-city)(-|$)/,
    callout: {
      href: "/build-on-your-lot",
      kicker: "Build on your lot",
      title: "Own a lot, or looking for one?",
      body: "Jematell Homes builds on private lots across the Phoenix metro and Pinal County, and the licensed real estate agents on our staff can help you find the right one.",
      cta: "See how we build on your lot",
    },
  },
  {
    test: /budget|allowance/,
    callout: {
      href: "/custom-homes",
      kicker: "Custom homes",
      title: "Working out a budget for your build?",
      body: "On our cost-plus builds you get an itemized cost estimate before we break ground and see the actual subcontractor bids, so you know what every part of your home costs.",
      cta: "See how we price and run a build",
    },
  },
];

const DEFAULT_CALLOUT: Callout = {
  href: "/custom-homes",
  kicker: "Custom homes",
  title: "Planning a custom home?",
  body: "Jematell Homes is a family-owned custom home builder for Scottsdale and the Phoenix metro: itemized estimates with the actual subcontractor bids on cost-plus builds, a written update every week of construction, and Arizona ROC license 339367.",
  cta: "See how we build custom homes",
};

function calloutFor(slug: string): Callout {
  return SERVICE_CALLOUTS[slug] ?? TOPIC_CALLOUTS.find((t) => t.test.test(slug))?.callout ?? DEFAULT_CALLOUT;
}

/** Same real-post filter the old prerender used (blogSlugs wraps it). */
export function generateStaticParams() {
  return blogSlugs().map((slug) => ({ slug }));
}

function cleanTitle(t: string) {
  return t.replace(/\s*[—–-]\s*Jematell Homes\s*$/i, "").trim();
}

function heroImage(data: (typeof blogs)[string]): string {
  return (
    data.ogImage ||
    data.blocks.find((b) => b.type === "img" && b.src)?.src ||
    ""
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = blogs[slug];
  if (!data) return {};
  const title = cleanTitle(data.title);
  const heroImg = heroImage(data);
  return pageMetadata({
    title,
    description: data.description || `${title}: notes from the Jematell Homes journal.`,
    canonical: `/blog/${slug}`,
    image: heroImg,
    type: "article",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = blogs[slug];
  if (!data) notFound();

  const keys = blogSlugs();
  const idx = keys.indexOf(slug);
  const siblings = {
    prev: idx > 0 ? keys[idx - 1] : null,
    next: idx >= 0 && idx < keys.length - 1 ? keys[idx + 1] : null,
  };

  const relatedFaqs = faqCrossLinks.filter((f) => f.pillarBlogSlug === slug);
  const callout = calloutFor(slug);

  const title = cleanTitle(data.title);
  const heroImg = heroImage(data);
  const bodyBlocks = data.blocks.filter(
    (b) => !(b.type === "img" && b.src === heroImg),
  );

  const path = `/blog/${slug}`;

  return (
    <main className="page blog-post">
      <JsonLd
        data={[
          articleJsonLd({ title, description: data.description, url: path, image: heroImg }),
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Blog", url: "/blog" },
            { name: title, url: path },
          ]),
        ]}
      />
      <section className="blog-post-hero">
        {heroImg ? <img src={heroImg} alt="" className="page-hero-bg" /> : null}
        <div className="page-hero-overlay" />
        <div className="container page-hero-content">
          <Link href="/blog" className="gallery-back" data-testid="blog-back">
            <ArrowLeft size={16} /> All Articles
          </Link>
          <h1 className="blog-post-title hero-title">{title}</h1>
          {data.description ? (
            <p className="page-hero-sub">{data.description}</p>
          ) : null}
        </div>
      </section>

      <section className="section-pad blog-post-body" style={{ background: "var(--color-bg)" }}>
        <div className="container container-narrow">
          <BlogPostBody blocks={bodyBlocks} />
        </div>
      </section>

      {callout ? (
        <section className="section-pad post-service" style={{ background: "var(--color-bg)", paddingTop: 0 }} data-testid="post-service-callout">
          <div className="container container-narrow">
            <Link href={callout.href} className="lib-card" data-testid={`post-service-${slug}`}>
              <span className="lib-card-count">{callout.kicker}</span>
              <h2 className="lib-card-title">{callout.title}</h2>
              <p className="lib-card-desc">{callout.body}</p>
              <span className="lib-card-more">
                {callout.cta} <ArrowRight size={15} />
              </span>
            </Link>
          </div>
        </section>
      ) : null}

      {relatedFaqs.length > 0 ? (
        <section className="section-pad post-faqs" style={{ background: "var(--color-cream, #ece9e2)" }}>
          <div className="container container-narrow">
            <h2 className="post-h2">Related questions</h2>
            <ul className="post-faq-list" data-testid="post-related-faqs">
              {relatedFaqs.map((f) => (
                <li key={f.slug}>
                  <a href={`/faq/${f.slug}`} data-testid={`post-faq-${f.slug}`}>
                    {f.question.replace(/^\[PLACEHOLDER\]\s*/, "")}
                    <ArrowRight size={16} />
                  </a>
                </li>
              ))}
            </ul>
            <a href="/faq" className="post-faq-all" data-testid="post-faq-all">
              See all FAQs <ArrowRight size={14} />
            </a>
          </div>
        </section>
      ) : null}

      <section className="post-nav-strip">
        <div className="container">
          <div className="post-nav-grid">
            {siblings.prev ? (
              <Link href={`/blog/${siblings.prev}`} className="post-nav-link" data-testid="post-prev">
                <span><ArrowLeft size={14} /> Previous</span>
                <strong>{cleanTitle(blogs[siblings.prev]?.title || "")}</strong>
              </Link>
            ) : <span />}
            {siblings.next ? (
              <Link href={`/blog/${siblings.next}`} className="post-nav-link right" data-testid="post-next">
                <span>Next <ArrowRight size={14} /></span>
                <strong>{cleanTitle(blogs[siblings.next]?.title || "")}</strong>
              </Link>
            ) : <span />}
          </div>
        </div>
      </section>
    </main>
  );
}
