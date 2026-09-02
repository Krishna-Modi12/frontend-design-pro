# Motion Budget

`references/animation-framework.md` answers *how* a thing should move — which
easing, which duration, which library. This file answers a question that comes
earlier and is usually skipped: **how much should this page move at all.**

Skipping it is why pages land in one of two failure states. Either motion is
decided per element — "should this card fade in?" asked forty times, answered
inconsistently — or a single decision ("make it feel premium") is applied
everywhere until the page is exhausting. A budget makes it one page-level
decision, made before the first `transition` is written, and gives you something
to say no against.

## The three tiers

| Tier | Contains | Does not contain |
|---|---|---|
| **L1 — Functional** | State feedback: hover, focus, active, disabled. Disclosure (accordion, dropdown, sheet). Toast and loading states. Layout shifts that explain themselves. | Entrance choreography, scroll coupling, ambient background motion, cursor effects |
| **L2 — Expressive** | Everything in L1, plus entrance choreography on first paint, scroll-triggered reveals, and **one** ambient background layer | Pinned scroll sequences, page transitions, physics toys |
| **L3 — Cinematic** | Everything in L2, plus pinned/scrubbed scroll sequences, view transitions between routes, and one signature interaction that is the page's memorable moment | More than one signature moment competing for the same attention |

Tiers are cumulative. L3 without solid L1 is the most common mistake in the
category: a page with a scrubbed hero sequence and no visible focus ring.

## Picking the tier

The question is not how impressive the page should be. It is **what the visitor
came to do**:

| The visitor came to… | Tier | Why |
|---|---|---|
| Complete a task — checkout, settings, admin, data entry, auth | **L1** | They have a job. Motion between them and the job is a tax, and entrance animation on a form is a delay wearing a costume. |
| Read something — docs, article, changelog, reference | **L1** | Reading is the task. Reveal-on-scroll fights the reader's own pace and breaks `Cmd+F`. |
| Understand a product — marketing, pricing, feature pages | **L2** | Motion carries the argument: sequence reveals the order to read in, and emphasis marks what matters. |
| Be convinced by a brand — launch page, portfolio, showcase | **L3** | Feeling *is* the message here, so the motion is the content rather than a wrapper on it. |
| Use an app you built — dashboards, tools, internal UI | **L1** | Repeated daily. Anything charming on visit one is friction by visit thirty. |

When a page is genuinely mixed — a landing page with a signup form in it — the
tier applies per region, and the **form drops to L1** regardless of what the hero
is doing. Motion tiers follow intent, and intent changes inside a page.

## Coverage across scales, not a count of effects

For L2 and above, the useful test is not *how many* effects there are but whether
they operate at different **scales**. Motion all at one scale reads as a gimmick;
motion distributed across scales reads as a designed system:

| Scale | Example | Notes |
|---|---|---|
| Page | One ambient background layer | Never more than one |
| Section | Scroll-triggered reveal as a section enters | The workhorse of L2 |
| Element | Card hover, button magnetism, icon transition | Where perceived quality actually lives |
| Text | Headline entrance, counter, decode | One per page; see granularity below |

If every piece of motion on the page is a scroll reveal, the page has one idea
repeated. If the hero has four competing effects and nothing else moves, the page
has a demo at the top and a document underneath.

## Ceilings

These are the numbers a page stops being pleasant past. They are cheap to check
and each one exists because exceeding it degrades something measurable:

- **One** WebGL or shader background per page. Two means two GL contexts, two
  compile stalls, and a shared budget neither respects.
- **Two** continuous "heavy" animations total — anything running every frame while
  idle. A third is what turns a laptop fan on.
- **Four to six** signature moments at L2, **six to eight** at L3, and **never
  more than ten**. Past that the page has no emphasis, because everything is
  emphasised.
- **Three** concurrent GSAP timelines. More competes for the main thread and the
  scrubbing goes uneven.
- **Below 640px**, heavy backgrounds degrade to a static gradient and 3D degrades
  to its 2D equivalent. Mobile is where the GPU budget and the battery are
  smallest and the traffic is largest.
- **Cursor-dependent effects** — magnetism, trails, spotlights, custom cursors —
  render only behind `matchMedia('(hover: hover) and (pointer: fine)')`. On touch
  there is no cursor to follow, so the effect is either invisible or fires on
  first tap, which reads as a bug.

```ts
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
```

## Reduced motion is not tier zero

`prefers-reduced-motion: reduce` does not drop the page to L1 and it never removes
content. It means **render the destination state immediately**: the reveal's final
opacity, the counter's final number, the sequence's last frame, the assembled
text. The information the motion was carrying still has to arrive.

A reduced-motion path that leaves an empty hero, a `0` counter or an invisible
headline is a content bug found by an accessibility setting. This is the single
most common defect in this whole area, and it exists because reduced motion gets
implemented as `animation: none` rather than as a state.

Cross-fades and opacity changes under ~200ms are generally acceptable under
reduced motion; what users are asking to be spared is *movement* — parallax,
scale, spin, scrub, and anything that implies travel across the viewport.

## Text reveal granularity

Choosing the unit a text reveal animates is a typographic decision, not a motion
one:

| Unit | Right for | Wrong for |
|---|---|---|
| Character | Short Latin display headlines, decode and scramble effects | Anything over about six words — it reads as a flicker |
| Word | Latin headlines and sub-heads, most cases | Dense body copy |
| Line | Body copy, paragraphs, quotes | Nothing — this is the safe default |

**For Chinese, Japanese and Korean, reveal by line only.** Each glyph carries
roughly the weight of a whole Latin word, so a per-character stagger across a CJK
sentence produces dozens of independently moving units and reads as noise rather
than as a reveal. `design-system/references/cjk-typography.md` carries the
related text rules.

## Budget audit

- The tier is written down somewhere before the motion is built, and the page's
  regions each inherit or override it deliberately.
- Signature moments counted, and inside the tier's range.
- One ambient layer, at most one GL context.
- Every cursor-dependent effect is behind a `(hover: hover)` query.
- Every animated element has a reduced-motion resting state that still shows its
  content — checked by actually toggling the OS setting, not by reading the code.
- Below 640px, the heavy layers are gone and the page still makes its argument.
- Focus rings survive. An L3 page that lost them regressed to unusable while
  looking finished.

## Sources

The three-tier model and the numeric ceilings are adapted from
`xiaopu-ai/web-design` (MIT), which states them as a production rule set; the
scale-coverage framing, the intent-driven tier table and the reduced-motion and
CJK-granularity rules are written for this pack. The catalogue of named effects
those tiers draw from lives in
`component-patterns/references/react-bits.md`.
