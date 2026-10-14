/**
 * Amnesia-style wall of repeated type. Rows alternate direction (data-marquee)
 * and mix solid/outline; each row starts at a different letter offset.
 */
export default function KineticWall({
  words,
  rows = 4,
  className = "",
  rowClassName = "",
  outline = "alternate",
  sep = " · ",
}: {
  words: string[];
  rows?: number;
  className?: string;
  rowClassName?: string;
  outline?: "alternate" | "all" | "none";
  sep?: string;
}) {
  const unit = words.join(sep) + sep;
  const line = unit.repeat(Math.ceil(60 / unit.length));
  return (
    <div className={`pointer-events-none select-none overflow-hidden ${className}`} aria-hidden>
      {Array.from({ length: rows }, (_, r) => {
        const shift = (r * 2) % unit.length;
        const text = line.slice(shift) + line.slice(0, shift);
        return (
          <div key={r} className="overflow-hidden">
            <div data-marquee={r % 2 ? -1 : 1} className="marquee-track">
              {[0, 1].map((k) => (
                <span
                  key={k}
                  className={`font-display shrink-0 whitespace-pre uppercase leading-[1.02] ${
                    outline === "all" || (outline === "alternate" && r % 2) ? "outline-text" : ""
                  } ${rowClassName}`}
                >
                  {text}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
