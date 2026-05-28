// scripts/screenshot.mjs
//
// Full-page screenshots of the main pages at 3 viewports, for visual
// regression after a frontend change.
//
// Usage:
//   1. In one terminal:  npm run dev   (Next dev server on :3000)
//   2. In another:       npm run screenshot
//
// Output:
//   temporary/screenshots/desktop/<page>.png   (1440×900)
//   temporary/screenshots/tablet/<page>.png    (768×1024)
//   temporary/screenshots/mobile/<page>.png    (390×844)
//
// The screenshots/ directory is wiped clean before each run so stale
// captures never linger.
//
// Override the base URL if your dev server is elsewhere:
//   BASE_URL=http://localhost:3001 npm run screenshot

import { chromium, devices } from "playwright";
import { mkdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";

const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const OUT_DIR = resolve(process.cwd(), "temporary/screenshots");

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, isMobile: false, deviceScaleFactor: 2 },
  { name: "tablet", width: 768, height: 1024, isMobile: false, deviceScaleFactor: 2 },
  // Mobile uses the iPhone 14 Pro preset for an accurate user-agent +
  // touch behaviour; deviceScaleFactor 3 matches retina mobile.
  { name: "mobile", ...devices["iPhone 14 Pro"] },
];

const PAGES = [
  { slug: "home", path: "/" },
  { slug: "sample-report", path: "/sample-report" },
  { slug: "snapshot-pipeline", path: "/snapshot-pipeline" },
  { slug: "methodology", path: "/methodology" },
  { slug: "lab", path: "/lab" },
];

async function pingServer() {
  try {
    const r = await fetch(BASE_URL, { method: "GET" });
    if (r.status >= 500) throw new Error(`status ${r.status}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`✗ Cannot reach ${BASE_URL} — ${msg}`);
    console.error(`  Is the dev server running? Try:`);
    console.error(`    cd ${process.cwd()}`);
    console.error(`    npm run dev`);
    console.error(`  (override with BASE_URL=http://...:port)`);
    process.exit(1);
  }
}

async function main() {
  await pingServer();

  // Wipe previous runs so stale captures never linger.
  await rm(OUT_DIR, { recursive: true, force: true });

  console.log(`📸 base=${BASE_URL}`);
  console.log(`   out=${OUT_DIR} (cleaned)`);
  console.log();

  const browser = await chromium.launch();
  let ok = 0;
  let fail = 0;
  const startedAt = Date.now();

  for (const vp of VIEWPORTS) {
    const vpDir = join(OUT_DIR, vp.name);
    await mkdir(vpDir, { recursive: true });

    const ctx = await browser.newContext({
      viewport: { width: vp.width ?? vp.viewport?.width ?? 1440, height: vp.height ?? vp.viewport?.height ?? 900 },
      deviceScaleFactor: vp.deviceScaleFactor ?? 2,
      isMobile: vp.isMobile ?? false,
      hasTouch: vp.hasTouch ?? false,
      userAgent: vp.userAgent,
      colorScheme: "light",
    });
    const page = await ctx.newPage();

    const width = vp.width ?? vp.viewport?.width;
    const height = vp.height ?? vp.viewport?.height;
    console.log(`▸ ${vp.name.padEnd(8)} ${width}×${height}`);

    for (const p of PAGES) {
      const url = BASE_URL + p.path;
      const file = join(vpDir, `${p.slug}.png`);
      process.stdout.write(`  ${p.slug.padEnd(20)} `);
      try {
        // Next.js dev's HMR ws never reaches `networkidle`. Wait for
        // DOM + load, then fonts, then a small grace.
        await page.goto(url, { waitUntil: "load", timeout: 30_000 });
        await page.evaluate(() => document.fonts && document.fonts.ready);
        await page.waitForTimeout(300);
        await page.screenshot({ path: file, fullPage: true });
        console.log("✓");
        ok++;
      } catch (e) {
        const msg = e instanceof Error ? e.message.split("\n")[0] : String(e);
        console.log(`✗ ${msg}`);
        fail++;
      }
    }

    await ctx.close();
  }

  await browser.close();

  const took = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log();
  console.log(`Done in ${took}s — ${ok} ok, ${fail} failed.`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
