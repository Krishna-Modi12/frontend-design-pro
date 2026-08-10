# Zed

```bash
bash setup.sh zed            # writes .rules
```

Zed's agent reads a `.rules` file at the worktree root. It also reads
`AGENTS.md`, so [`../agents/`](../agents/) is an equally valid install here and
the better one if you want a single file that Codex, Copilot, Cursor and the
rest read too.

Install one or the other, not both — two copies of the same routing instruction
is two things to keep in step, and this pack's whole argument is that one copy
is the only reason a rule cannot drift.

Zed can open workspace files on demand, so the routed skill and its references
load as real files rather than as pasted text.

Full matrix: [../../docs/AGENT_COMPATIBILITY.md](../../docs/AGENT_COMPATIBILITY.md)
