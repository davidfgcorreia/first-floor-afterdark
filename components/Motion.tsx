"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createVelocityMarquee, isTouch, reducedMotion } from "@/lib/marquee";

gsap.registerPlugin(ScrollTrigger);
// Phone address bar showing/hiding resizes the viewport; don't re-lay out every pin for it.
ScrollTrigger.config({ ignoreMobileResize: true });

export let lenis: Lenis | null = null;

/**
 * Global scroll plumbing (Lenis on desktop, native on touch) + the simple
 * data-attribute effects. Section-specific
 * timelines (hero, nights, VIP, gallery) live in their own components.
 *   data-speed="0.12"   parallax, ±12% across the viewport
 *   data-marquee="1|-1" velocity marquee (content duplicated once)
 *   data-float          idle bob/rotation for stickers
 *   data-spin           CSS-animated element, paused while off-screen
 * Idle loops (float/spin) only run while their element is on screen.
 */
export default function Motion() {
  useEffect(() => {
    if (reducedMotion()) return;

    // Lenis only smooths wheel scrolling, but its non-passive touch listeners make
    // every finger move wait for the main thread — so touch devices scroll natively.
    if (!isTouch()) {
      lenis = new Lenis({ lerp: 0.12, anchors: { offset: -64 } });
      lenis.on("scroll", ScrollTrigger.update);
    }
    const raf = (t: number) => lenis?.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Idle loops pause off-screen: float tweens by reference, CSS spins via [data-offscreen].
    const idle = new Map<Element, gsap.core.Tween>();
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(({ target, isIntersecting }) => {
          const tw = idle.get(target);
          if (tw) {
            if (isIntersecting) tw.resume();
            else tw.pause();
          } else target.toggleAttribute("data-offscreen", !isIntersecting);
        }),
      { rootMargin: "10% 0px" },
    );

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
        const s = parseFloat(el.dataset.speed || "0.1") * 100;
        gsap.fromTo(
          el,
          { yPercent: -s },
          {
            yPercent: s,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
      gsap.utils.toArray<HTMLElement>("[data-float]").forEach((el, i) => {
        idle.set(el, gsap.to(el, { y: "+=14", rotation: i % 2 ? -6 : 6, duration: 3 + (i % 3), ease: "sine.inOut", yoyo: true, repeat: -1 }));
        io.observe(el);
      });
      document.querySelectorAll("[data-spin]").forEach((el) => io.observe(el));
    });

    const marquees = [...document.querySelectorAll<HTMLElement>("[data-marquee]")].map((el) =>
      createVelocityMarquee(el, parseFloat(el.dataset.marquee || "1")),
    );

    // Pinned sections change page height after mount; recompute once media/fonts settle.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = setTimeout(() => {
      ScrollTrigger.sort();
      refresh();
    }, 600);

    return () => {
      clearTimeout(t);
      io.disconnect();
      window.removeEventListener("load", refresh);
      marquees.forEach((m) => m.destroy());
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  return null;
}
