/**
 * A port of part of `scripts/test_constraints.py`, the same subset
 * `.github/pages/app.js` ported before this page replaced it. Patterns are
 * copied from the suite rather than written to resemble it, and three
 * consequences are stated here rather than glossed:
 *
 *   1. Only the REGEX half can run in a browser. The other half walks a
 *      TypeScript AST through the compiler API. AST-only ids are ABSENT
 *      rather than approximated — the regex suite spells its own variants
 *      `MOTION-02R` and `PERF-04R`, and has no `A11Y-01` at all. Citing a
 *      check by an id it does not have, on the page that sells the checking,
 *      is the worst defect available here.
 *   2. These run in COMPONENT mode. The suite has eight page-scoped rules —
 *      a declared font, a default export, landmarks, all four states,
 *      breakpoints, 44px targets, a skip link — that are right about a screen
 *      and wrong about a fragment pasted into a textarea. `--component` drops
 *      them, and none is ported here.
 *   3. The count comes from `RULES.length` at render time, so the prose
 *      cannot drift from the array.
 *
 * `A11Y-06` needs a lookbehind (ES2018). The original page built it at
 * runtime inside a try/catch because Safari didn't ship lookbehind until
 * 16.4 — this app targets the same evergreen baseline Next 15/React 19
 * already require, so that hedge is dropped and the pattern is a plain
 * literal below.
 */

export interface CheckerRule {
  id: string;
  severity: "critical" | "high" | "medium";
  desc: string;
  /** Fails when this matches. Mutually exclusive with `when`/`unless`. */
  banned?: RegExp;
  /** Fails when `when` matches and `unless` does not. */
  when?: RegExp;
  unless?: RegExp;
  /** Some rules read the code with comments stripped first (SLOP-01/05). */
  source?: (code: string) => string;
}

/**
 * `_uncommented` from the suite. SLOP-01 and SLOP-05 read past comments,
 * because a note naming the brands to avoid is the rule being obeyed out
 * loud, not four violations of it.
 */
export function uncommented(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^[ \t]*\/\/[^\n]*$/gm, "");
}

