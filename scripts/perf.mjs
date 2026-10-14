// Usage: node scripts/perf.mjs [baseUrl] [cpuSlowdown]
// Phone-sized perf check with a throttled CPU (default 6×, roughly an old phone):
// scrolls the homepage section by section and prints fps, dropped frames and
// main-thread busy time per section, plus the page's total scroll length.
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3100";
const slowdown = Number(process.argv[3] ?? 6);

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await page.goto(`${base}/pt`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await cdp.send("Performance.enable");
await cdp.send("Emulation.setCPUThrottlingRate", { rate: slowdown });

const taskTime = async () =>
  (await cdp.send("Performance.getMetrics")).metrics.find((m) => m.name === "TaskDuration").value;

const vh = 844;
const total = await page.evaluate(() => document.documentElement.scrollHeight);
console.log(`scroll height: ${total}px (${(total / vh).toFixed(1)} screens), cpu ${slowdown}×`);

// Scroll at ~1 screen / 1.2 s (a relaxed thumb pace), measuring each screen.
const rows = [];
for (let y = 0; y < total - vh; y += vh) {
  const t0 = await taskTime();
  const r = await page.evaluate(
    ({ from, to }) =>
      new Promise((resolve) => {
        const dur = 1200;
        const start = performance.now();
        let frames = 0;
        let worst = 0;
        let last = start;
        const step = (now) => {
          frames++;
          worst = Math.max(worst, now - last);
          last = now;
          const p = Math.min((now - start) / dur, 1);
          window.scrollTo(0, from + (to - from) * p);
          if (p < 1) requestAnimationFrame(step);
          else {
            const el = document.elementFromPoint(195, 422)?.closest("section, footer");
            resolve({ frames, worst, secs: (now - start) / 1000, at: el?.id || el?.getAttribute("aria-label") || el?.tagName || "?" });
          }
        };
        requestAnimationFrame(step);
      }),
    { from: y, to: y + vh },
  );
  const busy = (await taskTime()) - t0;
  rows.push({ screen: y / vh, at: r.at, fps: +(r.frames / r.secs).toFixed(1), worstFrameMs: Math.round(r.worst), busyPct: Math.round((busy / r.secs) * 100) });
}
console.table(rows);
const avg = (k) => (rows.reduce((s, r) => s + r[k], 0) / rows.length).toFixed(1);
console.log(`avg fps ${avg("fps")}, avg main-thread busy ${avg("busyPct")}%`);

// Idle cost: sit still for 3 s at a few places (nothing should be ticking off-screen).
for (const frac of [0.12, 0.5]) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(total * frac));
  await page.waitForTimeout(800);
  const t0 = await taskTime();
  await page.waitForTimeout(3000);
  console.log(`idle at ${Math.round(frac * 100)}%: main-thread busy ${Math.round(((await taskTime()) - t0) / 3 * 100)}%`);
}

const vids = await page.evaluate(() => [...document.querySelectorAll("video")].map((v) => ({ src: v.currentSrc.split("/").slice(-2).join("/"), rate: v.playbackRate, paused: v.paused })));
console.log(vids);
await browser.close();
