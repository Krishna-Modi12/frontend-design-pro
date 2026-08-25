# Install — Aider

Aider is not in the compatibility matrix and has no per-agent setup doc: the pack has **not** been tested against it. The steps below follow Aider's own documented convention; treat the result as unverified against the matrix.

1. Unzip `frontend-design-pro-v*.skill` into the repo (`unzip frontend-design-pro-v*.skill -d ./`). This creates `frontend-design-pro/`, which the paths in `CONVENTIONS.md` assume.
2. Copy [`CONVENTIONS.md`](CONVENTIONS.md) from this directory to your repo root. `CONVENTIONS.md` is the conventional name, not an enforced one — Aider loads whatever file you point it at.
3. Load it **read-only**, which is what Aider's docs prescribe for a conventions file and what lets prompt caching apply. Any one of:

   ```bash
   aider --read CONVENTIONS.md          # CLI flag
   ```
   ```yaml
   read: CONVENTIONS.md                 # .aider.conf.yml, loads every session
   ```

   In chat the command is `/read-only CONVENTIONS.md` (older builds spell it `/read`). Adding it with `/add` instead makes it editable and puts it in the diff — not what you want.
4. Ask in plain language, then add the routed skill file read-only too: `/read-only frontend-design-pro/skills/forms/SKILL.md`.

**Degradation:** no on-demand loader — whatever you add read-only is in context and nothing else is. The 111 reference files reach the model only when you name one and add it.

Generic setup: [docs/INSTALL.md](../../docs/INSTALL.md). What degrades on the hosts that *are* tested: [docs/AGENT_COMPATIBILITY.md](../../docs/AGENT_COMPATIBILITY.md).
