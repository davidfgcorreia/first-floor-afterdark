"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { underHeader } from "@/lib/header";
import { scrub } from "@/lib/marquee";
import { nights, type Dict, type Locale } from "@/content/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STEP = 360 / nights.length;

/**
 * Tue → Sat on a 3D ring. The section pins and scrolling turns the ring so each
 * night comes to the front; the text beside it follows the front card.
 * Reduced motion gets a plain grid instead.
 */
export default function WeeklyNights({ t, locale }: { t: Dict; locale: Locale }) {
  const root = useRef<HTMLElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 767px)",
        },
        (ctx) => {
          const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean };
          if (!motion) return;
          const cards = gsap.utils.toArray<HTMLElement>("[data-card]", root.current);
          const radius = mobile ? 230 : 420;
          // rotate first, then push out along the rotated Z axis (GSAP would translate first)
          cards.forEach((c, i) => (c.style.transform = `rotateY(${i * STEP}deg) translateZ(${radius}px)`));

          // Dimming via an overlay's opacity (compositor-only) instead of CSS filters;
          // only values that actually changed are written.
          const dims = cards.map((c) => c.querySelector<HTMLElement>("[data-dim]")!);
          const lastDim: string[] = [];
          const lastZ: string[] = [];
          const paint = (rot: number) => {
            cards.forEach((c, i) => {
              const a = ((((rot + i * STEP) % 360) + 540) % 360) - 180; // -180..180, 0 = front
              const front = Math.cos((a * Math.PI) / 180); // 1 front, -1 back
              const k = (front + 1) / 2;
              const dim = (0.65 * (1 - k)).toFixed(2); // ≈ the old brightness(0.35) at the back
              const z = String(Math.round(k * 100));
              if (dim !== lastDim[i]) dims[i].style.opacity = lastDim[i] = dim;
              if (z !== lastZ[i]) c.style.zIndex = lastZ[i] = z;
            });
            const idx = ((Math.round(-rot / STEP) % cards.length) + cards.length) % cards.length;
            if (idx !== activeRef.current) {
              activeRef.current = idx;
              setActive(idx);
            }
          };
          paint(0);

          const setRot = gsap.quickSetter(ring.current, "rotateY", "deg");
          const state = { rot: 0 };
          gsap.to(state, {
            rot: -STEP * (cards.length - 1),
            ease: "none",
            onUpdate: () => {
              setRot(state.rot);
              paint(state.rot);
            },
            scrollTrigger: {
              trigger: root.current,
              start: underHeader,
              invalidateOnRefresh: true,
              end: `+=${(cards.length - 1) * (mobile ? 35 : 70)}%`,
              pin: true,
              scrub: scrub(0.8),
              snap: { snapTo: 1 / (cards.length - 1), duration: 0.4, ease: "power2.inOut" },
            },
          });
        },
      );
    },
    { scope: root },
  );

  const n = nights[active];

  return (
    <section ref={root} id="noites" className="relative overflow-hidden bg-ink">
      {/* 3D carousel (motion) */}
      <div className="relative h-view grid min-h-[560px] grid-rows-[auto_1fr_auto] px-4 py-8 motion-reduce:hidden md:grid-cols-12 md:grid-rows-1 md:items-center md:px-8 md:py-0">
        <div className="md:col-span-5">
          <p className="kicker text-accent">{t.nights.kicker}</p>
          <h2 className="mt-3 text-[clamp(2.2rem,5.5vw,5rem)] font-semibold uppercase leading-[0.9] tracking-tight">
            {t.nights.title}
          </h2>
          <div className="mt-6 hidden md:block">
            <p key={active} className="font-display animate-[fadeUp_0.5s_ease-out] text-[clamp(3rem,6vw,5.5rem)] uppercase leading-none text-transparent [-webkit-text-stroke:1.5px_var(--paper)]">
              {n.day[locale]}
            </p>
            <p className="mt-6 max-w-sm text-lg text-paper/75">{n.blurb[locale]}</p>
            <p className="mt-2 text-sm uppercase tracking-widest text-paper/50">{n.hours}</p>
          </div>
          <div className="mt-8 hidden gap-2 md:flex">
            {nights.map((x, i) => (
              <span key={x.name} className={`h-1 w-10 transition-colors ${i === active ? "bg-accent" : "bg-white/20"}`} />
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center [perspective:1400px] md:col-span-7 md:h-full">
          <div ref={ring} className="relative h-[300px] w-[210px] [transform-style:preserve-3d] md:h-[440px] md:w-[310px]">
            {nights.map((x, i) => (
              <article
                key={x.name}
                data-card
                className="absolute inset-0 overflow-hidden bg-ink-2 [backface-visibility:hidden]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={x.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                <div data-dim className="absolute inset-0 z-10 bg-ink opacity-0 motion-reduce:hidden" />
                <span className="font-display absolute left-4 top-3 text-5xl">{i + 1}</span>
                <div className="absolute inset-x-4 bottom-4">
                  <p className="kicker text-accent">{x.day[locale]}</p>
                  <h3 className="mt-1 text-2xl font-semibold uppercase leading-none md:text-3xl">{x.name}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="text-center md:hidden">
          <p className="font-display text-3xl uppercase">{n.day[locale]}</p>
          <p className="mt-2 text-paper/75">{n.blurb[locale]}</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-paper/50">{n.hours}</p>
        </div>
      </div>

      {/* Reduced-motion fallback */}
      <div className="hidden px-4 py-24 motion-reduce:block md:px-8">
        <h2 className="text-[clamp(2.2rem,5.5vw,5rem)] font-semibold uppercase leading-[0.9]">{t.nights.title}</h2>
        <ol className="mt-10 grid gap-3 md:grid-cols-5">
          {nights.map((x) => (
            <li key={x.name} className="border border-white/15 p-5">
              <p className="kicker text-accent">{x.day[locale]}</p>
              <h3 className="mt-2 text-xl font-semibold uppercase">{x.name}</h3>
              <p className="mt-2 text-sm text-paper/70">{x.blurb[locale]}</p>
              <p className="mt-2 text-xs uppercase tracking-widest text-paper/50">{x.hours}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
