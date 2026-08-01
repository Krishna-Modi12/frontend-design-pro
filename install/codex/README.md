# OpenAI Codex CLI

Codex CLI has no skill-pack format. It reads the working tree and an `AGENTS.md` convention file, so the pack works by being present rather than by being registered.

1. Unzip into the directory you run Codex from: `unzip frontend-design-pro-v*.skill -d ./`
2. Add the routing instruction to `AGENTS.md` at the repo root (create it if absent) — the same text as [`../aider/CONVENTIONS.md`](../aider/CONVENTIONS.md) works verbatim; it is host-neutral.
3. Run `codex` from that directory and reference the registry in your first prompt: *"Read frontend-design-pro/SKILL.md, then build a pricing section."*

There is no `install/codex/` payload file to copy, which is why `setup.sh codex` prints this card instead of writing anything: `AGENTS.md` is a file your repo probably already owns, and merging into it is your call, not an installer's.

For programmatic use against the API rather than the CLI, [docs/OPENAI_API_SETUP.md](../../docs/OPENAI_API_SETUP.md) covers loading `AGENT_SYSTEM_PROMPT.md` as the system message and fetching pack files by path through function calling — the only route to real per-request loading here.

**Degradation:** no built-in routing and no gate-script awareness. The agent follows the registry because you told it to, not because a loader enforces it. Codex CLI is not in the tested compatibility matrix.

Matrix: [docs/AGENT_COMPATIBILITY.md](../../docs/AGENT_COMPATIBILITY.md)
