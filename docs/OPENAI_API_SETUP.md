# OpenAI API Setup

This is for developers calling the OpenAI API directly, not going through ChatGPT's UI. You get to choose how much of the registry model to reconstruct — anywhere from "paste `SKILL.md` as a system message and nothing else" up to a real per-request retrieval tool that approximates the lazy loading described in [ARCHITECTURE.md](ARCHITECTURE.md).

Neither approach gives you what Claude Code gets natively: an agent with real filesystem tools that decides, mid-conversation, to open exactly one `skills/{id}/SKILL.md` and its declared `core/*.md` deps. The API model has no filesystem of its own — whatever context reaches it, you put there, either up front or via a tool call you implement.

## Option A — static context (simplest, fine for small integrations)

Put `SKILL.md` (~1,888 tokens) in the system/developer message, plus whichever `skills/{id}/SKILL.md` and `core/*.md` files you already know are relevant to your product's typical requests. This works well if your integration is narrow (e.g., you only ever generate landing pages), because you can hardcode the one or two skills you need and skip building a router.

```python
from openai import OpenAI

client = OpenAI()

with open("frontend-design-pro/SKILL.md") as f:
    skill_md = f.read()
with open("frontend-design-pro/skills/landing-pages/SKILL.md") as f:
    landing_pages = f.read()
with open("frontend-design-pro/core/design-tokens.md") as f:
    design_tokens = f.read()
with open("frontend-design-pro/core/accessibility-baseline.md") as f:
    a11y = f.read()

system_prompt = f"""{skill_md}

--- Routed skill: landing-pages ---
{landing_pages}

--- Core dependency: design-tokens ---
{design_tokens}

--- Core dependency: accessibility-baseline ---
{a11y}
"""

response = client.chat.completions.create(
    model="the model you've configured",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Build a pricing section, three tiers, no gradients."},
    ],
)
print(response.choices[0].message.content)
```

## Option B — tool-based retrieval (approximates lazy loading)

If your integration spans many of the 17 skills, define a function/tool the model can call to fetch a specific file by path, and only put `SKILL.md` in the system prompt up front. This is the closest an API integration gets to the real registry behavior: the model reads the routing table, decides which skill applies, and calls your tool to fetch exactly that file — then, if the skill file's own reference index points deeper, it can call the tool again for a `references/*.md` file.

```python
from openai import OpenAI
import pathlib

client = OpenAI()
PACK_ROOT = pathlib.Path("frontend-design-pro")

def read_pack_file(path: str) -> str:
    """Reads a file from the frontend-design-pro skill pack by relative path,
    e.g. 'skills/forms/SKILL.md' or 'core/component-api.md'."""
    resolved = (PACK_ROOT / path).resolve()
    if PACK_ROOT.resolve() not in resolved.parents and resolved != PACK_ROOT.resolve():
        raise ValueError("path escapes pack root")
    return resolved.read_text(encoding="utf-8")

tools = [{
    "type": "function",
    "function": {
        "name": "read_pack_file",
        "description": "Read one file from the frontend-design-pro skill pack by relative path.",
        "parameters": {
            "type": "object",
            "properties": {"path": {"type": "string"}},
            "required": ["path"],
        },
    },
}]

messages = [
    {"role": "system", "content": (PACK_ROOT / "SKILL.md").read_text(encoding="utf-8")},
    {"role": "user", "content": "Add a sortable data table with loading and empty states."},
]

response = client.chat.completions.create(
    model="the model you've configured",
    messages=messages,
    tools=tools,
)

# Standard tool-call loop: if the model calls read_pack_file, execute it,
# append the result as a tool message, and call the API again. Repeat until
# the model returns a final answer instead of a tool call.
```

This is genuinely a per-request loading model, not a simulation of one — the model only pays for the tokens of files it actually asks for, same as the token figures in [ARCHITECTURE.md](ARCHITECTURE.md) describe for Claude Code. The difference is you own the tool implementation and the loop; there is no built-in "skills" feature on the raw API doing this for you.

## Verifying it took

Log the tool calls (Option B) or check the system prompt size (Option A), and separately ask the model in the same turn: "which skill and core files informed this?" It should name specific paths that match what you actually sent or what it actually fetched. If it names a file you never provided, it is hallucinating the citation, not routing.

## Honest limitations

- **No built-in awareness of the gate scripts.** The API has no concept of `scripts/build_release.py` or the AST/regex constraint suites unless you wire them in as tools yourself (e.g., a tool that shells out to run the parser constraints against generated code and returns pass/fail). Without that, "53 machine-enforced constraints" only holds if you run them outside the model.
- **No code execution by default.** Unless you've separately built or attached a code-execution tool, the model cannot compile or type-check its own output.
- **Model and API shapes change.** Use whatever model identifier and SDK version your account is actually configured for; the snippet above uses `client.chat.completions.create` because it is a stable, widely-supported shape, but check current OpenAI SDK docs if you're on a newer response API — the exact method name and tool-calling schema have shifted across SDK versions before.

Full routing reference: [USAGE.md](USAGE.md). Architecture and token figures: [ARCHITECTURE.md](ARCHITECTURE.md). Compatibility across agents: [AGENT_COMPATIBILITY.md](AGENT_COMPATIBILITY.md).
