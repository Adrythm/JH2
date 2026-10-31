---
name: FAQ seed authoring & regeneration pipeline
description: How FAQ content is authored in lib/faq/src/seed.ts and what must be regenerated after any edit.
---

# FAQ seed authoring & regeneration pipeline

`lib/faq/src/seed.ts` is the single source of truth for all FAQ content. It is consumed by both the web app (`@workspace/faq`, built into the in-memory dataset at module load — no DB) and the api-server (DB sync + `/api/faqs` + build-time JSON-LD validator).

## Single-source answer pattern
Author rich `answerHtml` only; the plain-text `answer` (used for schema.org acceptedAnswer) is **derived** from it by the `plain()` helper, and items are built via the `item()` helper (`Omit<SeedItem,"answer"> & {answerHtml}`). Never hand-write both `answer` and `answerHtml` — that reintroduces drift. `shortAnswer` and `metaDescription` are schema/meta ONLY and must never be rendered as visible body copy.

## After ANY seed edit, run in order
1. `pnpm run typecheck:libs` — rebuilds `lib/faq` dist so the web app picks up changes (the web app imports the built lib, not the TS source).
2. `pnpm --filter @workspace/api-server run faq:validate` — must be 0 errors (required fields, valid cat/topic/relatedFaq refs, no duplicate-intent ≥0.6, JSON-LD shapes, breadcrumb, related-services when relatedServiceSlugs set; shortAnswer 25–80 words or WARN).
3. `pnpm --filter @workspace/api-server run faq:crosslinks` — regenerates `artifacts/jematell-homes/src/data/faqCrossLinks.json` (consumed by `BlogPost.tsx` to show related FAQs). **If you change category/topic/item slugs and skip this, BlogPost's related-FAQ feature shows stale/broken links.**
4. `pnpm --filter @workspace/api-server run faq:registry` — regenerates root `CONTENT-INTENT-REGISTRY.md`.
5. `pnpm --filter @workspace/jematell-homes run lastmod` — rewrites `artifacts/jematell-homes/src/data/lastmod.json`, the per-URL `<lastmod>` the sitemap carries, from git history (needs a full clone: `git fetch --unshallow`). Run it after ANY content change (FAQ, glossary, reference, guides, blogs, pages.json, a route's page.tsx or its own view) and commit the file with the change; `lastmod:check` says whether it is current.

**Why:** both generated files derive purely from the seed; they are not edited by hand and go stale silently if not regenerated.

## Validator does NOT enforce the word-count floor
The 500-word minimum (target 500–1,500) is a content-quality standard, not a validator rule. Write to it manually.

## Content convention for this site
FAQs are deep, research-phase, AZ-building-code-grounded answers (permitting, codes, land due diligence, wells/septic/water-supply, zoning/setbacks/NAOS, ADUs, budgeting/financing). Cite real AZ law by name (e.g. A.R.S. 45-454 exempt domestic well ≤35 gpm, A.R.S. 32-2101 subdivision = 6+ lots vs lot split ≤5, HB 2720 ADU law for cities ≥75k, Scottsdale ESLO/NAOS, ADWR/ADEQ) and always close by reminding the reader to confirm specifics with the local AHJ, since codes/fees/timelines change.
