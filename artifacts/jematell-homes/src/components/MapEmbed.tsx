"use client";
import { useEffect, useRef, useState } from "react";

/**
 * A Google Maps embed that mounts its iframe only once the reader scrolls
 * near it. loading="lazy" alone did not hold it back on a phone: the map at
 * the foot of /contact sits inside Chrome's lazy-load distance, so the embed
 * pulled about 450 KB of Maps scripts during the page's own load (JH2,
 * 2026-11-20). The wrapper keeps its size from the parent's CSS (.cl-map),
 * so nothing moves when the map arrives.
 */
export function MapEmbed({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || show) return;
    if (typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show]);

  return (
    <div ref={ref} style={{ width: "100%", height: "100%", minHeight: "inherit" }}>
      {show ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : null}
    </div>
  );
}
