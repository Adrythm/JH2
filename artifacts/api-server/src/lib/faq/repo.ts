import { db, faqCategories, faqItems } from "@workspace/db";
import { asc, eq } from "drizzle-orm";
import {
  buildDatasetFromSeed,
  makeDataset,
  faqSeed,
  type Dataset,
  type NormalizedItem,
} from "@workspace/faq";

// Load the live dataset from the database. Topic metadata (titles/descriptions)
// lives only in the seed (there is no topics table), so we merge it here.
export async function loadDataset(): Promise<Dataset> {
  const [categoryRows, itemRows] = await Promise.all([
    db.select().from(faqCategories).orderBy(asc(faqCategories.sortOrder)),
    db
      .select()
      .from(faqItems)
      .where(eq(faqItems.active, true))
      .orderBy(asc(faqItems.sortOrder)),
  ]);

  const items: NormalizedItem[] = itemRows.map((r) => ({
    slug: r.slug,
    question: r.question,
    // The faq_items table has no search-title column; the site's pages read
    // their titles from the seed.
    seoTitle: null,
    shortAnswer: r.shortAnswer,
    categorySlug: r.categorySlug,
    categoryTitle:
      categoryRows.find((c) => c.slug === r.categorySlug)?.title ??
      r.categorySlug,
    topicSlugs: r.topicSlugs ?? [],
    tags: r.tags ?? [],
    answer: r.answer,
    answerHtml: r.answerHtml,
    metaDescription: r.metaDescription,
    relatedServiceSlugs: r.relatedServiceSlugs ?? [],
    relatedFaqSlugs: r.relatedFaqSlugs ?? [],
    pillarBlogSlug: r.pillarBlogSlug,
    updatedDate: (r.updatedDate ?? new Date()).toISOString(),
    featured: r.featured,
    sortOrder: r.sortOrder,
  }));

  if (categoryRows.length === 0 && items.length === 0) {
    // DB not yet seeded — fall back to the seed so pages still render.
    return buildDatasetFromSeed(faqSeed);
  }

  return makeDataset({
    categories: categoryRows.map((c) => ({
      slug: c.slug,
      title: c.title,
      description: c.description,
      metaDescription: c.metaDescription,
      sortOrder: c.sortOrder,
    })),
    topics: faqSeed.topics.map((t) => ({
      slug: t.slug,
      title: t.title,
      description: t.description,
      metaDescription: t.metaDescription,
      sortOrder: t.sortOrder ?? 0,
    })),
    items,
  });
}
