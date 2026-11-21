import { pageMetadata } from "@/seo/metadata";
import { breadcrumbJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import { pages } from "@/data/pages";
import FloorPlan2086 from "@/views/FloorPlan2086";

export const metadata = pageMetadata({
  title: "2086 Floor Plan",
  description:
    "2086 sq ft floor plan: 3 bedrooms plus office, 2 baths, and a 3-car garage. Full drawings, all four elevations, and photos of the completed Desert Retreat home.",
  canonical: "/floor-plans/2086",
  image: "/images/plans/2086-rendering.png",
});

// Finished-home carousel reuses the Desert Retreat gallery photos. Read here
// (server component) so the full `pages` dataset stays out of the client bundle.
const GALLERY = (pages["gallery_desert-retreat"]?.blocks ?? [])
  .filter((b) => b.type === "img" && b.src)
  .slice(0, 12)
  .map((b) => ({ src: b.src!, alt: b.alt || "The completed 2086 Desert Retreat home built by Jematell Homes in Rio Verde, AZ" }));

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Floor Plans", url: "/floor-plans" },
            { name: "2086 Floor Plan", url: "/floor-plans/2086" },
          ]),
        ]}
      />
      <FloorPlan2086 galleryImages={GALLERY} />
    </>
  );
}
