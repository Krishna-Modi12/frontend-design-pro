# Install

## One line (fastest)

From the root of the project you want the agent to work on:

```bash
git clone --depth 1 https://github.com/Krishna-Modi12/frontend-design-pro && bash frontend-design-pro/setup.sh
```

The clone directory name is load-bearing: every adapter references
`frontend-design-pro/SKILL.md` relative to your project root, so cloning under
that exact name is what makes the path the installer writes a path that exists.
`setup.sh` detects the agent and writes its native rules file; `--dry-run` shows
what it would write first, and nothing is overwritten without `--force`.

This gives you the tree on `main`, which CI checks on every push. The numbered
route below gives you the released `.skill`, which is built only after all 10
gates pass — the difference matters if you want the artifact that cannot exist
while anything is red.

## Agent setup (most people)

1. Download the latest `frontend-design-pro-v*.skill` from [Releases](https://github.com/Krishna-Modi12/frontend-design-pro/releases). A `.skill` file is a zip whose root folder is `frontend-design-pro/`.

2. Unzip it into your agent's skills directory:

   ```bash
   # Claude Code
   unzip frontend-design-pro-v*.skill -d ~/.claude/skills/
   ```

   ```powershell
   # Windows PowerShell
   Expand-Archive frontend-design-pro-v*.skill -DestinationPath "$HOME\.claude\skills\"
   ```

   Other hosts: **Claude.ai** — upload the unzipped contents as project knowledge. **Cursor, Copilot, Windsurf, Continue.dev and Aider** keep their rules in a file, so the pack ships that file already written — run `bash frontend-design-pro/setup.sh` from your project root and it detects the agent and writes the right one. See [`install/`](../install/) for the files themselves and a card per host.

3. Confirm the layout. `SKILL.md` must sit at the root of the skill folder, beside `core/` and `skills/`:

   ```
   ~/.claude/skills/frontend-design-pro/
   ├── SKILL.md        ← the registry; the only file always read
   ├── core/           ← 8 shared primitives
   ├── skills/         ← 19 skills + references + examples
   └── scripts/  evals/  rules/
   ```

   Paths inside `SKILL.md` are relative to that root, so no configuration is needed.

4. Start a new chat and ask for UI in plain language:

   > Create a landing page for a SaaS product

   There are no slash commands. The agent reads the registry, matches your wording against trigger keywords, and loads exactly one skill plus its declared dependencies (~5,038–6,338 tokens). See [USAGE.md](USAGE.md).

> **Optional — `AGENT_SYSTEM_PROMPT.md`:** if your host has a system-prompt field, paste it in. `SKILL.md` alone is sufficient (it carries the identity, behavioural preamble, anti-slop wall, routing table and failure handling), but the system prompt makes the loading protocol, the intake trigger, the per-pass core-file citations and the validation contract explicit. It is version-free and every path it cites is verified by Gate 6 on each build.

## Contributor setup

```bash
git clone https://github.com/Krishna-Modi12/frontend-design-pro.git
cd frontend-design-pro
npm install          # typescript, vitest, testing-library, jest-axe
npm run gates        # every gate, no archive — must be green before you change anything
```

Requires **Python 3.11+** and **Node 20+**. The Python scripts use only the standard library.

## Verify the install

```bash
npm run gates                            # or: python scripts/build_release.py --dry-run
```

Expected tail:

```
DRY RUN — all gates passed. No archive built.  (~45s)
```

The run prints one line per gate. All of them must read `✓`; a single `✗` aborts the chain and no archive can be produced. Two `⚠` lines are informational and do not block: an uncommitted-changes notice, and `design-system: brand-design-systems.md not cited in its Reference Index`.

Individual gates, when you want a faster loop:

```bash
npm run typecheck    # strict tsc over all 54 examples
npm run constraints  # 42 syntactic constraints
npm run evals        # 22 eval cases
npm run regression   # 11 parser-vs-regex divergence cases
npm test             # vitest — 44 test files, 192 tests, run by Gate 7
```

## Build an archive

```bash
npm run build        # gated archive → dist/frontend-design-pro-v<version>.skill
```

`build_release.py` is the only supported way to produce a `.skill`. It runs every gate, builds the zip, unzips it to a temp directory, re-runs the compile and parser gates **against the extracted copy**, and deletes the archive if that smoke test fails.
