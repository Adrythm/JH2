import { pageMetadata } from "@/seo/metadata";
import { breadcrumbJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import { pages } from "@/data/pages";
import FloorPlan2194 from "@/views/FloorPlan2194";

export const metadata = pageMetadata({
  title: "2194 Floor Plan",
  description:
    "2194 sq ft floor plan: 3 bedrooms plus office, 2 baths, a 2-car garage and an RV garage. Full drawings, four elevations, and photos of the Rio Verde RV home.",
  canonical: "/floor-plans/2194",
  image: "/images/plans/2194-rendering.png",
});

// Finished-home carousel reuses the Rio Verde RV gallery photos. Read here
// (server component) so the full `pages` dataset stays out of the client bundle.
const GALLERY = (pages["gallery_rio-verde-rv"]?.blocks ?? [])
  .filter((b) => b.type === "img" && b.src)
  .slice(0, 12)
  .map((b) => ({ src: b.src!, alt: b.alt || "The completed 2194 Rio Verde RV home built by Jematell Homes in Rio Verde, AZ" }));

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Floor Plans", url: "/floor-plans" },
            { name: "2194 Floor Plan", url: "/floor-plans/2194" },
          ]),
        ]}
      />
      <FloorPlan2194 galleryImages={GALLERY} />
    </>
  );
}
