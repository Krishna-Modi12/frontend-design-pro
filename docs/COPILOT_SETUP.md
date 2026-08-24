# GitHub Copilot Setup

Copilot Chat (VS Code, JetBrains) supports repo-level custom instructions, but it has no tool for reading an arbitrary file mid-conversation the way Claude Code does. In practice that means the registry's routing idea survives — one skill file matched per request — but the *lazy loading* half does not: whatever you put in your instructions file is loaded on every request, in full, whether or not it's relevant. There is no on-demand fetch of a `references/*.md` file happening here.

## 1. Put the skill in the repo

```bash
unzip frontend-design-pro-v*.skill -d ./
```

You want `frontend-design-pro/` checked into (or at least present in) the repo Copilot is operating on, so it's in the context Copilot Chat can see.

## 2. Repo-level custom instructions

Create `.github/copilot-instructions.md` at the repo root:

```markdown
# Frontend UI/UX

Before writing or editing frontend code, read `frontend-design-pro/SKILL.md`.

It is a registry, not a document: match the request against its routing
table, then use exactly one `frontend-design-pro/skills/{id}/SKILL.md`
plus the core/ dependencies that skill declares (typically
`core/accessibility-baseline.md` and `core/validate-checklist.md` plus
one or two others). Do not try to apply every skill at once.

State which skill you matched before generating code. Follow the anti-slop
rules in SKILL.md; self-check against `core/validate-checklist.md`.
```

`.github/copilot-instructions.md` is loaded automatically on every request in the repo, so keep it short. A long, generic instructions file with a routing table buried inside it asks Copilot to do more inference per request than it reliably does.

## 3. Path-specific instructions (optional)

GitHub also supports path-scoped instruction files: `*.instructions.md` inside `.github/instructions/`, with an `applyTo` glob in frontmatter. When the glob matches a file Copilot is working on, those instructions are used *in addition to* the repo-wide file. That gets you the equivalent of Cursor's `globs` scoping.

```markdown
---
applyTo: "**/*.tsx"
---
Route via `frontend-design-pro/SKILL.md` before generating component code.
Load exactly one `skills/{id}/SKILL.md` plus its declared core deps.
```

Support is uneven across Copilot surfaces — the repo-wide file is the one that works everywhere. If path-specific instructions appear to be ignored in your IDE, fall back to the single `.github/copilot-instructions.md` rather than debugging it.

## 4. Using it

Reference the skill explicitly in chat, the same way you would with Cursor's `@`-references, since Copilot Chat also supports `#file` or drag-in file references in most current versions:

```
#file:frontend-design-pro/SKILL.md
#file:frontend-design-pro/skills/forms/SKILL.md
Add a login form with Zod validation and accessible errors.
```

If your Copilot Chat version doesn't support inline file references, paste the relevant `skills/{id}/SKILL.md` content directly into the chat instead.

## Verifying it took

Ask **"which skill file are you using, and what's in its routing table row for this request?"** You want one skill id named back to you, not a generic restatement of good UI practice. If Copilot cannot name a specific file, `.github/copilot-instructions.md` either isn't being picked up (check it's at the repo root, not nested) or is being summarized away rather than followed.

## Honest limitations

- **Always-loaded instructions, not fetch-on-demand.** This is the biggest degradation. Instruction files are loaded whole on every matching request; Copilot cannot decide mid-conversation to go open `skills/animations/references/animation-recipes.md` the way a filesystem agent can. It is binary — a file is either always in context or never in context unless you paste it. There isn't even ChatGPT's retrieval search to soften it.
- **The 105 reference files are effectively out of reach.** You get the registry, one skill router, and the anti-slop wall. The depth those references carry arrives only if you paste a specific one into chat by hand.
- **No execution of the gate scripts.** Copilot Chat can suggest code but cannot run `scripts/build_release.py` or the AST/regex constraint checks against its own output. Run `npm run gates` yourself if enforcement matters.
- **Instruction files can be summarised.** Long rules compete with the rest of the prompt. If output drifts generic, shorten the instructions file before adding to it.

Full routing reference: [USAGE.md](USAGE.md). Architecture and gates: [ARCHITECTURE.md](ARCHITECTURE.md). Compatibility across agents: [AGENT_COMPATIBILITY.md](AGENT_COMPATIBILITY.md).
