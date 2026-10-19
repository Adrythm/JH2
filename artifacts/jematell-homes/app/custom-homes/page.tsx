import ContentPage from "@/views/ContentPage";
import { pageMetadata } from "@/seo/metadata";
import { contentPageMeta, contentPageJsonLd } from "@/lib/contentPageMeta";
import { JsonLd } from "@/seo/JsonLd";
import { pages } from "@/data/pages";
import { CustomHomesHub } from "@/views/CustomHomesHub";

export const metadata = pageMetadata(contentPageMeta({ pageKey: "custom-homes" }));

export default function CustomHomes() {
  const jsonLd = contentPageJsonLd({ pageKey: "custom-homes" });
  return (
    <>
      {jsonLd.length ? <JsonLd data={jsonLd} /> : null}
      <ContentPage pageKey="custom-homes" data={pages["custom-homes"]} hubSlot={<CustomHomesHub />} />
    </>
  );
}
