import { pageMetadata } from "@/seo/metadata";
import { breadcrumbJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import { pages } from "@/data/pages";
import FloorPlanDetail from "@/views/FloorPlanDetail";

export const metadata = pageMetadata({
  title: "3610 Floor Plan",
  description:
    "The Jematell Homes 3610 sq ft floor plan: 4 bedrooms, a study, 3.5 baths and a 4-car garage with a shop, plus elevations and photos of the Rio Verde Farmhouse.",
  canonical: "/floor-plans/3610",
  image: "/images/plans/3610-rendering.png",
});

const GALLERY = (pages["gallery_rio-verde-farmhouse"]?.blocks ?? [])
  .filter((b) => b.type === "img" && b.src)
  .slice(0, 12)
  .map((b) => ({ src: b.src!, alt: b.alt || "The completed Rio Verde Farmhouse built by Jematell Homes" }));

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Floor Plans", url: "/floor-plans" },
            { name: "3610 Floor Plan", url: "/floor-plans/3610" },
          ]),
        ]}
      />
      <FloorPlanDetail
        planId="3610"
        title="3610 Floor Plan"
        heroSrc="/images/plans/3610-rendering.png"
        heroAlt="Rendered exterior of the 3610 sq ft Jematell Homes floor plan"
        stats={[
          { value: "3,610", label: "Sq Ft" },
          { value: "4", label: "Bedrooms" },
          { value: "3", label: "Bathrooms" },
          { value: "1", label: "Den/Office" },
          { value: "4-Car", label: "Garage" },
        ]}
        planDesc="A sprawling single-level farmhouse made for room to roam. The great room opens through a wall of glass to a covered patio, and a separate game room gives the family a second place to gather. The owner's suite has its own private patio, spa bath, and enormous closet, while three more bedrooms sit on their own wing. Beyond the four-car garage, the plan adds a dedicated shop and a detached out building, so there is space for every vehicle, project, and hobby."
        drawings={[
          { label: "Floor Plan", src: "/images/plans/3610-1.png", alt: "3610 floor plan layout — 4 bedrooms, study, 3.5 baths, 4-car garage with shop" },
          { label: "Elevations", src: "/images/plans/3610-2.png", alt: "3610 plan — front, rear, left, and right exterior elevations" },
        ]}
        gallery={{
          heading: "See the Finished Home",
          subtext: "The 3610 floor plan, built as our Rio Verde Farmhouse.",
          images: GALLERY,
          linkHref: "/gallery/rio-verde-farmhouse",
          linkLabel: "View Full Gallery",
        }}
      />
    </>
  );
}
