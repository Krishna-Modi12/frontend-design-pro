# Cline

```bash
bash setup.sh cline          # writes .clinerules/frontend-design-pro.md
```

Cline reads every file in `.clinerules/` alphabetically and concatenates them
into one rules block. There is no hierarchy and no conditional loading — each
file is in context on every request.

That is why this adapter is short and why it must stay short. It routes and
points at the anti-slop wall in `frontend-design-pro/SKILL.md`; it never restates
it. A long rules file gets summarised by the host, and a summarised wall is a
wall with holes.

If you already keep rules in `.clinerules/`, this file sits beside them — the
installer will not touch anything that exists unless you pass `--force`.

**Older Cline versions** used a single `.clinerules` *file* rather than a
directory. If that is what your project has, append this file's contents to it
instead; both forms are read the same way.

Cline can read workspace files on demand, so the registry's lazy loading works
here in a way it does not on a paste-only host — the routed skill and its
references are real files it can open.

Full matrix: [../../docs/AGENT_COMPATIBILITY.md](../../docs/AGENT_COMPATIBILITY.md)
