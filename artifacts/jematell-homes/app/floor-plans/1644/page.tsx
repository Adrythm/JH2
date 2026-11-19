import { pageMetadata } from "@/seo/metadata";
import { breadcrumbJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import FloorPlan1644 from "@/views/FloorPlan1644";

export const metadata = pageMetadata({
  title: "1644 Floor Plan",
  description: "The Jematell Homes 1644 sq ft floor plan: 3 bed, 2 bath, 2-car garage. See the full drawings, all four elevations and photos of the completed home.",
  canonical: "/floor-plans/1644",
  image: "/images/plans/1644-rendering.png",
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Floor Plans", url: "/floor-plans" },
            { name: "1644 Floor Plan", url: "/floor-plans/1644" },
          ]),
        ]}
      />
      <FloorPlan1644 />
    </>
  );
}
