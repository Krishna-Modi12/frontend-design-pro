# frontend-design-pro

A machine-enforced frontend UI/UX skill pack for AI agents.

**9 release-blocking gates · 16 semantic AST checks · 35 syntactic checks · strict TypeScript compilation · a 1:1 test for every gold example.**

Most prompt packs tell an agent what good UI looks like. This one proves it: every example compiles under `tsc --strict`, passes AST analysis, and ships with a test — and no archive can be built unless all of that is green.

## Install in 30 seconds

If your agent keeps its rules in a file — Cursor, Copilot, Windsurf, Continue.dev, Aider — the installer writes it for you:

```bash
unzip frontend-design-pro-v*.skill -d ./   # pack lands at ./frontend-design-pro/
bash frontend-design-pro/setup.sh          # detects the agent, writes its native rules file
```

`setup.sh --list` names every adapter, `setup.sh cursor` skips detection, `--dry-run` shows what it would write, and nothing is overwritten without `--force`. `setup.ps1` is the PowerShell port. The files it copies live in [`install/`](install/) if you would rather place them yourself.

The remaining hosts need a web UI or a merge into a file your repo owns, so they stay manual. Every row below is the real setup path, not an approximation — click through for detail and troubleshooting.

| Agent | Steps |
|---|---|
| **[Claude Code](docs/CLAUDE_SETUP.md)** | 1. Unzip the `.skill` into `~/.claude/skills/` (or project-scoped `.claude/skills/`) <br> 2. Start a new session — no system prompt needed <br> 3. Ask in plain language: *"Create a landing page for a developer tool"* |
| **[Claude Desktop](docs/CLAUDE_SETUP.md)** | 1. Unzip the `.skill` somewhere stable <br> 2. New Project → paste `AGENT_SYSTEM_PROMPT.md` into Project Instructions <br> 3. Upload the unzipped folder to Knowledge <br> ⚠️ No filesystem — retrieval-based, lazy loading degrades |
| **[Cursor](docs/CURSOR_SETUP.md)** | 1. Unzip into the workspace <br> 2. Create `.cursor/rules/*.mdc` with the routing instructions (legacy: `.cursorrules`) <br> 3. `@`-reference `SKILL.md` the first time in Chat/Composer <br> ⚠️ May paraphrase a reference instead of reading it — `@`-reference the specific file if output drifts generic |
| **[ChatGPT Custom GPT](docs/CHATGPT_SETUP.md)** | 1. Create a Custom GPT <br> 2. Upload `SKILL.md` + the `core/*.md` files a typical request needs + 2–3 relevant skill routers <br> 3. Paste routing instructions into Instructions <br> ⚠️ 20-file knowledge cap total — curate a subset, retrieval search not lazy loading |
| **[OpenAI API](docs/OPENAI_API_SETUP.md)** | 1. Put `SKILL.md` (+ known-relevant skill/core files) in the system message for a narrow integration <br> 2. Or build a function-calling loop that fetches pack files by path for real per-request loading <br> ⚠️ No built-in gate-script awareness — wire it in yourself if enforcement matters |
| **[GitHub Copilot](docs/COPILOT_SETUP.md)** | 1. Unzip into the repo <br> 2. Create `.github/copilot-instructions.md` with a *short* routing instruction (not the full `AGENT_SYSTEM_PROMPT.md`) <br> 3. Optional: path-scoped `.github/instructions/*.instructions.md` with `applyTo` <br> ⚠️ Always-loaded in full, not fetch-on-demand — the 76 references are out of reach unless pasted by hand |
| **[Gemini](docs/GEMINI_SETUP.md)** | 1. Put `SKILL.md` in the system instruction (add `core/*.md` + skill routers too for a broad integration — the large context window absorbs it) <br> 2. For true on-demand loading, wire function-calling to fetch pack files by path <br> ⚠️ Static context by default, not lazy loading — a big window makes the cost affordable, not free |

**Don't see your agent?** [`install/`](install/) adds adapters for Windsurf, Continue.dev, Aider and OpenAI Codex CLI — untested against the matrix, but following each host's documented rules format. [docs/AGENT_COMPATIBILITY.md](docs/AGENT_COMPATIBILITY.md) has the full matrix; [docs/INSTALL.md](docs/INSTALL.md) covers generic setup.

