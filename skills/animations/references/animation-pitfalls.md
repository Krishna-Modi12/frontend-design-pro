# Animation Pitfalls — the failures that survive a passing build

Route: debugging an animation that renders wrong rather than one that will not
start; any timeline that must be scrubbed, recorded or tested frame by frame.
Shortcode `[animation-pitfalls]`.
Source: `alchaincyf/huashu-design` (MIT) — the transferable third of its 24-item
catalogue. The rest is a video-export pipeline (recorder warmup, ffmpeg trims,
tmp-directory collisions) that does not apply to generated code.

Each of these passes typecheck, passes lint, and looks correct in a dev tab.
They fail on a second machine, at a different zoom, on the hundredth repeat, or
the first time someone seeks the timeline.

## An animation should be a pure function of time

The failure: state advanced by a chain of `setTimeout` callbacks. It plays
correctly once, and then **cannot be replayed or scrubbed** — a timer that has
already fired cannot un-fire, so seeking backwards leaves the DOM in a state that
belongs to a later moment.

**Aim for `render(t)` to produce one DOM state for a given `t`, with no memory of
how it got there.** Where a side effect is genuinely required — toggling a class,
starting a video — guard it and make the guard resettable:

```ts
const fired = new Set<string>();

function fireOnce(key: string, fn: () => void) {
  if (fired.has(key)) return;
  fired.add(key);
  fn();
}

function reset() {
  fired.clear();
  document.querySelectorAll(".is-shown").forEach((el) => el.classList.remove("is-shown"));
}

export function seek(t: number) {
  reset();
  render(t);
}
```

Two consequences worth stating. **Exposing a seek entry point is what makes the
animation testable at all** — a Playwright test can jump to 3.2s and assert,
where a test that waits 3.2s is slow and flaky. And **keep animation-related
timers under a second**; anything longer is a state machine pretending to be a
timeline, and it will not survive a scrub.

This is the discipline `scroll-experience.md` already depends on without naming:
a scroll-scrubbed video *is* a seek, driven by the scrollbar. If the surrounding
DOM animation cannot be seeked, it desynchronises from the video the moment
someone scrolls up.

## Measure after the fonts load — everywhere, not just on canvas

`canvas-typography/SKILL.md` states this for `measureText`, and `gsap.md` states
it for `SplitText`. **The rule is wider than either: any layout code reading
`getBoundingClientRect`, `offsetWidth` or `offsetHeight` measures the fallback
face until the webfont arrives**, and a position computed then is wrong
permanently — the number was already written into a style.

```ts
document.fonts.ready.then(() => {
  requestAnimationFrame(() => {
    buildLayout();   // metrics are now the real face
    start();
  });
});
```

The extra `requestAnimationFrame` is not superstition: `fonts.ready` resolves
when the face is available, which is not the same moment the browser has
committed a layout using it. One frame later, it has.

The tell in review is a layout that is subtly wrong on a cold load and correct on
refresh. That is a cache making the font instant, not a fixed bug.

## `transform: scale()` blurs text — `zoom` does not

Pushing a whole scene toward the viewer with `transform: scale()` softens every
glyph, and it worsens with the factor. Chromium rasterises an element at its
**layout** size and then scales the resulting bitmap, so scaling past 1 is
enlarging a picture of the text rather than re-rendering it.

`zoom` is a layout-level scale: the element is laid out and rasterised at the
final size, so type stays sharp at any factor.

```css
/* Blurry past ~1.5×: the bitmap is enlarged, not redrawn */
.camera { transform: scale(2); }

/* Sharp at any factor: layout runs at the new size */
.camera { zoom: 2; }
```

**This is the one legitimate exception to "never animate a layout property."**
`zoom` triggers a re-layout on every frame, which is exactly what the rule
forbids — so confine it to a single dedicated camera element wrapping the scene,
never to individual components, and never on a surface that also scrolls. Where
the content is decorative and text-free, `transform` remains correct and cheaper.

## Four properties that silently flatten `preserve-3d`

A scene with `perspective` and `transform-style: preserve-3d` renders completely
flat, with no error anywhere.

**Any intermediate element between the perspective ancestor and the 3D children
that sets `overflow: hidden`, `filter`, `opacity` below 1, or `clip-path` creates
a stacking context, and a stacking context flattens the 3D.** The child is still
transformed; it is simply composited into its parent's plane first.

The check is mechanical — walk from the perspective ancestor down to the element
that lost its depth and read those four properties at each level:

```ts
for (let el = target; el && el !== root; el = el.parentElement!) {
  const s = getComputedStyle(el);
  if (s.overflow !== "visible" || s.filter !== "none" ||
      Number(s.opacity) < 1 || s.clipPath !== "none") {
    console.warn("flattens preserve-3d:", el, s.overflow, s.filter, s.opacity);
  }
}
```

The fix is to move the effect inward: apply the fade or the blur to the innermost
element that needs it, not to a wrapper the 3D has to pass through. A fade-in on
a container is the most common cause, because `opacity: 0.999` mid-transition is
enough to flatten the scene for the duration of the fade and then restore it —
which reads as a flicker rather than as a stacking-context bug.

## Every character must exist in the font you chose

Control-picture glyphs — `␣ ␀ ␋ ⏎ ⌘ ⌥ ⌃ ⇧` — are absent from most display and
serif faces. They render as blank or as tofu, and the meaning disappears without
any warning at build time.

**Build the affordance rather than borrowing a codepoint:**

```css
.key-cap {
  display: inline-flex;
  padding: 0.25rem 0.75rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.8em;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

`<span class="key-cap">Space</span>` reads correctly in every face, scales with
the type, inherits colour, and is announced sensibly by a screen reader — none of
which a `␣` does. Emoji need the same check: outside a colour-emoji face many
fall back to a grey box, so verify or ship an SVG. This is the same argument
`design-system/references/brand-extraction.md` makes against emoji as interface
icons, applied to text inside an animation.
