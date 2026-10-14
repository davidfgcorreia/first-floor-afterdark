"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { club, type Dict, type Locale } from "@/content/site";
import { LogoLockup } from "./Logo";
import { Close, Facebook, Instagram, Link as LinkIcon } from "./Icons";
import { lenis } from "./Motion";

export default function Header({ t, locale }: { t: Dict; locale: Locale }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    // Without Lenis (touch devices, pages without Motion) lock the page natively.
    if (!lenis) document.documentElement.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  const other: Locale = locale === "pt" ? "en" : "pt";
  const pathname = usePathname() ?? `/${locale}`;
  // Same page in the other language; "#x" and "/x" hrefs are made locale-absolute.
  const switchHref = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${other}`);
  const to = (href: string) => `/${locale}${href.startsWith("/") ? href : `${href.startsWith("#") ? "" : "/"}${href}`}`;

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-ink"
      >
        <div className="mx-auto flex h-16 items-center justify-between gap-4 px-4 md:h-20 md:px-8">
          <a href={`/${locale}`} className="h-8 text-paper md:h-10" aria-label="First Floor Club">
            <LogoLockup className="h-full" />
          </a>
          <nav className="flex items-center gap-2 md:gap-3">
            <a href={to("#eventos")} className="btn btn-accent !px-4 md:!px-6">
              {t.nav.tickets}
            </a>
            <a href={to("/vip")} className="btn btn-ghost hidden !px-5 sm:inline-flex">
              {t.nav.vip}
            </a>
            <a
              href={switchHref}
              className="kicker hidden px-2 py-2 text-paper/70 transition-colors hover:text-paper md:block"
              aria-label={other === "en" ? "English" : "Português"}
            >
              {locale.toUpperCase()} <span className="text-paper/30">/</span> {other.toUpperCase()}
            </a>
            <button
              onClick={() => setOpen(true)}
              className="group ml-1 flex h-10 w-10 flex-col items-center justify-center gap-[6px]"
              aria-label={t.nav.menu}
              aria-expanded={open}
            >
              <span className="h-[2px] w-7 bg-paper transition-all group-hover:w-5" />
              <span className="h-[2px] w-7 bg-paper" />
              <span className="h-[2px] w-7 bg-paper transition-all group-hover:w-5" />
            </button>
          </nav>
        </div>
      </header>

      {/* Pacha-style full-screen overlay */}
      <div
        className={`fixed inset-0 z-50 flex flex-col bg-accent text-accent-ink transition-[opacity,visibility] duration-300 ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <div className="flex h-16 items-center justify-between px-4 md:h-20 md:px-8">
          <a
            href={switchHref}
            className="kicker opacity-80 hover:opacity-100"
          >
            {locale.toUpperCase()} / {other.toUpperCase()}
          </a>
          <button onClick={() => setOpen(false)} aria-label={t.nav.close} className="p-2">
            <Close className="h-8 w-8" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col items-center justify-center gap-1 px-4 text-center md:gap-2">
          {t.nav.items.map(([label, href], i) => (
            <a
              key={label}
              href={to(href)}
              onClick={() => setOpen(false)}
              className={`text-[clamp(1.9rem,5.2vw,3.6rem)] font-semibold uppercase leading-[1.15] tracking-tight transition-[opacity,transform] duration-500 hover:opacity-60 ${
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
            >
              {label}
            </a>
          ))}
          <div className="mt-10 flex items-center gap-6">
            <a href={club.socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
              <Instagram className="h-6 w-6" />
            </a>
            <a href={club.socials.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
              <Facebook className="h-6 w-6" />
            </a>
            <a href={club.socials.linktree} target="_blank" rel="noreferrer" aria-label="Linktree">
              <LinkIcon className="h-6 w-6" />
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
