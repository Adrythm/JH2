import pagesJson from "../../../../clone-data/extracted/pages.json";

export type Block = {
  type: string;
  text?: string;
  src?: string;
  alt?: string;
};

export type PageData = {
  sourceUrl: string;
  title: string;
  description: string;
  /** Optional search title (the <title> tag only). The hero heading keeps `title`. */
  seoTitle?: string;
  /** Optional meta description. The visible hero line keeps `description`. */
  seoDescription?: string;
  ogImage: string;
  blocks: Block[];
};

export const pages = pagesJson as Record<string, PageData>;
