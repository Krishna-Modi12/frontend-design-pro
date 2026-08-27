# Troubleshooting

Five things that actually go wrong, by symptom. Each one has been hit and diagnosed rather than imagined.

<details>
<summary><b>The agent ignores routing and behaves like a generic prompt pack</b></summary>

<br>

Almost always `--full-depth` on the install. That flag keeps walking subdirectories past the root `SKILL.md`, so every skill installs as a **peer** rather than as a leaf behind the router — and peers compete to match your request instead of one registry choosing between them. Check with `npx skills add Krishna-Modi12/frontend-design-pro --list`: one entry is right, a long list is the broken shape.

Reinstall without the flag. The default is the one you want.

</details>

<details>
<summary><b>The constraint checkers report a wall of failures on a directory that is fine</b></summary>

<br>

You pointed the suite at `components/` without `--component`. Eight of the regex constraints describe a **page** — a declared font, a default export, landmark elements, all four states, breakpoints, a skip link — and they are right about a screen and wrong about a status pill.

```bash
python scripts/test_constraints.py --dir ./components --component   # drops the 8 page-scoped rules
python scripts/test_constraints.py --dir ./app                      # pages: no flag
```

The flag names the eight it dropped in the output, so you can see what was skipped rather than trust it. Detail: [Run them against your own code](../README.md#run-them-against-your-own-code).

</details>

<details>
<summary><b>Only the regex half runs — the AST checks say they skipped</b></summary>

<br>

No TypeScript compiler on the path. The semantic half drives the actual TypeScript compiler API, so it needs one installed:

```bash
npm install typescript @types/react @types/react-dom
```

It reports the skip rather than passing silently, which is the intended behaviour — a checker that quietly halves itself and still prints a pass is worse than one that fails.

</details>

<details>
<summary><b>The installed copy has no version anywhere</b></summary>

<br>

`npx skills add` clones the default branch and drops `metadata.json`, so the install has no version stamp at its root — and it tracks `main`, which may be ahead of the release badge and is not the artifact the gates signed off.

Every `skills/*/SKILL.md` carries a `version:` field if you just need to know what you have. If you want a pinned, gated artifact instead, take [the release archive](https://github.com/Krishna-Modi12/frontend-design-pro/releases/latest) — it is built only when every gate passes.

</details>

<details>
<summary><b>A documented number disagrees with what you counted</b></summary>

<br>

Run `npm run figures` before assuming the document is right. Gate 11 recomputes every published count and token figure from the filesystem, and it is the arbiter — when a document and a gate disagree, the gate is right.

One honest exception, deliberate: release notes and prior changelog entries state the figures that were true when they were cut — that is the point of a correction — and are exempt by design. (Token figures are always the LF byte count; both the build gate and the figure gate normalise, so a CRLF-edited working copy no longer reads high.)

</details>
