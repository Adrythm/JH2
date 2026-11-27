/**
 * jsonld.ts — builders for page-specific JSON-LD. These are added per page on top
 * of the site-wide graph (see siteMeta.buildSiteJsonLd). Never emit a @type here
 * that the site-wide graph already emits (Organization/GeneralContractor/WebSite).
 */
import { SITE_URL, absoluteUrl } from "./siteMeta";

export function serviceJsonLd(opts: {
  name: string;
  description?: string;
  url: string;
  image?: string;
  /** A single city, for location pages. Defaults to statewide. */
  areaServedCity?: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    serviceType: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    url: absoluteUrl(opts.url),
    ...(opts.image ? { image: absoluteUrl(opts.image) } : {}),
    provider: { "@id": SITE_URL + "/#business" },
    areaServed: opts.areaServedCity
      ? {
          "@type": "City",
          name: opts.areaServedCity,
          containedInPlace: { "@type": "State", name: "Arizona" },
        }
      : { "@type": "State", name: "Arizona" },
  };
}

export function articleJsonLd(opts: {
  title: string;
  description?: string;
  url: string;
  image?: string;
  dateModified?: string;
  datePublished?: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.title,
    ...(opts.description ? { description: opts.description } : {}),
    ...(opts.image ? { image: absoluteUrl(opts.image) } : {}),
    url: absoluteUrl(opts.url),
    mainEntityOfPage: absoluteUrl(opts.url),
    author: { "@id": SITE_URL + "/#organization" },
    publisher: { "@id": SITE_URL + "/#organization" },
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.url),
    })),
  };
}

export function faqPageJsonLd(opts: {
  url: string;
  items: Array<{ question: string; shortAnswer: string }>;
}): object {
  const pageUrl = absoluteUrl(opts.url);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": pageUrl + "#faqpage",
    url: pageUrl,
    mainEntity: opts.items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.shortAnswer },
    })),
  };
}

/**
 * A page that asks and answers exactly one question, which is what every
 * /faq/<slug> page is.
 *
 * QAPage rather than FAQPage on purpose. Since Google restricted FAQ rich
 * results to authoritative government and health sites in August 2023, FAQPage
 * markup on a site like this earns nothing and is not reported in Search
 * Console at all. QAPage still has a live enhancement report, and the shape
 * fits: one question, one authoritative answer, credited to the company.
 *
 * Use this only where the page genuinely is a single question with its answer.
 * A page listing several questions is an FAQPage; see faqPageJsonLd.
 */
export function qaPageJsonLd(opts: {
  url: string;
  question: string;
  answer: string;
  /** ISO date the answer was last reviewed, when the content carries one. */
  dateModified?: string;
  datePublished?: string;
  /** Subject area, e.g. the FAQ category, for entity context. */
  topic?: string;
}): object {
  const pageUrl = absoluteUrl(opts.url);
  const dates = {
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
  };
  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    "@id": pageUrl + "#qapage",
    url: pageUrl,
    name: opts.question,
    inLanguage: "en-US",
    publisher: { "@id": SITE_URL + "/#organization" },
    ...dates,
    ...(opts.topic ? { about: { "@type": "Thing", name: opts.topic } } : {}),
    mainEntity: {
      "@type": "Question",
      "@id": pageUrl + "#question",
      name: opts.question,
      text: opts.question,
      inLanguage: "en-US",
      answerCount: 1,
      author: { "@id": SITE_URL + "/#organization" },
      ...(opts.datePublished ? { dateCreated: opts.datePublished } : {}),
      acceptedAnswer: {
        "@type": "Answer",
        "@id": pageUrl + "#answer",
        text: opts.answer,
        // Points at the page rather than a #answer fragment, which the page
        // does not render as an anchor.
        url: pageUrl,
        inLanguage: "en-US",
        author: { "@id": SITE_URL + "/#organization" },
        ...dates,
      },
    },
  };
}

export function collectionJsonLd(opts: {
  name: string;
  description?: string;
  url: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    url: absoluteUrl(opts.url),
    isPartOf: { "@id": SITE_URL + "/#website" },
  };
}

export function definedTermJsonLd(opts: {
  term: string;
  definition: string;
  url: string;
  termSetName?: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: opts.term,
    description: opts.definition,
    url: absoluteUrl(opts.url),
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: opts.termSetName ?? "Custom Home Building Glossary",
      url: absoluteUrl("/glossary"),
    },
  };
}

export function definedTermSetJsonLd(opts: {
  name: string;
  description?: string;
  url: string;
  terms: Array<{ term: string; url: string }>;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    url: absoluteUrl(opts.url),
    hasDefinedTerm: opts.terms.map((t) => ({
      "@type": "DefinedTerm",
      name: t.term,
      url: absoluteUrl(t.url),
    })),
  };
}

/**
 * A tool that lives on the site, such as the construction loan calculator.
 * `apiUrlTemplate` advertises the machine-readable equivalent of the tool as a
 * potentialAction, so an agent reading the page can find the JSON endpoint
 * without guessing.
 */
export function webApplicationJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  featureList?: string[];
  apiUrlTemplate?: string;
  apiActionName?: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": absoluteUrl(opts.url) + "#calculator",
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.url),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    provider: { "@id": SITE_URL + "/#organization" },
    ...(opts.featureList ? { featureList: opts.featureList } : {}),
    ...(opts.apiUrlTemplate
      ? {
          potentialAction: {
            "@type": "Action",
            name: opts.apiActionName ?? opts.name,
            target: {
              "@type": "EntryPoint",
              urlTemplate: opts.apiUrlTemplate,
              httpMethod: "GET",
              contentType: "application/json",
            },
          },
        }
      : {}),
  };
}

export function techArticleJsonLd(opts: {
  title: string;
  description?: string;
  url: string;
  section?: string;
  dateModified?: string;
  datePublished?: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: opts.title,
    ...(opts.description ? { description: opts.description } : {}),
    ...(opts.section ? { articleSection: opts.section } : {}),
    url: absoluteUrl(opts.url),
    mainEntityOfPage: absoluteUrl(opts.url),
    author: { "@id": SITE_URL + "/#organization" },
    publisher: { "@id": SITE_URL + "/#organization" },
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
  };
}

/**
 * A floor plan detail page's subject: the plan's size, bedrooms, bathrooms,
 * drawing and rendering, from the figures its stat bar shows
 * (src/data/floorPlanFacts.ts). A figure left null there is left out here.
 */
export function floorPlanJsonLd(plan: {
  planId: string;
  name: string;
  sqft: number;
  bedrooms: number;
  fullBathrooms: number | null;
  halfBathrooms: number | null;
  layoutImage: string;
  image: string;
}): object {
  const url = absoluteUrl(`/floor-plans/${plan.planId}`);
  const baths =
    plan.fullBathrooms !== null && plan.halfBathrooms !== null
      ? {
          numberOfBathroomsTotal: plan.fullBathrooms + plan.halfBathrooms,
          numberOfFullBathrooms: plan.fullBathrooms,
          numberOfPartialBathrooms: plan.halfBathrooms,
        }
      : {};
  return {
    "@context": "https://schema.org",
    "@type": "FloorPlan",
    "@id": url + "#floorplan",
    name: plan.name,
    url,
    floorSize: { "@type": "QuantitativeValue", value: plan.sqft, unitCode: "FTK", unitText: "sq ft" },
    numberOfBedrooms: plan.bedrooms,
    ...baths,
    layoutImage: absoluteUrl(plan.layoutImage),
    image: absoluteUrl(plan.image),
  };
}