`SKILL.md` is self-contained, so no system-prompt setup is required. If your host supports a system prompt, [`AGENT_SYSTEM_PROMPT.md`](AGENT_SYSTEM_PROMPT.md) is a registry-native drop-in that makes the loading protocol and the validation contract explicit.

The agent reads the registry, matches your request to one skill, and loads only that skill plus its dependencies. **No slash commands** — routing is on natural-language trigger keywords. Full guide: [docs/USAGE.md](docs/USAGE.md).

## Architecture — registry + lazy loading

| Layer | What it is | Cost |
|---|---|---|
| `SKILL.md` | Registry, routing table, anti-slop wall | **1,837 tokens** — always loaded |
| `core/` | Shared primitives (tokens, a11y, component API, behaviour, checklist, intake) | 2,073–2,241 tokens — the deps one skill declares |
| `skills/{id}/SKILL.md` | One skill file | 789–1,572 tokens — one per request |
| `skills/{id}/references/` | Deep material | **305,771 tokens** — loaded only when a skill points at it |

**A typical request loads 4,714–5,482 tokens, not 300,000.** Adding a skill costs about 58 tokens of always-loaded context — that is what the 16th cost, taking the registry from 1,779 to 1,837.

## Skills (16)

| Skill | Covers |
|---|---|
| `agent-ops` | Token/context budgeting, memory persistence, continuous learning, verification loops, parallelization, subagent orchestration |
| `design-principles` | UX laws, Gestalt, hierarchy, the three AI-design clusters, design DNA extraction |
| `component-patterns` | Animated text, wrapper effects, ambient backgrounds, scroll-coupled components |
| `react-components` | shadcn/Radix, compound components, CVA, forwardRef, prop taxonomy |
| `landing-pages` | Hero, pricing, testimonials, bento, social proof, empty states |
| `forms` | RHF + Zod, validation, auth, OTP/MFA, checkout |
| `data-tables` | Tables, sorting, pagination, charts, KPI cards, dashboards |
| `animations` | Framer Motion, GSAP, scroll, view transitions, **motion direction** |
| `threejs-3d` | R3F, drei, shaders, post-processing, loaders, raycasting |
| `design-system` | OKLCH tokens, dark mode, typography, brand systems, style presets |
| `iconography` | Icon sizing, weight matching, colour inheritance, SVG a11y, avatars |
| `ai-ui-generation` | Prompt-to-UI, JSON-to-UI, component registries, generation guardrails |
| `react-performance` | Waterfalls, bundle size, RSC, memoization, virtualization |
| `testing` | Vitest, Testing Library, jest-axe, Playwright, Storybook |
| `web-interface` | Vercel WIG, copywriting, contrast, typography detail, audit rules |
| `platform` | Mobile/PWA, React Native, i18n, SEO, payments, email, AI chat |

## Core files (8)

| File | Purpose |
|---|---|
| `core/design-tokens.md` | OKLCH tokens, 4pt spacing, typography, canvas rules |
| `core/accessibility-baseline.md` | WCAG 2.2 AA floor — structure, keyboard, focus, contrast, states |
| `core/component-api.md` | Prop taxonomy, forwardRef, CVA, controlled/uncontrolled |
| `core/component-api-deep.md` | Compound components, composition patterns, API anti-patterns |
| `core/agent-behavior.md` | The four principles — think, simplify, stay surgical, verify |
| `core/agent-behavior-patterns.md` | Design-work addendum, external behavioural patterns |
| `core/validate-checklist.md` | All 51 constraints (16 parser + 35 regex, unique IDs) with pass criteria |
| `core/user-intake.md` | Six questions to ask before building a site — and when not to ask them |

## Demos

Four projects generated by the skill routing itself — the pack eating its own cooking. Copy the prompt for any of them from [docs/DEMO_PROMPTS.md](docs/DEMO_PROMPTS.md) and try it yourself.

