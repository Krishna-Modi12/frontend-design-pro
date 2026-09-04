/**
 * Regenerates home/'s showcase thumbnails from the four demo screenshots
 * README.md already links — not a fresh capture, just a resize/compress pass,
 * because home/components/SectionShowcase.tsx needs images sized for a card
 * grid rather than the demos' own 1920x1080 above-the-fold captures.
 *
 *   npm run showcase-thumbs
 *
 * Same palette-quantisation ladder and cap as capture.mjs's encodeUnderCap —
 * this is the one committed way to produce these files, matching
 * .github/SCREENSHOT_CONTRIBUTION.md's "no hand-edited image, no one-off
 * capture" rule for the demo screenshots this reads.
 */
import sharp from "sharp";
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../../", import.meta.url));
const OUT_DIR = join(REPO, "home", "public", "showcase");
const SIZE_CAP = 500 * 1024;
const THUMB_WIDTH = 800;
const FULL_WIDTH = 1440;

/** [demo source (relative to repo root), output basename, target width] */
const JOBS = [
  ["demo/landing-page/screenshot.png", "bellwether.png", THUMB_WIDTH],
  ["demo/showcase/screenshot.png", "wavelet.png", THUMB_WIDTH],
  ["demo/dashboard/screenshot.png", "ledgerline.png", THUMB_WIDTH],
  ["demo/dashboard/screenshot-full.png", "ledgerline-full.png", FULL_WIDTH],
  ["demo/auth-form/screenshot.png", "arclight.png", THUMB_WIDTH],
  ["demo/auth-form/screenshot-full.png", "arclight-full.png", FULL_WIDTH],
];

async function encodeUnderCap(input, width) {
  let last;
  for (const colors of [256, 200, 160, 128, 96, 64]) {
    const buf = await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .png({ palette: true, colors, dither: 0.5, effort: 10, compressionLevel: 9 })
      .toBuffer();
    last = { buf, colors };
    if (buf.length <= SIZE_CAP) break;
  }
  return last;
}

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  for (const [src, outName, width] of JOBS) {
    const srcPath = join(REPO, src);
    if (!existsSync(srcPath)) {
      console.warn(`skip — source missing: ${src} (recapture it first via npm run screenshots)`);
      continue;
    }
    const destPath = join(OUT_DIR, outName);
    const { buf, colors } = await encodeUnderCap(srcPath, width);
    writeFileSync(destPath, buf);
    const kb = (statSync(destPath).size / 1024).toFixed(0);
    console.log(`home/public/showcase/${outName} — ${kb} KB (${colors} colours, ${width}px wide)`);
  }
}

main();
