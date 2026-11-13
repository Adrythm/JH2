import { pageMetadata } from "@/seo/metadata";
import { breadcrumbJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import { pages } from "@/data/pages";
import FloorPlan2616 from "@/views/FloorPlan2616";

export const metadata = pageMetadata({
  title: "2616 Floor Plan",
  description:
    "The Jematell Homes 2616 sq ft floor plan: 3 bed, 2.5 bath, 3-car garage, study and gated courtyard, with drawings, elevations and photos of the Cave Creek home.",
  canonical: "/floor-plans/2616",
  image: "/images/plans/2616-rendering.png",
});

// The finished-home carousel reuses the Cave Creek Spec gallery photos. Reading
// them here (server component) keeps the full `pages` dataset out of the client
// bundle — only this small array of URLs crosses the boundary as a prop.
const CAVE_CREEK_GALLERY = (pages["gallery_cave-creek"]?.blocks ?? [])
  .filter((b) => b.type === "img" && b.src)
  .slice(0, 12)
  .map((b) => ({ src: b.src!, alt: b.alt || "The completed 2616 home built by Jematell Homes in Cave Creek, AZ" }));

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Floor Plans", url: "/floor-plans" },
            { name: "2616 Floor Plan", url: "/floor-plans/2616" },
          ]),
        ]}
      />
      <FloorPlan2616 galleryImages={CAVE_CREEK_GALLERY} />
    </>
  );
}
