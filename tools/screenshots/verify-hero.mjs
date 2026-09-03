/**
 * Hero-specific checks that `verify-home.mjs` cannot make.
 *
 * Run:  node verify-hero.mjs [--base http://localhost:3407]
 *       npm run verify:hero            (starts its own production server)
 *
 * `verify-home.mjs` asserts that the hero's scene and its static fallback are
 * both in the DOM at desktop width. That is necessary and nowhere near
 * sufficient for this hero, because the three things most likely to be wrong
 * about it are invisible to a DOM check:
 *
 *   1. Whether the fallback paths actually behave, rather than merely being
 *      coded. A reduced-motion branch that is written but never taken, and a
 *      sub-640px gate that hides the canvas instead of never mounting it,
 *      both read as correct in source and in a screenshot.
 *   2. Whether the pinned sequence releases. A pin that never ends is a
 *      scroll trap, and it is the single failure this hero's one documented
 *      exception to `home/DESIGN.md` §7 has to earn its way past.
 *   3. Whether it holds a frame budget on a mid-range device. Every gate in
 *      this repo runs on a workstation, and "it looked fine on my machine" is
 *      the named failure mode for a 3D hero. This measures real frame times
 *      under CPU throttling instead.
 *
 * None of this is in CI — it needs a browser, like every other check in this
 * directory.
 */

import { chromium } from "playwright";
import { spawn, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO = join(HERE, "..", "..");
const HOME = join(REPO, "home");
const PORT = 3319;

const argBase = process.argv.indexOf("--base");
const EXTERNAL_BASE = argBase !== -1 ? process.argv[argBase + 1] : null;

/**
 * The frame budget is a DELTA against the same page with the scene absent,
 * not an absolute ceiling.
 *
 * An absolute number cannot survive the machine it runs on. Measured here on
 * a workstation that was also running a second agent session and a dev
 * server, the page's own p95 was 41.6ms with the hero's scene rendering
 * nothing at all — so an absolute 20ms gate failed a scene that was
 * demonstrably not executing. Machine noise lands on both arms of a delta
 * equally, and what this change is answerable for is the difference it makes,
 * which is exactly what the delta measures.
 *
 * Medians are held tight because that is the frame a reader actually lives
 * in; p95 is allowed more room because a single GC pause lands there and is
 * not the hero's fault.
 */
const MEDIAN_DELTA_CEILING_MS = 2.5;
const P95_DELTA_CEILING_MS = 10;
/** Chrome DevTools CPU throttle multiplier — the mid-range-device proxy. */
const CPU_THROTTLE = 4;

/**
 * Headless Chromium rasterises WebGL through SwiftShader — on the CPU — by
 * default. Measuring a 3D scene that way and then ALSO applying a 4x CPU
 * throttle does not model a mid-range phone: it models a machine with no GPU
 * at all, running at quarter speed, and it charges rasterisation to the same
 * budget the throttle is squeezing. Measured here, the identical scene read
 * 29.9ms median under SwiftShader and 16.6ms on a real GPU.
 *
 * A phone has a real GPU and a slow CPU, so that is what this asks for: ANGLE
 * on the actual adapter, plus the CPU throttle. What is being measured is the
 * per-frame JS and driver overhead, which is the thing that actually varies
 * by device for a scene of one draw call.
 */
const GPU_ARGS = ["--use-angle=default", "--enable-gpu", "--ignore-gpu-blocklist"];

const problems = [];
const note = (line) => console.log(`  ${line}`);

function startServer() {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["next", "start", "-p", String(PORT)], {
      cwd: HOME,
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const done = (fn, arg) => {
      child.stdout.removeAllListeners("data");
      fn(arg);
    };
    child.stdout.on("data", (buf) => {
      if (/Ready|started server|Local:/i.test(String(buf))) done(resolve, child);
    });
    child.on("error", reject);
    setTimeout(() => done(reject, new Error("next start did not become ready in 60s")), 60_000);
  });
}

/**
 * `child.kill()` is not enough on Windows: the server is launched through a
 * shell, so the signal reaches the shell and leaves `next start` holding the
 * port. The next run then times out waiting for a port that is already
 * serving — which looks like a broken build and is a leaked process. Kill the
 * whole tree.
 */
function stopServer(child) {
  if (child === null || child.pid === undefined) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    child.kill("SIGTERM");
  }
}

/**
 * Samples real frame times from inside the page. Deliberately not
 * `performance.now()` deltas averaged — an average hides exactly the stutter
 * a reader notices, so this reports p95 and the worst frame alongside it.
 */
