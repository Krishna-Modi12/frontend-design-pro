# Design DNA — Extracting a Visual Identity into a Reusable Spec

Source: zanwei/design-dna (MIT). The value here is the **protocol**: turning "make it look like that site" into a machine-readable spec any agent can consume.

## Three dimensions

| Dimension | Captures | Fields |
|---|---|---|
| **Design System** | Measurable tokens | colour, typography, spacing, layout, shape, elevation, motion, components |
| **Design Style** | Qualitative perception | mood, visual language, composition, imagery, interaction feel, brand voice |
| **Visual Effects** | Beyond plain CSS | Canvas, WebGL, 3D, particles, shaders, scroll-driven motion, cursor effects, SVG animation, glassmorphism |

The third dimension is what most token extractions miss — and it is usually the reason a faithful-looking rebuild still feels flat.

## Three-phase workflow

1. **Structure** — surface the schema before looking at anything, so extraction is exhaustive rather than impressionistic.
2. **Analyse** — from screenshots or URLs, produce a *complete* profile. **Every field filled; conflicts noted rather than silently resolved.** An empty field is an unasked question.
3. **Generate** — apply the profile to the user's own content.

Phases chain or stand alone. The JSON is the artifact: commit it, version it, share it, refine it.

## Why this matters for an agent

A DNA profile converts a subjective request into a spec with no guesswork left in it. Feed the profile plus content, and two different agents produce consistent output — which is the whole game.

## The polish iteration

First passes come out visually thin against their reference. The fix is not to start over: **re-attach the same references and run a deliberate audit pass** —

> Against the reference, audit hierarchy, ornamentation, typographic rhythm, motion, materiality, and overall UI — then merge your conclusions back into the current implementation.

Those six axes are the ones that separate "structurally correct" from "reference-faithful". Ornamentation and materiality are the two agents systematically under-deliver on.

## Applying in this skill

Extraction target maps onto `core/design-tokens.md` (system dimension), `skills/design-system/references/` (style/brand dimension) and `skills/motion-graphics/` + `skills/threejs-3d/` (effects dimension). A supplied `DESIGN.md` is parsed by `skills/design-system/references/design-md-parser.md` — the same idea, narrower schema.
