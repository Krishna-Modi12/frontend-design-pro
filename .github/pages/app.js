/* The Pages site's behaviour.
 *
 * Two panels here do real work, and each is only worth shipping if it is TRUE.
 * This is the shop window of a product whose whole claim is that it verifies
 * rather than asserts, so a demo that flatters the pack is worse than no demo:
 *
 *   the router    resolves a sentence against the real registry the way the
 *                 loading protocol says it does — including the part where it
 *                 refuses to guess
 *   the checker   runs a subset of the regex constraint suite, ported pattern
 *                 for pattern from scripts/test_constraints.py
 *
 * Everything degrades. The markup is complete and readable before this file
 * runs, every init() returns early if its hooks are missing, and the figures
 * are already correct in the HTML (where Gate 11 can read them) before the
 * count-up ever touches them.
 */
(() => {
  "use strict";

  const root = document.documentElement;
  const data = window.FDP || { figures: {}, skills: [], baseDeps: [] };
  const fmt = new Intl.NumberFormat("en-US");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Every string that reaches the DOM goes through a node, never through
     innerHTML with interpolation. `el()` is the only builder in this file for
     one specific reason: the checker echoes back whatever a visitor typed into
     the textarea, and building that into an HTML string is how a demo becomes
     an injection. */
  function el(tag, props, children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props || {})) {
      if (value === undefined || value === null) continue;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "style" || key.startsWith("data-") || key.startsWith("aria-")) {
        node.setAttribute(key, value);
      } else node[key] = value;
    }
    for (const child of [].concat(children || [])) if (child) node.append(child);
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  // ── Header ─────────────────────────────────────────────────────────────────

  function initHeader() {
    const header = document.querySelector("[data-header]");
    if (!header) return;
    const update = () => header.classList.toggle("is-stuck", window.scrollY > 4);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  // ── Theme ──────────────────────────────────────────────────────────────────

  /* Three states, not two: auto (no attribute — the stylesheet's media query
     decides), light, dark. A two-state toggle cannot express "follow my
     system", which is the setting most people actually want and the one the
     stylesheet already handles. */
  function initTheme() {
    const button = document.querySelector("[data-theme-toggle]");
    if (!button) return;
    const modes = [null, "light", "dark"];
    const label = {
      null: "Theme: follows your system",
      light: "Theme: light",
      dark: "Theme: dark",
    };

    const announce = () => {
      button.setAttribute("aria-label", `${label[root.dataset.theme || null]}. Activate to change.`);
    };

    let stored = null;
    try {
      stored = localStorage.getItem("fdp-theme");
    } catch {
      /* Safari in private mode throws on localStorage. A toggle that works but
         does not persist beats a script that dies here and takes the router and
         the checker down with it. */
    }
    if (stored === "light" || stored === "dark") root.dataset.theme = stored;
    announce();

    button.addEventListener("click", () => {
      const next = modes[(modes.indexOf(root.dataset.theme || null) + 1) % modes.length];
      if (next) root.dataset.theme = next;
      else delete root.dataset.theme;
      try {
        if (next) localStorage.setItem("fdp-theme", next);
        else localStorage.removeItem("fdp-theme");
      } catch {
        /* see above */
      }
      announce();
    });
  }

  // ── Copy ───────────────────────────────────────────────────────────────────

  function initCopy() {
    document.querySelectorAll("[data-copy]").forEach((button) => {
      const original = button.textContent.trim();
      button.addEventListener("click", async () => {
        const group = button.closest("[data-copy-group]");
        const text = group && group.querySelector("[data-copy-text]");
        if (!text) return;
        try {
          await navigator.clipboard.writeText(text.textContent.trim());
          button.dataset.state = "done";
          button.textContent = "Copied";
        } catch {
          /* Insecure origins and older browsers have no clipboard API. Say so,
             rather than showing a success state for something that did not
             happen — the command is selectable text either way. */
          button.dataset.state = "fail";
          button.textContent = "Select it";
        }
        setTimeout(() => {
          delete button.dataset.state;
          button.textContent = original;
        }, 1600);
      });
    });
  }

  // ── Figures ────────────────────────────────────────────────────────────────

  /* The markup already carries the real number, so Gate 11 can read it and the
     page is correct with JavaScript off. This only reformats with thousands
     separators and, where motion is welcome, counts up to it. */
  function initFigures() {
    document.querySelectorAll("[data-figure]").forEach((node) => {
      const key = node.getAttribute("data-figure");
      if (!Object.prototype.hasOwnProperty.call(data.figures, key)) return;
      const target = data.figures[key];

      if (prefersReduced || !("IntersectionObserver" in window)) {
        node.textContent = fmt.format(target);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            observer.unobserve(entry.target);
            const started = performance.now();
            const tick = (now) => {
              const t = Math.min(1, (now - started) / 900);
              node.textContent = fmt.format(Math.round(target * (1 - Math.pow(1 - t, 3))));
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        },
        { threshold: 0.6 },
      );
      observer.observe(node);
    });
  }

  // ── Router ─────────────────────────────────────────────────────────────────

  /* The pack's loading protocol, as written in the root SKILL.md:
   *
   *     2. Match trigger keywords → pick one skill.
   *     ...
   *     7. No keyword match → ask ONE clarifying question. Never guess.
   *
   * and, from the registry's preamble, "Most specific wins". Both halves are
   * implemented. The second matters more than it looks: an earlier draft fell
   * back to a default skill when nothing matched, so the demo answered
   * confidently in exactly the case the pack documents itself as refusing —
   * and the first thing anyone types into a box like this is something that
   * matches nothing.
   */
  const WORD = /[a-z0-9]+/g;

  function matchedKeywords(skill, request) {
    const haystack = ` ${request.toLowerCase().replace(/[^a-z0-9]+/g, " ")} `;
    const hits = [];
    for (const keyword of skill.keywords || []) {
      const needle = ` ${keyword.toLowerCase().replace(/[^a-z0-9]+/g, " ")} `;
      if (haystack.includes(needle)) hits.push(keyword);
    }
    return hits;
  }

  /* "Most specific wins" scored as words matched, so a two-word trigger
     ("landing page", "design system") outranks a one-word trigger that also
     hit. That is the registry's own tie-break — "form validation" goes to
     `forms`, not `react-components` — expressed as arithmetic. */
  function score(hits) {
    return hits.reduce((total, k) => total + (k.match(WORD) || []).length, 0);
  }

  function route(request) {
    const ranked = (data.skills || [])
      .map((skill) => {
        const hits = matchedKeywords(skill, request);
        return { skill, hits, score: score(hits) };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.skill.id.localeCompare(b.skill.id));

    if (!ranked.length) return { kind: "none" };
    if (ranked.length > 1 && ranked[0].score === ranked[1].score) {
      return { kind: "ambiguous", between: [ranked[0].skill, ranked[1].skill] };
    }
    return Object.assign({ kind: "hit" }, ranked[0]);
  }

  function fileList(skill) {
    const items = [
      el("li", {}, [el("span", { class: "tag", text: "registry" }), document.createTextNode("SKILL.md")]),
      el("li", {}, [el("span", { class: "tag", text: "skill" }), document.createTextNode(skill.path)]),
    ];
    for (const dep of skill.deps || []) {
      items.push(el("li", {}, [el("span", { class: "tag", text: "core" }), document.createTextNode(dep)]));
    }
    return el("ul", { class: "route-files" }, items);
  }

  function ask(message) {
    return el("p", { class: "route-ask" }, [
      el("span", { class: "q", text: "asks" }),
      el("span", { text: message }),
    ]);
  }

  function renderRoute(result) {
    const frag = document.createDocumentFragment();

    if (result.kind === "none") {
      frag.append(
        ask(
          "No trigger keyword matched, so the pack asks one clarifying question rather " +
            "than guessing — step 7 of the loading protocol, and the behaviour is the " +
            "contract, not a gap. Name a surface and it will route: a form, a table, a " +
            "hero, a theme, a 3D scene.",
        ),
      );
      return frag;
    }

    if (result.kind === "ambiguous") {
      const [a, b] = result.between;
      frag.append(
        ask(
          `Two skills match equally well — ${a.id} and ${b.id}. The pack states which it ` +
            "picked and why, or asks which you meant. It does not choose silently.",
        ),
      );
      return frag;
    }

    const skill = result.skill;
    const depth = data.figures.referenceDepthTokens || 0;
    const pct = depth ? Math.round((skill.budget / depth) * 1000) / 10 : 0;

    frag.append(
      el("div", { class: "route-head" }, [
        el("div", { class: "route-id", text: skill.id }),
        el("div", { class: "route-verdict", text: "one skill · most specific wins" }),
      ]),
      el("p", { class: "route-covers", text: skill.covers || "" }),
      el("div", { class: "route-grid" }, [
        el("div", { class: "route-block" }, [el("h4", { text: "What loads" }), fileList(skill)]),
        el("div", { class: "route-block" }, [
          el("h4", { text: "What it costs" }),
          el("div", { class: "route-cost" }, [
            document.createTextNode(fmt.format(skill.budget || 0)),
            /* The space is a text node, not the margin below it. Margin is not
               read aloud, so the figure and its unit reached assistive tech as
               one run-together token — "5,981tokens". */
            document.createTextNode(" "),
            el("small", { text: `tokens — ${pct}% of the depth available` }),
          ]),
          /* Drawn at true scale. The sliver really is that fraction of the bar;
             inflating it to make it visible would be inflating the claim. */
          el("div", { class: "meter route-meter" }, [
            el("span", { class: "meter-fill", style: `--fill:${Math.max(pct, 0.4)}%` }),
          ]),
          el("div", { class: "meter-legend" }, [
            el("span", { text: "this request" }),
            el("b", { text: fmt.format(skill.budget || 0) }),
            el("span", { text: `of ${fmt.format(depth)}` }),
          ]),
        ]),
      ]),
      el("div", { class: "route-block", style: "margin-top:1.5rem" }, [
        el("h4", { text: result.hits.length === 1 ? "Matched on this trigger" : "Matched on these triggers" }),
        el(
          "div",
          { class: "defaults-id" },
          result.hits.map((k) => el("span", { class: "badge", text: k })),
        ),
      ]),
    );
    return frag;
  }

  function initRouter() {
    const input = document.querySelector("[data-route-input]");
    const output = document.querySelector("[data-route-output]");
    if (!input || !output) return;

    const update = () => {
      clear(output);
      output.append(renderRoute(route(input.value)));
    };

    input.addEventListener("input", update);
    document.querySelectorAll("[data-example]").forEach((button) => {
      button.addEventListener("click", () => {
        input.value = button.getAttribute("data-example") || "";
        update();
        input.focus();
      });
    });
    update();
  }

  // ── Checker ────────────────────────────────────────────────────────────────

  /* A port of part of scripts/test_constraints.py. The patterns below are
   * copied from it rather than written to resemble it, and three consequences
   * are stated on the page rather than glossed:
   *
   *   1. Only the REGEX half can run here. The other half walks a TypeScript
   *      AST through the compiler API, which is not something to ship to a
   *      browser — so AST-only ids are ABSENT rather than approximated. An
   *      earlier draft of this file printed `A11Y-01`, `MOTION-02` and
   *      `PERF-04` next to regex approximations of them. Those are the parser
   *      suite's ids: the regex suite spells its own variants `MOTION-02R` and
   *      `PERF-04R`, and has no A11Y-01 at all. Citing a check by an id it does
   *      not have, on the page that sells the checking, is the worst defect
   *      available here — and it is precisely the mistake the README quiz
   *      shipped once already: reasoning about a constraint instead of running
   *      it.
   *
   *   2. These run in COMPONENT mode. The suite has eight page-scoped rules — a
   *      declared font, a default export, landmarks, all four states,
   *      breakpoints, 44px targets, a skip link — that are right about a screen
   *      and wrong about a fragment pasted into a textarea. `--component` is
   *      the flag that drops them, and none of them is ported here.
   *
   *   3. The count comes from RULES.length, written into the page at runtime,
   *      so the prose cannot drift from the array.
   */

  /* `_uncommented` from the suite. SLOP-01 and SLOP-05 read past comments,
     because a note naming the brands to avoid is the rule being obeyed out
     loud, not four violations of it. */
  function uncommented(code) {
    return code.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^[ \t]*\/\/[^\n]*$/gm, "");
  }

  /* One entry per ported constraint. `banned` fails when it matches; `when` +
     `unless` fails when the trigger is present and the remedy is not. Both
     shapes exist in the suite, and collapsing them into one would change what
     the checks mean. */
  const RULES = [
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
  ];

  /* A11Y-06 needs two lookbehinds. Lookbehind is ES2018 and Safari only shipped
     it in 16.4 — and an unsupported group is a SyntaxError raised when the
     LITERAL is parsed, which would take this entire file down rather than this
     one rule. Building it at runtime confines the failure to the feature that
     requires it. */
  try {
    RULES.push({
      id: "A11Y-06",
      severity: "critical",
      desc: "outline-none must be paired with a visible focus ring.",
      when: new RegExp("(?<!focus-visible:)(?<!focus:)\\boutline-none\\b"),
      unless: /focus(?:-visible)?:(?:ring|outline|border|shadow)/,
    });
  } catch {
    /* An engine without lookbehind simply is not offered this rule. */
  }

  function runRules(code) {
    const findings = [];
    for (const rule of RULES) {
      const subject = rule.source ? rule.source(code) : code;
      if (rule.banned) {
        const hit = subject.match(rule.banned);
        if (hit) findings.push({ rule, evidence: hit[0] });
        continue;
      }
      const trigger = subject.match(rule.when);
      if (trigger && !rule.unless.test(subject)) findings.push({ rule, evidence: trigger[0] });
    }
    return findings;
  }

  function renderFindings(code) {
    const verdict = document.querySelector("[data-check-verdict]");
    const list = document.querySelector("[data-findings]");
    if (!verdict || !list) return;

    const findings = runRules(code);
    clear(verdict);
    clear(list);

    verdict.dataset.state = findings.length ? "fail" : "pass";
    verdict.append(
      el("span", { class: "verdict-count", text: String(findings.length) }),
      el("span", {
        text: findings.length
          ? `${findings.length === 1 ? "check fails" : "checks fail"} of ${RULES.length} running here`
          : `all ${RULES.length} checks running here pass`,
      }),
    );

    if (!findings.length) {
      list.append(
        el("article", { class: "finding is-pass" }, [
          el("span", { class: "finding-id", text: "PASS" }),
          el("span", { class: "finding-sev", text: "component mode" }),
          el("span", {
            class: "finding-desc",
            text:
              "Nothing here trips the constraints ported to the browser. The full chain " +
              "adds the AST half and the page-scoped rules on top of these.",
          }),
        ]),
      );
      return;
    }

    for (const found of findings) {
      list.append(
        el("article", { class: "finding" }, [
          el("span", { class: "finding-id", text: found.rule.id }),
          el("span", { class: "finding-sev", text: found.rule.severity }),
          el("span", { class: "finding-desc", text: found.rule.desc }),
          el("code", { class: "finding-evidence", text: found.evidence.trim().slice(0, 160) }),
        ]),
      );
    }
  }

  /* Both snippets are run through the real suite before shipping, not written
     to look wrong: scripts/test_constraints.py is executed over each, and this
     port has to agree with it exactly on the ported ids. */
  const SNIPPETS = {
    bad:
      'export default function PricingCard() {\n' +
      '  const [loading, setLoading] = useState(true);\n' +
      '\n' +
      '  useEffect(() => {\n' +
      '    setTimeout(() => setLoading(false), 1500);\n' +
      '  }, []);\n' +
      '\n' +
      '  // TODO: wire this to the real endpoint\n' +
      '  return (\n' +
      '    <section className="min-h-screen bg-[#0F1419] transition-all">\n' +
      '      <style>{`:root { --color-brand: #7C3AED; }`}</style>\n' +
      '      <h2 style={{ fontFamily: "Inter" }}>Elevate your workflow</h2>\n' +
      '      <p className="text-sm bg-clip-text text-transparent">\n' +
      '        Acme helps John Doe ship faster — just $99.99 a seat.\n' +
      '      </p>\n' +
      '      <span>Loading...</span>\n' +
      '      <button className="outline-none" onClick={onClose}>\n' +
      '        <Icon name="close" />\n' +
      '      </button>\n' +
      '    </section>\n' +
      '  );\n' +
      '}\n',
    good:
      'export function PricingCard({ plan, state }: PricingCardProps) {\n' +
      '  return (\n' +
      '    <section className="min-h-[100dvh] bg-surface transition-opacity">\n' +
      '      <style>{`:root { --color-brand: oklch(78% 0.14 80); }`}</style>\n' +
      '      <h2 style={{ fontFamily: "Manrope" }}>Rehearse the migration first</h2>\n' +
      '      <p className="text-sm text-muted">\n' +
      '        Northwind Freight rehearsed 1,284 migrations last quarter, at $47.20 each.\n' +
      '      </p>\n' +
      '      {state === "pending" ? <span aria-busy="true">Loading…</span> : null}\n' +
      '      <button className="focus-visible:ring" aria-label="Close pricing details" onClick={onClose}>\n' +
      '        <Icon name="close" aria-hidden="true" />\n' +
      '      </button>\n' +
      '    </section>\n' +
      '  );\n' +
      '}\n',
  };

  function initChecker() {
    const input = document.querySelector("[data-check-input]");
    if (!input) return;

    const run = () => renderFindings(input.value);

    input.value = SNIPPETS.bad;

    document.querySelectorAll("[data-snippet]").forEach((button) => {
      button.addEventListener("click", () => {
        input.value = SNIPPETS[button.getAttribute("data-snippet")] || SNIPPETS.bad;
        document
          .querySelectorAll("[data-snippet]")
          .forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
        run();
      });
    });

    /* Live, because the panel is worth far more as something you can edit than
       as something you can trigger. Debounced so a fast typist is not running
       fifteen regexes per keystroke. */
    let timer = 0;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(run, 180);
    });

    const manual = document.querySelector("[data-run-checks]");
    if (manual) manual.addEventListener("click", run);

    document.querySelectorAll("[data-check-count]").forEach((node) => {
      node.textContent = String(RULES.length);
    });

    run();
  }

  // ── Skills ─────────────────────────────────────────────────────────────────

  function initSkills() {
    const host = document.querySelector("[data-skills]");
    if (!host || !(data.skills || []).length) return;

    const groups = new Map();
    for (const skill of data.skills) {
      const group = skill.group || "Skills";
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(skill);
    }

    clear(host);
    for (const [group, skills] of groups) {
      const section = el("div", { class: "skill-group" }, [el("h3", { text: group })]);

      for (const skill of skills) {
        section.append(
          el("details", { class: "skill" }, [
            el("summary", {}, [
              el("span", { class: "skill-id", text: skill.id }),
              el("span", { class: "skill-covers", text: skill.covers || "" }),
              el("span", { class: "skill-cost", text: `${fmt.format(skill.budget || 0)} tokens` }),
            ]),
            el("div", { class: "skill-detail" }, [
              el("div", {}, [el("h4", { text: "What loads with it" }), fileList(skill)]),
              el("div", { class: "skill-try" }, [
                el("h4", { text: "Try saying" }),
                el("blockquote", { text: skill.trySaying || "" }),
                el(
                  "div",
                  { class: "defaults-id" },
                  (skill.keywords || []).slice(0, 6).map((k) => el("span", { class: "badge", text: k })),
                ),
                el("button", {
                  class: "btn btn-sm btn-ghost",
                  type: "button",
                  text: "Route this sentence",
                  "data-route-with": skill.trySaying || "",
                }),
              ]),
            ]),
          ]),
        );
      }
      host.append(section);
    }

    /* The catalogue feeds the router. Delegated, because the rows are built
       above and a listener per row would be nineteen more closures for a
       control almost nobody clicks twice. */
    host.addEventListener("click", (event) => {
      const button = event.target.closest("[data-route-with]");
      if (!button) return;
      const input = document.querySelector("[data-route-input]");
      const panel = document.getElementById("router");
      if (!input || !panel) return;
      input.value = button.getAttribute("data-route-with") || "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      panel.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
      /* preventScroll, or focus fights the smooth scroll and the page lands
         somewhere neither of them intended. */
      input.focus({ preventScroll: true });
    });
  }

  // ── Tabs ───────────────────────────────────────────────────────────────────

  /* A real tablist: arrow keys move, Home and End jump, only the selected tab
     is in the tab order, and the panels are wired with aria-controls and
     labelled back. This page sells WCAG conformance — a div that merely looks
     like tabs would be the same category of lie as a wrong constraint id. */
  function initTabs() {
    const list = document.querySelector("[role='tablist']");
    if (!list) return;
    const tabs = [...list.querySelectorAll("[data-tab]")];
    const panels = [...document.querySelectorAll("[data-panel]")];
    if (!tabs.length) return;

    const select = (tab, focus) => {
      const id = tab.getAttribute("data-tab");
      for (const item of tabs) {
        const on = item === tab;
        item.setAttribute("aria-selected", String(on));
        item.tabIndex = on ? 0 : -1;
      }
      for (const panel of panels) panel.hidden = panel.getAttribute("data-panel") !== id;
      if (focus) tab.focus();
    };

    tabs.forEach((tab, index) => {
      const id = tab.getAttribute("data-tab");
      const panel = panels.find((p) => p.getAttribute("data-panel") === id);
      if (panel) {
        panel.id = panel.id || `panel-${id}`;
        tab.id = tab.id || `tab-${id}`;
        tab.setAttribute("aria-controls", panel.id);
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", tab.id);
        panel.tabIndex = 0;
      }
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", (event) => {
        const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1 }[event.key];
        if (event.key === "Home" || event.key === "End") {
          event.preventDefault();
          select(event.key === "Home" ? tabs[0] : tabs[tabs.length - 1], true);
          return;
        }
        if (!step) return;
        event.preventDefault();
        select(tabs[(index + step + tabs.length) % tabs.length], true);
      });
    });

    select(tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0]);
  }

  // ── Reveals ────────────────────────────────────────────────────────────────

  /* `is-hidden` is added by script and removed by the observer, so the resting
     state in the stylesheet is VISIBLE. If this file never loads, is blocked,
     or throws before this point, the page is fully readable rather than a
     column of invisible sections — which is how reveal-on-scroll usually
     fails, and it fails silently. */
  function initReveals() {
    const nodes = [...document.querySelectorAll(".reveal")];
    if (!nodes.length || prefersReduced || !("IntersectionObserver" in window)) return;
    for (const node of nodes) node.classList.add("is-hidden");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.remove("is-hidden");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    for (const node of nodes) observer.observe(node);
  }

  initHeader();
  initTheme();
  initCopy();
  initFigures();
  initRouter();
  initChecker();
  initSkills();
  initTabs();
  initReveals();
})();
