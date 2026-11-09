"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import type { Block } from "../data/blogs";

/**
 * Body text may carry an internal link written as [label](/path). Only
 * site-relative paths are linked; any other text renders as it always did.
 */
const INLINE_LINK = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;
const LINK_STYLE = { textDecoration: "underline", textUnderlineOffset: "3px" } as const;

function renderInline(text: string | undefined): ReactNode {
  if (!text || !text.includes("](/")) return text;
  const out: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE_LINK)) {
    const at = match.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    out.push(
      <Link key={at} href={match[2]} className="post-link" style={LINK_STYLE}>
        {match[1]}
      </Link>,
    );
    last = at + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type BlockGroup =
  | { kind: "single"; block: Block; index: number }
  | { kind: "list"; items: Block[]; startIndex: number };

function groupBlocks(blocks: Block[]): BlockGroup[] {
  const groups: BlockGroup[] = [];
  let i = 0;
  while (i < blocks.length) {
    if (blocks[i].type === "li") {
      const items: Block[] = [];
      const startIndex = i;
      while (i < blocks.length && blocks[i].type === "li") {
        items.push(blocks[i]);
        i++;
      }
      groups.push({ kind: "list", items, startIndex });
    } else {
      groups.push({ kind: "single", block: blocks[i], index: i });
      i++;
    }
  }
  return groups;
}

/**
 * BlogPostBody - the scroll-reveal article body of a blog post. The server
 * page passes in only this one post's body blocks (the hero image block is
 * already filtered out), so no other post's content reaches the client.
 * Block-to-element mapping ported verbatim from the old BlogPost page.
 */
export function BlogPostBody({ blocks }: { blocks: Block[] }) {
  const reduce = useReducedMotion();

  const anim = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.5 },
      };

  const groups = groupBlocks(blocks);

  return (
    <>
      {groups.map((group) => {
        if (group.kind === "list") {
          return (
            <m.ul key={group.startIndex} className="post-list" {...anim}>
              {group.items.map((item, j) => (
                <li key={j} className="post-li">
                  {renderInline(item.text)}
                </li>
              ))}
            </m.ul>
          );
        }

        const { block: b, index: i } = group;

        if (b.type === "h1" || b.type === "h2") {
          return (
            <m.h2 key={i} className="post-h2" {...anim}>
              {b.text}
            </m.h2>
          );
        }
        if (b.type === "h3" || b.type === "h4") {
          return (
            <m.h3 key={i} className="post-h3" {...anim}>
              {b.text}
            </m.h3>
          );
        }
        if (b.type === "p") {
          return (
            <m.p key={i} className="post-p" {...anim}>
              {renderInline(b.text)}
            </m.p>
          );
        }
        if (b.type === "blockquote") {
          return (
            <m.blockquote key={i} className="post-quote" {...anim}>
              {b.text}
            </m.blockquote>
          );
        }
        if (b.type === "img" && b.src) {
          return (
            <m.figure key={i} className="post-figure" {...anim}>
              {b.alt ? (
                <img src={b.src} alt={b.alt} loading="lazy" />
              ) : (
                <img src={b.src} alt="" aria-hidden="true" loading="lazy" />
              )}
            </m.figure>
          );
        }
        return null;
      })}
    </>
  );
}
