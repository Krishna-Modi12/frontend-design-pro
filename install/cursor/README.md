# Cursor

Native format: `.cursor/rules/*.mdc`. Full guide: [docs/CURSOR_SETUP.md](../../docs/CURSOR_SETUP.md).

1. Unzip the pack into the workspace so `frontend-design-pro/` sits inside the
   project: `unzip frontend-design-pro-v*.skill -d ./`. Cursor reads only what is
   in the workspace.
2. Copy `.cursor/rules/frontend-design-pro.mdc` from this folder to the same path
   in your project. `alwaysApply: false` with `globs` is deliberate — the rule
   attaches when you touch a component, and stays out of the way in the backend.
   Legacy Cursor: one `.cursorrules` at the project root, same body.
3. `@`-reference the registry the first time in Chat or Composer:
   `@frontend-design-pro/SKILL.md Build a sortable data table with loading and empty states.`
4. Verify: ask *"which skill did you load?"* — one skill id and ~4,800–6,100
   tokens, not a claim that it read the whole pack.

**What degrades here.** [The matrix](../../docs/AGENT_COMPATIBILITY.md) rates
Cursor's lazy loading *Partial — `@`-ref*: routing and the anti-slop wall survive,
but no loader decides what to read, so Cursor often paraphrases a reference
instead of opening it. `@`-reference the file directly when output drifts generic.
Long rules get summarised — keep the `.mdc` short.