const sampleFrames = (durationMs) =>
  new Promise((resolve) => {
    const times = [];
    let last = performance.now();
    const t0 = last;
    const step = () => {
      const now = performance.now();
      times.push(now - last);
      last = now;
      if (now - t0 < durationMs) requestAnimationFrame(step);
      else {
        const sorted = times.slice(1).sort((a, b) => a - b);
        resolve({
          frames: sorted.length,
          median: sorted[Math.floor(sorted.length * 0.5)] ?? 0,
          p95: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
          worst: sorted[sorted.length - 1] ?? 0,
        });
      }
    };
    requestAnimationFrame(step);
  });

async function main() {
  let server = null;
  let base = EXTERNAL_BASE;
  if (base === null) {
    console.log(`Starting production server on :${PORT} …`);
    server = await startServer();
    base = `http://localhost:${PORT}`;
  }

  const browser = await chromium.launch({ args: GPU_ARGS });
  const url = `${base}/?world=signature`;

  try {
    // ── 1. Reduced motion ────────────────────────────────────────────────
    console.log("\nReduced motion");
    {
      const ctx = await browser.newContext({
        reducedMotion: "reduce",
        viewport: { width: 1440, height: 900 },
      });
      const page = await ctx.newPage();
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(2500);

      const state = await page.evaluate(() => {
        const caption = document.querySelector("[data-hero-caption]");
        return {
          canvas: document.querySelectorAll("[data-hero-scene-canvas] canvas").length,
          captionOpacity: caption ? getComputedStyle(caption).opacity : null,
        };
      });

      await page.evaluate(() => window.scrollTo(0, 600));
      await page.waitForTimeout(700);
      const pinned = await page.evaluate(
        () => Math.abs(document.querySelector("#top").getBoundingClientRect().top) < 2,
      );

      note(`scene canvas rendered: ${state.canvas}`);
      note(`caption opacity with no scroll: ${state.captionOpacity}`);
      note(`hero pinned at 600px: ${pinned}`);

      if (state.canvas !== 1) {
        problems.push(
          `reduced motion: the scene should still render one static frame, found ${state.canvas} canvases`,
        );
      }
      if (state.captionOpacity !== "1") {
        problems.push(
          `reduced motion: the caption is revealed by the pin, so with no pin it must start visible — opacity is ${state.captionOpacity}`,
        );
      }
      if (pinned) {
        problems.push(
          "reduced motion: the hero is pinned — a pinned scene under reduced motion is a scroll trap",
        );
      }
      await ctx.close();
    }

    // ── 2. The pin releases ──────────────────────────────────────────────
    console.log("\nPinned sequence");
    {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(2000);

      const track = [];
      for (const y of [0, 400, 800, 1400, 2000]) {
        await page.evaluate((to) => window.scrollTo(0, to), y);
        await page.waitForTimeout(500);
        track.push(
          await page.evaluate(() => ({
            y: Math.round(window.scrollY),
            top: Math.round(document.querySelector("#top").getBoundingClientRect().top),
          })),
        );
      }
      const pinnedAt = track.filter((t) => Math.abs(t.top) < 2).map((t) => t.y);
      note(`pinned at scrollY: [${pinnedAt.join(", ")}]`);
      note(`released by scrollY ${track[track.length - 1].y}: ${track[track.length - 1].top < -2}`);

      if (pinnedAt.length === 0) problems.push("pin: the hero never pins");
      if (track[track.length - 1].top >= -2) {
        problems.push("pin: the hero is still pinned two viewports in — the pin does not release");
      }
      await ctx.close();
    }

    // ── 3. Sub-640px: the canvas must be ABSENT, not hidden ──────────────
    console.log("\nMobile (390px)");
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await ctx.newPage();
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(2000);
      const state = await page.evaluate(() => {
        const de = document.documentElement;
        const fb = document.querySelector("[data-hero-fallback]");
        return {
          anyCanvas: document.querySelectorAll("canvas").length,
          fallbackBands: fb ? fb.children.length : 0,
          overflow: de.scrollWidth - de.clientWidth,
        };
      });
      note(`canvases anywhere on the page: ${state.anyCanvas}`);
      note(`fallback bands: ${state.fallbackBands}`);
      note(`horizontal overflow: ${state.overflow}px`);

      if (state.anyCanvas !== 0) {
        problems.push(
          `mobile: ${state.anyCanvas} canvas element(s) mounted below 640px — the budget saving requires absence, not display:none`,
        );
      }
      if (state.fallbackBands === 0) problems.push("mobile: the static object fallback rendered no bands");
      if (state.overflow > 0) problems.push(`mobile: ${state.overflow}px of horizontal overflow`);
      await ctx.close();
    }

    // ── 4. No WebGL ──────────────────────────────────────────────────────
    console.log("\nWebGL unavailable");
    {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      await page.addInitScript(() => {
        HTMLCanvasElement.prototype.getContext = function () {
          return null;
        };
      });
      const errors = [];
      page.on("pageerror", (err) => errors.push(String(err)));
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(2000);
      const state = await page.evaluate(() => {
        const fb = document.querySelector("[data-hero-fallback]");
        const h1 = document.querySelector("h1");
        return {
          fallbackBands: fb ? fb.children.length : 0,
          headlineText: h1 ? h1.textContent.trim().slice(0, 30) : null,
        };
      });
      note(`fallback bands: ${state.fallbackBands}`);
      note(`headline still rendered: ${JSON.stringify(state.headlineText)}`);
      note(`uncaught page errors: ${errors.length}`);

      if (state.fallbackBands === 0) problems.push("no-webgl: the static object fallback is missing");
      if (state.headlineText === null) problems.push("no-webgl: the headline is gone");
      if (errors.length > 0) problems.push(`no-webgl: ${errors.length} uncaught page error(s): ${errors[0]}`);
      await ctx.close();
    }

    // ── 5. Frame budget under CPU throttling ─────────────────────────────
    console.log(`\nFrame budget (${CPU_THROTTLE}x CPU throttle)`);
    {
      /** One measurement pass. `noWebgl` denies the scene a context, which is
          the same path the sub-640px and no-WebGL fallbacks take — so the
          baseline arm is the real page minus exactly one thing. */
      const pass = async (noWebgl) => {
        const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
        const page = await ctx.newPage();
        if (noWebgl) {
          await page.addInitScript(() => {
            const real = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function (kind, ...rest) {
              return String(kind).includes("webgl") ? null : real.call(this, kind, ...rest);
            };
          });
        }
        const cdp = await ctx.newCDPSession(page);
        await page.goto(url, { waitUntil: "networkidle" });
        await page.waitForTimeout(2500);

        // Stated, not assumed: a run that silently fell back to SwiftShader
        // would report a number about the harness rather than the page.
        const gl = noWebgl
          ? "denied"
          : await page.evaluate(() => {
              const c = document.createElement("canvas");
              const g = c.getContext("webgl2") ?? c.getContext("webgl");
              if (g === null) return "none";
              const dbg = g.getExtension("WEBGL_debug_renderer_info");
              return dbg === null ? "unknown" : String(g.getParameter(dbg.UNMASKED_RENDERER_WEBGL));
            });

        await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU_THROTTLE });
        await page.waitForTimeout(500);
        const atRest = await page.evaluate(sampleFrames, 4000);

        // Again while the pinned range is scrubbing, which is the scene's
        // heaviest moment: the camera moves, so every frame is redrawn.
        await page.evaluate(() => window.scrollTo(0, 700));
        await page.waitForTimeout(400);
        const duringPin = await page.evaluate(sampleFrames, 4000);

        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
        await ctx.close();
        return { gl, atRest, duringPin };
      };

      const withScene = await pass(false);
      const baseline = await pass(true);

      note(`rasteriser: ${withScene.gl}`);
      if (/swiftshader|software/i.test(withScene.gl)) {
        note("  ! software rasteriser — rasterisation is being charged to the throttled CPU");
      }

      for (const phase of ["atRest", "duringPin"]) {
        const s = withScene[phase];
        const b = baseline[phase];
        const dMedian = s.median - b.median;
        const dP95 = s.p95 - b.p95;
        const label = phase === "atRest" ? "at rest   " : "during pin";
        note(
          `${label} — scene ${s.median.toFixed(1)}/${s.p95.toFixed(1)}ms  ` +
            `baseline ${b.median.toFixed(1)}/${b.p95.toFixed(1)}ms  ` +
            `delta median ${dMedian >= 0 ? "+" : ""}${dMedian.toFixed(1)}ms  p95 ${dP95 >= 0 ? "+" : ""}${dP95.toFixed(1)}ms`,
        );
        if (dMedian > MEDIAN_DELTA_CEILING_MS) {
          problems.push(
            `frame budget (${label.trim()}): the scene adds ${dMedian.toFixed(1)}ms to the median frame, over the ${MEDIAN_DELTA_CEILING_MS}ms budget`,
          );
        }
        if (dP95 > P95_DELTA_CEILING_MS) {
          problems.push(
            `frame budget (${label.trim()}): the scene adds ${dP95.toFixed(1)}ms to p95, over the ${P95_DELTA_CEILING_MS}ms budget`,
          );
        }
      }
    }
  } finally {
    await browser.close();
    stopServer(server);
  }

  console.log("");
  if (problems.length > 0) {
    console.error(`✗ ${problems.length} problem(s):`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log("✓ hero: reduced motion, pin release, mobile, no-WebGL and frame budget all pass");
}

await main();
