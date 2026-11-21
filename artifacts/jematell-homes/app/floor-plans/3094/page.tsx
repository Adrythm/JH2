import { pageMetadata } from "@/seo/metadata";
import { breadcrumbJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import FloorPlanDetail from "@/views/FloorPlanDetail";
import { CUSTOM_HOMES_SHOWCASE } from "@/lib/customHomesShowcase";

export const metadata = pageMetadata({
  title: "3094 Floor Plan",
  description:
    "3094 sq ft floor plan: 3 bedrooms, a study, 3 baths, and a 4-car garage. View the floor plan and all four elevations, and build it on your lot.",
  canonical: "/floor-plans/3094",
  image: "/images/plans/3094-rendering.png",
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Floor Plans", url: "/floor-plans" },
            { name: "3094 Floor Plan", url: "/floor-plans/3094" },
          ]),
        ]}
      />
      <FloorPlanDetail
        planId="3094"
        title="3094 Floor Plan"
        heroSrc="/images/plans/3094-rendering.png"
        heroAlt="Rendered exterior of the 3094 sq ft Jematell Homes floor plan"
        stats={[
          { value: "3,094", label: "Sq Ft" },
          { value: "3", label: "Bedrooms" },
          { value: "3", label: "Bathrooms" },
          { value: "1", label: "Den/Office" },
          { value: "4-Car", label: "Garage" },
        ]}
        planDesc="A single-level home built for space and privacy. The great room, island kitchen, and dining area open to a generous covered patio, while the owner's suite is set apart with a spa bath and his-and-hers walk-in closets. Two more bedrooms and two full baths anchor the far wing, and a dedicated study off the entry works as an office or den. Two separate two-car garages give you a full four bays for vehicles, storage, or a workshop."
        drawings={[
          { label: "Floor Plan", src: "/images/plans/3094-1.png", alt: "3094 floor plan layout — 3 bedrooms, study, 3 baths, 4-car garage" },
          { label: "Elevations", src: "/images/plans/3094-2.png", alt: "3094 plan — front, rear, left, and right exterior elevations" },
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
