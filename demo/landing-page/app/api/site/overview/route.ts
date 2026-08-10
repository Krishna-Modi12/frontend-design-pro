import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

/**
 * The one endpoint the page reads. It serves `screenshot-fixture.json`, whose
 * figures are copied from `metadata.json` and `docs/TESTING.md` with the source
 * named on each entry.
 *
 * Read from disk per request rather than imported, so editing the fixture during
 * `next dev` shows up on reload instead of at the next restart — the fixture is
 * the thing a contributor changes when a stat moves.
 */
export async function GET(): Promise<NextResponse> {
  const fixture = join(process.cwd(), "screenshot-fixture.json");

  try {
    const raw = await readFile(fixture, "utf8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    // A missing or malformed fixture is a real 500, not an empty payload. The
    // page has an error branch; handing it `{}` would render the empty state
    // instead and quietly claim the pack has no metrics.
    return NextResponse.json({ error: "overview fixture unreadable" }, { status: 500 });
  }
}
