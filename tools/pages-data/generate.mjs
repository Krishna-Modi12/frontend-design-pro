/**
 * Generates `.github/pages/data.js` — the payload behind the Pages site.
 *
 * Run:  node tools/pages-data/generate.mjs
 *       node tools/pages-data/generate.mjs --check     # fail if it is stale
 *
 * ── Why the site's data is generated ─────────────────────────────────────────
 *
 * The site has two interactive panels that are only worth building if they are
 * true: a router that resolves a sentence to one skill the way the pack does,
 * and a cost meter that states what that request loads. Both need the registry's
 * trigger keywords, each skill's declared core deps, and each skill's measured
 * token budget — which is to say, three sources that move independently and have
 * each gone stale in this repo before.
 *
 * Gate 11 scans `.github/pages/*.html`, so a figure written in the page's prose
 * is held to the filesystem. It does not scan `.js`, and a hand-maintained
 * `data.js` would therefore be the one surface on the most public page in the
 * project with no gate behind it. That is the exact shape of the defect this
 * project has shipped most often, so the file is not hand-maintained: it is
 * rendered from the same sources the gate reads, and `--check` byte-compares it.
 *
 * ── The sources, and what each one is authoritative for ──────────────────────
 *
 *   SKILL.md (root)      the registry: id, path, trigger keywords, the ONE core
 *                        dep the row advertises
 *   skills/<id>/SKILL.md the frontmatter `core-deps:` — what actually loads,
 *                        which is a superset of the row's single cell
 *   README.md            the three grouped skill tables: what each skill covers
 *                        and a sentence that routes there. Prose belongs in
 *                        prose; copying it here by hand would fork it.
 *   check_figures.py     every count and token figure, including the per-skill
 *                        budget table
 *
 * Nothing is counted where it can be derived. The predecessor of this file
 * (`tools/readme-router/generate.mjs`) shipped a banner whose skill count was
 * hand-decremented and whose guard compared it against another hand-maintained
 * number: the banner and its guard agreed with each other and both were wrong.
 * So every cross-source relationship below is asserted as a SET, not a count —
 * the registry's ids against the directories on disk against the README's rows
 * against the budget table's rows. A skill missing from any one of them is a
 * named failure, not a silently shorter list.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO = join(HERE, "..", "..");
const OUT = join(REPO, ".github", "pages", "data.js");
const PAGE = join(REPO, ".github", "pages", "index.html");

const CHECK = process.argv.includes("--check");

// Every skill inherits these two whether or not its frontmatter says so — the
// root SKILL.md states it in prose right under the registry table. The router
// panel has to add them or its cost meter under-reports every request.
const BASE_DEPS = ["core/accessibility-baseline.md", "core/validate-checklist.md"];

// ── Truth table ──────────────────────────────────────────────────────────────

/**
 * `--truth` prints a JSON object and then a human-readable budget table, so the
 * object ends at the first closing brace alone at column zero. Both halves are
 * used here: the object for the figures, the table for the per-skill budgets,
 * which are the gate's own arithmetic rather than a second implementation of it.
 */
function truth() {
  // Both spellings, because the two places this runs disagree about which one
  // exists: ci.yml calls `python3`, and on Windows that name often resolves to a
  // Store stub that exits non-zero instead of running.
  const candidates = process.platform === "win32" ? ["python", "python3"] : ["python3", "python"];
  let raw;
  const failures = [];
  for (const exe of candidates) {
    try {
      raw = execFileSync(exe, [join("scripts", "check_figures.py"), "--truth"], {
        cwd: REPO,
        encoding: "utf8",
      });
      break;
    } catch (err) {
      failures.push(`${exe}: ${err.message}`);
    }
  }
  if (raw === undefined) {
    throw new Error(
      "could not run `scripts/check_figures.py --truth`. Python is required — a " +
        "fallback to committed constants would be a silent path to a stale site.\n  " +
        failures.join("\n  "),
    );
  }

  const end = raw.indexOf("\n}");
  if (end === -1) throw new Error("`--truth` printed no JSON object");
  const figures = JSON.parse(raw.slice(0, end + 2));

  const budgets = new Map();
  for (const line of raw.slice(end + 2).split("\n")) {
    const m = line.match(/^\s{2}([a-z0-9-]+)\s+([\d,]+)\s*$/);
    if (m) budgets.set(m[1], Number(m[2].replace(/,/g, "")));
  }
  if (!budgets.size) throw new Error("`--truth` printed no per-skill budget table");
  return { figures, budgets };
}

// ── Sources ──────────────────────────────────────────────────────────────────

