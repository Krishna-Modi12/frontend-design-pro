# Agent Compatibility

One fact decides how well this pack works on a given host: can the agent decide, *mid-conversation*, to open one specific file it wasn't given up front? That is what makes the registry's loading model real — `SKILL.md` always in context, one matched `skills/{id}/SKILL.md`, its declared `core/*.md` deps, roughly 5,912–7,476 tokens per request against 346,279 tokens of reference depth (see [ARCHITECTURE.md](ARCHITECTURE.md)).

**Claude Code is the only host with a real filesystem for that.** Everywhere else, lazy loading degrades to retrieval search, manual `@`-referencing, or pasting. Routing and the anti-slop wall survive the trip; on-demand depth does not.

| Feature | Claude Code | Claude Desktop | Claude.ai | Cursor | ChatGPT | OpenAI API | Copilot | Gemini |
|---|---|---|---|---|---|---|---|---|
| **Routing** (one skill per request) | Native | Prompted | Manual | Rule-driven | Prompted | You implement it | Prompted | Prompted |
| **Lazy loading** (fetch on demand) | Yes | No — retrieval | No — paste | Partial — `@`-ref | No — retrieval | Only with a file-read tool | No — always-on file | Only with function calling |
| **Reference depth** (99 files) | Full, on demand | Whatever retrieval surfaces | None | Full, if you `@`-reference it | Capped — 20 knowledge files per GPT | Full, via your tool | Only what you paste | Selected files, or full via tool |
| **Anti-slop wall** | Yes | Yes | Yes | Yes, if the rule isn't summarised | Yes | Yes | Yes, if the file isn't summarised | Yes |
| **Validation** (self-check) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Validation** (gate scripts) | Yes — shell | No | No | No | No | Only if wired as a tool | No | Only if wired as a tool |
| Setup | [CLAUDE_SETUP.md](CLAUDE_SETUP.md) | [CLAUDE_SETUP.md](CLAUDE_SETUP.md) | [CLAUDE_SETUP.md](CLAUDE_SETUP.md) | [CURSOR_SETUP.md](CURSOR_SETUP.md) | [CHATGPT_SETUP.md](CHATGPT_SETUP.md) | [OPENAI_API_SETUP.md](OPENAI_API_SETUP.md) | [COPILOT_SETUP.md](COPILOT_SETUP.md) | [GEMINI_SETUP.md](GEMINI_SETUP.md) |

## Reading the table

- **Routing** degrades gently. "Prompted" means the agent follows the routing table because you told it to in instructions, not because a loader enforces it — it will sometimes pull two skills, or answer from the registry alone. Cursor's `.mdc` rule and Copilot's instructions file are the same idea with different file extensions.
- **Lazy loading** is the real dividing line, and "Partial"/"Only with…" are doing honest work there. Cursor can read workspace files but has no loader deciding what to read, so it often paraphrases a reference instead of opening it. OpenAI and Gemini reach genuine per-request loading only because *you* built the tool and the loop — there is no built-in skills feature on either raw API.
- **Reference depth** is where the pack shrinks most. ChatGPT's 20-file-per-GPT knowledge cap means you are choosing a subset of 99 reference files before the conversation starts; Claude.ai without a project gets none of them.
- **The anti-slop wall travels everywhere**, because it lives in `SKILL.md` and `SKILL.md` is small. This is the single most portable part of the pack. The failure mode is a host that *summarises* your rules file rather than passing it through — ask the agent to list the applicable bans to check.
- **Gate scripts** (`scripts/build_release.py`, `scripts/parser_constraints.js`) need a real shell and toolchain. An agent reciting "this passes A11Y-01" is making a claim, not reporting a verified result. Run `npm run gates` yourself if enforcement matters.

## Hosts with a native adapter

The table above is the *tested* matrix. `install/` ships a native rules file for
more hosts than that, and the honest summary is: routing and the anti-slop wall
work everywhere, because both live in `SKILL.md` and `SKILL.md` is small.

| Host | Adapter writes | Can open a file mid-conversation? |
|---|---|---|
| **Any AGENTS.md host** — Codex, Zed, Jules, Devin, Factory, Amp, OpenHands, Junie, Roo, VS Code | `AGENTS.md` | Depends on the host; most CLI agents can |
| Cursor | `.cursor/rules/*.mdc` | Partial — `@`-reference |
| GitHub Copilot | `.github/copilot-instructions.md` + `.github/instructions/` | No |
| Cline | `.clinerules/` | Yes |
| Roo Code | `.roo/rules/` | Yes |
| Zed | `.rules` | Yes |
| Gemini CLI | `GEMINI.md` | Yes |
| Windsurf | `.windsurf/rules/` | Partial |
| Continue.dev | `.continue/rules/` | Partial |
| Aider | `CONVENTIONS.md` | No — `/read-only` by hand |

**`AGENTS.md` is the one to install if you install only one.** It is an open
specification donated to the Linux Foundation's Agentic AI Foundation, and it is
the only rules format read by more than one vendor. See
[`install/agents/`](../install/agents/README.md).

Hosts outside the tested matrix are marked untested in `install/README.md`: the
adapter follows the host's documented rules format, but nobody has run this
matrix against it. That is a statement about our evidence, not about the host.

## The failure mode to check for on any host

Ask, in a fresh session: *"which skill would you load for 'build a pricing page',
and what is banned as a display face?"*

A working install answers `landing-pages` and names Inter/Roboto/Poppins/DM Sans/
Space Grotesk. Generically good advice with no skill id means the host summarised
your rules file instead of passing it through — the one degradation that is
invisible until you look for it.

Full routing reference: [USAGE.md](USAGE.md). Architecture, token figures, and the gate chain: [ARCHITECTURE.md](ARCHITECTURE.md).
