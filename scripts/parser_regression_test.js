#!/usr/bin/env node
/**
 * Regression proof: parser checks catch what regexes miss (and stop over-banning).
 * Generates one synthetic file per case in /tmp/parser_test/ and asserts parser-vs-regex divergence.
 * Exit 0 only if every case behaves as specified.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

const DIR = path.join(os.tmpdir(), "parser_test");
fs.mkdirSync(DIR, { recursive: true });
const PARSER = path.join(__dirname, "parser_constraints.js");

// Legacy regex approximations (what the retired v12.1.2 checks did)
const LEGACY = {
  "A11Y-01":   (s) => /aria-describedby|aria-labelledby|aria-label/.test(s),          // pass if string appears anywhere
  "MOTION-02": (s) => !/(^|[^\w-])ease-in(?!-out)/.test(s),                            // fail on any bare ease-in
  "COL-02":    (s) => !/(bg-white\b|bg-\[#f{3}(f{3})?\])/i.test(s),                    // fail on any bg-white
  "DELAY-01":  (s) => !/useEffect\([\s\S]{0,160}?setTimeout\([\s\S]{0,100}?set\w*([Ll]oading|[Mm]ounted)\w*\((false|true)\)/.test(s),
  "TS-01":     (s) => /\binterface \w+|\btype \w+\s*=/.test(s),                        // pass if the word exists
  "A11Y-02":   (s) => /focus-visible|focus:/.test(s),
  "PERF-01":   (s) => !/from ["']\.\/index["']/.test(s),          // naive: only literal ./index
  "PERF-02":   (s) => !/&&/.test(s),                            // naive: bans every &&
  "A11Y-03":   (s) => /<img\b/.test(s) ? /\bwidth\b/.test(s) : true, // naive: any "width" anywhere in file
  "COPY-01":   (s) => !/\.\.\./.test(s),                        // naive: bans "..." incl. code spread
                                  // pass if string appears anywhere
  "ANI-04":    (s) => !/addEventListener\(\s*["']scroll["']/.test(s), // naive: bans every scroll listener
  "COMP-01":   (s) => !/\bforwardRef\(\s*[A-Za-z_$][\w$]*\s*[),]/.test(s), // naive: bans passing a named function to forwardRef
};

const CASES = [
  {
    name: "barrel_import.tsx",
    parserCheck: "PERF-01", parserExpected: false, legacy: "PERF-01", legacyExpected: true,
    why: "barrel import pulls the whole component graph into the bundle; a naive regex for 'import' can't tell a barrel from a module",
    code: `import { Button } from "@/components"
type P = { label: string }
export default function Row({ label }: P) { return <button aria-label={label}>{label}</button> }
`,
  },
  {
    name: "boolean_and_ok.tsx",
    parserCheck: "PERF-02", parserExpected: true, legacy: "PERF-02", legacyExpected: false,
    why: "idiomatic boolean `isOpen && <Panel/>` is safe React; a blanket && ban is over-broad, the AST only flags numeric left sides that render a literal 0",
    code: `type P = { isOpen: boolean }
export default function Panel({ isOpen }: P) {
  return <div aria-label="panel">{isOpen && <p>Open</p>}</div>
}
`,
  },
  {
    name: "img_no_dims.tsx",
    parserCheck: "A11Y-03", parserExpected: false, legacy: "A11Y-03", legacyExpected: true,
    why: "image without width/height causes CLS; regex for '<img' alone can't check attribute presence reliably",
    code: `type P = { src: string }
export default function Avatar({ src }: P) {
  return <span className="w-10" style={{ width: 40 }}><img src={src} alt="Member avatar" /></span>
}
`,
  },
  {
    name: "spread_not_copy.tsx",
    parserCheck: "COPY-01", parserExpected: true, legacy: "COPY-01", legacyExpected: false,
    why: "rest/spread `...props` is code, not UI copy — a blanket \"...\" ban false-positives on it; the AST scopes the rule to JSX text and copy attributes",
    code: `type P = { label: string } & React.ComponentPropsWithoutRef<"button">
export default function Btn({ label, ...rest }: P) {
  return <button aria-label={label} {...rest}>Loading…</button>
}
`,
  },
  {
    name: "comment_aria.tsx",
    parserCheck: "A11Y-01", parserExpected: false, legacy: "A11Y-01", legacyExpected: true,
    why: "aria only in a comment — regex sees the string, parser sees no real attribute",
    code: `type P = { label: string }
export default function Widget({ label }: P) {
  // use aria-describedby here for accessibility
  return <div className="p-4">{label}</div>
}
`,
  },
  {
    name: "fake_easein.tsx",
    parserCheck: "MOTION-02", parserExpected: true, legacy: "MOTION-02", legacyExpected: false,
    why: "ease-in scoped to an exit config — parser allows exits, regex over-bans",
    code: `type P = { open: boolean }
export default function Panel({ open }: P) {
  const exitConfig = { transition: "ease-in", duration: 150 }
  return <div aria-hidden={!open} data-exit={exitConfig.transition}>panel</div>
}
`,
  },
  {
    name: "button_bg_white.tsx",
    parserCheck: "COL-02-AST", parserExpected: true, legacy: "COL-02", legacyExpected: false,
    why: "bg-white on a button is legitimate component styling — regex over-bans",
    code: `type P = { onPick: () => void }
export default function Pick({ onPick }: P) {
  return <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)]">
    <button onClick={onPick} aria-label="Pick" className="bg-white focus-visible:ring-2 h-11">Pick</button>
  </main>
}
`,
  },
  {
    name: "mount_setmounted.tsx",
    parserCheck: "DELAY-01-AST", parserExpected: false, legacy: "DELAY-01", legacyExpected: false,
    why: "disguised mount delay (setMounted). v12.1.1's original regex missed it entirely; the hardened v12.1.2 regex catches this spelling, but the parser catches ANY setXxx spelling",
    code: `import { useEffect, useState } from "react"
type P = Record<string, never>
export default function Gate(_: P) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 400) }, [])
  return mounted ? <div aria-label="ready">ready</div> : <div className="animate-pulse" />
}
`,
  },
  {
    name: "mount_setphase.tsx",
    parserCheck: "DELAY-01-AST", parserExpected: false, legacy: "DELAY-01", legacyExpected: true,
    why: "mount delay via setPhase — outside even the hardened regex vocabulary (no loading/mounted keyword); only the parser's semantic rule (any setter in a mount-effect timer) catches it",
    code: `import { useEffect, useState } from "react"
type P = Record<string, never>
export default function Gate(_: P) {
  const [phase, setPhase] = useState<"boot" | "ready">("boot")
  useEffect(() => { setTimeout(() => setPhase("ready"), 500) }, [])
  return phase === "ready" ? <div aria-label="ready">ready</div> : <div className="animate-pulse" />
}
`,
  },
  {
    name: "interface_no_usage.tsx",
    parserCheck: "TS-01-AST", parserExpected: false, legacy: "TS-01", legacyExpected: true,
    why: "dead ButtonProps declaration never used as a type — regex only needs the word 'interface'",
    code: `interface ButtonProps { variant?: string }
export default function Chip() {
  return <span aria-label="chip" className="px-2">chip</span>
}
`,
  },
  {
    name: "div_focus_visible.tsx",
    parserCheck: "A11Y-02", parserExpected: false, legacy: "A11Y-02", legacyExpected: true,
    why: "focus-visible styling on a non-focusable div (no tabIndex) — decorative compliance",
    code: `type P = { label: string }
export default function Card({ label }: P) {
  return <div className="focus-visible:ring-2 p-4" aria-label={label}>{label}</div>
}
`,
  },
  {
    name: "scroll_state_storm.tsx",
    parserCheck: "ANI-04", parserExpected: false, legacy: "ANI-04", legacyExpected: false,
    why: "scroll listener calling setState re-renders on every frame of a scroll — both layers catch this one, it is the baseline the next case diverges from",
    code: `import { useState, useEffect } from "react"
export default function Progress() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const onScroll = () => { setY(window.scrollY) }
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return <div aria-label="progress">{y}</div>
}
`,
  },
  {
    name: "scroll_throttled_ok.tsx",
    parserCheck: "ANI-04", parserExpected: true, legacy: "ANI-04", legacyExpected: false,
    why: "a throttled scroll handler does not re-render every frame and is legitimate; banning the string 'addEventListener(\"scroll\"' over-bans correct code, the AST only flags an un-batched setState inside the handler",
    code: `import { useState, useEffect } from "react"
declare function throttle<T>(fn: T, ms: number): T
export default function Progress() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const onScroll = throttle(() => setY(window.scrollY), 100)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return <div aria-label="progress">{y}</div>
}
`,
  },
  {
    name: "propless_component.tsx",
    parserCheck: "TS-01-AST", parserExpected: true, legacy: "TS-01", legacyExpected: false,
    why: "a component that takes no props has nothing to declare — the naive regex demands the word 'interface', and the AST check used to demand a declaration just as bluntly, which made the rule unsatisfiable: omitting a type failed the blanket check and adding one failed the dead-declaration check. Found by writing an App Router page.tsx, a shape none of the 45 non-test golds has",
    code: `export function EmptyState() {
  return (
    <div className="rounded-lg border p-8 text-center">
      <p className="text-base">Nothing here yet.</p>
    </div>
  )
}
`,
  },
  {
    name: "forwardref_named_impl.tsx",
    parserCheck: "COMP-01", parserExpected: true, legacy: "COMP-01", legacyExpected: false,
    why: "forwardRef(NamedImpl) with a separately-declared render function is valid React — the form the docs show for a component that reads as a name in DevTools — and meets COMP-01's rule: takes (props, ref), returns JSX, exported, displayName set. A regex that bans a named identifier as the argument over-bans it; the AST resolves the identifier to its declaration and judges that",
    code: `import { forwardRef } from "react"
type P = { label: string }
function ChipImpl({ label }: P, ref: React.ForwardedRef<HTMLSpanElement>) {
  return <span ref={ref} aria-label={label} className="px-2">{label}</span>
}
export const Chip = forwardRef(ChipImpl)
Chip.displayName = "Chip"
`,
  },
  {
    name: "forwardref_named_impl_one_param.tsx",
    parserCheck: "COMP-01", parserExpected: false, legacy: "COMP-01", legacyExpected: false,
    why: "resolving the identifier must not wave a real violation through — a render function declared separately that takes only (props) and never (props, ref) still fails COMP-01, exactly as it would inline",
    code: `import { forwardRef } from "react"
type P = { label: string }
function ChipImpl({ label }: P) {
  return <span aria-label={label} className="px-2">{label}</span>
}
export const Chip = forwardRef(ChipImpl)
Chip.displayName = "Chip"
`,
  },
];

let pass = 0, fail = 0;
console.log("Parser regression test — proving semantic checks beat string matching\n");
for (const c of CASES) {
  const fp = path.join(DIR, c.name);
  fs.writeFileSync(fp, c.code);
  let parserResult;
  try {
    const out = execFileSync("node", [PARSER, fp], { encoding: "utf8" });
    parserResult = JSON.parse(out).checks[c.parserCheck];
  } catch (e) {
    parserResult = JSON.parse(e.stdout).checks[c.parserCheck];
  }
  const legacyResult = LEGACY[c.legacy](c.code);
  const parserOk = parserResult === c.parserExpected;
  const legacyOk = legacyResult === c.legacyExpected;
  const ok = parserOk && legacyOk;
  ok ? pass++ : fail++;
  console.log(`${ok ? "✓" : "✗"} ${c.name}`);
  console.log(`    parser[${c.parserCheck}]=${parserResult ? "PASS" : "FAIL"} (expected ${c.parserExpected ? "PASS" : "FAIL"})${parserOk ? "" : "  ← WRONG"}`);
  console.log(`    legacy-regex[${c.legacy}]=${legacyResult ? "PASS" : "FAIL"} (expected ${c.legacyExpected ? "PASS" : "FAIL"})${legacyOk ? "" : "  ← WRONG"}`);
  console.log(`    ${c.why}\n`);
}
console.log(`${pass}/${CASES.length} regression cases behave as specified`);
process.exit(fail ? 1 : 0);
