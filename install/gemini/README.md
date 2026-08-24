# Gemini

Two different surfaces with two different answers. The distinction matters more
than usual here, because only one of them can actually load a file on demand.

## Gemini CLI — automatic

```bash
bash setup.sh gemini         # writes GEMINI.md
```

Gemini CLI reads `GEMINI.md` from the project root. It does **not** read
`AGENTS.md`, which is why this adapter exists separately from
[`../agents/`](../agents/) — that is the one mainstream host the cross-agent
standard does not cover.

The CLI has a real filesystem, so the registry works as designed: `GEMINI.md`
routes, and the matched `skills/{id}/SKILL.md` and its references are opened as
files rather than pasted. Roughly 5,978–7,598 tokens per request instead of the
whole pack.

## Gemini API — manual

There is no rules file to drop in; the pack goes into the system instruction.

1. Unzip `frontend-design-pro-v*.skill`.
2. Put `SKILL.md` in the system instruction — the `system_instruction` config in
   the `google-genai` SDK, or the System Instructions field in AI Studio. The
   same field works against AI Studio and Vertex AI; only the client
   construction differs.
3. Narrow integration: add the one or two `skills/{id}/SKILL.md` files plus the
   `core/*.md` deps you know you need. Broad integration: add all 8 `core/*.md`
   and all 19 skill routers — small enough that a large context window absorbs
   it. Leave `references/` out; 373,600 tokens is too large to paste wholesale
   in any window.
4. For genuine on-demand loading, wire a function/tool that reads a pack file by
   path, and let the model call it after matching the routing table in `SKILL.md`.

**Degradation:** static context by default, not lazy loading — whatever sits in
the system instruction is paid on every request, needed or not. A large context
window makes that affordable, not free. Only a function-calling loop you build
yourself gets the per-request model that the CLI gets for free.

## Verify either one

Ask *"which skill file matched this request, and what's in its routing row?"*
You want a specific path back, not generically good advice.

Full setup, SDK snippet and limitations: [docs/GEMINI_SETUP.md](../../docs/GEMINI_SETUP.md).
