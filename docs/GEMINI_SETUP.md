# Gemini Setup

Gemini's headline advantage for this pack is context window size, not tool access. Whether you're using the Gemini API / AI Studio directly, or Gemini Code Assist / a Gemini-backed CLI, the same tradeoff applies: without a real filesystem tool wired in, Gemini cannot decide mid-conversation to fetch one specific `references/*.md` file the way Claude Code does — so instead of lazy-loading ~5k tokens per request (see [ARCHITECTURE.md](ARCHITECTURE.md)), the practical option is to paste a much larger static slice of the pack up front and let a large context window absorb the cost.

That is a real tradeoff, not a strict downgrade: you lose the "always ~5k tokens" efficiency story, but a large window means routing precision matters less. Know which one you have — most Gemini setups are static context, not lazy loading.

## Gemini API / AI Studio — system instruction

Put `SKILL.md` in the system instruction field, and either:

- **Narrow integration:** also include the one or two `skills/{id}/SKILL.md` + `core/*.md` files you know you'll need, same as the static-context pattern in [OPENAI_API_SETUP.md](OPENAI_API_SETUP.md).
- **Broad integration, leaning on the large context window:** include `SKILL.md`, all of `core/*.md`, and every `skills/{id}/SKILL.md` (the 19 routers, not their `references/`) — this is small enough to be cheap even without lazy loading, per the per-file token figures in [ARCHITECTURE.md](ARCHITECTURE.md). Leave `references/*.md` out unless you have a specific reason to include a particular file; the 330k tokens of reference depth is the part genuinely too large to paste wholesale even in a generous window.

```python
from google import genai

client = genai.Client()

with open("frontend-design-pro/SKILL.md") as f:
    skill_md = f.read()

response = client.models.generate_content(
    model="the model you've configured",
    config={"system_instruction": skill_md},
    contents="Build a pricing section, three tiers, no gradients.",
)
print(response.text)
```

The same `google-genai` SDK covers both backends; only the client construction differs. AI Studio uses an API key (`genai.Client()`, reading `GEMINI_API_KEY`); Vertex AI uses `genai.Client(vertexai=True, project=..., location=...)`. The `system_instruction` config is identical either way. Older `google-generativeai` / `vertexai` SDK code passes system instructions differently — check the docs for the library you actually have installed.

## Function calling for on-demand retrieval (closer to true lazy loading)

If you want the real per-request loading model rather than the static-context workaround, wire a function/tool that reads a pack file by path, the same pattern as Option B in [OPENAI_API_SETUP.md](OPENAI_API_SETUP.md) — Gemini's function-calling support can drive an equivalent loop: the model reads the routing table in `SKILL.md`, calls the tool for the one matched skill file, and again for any `references/*.md` file that skill's reference index points to. This gets you the actual token-efficiency story from [ARCHITECTURE.md](ARCHITECTURE.md) instead of the large-window workaround.

## Gemini Code Assist / CLI

If your Gemini-backed coding agent has real filesystem access, treat it like Claude Code or Cursor: point it at the unzipped `frontend-design-pro/` folder and instruct it, via whatever rules mechanism it exposes, to read `SKILL.md` first and route from there. Whether a given Gemini coding tool exposes true on-demand file reads or just a search-and-splice retrieval step is a per-product detail — check its docs rather than assuming Claude Code behaviour.

## Verifying it took

Ask **"which skill file matched this request, and what's in its routing row?"** — same test as every other setup doc in this pack. You want a specific path and, ideally, a token cost, back in the answer. If Gemini answers with generically good advice and no path, either the routing content didn't make it into context or it's not being followed.

## Honest limitations

- **No lazy loading without a tool.** Static context in the system instruction is loaded in full every request, same cost whether the request needs one skill or none of them — the large context window makes this affordable, not free.
- **No execution of the gate scripts.** Gemini cannot run `scripts/build_release.py` or the AST/regex constraint suite against its own output unless you've wired that in as a callable tool.
- **Context window size and specific model capabilities are not asserted here.** Gemini's available context window has differed across model tiers and has grown over time; don't treat any specific token figure as current without checking the model you've actually selected.

Full routing reference: [USAGE.md](USAGE.md). Architecture and token figures: [ARCHITECTURE.md](ARCHITECTURE.md). Compatibility across agents: [AGENT_COMPATIBILITY.md](AGENT_COMPATIBILITY.md).
