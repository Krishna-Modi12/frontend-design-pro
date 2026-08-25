#!/usr/bin/env node
/**
 * Proof that token-report.mjs's checks actually fire, and that they leave the
 * real, deliberate patterns in this repo's own token files alone. Same
 * reasoning as scripts/test_security_patterns.py and
 * scripts/figure_pattern_test.py: a check that has never been run against a
 * positive case is a check that has never been proven to work.
 *
 * Usage: node tools/token-report/token-report.test.mjs
 */

import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { scanFile } from "./token-report.mjs";

let failures = 0;

function check(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failures++;
    console.log(`  ✗ ${name}`);
    console.log(`      ${err.message}`);
  }
}

function findingsFor(filename, content) {
  const dir = mkdtempSync(path.join(tmpdir(), "token-report-test-"));
  const file = path.join(dir, filename);
  writeFileSync(file, content, "utf-8");
  const findings = [];
  try {
    scanFile(file, findings);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  return findings;
}

// ── Positive: near-duplicate colors ─────────────────────────────────────────

check("fires on two OKLCH tokens 0.3% apart", () => {
  const findings = findingsFor(
    "tokens.css",
    `@theme {
      --color-brand: oklch(60% 0.18 270);
      --color-brand-alt: oklch(60.3% 0.181 271);
    }`,
  );
  assert.ok(findings.some((f) => f.kind === "NEAR-DUPLICATE COLOR"), "expected a NEAR-DUPLICATE COLOR finding");
});

// ── Negative: exact-match alpha variant (the real accent/accent-glow shape) ─

check("silent on an exact-value alpha variant (accent + accent-glow)", () => {
  const findings = findingsFor(
    "tokens.css",
    `@theme {
      --color-accent: oklch(55% 0.18 45);
      --color-accent-glow: oklch(55% 0.18 45 / 0.12);
    }`,
  );
  assert.equal(findings.length, 0, `expected no findings, got ${JSON.stringify(findings)}`);
});

// ── Negative: the real, documented 4-point contrast-driven pair ────────────

check("silent on a deliberate 4-point-apart contrast pair (landing-page's accent/accent-text shape)", () => {
  const findings = findingsFor(
    "tokens.css",
    `@theme {
      --color-accent: oklch(55% 0.18 260);
      --color-accent-text: oklch(59% 0.18 260);
    }`,
  );
  assert.equal(findings.length, 0, `expected no findings, got ${JSON.stringify(findings)}`);
});

// ── Negative: clearly distinct steps (home/tokens.css's own surface ladder) ─

check("silent on a real elevation ladder (bg-surface / bg-elevated, 2.5+ points apart)", () => {
  const findings = findingsFor(
    "tokens.css",
    `@theme {
      --color-surface-raised: oklch(12.5% 0.02 270);
      --color-surface-elevated: oklch(15% 0.02 270);
    }`,
  );
  assert.equal(findings.length, 0, `expected no findings, got ${JSON.stringify(findings)}`);
});

// ── Positive: off-scale spacing ─────────────────────────────────────────────

check("fires on an off-4pt-scale arbitrary padding value", () => {
  const findings = findingsFor(
    "Card.tsx",
    `export default function Card() { return <div className="p-[13px]">x</div>; }`,
  );
  assert.ok(
    findings.some((f) => f.kind === "OFF-SCALE SPACING" && f.detail.includes("13px")),
    "expected an OFF-SCALE SPACING finding for p-[13px]",
  );
});

check("fires on an off-scale rem gap", () => {
  const findings = findingsFor(
    "Row.tsx",
    `export default function Row() { return <div className="gap-[1.1rem]">x</div>; }`,
  );
  assert.ok(
    findings.some((f) => f.kind === "OFF-SCALE SPACING"),
    "expected an OFF-SCALE SPACING finding for gap-[1.1rem]",
  );
});

// ── Positive: redundant arbitrary value ─────────────────────────────────────

check("fires REDUNDANT on an arbitrary value that already matches the scale", () => {
  const findings = findingsFor(
    "Panel.tsx",
    `export default function Panel() { return <div className="p-[16px]">x</div>; }`,
  );
  assert.ok(
    findings.some((f) => f.kind === "REDUNDANT ARBITRARY"),
    "expected a REDUNDANT ARBITRARY finding for p-[16px]",
  );
});

// ── Negative: an on-scale utility class (no arbitrary bracket at all) ──────

check("silent on standard utility classes", () => {
  const findings = findingsFor(
    "Clean.tsx",
    `export default function Clean() { return <div className="p-4 gap-6 m-8">x</div>; }`,
  );
  assert.equal(findings.length, 0, `expected no findings, got ${JSON.stringify(findings)}`);
});

// ── Negative: an off-scale position offset (top/left/right/inset excluded) ─

check("silent on an off-scale top offset (position, not spacing scale)", () => {
  const findings = findingsFor(
    "Icon.tsx",
    `export default function Icon() { return <span className="relative top-[0.55rem]">x</span>; }`,
  );
  assert.equal(findings.length, 0, `expected no findings (position offsets are out of scope), got ${JSON.stringify(findings)}`);
});

console.log(`\n[TOKEN REPORT PROOF] ${failures ? "FAILED" : "all checks passed"}`);
process.exit(failures ? 1 : 0);
