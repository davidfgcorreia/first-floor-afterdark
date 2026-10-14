"use client";

import { useSyncExternalStore } from "react";
import type { Dict, Locale } from "@/content/site";
import { iso, vipNight, type VipNight } from "@/content/vip";

// "Today" must be read on the client (the homepage is prerendered).
let cache: { day: string; nights: VipNight[] } | null = null;
const none: VipNight[] = [];
const subscribe = () => () => {};
const getNext = () => {
  const day = new Date().toDateString();
  if (cache?.day !== day) {
    const out: VipNight[] = [];
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    while (out.length < 3) {
      const n = vipNight(iso(d));
      if (n) out.push(n);
      d.setDate(d.getDate() + 1);
    }
    cache = { day, nights: out };
  }
  return cache.nights;
};

/** Homepage VIP card: big CTA to /vip plus quick links to the next 3 nights. */
export default function VipCta({ t, locale }: { t: Dict; locale: Locale }) {
  const v = t.vipPage;
  const next = useSyncExternalStore(subscribe, getNext, () => none);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-ink/85 p-5 shadow-2xl shadow-black/40 md:bg-ink/70 md:p-7 md:backdrop-blur-xl">
      <p className="text-xs uppercase tracking-widest text-paper/50">{v.intro}</p>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {next.map((n) => {
          const d = new Date(n.date + "T12:00:00");
          return (
            <a
              key={n.date}
              href={`/${locale}/vip/${n.date}`}
              className="group relative flex flex-col items-center rounded-[1.75rem] border border-white/10 bg-white/5 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-accent-ink hover:shadow-[0_0_32px_rgb(229_0_126/0.55)]"
            >
              <span className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] opacity-60">{t.weekdays[d.getDay()]}</span>
              <span className="my-0.5 text-3xl font-bold leading-none tabular-nums">{String(d.getDate()).padStart(2, "0")}</span>
              <span className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] opacity-60">{t.months[d.getMonth()]}</span>
              <span className="mt-2 max-w-full truncate px-2 text-[0.6rem] uppercase opacity-70">{n.title}</span>
              {n.special && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[0.6rem] text-accent-ink ring-2 ring-ink">
                  ✦
                </span>
              )}
            </a>
          );
        })}
      </div>
      <a
        href={`/${locale}/vip`}
        className="mt-5 block rounded-full bg-accent px-6 py-4 text-center text-accent-ink shadow-[0_0_24px_rgb(229_0_126/0.4)] transition hover:shadow-[0_0_40px_rgb(229_0_126/0.65)]"
      >
        <span className="block font-bold uppercase tracking-wider">{t.vip.cta} →</span>
        <span className="block text-[0.65rem] opacity-85">{v.drinks}</span>
      </a>
    </div>
  );
}
