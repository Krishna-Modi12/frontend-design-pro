# Font Pairings Reference

Source: nextlevelbuilder/ui-ux-pro-max-skill (57 pairings) + taste-skill + Anthropic claude-cookbooks + pbakaus/impeccable  
Version: 10.9.0

## Banned Display Fonts
Inter, Roboto, Arial, Poppins, DM Sans, Space Grotesk, Open Sans, Lato, Nunito — too generic, signals AI-generated output. **Space Grotesk is explicitly called out by Anthropic as a "common convergent choice" to avoid.**

---

## Impeccable Reflex Fonts — Convergence Watch

*Source: pbakaus/impeccable*

These fonts are not inherently bad — they were chosen because they're good. That's the problem. AI systems have reached for them so consistently that they now **fingerprint AI-generated work**. Using them signals "which AI made this?" instead of "how was this made?"

Avoid as primary display/headline choice unless there is an explicit, defensible brand reason:

| Font / Family | Why It's a Reflex |
|---|---|
| Inter | Default AI body font — appears in ~70% of generated UIs |
| DM Sans / DM Serif | Over-indexed in AI-generated SaaS |
| Outfit | Saturated in AI marketing pages |
| Plus Jakarta Sans | Popular in AI dashboard generation |
| Instrument Sans / Serif | Extremely common in recent AI output |
| Space Grotesk | Anthropic-flagged convergent choice |
| Space Mono | Default AI monospace reach |
| IBM Plex Sans / Serif / Mono | Generic "technical" reflex |
| Fraunces | Over-selected for "expressive editorial" |
| Newsreader | Default "newspaper feel" AI reflex |
| Lora | Most-reached serif for blogs/content |
| Crimson Pro / Text | Default "academic elegance" reflex |
| Playfair Display | Default "luxury serif" reflex |
| Cormorant / Garamond | Default "refined editorial" reflex |
| Syne | Over-indexed in AI design-forward output |

**Rule:** If your font appears above AND you can't state a specific brand reason for it beyond "it looks good" → find something else.

---

## 4-Step Font Selection Process

*Source: pbakaus/impeccable*

Never name a font without completing all 4 steps first:

**Step 1 — Identify 3 specific brand voice characteristics**
Not generic descriptors ("modern", "elegant"). Concrete and specific: "precise like a Swiss watch", "warm like worn leather", "sharp like a surgical instrument".

**Step 2 — Envision the font as a physical object the brand could manufacture**
What would this brand make if it were a physical thing? A typewriter ribbon? A museum label? A 1970s airline ticket? A neon sign? A military stencil? Let that object guide font browsing.

**Step 3 — Browse catalogs with that physical image in mind**
Search Fontshare, Google Fonts, Klim, Grilli Type, or Occupant Fonts with the physical object in mind — not a category ("serif", "modern"). Reject the first 3 fonts that feel right.

**Step 4 — Reject initially appealing choices; keep exploring**
If a font feels obviously correct immediately, it's probably a reflex choice. Force exploration of 2–3 more options before committing. Never repeat fonts from previous projects.

**Anti-patterns to resist:**
- Technical briefs don't require warm humanist serifs
- Premium work shouldn't default to trendy expressive serifs
- Children's products don't need rounded display fonts
- "Modern" doesn't automatically mean geometric sans-serif

## Approved Premium Fonts

### Display / Headlines (choose one)
| Font | Mood | Source | Import |
|------|------|--------|--------|
| Clash Display | Bold, modern agency | Fontshare | `@import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap')` |
| Cabinet Grotesk | Warm, friendly premium | Fontshare | `@import url('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap')` |
| Satoshi | Clean, contemporary | Fontshare | `@import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap')` |
| Geist | Technical precision | Vercel | System or CDN |
| Outfit | Geometric, versatile | Google | `family=Outfit:wght@400;500;600;700;800` |

### Body / UI Text (choose one)
| Font | Mood | Best for | Import |
|------|------|----------|--------|
| Manrope | Geometric, modern | SaaS, dashboards | `family=Manrope:wght@400;500;600;700;800` |
| Plus Jakarta Sans | Friendly, approachable | Marketing, apps | `family=Plus+Jakarta+Sans:wght@400;500;600;700;800` |
| Instrument Sans | Clean, neutral | Any | `family=Instrument+Sans:wght@400;500;600;700` |
| General Sans | Swiss-inspired | Portfolios, agencies | Fontshare |
| Geist | Monospace-adjacent | Developer tools | System |

### Serif (content/editorial only)
| Font | Mood | Best for | Import |
|------|------|----------|--------|
| Lora | Classic editorial | Blogs, articles | `family=Lora:wght@400;500;600;700` |
| Merriweather | Readable, warm | Long-form content | `family=Merriweather:wght@400;700;900` |
| Playfair Display | Luxury, fashion | Premium brands | `family=Playfair+Display:wght@400;500;600;700;800` |
| Source Serif 4 | Technical editorial | Documentation | `family=Source+Serif+4:wght@400;600;700` |

### Monospace (data/terminal)
| Font | Best for | Import |
|------|----------|--------|
| JetBrains Mono | Code, developer tools | `family=JetBrains+Mono:wght@400;500;600;700` |
| Fira Code | Code with ligatures | `family=Fira+Code:wght@400;500;600;700` |
| IBM Plex Mono | Data-dense dashboards | `family=IBM+Plex+Mono:wght@400;500;600;700` |

---

## Recommended Pairings by Product Type

