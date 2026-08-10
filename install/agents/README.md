# AGENTS.md — the cross-agent adapter

```bash
bash setup.sh agents          # writes ./AGENTS.md
```

## Why this one first

`AGENTS.md` is an open specification, published August 2025 and donated to the
Linux Foundation's Agentic AI Foundation in December 2025. It is a plain
markdown file at the project root, and it is the only rules format that more
than one vendor reads.

Every other adapter in `install/` targets exactly one host. This one is read by
roughly thirty, including several with no adapter of their own here:

| Reads `AGENTS.md` | Has its own adapter too |
|---|---|
| OpenAI Codex / Codex CLI | `codex/` |
| Cursor | `cursor/` |
| GitHub Copilot (agent mode) + VS Code | `copilot/` |
| Windsurf | `windsurf/` |
| Aider | `aider/` |
| Continue.dev | `continue/` |
| Zed | — |
| Google Jules | — |
| Devin | — |
| Factory | — |
| Amp | — |
| OpenHands | — |
| JetBrains Junie | — |
| Roo Code | — |

Install this file and the right-hand column stops being a gap.

## When you still want the native adapter

A host's own format can do things `AGENTS.md` cannot, and where that is true the
native adapter is worth installing **as well** — they coexist:

- **Cursor** — `.mdc` rules carry a `globs:` field, so the rule attaches to
  `**/*.tsx` rather than loading on every request.
- **Copilot** — `.github/instructions/*.instructions.md` are path-scoped the same way.
- **Claude Code** — reads `CLAUDE.md`, and can load the pack as a real skill with
  a filesystem behind it. That is the only host where the lazy-loading model works
  as designed; see [CLAUDE_SETUP.md](../../docs/CLAUDE_SETUP.md).
- **Gemini CLI** — reads `GEMINI.md`, not `AGENTS.md`. Use [`gemini/`](../gemini/).

Where both are installed, keep them consistent by keeping both short: each one
points at `frontend-design-pro/SKILL.md` and neither restates its rules.

## Precedence

Hosts that read both a native file and `AGENTS.md` generally treat the more
specific file as higher priority, and nested `AGENTS.md` files as overriding
parent ones. Since every adapter here says the same thing — *route through the
registry, obey the wall, do not paraphrase* — precedence does not change the
outcome. That is deliberate.

## Verify it took

Ask the agent, in a fresh session:

> Which frontend-design-pro skill would you load for "build a pricing page", and
> what is banned as a display font?

A working install names `landing-pages` and lists Inter/Roboto/Poppins/DM Sans/
Space Grotesk. An agent that answers from general knowledge, or hedges, has not
read the file — check that `frontend-design-pro/SKILL.md` actually resolves from
the project root.
