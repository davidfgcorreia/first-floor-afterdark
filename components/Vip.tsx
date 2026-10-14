"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { underHeader } from "@/lib/header";
import { MOBILE, scrub } from "@/lib/marquee";
import type { Dict, Locale } from "@/content/site";
import KineticWall from "./KineticWall";
import VipCta from "./vip/VipCta";
import LazyVideo from "./LazyVideo";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * A small video window grows as the section scrolls into view and is full-bleed
 * the moment the section fills the screen (behind a moving "VIP" type wall); the
 * title and booking CTA start arriving before the pin and finish while pinned
 * (booking lives on /vip).
 */
export default function Vip({ t, locale }: { t: Dict; locale: Locale }) {
  const v = t.vip;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", mobile: MOBILE }, (ctx) => {
        const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean };
        if (!motion) return;
        const q = gsap.utils.selector(root);
        // While the section scrolls in: the window grows from small to full-bleed (done
        // exactly when the section fills the screen and pins), the type wall dims, and
        // the title + booking panel are already on their way in.
        const panelX = () => window.innerWidth;
        const panelMid = () => Math.min(window.innerWidth * 0.45, 220); // visibly arriving at pin on any width
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: root.current, start: "top bottom", end: underHeader, scrub: scrub(0.6), invalidateOnRefresh: true },
          })
          .fromTo(q("[data-window]"), { clipPath: "inset(32% 34% 32% 34%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power1.inOut" }, 0)
          .fromTo(q("[data-window] video"), { scale: 1.4 }, { scale: 1, duration: 0.8 }, 0)
          .fromTo(q("[data-wall]"), { opacity: 1 }, { opacity: 0.28, duration: 0.4 }, 0.5)
          // outers only (the pinned timeline owns the inners; see below)
          .fromTo(q("[data-title-pre]"), { yPercent: 35, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.35 }, 0.65)
          .fromTo(q("[data-panel-pre]"), { x: () => panelX() - panelMid(), autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.4 }, 0.6);

        // Pinned: title + panel finish arriving, sticker pops, short hold. These tween the
        // inner elements while the pre timeline tweens their *-pre wrappers — one owner per
        // element, so a fast scroll can't leave either half-way (combined = product).
        gsap
          .timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: root.current, start: underHeader, end: mobile ? "+=40%" : "+=70%" /* same as VIP/Manifesto for a consistent feel */, invalidateOnRefresh: true, pin: true, scrub: scrub(0.6) },
          })
          .fromTo(q("[data-title]"), { yPercent: 25, opacity: 0.6 }, { yPercent: 0, opacity: 1, duration: 0.15 }, 0)
          .fromTo(q("[data-panel]"), { x: panelMid, opacity: 0.6 }, { x: 0, opacity: 1, duration: 0.18 }, 0)
          .from(q("[data-sticker]"), { scale: 0, rotate: -30, duration: 0.12, ease: "back.out(2)", immediateRender: true }, 0.06)
          .to({}, { duration: 0.1 });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="vip" className="h-view relative min-h-[620px] overflow-clip bg-ink">
      <div data-window className="absolute inset-0 overflow-hidden">
        <LazyVideo name="vip" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/45" />
      </div>

      <div data-wall className="absolute inset-0 mix-blend-difference">
        <KineticWall
          words={["VIP"]}
          sep=""
          rows={6}
          className="flex h-full flex-col justify-center text-paper"
          rowClassName="text-[15vh] tracking-tight"
        />
      </div>

      <div className="relative z-10 mx-auto grid h-full max-w-[1400px] grid-cols-[minmax(0,1fr)] content-end gap-6 px-4 pb-6 pt-8 md:grid-cols-12 md:content-center md:px-8 md:pb-0">
        <div data-title-pre className="min-w-0 md:col-span-6">
          <div data-title>
            <p className="kicker mb-4 text-accent">{v.kicker}</p>
            <h2 className="text-[clamp(3rem,9vw,8rem)] font-semibold uppercase leading-[0.86] tracking-tight">{v.title}</h2>
            <p className="mt-6 hidden max-w-md text-lg text-paper/80 md:block">{v.body}</p>
          </div>
        </div>
        <div data-panel-pre className="min-w-0 md:col-span-5 md:col-start-8">
          <div data-panel>
            <VipCta t={t} locale={locale} />
          </div>
        </div>
      </div>

      <div data-sticker className="absolute bottom-10 left-[44%] z-10 hidden w-36 rotate-6 border-4 border-paper lg:block">
        <div data-float>
          <LazyVideo name="lounge" className="aspect-[4/5] w-full object-cover" />
        </div>
      </div>
    </section>
  );
}