/** The registry table in the root SKILL.md — the thing that actually routes. */
function registry() {
  const src = readFileSync(join(REPO, "SKILL.md"), "utf8");
  const rows = [];
  const ROW =
    /^\|\s*`([a-z0-9-]+)`\s*\|\s*`([^`]+)`\s*\|\s*([^|]+?)\s*\|\s*`(core\/[a-z-]+\.md)`\s*\|/gm;
  for (const m of src.matchAll(ROW)) {
    rows.push({
      id: m[1],
      path: m[2],
      keywords: m[3].split(",").map((k) => k.trim()).filter(Boolean),
      registryDep: m[4],
    });
  }
  if (!rows.length) throw new Error("parsed no rows out of the registry table in SKILL.md");
  return rows;
}

/** Directories that hold a skill, which is the only definition that ships. */
function skillIdsOnDisk() {
  return readdirSync(join(REPO, "skills"), { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(REPO, "skills", e.name, "SKILL.md")))
    .map((e) => e.name)
    .sort();
}

/**
 * A skill's effective core deps: the two every skill inherits, plus whatever its
 * own frontmatter declares.
 *
 * The dash has to be followed by whitespace. Without that, `-` immediately
 * followed by `--` reads the frontmatter's own closing fence as a list item and
 * the deps come back with a `--` in them — which is not hypothetical, it is what
 * the first draft of this parser did in the sibling generator.
 */
function declaredDeps(id) {
  const src = readFileSync(join(REPO, "skills", id, "SKILL.md"), "utf8");
  const block = src.match(/core-deps:[ \t]*\r?\n((?:[ \t]*-[ \t]+\S+[ \t]*\r?\n)+)/);
  const declared = block ? [...block[1].matchAll(/-[ \t]+(\S+)/g)].map((m) => m[1]) : [];
  if (!declared.length || declared.some((d) => !d.startsWith("core/"))) {
    throw new Error(
      `could not read core-deps: from skills/${id}/SKILL.md — got [${declared.join(", ")}]`,
    );
  }
  return [...new Set([...BASE_DEPS, ...declared])].sort();
}

/**
 * README's three grouped skill tables. The "What it covers" and "Try saying"
 * cells are authored prose that has been reviewed; the site quotes it rather
 * than inventing a second description of the same nineteen things.
 *
 * Markdown emphasis and backticks are stripped, because the consumer sets these
 * as `textContent` — the page never builds markup out of this payload.
 */
function readmeCopy() {
  const src = readFileSync(join(REPO, "README.md"), "utf8");
  const section = src.slice(src.indexOf("## The 19 skills"));
  const stop = section.indexOf("\n## ", 4);
  const body = stop === -1 ? section : section.slice(0, stop);

  const plain = (s) =>
    s
      .replace(/`/g, "")
      .replace(/\*\*/g, "")
      .replace(/^\*|\*$/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .trim();

  const copy = new Map();
  let group = "";
  for (const line of body.split("\n")) {
    const h = line.match(/^###\s+(.+?)\s*$/);
    if (h) {
      group = h[1];
      continue;
    }
    const m = line.match(/^\|\s*\[`([a-z0-9-]+)`\]\([^)]+\)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$/);
    if (m) copy.set(m[1], { group, covers: plain(m[2]), trySaying: plain(m[3]) });
  }
  if (!copy.size) throw new Error("parsed no skill rows out of README's skill tables");
  return copy;
}

// ── Cross-source agreement ───────────────────────────────────────────────────

function assertSameSet(what, a, aLabel, b, bLabel) {
  const missing = a.filter((x) => !b.includes(x));
  const extra = b.filter((x) => !a.includes(x));
  if (missing.length || extra.length) {
    throw new Error(
      `${what} disagree.\n` +
        (missing.length ? `  in ${aLabel} but not ${bLabel}: ${missing.join(", ")}\n` : "") +
        (extra.length ? `  in ${bLabel} but not ${aLabel}: ${extra.join(", ")}\n` : ""),
    );
  }
}

// ── Render ───────────────────────────────────────────────────────────────────

