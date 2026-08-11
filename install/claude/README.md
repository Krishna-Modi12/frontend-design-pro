# Install — Claude

Two hosts, two different installs. Claude Code has a filesystem; Claude Desktop does not.

## Claude Code — native, no system prompt

1. Unzip `frontend-design-pro-v*.skill` into `~/.claude/skills/`, or into a repo's `.claude/skills/` for a project-scoped copy (project skills take precedence).
2. Check the unzip produced `frontend-design-pro/SKILL.md` at the folder root, beside `core/` and `skills/`.
3. Start a new session and ask in plain language: *"Create a landing page for a developer tool."*

Nothing else to configure — no system prompt, no environment variable. The YAML `description` in `SKILL.md` does the routing; its paths resolve relative to that root. No slash commands — matching is on trigger keywords.

This is the only host with a real filesystem, so lazy loading works as designed: `SKILL.md` (2,018 tokens) always loaded, one matched skill plus its core deps, ~5,665–7,266 tokens per request against 333,969 tokens of on-demand depth.

## Claude Desktop — Projects, retrieval not lazy loading

1. Unzip the archive somewhere stable.
2. **Settings → Projects → New Project.**
3. Paste `AGENT_SYSTEM_PROMPT.md` (~3,950 tokens, version-free) into **Project Instructions**.
4. Upload the unzipped folder to **Knowledge**.

Desktop has no filesystem: Claude retrieves chunks rather than reading paths on demand. Routing and the anti-slop wall in [`SKILL.md`](../../SKILL.md) survive; on-demand depth does not. Keep requests narrow — *"build a pricing section"* retrieves better than *"build the site"*.

Full setup, verification prompt and troubleshooting: [docs/CLAUDE_SETUP.md](../../docs/CLAUDE_SETUP.md).
