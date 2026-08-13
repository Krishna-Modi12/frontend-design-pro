# Context Engineering — Why Loading Less Produces Better Output, Not Just Cheaper Output

This pack routes one skill per request out of ~344k tokens of depth, and the
argument for that has always been budget: a monolithic pack cannot be loaded at
all. Budget is the weaker half of the argument. The stronger half is accuracy —
a model that receives irrelevant context does not ignore it, and the cost of
loading a file you did not need is paid in wrong answers as well as tokens.

Sources: the context-engineering literature surveyed in
`muratcankoylan/Agent-Skills-for-Context-Engineering` (MIT), which collects the
lost-in-the-middle and context-degradation results. Restated here against our own
architecture; the underlying studies are the citable authority, not this file.

## The U-curve, and the threshold where it starts to matter

Attention across a long context is not flat. The beginning and end of a context
window receive reliable attention; the middle does not. Reported effect: **10–40%
reduced recall for middle-positioned information**, becoming significant past
roughly **4,000 tokens** of context. Below that threshold the effect is not worth
designing around.

This is a consequence of attention mechanics rather than a defect. The first
token acts as an attention sink and absorbs a disproportionate share of the
budget, which leaves the middle progressively under-attended as the context grows.

### What that means here, measured

Our always-loaded root `SKILL.md` is **~2,000 tokens** — below the threshold. The
anti-slop wall sits at 18% of the file and the loading protocol at 80%, so the
two directive sections already occupy the attention-favoured ends, with the
registry table (a lookup, scanned rather than recalled) in between. **No change
warranted.** Recorded because the layout is correct by instinct and the next
person to reorganise that file should know it is load-bearing.

The references are where it bites. **Thirty of our ninety-four `references/*.md`
exceed 4,000 tokens**, and they are loaded whole when routed:

| Reference | Tokens |
|---|---|
| `forms/references/react-hook-form.md` | ~11,600 |
| `design-system/references/brand-design-systems.md` | ~11,400 |
| `forms/references/auth-patterns.md` | ~11,300 |
| `platform/references/subagent-orchestration.md` | ~11,200 |
| `animations/references/framer-motion.md` | ~9,300 |

A rule stated at the midpoint of an 11,000-token reference is in the trough.
That is the position our most detailed guidance tends to occupy, because
detailed guidance accumulates in the middle of a document as it grows.

### The convention that follows

For any reference over ~4,000 tokens:

1. **Open with the conclusions**, not the preamble. The first screen should carry
   the rules a reader would otherwise have to finish the file to learn.
2. **Close with the non-negotiables.** The end of a context window is the second
   attention-favoured position and it is usually wasted on a summary nobody needs.
3. **Use explicit section headers as attention anchors.** Structural markers help
   a model navigate a long context; a wall of undifferentiated prose does not.
4. **When a long block must be included whole**, prepend its key points and
   append its critical conclusion, so the material appears at both ends.

This is a writing convention, not a gate. No check enforces it and none should —
"is the important part near an end" is a judgement, and a regex that guessed at
it would fire on every long file and get muted.

## Four ways context degrades, and what each looks like in this pack

**Poisoning.** A wrong fact enters context and then compounds by self-reference —
every later decision reinforces it. Our exposure is a stale figure in a reference:
once an agent has read `53 constraints`, everything it generates is consistent
with a number that is wrong. This is the failure Gate 11 exists to prevent, and
it is worth knowing that the cost is not merely an embarrassing document — it is
every downstream decision made against it.

**Distraction.** A single irrelevant document measurably degrades performance on
the relevant task. Models cannot skip context; they attend to everything supplied,
so irrelevant material competes with relevant material for a fixed budget. This
is the accuracy argument for lazy loading, and it is why a reference nothing
routes to is worse than dead weight — if something ever loads it speculatively,
it actively costs quality.

**Confusion.** When one context carries several task types, constraints bleed
across them. The pack's defence is structural: one skill per request. It is also
why a skill that quietly grows a second responsibility is a real defect and not
just untidy.

**Clash.** Two sources that are each correct but contradict each other leave a
model unable to choose. We have shipped this: `animation-framework.md` said kill
all motion under `prefers-reduced-motion` while `motion-direction.md` said keep
what aids comprehension, in the same skill. Resolve by precedence, and mark the
contradiction where it cannot be resolved — do not leave both standing.

## Sibling disambiguation — say what a skill is *not* for

Skills in the surveyed pack carry an explicit clause naming adjacent work that
belongs to a *different* skill, by name:

> Do not activate this skill for adjacent work owned by other skills:
> applying token-efficiency tactics after the failure pattern is known →
> `context-optimization`; designing a compression or handoff strategy →
> `context-compression`.

Our registry has 0 exact keyword collisions and 37 substring overlaps, and the
loading protocol never defines the matcher. A near-miss currently lands wherever
the first match falls.

The important detail is **where the clause lives**. Putting preference text in a
skill's registry `description:` would pay for it on every request forever, since
the registry is always loaded — which is why that idea has been staged and
deferred twice. Putting it in the **body** of `skills/{id}/SKILL.md` costs
nothing until that skill is already matched, and by then it is precisely the
moment the question "is this actually the right skill?" is worth asking. Same
mechanism, none of the rent.

## What this does not license

Do not turn this into a compression feature, a context-budget gate, or a new
skill. The finding is a writing convention for long references and an argument
that strengthens one the pack already makes. Our architecture was already right;
what was missing was the reason it is right, stated where a contributor can read
it before deciding that one more 12,000-token reference is harmless.
