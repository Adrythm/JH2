/**
 * contentPageMeta.ts -- server-safe SEO derivation for every ContentPage route.
 * This extracts exactly what the old src/pages/ContentPage.tsx passed to <Seo>
 * (title / description / canonical / image / noindex) plus its page JSON-LD
 * builder, so the app/ wrappers can emit static metadata and JSON-LD while the
 * client component keeps only the rendering. No JSX in this file.
 */
import { pages, type PageData } from "../data/pages";
import { serviceJsonLd, breadcrumbJsonLd, collectionJsonLd, faqPageJsonLd } from "../seo/jsonldBuilders";
import { absoluteUrl } from "../seo/siteMeta";
import { locations } from "../config/siteConfig";
import { cleanTitle } from "./cleanTitle";
import ogJpg from "../data/ogJpg.json";

/**
 * Every pages.json ogImage is a WebP, and Google Business Profile posts (and
 * some link previews) take JPG or PNG only. src/data/ogJpg.json maps a WebP
 * hero to a JPG copy of the same photo under public/images/og/, so the share
 * image (og:image, twitter:image) is one they accept. The visible hero and the
 * JSON-LD keep the WebP. A page whose hero has no JPG copy keeps its WebP.
 */
const OG_JPG: Record<string, string> = ogJpg;
export function shareImage(src: string | undefined): string | undefined {
  return src ? OG_JPG[src] ?? src : src;
}

const SERVICE_KEYS = new Set(["custom-homes", "spechomes", "floorplans"]);
const WHERE_NESTED_KEYS = new Set(["build-on-your-lot", "buy-a-lot-with-us"]);
/**
 * Top-level pages whose child pages already name them as the parent crumb
 * (the floor plans name "Floor Plans" at /floor-plans). These pages carried
 * no BreadcrumbList of their own, so the trail stopped one level short.
 */
const TOP_LEVEL_CRUMBS: Record<string, string> = {
  "custom-homes": "Custom Homes",
  spechomes: "Spec Homes",
  floorplans: "Floor Plans",
  warranty: "Warranty",
};

/**
 * pageKey -> route path, mirroring the old AppShell route table. The old page
 * passed canonical={location.pathname}; statically that is the route the key
 * was mounted at.
 */
const KEY_TO_PATH: Record<string, string> = {
  "custom-homes": "/custom-homes",
  spechomes: "/spec-homes",
  floorplans: "/floor-plans",
  "where-we-build": "/where-we-build",
  "build-on-your-lot": "/build-on-your-lot",
  "buy-a-lot-with-us": "/buy-a-lot-with-us",
  aboutus: "/about",
  warranty: "/warranty",
  privacypolicy: "/privacy",
  thankyou: "/thank-you",
};

export interface ContentPageMetaOpts {
  /** Scraped-page key, e.g. "custom-homes", "aboutus". */
  pageKey?: string;
  /** Region slug under /where-we-build/, e.g. "scottsdale". Wins over pageKey. */
  region?: string;
}

function resolve(opts: ContentPageMetaOpts): {
  key: string;
  path: string;
  data: PageData | undefined;
} {
  const key = opts.region || opts.pageKey || "";
  const path = opts.region
    ? `/where-we-build/${opts.region}`
    : KEY_TO_PATH[key] || `/${key}`;
  return { key, path, data: pages[key] };
}

export interface ContentPageMetaResult {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  noindex?: boolean;
}

/**
 * The exact <Seo> props the old ContentPage computed:
 *   title={cleanTitle(data.title)} description={data.description}
 *   canonical={location.pathname} image={data.ogImage}
 *   noindex={key === "thankyou"}
 * Feed the result straight into pageMetadata().
 */
export function contentPageMeta(opts: ContentPageMetaOpts): ContentPageMetaResult {
  const { key, path, data } = resolve(opts);
  if (!data) {
    // Old behavior: an unknown key rendered <NotFound/> whose Seo was
    // <Seo title="Page Not Found" noindex />. Wrappers guard with notFound()
    // before this can matter; kept for parity.
    return { title: "Page Not Found", description: "", canonical: path, noindex: true };
  }
  return {
    title: data.seoTitle ?? cleanTitle(data.title),
    description: data.seoDescription ?? data.description,
    canonical: path,
    ...(data.ogImage ? { image: shareImage(data.ogImage) } : {}),
    ...(key === "thankyou" ? { noindex: true } : {}),
  };
}

