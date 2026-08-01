# Continue.dev

1. `bash setup.sh continue` from your project root, or copy `.continue/rules/frontend-design-pro.md` there by hand.
2. Unzip the pack beside it: `unzip frontend-design-pro-v*.skill -d ./`. The rule references `frontend-design-pro/SKILL.md` relative to the workspace root.
3. Rules in `.continue/rules/` are picked up automatically for that workspace — there is no config file to edit and nothing to register.
4. Ask for UI in plain language, and `@`-reference `frontend-design-pro/SKILL.md` the first time if the route does not take.

The rule ships `alwaysApply: false` with `globs` for `.tsx`/`.jsx`/`.css`, so it attaches when you touch a component and stays out of the way in the backend.

**Legacy config:** older Continue used a `systemMessage` string in `.continue/config.json`. That format is deprecated in favour of `config.yaml` and the `rules` system above. If you are pinned to it, paste the body of the rule file (everything below the frontmatter) into `systemMessage` — the routing instructions are identical.

**Degradation:** Continue can read workspace files, but no loader decides what to read, so it may paraphrase a reference instead of opening it. If output drifts generic, `@`-reference the specific file. Continue is not in the tested compatibility matrix.

Generic setup: [docs/INSTALL.md](../../docs/INSTALL.md) · Matrix: [docs/AGENT_COMPATIBILITY.md](../../docs/AGENT_COMPATIBILITY.md)
