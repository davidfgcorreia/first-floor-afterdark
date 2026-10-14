"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { underHeader } from "@/lib/header";
import { MOBILE, scrub } from "@/lib/marquee";
import type { Dict } from "@/content/site";
import LazyVideo from "./LazyVideo";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Pinned manifesto. The text starts growing in (small/faint → full) once half
 * the section is on screen, completes just after it pins, and stays.
 * The video plays at its natural speed; nothing on it is scroll-driven.
 */
export default function Manifesto({ t }: { t: Dict }) {
  const m = t.manifesto;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", mobile: MOBILE }, (ctx) => {
        const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean };
        if (!motion) return;
        const q = gsap.utils.selector(root);
        // Two elements, one owner each: the outer [data-text-pre] fades in before the pin,
        // the inner [data-text] finishes while pinned. (Two scrubbed tweens on the same
        // element fought on fast scrolls and left the text stuck half-faded.)
        // Animated blur is too heavy for phones; they get scale + fade only.
        const mid = { scale: 0.88, opacity: 0.55, ...(mobile ? {} : { filter: "blur(3px)" }) };
        const peak = { scale: 1, opacity: 1, ...(mobile ? {} : { filter: "blur(0px)" }) };
        gsap.set(q("[data-text]"), mid);
        gsap.set(q("[data-stats]"), { opacity: 0, y: 40 });

        // Starts appearing slowly once half the section is on screen; at the pin the
        // combined text is at about half strength (outer 1 × inner mid).
        gsap.fromTo(
          q("[data-text-pre]"),
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            ease: "power1.in",
            scrollTrigger: { trigger: root.current, start: "top center", end: underHeader, scrub: scrub(0.6), invalidateOnRefresh: true },
          },
        );

        gsap
          .timeline({
            defaults: { ease: "sine.inOut" },
            scrollTrigger: { trigger: root.current, start: underHeader, end: mobile ? "+=40%" : "+=70%" /* same as VIP/Manifesto for a consistent feel */, invalidateOnRefresh: true, pin: true, scrub: scrub(0.6) },
          })
          // text: quick in, then stays at full opacity (it never fades out; client request)
          .to(q("[data-text]"), { ...peak, duration: 0.12 }, 0.03)
          .to(q("[data-stats]"), { opacity: 1, y: 0, duration: 0.08 }, 0.1)
          .to({}, { duration: 0.06 }, 0.68); // text is in by ~20% of the pin, then holds
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="h-view relative flex min-h-[520px] items-center overflow-hidden bg-ink px-4 md:px-8">
      <LazyVideo name="manifesto" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-ink/30" />

      <div className="relative mx-auto max-w-[1200px] text-center">
        <div data-text-pre className="origin-center will-change-transform">
          <div data-text className="origin-center will-change-transform">
            <p className="kicker mb-8 text-accent">{m.kicker}</p>
            <p className="text-[clamp(2.2rem,5.4vw,4.8rem)] font-medium leading-[1.08] tracking-tight [text-shadow:0_2px_24px_rgb(0_0_0/0.5)]">
              {m.body}
            </p>
          </div>
        </div>

        <dl data-stats className="mx-auto mt-14 grid max-w-[820px] grid-cols-3 gap-4 border-t border-white/25 pt-8">
          {[m.stat1, m.stat2, m.stat3].map(([n, label]) => (
            <div key={label} className="flex flex-col-reverse items-center">
              <dt className="mt-2 text-xs uppercase tracking-widest text-paper/70 md:text-sm">{label}</dt>
              <dd className="font-display text-[clamp(1.6rem,5vw,4.2rem)] leading-none">{n}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
