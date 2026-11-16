/**
 * contentPageMeta.ts -- server-safe SEO derivation for every ContentPage route.
 * This extracts exactly what the old src/pages/ContentPage.tsx passed to <Seo>
 * (title / description / canonical / image / noindex) plus its page JSON-LD
 * builder, so the app/ wrappers can emit static metadata and JSON-LD while the
 * client component keeps only the rendering. No JSX in this file.
 */
import { pages, type PageData } from "../data/pages";
import { serviceJsonLd, breadcrumbJsonLd } from "../seo/jsonldBuilders";
import { locations } from "../config/siteConfig";
import { cleanTitle } from "./cleanTitle";

const SERVICE_KEYS = new Set(["custom-homes", "spechomes", "floorplans"]);
const WHERE_NESTED_KEYS = new Set(["build-on-your-lot", "buy-a-lot-with-us"]);

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
    ...(data.ogImage ? { image: data.ogImage } : {}),
    ...(key === "thankyou" ? { noindex: true } : {}),
  };
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
    return [
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
