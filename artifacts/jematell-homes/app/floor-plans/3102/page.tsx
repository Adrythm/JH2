import { pageMetadata } from "@/seo/metadata";
import { breadcrumbJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import FloorPlanDetail from "@/views/FloorPlanDetail";
import { CUSTOM_HOMES_SHOWCASE } from "@/lib/customHomesShowcase";

export const metadata = pageMetadata({
  title: "3132 Floor Plan",
  description:
    "The Jematell Homes 3,132 sq ft floor plan: 4 bedrooms, an office, 3.5 baths, and a 2-car garage. View the floor plan and all four elevations, and build it on your lot.",
  canonical: "/floor-plans/3102",
  image: "/images/plans/3102-rendering.png",
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Floor Plans", url: "/floor-plans" },
            { name: "3132 Floor Plan", url: "/floor-plans/3102" },
          ]),
        ]}
      />
      <FloorPlanDetail
        planId="3102"
        title="3132 Floor Plan"
        heroSrc="/images/plans/3102-rendering.png"
        heroAlt="Rendered exterior of the 3,132 sq ft Jematell Homes floor plan"
        stats={[
          { value: "3,132", label: "Sq Ft" },
          { value: "4", label: "Bedrooms" },
          { value: "3.5", label: "Bathrooms" },
          { value: "1", label: "Den/Office" },
          { value: "2-Car", label: "Garage" },
        ]}
        planDesc="A roomy single-level plan that lives large. A central great room and island kitchen with a breakfast nook open to a deep covered patio, and the owner's suite is tucked privately at the back with a spa bath and an oversized walk-in closet. Three secondary bedrooms and two more baths sit on the opposite wing, with a guest powder room near the entry and a dedicated office up front. A two-car garage and a walk-in pantry keep everyday life organized."
        drawings={[
          { label: "Floor Plan", src: "/images/plans/3102-floor-plan-updated.png", alt: "3132 floor plan layout: 4 bedrooms, office, 3.5 baths, 2-car garage" },
          { label: "Elevations", src: "/images/plans/3102-2.png", alt: "3132 plan: front, rear, left, and right exterior elevations" },
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
