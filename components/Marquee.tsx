import { LogoMark } from "./Logo";

function Row({ words, dir, outline, light }: { words: string[]; dir: 1 | -1; outline: boolean; light: boolean }) {
  const items = [...words, ...words, ...words];
  return (
    <div className="overflow-hidden">
      {/* Content is duplicated so Motion can wrap seamlessly at 50%. */}
      <div data-marquee={dir} className="marquee-track">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
            {items.map((w, i) => (
              <span key={i} className="flex items-center">
                <span
                  className={`font-display px-6 text-[clamp(2.6rem,8vw,7.5rem)] uppercase leading-[1.1] md:px-10 ${
                    outline && i % 2 ? `outline-text ${light ? "on-light" : ""}` : ""
                  }`}
                >
                  {w}
                </span>
                <LogoMark className="h-[clamp(2rem,5vw,4.5rem)] w-auto shrink-0" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Scroll-driven type band: two rows moving in opposite directions. */
export default function Marquee({ words, light = false }: { words: string[]; light?: boolean }) {
  return (
    <section
      aria-label={words.join(" ")}
      className={`relative overflow-hidden py-10 md:py-14 ${light ? "bg-paper text-ink" : "bg-ink text-paper"}`}
    >
      <Row words={words} dir={1} outline light={light} />
      <Row words={words} dir={-1} outline={false} light={light} />
    </section>
  );
}