export const RULES: CheckerRule[] = [
  {
    id: "DELAY-01",
    severity: "high",
    desc: "No artificial mount-time loading delay — drive skeletons from real async.",
    banned: /useEffect\([\s\S]{0,160}?setTimeout\([\s\S]{0,100}?set\w*([Ll]oading|[Mm]ounted)\w*\((false|true)\)/,
  },
  {
    id: "TYP-02",
    severity: "high",
    desc: "No banned display face as the sole font — allowed only as a fallback.",
    banned:
      /font[-_]?family\s*[:=]\s*["']?(Inter|Roboto|Arial|Poppins|DM Sans|Space Grotesk)["']?\s*[,;)]?\s*(?!.*Manrope|.*Geist|.*Satoshi)/i,
  },
  {
    id: "TYP-03",
    severity: "high",
    desc: "No gradient text on body copy — the computed colour is transparent, so contrast cannot be measured.",
    banned:
      /(?:text-(?:xs|sm|base|lg)|leading-relaxed|prose)[^"'`]{0,120}\bbg-clip-text\b|\bbg-clip-text\b[^"'`]{0,120}(?:text-(?:xs|sm|base|lg)|leading-relaxed|prose)/,
  },
  {
    id: "COL-04",
    severity: "high",
    desc: "No arbitrary hex colour in component code — OKLCH tokens only.",
    banned: /\[#[0-9a-fA-F]{3,8}\]/,
  },
  {
    id: "TOK-01",
    severity: "high",
    desc: "No hex value inside a CSS token definition.",
    banned: /(?:--color-[^:]+|--shadow-[^:]+)\s*:\s*[^;]*#[0-9A-Fa-f]{3,6}\b/,
  },
  {
    id: "RES-03",
    severity: "high",
    desc: "No min-h-screen — 100vh ignores the mobile toolbar; use min-h-[100dvh].",
    banned: /\bmin-h-screen\b/,
  },
  {
    id: "SLOP-01",
    severity: "high",
    desc: "No placeholder names or stock values.",
    banned: /John Doe|Jane Doe|\buser123\b|\$99\.99\b/,
    source: uncommented,
  },
  {
    id: "SLOP-02",
    severity: "high",
    desc: "No AI-generic marketing copy.",
    banned: /\b(Elevate|Seamless|Unleash|Revolutionize|Transform your|Game.changer)\b/i,
  },
  {
    id: "SLOP-03",
    severity: "medium",
    desc: "No placeholder comments — the output must be complete.",
    banned: /\/\/\s*\.\.\.|\/\/\s*TODO|\/\/\s*Add\b|\/\*\s*TODO/,
  },
  {
    id: "SLOP-05",
    severity: "high",
    desc: "No placeholder brand names — invent one that fits the sector.",
    banned: /\b(Acme|Cloudly|SmartFlow|Nexus)\b/,
    source: uncommented,
  },
  {
    id: "COPY-02",
    severity: "medium",
    desc: "Progress copy takes the ellipsis character, not three dots.",
    banned: /(Loading|Saving|Uploading|Processing|Deleting)\.\.\./,
  },
  {
    id: "MOTION-02R",
    severity: "medium",
    desc: "No bounce, elastic or back easing — overshoot reads dated.",
    banned: /\b(?:ease|easing)\s*[:=]\s*["'`][^"'`]*\b(?:bounce|elastic|back)(?![a-z])/,
  },
  {
    id: "PERF-04R",
    severity: "medium",
    desc: "No transition-all — name the properties that animate.",
    banned: /\btransition-all\b|transition:\s*all\b/,
  },
  {
    id: "A11Y-07",
    severity: "critical",
    desc: "An icon-only button needs an accessible name.",
    when: /<button[^>]*>(?:\s*<(?:svg|Icon|icon)[^>]*>[^<]*<\/(?:svg|Icon|icon)>|\{[^}]+Icon[^}]+\})\s*<\/button>/,
    unless: /aria-label/,
  },
  {
    id: "A11Y-06",
    severity: "critical",
    desc: "outline-none must be paired with a visible focus ring.",
    when: /(?<!focus-visible:)(?<!focus:)\boutline-none\b/,
    unless: /focus(?:-visible)?:(?:ring|outline|border|shadow)/,
  },
];

export interface Finding {
  rule: CheckerRule;
  evidence: string;
}

export function runRules(code: string): Finding[] {
  const findings: Finding[] = [];
  for (const rule of RULES) {
    const subject = rule.source ? rule.source(code) : code;
    if (rule.banned) {
      const hit = subject.match(rule.banned);
      if (hit) findings.push({ rule, evidence: hit[0] });
      continue;
    }
    if (rule.when && rule.unless) {
      const trigger = subject.match(rule.when);
      if (trigger && !rule.unless.test(subject)) findings.push({ rule, evidence: trigger[0] });
    }
  }
  return findings;
}

/**
 * Both snippets are run through the real suite before shipping, not written
 * to look wrong: `scripts/test_constraints.py` is executed over each, and
 * this port has to agree with it exactly on the ported ids.
 */
export const SNIPPETS = {
  bad: `export default function PricingCard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  // TODO: wire this to the real endpoint
  return (
    <section className="min-h-screen bg-[#0F1419] transition-all">
      <style>{\`:root { --color-brand: #7C3AED; }\`}</style>
      <h2 style={{ fontFamily: "Inter" }}>Elevate your workflow</h2>
      <p className="text-sm bg-clip-text text-transparent">
        Acme helps John Doe ship faster — just $99.99 a seat.
      </p>
      <span>Loading...</span>
      <button className="outline-none" onClick={onClose}>
        <Icon name="close" />
      </button>
    </section>
  );
}
`,
  good: `export function PricingCard({ plan, state }: PricingCardProps) {
  return (
    <section className="min-h-[100dvh] bg-surface transition-opacity">
      <style>{\`:root { --color-brand: oklch(78% 0.14 80); }\`}</style>
      <h2 style={{ fontFamily: "Manrope" }}>Rehearse the migration first</h2>
      <p className="text-sm text-muted">
        Northwind Freight rehearsed 1,284 migrations last quarter, at $47.20 each.
      </p>
      {state === "pending" ? <span aria-busy="true">Loading…</span> : null}
      <button className="focus-visible:ring" aria-label="Close pricing details" onClick={onClose}>
        <Icon name="close" aria-hidden="true" />
      </button>
    </section>
  );
}
`,
} as const;
