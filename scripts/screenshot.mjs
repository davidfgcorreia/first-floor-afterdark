// Usage: node scripts/screenshot.mjs <round> [baseUrl]
// Captures, per viewport: a clean full page (reduced motion), a sequence of
// viewport frames while scrolling (motion on), the menu overlay, and the events carousel mid-drag.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const round = process.argv[2] ?? "r1";
const base = process.argv[3] ?? "http://localhost:3100";
const out = `screenshots/${round}`;
mkdirSync(out, { recursive: true });

const viewports = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844, isMobile: true, deviceScaleFactor: 2, hasTouch: true },
};

const browser = await chromium.launch();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

for (const [name, vp] of Object.entries(viewports)) {
  const { width, height, ...rest } = vp;

  // 1. Clean full page, no motion
  {
    const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", ...rest });
    const page = await ctx.newPage();
    await page.goto(`${base}/pt`, { waitUntil: "networkidle" });
    // load lazy images
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await wait(800);
    await page.screenshot({ path: `${out}/${name}-full.png`, fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    console.log(`${name}: horizontal overflow = ${overflow}px`);
    await ctx.close();
  }

  // 2. Scroll sequence + menu, motion on
  {
    const ctx = await browser.newContext({ viewport: { width, height }, ...rest });
    const page = await ctx.newPage();
    await page.goto(`${base}/pt`, { waitUntil: "networkidle" });
    await wait(1200);
    const total = await page.evaluate(() => document.body.scrollHeight);
    let i = 0;
    const step = Math.round(height * (name === "desktop" ? 0.5 : 0.9));
    for (let y = 0; y < total; y += step) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await wait(900);
      await page.screenshot({ path: `${out}/${name}-scroll-${String(i++).padStart(2, "0")}.png` });
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await wait(600);
    await page.click('button[aria-expanded]');
    await wait(900);
    await page.screenshot({ path: `${out}/${name}-menu.png` });
    await ctx.close();
  }
}

// 3. Events poster carousel, mid-drag (desktop)
{
  const ctx = await browser.newContext({ viewport: viewports.desktop });
  const page = await ctx.newPage();
  await page.goto(`${base}/pt`, { waitUntil: "networkidle" });
  await wait(800);
  await page.evaluate(() => document.querySelector("#eventos [data-card]")?.scrollIntoView({ block: "center" }));
  await wait(1500);
  const box = await page.locator("#eventos [data-card]").first().boundingBox();
  if (box) {
    const y = box.y + box.height / 2;
    await page.mouse.move(900, y);
    await page.mouse.down();
    await page.mouse.move(600, y, { steps: 12 });
    await wait(300);
    await page.screenshot({ path: `${out}/desktop-events-drag.png` });
    await page.mouse.up();
  }
  await ctx.close();
}

// 4. VIP pages: events grid + booking flow (desktop + mobile)
for (const [name, vp] of Object.entries(viewports)) {
  const { width, height, ...rest } = vp;
  const ctx = await browser.newContext({ viewport: { width, height }, ...rest });
  const page = await ctx.newPage();
  const shot = (n) => page.screenshot({ path: `${out}/vip-${name}-${n}.png` });

  await page.goto(`${base}/pt/vip`, { waitUntil: "networkidle" });
  await wait(900);
  await shot("1-events");
  await page.evaluate(() => window.scrollTo(0, 700));
  await wait(700);
  await shot("2-events-grid");
  await page.getByRole("button", { name: "Out", exact: true }).click();
  await wait(900);
  await shot("3-events-out");

  await page.goto(`${base}/pt/vip/2026-10-31`, { waitUntil: "networkidle" });
  await wait(900);
  await shot("4-booking");
  await page.locator("[data-zone] > button").nth(1).click();
  await wait(900);
  await shot("5-zone-open");
  await page.locator("[data-table]:not([disabled])").first().click();
  await wait(700);
  await shot("6-table-picked");
  await page.getByRole("button", { name: "Continuar" }).last().click();
  await wait(900);
  await page.getByPlaceholder("Nome").fill("Ana Silva");
  await page.getByPlaceholder("Telemóvel").fill("+351 912 345 678");
  await shot("7-contact");
  await page.getByRole("button", { name: "Continuar" }).click();
  await wait(900);
  await shot("8-summary");
  console.log(`${name} whatsapp:`, decodeURIComponent((await page.locator("[data-confirm]").getAttribute("href")) ?? "").slice(0, 300));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(`${name} booking overflow = ${overflow}px`);
  await ctx.close();
}

await browser.close();
console.log(`saved to ${out}/`);
