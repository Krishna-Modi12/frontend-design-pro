# Token interop — DTCG, Style Dictionary, and the boundary OKLCH does not cross

Load this when tokens have to leave the browser: a design system that also ships
iOS, Android or Compose; a Figma round-trip through Tokens Studio; a handoff
where the deliverable is a token file rather than a stylesheet; or any request
that names Style Dictionary, DTCG, `tokens.json`, or "one source of truth for all
platforms".

Do **not** load it for web-only work. `core/design-tokens.md` plus
`references/color-palettes.md` are the whole answer there, and everything below
is cost without benefit.

## The three layers, and which one leaves the browser

| Layer | Example | Travels? |
|---|---|---|
| **Primitive** — a raw value with no meaning | `blue.500`, `space.4` | Yes |
| **Semantic** — a role, pointing at a primitive | `surface.page`, `text.muted` | Yes |
| **Platform output** — the compiled artifact | CSS custom property, `colors.xml`, `Color.kt` | No, it is generated |

The rule that matters: **semantic tokens alias primitives, they never copy
them.** A palette says what exists; only the semantic layer says what a colour is
*for*. Copying the value at the semantic layer is the defect the whole format
exists to prevent, because it makes a theme change an N-place edit.

## DTCG is the interchange format

The Design Tokens Format Module, from the W3C Design Tokens Community Group, is
the file format tools agree on. Style Dictionary is one build system that
consumes it; Tokens Studio is one editor that emits it. Name the standard, not
the vendor, when a team asks what to adopt.

Two properties carry the weight — a `$value` and a `$type` per token, and a
brace-path alias to reference another token:

```json
{
  "color": {
    "brand": { "$value": "#3b5bdb", "$type": "color" },
    "surface": {
      "page":  { "$value": "{color.brand}", "$type": "color" },
      "muted": { "$value": "#f1f3f5", "$type": "color" }
    }
  }
}
```

Aliases resolve across files, so splitting the source by concern costs nothing —
the build deep-merges every file by key path before resolving. Split by domain
(`color/`, `size/`, `motion/`), never by platform. A file per platform is the
duplication the pipeline exists to remove.

## What the build system actually does

A config names a source glob and one entry per platform, each with a transform
group and a build path. One source, many outputs, and the platform-specific
arithmetic lives in the transform rather than in anyone's head — the same `1rem`
entry becomes `1rem` in SCSS and `16.00sp` in Android XML.

```bash
npx style-dictionary build      # reads config.json, writes every platform at once
```

Three consequences worth stating to a team:

- **Generated output is never edited.** If `build/` is in version control it is
  there to review diffs, not to hand-edit. A hand edit is lost on the next build.
- **A new platform is a config entry**, not a new token file.
- **The token source is the review surface.** Design review reads the JSON; code
  review reads the diff of the generated files.

## The boundary: this pipeline is hex-native

Every artifact a token compiler emits for Android, iOS or Compose is hex or a
platform colour object. OKLCH survives as a CSS custom property and does **not**
survive a transform to `colors.xml` or a `UIColor`.

This does not relax the OKLCH rule. That rule governs **component code** — the
`.tsx` an agent writes — and it stays absolute there, enforced by the regex and
AST suites on every example in this pack. What changes is only where a hex
literal is legitimate:

| Place | Hex allowed? |
|---|---|
| A DTCG token source consumed by a compiler | **Yes** — it is the interchange format's native encoding |
| Generated `build/` output | Yes, and never authored by hand |
| A CSS custom property definition | Prefer OKLCH; the browser is the one target that supports it |
| Anywhere in a component | **No.** Reference the token |

Author colour in OKLCH where the target is the browser, and treat the hex in a
cross-platform token source as a serialisation detail of the platforms that
cannot express anything better. When both are in play, the token source is the
one place a colour may be written twice — once as the portable hex, once as an
OKLCH CSS value — and the reason belongs in a comment, because the next reader
will otherwise "fix" it.

## Naming grammar

Predictable names beat memorised ones. Order the parts from most to least
general, and omit any part that has only one possible value:

```
[category].[concept].[property].[variant].[scale]

color.surface.page          color.text.muted.hover
space.inset.sm              font.size.body.lg
```

Two rules that prevent most naming arguments: a token name never encodes its own
value (`color.blue.primary` breaks the moment the brand goes green), and it never
encodes a component (`color.button.bg` multiplies with every new component —
`color.action.bg` does not).

## Figma

Tokens Studio is the plugin that makes Figma variables and a DTCG file the same
artifact, so the round trip is real rather than a re-typing exercise. Treat the
direction of truth as a decision the team must state out loud: either design
edits tokens and code consumes them, or the reverse. Both directions at once
silently loses whichever edit was second, and no tool will report it.

`references/figma-to-code.md` covers the translation of layout and Auto Layout;
this file covers only the token half.
