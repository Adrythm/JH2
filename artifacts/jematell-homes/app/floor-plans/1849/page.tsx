import { pageMetadata } from "@/seo/metadata";
import { breadcrumbJsonLd, floorPlanJsonLd } from "@/seo/jsonldBuilders";
import { FLOOR_PLAN_FACTS } from "@/data/floorPlanFacts";
import { JsonLd } from "@/seo/JsonLd";
import FloorPlan1849 from "@/views/FloorPlan1849";

export const metadata = pageMetadata({
  title: "1849 Floor Plan",
  description: "The Jematell Homes 1849 sq ft floor plan — 3 bed, 2 bath, 2-car garage. View full architectural drawings, all four elevations, and photos of the completed home.",
  canonical: "/floor-plans/1849",
  image: "/images/1849-rendering-v2.png",
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Floor Plans", url: "/floor-plans" },
            { name: "1849 Floor Plan", url: "/floor-plans/1849" },
          ]),
          floorPlanJsonLd(FLOOR_PLAN_FACTS["1849"]),
        ]}
      />
      <FloorPlan1849 />
    </>
  );
}
