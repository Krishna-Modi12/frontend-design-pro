# Install — any other host

The fallback card for a host with no rules-file format of its own.

1. Unzip `frontend-design-pro-v*.skill`. The archive root is `frontend-design-pro/`, with `SKILL.md` beside `core/` and `skills/`. Paths inside `SKILL.md` are relative to that root, so there is nothing to configure.
2. Point the agent at `SKILL.md` first, by whatever mechanism the host gives you — an attachment, a paste, a rules field, a repo path. It is self-contained (registry, routing table, anti-slop wall, loading protocol, failure handling) and the only file always loaded: 2,018 tokens.
3. Optional — if the host has a system-prompt field, paste `AGENT_SYSTEM_PROMPT.md` (~3,950 tokens, version-free). It makes the loading protocol and the validation contract explicit. Skip it otherwise; `SKILL.md` alone is sufficient.
4. Ask for UI in plain language. No slash commands — the agent matches your wording against trigger keywords and loads one skill plus its declared core deps.
5. Verify: ask which skill it loaded and what that cost. Expect one skill id, its core deps, and a figure in the 5,978–7,598 range. *"I read everything"* means it is not routing.

**Degradation:** depends entirely on file access. Without an on-demand file read, lazy loading becomes retrieval, `@`-referencing or pasting, and the 104 references are out of reach unless you attach them by hand. The per-host matrix is in [docs/AGENT_COMPATIBILITY.md](../../docs/AGENT_COMPATIBILITY.md).

Full generic setup and verification: [docs/INSTALL.md](../../docs/INSTALL.md).
