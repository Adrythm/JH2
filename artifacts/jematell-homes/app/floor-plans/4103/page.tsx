import { pageMetadata } from "@/seo/metadata";
import { breadcrumbJsonLd, floorPlanJsonLd } from "@/seo/jsonldBuilders";
import { FLOOR_PLAN_FACTS } from "@/data/floorPlanFacts";
import { JsonLd } from "@/seo/JsonLd";
import FloorPlanDetail from "@/views/FloorPlanDetail";
import { CUSTOM_HOMES_SHOWCASE } from "@/lib/customHomesShowcase";

export const metadata = pageMetadata({
  title: "4103 Floor Plan",
  description:
    "4103 sq ft floor plan: 3 bedrooms, a bonus room, a den, 4.5 baths, and a 4-car garage. View the floor plan and all four elevations, and build it on your lot.",
  canonical: "/floor-plans/4103",
  image: "/images/plans/4103-rendering.png",
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Floor Plans", url: "/floor-plans" },
            { name: "4103 Floor Plan", url: "/floor-plans/4103" },
          ]),
          floorPlanJsonLd(FLOOR_PLAN_FACTS["4103"]),
        ]}
      />
      <FloorPlanDetail
        planId="4103"
        title="4103 Floor Plan"
        heroSrc="/images/plans/4103-rendering.png"
        heroAlt="Rendered exterior of the 4103 sq ft Jematell Homes floor plan"
        stats={[
          { value: "4,103", label: "Sq Ft" },
          { value: "3", label: "Bedrooms" },
          { value: "4.5", label: "Bathrooms" },
          { value: "1", label: "Bonus Room" },
          { value: "1", label: "Den/Office" },
          { value: "4-Car", label: "Garage" },
        ]}
        planDesc="Our largest single-level plan is built for luxury and gathering. A soaring great room and gourmet kitchen with a walk-in pantry and wine room open to a covered patio and pool, served by a dedicated pool bath. The owner's suite is a private retreat with a spa bath and oversized closet, and a separate bonus room and den add flexible space for a theater, gym, or office. Two more en-suite bedrooms, a guest powder room, and two large garage bays complete a home with room for everything."
        drawings={[
          { label: "Floor Plan", src: "/images/plans/4103-1.png", alt: "4103 floor plan layout — 3 bedrooms, bonus room, den, 4.5 baths, 4-car garage" },
          { label: "Elevations", src: "/images/plans/4103-2.png", alt: "4103 plan — front, rear, left, and right exterior elevations" },
        ]}
        gallery={{
          heading: "Custom Homes We've Built",
          subtext: "A look at some of the custom homes we've built for families across the Valley.",
          images: CUSTOM_HOMES_SHOWCASE,
          linkHref: "/gallery",
          linkLabel: "View Full Gallery",
        }}
      />
    </>
  );
}
