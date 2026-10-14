// Record a short, reproducible local walkthrough. Does not send a booking request.
import { chromium } from 'playwright';
import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const base = process.argv[2] ?? 'http://127.0.0.1:3100';
const nextSaturday = new Date();
nextSaturday.setDate(nextSaturday.getDate() + ((6 - nextSaturday.getDay() + 7) % 7 || 7));
const date = process.argv[3] ?? nextSaturday.toISOString().slice(0, 10);
mkdirSync('demo/raw', { recursive: true });
const errors = [];
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir: 'demo/raw', size: { width: 1280, height: 800 } } });
const page = await context.newPage();
page.on('pageerror', e => errors.push(e.message));
await page.goto(`${base}/pt`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);
await page.evaluate(() => window.scrollTo({ top: 450, behavior: 'smooth' }));
await page.waitForTimeout(1800);
await page.screenshot({ path: 'demo/desktop.png' });
await page.locator('button[aria-expanded]').click();
await page.waitForTimeout(1100);
await page.screenshot({ path: 'demo/menu.png' });
await page.getByRole('button', { name: 'Fechar', exact: true }).click();
for (const id of ['eventos', 'noites', 'vip', 'galeria']) {
  await page.evaluate(id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), id);
  await page.waitForTimeout(1600);
}
await page.goto(`${base}/pt/vip`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.goto(`${base}/pt/vip/${date}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.locator('[data-zone] > button').nth(1).click();
await page.waitForTimeout(500);
await page.locator('[data-table]:not([disabled])').first().click();
await page.waitForTimeout(500);
await page.getByRole('button', { name: 'Continuar' }).last().click();
await page.waitForTimeout(650);
await page.getByPlaceholder('Nome').fill('Demo Visitor');
await page.getByPlaceholder('Telemóvel').fill('+351 900 000 000');
await page.getByRole('button', { name: 'Continuar' }).click();
await page.waitForTimeout(1700);
await page.screenshot({ path: 'demo/vip-summary.png' });
const bookingOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
// The generated confirmation link is reviewed but never opened or submitted.
const hasConfirmation = await page.locator('[data-confirm]').count() === 1;
const recording = page.video();
await context.close();
const raw = await recording.path();
renameSync(raw, 'demo/raw/walkthrough.webm');
const cover = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
const coverPage = await cover.newPage();
await coverPage.goto(`${base}/pt`, { waitUntil: 'networkidle' });
await coverPage.screenshot({ path: 'demo/desktop.png' });
await cover.close();
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
const phone = await mobile.newPage();
phone.on('pageerror', e => errors.push(e.message));
await phone.goto(`${base}/pt`, { waitUntil: 'networkidle' });
await phone.waitForTimeout(800);
await phone.screenshot({ path: 'demo/mobile.png' });
const mobileOverflow = await phone.evaluate(() => document.documentElement.scrollWidth - innerWidth);
await phone.goto(`${base}/en`, { waitUntil: 'networkidle' });
await phone.waitForTimeout(500);
await phone.screenshot({ path: 'demo/english.png' });
await mobile.close();
await browser.close();
function ffmpeg(args) {
  const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error('ffmpeg failed; install ffmpeg to encode the recording.');
}
ffmpeg(['-i', 'demo/raw/walkthrough.webm', '-r', '24', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '25', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', 'demo/afterdark-demo.mp4']);
ffmpeg(['-ss', '2', '-t', '6', '-i', 'demo/afterdark-demo.mp4', '-vf', 'fps=6,scale=640:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer', '-loop', '0', 'demo/preview.gif']);
const report = { bookingDate: date, bookingOverflow, mobileOverflow, hasConfirmation, pageErrors: errors, recordedAt: new Date().toISOString(), confirmationSubmitted: false };
writeFileSync('demo/validation.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
console.log(`Demo saved to ${resolve('demo/afterdark-demo.mp4')}`);
if (errors.length || bookingOverflow > 0 || mobileOverflow > 0 || !hasConfirmation) process.exitCode = 1;
