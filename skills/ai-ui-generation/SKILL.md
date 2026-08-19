---
name: ai-ui-generation
description: Prompt-to-UI, JSON-to-UI and generative-interface patterns — component registries, schema validation, and the guardrails generated markup must pass. Use when building or consuming AI-generated UI — prompt-to-component scaffolding, schema-driven or server-driven rendering, a chat surface that renders components rather than prose — or when reviewing model-generated markup before it ships.
metadata:
  version: "14.10.1"
  core-deps:
    - core/component-api.md
    - core/validate-checklist.md
---

# AI UI Generation

## When to Use
Building or consuming AI-generated UI: prompt-to-component scaffolding, JSON/schema-driven rendering, server-driven UI, or a chat surface that renders components instead of prose. Also when reviewing model-generated markup before it ships.

## Stack
React 19 · TypeScript strict · Zod for boundary validation · Tailwind v4

## Core Rules
1. **Generated code is untrusted input.** It passes the same gate as hand-written code — no exemptions, ever.
2. **Never render model output as raw HTML.** No `dangerouslySetInnerHTML` on generated strings; that is the injection surface.
3. **Constrain by registry, not by prompt.** For generative interfaces, expose a closed set of typed components the model selects from. The registry is the safety boundary — a prompt is not.
4. **Validate props at the boundary with a schema**, before render. Failure renders the component's error state, never a blank.
5. **Unknown component → documented fallback.** Never improvise markup for a name you don't recognise.
6. **Keep the registry small.** Every entry is misuse surface, and selection accuracy degrades as it grows.
7. **Rewrite colours to OKLCH on arrival** — generators emit hex by default.
8. **Add what generators always omit:** loading/empty/error states, `prefers-reduced-motion`, `aria-label` on icon-only controls, real prop interfaces.
9. **Put the tokens in the prompt.** Given a token, a model uses it; given "our brand colour", it invents indigo.
10. **Constraints as bans beat adjectives.** "No gradients, no card grid, OKLCH only, TS strict" shapes output far better than "modern and clean".

## Patterns
- **Prompt → component** — first-draft scaffold, always rewritten. Never a final artifact.
- **JSON → UI** — schema-validated tree rendered through owned components.
- **Component registry** — closed, typed, Zod-validated; the model selects and fills props, never emits markup.
- **AI design review** — model critiques against the anti-slop wall and `core/validate-checklist.md` rather than generating.

## Reference Index
Load only for the specific task:

| Task | Load |
|---|---|
| Generation shapes, registry pattern, guardrails, prompt shape, when to avoid | `references/generation-patterns.md` |
| Registry/catalog mechanics, Zod-as-tool-definitions, streamed spec shape, partial-prop rendering | `references/generative-ui-runtimes.md` |
| The constraint list generated output must satisfy | `core/validate-checklist.md` |
| Prop/schema design for registered components | `core/component-api.md` |
| Behavioural discipline when accepting generated work | `core/agent-behavior.md` |

## Constraints
No `dangerouslySetInnerHTML` on model output · schema validation at every boundary · OKLCH tokens, no raw hex (`COL-04`) · TypeScript strict with real prop interfaces (`TS-01-AST`) · four states present · `prefers-reduced-motion` handled (`MOTION-01`) · axe-clean before ship. Generated output that cannot pass the parser gate is fixed at the prompt or the registry — never exempted.
