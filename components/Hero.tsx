"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { underHeader } from "@/lib/header";
import { MOBILE, scrub } from "@/lib/marquee";
import type { Dict, Locale } from "@/content/site";
import { LogoMarkParts, LogoTagline, LogoWord } from "./Logo";
import { ArrowDown } from "./Icons";
import LazyVideo from "./LazyVideo";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Pinned hero: the logo assembles itself as you scroll (rings → dots → CLUB → wordmark → tagline). */
export default function Hero({ t, locale }: { t: Dict; locale: Locale }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", mobile: MOBILE }, (ctx) => {
        const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean };
        if (!motion) return;
        const q = gsap.utils.selector(root);
        gsap.set(q("[data-ring]"), { strokeDashoffset: 1 });
        gsap.set(q("[data-dot]"), { scale: 0, opacity: 0 });
        gsap.set(q("[data-club]"), { opacity: 0 });
        gsap.set(q("[data-word]"), { clipPath: "inset(0 100% 0 0)" });
        gsap.set(q("[data-late]"), { opacity: 0, y: 24 });

        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: root.current, start: underHeader, end: mobile ? "+=80%" : "+=160%", invalidateOnRefresh: true, pin: true, scrub: scrub(0.6) },
          })
          .to(q("[data-intro]"), { opacity: 0, y: -20, duration: 0.1 }, 0)
          .to(q("[data-video]"), { scale: 1.12, duration: 1 }, 0)
          .to(q("[data-shade]"), { opacity: 0.75, duration: 0.6 }, 0)
          .to(q("[data-ring]"), { strokeDashoffset: 0, duration: 0.25, stagger: 0.06, ease: "power1.inOut" }, 0.02)
          .to(q("[data-dot]"), { scale: 1, opacity: 1, duration: 0.08, stagger: 0.025, ease: "back.out(2.5)" }, 0.18)
          .to(q("[data-club]"), { opacity: 1, duration: 0.08 }, 0.44)
          .to(q("[data-word]"), { clipPath: "inset(0 0% 0 0)", duration: 0.22, ease: "power2.out" }, 0.48)
          .to(q("[data-late]"), { opacity: 1, y: 0, duration: 0.12, stagger: 0.04 }, 0.72)
          .to({}, { duration: 0.12 }); // hold the finished logo before unpinning
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-hero className="h-view relative min-h-[520px] overflow-hidden bg-ink">
      <div data-video className="absolute inset-0 origin-center">
        <LazyVideo name="hero" eager className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/10 to-ink/80" />
      <div data-shade className="absolute inset-0 bg-ink opacity-0" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <div className="flex flex-col items-center gap-6 md:flex-row md:gap-8">
          <LogoMarkParts className="h-24 w-auto text-paper md:h-[clamp(84px,14vw,190px)]" />
          <div data-word>
            <LogoWord className="h-auto w-[76vw] text-paper md:h-[clamp(72px,12vw,164px)] md:w-auto" />
          </div>
        </div>
        <div data-late>
          <LogoTagline className="mt-6 h-[clamp(10px,1.3vw,16px)] w-auto text-paper/85" />
        </div>
        <h1 className="sr-only">First Floor Club Faro — {t.hero.title}</h1>
        <div data-late className="mt-10 flex flex-wrap justify-center gap-3">
          <a href="#eventos" className="btn btn-accent">
            {t.hero.tickets}
          </a>
          <a href={`/${locale}/vip`} className="btn btn-ghost">
            {t.hero.vip}
          </a>
        </div>
      </div>

      {/* Visible before the logo builds; fades as scrolling starts. */}
      <div data-intro className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-3 text-paper/80">
        <p className="kicker">{t.hero.kicker}</p>
        <span className="kicker text-[0.6rem] text-paper/60">{t.hero.scroll}</span>
        <ArrowDown className="h-5 w-5 animate-bounce" />
      </div>
    </section>
  );
}
