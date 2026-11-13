import { glossaryTerms, glossaryByLetter } from "@/data/glossary";
import { pageMetadata } from "@/seo/metadata";
import { definedTermSetJsonLd } from "@/seo/jsonldBuilders";
import { JsonLd } from "@/seo/JsonLd";
import { CTA } from "@/cta";
import {
  GlossaryIndexClient,
  type GlossaryLetterGroup,
  type GlossaryTermLite,
} from "@/views/GlossaryIndexClient";

const META_DESCRIPTION =
  "Plain-English definitions of Arizona custom home building terms, from allowances and draw schedules to setbacks, NAOS, post-tension slabs and the ROC.";
const INTRO =
  "Plain-English definitions for the terms that come up on a custom build in Arizona: allowances, draw schedules, setbacks, NAOS, post-tension slabs, the ROC, and dozens more, each with the sources behind it.";

export const metadata = pageMetadata({
  title: "Custom Home Building Glossary",
  description: META_DESCRIPTION,
  canonical: "/glossary",
});

function lite(t: { slug: string; term: string; shortDefinition: string }): GlossaryTermLite {
  return { slug: t.slug, term: t.term, shortDefinition: t.shortDefinition };
}

export default function GlossaryIndexPage() {
  // Strip each term down to the fields the index needs; the rich definition
  // HTML and sources stay server-side on the detail pages.
  const terms: GlossaryTermLite[] = glossaryTerms.map(lite);
  const letters: GlossaryLetterGroup[] = glossaryByLetter().map((g) => ({
    letter: g.letter,
    terms: g.terms.map(lite),
  }));

  return (
    <main className="page faq-page glossary-page">
      <JsonLd
        data={definedTermSetJsonLd({
          name: "Custom Home Building Glossary",
          description: INTRO,
          url: "/glossary",
          terms: glossaryTerms.map((t) => ({ term: t.term, url: `/glossary/${t.slug}` })),
        })}
      />

      <GlossaryIndexClient letters={letters} terms={terms} />
      <CTA />
    </main>
  );
}
