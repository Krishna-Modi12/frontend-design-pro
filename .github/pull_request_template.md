## What changed?

## Which gates were run?

```bash
python scripts/build_release.py --dry-run
```

Paste the output.

## Does this add a new skill?

If yes, confirm each step from `docs/ARCHITECTURE.md`'s "Adding to the pack":

- [ ] Frontmatter present (`name`, `description`, `version` matching `metadata.json`, `core-deps`)
- [ ] Reference index updated (every reference file cited in the skill's Reference Index — an uncited reference fails the path-integrity stage)
- [ ] Example + test included (at least one `examples/good-*.tsx`; Gate 8b fails a skill with none)
- [ ] Registry row added to `SKILL.md` (id, path, trigger keywords, core dep)

If no, delete this section.

## Checklist

- [ ] `tsc --noEmit` strict passes on all changed `.tsx` files
- [ ] No `references/` paths introduced — use `skills/{id}/references/` instead (a pre-registry mistake already fixed once; Gate 6 now rejects bare `references/`/`_meta/` prefixes and bare reference filenames)
- [ ] No placeholder copy (no lorem ipsum, no `John Doe`/`user123`, no AI-slop phrasing)
- [ ] Token budget respected — every skill file ≤3,000 tokens alone, ≤8,000 tokens with declared core-deps (Gate 8a)
