"use client";
import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";

export interface GalleryGridItem {
  slug: string;
  title: string;
  img: string;
  /** WebP rungs of img (768w, 1280w) when they exist on disk. */
  srcSet?: string;
}

/**
 * GalleryGrid - the animated project grid from the old Gallery page, split out
 * as a client island so the /gallery route itself stays a server component.
 * Receives only { slug, title, img } per project (the server page resolves each
 * thumb from the scraped pages data, which never enters the client bundle).
 */
export default function GalleryGrid({ projects }: { projects: GalleryGridItem[] }) {
  const reduce = useReducedMotion();
  return (
    <div className="gallery-grid">
      {projects.map((proj, i) => {
        const img = proj.img;
        return (
          <m.div
            key={proj.slug}
            className="gallery-card"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
          >
            <Link href={`/gallery/${proj.slug}`} data-testid={`gallery-card-${proj.slug}`}>
              <div className={`gallery-card-media${img ? "" : " gallery-card-placeholder"}`}>
                {/* Empty alt: the card's visible <h2> title is the accessible
                    name; repeating it here makes screen readers announce every
                    project twice (axe: image-redundant-alt). */}
                {img && (
                  <img
                    src={img}
                    srcSet={proj.srcSet}
                    sizes={proj.srcSet ? "(max-width: 600px) 100vw, (max-width: 900px) 50vw, 34vw" : undefined}
                    alt=""
                    loading="lazy"
                  />
                )}
                <div className="gallery-card-overlay">
                  <h2 className="gallery-card-title">{proj.title}</h2>
                </div>
              </div>
            </Link>
          </m.div>
        );
      })}
    </div>
  );
}
