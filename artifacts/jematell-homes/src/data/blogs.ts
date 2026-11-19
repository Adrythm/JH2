import blogsJson from "../../../../clone-data/extracted/blogs.json";

export type Block = {
  type: string;
  text?: string;
  src?: string;
  alt?: string;
};

export type BlogData = {
  sourceUrl: string;
  title: string;
  /** Search title when it should differ from the post's H1 (title stays the H1). */
  seoTitle?: string;
  description: string;
  /** Meta description when `description` (the visible hero line) runs past 160 characters. */
  seoDescription?: string;
  ogImage: string;
  blocks: Block[];
};

export const blogs = blogsJson as Record<string, BlogData>;
