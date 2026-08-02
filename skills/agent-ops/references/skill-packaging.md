# Skill Packaging & Cross-Agent Discovery (agent-ops)

Route: authoring or distributing a skill pack that must load in more than one agent host.
Source: `vercel-labs/skills` (the `npx skills` CLI and its discovery contract).

This covers how a skill pack is *found and loaded* by a host. It is not about how an agent
behaves once loaded — that is `core/agent-behavior.md` — nor about what to load and when,
which is `references/token-optimization.md`.

## The discovery contract

A host walks a fixed set of locations looking for `SKILL.md`. Two layouts are recognised:

```
skills/<name>/SKILL.md              # flat
skills/<category>/<name>/SKILL.md   # nested
```

Searched roots, in order: repository-root `SKILL.md`, then `skills/`, `skills/.curated/`,
`skills/.experimental/`, `skills/.system/`, then host-specific directories
(`.claude/skills/`, `.agents/skills/`, `.cline/skills/`, and the equivalent per host).

**Depth-2 by default.** The walk stops two levels down. A skill buried at
`skills/a/b/c/SKILL.md` is invisible unless the host is run with `--full-depth`. This is the
single most common reason a skill "isn't detected" — the layout is too deep, not the file is
malformed.

**Shallow shadows deep.** When the same skill name resolves at two depths, the shallower file
wins and the deeper one is silently ignored. Never rely on a deep file overriding a shallow
one; delete the shallow copy instead.

## Frontmatter — the portable minimum

| Field | Required | Notes |
|---|---|---|
| `name` | yes | lowercase, hyphens allowed, unique within the pack |
| `description` | yes | what the skill does — this is the text a host matches intent against |
| `metadata.internal` | no | `true` hides the skill from normal discovery |

```yaml
---
name: my-skill
description: What this skill does
metadata:
  internal: true
---
```

Anything beyond `name` and `description` is host-specific. A pack that requires extra
frontmatter fields to function will load but misbehave on hosts that ignore them, so treat
additional fields as *additive* — never make correct routing depend on a field a foreign host
will drop.

`description` carries the whole routing burden on hosts with no separate registry. Write it as
the trigger surface: say what the skill covers **and** what it explicitly does not, so a host
matching on description alone can rule the skill out as well as in.

## Manifest override

Declaring skills in `.claude-plugin/plugin.json` or `.claude-plugin/marketplace.json` pins
each path explicitly. Manifest-declared skills are read **at their declared depth and are not
subject to the depth-2 walk** — the escape hatch for a layout that genuinely needs to nest
deeper than two levels.

## Transport limits

Direct-URL installs are capped, and a pack that exceeds a cap fails to install rather than
truncating:

| Limit | Default | Override |
|---|---|---|
| Archive size | 10 MiB | `SKILLS_DOWNLOAD_MAX_BYTES` |
| Extracted size | 25 MiB | `SKILLS_EXTRACT_MAX_BYTES` |
| File count | 1000 | `SKILLS_EXTRACT_MAX_FILES` |

The file-count cap is the one packs hit first. A pack with per-component example files plus
tests plus references crosses 1000 entries well before it crosses 10 MiB, and the failure
reads as a download error rather than a size error.

## Authoring conventions

Independently arrived at by `freshtechbro/claudedesignskills` across a 22-skill pack — worth
following because each one corresponds to a way packs actually break:

| Do | Because |
|---|---|
| Write `SKILL.md` in **imperative form** | "Use X" routes; "This skill is about X" describes and routes worse |
| Ship **runnable** examples | An example that does not compile teaches the wrong thing twice — once to the reader, once to the model |
| Keep helper scripts to the **standard library** | A script with dependencies fails on the one machine that matters, at install time |
| Mark scripts executable | A non-executable helper fails with a permission error that reads as a missing file |
| Validate the YAML frontmatter in CI | Malformed frontmatter makes a skill silently undiscoverable, not loudly broken |

| Don't | Because |
|---|---|
| Nest archives inside the published archive | Extractors either refuse or flatten unpredictably |
| Put `SKILL.md` in a subdirectory of the skill | It moves the file past the depth the walk searches |
| Ship a skill whose frontmatter has never been parsed | See above — the failure is silence |

## Practical rules

1. **Keep the tree at depth 2.** `skills/<name>/SKILL.md`, references one level under it.
   Anything deeper needs a manifest entry or it is invisible on a default install.
2. **One canonical copy per skill name.** Duplicates at different depths resolve silently and
   the loser is undetectable at runtime.
3. **Make `description` do the routing work**, including the negative case.
4. **Count files, not bytes, before publishing** — the 1000-file cap binds first.
5. **Never require non-portable frontmatter.** Extra fields are additive; correctness must
   survive a host that reads only `name` and `description`.
