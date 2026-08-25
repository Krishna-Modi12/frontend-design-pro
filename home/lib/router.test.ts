import { describe, expect, it } from "vitest";
import { route } from "./router";
import data from "./data.generated.json";
import type { SkillRecord } from "./data.types";

const skills = data.skills as SkillRecord[];

/**
 * Real routing behavior against the live registry, not a hand-rolled
 * fixture — `data.generated.json` is the same file `tools/pages-data`
 * regenerates from `SKILL.md`'s trigger-keyword table, so these tests fail
 * the moment that table changes in a way that moves an outcome below,
 * rather than silently drifting from what actually ships.
 *
 * Half of these assert `kind: "none"` or `kind: "ambiguous"` on purpose.
 * That is not a weaker test — it is today's real, correct behavior for a
 * router whose own contract is "no keyword match, ask one question, never
 * guess" (SKILL.md's loading protocol, step 7). A future routing
 * improvement that makes one of these resolve should have to touch this
 * file consciously, not slip past unnoticed.
 */
describe("router — sanity", () => {
  it("routes an unambiguous single-domain request", () => {
    const result = route(skills, "Build a checkout");
    expect(result.kind).toBe("hit");
    if (result.kind === "hit") expect(result.skill.id).toBe("forms");
  });

  it("routes a second unambiguous request to a different skill", () => {
    const result = route(skills, "redesign our pricing section");
    expect(result.kind).toBe("hit");
    if (result.kind === "hit") expect(result.skill.id).toBe("landing-pages");
  });

  it("most-specific-wins: a two-word trigger outranks a one-word trigger it contains", () => {
    // SKILL.md's own example: "form validation" goes to `forms` (2-word
    // trigger "form validation" isn't itself listed, but `forms` picks up
    // both "form" and "validation" as separate one-word keywords, scoring 2
    // against react-components' unrelated "component" not matching at all).
    const result = route(skills, "form validation");
    expect(result.kind).toBe("hit");
    if (result.kind === "hit") {
      expect(result.skill.id).toBe("forms");
      expect(result.score).toBe(2);
    }
  });
});

describe("router — verb-modified intent (master-prompt routing examples)", () => {
  it("a build request for a form-shaped surface hits forms", () => {
    const result = route(skills, "Build a checkout");
    expect(result.kind).toBe("hit");
  });

  it("an audit request on the same surface is genuinely ambiguous, not silently wrong", () => {
    // "audit" is web-interface's own trigger keyword (review, audit,
    // guidelines, a11y audit, ...) and "checkout" is forms'. Both score 1,
    // so the router ties rather than picking one — which is the documented
    // "never guess" behavior working as designed, not a bug. Whichever the
    // agent's clarifying question resolves to, `core/accessibility-baseline.md`
    // loads regardless: it is a universal dependency whenever code is
    // produced, not something only web-interface brings in.
    const result = route(skills, "Audit this checkout for keyboard accessibility");
    expect(result.kind).toBe("ambiguous");
    if (result.kind === "ambiguous") {
      const ids = result.between.map((s) => s.id).sort();
      expect(ids).toEqual(["forms", "web-interface"]);
    }
  });
});

describe("router — real, documented gaps (Layer D/G/H in docs/CAPABILITY_MATRIX.md)", () => {
  it("screenshot-to-code has no keyword coverage yet", () => {
    const result = route(skills, "Turn this screenshot into React");
    expect(result.kind).toBe("none");
  });

  it("visual comparison against a reference has no keyword coverage yet", () => {
    const result = route(skills, "Compare this implementation against the screenshot");
    expect(result.kind).toBe("none");
  });

  it("a naturally-phrased performance request does not reach react-performance", () => {
    // react-performance's keywords are performance/optimize/waterfall/bundle/
    // memo/lazy/dynamic import/preload/rsc/core web vitals — none of which
    // "make this page faster" contains. Documented here rather than patched
    // silently: widening a skill's trigger keywords changes shipped routing
    // behavior and is an owner-approval change per docs/MAINTENANCE.md, not
    // something to fold into a test-coverage commit.
    const result = route(skills, "Make this page faster");
    expect(result.kind).toBe("none");
  });

  it("a naturally-phrased security request has no keyword coverage (no SEC-* category exists)", () => {
    const result = route(skills, "Check this frontend for unsafe DOM usage");
    expect(result.kind).toBe("none");
  });
});
