import { pageMetadata } from "@/seo/metadata";
import { breadcrumbJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import FloorPlanDetail from "@/views/FloorPlanDetail";
import { CUSTOM_HOMES_SHOWCASE } from "@/lib/customHomesShowcase";

export const metadata = pageMetadata({
  title: "3970 Floor Plan",
  description:
    "3970 sq ft floor plan: 4 bedrooms, a study, 4.5 baths, and a 3-car garage. View the floor plan and all four elevations, and build it on your lot.",
  canonical: "/floor-plans/3970",
  image: "/images/plans/3970-rendering.png",
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Floor Plans", url: "/floor-plans" },
            { name: "3970 Floor Plan", url: "/floor-plans/3970" },
          ]),
        ]}
      />
      <FloorPlanDetail
        planId="3970"
        title="3970 Floor Plan"
        heroSrc="/images/plans/3970-rendering.png"
        heroAlt="Rendered exterior of the 3970 sq ft Jematell Homes floor plan"
        stats={[
          { value: "3,970", label: "Sq Ft" },
          { value: "4", label: "Bedrooms" },
          { value: "4.5", label: "Bathrooms" },
          { value: "1", label: "Den/Office" },
          { value: "3-Car", label: "Garage" },
        ]}
        planDesc="A grand single-level home designed for entertaining. A vaulted great room and island kitchen flow into both a breakfast nook and a formal dining room, with a bright morning room and dual covered patios extending the living space outdoors. The owner's suite enjoys a spa bath and his-and-hers closets, three more bedrooms each sit near a bath, and a dedicated study, mud room, and walk-in pantry keep the household running. A split three-car garage rounds out the plan."
        drawings={[
          { label: "Floor Plan", src: "/images/plans/3970-1.png", alt: "3970 floor plan layout — 4 bedrooms, study, 4.5 baths, 3-car garage" },
          { label: "Elevations", src: "/images/plans/3970-2.png", alt: "3970 plan — front, rear, left, and right exterior elevations" },
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
