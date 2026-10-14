"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { scrub } from "@/lib/marquee";
import { club, events, type Dict, type Locale } from "@/content/site";
import { vipNight } from "@/content/vip";
import { Arrow } from "./Icons";
import EventsBar from "./EventsBar";
import { when } from "./eventDate";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Events({ t, locale }: { t: Dict; locale: Locale }) {
  const root = useRef<HTMLElement>(null);
  const next = events.slice(0, 3);
  const [w1, ...rest] = t.events.title.split(" ");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        // Heading words slide towards each other as the section arrives.
        const st = { trigger: root.current, start: "top bottom", end: "top 20%", scrub: scrub(0.6) };
        gsap.fromTo(q("[data-w1]"), { xPercent: -35 }, { xPercent: 0, ease: "none", scrollTrigger: st });
        gsap.fromTo(q("[data-w2]"), { xPercent: 35 }, { xPercent: 0, ease: "none", scrollTrigger: st });
        // Posters open from the bottom, one after another.
        gsap.fromTo(
          q("[data-poster]"),
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.15,
            scrollTrigger: { trigger: q("[data-cards]")[0], start: "top 80%" },
          },
        );
        gsap.from(q("[data-info]"), {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          delay: 0.3,
          scrollTrigger: { trigger: q("[data-cards]")[0], start: "top 80%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="eventos" className="relative overflow-hidden bg-ink pb-24 pt-24 md:pb-32 md:pt-32">
      <h2 className="mb-10 px-4 text-[clamp(2.8rem,9vw,9rem)] font-semibold uppercase leading-[0.86] tracking-tight md:mb-14 md:px-8">
        <span data-w1 className="block">{w1}</span>
        <span data-w2 className="block text-right">
          <span className="outline-text">{rest.join(" ")}</span>
        </span>
      </h2>

      <EventsBar t={t} locale={locale} />

      <div className="mx-auto mt-16 max-w-[1400px] px-4 md:mt-24 md:px-8">
        <ul data-cards className="grid gap-14 md:grid-cols-3 md:gap-6">
          {next.map((e) => {
            const w = when(e.date, t);
            return (
              <li key={e.date} className="group flex flex-col">
                <a
                  href={club.tickets}
                  target="_blank"
                  rel="noreferrer"
                  data-poster
                  className="relative block aspect-[4/5] overflow-hidden bg-ink-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={e.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-ink/40" />

                  {/* Date badge flips to the price on hover */}
                  <div className="absolute left-4 top-4 h-[76px] w-[68px] [perspective:600px]">
                    <div className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-paper text-ink [backface-visibility:hidden]">
                        <span className="text-[0.65rem] font-semibold uppercase tracking-widest">{w.wd}</span>
                        <span className="text-3xl font-bold leading-none">{w.day}</span>
                        <span className="text-[0.65rem] font-semibold uppercase tracking-widest">{w.mon}</span>
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-accent text-accent-ink [backface-visibility:hidden] [transform:rotateY(180deg)]">
                        <span className="text-[0.6rem] font-semibold uppercase tracking-widest">{t.events.from}</span>
                        <span className="text-2xl font-bold leading-none">€{e.ticketFrom}</span>
                      </div>
                    </div>
                  </div>

                  <p className="font-display absolute inset-x-4 bottom-4 text-[clamp(1.4rem,2.4vw,2rem)] uppercase leading-[1.05]">
                    {e.title}
                  </p>
                </a>

                <div data-info className="flex flex-1 flex-col pt-5">
                  <div className="flex flex-wrap gap-1.5">
                    {e.genres.map((g) => (
                      <span key={g} className="border border-white/25 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-paper/80">
                        {g}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-paper/70">
                    {w.wd}, {w.day} {w.mon} {w.year} <span className="px-1 text-paper/30">|</span> {e.open} - {e.close}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold uppercase leading-tight">{e.subtitle[locale]}</h3>
                  <p className="mt-2 text-sm uppercase tracking-wide text-paper/60">
                    <span className="font-semibold text-paper/85">{t.events.lineup}:</span> {e.lineup.join(", ")}
                  </p>
                  <div className="mt-auto grid gap-2 pt-6">
                    <a href={club.tickets} target="_blank" rel="noreferrer" className="btn btn-accent w-full justify-between">
                      {t.events.buy} <span>{t.events.from} €{e.ticketFrom}</span>
                    </a>
                    <a href={`/${locale}/vip/${e.date}`} className="btn btn-ghost w-full justify-between">
                      {t.events.vip} <span>{t.events.from} €{vipNight(e.date)?.from ?? e.vipFrom}</span>
                    </a>
                    <p className="text-[0.7rem] text-paper/45">{t.events.vipNote}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-14 flex justify-center">
          <a href={club.tickets} target="_blank" rel="noreferrer" className="btn btn-ghost">
            {t.events.all} <Arrow className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
