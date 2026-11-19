import ContentPage from "@/views/ContentPage";
import { pageMetadata } from "@/seo/metadata";
import { contentPageMeta, contentPageJsonLd } from "@/lib/contentPageMeta";
import { JsonLd } from "@/seo/JsonLd";
import { pages } from "@/data/pages";
import { FloorPlansHub, FLOOR_PLAN_FAQ } from "@/views/FloorPlansHub";
import { faqPageJsonLd } from "@/seo/jsonldBuilders";

export const metadata = pageMetadata(contentPageMeta({ pageKey: "floorplans" }));

export default function FloorPlans() {
  const jsonLd = [
    ...contentPageJsonLd({ pageKey: "floorplans" }),
    faqPageJsonLd({ url: "/floor-plans", items: FLOOR_PLAN_FAQ.map((f) => ({ question: f.question, shortAnswer: f.answer })) }),
  ];
  return (
    <>
      {jsonLd.length ? <JsonLd data={jsonLd} /> : null}
      <ContentPage pageKey="floorplans" data={pages["floorplans"]} hubSlot={<FloorPlansHub />} />
    </>
  );
}
