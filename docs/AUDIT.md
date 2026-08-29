# The pack, pointed at itself

[**`docs/audit-report.html`**](audit-report.html) — open it in a browser — is a hardening audit of this repository, built by giving the pack the same brief you would give it for a client. It is the honest test: a pack that claims to stop AI-looking output should be able to produce a page that does not look AI-generated, about its own defects, without exemptions.

<details>
<summary><b>The exact prompt, and what the brief refuses</b></summary>

<br>

```
Build a single-page audit report for a developer tool that publishes
machine-checked quality claims. It has to communicate three things in order:
two security defects found in shipped reference material, three rules the
product documented everywhere and enforced nowhere, and a gate that was
missing entirely.

Treat it as a test report, not a landing page. No hero. The reader is
deciding whether to trust the tool, so findings and their IDs are the
content — surface severity in form as well as words. Light and dark both.

Constraints: this is our own repo, so obey our own wall. No near-black with
one acid accent, no cream-and-serif, no purple gradients, no Inter. Semantic
colour for severity must be separate from the brand accent. Tabular figures.
No horizontal scroll at 390px.
```

**The route it takes.** *Report*, *severity*, *dark* and *contrast* match the trigger-keyword column, so the registry loads `design-principles` for the information hierarchy, `design-system` for the OKLCH token pair, and `web-interface` for the copy rules — each pulling `core/design-tokens.md`, plus the two universal deps. Roughly 5,900 tokens against 418,496 available.

**What the brief refuses is the interesting part.** "Near-black with one acid accent" is a look this pack has shipped before, and it is on the anti-slop wall as one of the three AI-design defaults. Naming it in the prompt is how you find out whether the pack follows its own rule when the easy answer is right there. The report is ledger rows on cool paper, with a severity stripe carrying state — the accent is structural, and red and amber mean *finding*, not *decoration*.

</details>
