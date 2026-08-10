# AI UI Generation — Patterns and Guardrails

Category reference for prompt-to-UI, JSON-to-UI and generative-interface tooling (OpenUI, Tambo, Morphic, `json-render` and successors). **Tool-specific references are not yet written** — this covers the category's shared patterns and the constraints that must survive whichever tool produced the markup.

## Three generation shapes

| Shape | Input → Output | Where it fits |
|---|---|---|
| **Prompt → component** | Natural language → JSX/HTML | Scaffolding a first draft. Never a final artifact |
| **JSON → UI** | A schema-validated tree → rendered components | Server-driven UI, CMS-driven layouts, agent-rendered responses |
| **Generative interface** | Model chooses components at runtime from a registry | Chat surfaces that render UI instead of prose |

The third is the one with real architectural consequences: the model isn't writing code, it's *selecting* from components you already own. That inverts the safety problem — the registry becomes the constraint surface.

## The registry pattern (generative interfaces)

Expose a **closed set** of components with typed props; the model may only choose from it and fill props. Never let a model emit raw markup into your page.

- Each registered component declares its props as a schema (Zod), and **props are validated before render, not after**.
- Unknown component name → render a documented fallback, never `dangerouslySetInnerHTML`.
- Props that fail validation → render the component's error state, not a blank space.
- Keep the registry small. Every entry is surface area a model can misuse, and a large registry degrades selection accuracy.

## Non-negotiable: generated code is untrusted input

Everything the model emits passes the same gate as hand-written code — this is the entire point of the constraint suite:

1. **Never render model output as raw HTML.** No `dangerouslySetInnerHTML` on generated strings. This is the injection surface.
2. **Validate against a schema at the boundary.** A JSON tree from a model is untrusted until parsed.
3. **Rewrite colours to OKLCH tokens.** Generators emit hex by default — that violates `COL-04` on arrival.
4. **TypeScript strict, no implicit `any`.** Generated props interfaces are usually missing or loose.
5. **Run the a11y check.** Generated markup is where `<div onClick>`, unlabelled inputs and icon buttons without `aria-label` come from. Never ship without axe.
6. **Add the four states.** Generators produce the success state only — loading, empty and error are always missing.
7. **`prefers-reduced-motion` is never in generated animation.** Add it.

## Prompt shape that produces usable output

Order matters: **goal → format → layout → type → colour → constraints**, with the constraints stated as bans. Negative constraints do more work than adjectives — "no gradient backgrounds, no card grid, OKLCH only, TypeScript strict" shapes output far more than "modern and clean".

Supply the token set in the prompt. A generator given `--color-brand: oklch(60% 0.185 276)` uses it; one given "use our brand colour" invents indigo.

## When to use / when to avoid

**Use** for a first-draft scaffold you intend to rewrite · server-driven UI where the shape is data · chat surfaces rendering from a fixed registry · exploring layout variants quickly.

**Avoid** for anything security-sensitive, anything where the output ships unreviewed, and any component that will be maintained long-term — generated code optimises for looking finished, not for being edited. The Karpathy P2/P3 rules apply with extra force: generated output is systematically over-abstracted and touches more than it needs.

## Relationship to the rest of this package

Generated output is validated by the same 56 constraints as everything else (`core/validate-checklist.md`). If a generator's output can't pass the parser gate, the fix is the prompt or the registry — not an exemption.
