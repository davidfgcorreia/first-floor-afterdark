"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { club, events, type Dict, type Locale } from "@/content/site";
import { createVelocityMarquee, reducedMotion, whenVisible } from "@/lib/marquee";
import { LogoMark } from "./Logo";
import { when } from "./eventDate";

// Fixed "hand-placed" tilt per card, like posters pinned on a wall.
const TILT = [-3, 2.5, -1.5, 3.5, -2.5, 1.5, -3.5, 2, -1, 3, -2, 1];

/**
 * Amnesia-style poster carousel of every upcoming event. Cards sit on a concave
 * curve (tilt + drop + shrink towards the edges), drift with scroll velocity,
 * and can be dragged or side-scrolled (both with inertia on release).
 */
export default function EventsBar({ t, locale }: { t: Dict; locale: Locale }) {
  const track = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const box = el.parentElement!;
    const cards = [...el.querySelectorAll<HTMLElement>("[data-card]")];
    const tilts = cards.map((c) => c.firstElementChild as HTMLElement);

    const m = reducedMotion() ? null : createVelocityMarquee(el, 1, 0.5);

    // Card centres relative to the track, measured once (and on resize) so the
    // per-frame curve is pure arithmetic on the marquee offset — no layout reads.
    let centres: number[] = [];
    let boxLeft = 0;
    let vw = window.innerWidth;
    const measure = () => {
      const tr = el.getBoundingClientRect();
      centres = cards.map((c) => {
        const r = c.getBoundingClientRect();
        return r.left - tr.left + r.width / 2;
      });
      boxLeft = box.getBoundingClientRect().left;
      vw = window.innerWidth;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    // Concave curve from each card's on-screen position; skips unchanged writes.
    const last: string[] = [];
    const curve = () => {
      const half = vw / 2;
      const x = m?.x() ?? 0;
      cards.forEach((_, i) => {
        const cx = boxLeft + x + centres[i];
        if (cx < -vw * 0.5 || cx > vw * 1.5) return;
        const d = Math.max(-1.4, Math.min(1.4, (cx - half) / half));
        const a = Math.min(Math.abs(d), 1);
        const tf = `translateY(${(d * d * 46).toFixed(1)}px) rotateY(${(-d * 34).toFixed(1)}deg) scale(${(1 - a * 0.16).toFixed(3)}) rotateZ(${TILT[i % TILT.length]}deg)`;
        if (tf !== last[i]) tilts[i].style.transform = last[i] = tf;
      });
    };
    curve();
    const stopWatching = whenVisible(box, (on) => (on ? gsap.ticker.add(curve) : gsap.ticker.remove(curve)));

    let down = false;
    let lastX = 0;
    let startX = 0;
    let resumeT: ReturnType<typeof setTimeout>;
    const resumeLater = (ms = 1500) => {
      clearTimeout(resumeT);
      resumeT = setTimeout(() => m?.resume(), ms);
    };

    // Inertia: release velocity from the last ~100 ms of the drag, then glide
    // with exponential friction until it's slow enough to hand back to the drift.
    let samples: [number, number][] = []; // [time, x]
    let v = 0; // px per ms
    const glide = () => {
      const dt = gsap.ticker.deltaRatio() * 16.67;
      m?.nudge(v * dt);
      v *= Math.pow(0.94, dt / 16.67);
      if (Math.abs(v) < 0.02) {
        gsap.ticker.remove(glide);
        resumeLater(900);
      }
    };
    const stopGlide = () => gsap.ticker.remove(glide);

    const onDown = (e: PointerEvent) => {
      down = true;
      dragged.current = false;
      lastX = startX = e.clientX;
      samples = [[e.timeStamp, e.clientX]];
      stopGlide();
      clearTimeout(resumeT);
      m?.pause();
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      m?.nudge(e.clientX - lastX);
      lastX = e.clientX;
      samples.push([e.timeStamp, e.clientX]);
      while (samples.length > 2 && e.timeStamp - samples[0][0] > 100) samples.shift();
      if (Math.abs(e.clientX - startX) > 6) dragged.current = true;
    };
    const onUp = (e: PointerEvent) => {
      if (!down) return;
      down = false;
      const [t0, x0] = samples[0];
      const dt = e.timeStamp - t0;
      // a finger that stopped before lifting (>100 ms since the last move) gets no fling
      v = dt > 0 && e.timeStamp - samples[samples.length - 1][0] < 100 ? (lastX - x0) / dt : 0;
      v = Math.max(-4, Math.min(4, v));
      if (Math.abs(v) > 0.05) gsap.ticker.add(glide);
      else resumeLater();
    };
    // Horizontal wheel / trackpad swipe: move directly, then — once the events stop
    // (fingers lifted; Linux browsers often send no momentum events) — glide with
    // the same inertia as a drag, from the speed of the last ~100 ms of events.
    let wheel: [number, number][] = []; // [time, px]
    let wheelEnd: ReturnType<typeof setTimeout>;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical scroll passes through
      e.preventDefault();
      stopGlide();
      clearTimeout(resumeT);
      m?.pause();
      const px = -e.deltaX * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? box.clientWidth : 1);
      m?.nudge(px);
      wheel.push([e.timeStamp, px]);
      while (wheel.length > 2 && e.timeStamp - wheel[0][0] > 100) wheel.shift();
      clearTimeout(wheelEnd);
      wheelEnd = setTimeout(() => {
        const span = wheel[wheel.length - 1][0] - wheel[0][0] + 16; // + one frame for the first event
        v = Math.max(-4, Math.min(4, wheel.reduce((sum, [, d]) => sum + d, 0) / span));
        wheel = [];
        if (Math.abs(v) > 0.05) gsap.ticker.add(glide);
        else resumeLater();
      }, 80);
    };

    box.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    box.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      clearTimeout(resumeT);
      clearTimeout(wheelEnd);
      stopGlide();
      stopWatching();
      ro.disconnect();
      gsap.ticker.remove(curve);
      m?.destroy();
      box.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      box.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center justify-between border-y border-white/15 px-4 py-3 md:px-8">
        <span className="kicker text-accent">{t.events.calendar}</span>
        <span className="kicker hidden text-paper/40 sm:inline">← {t.events.drag} →</span>
      </div>

      <div className="cursor-grab touch-pan-y overflow-hidden py-14 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] active:cursor-grabbing md:py-20">
        <div ref={track} className="marquee-track select-none">
          {[0, 1].map((k) => (
            <ul key={k} className="flex shrink-0" aria-hidden={k === 1}>
              {events.map((e, i) => {
                const w = when(e.date, t);
                const d = new Date(e.date + "T12:00:00");
                const label = e.recurring ? t.weekdaysPlural[d.getDay()] : `${w.day} ${w.mon}`;
                const accent = i % 3 === 1;
                return (
                  <li key={e.date} data-card className="w-[68vw] shrink-0 px-3 [perspective:1000px] md:w-[380px] md:px-6">
                    <a
                      href={club.tickets}
                      target="_blank"
                      rel="noreferrer"
                      draggable={false}
                      tabIndex={k === 1 ? -1 : undefined}
                      onClick={(ev) => dragged.current && ev.preventDefault()}
                      className="group block will-change-transform"
                    >
                      {/* Branded header */}
                      <div className="mb-2 flex items-center gap-2 text-accent">
                        <LogoMark className="h-7 w-7 shrink-0" />
                        <span className="font-display text-[0.95rem] uppercase leading-none tracking-tight md:text-lg">First Floor</span>
                        <span className="ml-auto text-[0.6rem] font-semibold uppercase tracking-widest text-paper/50">{w.year}</span>
                      </div>

                      {/* Poster */}
                      <div className={`relative aspect-square overflow-hidden border-[5px] ${accent ? "border-accent" : "border-paper"}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={e.image} alt="" draggable={false} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/10 to-ink/85" />
                        <p className="font-condensed absolute inset-x-3 top-3 text-[2.6rem] uppercase leading-[0.95] md:text-[3.2rem]">{e.title}</p>
                        <ul className="absolute bottom-3 left-3 text-[0.62rem] font-semibold uppercase leading-snug tracking-widest text-paper/85">
                          {e.lineup.map((n) => (
                            <li key={n}>{n}</li>
                          ))}
                        </ul>
                        <span className="absolute bottom-3 right-3 flex h-16 w-16 -rotate-12 items-center justify-center rounded-full bg-accent p-1 text-center text-[0.55rem] font-bold uppercase leading-tight text-accent-ink">
                          {e.genres[0]}
                          <br />€{e.ticketFrom}
                        </span>
                      </div>

                      {/* Big label */}
                      <div className="mt-2 flex items-start gap-2">
                        <p className={`font-condensed flex-1 overflow-hidden whitespace-nowrap pt-1 text-[3.2rem] uppercase leading-[1.05] md:text-[4.4rem] ${e.recurring ? "text-paper" : "text-accent"}`}>
                          {label}
                        </p>
                        <span className="mt-1 text-[0.55rem] font-semibold uppercase tracking-widest text-paper/50 [writing-mode:vertical-rl]">
                          {e.open} — {e.close}
                        </span>
                      </div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-paper/60">{e.subtitle[locale]}</p>
                    </a>
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
