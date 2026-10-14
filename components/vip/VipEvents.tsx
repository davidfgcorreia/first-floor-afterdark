"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Dict, Locale } from "@/content/site";
import type { VipNight } from "@/content/vip";

gsap.registerPlugin(useGSAP);

const PAGE = 12;

/** Pacha /vip-events style grid: month tabs, rounded poster cards, big "book VIP from €X" button. */
export default function VipEvents({ t, locale, nights }: { t: Dict; locale: Locale; nights: VipNight[] }) {
  const v = t.vipPage;
  const root = useRef<HTMLDivElement>(null);
  const months = [...new Set(nights.map((n) => n.date.slice(0, 7)))];
  const [month, setMonth] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE);
  const list = nights.filter((n) => !month || n.date.startsWith(month));

  useGSAP(
    () => {
      gsap.from("[data-card]", { y: 30, opacity: 0, duration: 0.5, stagger: 0.04, ease: "power3.out" });
    },
    { scope: root, dependencies: [month] },
  );

  const label = (ym: string) => t.months[parseInt(ym.slice(5), 10) - 1];

  return (
    <div ref={root} className="mx-auto max-w-[1400px] px-4 pb-24 md:px-8">
      <div className="mb-10 flex flex-wrap gap-2">
        {[null, ...months].map((m) => (
          <button
            key={m ?? "all"}
            onClick={() => {
              setMonth(m);
              setShown(PAGE);
            }}
            className={`rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-widest transition ${
              month === m ? "border-accent bg-accent text-accent-ink" : "border-white/20 text-paper/70 hover:border-paper hover:text-paper"
            }`}
          >
            {m ? label(m) : v.all}
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.slice(0, shown).map((n) => {
          const d = new Date(n.date + "T12:00:00");
          return (
            <li key={n.date} data-card className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-3">
              <a href={`/${locale}/vip/${n.date}`} className="relative block aspect-square overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={n.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                {n.special && (
                  <span className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 text-[0.6rem] font-bold uppercase tracking-widest text-accent-ink">
                    ✦ {v.special}
                  </span>
                )}
                <p className="font-condensed absolute inset-x-4 bottom-3 text-4xl uppercase leading-none">{n.title}</p>
              </a>
              <div className="flex flex-1 flex-col px-2 pt-4">
                <p className="text-sm text-paper/60">
                  {t.weekdays[d.getDay()]}, {d.getDate()} {t.months[d.getMonth()]} {d.getFullYear()}
                  <span className="px-1.5 text-paper/30">|</span>
                  {n.open} - {n.close}
                </p>
                {n.subtitle && <p className="mt-1 text-lg font-semibold uppercase leading-tight">{n.subtitle[locale]}</p>}
                <p className="mt-1 text-xs uppercase tracking-wide text-paper/50">Lineup: {n.lineup.join(", ")}</p>
                <div className="mt-auto pt-5">
                  <a
                    href={`/${locale}/vip/${n.date}`}
                    className="block rounded-full bg-accent px-5 py-3 text-center text-accent-ink shadow-[0_0_24px_rgb(229_0_126/0.35)] transition hover:shadow-[0_0_36px_rgb(229_0_126/0.6)]"
                  >
                    <span className="block text-sm font-bold uppercase tracking-wider">{v.book}</span>
                    <span className="block text-[0.7rem] opacity-90">
                      {v.from} <b>€{n.from}</b> · {v.drinks}
                    </span>
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {shown < list.length && (
        <div className="mt-12 flex justify-center">
          <button onClick={() => setShown(shown + PAGE)} className="btn btn-ghost rounded-full">
            {v.more}
          </button>
        </div>
      )}
    </div>
  );
}
