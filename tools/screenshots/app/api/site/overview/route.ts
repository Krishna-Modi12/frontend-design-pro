import fixture from "../../../../../../demo/landing-page/screenshot-fixture.json";

/**
 * `demo/landing-page` reads its metric strip, price book, testimonial
 * verifications and region status from this endpoint on mount. It belongs to the
 * fictional product the page advertises, and the repo ships the frontend only —
 * with no backend the page renders its error state, which is correct behaviour
 * and not what a reader wants from a screenshot.
 *
 * The body is the committed fixture, imported rather than restated, so the image
 * and the data behind it cannot drift and anyone can reproduce the capture from
 * the repo alone. A plain JSON import also keeps this out of `node:fs` — bundling
 * `fileURLToPath` into a route handler breaks at collect-page-data time.
 */
export function GET() {
  // `_comment` documents the fixture for a human reader; the demo never asks for it.
  const { _comment, ...payload } = fixture;
  void _comment;
  return Response.json(payload);
}
