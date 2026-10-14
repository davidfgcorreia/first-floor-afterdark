"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Dict, Locale } from "@/content/site";
import { zones, type Table, type TableStatus, type Zone } from "@/content/vip";

gsap.registerPlugin(useGSAP);

export type Pick = { zone: Zone; table: Table };

const dot: Record<TableStatus, string> = {
  available: "bg-emerald-400 shadow-[0_0_10px_rgb(52_211_153/0.8)]",
  last: "bg-amber-400 shadow-[0_0_10px_rgb(251_191_36/0.8)]",
  soldout: "bg-rose-600",
};

/** Zone cards that expand into table cards (the floor map comes later). */
export default function ZonePicker({
  t,
  locale,
  status,
  open,
  setOpen,
  pick,
  setPick,
}: {
  t: Dict;
  locale: Locale;
  status: Record<string, TableStatus>;
  open: string | null;
  setOpen: (id: string | null) => void;
  pick: Pick | null;
  setPick: (p: Pick) => void;
}) {
  const v = t.vipPage;
  const root = useRef<HTMLDivElement>(null);

  // Expanded zone opens (cards pop in via the CSS fadeUp keyframe, staggered by index)
  useGSAP(
    () => {
      if (!open) return;
      gsap.fromTo(`[data-zone="${open}"] [data-tables]`, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.45, ease: "power3.out" });
    },
    { scope: root, dependencies: [open] },
  );

  return (
    <div ref={root}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold uppercase md:text-3xl">{v.chooseZone}</h2>
        <ul className="flex flex-wrap gap-4 text-xs text-paper/70">
          {(Object.keys(dot) as TableStatus[]).map((s) => (
            <li key={s} className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${dot[s]}`} />
              {v.legend[s]}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4">
        {zones.map((z) => {
          const free = z.tables.filter((tb) => status[tb.id] !== "soldout");
          const from = free.length ? Math.min(...free.map((tb) => tb.min)) : null;
          const isOpen = open === z.id;
          return (
            <section
              key={z.id}
              data-zone={z.id}
              className={`overflow-hidden rounded-3xl border transition-colors ${isOpen ? "border-accent/60 bg-white/[0.07]" : "border-white/10 bg-white/[0.04] hover:border-white/25"}`}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : z.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 p-3 text-left md:gap-5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={z.image} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover md:h-24 md:w-36" />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold uppercase leading-tight md:text-xl">{z.name[locale]}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-paper/60 md:line-clamp-none">
                    <span className="hidden md:inline">{v.included}: </span>{z.included[locale]}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-xs text-paper/60">
                    <span className={`h-2 w-2 rounded-full ${free.length ? dot.available : dot.soldout}`} />
                    {free.length}/{z.tables.length}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {from ? (
                    <>
                      <p className="text-[0.65rem] uppercase tracking-widest text-paper/50">{v.from}</p>
                      <p className="text-xl font-bold text-accent md:text-2xl">€{from}</p>
                    </>
                  ) : (
                    <p className="rounded-full bg-rose-600/20 px-3 py-1 text-xs font-semibold uppercase text-rose-400">{v.legend.soldout}</p>
                  )}
                </div>
                <span className={`ml-1 text-xl text-paper/50 transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
              </button>

              {isOpen && (
                <div data-tables className="overflow-hidden">
                  <div className="grid grid-cols-2 gap-3 p-3 pt-1 sm:grid-cols-3 lg:grid-cols-4">
                    {z.tables.map((tb, i) => {
                      const st = status[tb.id];
                      const sel = pick?.table.id === tb.id;
                      return (
                        <button
                          key={tb.id}
                          type="button"
                          data-table
                          disabled={st === "soldout"}
                          onClick={() => setPick({ zone: z, table: tb })}
                          aria-pressed={sel}
                          style={{ animationDelay: `${100 + i * 60}ms` }}
                          className={`relative animate-[fadeUp_0.4s_ease-out_both] rounded-2xl border p-4 text-left transition-[transform,background-color,border-color,box-shadow,color] duration-300 ${
                            sel
                              ? "scale-[1.03] border-accent bg-accent text-accent-ink shadow-[0_0_32px_rgb(229_0_126/0.5)]"
                              : st === "soldout"
                                ? "cursor-not-allowed border-white/5 bg-white/[0.02] text-paper/30"
                                : "border-white/10 bg-white/5 hover:-translate-y-0.5 hover:border-white/35"
                          }`}
                        >
                          <span className={`absolute right-3 top-3 h-2.5 w-2.5 rounded-full ${sel ? "bg-paper" : dot[st]}`} />
                          <p className={`text-xs uppercase tracking-widest ${sel ? "text-accent-ink/80" : "text-paper/50"}`}>{v.table}</p>
                          <p className={`text-3xl font-bold ${st === "soldout" ? "line-through" : ""}`}>{tb.id}</p>
                          <p className="mt-2 text-xs">
                            {v.upTo} {tb.pax} {v.people}
                          </p>
                          <p className="text-sm font-semibold">
                            {st === "soldout" ? v.legend.soldout : `${v.min} €${tb.min}`}
                          </p>
                          {st === "last" && !sel && (
                            <p className="mt-2 inline-block rounded-full bg-amber-400/15 px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-amber-300">
                              {v.legend.last}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="mt-6 flex h-40 items-center justify-center rounded-3xl border border-dashed border-white/20 text-sm uppercase tracking-widest text-paper/40">
        {v.map}
      </div>
    </div>
  );
}