function render() {
  const { figures, budgets } = truth();
  const rows = registry();
  const onDisk = skillIdsOnDisk();
  const copy = readmeCopy();

  const ids = rows.map((r) => r.id).sort();
  assertSameSet("The registry rows and the skill directories", ids, "SKILL.md", onDisk, "skills/");
  assertSameSet("The registry rows and README's tables", ids, "SKILL.md", [...copy.keys()].sort(), "README.md");
  assertSameSet(
    "The registry rows and the budget table",
    ids,
    "SKILL.md",
    [...budgets.keys()].sort(),
    "check_figures.py --truth",
  );
  if (ids.length !== figures.skills) {
    throw new Error(
      `the registry holds ${ids.length} rows and the truth table counts ${figures.skills} skills`,
    );
  }

  const skills = rows
    .map((r) => ({
      ...r,
      deps: declaredDeps(r.id),
      budget: budgets.get(r.id),
      ...copy.get(r.id),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  for (const s of skills) {
    if (!s.keywords.length) throw new Error(`${s.id}: no trigger keywords`);
    if (!existsSync(join(REPO, s.path))) throw new Error(`${s.id}: ${s.path} does not resolve`);
  }

  // Only the figures the page actually states or draws. Re-exporting the whole
  // truth table would put figures in front of a reader that no sentence on the
  // page is responsible for, and Gate 11 cannot see a number the prose never
  // makes a claim about.
  const payload = {
    figures: {
      skills: figures.skills,
      coreFiles: figures.core_files,
      referenceFiles: figures.reference_files,
      referenceDepthTokens: figures.reference_depth_tokens,
      exampleFiles: figures.example_files,
      antiExamples: figures.anti_examples,
      testFiles: figures.test_files,
      releaseGates: figures.release_gates,
      parserConstraints: figures.parser_constraints,
      regexConstraints: figures.regex_constraints,
      ciConstraints: figures.ci_constraints,
      registryTokens: figures.registry_tokens,
      bandLow: figures.band_low,
      bandHigh: figures.band_high,
    },
    baseDeps: BASE_DEPS,
    skills,
  };

  return (
    "/* GENERATED FILE — do not edit by hand.\n" +
    " *\n" +
    " * Written by tools/pages-data/generate.mjs from the registry in SKILL.md, each\n" +
    " * skill's frontmatter, README's skill tables and `check_figures.py --truth`.\n" +
    " *\n" +
    " *   npm run pages:data          rewrite this file\n" +
    " *   npm run pages:data:check    fail if it is stale (runs in CI)\n" +
    " */\n" +
    "window.FDP = " +
    JSON.stringify(payload, null, 2) +
    ";\n"
  );
}

/* The four headline numerals in the page's markup.
 *
 * `initFigures()` overwrites each `<dd data-figure="…">` from this payload on
 * load, so what a reader sees is generated and correct. The literal in the HTML
 * is the value a reader without JavaScript gets — and it is the one figure on
 * the page that Gate 11 structurally cannot read, because a bare number carries
 * no noun to anchor a pattern to and the `>` that closes its own tag suppresses
 * it anyway. Found by corrupting each in turn: both survived, silently.
 *
 * Checking them here rather than widening the gate. This tool already holds the
 * truth table and already runs in CI, and a pattern loose enough to match a bare
 * number would fire on every version string and port number in the corpus.
 */
function checkMarkupFallbacks(figures) {
  const html = readFileSync(PAGE, "utf8");
  const problems = [];
  const seen = new Set();
  const re = /<dd data-figure="([A-Za-z]+)">([\d,]+)<\/dd>/g;
  for (const [, key, shown] of html.matchAll(re)) {
    seen.add(key);
    const truth = figures[key];
    if (truth === undefined) {
      problems.push(`  data-figure="${key}" is not a key this tool exports`);
    } else if (Number(shown.replace(/,/g, "")) !== truth) {
      problems.push(`  data-figure="${key}" markup says ${shown}, truth is ${truth}`);
    }
  }
  if (!seen.size) {
    problems.push("  no <dd data-figure> literals found — has the markup changed shape?");
  }
  return problems;
}

// ── Main ─────────────────────────────────────────────────────────────────────

const rendered = render();

if (CHECK) {
  const stale = checkMarkupFallbacks(JSON.parse(rendered.slice(rendered.indexOf("{"), -2)).figures);
  if (stale.length) {
    console.error("✗ .github/pages/index.html states a figure the truth table disagrees with:");
    console.error(stale.join("\n"));
    process.exit(1);
  }

  const current = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  if (current === rendered) {
    console.log("✓ .github/pages/data.js is current, and its markup fallbacks agree");
    process.exit(0);
  }
  console.error(
    "✗ .github/pages/data.js is stale — the registry, a skill's deps, README's\n" +
      "  skill tables or a figure has moved since it was generated.\n" +
      "  Run `npm run pages:data` and commit the result.",
  );
  process.exit(1);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, rendered);
console.log(`✓ wrote .github/pages/data.js (${rendered.length} bytes)`);
