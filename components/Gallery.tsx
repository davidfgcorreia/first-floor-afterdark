"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { underHeader } from "@/lib/header";
import { MOBILE, scrub } from "@/lib/marquee";
import { club, type Dict } from "@/content/site";
import KineticWall from "./KineticWall";
import { LogoMark } from "./Logo";
import { RoundBadge } from "./Stickers";
import { Instagram } from "./Icons";
import LazyVideo from "./LazyVideo";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Shape = "circle" | "pill" | "rect";
// w / left in vw (scaled up on mobile via --m), top in %.
type Item = { src: string; shape: Shape; w: number; left: number; top: number };

const front: Item[] = [
  { src: "/img/hq/floor-88mph.webp", shape: "circle", w: 24, left: 2, top: 8 },
  { src: "/img/hq/dj-magenta.webp", shape: "pill", w: 17, left: 34, top: 30 },
  { src: "/img/hq/lasers-crowd.webp", shape: "rect", w: 26, left: 60, top: 4 },
  { src: "/img/hq/dj-arms.webp", shape: "circle", w: 28, left: 98, top: 36 },
  { src: "/img/hq/turntable-red.webp", shape: "pill", w: 16, left: 136, top: 6 },
  { src: "/img/hq/bar-neon.webp", shape: "rect", w: 24, left: 160, top: 40 },
  { src: "/img/hq/floor-cubes.webp", shape: "circle", w: 22, left: 196, top: 10 },
  { src: "/img/hq/red-lights.webp", shape: "pill", w: 16, left: 228, top: 34 },
];
const back: Item[] = [
  { src: "/img/hq/dj-red.webp", shape: "rect", w: 14, left: 16, top: 62 },
  { src: "/img/hq/mixer.webp", shape: "circle", w: 13, left: 50, top: 64 },
  { src: "/img/hq/dj-warm.webp", shape: "pill", w: 11, left: 84, top: 4 },
  { src: "/img/hq/floor-feet.webp", shape: "rect", w: 15, left: 118, top: 64 },
  { src: "/img/hq/decks-hands.webp", shape: "circle", w: 13, left: 152, top: 4 },
  { src: "/img/hq/dj-headphones.webp", shape: "pill", w: 11, left: 184, top: 60 },
  { src: "/img/hq/lasers.webp", shape: "rect", w: 14, left: 214, top: 4 },
];

const shapeClass: Record<Shape, string> = {
  circle: "aspect-square rounded-full",
  pill: "aspect-[5/8] rounded-full",
  rect: "aspect-[4/5]",
};

function Track({ items, className, data, near }: { items: Item[]; className: string; data: string; near: boolean }) {
  const width = Math.max(...items.map((i) => i.left + i.w)) + 6;
  return (
    <div
      {...{ [data]: "" }}
      className={`absolute left-0 top-0 h-full will-change-transform ${className}`}
      style={{ width: `calc(${width}vw * var(--m))` }}
    >
      {items.map((it) => (
        <div
          key={it.src}
          className={`absolute overflow-hidden ${shapeClass[it.shape]}`}
          style={{ width: `calc(${it.w}vw * var(--m))`, left: `calc(${it.left}vw * var(--m))`, top: `${it.top}%` }}
        >
          {/* sizes: desktop uses w vw; mobile scales by --m (2) */}
          <Image src={it.src} alt="" fill sizes={`(max-width: 767px) ${it.w * 2}vw, ${it.w}vw`} loading={near ? "eager" : "lazy"} className="object-cover" />
        </div>
      ))}
    </div>
  );
}

/**
 * Pinned "scroll in place": full-bleed video with kinetic type and stickers →
 * video shrinks into a circle (the logo's dot) → photos in logo-like shapes
 * stream past at two depths → Instagram CTA.
 */
