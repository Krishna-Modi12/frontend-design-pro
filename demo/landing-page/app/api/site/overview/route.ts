import fixture from "../../../../screenshot-fixture.json";

/**
 * `app/page.tsx` reads its metric strip, price book, testimonial verifications
 * and region status from here on mount. The endpoint belongs to the fictional
 * "Tracepoint" product this page advertises — the repo ships the frontend only,
 * so this stands in for it.
 *
 * The body is the committed fixture, imported rather than restated, so the
 * screenshot and the data behind it cannot drift and anyone can reproduce the
 * capture from the repo alone. A plain JSON import also keeps this out of
 * `node:fs`: bundling `fileURLToPath` into a route handler breaks at
 * collect-page-data time.
 */
export function GET() {
  // `_comment` documents the fixture for a human reader; the page never asks for it.
  const { _comment, ...payload } = fixture;
  void _comment;
  return Response.json(payload);
}