| Demo | Type | Route taken | What it demonstrates |
|---|---|---|---|
| [`demo/landing-page/`](demo/landing-page/) | Stub-typed | `landing-pages` + `core/design-tokens.md` | Dark OKLCH surface, asymmetric bento features, tabular-nums pricing, skip link |
| [`demo/dashboard/`](demo/dashboard/) | Stub-typed | `data-tables` + `react-performance` + `core/component-api.md` | Sortable table with all four states, `next/dynamic` chart, `content-visibility` |
| [`demo/auth-form/`](demo/auth-form/) | Stub-typed | `forms` + `core/component-api.md` | RHF + Zod, `aria-describedby` errors, OAuth, jest-axe test |
| [`demo/showcase/`](demo/showcase/) | **Runnable Next.js app** | `landing-pages` + `threejs-3d` + `forms` | R3F hero, bento grid, pricing, testimonials, validated form — see [See It In Action](#see-it-in-action) below |

The three stub-typed demos are checked by the same suites as the gold examples — `tsc --noEmit` strict, 16 AST constraints, 35 regex constraints:

```bash
bash demo/validate.sh              # all three
bash demo/validate.sh dashboard    # one
```

`demo/showcase/` is the one that breaks that convention on purpose — a real, installed, dev-server-verified app, detailed below.

Demos are proof, not doctrine. Where a demo and a skill rule disagree, **the rule wins and the demo is the bug.**

## See It In Action

[`demo/showcase/`](demo/showcase/) is the one project in `demo/` that breaks the stub-typed convention above on purpose: a real, standalone Next.js 15 + React 19 + Tailwind v4 app — its own `package.json`, real installed dependencies (React Three Fiber + drei, React Hook Form + Zod), a dev server that actually boots. It's a cinematic dark-mode landing page for a fictional AI analytics product, "Nexus" — near-black OKLCH surface, single acid-green accent, an asymmetric bento grid, a WebGL particle hero, and a validated contact form.

```bash
cd demo/showcase
npm install
npm run dev   # http://localhost:3000
```

The exact prompt that generates it is documented in [`demo/showcase/README.md`](demo/showcase/README.md#the-prompt-that-would-generate-this) (also collected with the other three in [docs/DEMO_PROMPTS.md](docs/DEMO_PROMPTS.md)) — copy it into any agent set up per the docs below and compare the output.

**The route it takes.** The registry matches *WebGL*, *bento*, *pricing*, *form* and *carousel* against the trigger-keyword column and loads `landing-pages`, `threejs-3d` and `forms` in turn, each pulling `core/design-tokens.md` and `core/component-api.md` from its declared `core-deps`, plus the two universal deps (`core/accessibility-baseline.md`, `core/validate-checklist.md`). Nothing else is read. The bans in the prompt — no Inter, no purple gradient, no `min-h-screen`, no equal-weight card grid — are not politeness: they are the anti-slop wall restated, and the constraint suite fails the build if the output violates them.

**It is checked, not just shipped.** Unlike the three stub-typed demos above, the showcase has real dependencies, so it gets a real check: Gate 9 runs `next build` against the actual vendor typings, and CI installs its dependencies on a clean runner to do the same. It is held to the same content rules as everything else — the 16 AST checks on every authored file, the 35 regex checks on the project. A "runnable demo" that nobody runs is a claim with a shelf life.

![Nexus showcase — dark-mode analytics landing page with WebGL particle hero, asymmetric bento grid, and acid-green accents](demo/showcase/screenshot.png)

Above-the-fold, default viewport, reduced motion off, captured via a headless Chromium driving the real dev server — not staged, not retouched. If a future change to `demo/showcase` makes this stale, [`.github/SCREENSHOT_CONTRIBUTION.md`](.github/SCREENSHOT_CONTRIBUTION.md) has the exact recapture spec.

## What's new in v14.2.3

- **Native adapters, not a setup doc you follow by hand.** [`install/`](install/) holds ten directories — nine hosts plus a generic card for anything else — each containing the rules file you would otherwise write yourself. Five install themselves: `bash setup.sh` detects Cursor, Copilot, Windsurf, Continue.dev or Aider from marker files already in your project, refuses to guess when two match, and overwrites nothing without `--force`. The rest stay manual, because a web-UI knowledge upload is not something an installer can honestly automate.
- **They ship inside the archive now, not just the repo.** `install/`, `setup.sh` and `setup.ps1` are part of the `.skill` file itself. The archive is the transport layer for every host that isn't Claude Code, so an adapter you could only get by cloning was an adapter most people could not get.
- **Four of them are untested, and say so.** Windsurf, Continue.dev, Aider and Codex CLI each follow that host's own documented rules format, but none is in the [tested matrix](docs/AGENT_COMPATIBILITY.md) — the format is right, nobody has run the matrix against it. Marked untested everywhere they appear rather than absorbed into a bigger "supported" count.

This one shipped as an explicit, one-time exception to the freeze stated below — the work was built and audited before the freeze took effect. The freeze resumed the moment it landed; [docs/CHANGELOG.md](docs/CHANGELOG.md) carries the full reasoning.

## Verification

Every release is produced by `scripts/build_release.py` with 9 blocking gates:

1. **Pre-flight** — clean tree, token budget, version consistency, no version-string leaks
2. **Frontmatter** — every skill declares `name`/`description`/`version`/`core-deps`, and its deps exist
3. **Compile** — `tsc --noEmit` strict + `noImplicitAny` over every example
4. **Semantic** — 16 AST constraints via the TypeScript compiler API
5. **Syntactic** — 35 regex constraints (tokens, fonts, spacing, anti-slop, 3D, copy)
6. **Pipeline** — `AGENT_SYSTEM_PROMPT.md` stage markers, architecture checks, and every path it cites resolves
7. **Evals + coverage** — 22 eval cases; every gold has a test
8. **Budget + registry** — every skill ≤3,000 tokens and ≤8,000 with deps; every registry row resolves
9. **Showcase build** — `demo/showcase/` (the real, installed Next.js app) builds clean under `next build` against its actual vendor typings

Then: path integrity, reference-depth audit, archive build, and a post-build smoke test that re-runs the gates against the *unzipped* archive.

```bash
npm install
npm run gates    # all 9 gates, no archive
npm run build    # gated archive → dist/
```

## Issues & contributing

Bugs first: a confirmed defect is exempt from the freeze, and five of them lift it. [Open an issue](https://github.com/Krishna-Modi12/frontend-design-pro/issues) with the file path, the host you ran it on, and which of the 9 gates should have caught it. Feature requests are counted rather than closed — ten distinct ones for the same thing also lifts the freeze. The policy is in [docs/MAINTENANCE.md](docs/MAINTENANCE.md), and the triage replies are published in [docs/RESPONSE_TEMPLATES.md](docs/RESPONSE_TEMPLATES.md) rather than kept private.

Sending code:

- All changes must pass the 9 gates — CI runs them on every push and PR
- New depth → `skills/{id}/references/`; new skill → a directory plus one registry row
- New gold example → `skills/{id}/examples/` **with** a matching `.test.tsx` (Gate 7 blocks otherwise)
- New semantic rule → a check in `parser_constraints.js` **and** a divergence case in `parser_regression_test.js`

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the repo-vs-archive layout.

**The pack is under a feature freeze as of v14.2.2** — bug fixes, typo fixes and broken-link fixes only, until 10 people ask for the same feature, 5 real bugs land, or two monitored weeks pass. Rationale and the exact thresholds: [docs/MAINTENANCE.md](docs/MAINTENANCE.md).

## Docs

**Setup** — [Claude](docs/CLAUDE_SETUP.md) · [Cursor](docs/CURSOR_SETUP.md) · [ChatGPT](docs/CHATGPT_SETUP.md) · [OpenAI API](docs/OPENAI_API_SETUP.md) · [Copilot](docs/COPILOT_SETUP.md) · [Gemini](docs/GEMINI_SETUP.md) · [Generic](docs/INSTALL.md) · [Compatibility matrix](docs/AGENT_COMPATIBILITY.md)

**Reference** — [Usage](docs/USAGE.md) · [Architecture](docs/ARCHITECTURE.md) · [Known gaps](docs/ARCHITECTURE.md#known-gaps) · [Maintenance policy](docs/MAINTENANCE.md) · [Demo prompts](docs/DEMO_PROMPTS.md) · [Changelog](docs/CHANGELOG.md)

## License

MIT — see [LICENSE](LICENSE).
