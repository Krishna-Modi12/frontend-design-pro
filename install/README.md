# Native adapters

One directory per agent, each holding that agent's own rules format — the file you would otherwise write by hand after reading a setup doc.

```bash
bash setup.sh              # detect the agent from the current directory
bash setup.sh cursor       # or name it
bash setup.sh --list       # every adapter
```

`setup.ps1` is the PowerShell port, same arguments as `-Switch` form.

| Adapter | Installs | Full doc |
|---|---|---|
| [`cursor/`](cursor/) | `.cursor/rules/frontend-design-pro.mdc` | [CURSOR_SETUP.md](../docs/CURSOR_SETUP.md) |
| [`copilot/`](copilot/) | `.github/copilot-instructions.md` + path-scoped `.github/instructions/` | [COPILOT_SETUP.md](../docs/COPILOT_SETUP.md) |
| [`windsurf/`](windsurf/) | `.windsurf/rules/frontend-design-pro.md` | — untested |
| [`continue/`](continue/) | `.continue/rules/frontend-design-pro.md` | — untested |
| [`aider/`](aider/) | `CONVENTIONS.md` | — untested |
| [`claude/`](claude/) | manual — unzip into `~/.claude/skills/`, or Projects for Desktop | [CLAUDE_SETUP.md](../docs/CLAUDE_SETUP.md) |
| [`chatgpt/`](chatgpt/) | manual — Custom GPT knowledge upload, 20-file cap | [CHATGPT_SETUP.md](../docs/CHATGPT_SETUP.md) |
| [`gemini/`](gemini/) | manual — system instruction | [GEMINI_SETUP.md](../docs/GEMINI_SETUP.md) |
| [`codex/`](codex/) | manual — `AGENTS.md` merge | [OPENAI_API_SETUP.md](../docs/OPENAI_API_SETUP.md) |
| [`generic/`](generic/) | manual — any other host | [INSTALL.md](../docs/INSTALL.md) |

"Manual" means there is no file an installer can safely drop in: a web UI, a JSON merge, or a file your repo already owns. Those cards give the real steps rather than automating a step that cannot be automated.

## Two things every adapter assumes

**The pack sits at `frontend-design-pro/` inside your project.** Every rule file references `frontend-design-pro/SKILL.md`, which is where `unzip frontend-design-pro-v*.skill -d ./` puts it. An adapter installed without the pack beside it points at nothing.

**The rules are short on purpose.** Each of these hosts loads its rules file on every matching request, and long rules get summarised rather than followed. The adapters route and point at the anti-slop wall in `SKILL.md`; they never restate it. One copy of that wall is the reason it cannot drift.

Marked "untested" above means the host is not in [docs/AGENT_COMPATIBILITY.md](../docs/AGENT_COMPATIBILITY.md) — the adapter follows the host's documented rules format, but nobody has run the matrix against it.
