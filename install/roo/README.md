# Roo Code

```bash
bash setup.sh roo            # writes .roo/rules/frontend-design-pro.md
```

Roo Code reads `.roo/rules/` recursively and appends every file to the system
prompt in filename order. Like Cline's, this is unconditional — everything in
that directory is in context on every request — so the adapter routes and points
at the anti-slop wall rather than restating it.

**Migrating.** `.roo/rules/` and Cline's `.clinerules/` take the same markdown,
so if you move hosts the file transfers unchanged: install
[`../cline/`](../cline/) or copy this one across. Roo Code also reads
`AGENTS.md`, which is [`../agents/`](../agents/) and is the more portable choice
if you are setting up from scratch.

Full matrix: [../../docs/AGENT_COMPATIBILITY.md](../../docs/AGENT_COMPATIBILITY.md)
