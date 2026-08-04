// Runtime stub for `gsap/SplitText`. See ./README.md for why these exist.
// Real SplitText rewrites an element's text into per-char/word/line spans. jsdom
// has no line boxes, so there is nothing to split — the collections stay empty and
// `revert()` is a no-op, which is what the golds' cleanup calls.

export class SplitText {
  chars: unknown[] = [];
  words: unknown[] = [];
  lines: unknown[] = [];
  constructor(_target?: unknown, _vars?: unknown) {}
  split() { return this; }
  revert() {}
  static name_ = 'SplitText';
}

export default SplitText;
