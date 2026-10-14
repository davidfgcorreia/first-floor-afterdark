"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { club, type Dict, type Locale } from "@/content/site";
import type { TableStatus, VipNight } from "@/content/vip";
import { WhatsApp } from "../Icons";
import ZonePicker, { type Pick } from "./ZonePicker";

gsap.registerPlugin(useGSAP);

const field =
  "w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-paper outline-none transition placeholder:text-paper/40 focus:border-accent focus:bg-white/10";

/** Pacha-style booking: sidebar with event + stepper, main panel with the current step. */
export default function Booking({
  t,
  locale,
  night,
  status,
}: {
  t: Dict;
  locale: Locale;
  night: VipNight;
  status: Record<string, TableStatus>;
}) {
  const v = t.vipPage;
  const root = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [pick, setPick] = useState<Pick | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", note: "" });
  const [guests, setGuests] = useState(4);

  const d = new Date(night.date + "T12:00:00");
  const dateLine = `${t.weekdays[d.getDay()]}, ${d.getDate()} ${t.months[d.getMonth()]} ${d.getFullYear()} | ${night.open} – ${night.close}`;
  const maxGuests = pick?.table.pax ?? 20;

  useGSAP(
    () => {
      gsap.fromTo("[data-step]", { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" });
    },
    { scope: root, dependencies: [step] },
  );
  useGSAP(
    () => {
      if (pick) gsap.fromTo("[data-bar]", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.6)" });
    },
    { scope: root, dependencies: [pick?.table.id] },
  );

  const go = (s: number) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const whatsapp = () => {
    if (!pick) return "#";
    const lines = [
      v.msg,
      `${v.night}: ${night.title} — ${dateLine}`,
      `${v.zone}: ${pick.zone.name[locale]} · ${v.table} ${pick.table.id}`,
      `${v.guests}: ${guests}`,
      `${v.minimum}: €${pick.table.min}`,
      `${v.name}: ${form.name}`,
      `${v.phone}: ${form.phone}`,
      form.email && `${v.email}: ${form.email}`,
      form.note && `${form.note}`,
    ].filter(Boolean);
    return `https://wa.me/${club.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  return (
    <div ref={root} className="mx-auto grid max-w-[1400px] gap-6 px-4 pb-24 pt-6 md:px-8 lg:grid-cols-[340px_minmax(0,1fr)]">
      {/* Sidebar */}
      <aside className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]">
          <div className="relative h-40 lg:h-56">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={night.image} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a0010] via-accent/30 to-transparent" />
            {night.special && (
              <span className="absolute right-4 top-4 rounded-full bg-accent px-3 py-1 text-[0.6rem] font-bold uppercase tracking-widest text-accent-ink">
                ✦ {v.special}
              </span>
            )}
          </div>
          <div className="p-5 md:p-6">
            <a href={`/${locale}/vip`} className="text-xs uppercase tracking-widest text-paper/50 hover:text-paper">
              ‹ {v.back}
            </a>
            <h1 className="font-condensed mt-3 text-4xl uppercase leading-none md:text-5xl">{night.title}</h1>
            <p className="mt-2 text-sm text-paper/60">{dateLine}</p>

            <ol className="mt-6 hidden lg:block">
              {v.steps.map((s, i) => (
                <li key={s} className="relative flex items-center gap-3 pb-7 last:pb-0">
                  {i < v.steps.length - 1 && <span className="absolute left-[13px] top-7 h-[calc(100%-1.75rem)] border-l border-dashed border-white/25" />}
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                      i === step ? "bg-accent text-accent-ink shadow-[0_0_16px_rgb(229_0_126/0.6)]" : i < step ? "bg-paper text-ink" : "bg-white/10 text-paper/50"
                    }`}
                  >
                    {i < step ? "✓" : i + 1}
                  </span>
                  <span className={`text-sm font-semibold uppercase tracking-wide ${i === step ? "text-paper" : "text-paper/45"}`}>{s}</span>
                </li>
              ))}
            </ol>
            {/* mobile stepper */}
            <div className="mt-5 grid grid-cols-3 gap-1.5 rounded-full bg-white/5 p-1.5 lg:hidden">
              {v.steps.map((s, i) => (
                <span
                  key={s}
                  className={`truncate rounded-full px-2 py-1.5 text-center text-[0.6rem] font-semibold uppercase ${
                    i === step ? "bg-accent text-accent-ink" : i < step ? "bg-white/10" : "text-paper/45"
                  }`}
                >
                  {i < step ? "✓ " : `${i + 1}. `}
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-6 hidden rounded-2xl border border-white/10 p-4 text-xs text-paper/60 lg:block">
              <p>{v.help}</p>
              <div className="mt-3 flex items-center justify-between border-t border-dashed border-white/15 pt-3">
                <a href={`https://wa.me/${club.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-paper">
                  <WhatsApp className="h-4 w-4" /> WhatsApp
                </a>
                <a href={club.phoneHref} className="hover:text-paper">
                  {club.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main panel */}
      <div className="min-w-0 rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 md:p-8">
        {step === 0 && (
          <div data-step>
            <ZonePicker t={t} locale={locale} status={status} open={open} setOpen={setOpen} pick={pick} setPick={setPick} />
          </div>
        )}

        {step === 1 && pick && (
          <form
            data-step
            onSubmit={(e) => {
              e.preventDefault();
              go(2);
            }}
          >
            <h2 className="mb-6 text-2xl font-semibold uppercase md:text-3xl">{v.contactTitle}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <input required placeholder={v.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
              <input required type="tel" placeholder={v.phone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={field} />
              <input type="email" placeholder={v.email} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${field} md:col-span-2`} />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white/5 p-4">
              <p className="text-sm uppercase tracking-widest text-paper/60">
                {v.guests} <span className="text-paper/40">({v.upTo} {pick.table.pax})</span>
              </p>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} className="h-12 w-12 rounded-full border border-white/15 text-xl transition hover:border-accent hover:bg-accent" aria-label="-">
                  −
                </button>
                <span className="w-12 text-center text-4xl font-bold tabular-nums">{guests}</span>
                <button type="button" onClick={() => setGuests(Math.min(maxGuests, guests + 1))} className="h-12 w-12 rounded-full border border-white/15 text-xl transition hover:border-accent hover:bg-accent" aria-label="+">
                  +
                </button>
              </div>
            </div>
            <textarea placeholder={v.note} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={3} className={`${field} mt-3 resize-none`} />
            <div className="mt-6 flex gap-2">
              <button type="button" onClick={() => go(0)} className="btn btn-ghost rounded-full border-white/25">
                {v.stepBack}
              </button>
              <button type="submit" className="btn btn-accent flex-1 rounded-full">
                {v.continue}
              </button>
            </div>
          </form>
        )}

        {step === 2 && pick && (
          <div data-step>
            <h2 className="mb-6 text-2xl font-semibold uppercase md:text-3xl">{v.summaryTitle}</h2>
            <dl className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2">
              {[
                [v.night, `${night.title}`],
                ["", dateLine],
                [v.zone, `${pick.zone.name[locale]} · ${v.table} ${pick.table.id}`],
                [v.guests, `${guests} (${v.upTo} ${pick.table.pax})`],
                [v.minimum, `€${pick.table.min}`],
                [v.included, pick.zone.included[locale]],
                [v.contact, [form.name, form.phone, form.email].filter(Boolean).join(" · ")],
                ...(form.note ? [["✎", form.note]] : []),
              ].map(([k, val], i) => (
                <div key={i} className="bg-ink p-4">
                  <dt className="text-[0.65rem] uppercase tracking-widest text-paper/45">{k || " "}</dt>
                  <dd className={`mt-1 ${k === v.minimum ? "text-2xl font-bold text-accent" : "font-semibold"}`}>{val}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-paper/60">{v.drinks}.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" onClick={() => go(1)} className="btn btn-ghost rounded-full border-white/25">
                {v.stepBack}
              </button>
              <a href={whatsapp()} target="_blank" rel="noreferrer" data-confirm className="btn btn-accent flex-1 rounded-full">
                <WhatsApp className="h-5 w-5" /> {v.confirm}
              </a>
            </div>
            <a href={club.phoneHref} className="mt-4 inline-block text-sm text-paper/60 hover:text-paper">
              {v.orCall}: {club.phone}
            </a>
          </div>
        )}
      </div>

      {/* Sticky selection bar */}
      {step === 0 && pick && (
        <div data-bar className="fixed inset-x-3 bottom-3 z-30 mx-auto max-w-3xl rounded-full border border-accent/40 bg-ink/90 p-2 pl-5 shadow-[0_0_40px_rgb(229_0_126/0.35)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <p className="min-w-0 flex-1 truncate text-sm">
              <span className="font-bold">
                {pick.zone.name[locale]} · {v.table} {pick.table.id}
              </span>
              <span className="text-paper/60">
                {" "}
                · {v.upTo} {pick.table.pax} {v.people} · {v.min} €{pick.table.min}
              </span>
            </p>
            <button
              type="button"
              onClick={() => {
                setGuests(Math.min(guests, pick.table.pax));
                go(1);
              }}
              className="btn btn-accent shrink-0 rounded-full"
            >
              {v.continue}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
