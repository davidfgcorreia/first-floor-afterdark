import { logoPaths } from "./logoPaths";

type Part = keyof typeof logoPaths;

const size = (part: Part) => logoPaths[part].vb.split(" ").slice(2).map(Number) as [number, number];

/**
 * The traced logo paths, defined ONCE per page (rendered in the layout).
 * Every logo instance below is a tiny <use> reference to these symbols, instead
 * of repeating ~30 KB of path data each time.
 */
export function LogoSprite() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        {(Object.keys(logoPaths) as Part[]).map((part) => (
          <symbol key={part} id={`ff-${part}`} viewBox={logoPaths[part].vb}>
            <path d={logoPaths[part].d} fillRule={logoPaths[part].fr as "evenodd"} fill="currentColor" />
          </symbol>
        ))}
      </defs>
    </svg>
  );
}

/** A reference to one sprite symbol, sized to its own viewBox (use inside an <svg>). */
export function LogoUse({ part, ...props }: { part: Part } & React.SVGProps<SVGUseElement>) {
  const [w, h] = size(part);
  return <use href={`#ff-${part}`} width={w} height={h} {...props} />;
}

function Svg({ part, className, title }: { part: Part; className?: string; title?: string }) {
  return (
    <svg
      viewBox={logoPaths[part].vb}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <LogoUse part={part} />
    </svg>
  );
}

/** Circle "CLUB" mark with the rack of 10 dots. */
export const LogoMark = ({ className }: { className?: string }) => (
  <Svg part="mark" className={className} />
);

// Geometry measured from the traced mark (viewBox 0 0 801 801).
const RINGS = [
  { r: 386.5, w: 16 },
  { r: 319.5, w: 6 },
];
const DOTS: [number, number][] = [
  [391.5, 203.5],
  [340.5, 301.5], [451, 300],
  [292.5, 402], [400.5, 400.5], [509, 399],
  [241.5, 499.5], [349.5, 498], [460, 495.5], [568.5, 493.5],
];

/**
 * The mark rebuilt from parts so it can be animated piece by piece:
 * [data-ring] circles (pathLength=1 → animate strokeDashoffset 1→0),
 * [data-dot] circles, and [data-club] (the traced "CLUB" lettering).
 */
export function LogoMarkParts({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 801 801" className={className} aria-hidden>
      <defs>
        <clipPath id="club-clip">
          <rect x="150" y="545" width="500" height="120" />
        </clipPath>
      </defs>
      {RINGS.map((ring) => (
        <circle
          key={ring.r}
          data-ring
          cx="400.5"
          cy="400.5"
          r={ring.r}
          fill="none"
          stroke="currentColor"
          strokeWidth={ring.w}
          pathLength={1}
          strokeDasharray="1"
          transform="rotate(-90 400.5 400.5)"
        />
      ))}
      {DOTS.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} data-dot cx={cx} cy={cy} r="43.5" fill="currentColor" style={{ transformOrigin: `${cx}px ${cy}px` }} />
      ))}
      <LogoUse part="mark" data-club clipPath="url(#club-clip)" />
    </svg>
  );
}

/** "First Floor" wordmark. */
export const LogoWord = ({ className }: { className?: string }) => (
  <Svg part="word" className={className} title="First Floor Club" />
);

/** RHYTHM | MUSIC | ENERGY | LIFE */
export const LogoTagline = ({ className }: { className?: string }) => (
  <Svg part="tag" className={className} />
);

/** Horizontal lockup: mark + wordmark (+ optional tagline), as in the official logo. */
export function LogoLockup({ className, tagline = false }: { className?: string; tagline?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-[0.35em] ${className ?? ""}`}>
      <LogoMark className="h-full w-auto" />
      <span className="flex h-full flex-col justify-center gap-[0.08em]">
        <LogoWord className={tagline ? "h-[72%] w-auto" : "h-[82%] w-auto"} />
        {tagline && <LogoTagline className="h-[12%] w-auto" />}
      </span>
    </span>
  );
}
