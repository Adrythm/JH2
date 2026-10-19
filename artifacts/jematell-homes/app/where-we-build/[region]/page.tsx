import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContentPage from "@/views/ContentPage";
import { pageMetadata } from "@/seo/metadata";
import { contentPageMeta, contentPageJsonLd } from "@/lib/contentPageMeta";
import { JsonLd } from "@/seo/JsonLd";
import { locations } from "@/config/siteConfig";
import { pages } from "@/data/pages";
import { relationsForRegion } from "@/lib/interlink";
import { buildInterlinkSections } from "@/lib/interlink.config";
import { RegionHub } from "@/views/RegionHub";

export const dynamicParams = false;

export function generateStaticParams() {
  // Same source the old prerender used: the canonical locations list
  // (locationHref(slug) === /where-we-build/<slug>).
  return locations.map((loc) => ({ region: loc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}): Promise<Metadata> {
  const { region } = await params;
  return pageMetadata(contentPageMeta({ region }));
}

export default async function RegionPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  if (!pages[region]) notFound();
  const jsonLd = contentPageJsonLd({ region });
  // Resolved here, on the server, so the FAQ and Reference Library datasets
  // stay out of the client bundle; ContentPage only receives plain link items.
  const cityName = locations.find((l) => l.slug === region)?.name ?? region;
  const interlinks = buildInterlinkSections("region", relationsForRegion(region, cityName));
  return (
    <>
      {jsonLd.length ? <JsonLd data={jsonLd} /> : null}
      <ContentPage
        isRegion
        region={region}
        data={pages[region]}
        interlinks={interlinks}
        hubSlot={<RegionHub region={region} cityName={cityName} />}
      />
    </>
  );
}
