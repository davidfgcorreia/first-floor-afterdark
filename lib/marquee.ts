import gsap from "gsap";

/**
 * Shared scroll velocity (px per 60fps frame, smoothed) + direction.
 * Sampled ~8×/s from scrollY (not from scroll events, which a busy phone delivers
 * late and in bursts) and only while some marquee is on screen. Each sample
 * notifies the visible marquees, which retune their compositor animations.
 */
export const scrollState = { velocity: 0, dir: 1 };

const SAMPLE_MS = 125;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
let lastY = 0;
let lastT = 0;

function sample() {
  const y = window.scrollY;
  const t = performance.now();
  const raw = ((y - lastY) / Math.max(t - lastT, 1)) * 16.67;
  lastY = y;
  lastT = t;
  scrollState.velocity += (raw - scrollState.velocity) * 0.6;
  if (Math.abs(scrollState.velocity) < 0.05) scrollState.velocity = 0;
  if (Math.abs(raw) > 0.5) scrollState.dir = Math.sign(raw);
  listeners.forEach((fn) => fn());
}

/** Subscribe to velocity samples; the sampler runs only while someone listens. */
function onScrollSample(fn: () => void) {
  listeners.add(fn);
  if (!timer) {
    lastY = window.scrollY;
    lastT = performance.now();
    timer = setInterval(sample, SAMPLE_MS);
  }
  return () => {
    listeners.delete(fn);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

/** Touch-first device: native scrolling, no Lenis, tight scrubs. */
export const isTouch = () => typeof window !== "undefined" && matchMedia("(pointer: coarse)").matches;

/** ScrollTrigger scrub: smoothed on desktop, nearly direct on touch so it tracks the finger. */
export const scrub = (desktop: number) => (isTouch() ? 0.15 : desktop);

/**
 * Calls `on(true|false)` as `el` enters/leaves the viewport (plus `margin`).
 * Used to keep per-frame work off the ticker while its element is off-screen.
 */
export function whenVisible(el: Element, on: (visible: boolean) => void, margin = "20% 0px") {
  const io = new IntersectionObserver(([e]) => on(e.isIntersecting), { rootMargin: margin });
  io.observe(el);
  return () => io.disconnect();
}

export type Marquee = {
  pause: () => void;
  resume: () => void;
  nudge: (px: number) => void;
  x: () => number;
  half: () => number;
  destroy: () => void;
};

const compositorOK = () =>
  typeof Element !== "undefined" &&
  typeof Element.prototype.animate === "function" &&
  typeof Animation !== "undefined" &&
  "updatePlaybackRate" in Animation.prototype;

/**
 * Infinite marquee on an element whose content is duplicated once (wraps at 50%).
 * Speed follows scroll velocity and direction flips with scroll direction, Amnesia-style.
 *
 * Runs as a Web Animation, i.e. on the compositor thread: it keeps moving smoothly
 * even while the main thread is busy. JS only retunes its playbackRate ~8×/s from
 * the sampled scroll velocity (updatePlaybackRate keeps the position — no jumps);
 * in between, the compositor extrapolates at the last speed. Paused off-screen.
 */
export function createVelocityMarquee(el: HTMLElement, dir = 1, base = 0.6): Marquee {
  if (!compositorOK()) return tickerMarquee(el, dir, base);

  const pxPerMs = base * 0.06; // base is px per 60fps frame
  let half = 0;
  let D = 0; // ms for one wrap at rate 1
  let anim: Animation | null = null;
  let paused = false;
  let visible = false;
  let rate = dir;

  const time = () => Number(anim?.currentTime ?? 0);
  const phase = () => (D ? (((time() % D) + D) % D) / D : 0);
  const target = () => {
    const v = Math.min(Math.abs(scrollState.velocity), 30);
    return dir * scrollState.dir * (1 + (v * 0.25) / base);
  };
  const retune = () => {
    if (!anim || paused) return;
    const r = target();
    if (Math.sign(r) !== Math.sign(rate) || Math.abs(r - rate) > 0.05 * Math.abs(rate)) {
      rate = r;
      anim.updatePlaybackRate(r);
    }
  };
  const run = () => {
    if (anim && visible && !paused) anim.play();
    else anim?.pause();
  };

  const build = () => {
    const h = el.scrollWidth / 2;
    if (!h || h === half) return;
    const p = phase();
    half = h;
    D = half / pxPerMs;
    anim?.cancel();
    anim = el.animate([{ transform: "translate3d(0,0,0)" }, { transform: `translate3d(${-half}px,0,0)` }], {
      duration: D,
      iterations: Infinity,
      easing: "linear",
    });
    anim.playbackRate = rate;
    anim.currentTime = D * 1e4 + p * D; // far from 0, so reversing never hits the start
    run();
  };

  build();
  const ro = new ResizeObserver(build);
  ro.observe(el);
  document.fonts?.ready.then(build);

  let unlisten = () => {};
  const stopWatching = whenVisible(el.parentElement ?? el, (on) => {
    visible = on;
    unlisten();
    unlisten = on ? onScrollSample(retune) : () => {};
    run();
  });

  return {
    pause: () => {
      paused = true;
      run();
    },
    resume: () => {
      paused = false;
      run();
    },
    nudge: (px: number) => {
      if (anim && half) anim.currentTime = time() - (px / half) * D;
    },
    x: () => -phase() * half,
    half: () => half,
    destroy: () => {
      stopWatching();
      unlisten();
      ro.disconnect();
      anim?.cancel();
    },
  };
}

/** Fallback for browsers without updatePlaybackRate: main-thread ticker, same behaviour. */
function tickerMarquee(el: HTMLElement, dir: number, base: number): Marquee {
  let x = 0;
  let half = 0;
  let paused = false;
  const measure = () => (half = el.scrollWidth / 2);
  const tick = () => {
    if (!half) return;
    if (!paused) {
      const v = Math.min(Math.abs(scrollState.velocity), 30);
      x -= (base + v * 0.25) * dir * scrollState.dir * gsap.ticker.deltaRatio();
    }
    if (x <= -half) x += half;
    if (x > 0) x -= half;
    el.style.transform = `translate3d(${x}px,0,0)`;
  };

  measure();
  const ro = new ResizeObserver(measure);
  ro.observe(el);
  document.fonts?.ready.then(measure);
  let unlisten = () => {};
  const stopWatching = whenVisible(el.parentElement ?? el, (on) => {
    unlisten();
    unlisten = on ? onScrollSample(() => {}) : () => {};
    if (on) gsap.ticker.add(tick);
    else gsap.ticker.remove(tick);
  });

  return {
    pause: () => (paused = true),
    resume: () => (paused = false),
    nudge: (px: number) => (x += px),
    x: () => x,
    half: () => half,
    destroy: () => {
      stopWatching();
      unlisten();
      ro.disconnect();
      gsap.ticker.remove(tick);
    },
  };
}

export const reducedMotion = () =>
  typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Phone layout breakpoint (matches Tailwind's `md`). */
export const MOBILE = "(max-width: 767px)";
