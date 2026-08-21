# Security Policy

## Reporting a vulnerability

**Please do not open a public issue for a security problem.**

Use GitHub's private vulnerability reporting:

1. Go to the [Security tab](https://github.com/Krishna-Modi12/frontend-design-pro/security)
2. **Report a vulnerability**

That opens a private advisory only the maintainer can see. If the form is
unavailable, open a public issue titled *"security — request contact"* with no
detail in it, and you will get a private channel to use.

Expect an acknowledgement within 7 days. If a report is valid, the fix ships in the
next release and you are credited in the advisory unless you would rather not be.

## Supported versions

Only the **latest release** is supported. This is a single-maintainer project with
no backport branches; fixes land on `main` and go out in the next tag.

## What is in scope

This project is a **skill pack for AI agents** — markdown instructions and
TypeScript examples that an agent reads and generates code from. It is not a
service and has no runtime, so the interesting risks are not the usual ones. In
scope:

- **Reference material that would make an agent produce insecure code.** The
  `skills/*/references/*.md` corpus is instructions an agent acts on. A reference
  prescribing `dangerouslySetInnerHTML` with unsanitised input, a permissive CORS
  or CSP recipe, an auth pattern that leaks tokens to the client, or a dependency
  suggestion with a known advisory is a genuine vulnerability in this project even
  though nothing here executes.
- **Examples that ship the same problem.** `skills/*/examples/good-*.tsx` are
  presented as the correct way to do something and get copied.
- **Anything in the install adapters** (`install/`, `setup.sh`, `setup.ps1`) that
  would run unexpected code on a consumer's machine or write outside the target
  project.
- **Supply-chain problems in the published archive** — an unexpected file, a path
  that escapes the extraction directory, a pointer to a resource the project does
  not control.

Out of scope: findings in `demo/` that require a hostile local developer,
`npm audit` output for dev-only tooling that is already fixed on `main`, and
missing hardening in code explicitly labelled `bad-*.tsx` — those files exist to be
insecure and the test suite asserts that they fail.

## Dependencies

The pack itself has **no runtime dependencies**. Everything in `package.json` is
`devDependencies` — the test and typecheck toolchain — and none of it ships inside
the `.skill` archive.

`npm audit` should report zero. If you see findings, check whether they come from
`tools/screenshots/` or `demo/showcase/`, which carry their own `package.json` and
are not part of the pack.

## How releases are produced

Archives are built only by `scripts/build_release.py`, which runs 11 blocking gates
first. Pushing a `v*` tag fires `.github/workflows/release.yml`, which re-runs the
entire chain on a clean runner and publishes the archive as a release asset. The
archive attached to a GitHub Release is the only artifact to trust — there is no
npm package and no CDN copy.

## What this pack does on your machine

You are about to let an agent load this into a repository that probably has secrets
in it, and `npx skills add` means most people will never see the tree first. So,
plainly:

- **It is markdown and TypeScript files.** Nothing in the pack runs. The agent
  *reads* it; the `.tsx` examples are read too, not executed — no build step, no
  postinstall, no bundled binary.
- **It makes no network calls and collects no telemetry.** No analytics endpoint,
  no beacon, no phone-home. Two example files call `fetch()`, and both are
  demonstrating a real loading state in code you would copy — they run only if you
  run them.
- **The only thing that executes is `setup.sh` / `setup.ps1`**, which you can read
  in full. Between them they invoke `basename`, `cp`, `dirname`, `find`, `mkdir` and
  `printf`. No `eval`, no `curl`, no `sudo`, no elevation.
- **It needs no credentials, keys or environment variables**, and reads none.
- **It writes only adapter rules files** into your project, all listed by
  `setup.sh --dry-run` before anything is written, and never overwrites without
  `--force`.

Verify rather than trust it — these are the checks, not a summary of them:

```bash
grep -nE 'curl|wget|eval|exec|sudo|base64' setup.sh setup.ps1        # expect: no matches
grep -rlE 'sendBeacon|XMLHttpRequest|axios|new WebSocket' skills/     # expect: no matches
bash setup.sh --dry-run                                              # every path it would write
```

The one caveat is the installer, not the pack: `npx skills` sends anonymous install
telemetry by default. `DISABLE_TELEMETRY=1` turns it off, and the git-clone and
archive routes documented in [docs/INSTALL.md](docs/INSTALL.md) never involve it at
all.
