/**
 * Per-element horizontal overflow scan, plus a separate scan for wrapped
 * interactive labels — two different defect shapes the page-level check
 * (`document.documentElement.scrollWidth - clientWidth`) misses entirely,
 * because it can read `0` — no page overflow at all — while a single
 * element still has a real problem.
 *
 * These are genuinely different signals, not two views of one bug, and
 * conflating them was a real mistake this file shipped with initially:
 * `scrollWidth > clientWidth` only fires when content is *wider than its
 * box and not wrapping* — exactly what `overflow-x: visible` plus
 * `white-space: nowrap` produces. Text that's free to wrap does the
 * opposite of overflow when it runs out of horizontal room: it wraps to a
 * second line and grows *taller*, and `scrollWidth` stays ~equal to
 * `clientWidth` the whole time. The 768px navbar bug this file was
 * originally written around — a nav label breaking mid-word onto two
 * lines — is that second shape, and `scanElementOverflow` alone cannot see
 * it; `scanWrappedLabels` below is what actually catches it. Both
 * functions are passed directly to `page.evaluate`, so both must stay
 * fully self-contained — no references to anything outside the browser's
 * own globals — since Playwright serializes them via `toString()` and runs
 * them inside the page, not in this Node process.
 *
 * The direct-text-content filter is deliberate: it catches an element like
 * a wrapping inline link or heading without also flagging every
 * legitimately-scrollable container (a code block, a horizontally-scrolled
 * table wrapper) whose overflow is by design, not a defect.
 *
 * A second filter excludes any element whose computed `overflow-x` isn't
 * `visible`. `scrollWidth > clientWidth` is the *expected* shape of every
 * legitimate CSS overflow idiom, not just the navbar bug this scan exists
 * to catch: Tailwind's `.truncate` (`overflow:hidden` + ellipsis) wants a
 * `scrollWidth` past its box by design, a horizontally-scrollable code
 * block (`overflow-x:auto`) does too, and so does `.sr-only` (clipped via
 * `overflow:hidden` to a 1px box while the label lays out at full width).
 * All three were real false positives the first time this scan ran against
 * real pages. The navbar bug this exists to catch had no overflow handling
 * at all — default `overflow-x: visible` — which is exactly the case this
 * filter leaves in.
 */
export function scanElementOverflow() {
  const found = [];
  for (const el of document.querySelectorAll("*")) {
    const hasDirectText = Array.from(el.childNodes).some(
      (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0,
    );
    if (!hasDirectText) continue;

    if (getComputedStyle(el).overflowX !== "visible") continue;

    const overflowPx = el.scrollWidth - el.clientWidth;
    if (overflowPx <= 1) continue;

    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : "";
    const cls = Array.from(el.classList).slice(0, 3).join(".");
    found.push({ selector: `${tag}${id}${cls ? "." + cls : ""}`, overflowPx });
  }
  return found;
}

/**
 * Flags interactive labels (`<a>`, `<button>`) that wrap onto more than one
 * line — the actual defect shape behind the 768px navbar bug this session
 * found by hand, which `scanElementOverflow` above cannot detect (see its
 * own comment).
 *
 * Measures the *text node's own* line boxes via `Range.getClientRects()`,
 * not the element's. That distinction is load-bearing, found by this scan
 * itself producing a false negative against the exact bug it was written
 * for: this repo's nav links are `inline-flex` (`tapTarget`'s shared
 * class), and a flex container is its own formatting context — it renders
 * as one box that grows *taller* to fit wrapped content, so
 * `el.getClientRects().length` stays `1` no matter how many lines the text
 * inside actually wraps to. A `Range` over the text node sidesteps the
 * container's display type entirely and reports the same one-rect-per-line
 * count a plain inline element would.
 *
 * Scoped to `<a>`/`<button>` specifically rather than every element: this
 * design system's own convention (44px single-line tap targets throughout
 * `home/`, `demo/*`) treats a wrapped interactive label as unintended by
 * default, unlike prose, which wraps on purpose. Widening this to arbitrary
 * elements would flag every legitimately multi-line paragraph or heading.
 */
export function scanWrappedLabels() {
  const found = [];
  for (const el of document.querySelectorAll("a, button")) {
    let lines = 0;
    for (const node of el.childNodes) {
      if (node.nodeType !== Node.TEXT_NODE || node.textContent.trim().length === 0) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      lines = Math.max(lines, range.getClientRects().length);
    }
    if (lines <= 1) continue;

    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : "";
    const cls = Array.from(el.classList).slice(0, 3).join(".");
    found.push({ selector: `${tag}${id}${cls ? "." + cls : ""}`, lines });
  }
  return found;
}
