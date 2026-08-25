#!/usr/bin/env node
/**
 * Design-token intelligence — report-only, never auto-rewrite.
 *
 * The gap this closes
 * --------------------
 * `TOK-01`/`TOK-02` (scripts/test_constraints.py) catch a hex literal sitting
 * inside a token definition — a per-token, single-file check. Nothing checks
 * the token *set* itself: two colors close enough to be indistinguishable
 * that should probably be one token, or an arbitrary spacing value that
 * silently drifts off the 4pt scale `core/design-tokens.md` documents
 * ("every gap, pad and margin is a multiple of 4"). Both are real
 * consistency questions a single-file regex cannot see, because seeing them
 * requires comparing values against each other, not against a pattern.
 *
 * Why this is a report and not a gate
 * ------------------------------------
 * Master prompt §9 is explicit: recommend, don't auto-rewrite. A near-duplicate
 * finding is a judgment call — sometimes it means "these should be one token,"
 * and sometimes (verified against this repo's own `home/tokens.css` and
 * `demo/landing-page/tokens.css`) it means two colors were deliberately placed
 * a few points apart because a single value could not satisfy two different
 * WCAG contrast floors at once. A script cannot tell those apart, so it never
 * tries — it surfaces the pair and leaves the decision to whoever reads the
 * report. That is also why this never runs in CI: it has no pass/fail
 * condition to gate on.
 *
 * What it checks
 * ---------------
 * NEAR-DUPLICATE COLOR   two `--color-*`/`--shadow-*` OKLCH tokens in the same
 *                        file within ΔL≤1.5 / ΔC≤0.015 / ΔH≤3 of each other,
 *                        but not identical. (Identical L/C/H — e.g. an accent
 *                        and its own alpha-tinted `-glow`/`-wash` variant — is
 *                        excluded: that is a deliberate reuse, not drift. The
 *                        threshold itself was tuned against this repo's own
 *                        three real token files: it fires on nothing there,
 *                        including a documented pair 4 percentage points
 *                        apart that the source comment says "read as one
 *                        colour to anyone who is not measuring" but exists
 *                        as two tokens for a measured contrast reason.)
 * OFF-SCALE SPACING      an arbitrary bracket value on a padding/margin/gap
 *                        utility (`p-[13px]`, `gap-[1.1rem]`) that is not a
 *                        multiple of 4px. Deliberately scoped to padding,
 *                        margin and gap utilities (space-x/space-y included)
 *                        only — not top/left/right/inset,
 *                        which are position offsets the same doc does not
 *                        put on the 4pt scale, and which commonly need a
 *                        precise, non-scale value for optical alignment.
 * REDUNDANT ARBITRARY    an arbitrary bracket value that already matches a
 *                        standard scale step (`p-[16px]`) — no drift risk,
 *                        just a utility class that could replace it.
 *
 * Usage:
 *   node tools/token-report/token-report.mjs
 *   node tools/token-report/token-report.mjs --json
 *   node tools/token-report/token-report.mjs <path>
 */

import { readFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SOURCE_DIRS = ["skills", "core", "demo", "home"];
const EXCLUDE_PARTS = new Set(["node_modules", ".next", "dist", "baselines", ".diff-output"]);

const SCALE_PX = [4, 8, 12, 16, 24, 32, 48, 64, 96];
const SPACING_PREFIX = /\b(p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y)-\[([0-9.]+)(px|rem)\]/g;

const OKLCH_TOKEN = /(--(?:color|shadow)-[a-z0-9-]+)\s*:\s*[^;]*?oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.]+%?)?\s*\)/gi;

function isExcluded(p) {
  return p.split(path.sep).some((part) => EXCLUDE_PARTS.has(part));
}

function walk(dir, exts, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry);
    if (isExcluded(full)) continue;
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, exts, out);
    } else if (exts.some((e) => full.endsWith(e))) {
      out.push(full);
    }
  }
  return out;
}

function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join("/");
}

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

