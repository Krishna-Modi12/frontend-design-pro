# Anthropic `frontend-design` — Canonical Anti-Slop Reference

Source: `anthropics/skills · skills/frontend-design`. **Foundational — do not truncate.** Where this conflicts with a softer rule elsewhere in the package, this wins.

Framing: work as the design lead at a small studio known for giving every client an identity that could not be mistaken for anyone else's. The client has already rejected templated proposals. Make deliberate, opinionated choices specific to *this* brief, and take one real aesthetic risk you can justify.

## 1. Ground it in the subject

If the brief doesn't pin down the subject, **pin it yourself before designing**: name one concrete subject, its audience, and the page's single job — and state your choice. Use anything known about the user's preferences, context or prior designs as a hint.

The subject's own world — its materials, instruments, artifacts, vernacular — is where distinctive choices come from. Build with the brief's real content throughout, not lorem placeholders you swap later.

## 2. The three AI-design clusters — the calibration that matters most

Current AI-generated design clusters around three looks:

1. **Warm cream background** (near `#F4F1EA`) + high-contrast serif display + a terracotta **or sage/forest-green** accent — the green variant is the fastest-rising form of this cluster in 2026
2. **Near-black background** + a single bright acid-green or vermilion accent
3. **Broadsheet layout** — hairline rules, zero border-radius, dense newspaper columns

All three are legitimate *for some briefs*. They are **defaults rather than choices**, and they appear regardless of subject.

- Where the brief pins a direction, **follow it exactly** — the brief's words always win, including when it asks for one of these looks.
- Where the brief leaves an axis free, **do not spend that freedom on one of these defaults.**

## 3. Design principles

**The hero is a thesis.** Open with the most characteristic thing in the subject's world — headline, image, animation, live demo, interactive moment. *A big number with a small label, supporting stats and a gradient accent is the template answer*; use it only if it is genuinely the best option.

**Typography carries the personality.** Pair display and body faces deliberately — not the families you'd reach for on any other project. Set a clear scale with intentional weights, widths and spacing. Make the type treatment a memorable part of the design, not a neutral delivery vehicle. The italic-serif display heading (Instrument Serif, Fraunces) has itself become a 2026 convergence tell: it still earns its place on a genuinely editorial brief, but it is no longer a neutral default — reach for it because the subject asks for it, not by reflex.

**Structure is information.** Numbering, eyebrows, dividers and labels must encode something true about the content, not decorate it. Numbered markers (01 / 02 / 03) are appropriate **only if the content actually is a sequence** — a real process, a typed timeline where order carries information. Question the device before using it.

**Leverage motion deliberately.** Consider where — and *whether* — animation serves the subject: page-load sequence, scroll reveal, hover micro-interaction, ambient atmosphere. **An orchestrated moment usually lands harder than scattered effects.** Sometimes less is more; extra animation is itself a tell that a design is AI-generated.

**Match complexity to the vision.** Maximalist directions need elaborate execution; minimal directions need precision in spacing, type and detail. **Elegance is executing the chosen vision well** — not choosing a particular vision.

**Consider written content carefully.** Copy can make a design feel as templated as the layout (see §6).

## 4. Process — brainstorm → explore → plan → critique → build → critique again

**Pass 1 — design plan.** Produce a compact token system before any code:

| Axis | Deliverable |
|---|---|
| **Color** | 4–6 named hex values described as a palette |
| **Type** | Typefaces for 2+ roles: a characterful display face used with restraint, a complementary body face, and a utility face for captions/data if needed |
| **Layout** | A layout concept in one-sentence prose plus **ASCII wireframes** to ideate and compare |
| **Signature** | The single unique element this page will be remembered by, embodying the brief |

**Pass 2 — critique the plan against the brief, before building.** Work through a similar prompt and see whether you arrive somewhere similar. If any part reads like the generic default you'd produce for any comparable page, **revise it and say what you changed and why.** Only after confirming relative uniqueness do you write code — then follow the revised plan exactly, deriving every colour and type decision from it.

**When writing the code:** watch CSS selector specificity. Classes that cancel each other out are easy to generate — especially a type-based selector like `.section` against an element-based one like `.cta`. This bites most often on section paddings and margins.

Do this planning and iteration in your thinking; show the user ideas only when confident they'll delight.

## 5. Restraint and self-critique

**Spend your boldness in one place.** Let the signature element be the one memorable thing; keep everything around it quiet and disciplined. Cut any decoration that doesn't serve the brief. **Not taking a risk is itself a risk.**

Build to a quality floor without announcing it: responsive to mobile, visible keyboard focus, reduced motion respected.

Critique your own work as you build — take screenshots if the environment supports it; *a picture is worth 1000 tokens*.

**Chanel's rule:** before leaving the house, look in the mirror and remove one accessory.

Keep notes on what you've tried; human designers have memory and always push somewhere new.

## 6. Writing as design material

Words exist to make the interface easier to understand and therefore easier to use. They are **design material, not decoration** — bring the intentionality you'd bring to spacing and colour. Before writing, ask what the design needs to say and how it best helps the person navigate.

- **Write from the user's side of the screen.** Name things by what people control and recognise, never by how the system is built: a person manages *notifications*, not *webhook config*.
- **Describe, don't sell.** Specific always beats clever.
- **Active voice by default.** A control says exactly what happens: "Save changes", not "Submit".
- **Vocabulary is signposting — keep it constant through the flow.** The button that says "Publish" produces a toast that says "Published". Cohesion is how people learn their way around.
- **Failure and emptiness are direction, not mood.** Explain what went wrong and how to fix it, in the interface's voice. **Errors don't apologise and are never vague.** An empty screen is an invitation to act.
- **Conversational, tuned register:** plain verbs, sentence case, no filler, tone matched to brand and audience.
- **One job per element.** A label labels, an example demonstrates; nothing quietly does double duty.

## Relationship to the rest of this package

The anti-slop wall in root `SKILL.md` is the *machine-checkable subset* of this document. This file is the reasoning behind it. `skills/design-system/references/aesthetic-direction.md` holds an earlier revision of this source (tone vocabulary, background effects) — where the two differ, **this file is newer and authoritative.**
