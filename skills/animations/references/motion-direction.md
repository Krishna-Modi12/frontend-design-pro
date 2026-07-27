# Motion Direction — Philosophy Before Implementation

Source: `LottieFiles/motion-design-skill` (MIT). **Despite the origin, this is not about the Lottie format** — it is implementation-agnostic direction: choosing timing, easing, choreography and emotional intent *before* writing animation code. Applies equally to CSS, Framer Motion, GSAP, Spring or Lottie.

The other references in this skill answer *how*. This one answers *what and why* — the layer that separates motion that reads as designed from motion that reads as decorated.

## The decision order

Direction precedes API. Before touching a library, answer in order:

1. **What is this motion communicating?** Arrival, departure, relationship, state change, progress, consequence. If you can't name it in a word, don't animate.
2. **What emotion should it carry?** The same fade at 120ms and 600ms says different things — brisk competence versus considered calm.
3. **Which property carries the meaning?** (see below)
4. **What duration and easing follow from that?**
5. **Does anything else move with it?** (choreography)
6. **What happens under `prefers-reduced-motion`?**
7. **What happens on a slow device or a cold cache?**
8. **Would removing it lose information?** If no, remove it.

## Property selection — properties are vocabulary

| Property | Communicates |
|---|---|
| **Opacity** | Existence — appearing, departing, relevance |
| **Transform: translate** | Origin and destination — where a thing came *from* |
| **Transform: scale** | Emphasis, hierarchy, or proximity to the user |
| **Transform: rotate** | State change or playfulness; rarely literal |
| **Colour** | Status change — never motion in itself |
| **Blur** | Focus and depth; expensive, use sparingly |

Choosing the wrong property is the most common failure: scaling something that should have translated says "this is more important" when you meant "this arrived from over there".

## Motion personality

A product should move one way, not seven. Pick an archetype and hold it across every component:

| Archetype | Duration | Easing | Reads as |
|---|---|---|---|
| **Precise** | 120–200ms | sharp ease-out | Competent, tool-like, gets out of the way |
| **Calm** | 300–450ms | gentle ease-in-out | Considered, premium, unhurried |
| **Playful** | 250–400ms | spring, slight overshoot | Friendly, consumer, approachable |
| **Cinematic** | 500–800ms | custom cubic-bezier | Dramatic — heroes and transitions only, never UI chrome |

**Motion personality is brand identity.** A "calm" product with playful spring buttons feels incoherent even when nobody can articulate why.

## Disney principles that survive translation to UI

- **Ease in / ease out** — nothing in the physical world starts or stops instantly. Bare `linear` reads as mechanical.
- **Anticipation** — a small counter-move before the main move directs attention. Use on deliberate, weighty actions only.
- **Follow-through / overlap** — elements in a group shouldn't stop in perfect unison; 30–60ms of stagger reads as alive.
- **Squash and stretch** — heavily diluted for UI. A 2–4% scale on press is the entire budget.
- **Staging** — one thing moves at a time, or the eye picks the wrong thing.
- **Secondary action** — supports the primary move; if it competes, cut it.

Skipped as not translating: exaggeration, solid drawing, appeal.

## Choreography

Multiple elements need a rationale for their order, not just a delay:

- **Stagger by reading order** — 30–60ms apart. Faster is noise, slower is a queue.
- **Lead with the element that answers "what happened?"** — a dashboard reveals the hero chart, then stats, then chrome. Never alphabetically or by DOM convenience.
- **Group by relatedness** — items in one Gestalt group move together; separate groups move separately.
- **Total sequence ≤600ms** regardless of element count. Past that, users perceive waiting rather than arrival.
- Exits are faster than entrances — roughly 0.6× — because nobody needs to study something leaving.

## Context adaptation

Motion is not a constant; it is a function of context.

- **`prefers-reduced-motion`**: replace movement with opacity, or nothing. Never just shorten the duration — the objection is vestibular, not temporal.
- **Slow devices / low battery**: ambient and looping motion is the first thing to drop.
- **Repetition frequency**: an animation a user sees 100×/day must be near-invisible (≤120ms) or absent. Delight amortises into friction.
- **Screen size**: the same translate distance reads as subtle on desktop and violent on a phone — scale distance with viewport.

## Animation smells

| Smell | Fix |
|---|---|
| Everything animates on load | Stage it — one entrance moment, not fifteen |
| Durations vary arbitrarily across components | Adopt a personality and its duration band |
| Animation that fires on every re-render | Trigger `once`, or key it to the state that actually changed |
| Motion carrying information available nowhere else | Add the text; motion is reinforcement, never the sole channel |
| Spinner where a skeleton belongs | Skeleton — it communicates shape as well as waiting |
| Bare `linear` outside progress bars | Ease it |
| A loop with no off switch | Add reduced-motion and off-screen pausing |

## Quality check

Before shipping any animation: can you name what it communicates · does its duration match the product's personality · does it survive `prefers-reduced-motion` · does it stop off-screen · would removing it lose information? A "no" on the last question means remove it.