/**
 * A town page's local guide cards whose heading is a question (it ends in "?")
 * are the questions the page answers on screen, so they also go out as
 * FAQPage markup: the card heading as the question, its paragraphs as the
 * answer. Pages with no question cards emit nothing new.
 */
function regionQuestions(data: PageData): Array<{ question: string; shortAnswer: string }> {
  const out: Array<{ question: string; shortAnswer: string }> = [];
  let current: { question: string; paras: string[] } | null = null;
  const flush = () => {
    if (current && current.paras.length) out.push({ question: current.question, shortAnswer: current.paras.join(" ") });
    current = null;
  };
  for (const b of data.blocks) {
    if (b.type === "h3" && b.text) {
      flush();
      if (b.text.trim().endsWith("?")) current = { question: b.text.trim(), paras: [] };
    } else if (b.type === "p" && b.text && current) {
      current.paras.push(b.text);
    } else if (b.type === "h1" || b.type === "h2") {
      flush();
    }
  }
  flush();
  return out;
}

/**
 * Ported verbatim from the old ContentPage buildPageJsonLd(). Returns [] for
 * keys that had no page-specific JSON-LD; wrappers render <JsonLd> only when
 * the array is non-empty (the old Seo received jsonLd={undefined} then).
 */
export function contentPageJsonLd(opts: ContentPageMetaOpts): object[] {
  const { key, path, data } = resolve(opts);
  if (!data) return [];
  const pageTitle = cleanTitle(data.title);
  if (opts.region) {
    // These are the highest-intent pages on the site, and they used to carry a
    // breadcrumb and nothing else. Service with a City areaServed states the
    // obvious thing a search engine cannot otherwise infer: this company builds
    // custom homes in this specific place.
    const cityName = locations.find((l) => l.slug === opts.region)?.name ?? pageTitle;
    const questions = regionQuestions(data);
    return [
      ...(questions.length >= 2 ? [faqPageJsonLd({ url: path, items: questions })] : []),
      serviceJsonLd({
        name: `Custom Home Building in ${cityName}, Arizona`,
        description: data.description,
        url: path,
        ...(data.ogImage ? { image: data.ogImage } : {}),
        areaServedCity: cityName,
      }),
      breadcrumbJsonLd([
        { name: "Home", url: "/" },
        { name: "Where We Build", url: "/where-we-build" },
        { name: pageTitle, url: path },
      ]),
    ];
  }
  if (SERVICE_KEYS.has(key)) {
    return [
      serviceJsonLd({
        name: pageTitle,
        description: data.description,
        url: path,
        image: data.ogImage,
      }),
      breadcrumbJsonLd([
        { name: "Home", url: "/" },
        { name: TOP_LEVEL_CRUMBS[key] ?? pageTitle, url: path },
      ]),
    ];
  }
  if (key === "where-we-build") {
    // The hub is the parent of every town page, and it used to carry no
    // page JSON-LD at all. A CollectionPage whose mainEntity lists the town
    // pages (and the breadcrumb the town pages already point back to) says
    // in markup what the page shows: these are the places we build.
    const towns = locations.filter((l) => pages[l.slug]);
    return [
      {
        ...collectionJsonLd({ name: pageTitle, description: data.description, url: path }),
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: towns.length,
          itemListElement: towns.map((l, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: cleanTitle(pages[l.slug]!.title),
            url: absoluteUrl(`/where-we-build/${l.slug}`),
          })),
        },
      },
      breadcrumbJsonLd([
        { name: "Home", url: "/" },
        { name: "Where We Build", url: path },
      ]),
    ];
  }
  if (key === "warranty") {
    return [
      breadcrumbJsonLd([
        { name: "Home", url: "/" },
        { name: TOP_LEVEL_CRUMBS[key], url: path },
      ]),
    ];
  }
  if (WHERE_NESTED_KEYS.has(key)) {
    return [
      breadcrumbJsonLd([
        { name: "Home", url: "/" },
        { name: "Where We Build", url: "/where-we-build" },
        { name: pageTitle, url: path },
      ]),
    ];
  }
  return [];
}