export default function Gallery({ t }: { t: Dict }) {
  const root = useRef<HTMLElement>(null);
  // Photos stream in from off-screen right, so native lazy-loading fires too late on
  // slow phones (blank shapes). Load them all once the section is ~1.5 screens away.
  const [near, setNear] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "150% 0px" });
    io.observe(root.current!);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", mobile: MOBILE }, (ctx) => {
        const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean };
        if (!motion) return;
        const q = gsap.utils.selector(root);
        const vw = () => window.innerWidth;
        const w = (sel: string) => () => -(q(sel)[0] as HTMLElement).offsetWidth;

        // Circle mask: the old clip-path went circle(75%) → circle(15%), where % is of
        // sqrt((w²+h²)/2); the mask's radius is (100vw + 100svh) / 2.
        const gv = q("[data-gv]")[0] as HTMLElement;
        const gvIn = q("[data-gv-in]")[0] as HTMLElement;
        const circle = { s: 1 };
        const paintCircle = () => {
          gv.style.transform = `scale(${circle.s})`;
          gvIn.style.transform = `scale(${1 / circle.s})`;
        };
        const endScale = () => {
          const el = root.current!;
          const want = 0.15 * Math.hypot(el.offsetWidth, el.offsetHeight) / Math.SQRT2;
          return want / (gv.offsetWidth / 2);
        };

        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root.current,
              start: underHeader,
              end: mobile ? "+=180%" : "+=260%", // photo stream needs room to read as layered
              pin: true,
              scrub: scrub(0.7),
              invalidateOnRefresh: true,
            },
          })
          // Phase 1 (half as long as before): video full, type + stickers move around
          .fromTo(q("[data-row='a']"), { yPercent: 0 }, { yPercent: -40, duration: 0.17 }, 0)
          .fromTo(q("[data-row='b']"), { yPercent: 0 }, { yPercent: 40, duration: 0.17 }, 0)
          .fromTo(q("[data-st='1']"), { x: () => -vw() * 0.1, y: 0, rotate: -20 }, { x: () => vw() * 0.55, y: () => window.innerHeight * 0.25, rotate: 200, duration: 0.22 }, 0)
          .fromTo(q("[data-st='2']"), { x: () => vw() * 0.1, y: () => window.innerHeight * 0.1, rotate: 0 }, { x: () => -vw() * 0.5, y: () => window.innerHeight * 0.3, rotate: -160, duration: 0.22 }, 0)
          .fromTo(q("[data-st='3']"), { yPercent: 0, rotate: 8 }, { yPercent: -260, rotate: -12, duration: 0.22 }, 0)
          // Phase 2: video collapses into a circle, type leaves
          .fromTo(circle, { s: 1 }, { s: endScale, duration: 0.1, ease: "power2.inOut", onUpdate: paintCircle }, 0.14)
          .to(q("[data-row='a']"), { yPercent: -220, opacity: 0, duration: 0.08 }, 0.17)
          .to(q("[data-row='b']"), { yPercent: 220, opacity: 0, duration: 0.08 }, 0.17)
          .to(q("[data-st]"), { opacity: 0, scale: 0.4, duration: 0.05 }, 0.21)
          // Phase 3: photos stream past at two depths
          .fromTo(q("[data-back]"), { x: vw }, { x: w("[data-back]"), duration: 0.68 }, 0.21)
          .fromTo(q("[data-front]"), { x: () => vw() * 1.1 }, { x: w("[data-front]"), duration: 0.68 }, 0.21)
          .from(q("[data-cta]"), { opacity: 0, y: 30, duration: 0.08 }, 0.84)
          .to({}, { duration: 0.08 });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}

      id="galeria"
      className="h-view relative min-h-[520px] overflow-hidden bg-ink [--m:2] md:[--m:1]"
    >
      <h2 className="sr-only">{t.gallery.title}</h2>

      <Track items={back} near={near} data="data-back" className="z-0 opacity-60 motion-reduce:hidden" />

      {/* Video inside a circle big enough to cover the section (radius ≥ half diagonal).
          Shrinking it = scaling the circle down while counter-scaling the video: transforms
          only, so the compositor does it (an animated clip-path repaints every frame). */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div data-gv className="flex aspect-square w-[calc(100vw+100svh)] shrink-0 items-center justify-center overflow-hidden rounded-full will-change-transform">
          <div data-gv-in className="relative h-[max(520px,calc(100svh-var(--header-h)))] w-screen shrink-0 will-change-transform">
            <LazyVideo name="crowd" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-ink/30" />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-20 flex flex-col justify-center gap-2 text-paper mix-blend-difference">
        <div data-row="a">
          <KineticWall words={[t.gallery.title]} rows={1} rowClassName="text-[10vw] md:text-[22vh]" />
        </div>
        <div data-row="b">
          <KineticWall words={["@firstfloorclub"]} rows={1} outline="all" rowClassName="text-[5.5vw] md:text-[13vh]" />
        </div>
      </div>

      {/* Stickers crossing the screen */}
      <div data-st="1" className="will-change-transform absolute left-[8%] top-[12%] z-30 w-28 md:w-40">
        <RoundBadge text="FIRST FLOOR · FARO · DESDE 2010 · " className="h-full w-full" />
      </div>
      <div data-st="2" className="will-change-transform absolute right-[10%] top-[58%] z-30 w-20 text-paper md:w-28">
        <LogoMark className="h-full w-full" />
      </div>
      <div data-st="3" className="will-change-transform absolute bottom-[-6%] left-[42%] z-30 rotate-6 bg-paper px-5 py-2 text-ink">
        <span className="font-display text-2xl uppercase md:text-4xl">Faro</span>
      </div>

      <Track items={front} near={near} data="data-front" className="z-30 motion-reduce:hidden" />

      <div data-cta className="absolute inset-x-0 bottom-10 z-40 flex justify-center">
        <a href={club.socials.instagram} target="_blank" rel="noreferrer" className="btn btn-accent">
          <Instagram className="h-4 w-4" /> {t.gallery.follow} @firstfloorclub
        </a>
      </div>
    </section>
  );
}
