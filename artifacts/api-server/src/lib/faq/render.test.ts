import assert from "node:assert/strict";
import test from "node:test";
import { buildDatasetFromSeed, faqSeed } from "@workspace/faq";
import { renderFaqDetail } from "./render";

test("casita FAQ renders every authored related service and town link", () => {
  const dataset = buildDatasetFromSeed(faqSeed);
  const html = renderFaqDetail(
    dataset,
    "do-cave-creek-fountain-hills-and-carefree-allow-casitas-and-adus",
    "https://validate.local",
  );
  assert.ok(html);
  const related = html.match(
    /<aside class="related related-services"[\s\S]*?<\/aside>/,
  )?.[0];
  assert.ok(related, "the related-services section must render");
  for (const href of [
    "/casitas-and-guest-houses",
    "/where-we-build/cave-creek",
    "/where-we-build/fountain-hills",
    "/where-we-build/carefree",
  ]) {
    assert.ok(related.includes(`href="${href}"`), `missing related link: ${href}`);
  }
});
