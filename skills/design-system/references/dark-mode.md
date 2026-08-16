# Dark Mode Reference — Frontend Design Pro
> Production dark mode: system preference detection, toggle component, token architecture.
> Works with: Tailwind CSS (v3 + v4), shadcn/ui, Next.js App Router, React.

---

## DARK MODE STRATEGY OPTIONS

| Strategy | When to use |
|----------|------------|
| `media` — CSS `prefers-color-scheme` only | No toggle needed, pure system preference |
| `class` — Toggle `.dark` on `<html>` | User can override system setting (recommended) |
| `data-theme` attribute | Multiple themes (light/dark/system + brand themes) |

**Default recommendation:** `class` strategy via `next-themes`. Works universally.

---

## SETUP — NEXT.JS (App Router)

```bash
npm install next-themes
```

```tsx
// app/providers.tsx
'use client'
import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"           // adds/removes 'dark' class on <html>
      defaultTheme="system"       // follow system on first visit
      enableSystem                // sync with prefers-color-scheme
      disableTransitionOnChange   // prevent flash on theme switch
    >
      {children}
    </ThemeProvider>
  )
}

// app/layout.tsx
import { Providers } from './providers'
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>  {/* suppressHydrationWarning required */}
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

**Critical:** `suppressHydrationWarning` on `<html>` — next-themes modifies the class server→client and React would otherwise warn.

---

## TAILWIND DARK MODE CONFIG

### Tailwind v3 (tailwind.config.ts)
```ts
module.exports = {
  darkMode: 'class',   // NOT 'media' — we control it
  // ...
}
```

### Tailwind v4 (CSS-first)
```css
/* globals.css */
@import 'tailwindcss';
@variant dark (&:where(.dark, .dark *));
```

---

## TOKEN ARCHITECTURE

### The Right Way: Semantic tokens, not literal values

```css
/* globals.css */
@layer base {
  :root {
    /* Surfaces */
    --color-bg:          #F8FAFC;
    --color-bg-raised:   #FFFFFF;
    --color-bg-subtle:   #F1F5F9;
    --color-bg-inverse:  #0F1419;

    /* Text */
    --color-ink:         #0F172A;
    --color-ink-secondary: #475569;
    --color-ink-tertiary:  #94A3B8;
    --color-ink-inverse: #F8FAFC;

    /* Brand */
    --color-brand:       #6366F1;
    --color-brand-hover: #4F46E5;
    --color-brand-subtle:#EEF2FF;

    /* Borders */
    --color-border:      #E2E8F0;
    --color-border-strong: #CBD5E1;

    /* Status */
    --color-success:     #10B981;
    --color-warning:     #F59E0B;
    --color-error:       #EF4444;
    --color-info:        #3B82F6;

    /* Elevation (shadows) */
    --shadow-sm:  0 1px 2px rgba(0,0,0,0.06);
    --shadow-md:  0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
    --shadow-lg:  0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.05);
  }

  .dark {
    /* Surfaces — NOT pure black */
    --color-bg:          #0F1419;
    --color-bg-raised:   #1A2130;
    --color-bg-subtle:   #141B27;
    --color-bg-inverse:  #F8FAFC;

    /* Text */
    --color-ink:         #F1F5F9;
    --color-ink-secondary: #94A3B8;
    --color-ink-tertiary:  #475569;
    --color-ink-inverse: #0F172A;

    /* Brand — slightly lighter in dark for contrast */
    --color-brand:       #818CF8;
    --color-brand-hover: #6366F1;
    --color-brand-subtle:#1E1B4B;

    /* Borders — subtle in dark */
    --color-border:      #1E293B;
    --color-border-strong: #334155;

    /* Status — desaturated slightly for dark bg */
    --color-success:     #34D399;
    --color-warning:     #FBBF24;
    --color-error:       #F87171;
    --color-info:        #60A5FA;

    /* Shadows — use subtle glows, not hard shadows */
    --shadow-sm:  0 1px 2px rgba(0,0,0,0.3);
    --shadow-md:  0 4px 6px rgba(0,0,0,0.4);
    --shadow-lg:  0 10px 15px rgba(0,0,0,0.5);
  }
}
```

### Using tokens in Tailwind (v4 @theme pattern)
```css
@theme {
  --color-bg: initial;
  --color-bg-raised: initial;
  --color-ink: initial;
  --color-brand: initial;
  /* Tailwind v4 maps these to bg-bg, text-ink, border-brand, etc. */
}
```

```tsx
// In components
<div className="bg-[var(--color-bg)] text-[var(--color-ink)]" />
// or with v4 theme mapping:
<div className="bg-bg text-ink" />
```

---

## DARK MODE TAILWIND CLASSES — PATTERNS

### DO: semantic pairing
```tsx
// Surface + text that work in both modes
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">

// Card
<div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">

// Muted text
<p className="text-slate-500 dark:text-slate-400">

// Brand button — stays readable in both modes
<button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white">

// Input
<input className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500">
```

### DON'T:
```tsx
// ❌ Pure black/white — never do this
<div className="bg-white dark:bg-black text-black dark:text-white">

