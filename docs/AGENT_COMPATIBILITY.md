# Agent Compatibility

One fact decides how well this pack works on a given host: can the agent decide, *mid-conversation*, to open one specific file it wasn't given up front? That is what makes the registry's loading model real — `SKILL.md` always in context, one matched `skills/{id}/SKILL.md`, its declared `core/*.md` deps, roughly 4,800–6,100 tokens per request against 320,375 tokens of reference depth (see [ARCHITECTURE.md](ARCHITECTURE.md)).

**Claude Code is the only host with a real filesystem for that.** Everywhere else, lazy loading degrades to retrieval search, manual `@`-referencing, or pasting. Routing and the anti-slop wall survive the trip; on-demand depth does not.

| Feature | Claude Code | Claude Desktop | Claude.ai | Cursor | ChatGPT | OpenAI API | Copilot | Gemini |
|---|---|---|---|---|---|---|---|---|
| **Routing** (one skill per request) | Native | Prompted | Manual | Rule-driven | Prompted | You implement it | Prompted | Prompted |
| **Lazy loading** (fetch on demand) | Yes | No — retrieval | No — paste | Partial — `@`-ref | No — retrieval | Only with a file-read tool | No — always-on file | Only with function calling |
| **Reference depth** (86 files) | Full, on demand | Whatever retrieval surfaces | None | Full, if you `@`-reference it | Capped — 20 knowledge files per GPT | Full, via your tool | Only what you paste | Selected files, or full via tool |
| **Anti-slop wall** | Yes | Yes | Yes | Yes, if the rule isn't summarised | Yes | Yes | Yes, if the file isn't summarised | Yes |
| **Validation** (self-check) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Validation** (gate scripts) | Yes — shell | No | No | No | No | Only if wired as a tool | No | Only if wired as a tool |
| Setup | [CLAUDE_SETUP.md](CLAUDE_SETUP.md) | [CLAUDE_SETUP.md](CLAUDE_SETUP.md) | [CLAUDE_SETUP.md](CLAUDE_SETUP.md) | [CURSOR_SETUP.md](CURSOR_SETUP.md) | [CHATGPT_SETUP.md](CHATGPT_SETUP.md) | [OPENAI_API_SETUP.md](OPENAI_API_SETUP.md) | [COPILOT_SETUP.md](COPILOT_SETUP.md) | [GEMINI_SETUP.md](GEMINI_SETUP.md) |

## Reading the table

- **Routing** degrades gently. "Prompted" means the agent follows the routing table because you told it to in instructions, not because a loader enforces it — it will sometimes pull two skills, or answer from the registry alone. Cursor's `.mdc` rule and Copilot's instructions file are the same idea with different file extensions.
- **Lazy loading** is the real dividing line, and "Partial"/"Only with…" are doing honest work there. Cursor can read workspace files but has no loader deciding what to read, so it often paraphrases a reference instead of opening it. OpenAI and Gemini reach genuine per-request loading only because *you* built the tool and the loop — there is no built-in skills feature on either raw API.
- **Reference depth** is where the pack shrinks most. ChatGPT's 20-file-per-GPT knowledge cap means you are choosing a subset of 86 reference files before the conversation starts; Claude.ai without a project gets none of them.
- **The anti-slop wall travels everywhere**, because it lives in `SKILL.md` and `SKILL.md` is small. This is the single most portable part of the pack. The failure mode is a host that *summarises* your rules file rather than passing it through — ask the agent to list the applicable bans to check.
- **Gate scripts** (`scripts/build_release.py`, `scripts/parser_constraints.js`) need a real shell and toolchain. An agent reciting "this passes A11Y-01" is making a claim, not reporting a verified result. Run `npm run gates` yourself if enforcement matters.

Full routing reference: [USAGE.md](USAGE.md). Architecture, token figures, and the gate chain: [ARCHITECTURE.md](ARCHITECTURE.md).
