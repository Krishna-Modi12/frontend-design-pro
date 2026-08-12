import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import type { PlatformMetric } from "../../../../components/MetricsStrip";

/**
 * The one endpoint the page reads. It serves `screenshot-fixture.json` — demo
 * figures for a fictional product, committed so the capture is reproducible.
 *
 * The point is not the data. It is that `app/page.tsx` gets four real states: a
 * page whose numbers are imported at build time can never be loading, never be
 * empty and never fail, so it ships three branches nobody ever exercised.
 * `STA-01` and `STA-02` are scored over the whole project, and a demo that fakes
 * its own network is the thing this pack exists to argue against.
 *
 * Read from disk per request rather than imported, so editing the fixture during
 * `next dev` shows up on reload instead of at the next restart — the fixture is
 * the thing a contributor changes.
 *
 * `force-static` is what lets that survive `output: "export"`: an export drops
 * *dynamic* route handlers, so without it the deployed page would 404 here and
 * sit in its error state permanently. Next evaluates the handler at build time
 * and writes the response into the output, and `next dev` still re-runs it.
 */
export const dynamic = "force-static";

export interface OverviewResponse {
  metrics: PlatformMetric[];
}

export async function GET(): Promise<NextResponse> {
  const fixture = join(process.cwd(), "screenshot-fixture.json");

  try {
    const raw = await readFile(fixture, "utf8");
    const parsed: OverviewResponse = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch {
    // A missing or malformed fixture is a real 500, not an empty payload. The
    // page has an error branch; handing it `{}` would render the empty state
    // instead and quietly claim the product has no figures.
    return NextResponse.json({ error: "overview fixture unreadable" }, { status: 500 });
  }
}
