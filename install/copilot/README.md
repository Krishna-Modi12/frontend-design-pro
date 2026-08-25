# Install — GitHub Copilot

1. Unzip `frontend-design-pro-v*.skill` into the repo Copilot is operating on (`unzip frontend-design-pro-v*.skill -d ./`). This creates `frontend-design-pro/` at the repo root, which every path in the two files below assumes.
2. Copy [`.github/copilot-instructions.md`](.github/copilot-instructions.md) from this directory into your repo root's `.github/`. It is loaded in full on every request in the repo, which is why it is short — lengthening it makes Copilot summarise it away instead of following it.
3. Optional: copy [`.github/instructions/frontend-design-pro.instructions.md`](.github/instructions/frontend-design-pro.instructions.md) too. Its `applyTo` glob scopes it to frontend files. Support is uneven across Copilot surfaces, so treat it as an addition — the repo-wide file from step 2 is the one that works everywhere. If it appears to be ignored, drop it rather than debugging it.
4. Reference files explicitly in chat: `#file:frontend-design-pro/SKILL.md`. Verify with *"which skill file are you using, and what's in its routing table row for this request?"* — you want one skill id back, not a restatement of good UI practice.

**Degradation:** always-loaded instructions, not fetch-on-demand — Copilot cannot open `skills/{id}/references/*.md` mid-conversation, and there is not even ChatGPT's retrieval search to soften it. The 111 reference files reach the model only if you paste one in by hand.

Full setup, path-scoping detail and troubleshooting: [docs/COPILOT_SETUP.md](../../docs/COPILOT_SETUP.md).
