# Lucide Index

A purpose-to-name lookup for `lucide-react`. `icons-avatars.md` owns *how* to use
icons — sizing, labelling, the `aria-hidden` rule, avatars — and `icon-systems.md`
owns the choice of library. This file exists for the narrower moment when you know
what the icon must mean and need the export name without leaving the editor.

Every icon is a 24×24 stroked SVG accepting `size`, `color`, `strokeWidth` and
`className`.

## Contents

- [Navigation](#navigation)
- [Social and contact](#social-and-contact)
- [Content and documents](#content-and-documents)
- [People and time](#people-and-time)
- [Technical](#technical)
- [Status and feedback](#status-and-feedback)
- [Decorative and thematic](#decorative-and-thematic)
- [Usage](#usage)
- [Notes that stop the common mistakes](#notes-that-stop-the-common-mistakes)
- [Sources](#sources)

---

## Navigation

| Purpose | Names |
|---|---|
| Menu | `Menu`, `AlignJustify` |
| Close | `X`, `XCircle` |
| Back | `ArrowLeft`, `ChevronLeft` |
| Forward | `ArrowRight`, `ChevronRight` |
| Up | `ArrowUp`, `ChevronUp` |
| Down | `ArrowDown`, `ChevronDown` |
| Home | `Home` |
| External link | `ExternalLink`, `ArrowUpRight` |
| Search | `Search` |

`Arrow*` and `Chevron*` are not interchangeable. An arrow implies travel — going
somewhere else. A chevron implies disclosure — expanding, or moving within a set.
Using an arrow on an accordion is the commonest icon error in this table.

## Social and contact

| Purpose | Names |
|---|---|
| GitHub | `Github` |
| X / Twitter | `Twitter` |
| LinkedIn | `Linkedin` |
| YouTube | `Youtube` |
| Instagram | `Instagram` |
| Email | `Mail`, `MailOpen` |
| Link | `Link`, `Link2` |
| Share | `Share2` |

Brand marks are trademarks. Lucide ships simplified glyphs for convenience, but a
company's own brand guidelines govern colour, clear space and whether the mark may
be restyled at all. For marks Lucide does not carry — WeChat, Weibo, Bluesky —
take the official SVG from the brand's own resources page rather than redrawing
one.

## Content and documents

| Purpose | Names |
|---|---|
| File | `File`, `FileText`, `FilePlus` |
| Folder | `Folder`, `FolderOpen` |
| Image | `Image`, `ImagePlus` |
| Video | `Video`, `Play`, `Pause` |
| Audio | `Music`, `Volume2` |
| Download | `Download` |
| Upload | `Upload` |
| Copy | `Copy`, `Clipboard` |
| Edit | `Pencil`, `PenLine`, `Edit` |
| Delete | `Trash2` |

## People and time

| Purpose | Names |
|---|---|
| User | `User`, `UserCircle` |
| Group | `Users` |
| Avatar frame | `CircleUser` |
| Location | `MapPin` |
| Phone | `Phone` |
| Calendar | `Calendar` |
| Time | `Clock` |
| Birthday | `Cake` |

For a real avatar with a fallback, use the initials pattern in `icons-avatars.md`
rather than a `User` glyph — a generic person icon in a list of people tells the
reader nothing about which person.

## Technical

| Purpose | Names |
|---|---|
| Code | `Code`, `Code2`, `Terminal` |
| Database | `Database` |
| Server | `Server` |
| Cloud | `Cloud` |
| Settings | `Settings`, `Cog` |
| Tools | `Wrench`, `Hammer` |
| Layers | `Layers` |
| Component | `Component`, `Puzzle` |
| Processor | `Cpu` |
| Speed | `Zap` |
| Grid / framework | `LayoutGrid`, `Grid3x3` |
| API | `Webhook` |
| Security | `Shield`, `Lock` |

## Status and feedback

| Purpose | Names |
|---|---|
| Success | `Check`, `CheckCircle` |
| Warning | `AlertTriangle` |
| Error | `AlertCircle`, `XCircle` |
| Information | `Info` |
| Loading | `Loader2` with `className="animate-spin"` |
| Rating | `Star`, `StarHalf` |
| Favourite | `Heart` |
| Approval | `ThumbsUp` |

`Loader2` is the one designed to rotate cleanly around its own centre; the other
loader glyphs wobble. And status must never be carried by the icon alone — pair
each with text, because a red circle and a green circle are the same circle to a
reader who cannot distinguish them.

## Decorative and thematic

| Purpose | Names |
|---|---|
| Light theme | `Sun` |
| Dark theme | `Moon` |
| Quotation | `Quote` |
| Popular | `Flame` |
| Launch | `Rocket` |
| Award | `Trophy` |
| Goal | `Target` |
| Idea | `Lightbulb` |
| Documentation | `BookOpen` |
| Education | `GraduationCap` |
| Work | `Briefcase` |
| Organisation | `Building` |

## Usage

```tsx
import { Github, Mail, ArrowUpRight, Moon, Sun } from "lucide-react";

// Decorative beside a visible label — hidden from assistive technology.
<button className="flex items-center gap-2">
  <ArrowUpRight size={16} aria-hidden="true" />
  View project
</button>

// Carrying meaning on its own — must be labelled.
<a href="https://github.com/…" aria-label="View the source on GitHub">
  <Github size={20} aria-hidden="true" />
</a>

// Token-driven colour, thinner stroke.
<Mail size={24} color="var(--color-brand)" strokeWidth={1.5} />

// Theme toggle.
{isDark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
```

The `aria-hidden` on every one of these is not decoration. Lucide renders an
`<svg>` that assistive technology will otherwise try to describe, and an icon
beside its own label gets announced twice. The rule is in `icons-avatars.md`:
hide the glyph, label the control.

## Notes that stop the common mistakes

**Import from the package, never hand-roll the SVG.** A hand-written path drifts
from the set's stroke weight, terminal shape and optical grid, and it is the
detail that makes an interface look assembled rather than designed. Emoji are not
a substitute either — they render as someone else's artwork, differently on every
platform, and they carry their own screen-reader announcements.

**Sizes are a small set, not a free number.** 16 inside a compact button, 20 for
ordinary interface use, 24 as the standard, 32 for a feature, 48 decorative.
Picking 21 because it looked right in one place is how an interface ends up with
nine icon sizes.

**Stroke width tracks size, not taste.** The 2 default is drawn for 24px. At 16px
it reads heavy — drop to 1.5. At 48px it reads thin. Whatever you choose, choose
it once for the whole interface; mixed stroke weights are visible even to people
who cannot name what is wrong.

**Do not mix icon families.** Lucide beside Phosphor beside Heroicons is three
different grids and three different corner treatments. `icon-systems.md` covers
choosing one.

## Sources

Translated and expanded from the Chinese original in `xiaopu-ai/web-design`
(MIT, Copyright © 2026 KAOPU-XiaoPu). The purpose-to-name tables are upstream's.
The accessibility rules, the arrow-versus-chevron distinction, the trademark note
and the stroke-width guidance are this pack's, and the usage examples were
rewritten to carry the `aria-hidden` this pack requires — upstream's omit it.
