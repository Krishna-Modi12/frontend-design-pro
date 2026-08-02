# TOON — Token-Oriented Object Notation (agent-ops)

Route: passing bulk structured data **into** a model prompt — a component catalogue, a token
table, a dataset the model must reason over.
Source: `toon-format/toon`.

`token-optimization.md` covers what to load and when. This covers the wire format that data
arrives in, which is a separate lever and frequently a larger one.

## The claim, with numbers

TOON encodes the same data model as JSON in fewer tokens. Measured against JSON on a
retrieval benchmark: **42.6% fewer tokens at 72.2% accuracy vs JSON's 71.4%** — cheaper and
marginally *more* accurate, not a quality trade.

| Dataset shape | Result vs JSON |
|---|---|
| Uniform arrays of objects | best case — 41.7% (GitHub repos), 59.0% (time-series) |
| Mixed structures | 32.7% reduction |
| Purely flat rows | 58.7% reduction, but CSV still beats it by 5.9% |
| Deeply nested / non-uniform | **JSON wins outright** |

Structural questions improved sharply — 100% vs JSON's 50% on structure-validation prompts —
because the field list is declared once in a header instead of repeated per row.

## Syntax

Four forms:

```
alerts[2]: frost,wind                                  # inline — primitive arrays
forecast[3]{day,temp{min,max},condition}:              # tabular — uniform object arrays
environments[2:]{region,replicas}:                     # keyed tabular — uniform, keyed by id
- ...                                                  # list form — non-uniform fallback
```

The saving comes from the header: `{day,temp{min,max},condition}` declares the fields once,
then rows carry values only. Uniform nested objects fold into the header while rows stay flat.

## When to reach for it

**Use TOON** when the payload is a uniform array of objects and it is large enough that its
token cost is a real fraction of the request — catalogues, row sets, metric series.

**Stay on JSON** when the data is deeply nested or non-uniform (tabular eligibility near zero),
when the consumer is a parser rather than a model, or when anything downstream expects JSON.
Semi-uniform data (~40–60% eligibility) gives diminished savings and is rarely worth the
conversion.

**Prefer CSV** for genuinely flat rows with no nesting — it beats TOON by ~6% there.

## The decision rule

Token format is worth optimising only after loading discipline is. Halving the size of a
payload that should not have been loaded at all is the wrong fix — apply
`token-optimization.md` first, then this.

Two cautions:

- **Measure latency, not just tokens.** Some quantized deployments process compact JSON faster
  despite the higher token count. The format is stable but self-described as "an idea in
  progress"; treat the benchmark as a starting hypothesis for your own data.
- **Never convert byte-exact values for compactness.** IDs, hashes, hex colours and secrets
  must survive verbatim. Any lossy re-encoding of exact strings surfaces as a *silent
  confabulation* — the model returns a plausible wrong value rather than reporting that it
  could not read one.

## Related

`skills/ai-ui-generation/references/generative-ui-runtimes.md` documents the same pressure from
the other direction: OpenUI built a bespoke DSL claiming up to 67% fewer tokens than JSON for
generated-UI trees. Two independent projects reaching for a denser-than-JSON encoding is a
signal that JSON's per-row key repetition is the dominant cost in model-facing structured data.
