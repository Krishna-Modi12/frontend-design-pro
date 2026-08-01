# Windsurf

1. `bash setup.sh windsurf` from your project root, or copy `.windsurf/rules/frontend-design-pro.md` there by hand.
2. Unzip the pack beside it: `unzip frontend-design-pro-v*.skill -d ./`. The rule references `frontend-design-pro/SKILL.md` relative to the workspace root.
3. Cascade loads every `.md` file in `.windsurf/rules/` for that workspace automatically.
4. Ask for UI in plain language. To confirm it took, ask *"which skill did you load?"* — you want one skill id back, not a restatement of good UI practice.

The rule declares `trigger: glob` scoped to `.tsx`/`.jsx`/`.css`, so it attaches when you touch a component rather than on every action. Workspace rule files are capped at 12,000 characters; this one is well under.

**Legacy Windsurf:** a single `.windsurfrules` at the workspace root works too — paste the body below the frontmatter. Use the directory form above unless your version predates it.

**Degradation:** Windsurf reads workspace files but has no loader deciding what to open, so it may paraphrase a reference instead of reading it. If output drifts generic, reference the specific file. Windsurf is not in the tested compatibility matrix.

Generic setup: [docs/INSTALL.md](../../docs/INSTALL.md) · Matrix: [docs/AGENT_COMPATIBILITY.md](../../docs/AGENT_COMPATIBILITY.md)
