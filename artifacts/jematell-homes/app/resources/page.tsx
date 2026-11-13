import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { pageMetadata } from "@/seo/metadata";
import { JsonLd } from "@/seo/JsonLd";
import { CTA } from "@/cta";
import { faqDataset } from "@/data/faq";
import { guides } from "@/data/guides";
import { glossaryTerms } from "@/data/glossary";
import { referenceEntries } from "@/data/reference";

const META_DESCRIPTION =
  "Arizona custom home resources from Jematell Homes: typical cost ranges, the code each city enforces, raw lot prep, permits and financing, kept current.";
const INTRO =
  "Everything we have learned building custom homes across Scottsdale, Rio Verde, and the Phoenix metro, written down and kept current. Real cost ranges, the code edition each city actually enforces, what it takes to make a raw lot buildable, and the answers most builders leave you to find on your own.";

export const metadata = pageMetadata({
  title: "Resources",
  description: META_DESCRIPTION,
  canonical: "/resources",
});

interface ResourceSection {
  title: string;
  count: string;
  description: string;
  href: string;
  cls: string;
  featured?: boolean;
}

/**
 * Derive the card counts from the datasets rather than hardcoding them. These
 * were written as literals ("82 terms", "166 references") and silently went
 * stale the moment content shipped: the glossary was at 105 and the reference
 * library at 245 while this page still advertised the old numbers.
 */
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

const SECTIONS: ResourceSection[] = [
  {
    title: "FAQ",
    count: plural(faqDataset.all().length, "answer"),
    description:
      "Straight answers to the questions people actually ask before they build: timelines, budgets, lots, permits, water, design, and what it is like to work with a family-owned builder.",
    href: "/faq",
    cls: "resource-card--featured",
    featured: true,
  },
  {
    title: "Guides",
    count: plural(guides.length, "guide"),
    description:
      "Long-read pillars that walk the whole journey end to end, plus a complete guide for every city we build in.",
    href: "/guides",
    cls: "resource-card--a",
  },
  {
    title: "Glossary",
    count: plural(glossaryTerms.length, "term"),
    description:
      "Plain-English definitions for the terms that come up on a custom build, each with the sources behind it.",
    href: "/glossary",
    cls: "resource-card--b",
  },
  {
    title: "Reference Library",
    count: plural(referenceEntries.length, "reference"),
    description:
      "The source material in plain language: adopted city building codes, Arizona statutes, the residential code, and community design guidelines.",
    href: "/reference-library",
    cls: "resource-card--c",
  },
  {
    title: "Blog",
    count: "The journal",
    description:
      "Project stories, updates, and a closer look at the custom homes we are building across Arizona.",
    href: "/blog",
    cls: "resource-card--d",
  },
];

export default function Resources() {
  return (
    <main className="page resources-page">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Resources",
          description: INTRO,
        }}
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
          <h1 className="page-hero-title hero-title" style={{ textTransform: "uppercase", fontSize: "clamp(28px, 3.6vw, 54px)", whiteSpace: "nowrap", width: "100vw", marginLeft: "calc(-50vw + 50%)" }}>
            Everything you need to build with confidence
          </h1>
        </div>
      </section>

      <section className="resources-hub section-pad">
        <div className="container">
          <span className="eyebrow" style={{ display: "block", marginBottom: "clamp(20px, 3vw, 32px)", fontSize: "20px" }}>Explore the library</span>
          <div className="resources-grid" data-testid="resources-grid">
            {SECTIONS.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className={`resource-card ${s.cls}`}
                data-testid={`resource-${s.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {s.featured ? (
                  <ResponsiveImage
                    name="custom-home"
                    className="resource-card-bg"
                    alt=""
                    widths={[768, 1280, 1600]}
                    sizes="(min-width: 900px) 34vw, 100vw"
                    width={1600}
                    height={1066}
                  />
                ) : null}
                <span className="resource-card-count">{s.count}</span>
                <div>
                  {/* h2: directly under the page h1 — h3 skipped a level. */}
                  <h2 className="resource-card-title">{s.title}</h2>
                  <p className="resource-card-desc">{s.description}</p>
                  <span className="resource-card-more">
                    Browse <ArrowRight size={15} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </main>
  );
}
