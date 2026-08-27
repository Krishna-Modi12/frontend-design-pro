# Trigger Evaluation Queries for frontend-design-pro

Measured against the description in `SKILL.md`, using Anthropic's own
`skill-creator` eval harness (`skills/skill-creator/scripts/run_eval.py` /
`run_loop.py` in the upstream repo, https://github.com/anthropics/skills), run
against a realistic Next.js 15 + Tailwind v4 codebase so the model can orient
before deciding whether to invoke the skill — an empty project makes every
query fail for the wrong reason.

The set below replaced an earlier one written in clean, textbook phrasing
("Build me a SaaS dashboard with metric cards…"). These are messier and closer
to how the queries actually arrive: typos, mid-sentence context switches, and
negatives that are genuinely adjacent (Figma naming conventions, hero
copywriting, a print PDF the site's brand has to match) rather than obviously
unrelated (Kubernetes manifests, SQL joins).

Result on this set: **20/20** — all 10 positives triggered on majority-of-3
runs, only 1 false trigger across 30 negative runs (the print-leave-behind
query, 1/3). That run covers the original 20 (Should-Trigger 1–10,
Should-NOT-Trigger 1–10). The Phase 1e additions below — 11–15 in each section,
added 2026-08-27 — extend the set to fifteen a side and **have not been put
through the harness**; treat them as unmeasured until a run is recorded here.

**That figure is a recorded run, not a checked-in artefact, and it is the one
number in this repo you cannot verify from the repo.** No `results.json` or
report is committed, because the harness is upstream and needs model calls, so
nothing in the gate chain can reproduce it — unlike every other figure here,
which `check_figures.py` recomputes from the filesystem. Treat it accordingly:
it is a measurement someone took, with the method written down, which is a
weaker thing than the rest of this project's claims and should not be quoted as
if it were gated.

`evals/trigger-eval.json` holds the same set in the shape the upstream scripts
consume, so re-running it needs no translation:

```bash
# from a checkout of github.com/anthropics/skills
python -m scripts.run_eval --eval-set <path>/evals/trigger-eval.json \
    --skill-path <path>/SKILL.md --model <your model>
```

Each query runs three times; majority decides. Re-run it after any edit to the
root `SKILL.md` description — that description is the only input this measures,
and it is also the thing most likely to be reworded without anyone thinking of
this file.

## Should-Trigger (15 queries)

1. "our onboarding modal looks like garbage on my coworkers 13in macbook — the buttons overlap the copy and the primary CTA ends up below the fold. its components/onboarding/WelcomeModal.tsx, next 15 app router + tailwind"
2. "i need to show about 40k rows of device telemetry without the tab locking up. right now its a plain `<table>` and it freezes around 2k rows. dont really care what library"
3. "Please audit our checkout flow against WCAG 2.2 AA and remediate whatever fails in the payment step. We have a VPAT due to a customer on the 14th and the payment step is the one nobody has looked at."
4. "we're a climbing gym booking app and honestly every page looks like a bootstrap template from 2014. i want an actual visual identity — typeface, colour, the spacing system, all of it. where do i even start"
5. "the three pricing cards on marketing/pricing are just three identical boxes and our head of marketing says it 'looks AI generated'. she's not wrong. can you make it not look like that"
6. "scroll animations on the landing hero stutter badly on my pixel 7 but are fine on the macbook. using framer motion, its the parallax on the screenshot block"
7. "signup form silently swallows 500s — user clicks create account, nothing happens, no error. also one of our engineers uses a screen reader and cant tell which field failed validation"
8. "want a slowly rotating 3d product model on the hero instead of the static png. the glb our industrial designer exported is 12mb which i assume is way too big. r3f ok"
9. "dark mdoe is broken on the settings panel — about half the labels are invisible, looks like theyre inheriting the light text colour. tailwind v4, we use the class strategy"
10. "when someone creates a brand new workspace the reports page is just a blank white area with the word 'None'. needs to actually say something useful and point them somewhere"

### Phase 1e additions — Should-Trigger (2026-08-27)

Coverage for `design-research`, which had no case in either direction, plus the
ambiguous-intent cases named in `docs/CAPABILITY_MATRIX.md` — audit vs. build vs.
redesign vs. screenshot-recreation, all `should_trigger: true` since the pack
should engage whichever mode wins. Positives deliberately avoid the literal
trigger words ("inspired by", "trending").

11. "our whole app looks like a default component library and i want it to feel like Linear or Vercel — that dense, quiet, slightly technical thing. not sure where to start honestly" — outward reference by name; mode left open
12. "attaching four screenshots of onboarding flows i think are really well done. i want ours to have the same feeling — the progress, the microcopy, the pacing" — screenshot-recreation, no "inspired by"
13. "https://dribbble.com/shots/9021142-pricing-card this is exactly the card hover i want. can you work out the easing and the shadow layers and apply it to our pricing cards" — pasted URL, motion extraction
14. "before we redesign the marketing site — what are people actually building for developer-tool landing pages right now? want to see real examples, not 2021 trends" — Phase 0 community/trend signal
15. "the settings page. it's fine but it's not good. take a look and do whatever it needs" — deliberately vague about mode; must still engage

## Should-NOT-Trigger (15 queries)

1. "the /api/dashboard endpoint takes about 8 seconds. i think we're doing an n+1 on the widgets relation — want to add redis caching and cursor pagination on the query side"
2. "plot monthly churn from this dataframe as a matplotlib chart i can drop into the board deck. df has cohort_month, churned, total. save it as a png at 300dpi"
3. "need a one-page PDF leave-behind for a conference next month, same brand as the website. A4, print-ready, our designer is on leave"
4. "our SwiftUI settings screen needs a toggle row that matches the iOS system style, with the label on the left and the switch trailing"
5. "set up a staging environment on vercel with a preview deploy per PR and branch-scoped env vars. also need the preview URL posted back to the PR"
6. "the hero headline on our homepage is way too long and nobody reads past the first line. can you write me five shorter options, we sell payroll software to restaurants"
7. "add an index on invoices(issued_at, account_id) — the billing table query does a seq scan and its 4s on prod. postgres 16"
8. "write vitest unit tests for calculateProratedAmount in lib/pricing.ts — mid-cycle upgrades, downgrades, and the leap-year edge case that bit us"
9. "our figma file is a disaster, components named 'Button', 'Button 2', 'Button copy final'. can you propose a naming convention and a page structure for the library"
10. "set up posthog funnels for the signup flow so we can see where people drop off between email entry and workspace creation"

### Phase 1e additions — Should-NOT-Trigger (2026-08-27)

Each is genuinely adjacent to `design-research` — a named design-forward company,
a "screenshot" / "trending" / "teardown" shape — but out of scope: the ask is
infra, product-feedback triage, sales comms, pricing strategy, or copy tone, not
turning an external reference into typed design constraints.

11. "our competitors' apps — set up a job that screenshots their pricing and onboarding pages every week so we can track when they change something. python's fine" — build monitoring infra, not extract design
12. "pull everything users have said about our checkout in the last 30 days — support tickets, the subreddit, app store reviews — and give me the top themes" — community signal about our own product; guards the new Phase 0 trigger against over-firing
13. "a competitor is trending on hacker news right now over an outage. draft the positioning talking points for our sales team before it cools off" — "trending" bait, sales comms
14. "i need a competitive teardown of how Linear, Height and Shortcut price their team plans — seats, tiers, what's gated behind which plan" — pricing strategy, not visual design
15. "rewrite our landing page hero and subhead to match the voice of Stripe's docs — precise, calm, no hype" — references a site, but it's copy tone
