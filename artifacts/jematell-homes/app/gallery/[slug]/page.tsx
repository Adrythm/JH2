import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pages, type PageData } from "@/data/pages";
import { GALLERY_BY_SLUG } from "@/data/galleryProjects";
import { CRIST_HERO_JPG } from "@/data/crist";
import { gallerySlugs } from "@/lib/routeList";
import { pageMetadata } from "@/seo/metadata";
import { breadcrumbJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import GalleryDetail from "@/views/GalleryDetail";

export const dynamicParams = false;

export function generateStaticParams() {
  return gallerySlugs().map((slug) => ({ slug }));
}

/** The old page's title logic: project title from the gallery list, falling back to the scraped page title without the brand suffix. */
function displayTitle(slug: string, data: PageData): string {
  const rawTitle = data.title.replace(/\s*[—–-]\s*Jematell Homes\s*$/i, "").trim();
  return GALLERY_BY_SLUG[slug]?.title ?? rawTitle;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const path = `/gallery/${slug}`;
  if (slug === "skinner-custom") {
    return pageMetadata({
      title: "Skinner Custom",
      description: "A 2026 custom home in Rio Verde, AZ — captured in 56 professional photographs showing every detail of this signature Jematell Homes build.",
      canonical: path,
      image: CRIST_HERO_JPG,
    });
  }
  const data = pages[`gallery_${slug}`];
  if (!data) return {};
  const title = displayTitle(slug, data);
  return pageMetadata({
    title,
    description: data.description || `${title}: a custom home built by Jematell Homes in Arizona.`,
    canonical: path,
    image: data.ogImage,
  });
}

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const path = `/gallery/${slug}`;

  if (slug === "skinner-custom") {
    return (
      <>
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Gallery", url: "/gallery" },
            { name: "Skinner Custom", url: path },
          ])}
        />
        <GalleryDetail slug="skinner-custom" />
      </>
    );
  }

  const data = pages[`gallery_${slug}`];
  if (!data) notFound();

  const title = displayTitle(slug, data);
  const images = data.blocks
    .filter((b) => b.type === "img" && b.src)
    .map((b) => ({ src: b.src!, alt: b.alt }));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Gallery", url: "/gallery" },
          { name: title, url: path },
        ])}
      />
      <GalleryDetail slug={slug} title={title} ogImage={data.ogImage} images={images} />
    </>
  );
}