// ❌ Literal color in dark — not maintainable
<div className="dark:bg-[#1a1a1a]">   // use tokens

// ❌ Same color both modes — defeats the purpose
<div className="bg-slate-100 dark:bg-slate-100">
```

---

## DARK MODE TOGGLE COMPONENT

```tsx
'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Option A: Three-way dropdown (system / light / dark)
export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch — don't render until client-side
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-9 w-9" />  // stable placeholder

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Option B: Simple toggle (light ↔ dark)
export function SimpleThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-9 w-9" />

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  )
}
```

**Critical:** Always guard with `mounted` state — `useTheme` returns `undefined` on SSR and causes hydration mismatch.

---

## DARK MODE IMAGE HANDLING

```tsx
// Option 1: CSS filter inversion (logos/icons that are black on transparent)
<img
  src="/logo.svg"
  alt="Ridgeline"
  className="h-8 dark:invert"
/>

// Option 2: Different images per mode (screenshots, illustrations)
import { useTheme } from 'next-themes'
const { resolvedTheme } = useTheme()
<img
  src={resolvedTheme === 'dark' ? '/hero-dark.png' : '/hero-light.png'}
  alt="Product screenshot showing the dashboard"
/>

// Option 3: next/image with conditional src
<Image
  src={resolvedTheme === 'dark' ? '/og-dark.png' : '/og-light.png'}
  alt="…"
  width={1200}
  height={630}
/>
```

---

## DARK MODE CODE SYNTAX HIGHLIGHT

```tsx
// Use Shiki (recommended for Next.js) — renders server-side
import { codeToHtml } from 'shiki'

const html = await codeToHtml(code, {
  lang: 'tsx',
  themes: {
    light: 'github-light',
    dark: 'github-dark-dimmed',
  },
})

// Shiki emits CSS variables — reads from .dark automatically
<div dangerouslySetInnerHTML={{ __html: html }} />
```

---

## DARK MODE CHARTS (Recharts)

```tsx
const { resolvedTheme } = useTheme()
const isDark = resolvedTheme === 'dark'

<LineChart data={data}>
  <CartesianGrid
    strokeDasharray="3 3"
    stroke={isDark ? '#1E293B' : '#F1F5F9'}
  />
  <XAxis
    tick={{ fill: isDark ? '#94A3B8' : '#64748B' }}
    axisLine={{ stroke: isDark ? '#334155' : '#E2E8F0' }}
  />
  <Line stroke={isDark ? '#818CF8' : '#6366F1'} />
  <Tooltip
    contentStyle={{
      background: isDark ? '#1A2130' : '#FFFFFF',
      border: `1px solid ${isDark ? '#1E293B' : '#E2E8F0'}`,
      color: isDark ? '#F1F5F9' : '#0F172A',
    }}
  />
</LineChart>
```

---

## DARK MODE WITHOUT NEXT-THEMES (plain React)

```tsx
// Custom hook — reads system preference + localStorage
function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (stored) return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  return { theme, setTheme }
}
```

---

## DARK SURFACE HIERARCHY (key rule)

Never make dark mode a flat black void. Use elevation via subtle lightness:

```
Layer 0 (page bg):    #0F1419  — darkest
Layer 1 (card):       #1A2130  — +1 step lighter
Layer 2 (popover):    #1E2A3A  — +1 step lighter
Layer 3 (tooltip):    #253347  — +1 step lighter
Hover state:          always +5% lightness on the layer color
```

This creates **perceived depth** without shadows, which look heavy on dark backgrounds.

---

## DARK MODE CHECKLIST

- [ ] `suppressHydrationWarning` on `<html>`
- [ ] `mounted` guard on any component rendering theme-dependent content
- [ ] `defaultTheme="system"` so first-time visitors match their OS
- [ ] All semantic color tokens defined in both `:root` and `.dark`
- [ ] No pure `#000000` / `#FFFFFF` surfaces — use `#0F1419` / `#F8FAFC`
- [ ] Images: either `dark:invert` for SVG icons or separate dark-mode images
- [ ] Charts: colors passed programmatically, not via CSS classes
- [ ] Transitions on theme switch are disabled (`disableTransitionOnChange`) to prevent flash

---

## ROUTING IN SKILL (when to load this file)

Load `references/dark-mode.md` when request matches:
- "dark mode", "dark theme", "light/dark toggle", "theme switcher"
- "next-themes", "useTheme", "prefers-color-scheme"
- "dark variant", "dark: classes", "dark surface"
- "supports dark mode", "add dark mode"
- `[dark]` shortcode

## Vercel additions

- `color-scheme: dark` on `<html>` (or `:root`) for dark themes — fixes native scrollbars, form controls, and `<input>` chrome. Pair with `color-scheme: light dark` when supporting both.
- `<meta name="theme-color" content="…">` must match the page background so mobile browser UI blends with the surface. Provide one per `prefers-color-scheme` via `media`.
- Native `<select>`: set explicit `background-color` and `color`, or Windows dark mode renders unreadable options.