### SaaS / Dashboard
- **Heading:** Manrope 700 or Plus Jakarta Sans 700
- **Body:** Manrope 400 or Inter 400 (body-only use is fine)
- **Data:** JetBrains Mono 500 or tabular-nums on any sans

### Marketing / Landing
- **Heading:** Clash Display 700 or Cabinet Grotesk 800
- **Body:** Plus Jakarta Sans 400 or Instrument Sans 400
- **CTA:** Same as heading, 600 weight

### Editorial / Content
- **Heading:** Playfair Display 700 or Clash Display 600
- **Body:** Lora 400 or Merriweather 400 at `max-w-[65ch]`
- **Caption:** Instrument Sans 400 small

### Portfolio / Creative
- **Heading:** Clash Display 700 (80px+ for hero)
- **Body:** General Sans 400 or Satoshi 400
- **Detail:** Any monospace for dates/tags

### Fintech / Data
- **Heading:** Geist 700 or Manrope 700
- **Body:** Geist 400
- **Numbers:** JetBrains Mono 500 with `font-variant-numeric: tabular-nums`

### Healthcare / Accessibility
- **Heading:** Atkinson Hyperlegible Bold
- **Body:** Atkinson Hyperlegible Regular (18px minimum)

---

## Type Scale

```
Hero:    text-5xl md:text-7xl (48-72px) tracking-tighter leading-none font-800
H1:      text-4xl md:text-5xl (36-48px) tracking-tight leading-tight font-700
H2:      text-2xl md:text-3xl (24-30px) leading-snug font-600
H3:      text-xl md:text-2xl (20-24px) leading-snug font-600
Body:    text-base (16px) leading-relaxed (1.625) font-400
Small:   text-sm (14px) leading-normal font-400
Caption: text-xs (12px) leading-normal font-500 uppercase tracking-wider
```

---

## Pairing Principles (Anthropic Cookbook)

> **High contrast = interesting.** Best pairs create tension between voice and structure.

| Pairing type | Tension | Example |
|---|---|---|
| Display + Monospace | Authority ↔ precision | Clash Display + JetBrains Mono |
| Serif + Geometric Sans | Warmth ↔ modernity | Fraunces + Instrument Sans † |
| Condensed + Expanded | Motion ↔ stillness | Barlow Condensed + Source Serif 4 |
| Script/Decorative + Grotesque | Personality ↔ readability | Zodiak + Satoshi |
| Slab + Humanist | Authority ↔ approachability | Bitter + Lora |

**Rule:** both fonts in a pair should be different on every axis — weight feel, era, x-height, and form. Similar fonts make a pair, not a contrast.

† Both faces are on the Convergence Watch above. The pairing is genuinely good — that is why it converged — so it stays listed, but it is a carve-out, not a default: reach for it only with a stated brand reason, per the rule at the end of that section. Editorial and creative work usually has one; a B2B SaaS landing usually does not.

---

## Additional Distinctive Fonts (Anthropic Cookbook)

Three of these four — Fraunces, Newsreader, Crimson Pro — also sit on the Convergence Watch. Distinctive and over-reached-for are not opposites; a face earns its place here on character and its place there on frequency. Treat this table as a description of what each face *does*, and the Convergence Watch rule as the test for whether you may use it: state the brand reason, or pick something off-list.

| Font | Category | Character |
|---|---|---|
| Fraunces | Optical serif | Wobbly, expressive, literary warmth |
| Newsreader | Editorial serif | Newspaper heritage, clarity at size |
| Crimson Pro | Humanist serif | Academic elegance, tight tracking |
| Bricolage Grotesque | Contemporary sans | Variable width, quirky structure |
| Obviously | Display sans | Bold personality, wide stance |
| Zodiak | Serif display | Sharp, modern luxury |
| Neue Montreal | Geometric sans | Montreal editorial scene |
| Syne | Geometric display | Unusual forms, design-forward |
| IBM Plex Sans/Serif | Technical family | Pairs with IBM Plex Mono perfectly |

---

## Loading Strategy
Always include `&display=swap` in Google Fonts URLs. Use `next/font/google` in Next.js (never raw @import in CSS). System font fallback stack:
```
'Primary Font', 'Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif
```

**System fonts** (`-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui`) — use when performance supersedes personality (internal tools, high-traffic dashboards).

---

## Fallback Font Metrics Override (FOUT Fix)

Match fallback metrics to custom font to eliminate layout shift on load:

```css
@font-face {
  font-family: 'BrandFont';
  src: url('font.woff2') format('woff2');
  font-display: swap;
}
@font-face {
  font-family: 'BrandFont-Fallback';
  src: local('Arial');
  size-adjust:       105%;
  ascent-override:   90%;
  descent-override:  20%;
  line-gap-override: 10%;
}
body {
  font-family: 'BrandFont', 'BrandFont-Fallback', sans-serif;
}
```

Use [Fontaine](https://github.com/unjs/fontaine) to auto-calculate override values. For Next.js: `next/font` handles this automatically.

---

## Pairing Rule: You Often Don't Need Two Fonts

One well-chosen font family in multiple weights creates cleaner hierarchy than two competing typefaces. Try weight-only hierarchy first. Add a second font only when you need structural contrast (serif + sans) — not personality variety.

When pairing, contrast across multiple axes simultaneously:
- Serif + Sans (structural contrast)
- Geometric + Humanist (personality contrast)
- Condensed display + Wide body (proportional contrast)

**Never pair similar-but-not-identical fonts** (two geometric sans-serifs) — visual tension without clear hierarchy.
