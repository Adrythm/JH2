import { pageMetadata } from "@/seo/metadata";
import { breadcrumbJsonLd, floorPlanJsonLd } from "@/seo/jsonldBuilders";
import { FLOOR_PLAN_FACTS } from "@/data/floorPlanFacts";
import { JsonLd } from "@/seo/JsonLd";
import FloorPlanDetail from "@/views/FloorPlanDetail";
import { CUSTOM_HOMES_SHOWCASE } from "@/lib/customHomesShowcase";

export const metadata = pageMetadata({
  title: "2867 Floor Plan",
  description:
    "2867 sq ft floor plan: 3 bedrooms, a study, 2.5 baths, a 3-car garage, and a detached casita. View the plan and all four elevations, and build it on your lot.",
  canonical: "/floor-plans/2867",
  image: "/images/plans/2867-rendering.png",
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Floor Plans", url: "/floor-plans" },
            { name: "2867 Floor Plan", url: "/floor-plans/2867" },
          ]),
          floorPlanJsonLd(FLOOR_PLAN_FACTS["2867"]),
        ]}
      />
      <FloorPlanDetail
        planId="2867"
        title="2867 Floor Plan"
        heroSrc="/images/plans/2867-rendering.png"
        heroAlt="Rendered exterior of the 2867 sq ft Jematell Homes floor plan"
        stats={[
          { value: "2,867", label: "Sq Ft" },
          { value: "3", label: "Bedrooms" },
          { value: "2.5", label: "Bathrooms" },
          { value: "3-Car", label: "Garage" },
        ]}
        planDesc="A single-level home built for comfortable, open living. The great room, island kitchen, and dining space flow to a covered patio, with the owner's suite tucked privately at the rear beside a spa bath and oversized closet. Two more bedrooms, a full bath, a guest powder room, and a dedicated study round out the plan, all served by a three-car garage."
        drawings={[
          { label: "Floor Plan", src: "/images/plans/2867-1.png", alt: "2867 main-home floor plan layout — 3 bedrooms, study, 2.5 baths, 3-car garage" },
          { label: "Elevations", src: "/images/plans/2867-2.png", alt: "2867 plan — front, rear, left, and right exterior elevations of the main home" },
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