/** Near-duplicate OKLCH tokens, scanned per file (cross-file comparison would
 *  mix unrelated palettes — a dark theme and a light theme are SUPPOSED to
 *  put different colors near each other in OKLCH space). */
function scanColorDuplicates(file, text, findings) {
  const tokens = [];
  for (const m of text.matchAll(OKLCH_TOKEN)) {
    tokens.push({
      name: m[1],
      L: parseFloat(m[2]),
      C: parseFloat(m[3]),
      H: parseFloat(m[4]),
      line: lineOf(text, m.index),
    });
  }
  for (let i = 0; i < tokens.length; i++) {
    for (let j = i + 1; j < tokens.length; j++) {
      const a = tokens[i], b = tokens[j];
      const dL = Math.abs(a.L - b.L);
      const dC = Math.abs(a.C - b.C);
      const dH = Math.abs(a.H - b.H);
      const identical = dL === 0 && dC === 0 && dH === 0;
      if (identical) continue;
      if (dL <= 1.5 && dC <= 0.015 && dH <= 3) {
        findings.push({
          kind: "NEAR-DUPLICATE COLOR",
          file: rel(file),
          line: `${a.line}/${b.line}`,
          detail: `${a.name} (${a.L}% ${a.C} ${a.H}) and ${b.name} (${b.L}% ${b.C} ${b.H}) differ by only ΔL${dL.toFixed(2)}/ΔC${dC.toFixed(3)}/ΔH${dH.toFixed(2)} — same color to the eye; confirm this is intentional (e.g. two contrast targets) rather than drift`,
        });
      }
    }
  }
}

function scanSpacing(file, text, findings) {
  for (const m of text.matchAll(SPACING_PREFIX)) {
    const [, prop, num, unit] = m;
    const px = unit === "rem" ? parseFloat(num) * 16 : parseFloat(num);
    const line = lineOf(text, m.index);
    if (SCALE_PX.includes(px)) {
      findings.push({
        kind: "REDUNDANT ARBITRARY",
        file: rel(file),
        line: String(line),
        detail: `${prop}-[${num}${unit}] is exactly ${px}px, already on the 4pt scale — a standard utility class covers this without the arbitrary bracket`,
      });
    } else if (px % 4 !== 0) {
      findings.push({
        kind: "OFF-SCALE SPACING",
        file: rel(file),
        line: String(line),
        detail: `${prop}-[${num}${unit}] = ${px}px is not a multiple of 4 — core/design-tokens.md: "every gap, pad and margin is a multiple of 4"`,
      });
    }
  }
}

export function scanFile(file, findings) {
  const text = readFileSync(file, "utf-8");
  if (file.endsWith(".css")) {
    scanColorDuplicates(file, text, findings);
  } else {
    scanSpacing(file, text, findings);
  }
}

function iterFiles() {
  const files = [];
  for (const d of SOURCE_DIRS) {
    walk(path.join(ROOT, d), [".css"], files);
    walk(path.join(ROOT, d), [".tsx", ".ts", ".jsx", ".js"], files);
  }
  return files;
}

function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const asJson = process.argv.includes("--json");

  let targets;
  if (args.length) {
    const target = path.resolve(ROOT, args[0]);
    targets = statSync(target).isFile()
      ? [target]
      : walk(target, [".css", ".tsx", ".ts", ".jsx", ".js"]);
  } else {
    targets = iterFiles();
  }

  const findings = [];
  for (const file of targets) scanFile(file, findings);

  if (asJson) {
    console.log(JSON.stringify(findings, null, 2));
    return;
  }

  if (findings.length === 0) {
    console.log(`[TOKEN REPORT] 0 finding(s) · ${targets.length} files scanned · informational only, not a gate`);
    return;
  }

  console.log(`[TOKEN REPORT] ${findings.length} finding(s) across ${new Set(findings.map((f) => f.file)).size} file(s) · informational only, not a gate\n`);
  for (const f of findings) {
    console.log(`  ${f.kind}  ${f.file}:${f.line}`);
    console.log(`          ${f.detail}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
