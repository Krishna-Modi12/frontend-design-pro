# Claude Setup

The skill is a folder of markdown. Claude needs two things: the files, and a reason to read `SKILL.md` first.

## Claude Code (CLI) — recommended

Claude Code discovers skills automatically from its skills directory. No system prompt needed.

```bash
# macOS / Linux
unzip frontend-design-pro-v*.skill -d ~/.claude/skills/
```

```powershell
# Windows
Expand-Archive frontend-design-pro-v*.skill -DestinationPath "$HOME\.claude\skills\"
```

That yields `~/.claude/skills/frontend-design-pro/` with `SKILL.md` at its root. Start a new session and ask for UI in plain language:

```
Create a landing page for a developer tool. Three pricing tiers, minimal, no gradients.
```

The YAML frontmatter in `SKILL.md` is what makes this work — its `description` field tells Claude when the skill applies, so routing happens without you naming it.

**Project-scoped instead of global:** unzip into `.claude/skills/` in your repo. Project skills take precedence and travel with the code.

## Claude Desktop (Projects)

1. Unzip the archive somewhere stable: `unzip frontend-design-pro-v*.skill -d ~/frontend-design-pro/`
2. **Settings → Projects → New Project**, name it *Frontend Design Pro*
3. **Project Instructions** → paste the contents of `AGENT_SYSTEM_PROMPT.md` (~3,950 tokens)
4. **Knowledge** → upload the unzipped `frontend-design-pro/` folder

Desktop projects have no filesystem, so lazy loading degrades: Claude retrieves from the knowledge base rather than reading paths on demand. The registry still routes correctly, but expect it to pull adjacent chunks. Keep requests specific — *"build a pricing section"* retrieves better than *"build the site"*.

## Claude.ai (no project)

Paste `SKILL.md` into the conversation and attach the one or two `skills/{id}/` files you need. This is the least good option: 330k tokens of references cannot be attached, so you get the routing rules and the anti-slop wall without the depth.

## Verifying it took

Ask: **"Which skill did you load, and what did it cost?"**

A correctly wired agent answers with one skill id, its core deps, and a token figure in the 5,876–7,476 range — for example *"`skills/landing-pages/SKILL.md` plus `core/design-tokens.md`, `core/accessibility-baseline.md` and `core/validate-checklist.md`, about 4,700 tokens."*

If it says it read everything, or cannot name the skill, it is not routing — it is improvising over whatever it retrieved.

## What good output looks like

- OKLCH tokens, no raw hex in component code
- `min-h-[100dvh]`, never `min-h-screen`
- all four states present: loading, empty, error, success
- exported prop interfaces, `forwardRef` on interactive components
- it **asks first** for a whole page or app — the six intake questions in `core/user-intake.md`, batched into one message

If it starts generating a full site without asking anything, the behavioural preamble did not load. Say *"ask me the intake questions first."*

## Troubleshooting

| Symptom | Cause |
|---|---|
| Ignores the skill entirely | `SKILL.md` not at the root of the skill folder — check the unzip produced `frontend-design-pro/SKILL.md`, not a nested duplicate |
| Loads every skill at once | It is reading a flattened paste rather than routing. Give it the folder, not concatenated text |
| Cites a file it cannot open | Desktop/Claude.ai has no filesystem — reference paths resolve only in Claude Code |
| Generic output despite the pack | Ask *"which anti-slop rules apply here?"* — if it cannot list them, `SKILL.md` was truncated |

Full routing reference: [USAGE.md](USAGE.md). Architecture and gates: [ARCHITECTURE.md](ARCHITECTURE.md).
