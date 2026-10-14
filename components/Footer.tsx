import { club, type Dict } from "@/content/site";
import { LogoMark, LogoTagline, LogoWord } from "./Logo";
import { Arrow, Facebook, Instagram, Link as LinkIcon, WhatsApp } from "./Icons";

/** Simple ending: where / when / contact, one slow marquee line, then the footer. */
export default function Footer({ t }: { t: Dict }) {
  const l = t.location;
  const line = `${club.address} · Faro · Rhythm | Music | Energy | Life · `;
  return (
    <footer id="contactos" className="bg-ink">
      <div className="mx-auto grid max-w-[1400px] gap-10 border-t border-white/15 px-4 py-20 md:grid-cols-3 md:px-8 md:py-28">
        <div>
          <p className="kicker text-accent">{l.where}</p>
          <address className="mt-4 text-2xl not-italic leading-snug md:text-3xl">
            {club.address}
            <br />
            {club.city}
          </address>
          <a href={club.maps} target="_blank" rel="noreferrer" className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest hover:text-accent">
            {l.directions} <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
        <div>
          <p className="kicker text-accent">{l.hours}</p>
          <ul className="mt-4 space-y-1 text-2xl leading-snug md:text-3xl">
            {l.hoursShort.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="kicker text-accent">{l.contact}</p>
          <a href={club.phoneHref} className="mt-4 block text-2xl hover:text-accent md:text-3xl">
            {club.phone}
          </a>
          <div className="mt-5 flex gap-5">
            <a href={`https://wa.me/${club.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="hover:text-accent">
              <WhatsApp className="h-6 w-6" />
            </a>
            <a href={club.socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-accent">
              <Instagram className="h-6 w-6" />
            </a>
            <a href={club.socials.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-accent">
              <Facebook className="h-6 w-6" />
            </a>
            <a href={club.socials.linktree} target="_blank" rel="noreferrer" aria-label="Linktree" className="hover:text-accent">
              <LinkIcon className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>

      <div className="overflow-hidden border-y border-white/15 py-5 text-paper/80" aria-hidden>
        <div data-marquee="-1" className="marquee-track">
          {[0, 1].map((k) => (
            <span key={k} className="font-display shrink-0 whitespace-pre text-2xl uppercase md:text-4xl">
              {line.repeat(4)}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 pb-8 pt-16 md:px-8">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 text-paper">
              <LogoMark className="h-16 w-auto md:h-20" />
              <LogoWord className="h-12 w-auto md:h-16" />
            </div>
            <LogoTagline className="h-3 w-auto text-paper/60" />
          </div>
          <form action="#" className="w-full max-w-md">
            <p className="kicker text-paper/60">{l.newsletter}</p>
            <div className="mt-3 flex border-b border-white/30 focus-within:border-accent">
              <input type="email" required placeholder={l.email} className="flex-1 bg-transparent py-3 text-paper outline-none placeholder:text-paper/40" />
              <button className="text-sm font-semibold uppercase tracking-widest hover:text-accent">{l.subscribe}</button>
            </div>
          </form>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs uppercase tracking-widest text-paper/50 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {t.footer.links.map((x) => (
              <li key={x}>
                <a href="#" className="hover:text-paper">
                  {x}
                </a>
              </li>
            ))}
          </ul>
          <p>{t.footer.demo}</p>
          <p>
            © {new Date().getFullYear()} Grupo First · First Floor Club. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
