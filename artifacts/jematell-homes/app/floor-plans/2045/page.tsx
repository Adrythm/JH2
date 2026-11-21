import { pageMetadata } from "@/seo/metadata";
import { breadcrumbJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import FloorPlanDetail from "@/views/FloorPlanDetail";
import { CUSTOM_HOMES_SHOWCASE } from "@/lib/customHomesShowcase";

export const metadata = pageMetadata({
  title: "2045 Floor Plan",
  description:
    "2045 sq ft floor plan: 2 bedrooms, 2.5 baths, a 2.5-car garage, and an RV garage. View the floor plan and all four elevations, and build it on your lot.",
  canonical: "/floor-plans/2045",
  image: "/images/plans/2045-rendering.png",
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Floor Plans", url: "/floor-plans" },
            { name: "2045 Floor Plan", url: "/floor-plans/2045" },
          ]),
        ]}
      />
      <FloorPlanDetail
        planId="2045"
        title="2045 Floor Plan"
        heroSrc="/images/plans/2045-rendering.png"
        heroAlt="Rendered exterior of the 2045 sq ft Jematell Homes floor plan"
        stats={[
          { value: "2,045", label: "Sq Ft" },
          { value: "2", label: "Bedrooms" },
          { value: "2.5", label: "Bathrooms" },
          { value: "2.5-Car + RV", label: "Garage" },
        ]}
        planDesc="A single-level home designed around the toys as much as the family. An open great room, island kitchen, and dining space share one bright footprint that opens to a covered patio, while the owner's suite sits privately at the rear with its own bath and walk-in closet. An attached casita features a second bedroom and a full bath. Plus a guest powder room, round out the living space. The signature feature is the garage: a roomy two-and-a-half-car bay alongside a dedicated, oversized RV garage. This plan can be built without the RV garage."
        drawings={[
          { label: "Floor Plan", src: "/images/plans/2045-1.png", alt: "2045 floor plan layout — 2 bedrooms, 2.5 baths, 2.5-car plus RV garage" },
          { label: "Elevations", src: "/images/plans/2045-2.png", alt: "2045 plan — front, rear, left, and right exterior elevations" },
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
