import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getDict, isLocale } from "@/content/site";
import { vipNights } from "@/content/vip";
import VipEvents from "@/components/vip/VipEvents";

export async function generateMetadata({ params }: PageProps<"/[lang]/vip">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? { title: getDict(lang).vipPage.metaTitle } : {};
}

export default async function VipPage({ params }: PageProps<"/[lang]/vip">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await connection(); // the list starts from today, so render per request
  const t = getDict(lang);
  const v = t.vipPage;
  const nights = vipNights(new Date());

  return (
    <main className="pt-[var(--header-h)]">
      <section className="relative mb-12 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/vip-poster.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/60 to-ink" />
        <div className="relative mx-auto max-w-[1400px] px-4 pb-12 pt-20 md:px-8 md:pb-16 md:pt-28">
          <p className="kicker text-accent">{v.kicker}</p>
          <h1 className="mt-4 text-[clamp(3rem,9vw,7.5rem)] font-semibold uppercase leading-[0.88] tracking-tight">{v.title}</h1>
          <p className="mt-6 max-w-xl text-lg text-paper/80">{v.intro}</p>
        </div>
      </section>
      <VipEvents t={t} locale={lang} nights={nights} />
    </main>
  );
}
