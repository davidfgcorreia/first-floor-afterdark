import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/content/site";
import Motion from "@/components/Motion";
import Hero from "@/components/Hero";
import Events from "@/components/Events";
import WeeklyNights from "@/components/WeeklyNights";
import Marquee from "@/components/Marquee";
import Manifesto from "@/components/Manifesto";
import Vip from "@/components/Vip";
import Gallery from "@/components/Gallery";

// Order follows Omnia: iconic hero → events → everything else.
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);

  return (
    <>
      <Motion />
      <main className="pt-[var(--header-h)]">
        <Hero t={t} locale={lang} />
        <Events t={t} locale={lang} />
        <WeeklyNights t={t} locale={lang} />
        <Marquee words={["Rhythm", "Music", "Energy", "Life"]} />
        <Manifesto t={t} />
        <Vip t={t} locale={lang} />
        <Gallery t={t} />
      </main>
    </>
  );
}
