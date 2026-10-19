import { pageMetadata } from "@/seo/metadata";
import { breadcrumbJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import { cristImages } from "@/data/crist";
import FloorPlanDetail from "@/views/FloorPlanDetail";

export const metadata = pageMetadata({
  title: "3771 Floor Plan",
  description:
    "The Jematell Homes 3771 sq ft floor plan: 3 bedrooms, a bonus room, a den, 4.5 baths, and a 3-car garage. View the floor plan, all four elevations, and photos of the completed Skinner Custom home.",
  canonical: "/floor-plans/3771",
  image: "/images/plans/3771-rendering.png",
});

const GALLERY = cristImages()
  .slice(0, 12)
  .map((img) => ({ src: img.jpg, alt: img.alt }));

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Floor Plans", url: "/floor-plans" },
            { name: "3771 Floor Plan", url: "/floor-plans/3771" },
          ]),
        ]}
      />
      <FloorPlanDetail
        planId="3771"
        title="3771 Floor Plan"
        heroSrc="/images/plans/3771-rendering.png"
        heroAlt="Rendered exterior of the 3771 sq ft Jematell Homes floor plan"
        stats={[
          { value: "3,771", label: "Sq Ft" },
          { value: "3", label: "Bedrooms" },
          { value: "4.5", label: "Bathrooms" },
          { value: "1", label: "Bonus Room" },
          { value: "3-Car", label: "Garage" },
        ]}
        planDesc="A refined single-level home wrapped around a vaulted great room, chef's kitchen, and dining space that open to a covered patio and pool. The owner's suite anchors one wing with a spa bath and a walk-in closet, while a private bonus room and a separate den give the home flexible space for a media room, gym, or home office. Two more en-suite bedrooms, a guest powder room, and a poolside bath serve family and visitors, and a three-car garage completes the plan."
        drawings={[
          { label: "Floor Plan", src: "/images/plans/3771-1.png", alt: "3771 floor plan layout — 3 bedrooms, bonus room, den, 4.5 baths, 3-car garage" },
          { label: "Elevations", src: "/images/plans/3771-2.png", alt: "3771 plan — front, rear, left, and right exterior elevations" },
        ]}
        gallery={{
          heading: "See the Finished Home",
          subtext: "The 3771 floor plan, built as our Skinner Custom home in Surprise, AZ.",
          images: GALLERY,
          linkHref: "/gallery/skinner-custom",
          linkLabel: "View Full Gallery",
        }}
      />
    </>
  );
}
