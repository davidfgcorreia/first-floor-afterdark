// Usage: node scripts/process-images.mjs <srcDir> [outDir=public/img/hq]
// Converts every jpg/png in srcDir to a 1600px (long edge) WebP, keeping the basename.
import sharp from "sharp";
import { mkdirSync, readdirSync } from "node:fs";
import { basename, extname, join } from "node:path";

const [src, out = "public/img/hq"] = process.argv.slice(2);
if (!src) {
  console.error("usage: node scripts/process-images.mjs <srcDir> [outDir]");
  process.exit(1);
}
mkdirSync(out, { recursive: true });

for (const f of readdirSync(src).filter((f) => /\.(jpe?g|png)$/i.test(f))) {
  const name = basename(f, extname(f));
  const info = await sharp(join(src, f))
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(join(out, `${name}.webp`));
  console.log(`${name}.webp ${info.width}x${info.height} ${Math.round(info.size / 1024)}KB`);
}
