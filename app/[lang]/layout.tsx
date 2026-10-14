import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Anton, Michroma, Syne } from "next/font/google";
import { getDict, isLocale, locales } from "@/content/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LogoSprite } from "@/components/Logo";
import "../globals.css";

const syne = Syne({ variable: "--font-body", subsets: ["latin"] });
const michroma = Michroma({ variable: "--font-michroma", weight: "400", subsets: ["latin"] });
const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"] });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: { languages: { pt: "/pt", en: "/en" } },
    openGraph: { title: t.meta.title, description: t.meta.description, images: ["/img/hero-poster.jpg"] },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  return (
    <html lang={lang} className={`${syne.variable} ${michroma.variable} ${anton.variable}`}>
      <body>
        <LogoSprite />
        <Header t={t} locale={lang} />
        {children}
        <Footer t={t} />
      </body>
    </html>
  );
}
