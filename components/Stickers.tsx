import { LogoUse } from "./Logo";

/**
 * Round accent badge: text on a circle spins slowly around the logo mark.
 * The spinning ring is its own <svg> box so the rotation is composited
 * (rotating an element inside an SVG repaints it every frame).
 */
export function RoundBadge({ text, className }: { text: string; className?: string }) {
  return (
    <div className={`relative aspect-square ${className ?? ""}`} aria-hidden>
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
        <circle cx="100" cy="100" r="99" fill="var(--accent)" />
        <LogoUse part="mark" transform="translate(62 62) scale(0.0949)" style={{ color: "var(--accent-ink)" }} />
      </svg>
      <svg data-spin viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-[spin_20s_linear_infinite] will-change-transform">
        <defs>
          <path id="badge-circle" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
        </defs>
        <text fill="var(--accent-ink)" style={{ fontFamily: "var(--font-michroma)", fontSize: 13.5, letterSpacing: 2.6 }}>
          <textPath href="#badge-circle">{text}</textPath>
        </text>
      </svg>
    </div>
  );
}

/** Floating decoration: parallax (data-speed) on the outer box, idle bob (data-float) inside. */
export function Sticker({
  children,
  className,
  speed,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  return (
    <div className={`pointer-events-none absolute z-10 ${className ?? ""}`} data-speed={speed}>
      <div data-float>{children}</div>
    </div>
  );
}
