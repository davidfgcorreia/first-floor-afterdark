"use client";

import { useEffect, useRef } from "react";

/**
 * Muted looping background video that only downloads when it's about to be seen
 * (or immediately with `eager`) — poster included — plays while visible, pauses off-screen, and
 * uses the lighter 720p file from /video/m/ on phones.
 */
export default function LazyVideo({
  name,
  className,
  eager = false,
}: {
  name: string; // file name in /public/video, without extension
  className?: string;
  eager?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const load = () => {
      if (v.src) return;
      v.poster = `/img/${name}-poster.jpg`;
      v.src = matchMedia("(max-width: 767px)").matches ? `/video/m/${name}.mp4` : `/video/${name}.mp4`;
    };
    if (eager) {
      load();
      v.play().catch(() => {});
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          load();
          v.play().catch(() => {});
        } else if (v.src) v.pause();
      },
      { rootMargin: "100% 0px" }, // start one screen ahead
    );
    io.observe(v);
    return () => io.disconnect();
  }, [name, eager]);

  return (
    <video
      ref={ref}
      className={className}
      poster={eager ? `/img/${name}-poster.jpg` : undefined}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
    />
  );
}
