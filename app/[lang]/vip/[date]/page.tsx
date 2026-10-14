import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/content/site";
import { tableStatus, vipNight, zones } from "@/content/vip";
import Booking from "@/components/vip/Booking";

export async function generateMetadata({ params }: PageProps<"/[lang]/vip/[date]">): Promise<Metadata> {
  const { lang, date } = await params;
  const night = vipNight(date);
  return isLocale(lang) && night ? { title: `${night.title} · ${getDict(lang).vipPage.metaTitle}` } : {};
}

export default async function BookingPage({ params }: PageProps<"/[lang]/vip/[date]">) {
  const { lang, date } = await params;
  if (!isLocale(lang) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();
  const night = vipNight(date);
  if (!night) notFound(); // closed (Sun/Mon) or invalid
  const status = Object.fromEntries(zones.flatMap((z) => z.tables.map((tb) => [tb.id, tableStatus(date, tb.id, night.special)])));

  return (
    <main className="pt-[var(--header-h)]">
      <Booking t={getDict(lang)} locale={lang} night={night} status={status} />
    </main>
  );
}
