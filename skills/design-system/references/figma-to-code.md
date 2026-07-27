# Figma to Code Patterns

Best practices for translating Figma designs into production React/Next.js components — with or without the Figma MCP.

> **Cross-reference:** For design token conventions → `references/impeccable-techniques.md`
> For component patterns → `references/react-patterns.md`
> For design system foundations → `references/color-palettes.md` + `references/font-pairings.md`

---

## Figma MCP Integration

When the Figma MCP is available (`mcp__figma__*`), Claude can read designs directly. Workflow:

```
1. User shares Figma file URL or node ID
2. Claude calls figma_get_file or figma_get_node
3. Extracts: colors, typography, spacing, component structure
4. Translates to: OKLCH tokens, Tailwind classes, component JSX
5. Maps Figma Auto Layout → CSS Flexbox/Grid
```

### Reading a Figma File

```ts
// Figma MCP tool calls (when MCP is connected)
// mcp__figma__get_file({ fileKey: "abc123" })
// mcp__figma__get_node({ fileKey: "abc123", nodeId: "1:23" })
// mcp__figma__get_styles({ fileKey: "abc123" })

// What to extract:
interface FigmaExtract {
  colors: Record<string, string>      // → OKLCH tokens
  typography: FigmaTextStyle[]        // → font-size, line-height, tracking
  spacing: number[]                   // → Tailwind spacing scale
  components: FigmaComponent[]        // → React components
  autoLayouts: FigmaAutoLayout[]      // → Flexbox/Grid
}
```

### Without MCP (Screenshot Analysis)

When given a screenshot or design file without MCP:
1. Identify the layout grid (8pt/4pt base)
2. Extract color palette (ask user for brand hex if unclear)
3. Identify type hierarchy (H1/H2/body/caption)
4. Note spacing patterns (consistent multiples of 4/8)
5. Identify interactive states (hover, focus, active, disabled)

---

## Figma → Tailwind Translation

### Auto Layout → Flexbox/Grid

| Figma Auto Layout | Tailwind |
|------------------|----------|
| Direction: Horizontal | `flex flex-row` |
| Direction: Vertical | `flex flex-col` |
| Gap: 8px | `gap-2` |
| Gap: 16px | `gap-4` |
| Gap: 24px | `gap-6` |
| Padding: 16px all | `p-4` |
| Padding: 12px 16px | `py-3 px-4` |
| Align: Center | `items-center justify-center` |
| Align: Space between | `justify-between` |
| Fill container | `w-full` / `flex-1` |
| Hug contents | (default) |
| Fixed width 360px | `w-[360px]` |

### Figma Frame → Grid

```tsx
// Figma: 12-column grid, 16px gutter, 24px margins
// → Tailwind:
<div className="max-w-[1280px] mx-auto px-6">
  <div className="grid grid-cols-12 gap-4">
    <div className="col-span-8">Main</div>
    <div className="col-span-4">Sidebar</div>
  </div>
</div>
```

### Figma Corner Radius → Tailwind Rounded

| Figma | Tailwind |
|-------|---------|
| 4px | `rounded` (4px) |
| 6px | `rounded-md` (6px) |
| 8px | `rounded-lg` (8px) |
| 12px | `rounded-xl` (12px) |
| 16px | `rounded-2xl` (16px) |
| 24px | `rounded-3xl` (24px) |
| 9999px (pill) | `rounded-full` |

### Figma Shadow → Tailwind

| Figma Shadow | Tailwind |
|-------------|---------|
| 0 1px 2px rgba(0,0,0,.05) | `shadow-sm` |
| 0 1px 3px rgba(0,0,0,.1) | `shadow` |
| 0 4px 6px rgba(0,0,0,.1) | `shadow-md` |
| 0 10px 15px rgba(0,0,0,.1) | `shadow-lg` |
| 0 20px 25px rgba(0,0,0,.1) | `shadow-xl` |
| Inset | `shadow-inner` |

---

## Color Token Extraction

### From Figma to OKLCH

```ts
// Step 1: Extract Figma hex values
const figmaColors = {
  primary: '#6366F1',    // indigo
  surface: '#F8FAFC',    // near-white
  text: '#0F172A',       // near-black
  muted: '#94A3B8',      // slate-400
  danger: '#EF4444',     // red-500
}

// Step 2: Convert to OKLCH using impeccable-techniques.md rule
// Use oklch() — never raw hex in design token blocks

// Step 3: Wire to CSS variables
const tokens = `
  :root {
    --color-primary:  oklch(62% 0.22 264);
    --color-surface:  oklch(98% 0.003 247);
    --color-text:     oklch(13% 0.02 264);
    --color-muted:    oklch(62% 0.03 248);
    --color-danger:   oklch(63% 0.24 25);
    --color-border:   oklch(91% 0.008 247);
  }
`
```

### Extracting Figma Typography

```ts
// Figma text style → CSS
interface FigmaTextStyle {
  name: string         // e.g., "H1/Display"
  fontFamily: string   // e.g., "Manrope"
  fontWeight: number   // e.g., 800
  fontSize: number     // e.g., 56
  lineHeight: number   // e.g., 60 (px) or 107% (%)
  letterSpacing: number // e.g., -1.5 (px)
}

// Translation
function figmaStyleToCSS(style: FigmaTextStyle) {
  return {
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    fontSize: `${style.fontSize / 16}rem`,
    lineHeight: style.lineHeight > 5
      ? `${style.lineHeight / style.fontSize}` // Convert px to unitless
      : `${style.lineHeight}%` → divide by 100,
    letterSpacing: `${style.letterSpacing / style.fontSize}em`,
  }
}
```

---

## Component Extraction Patterns

### Figma Component → React Component

```
Figma component structure:
  Button/
    ├── Primary/
    │   ├── Default
    │   ├── Hover
    │   ├── Active
    │   ├── Disabled
    │   └── Loading
    └── Secondary/
        └── ...

→ React component with:
  - variant prop: 'primary' | 'secondary'
  - state handled via className + Tailwind
  - hover/focus/active via CSS pseudo-classes (not JS state)
  - disabled via HTML disabled attribute
  - loading via isLoading prop
```

```tsx
// Output of Figma → React translation
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
}

const buttonVariants = {
  primary: 'bg-[--color-primary] text-white hover:opacity-90',
  secondary: 'bg-[--color-surface] border border-[--color-border] hover:bg-slate-50',
  ghost: 'hover:bg-slate-100',
  danger: 'bg-[--color-danger] text-white hover:opacity-90',
}

const buttonSizes = {
  sm: 'h-8 px-3 text-xs rounded-lg',
  md: 'h-10 px-4 text-sm rounded-xl',
  lg: 'h-12 px-6 text-base rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-150 active:scale-[0.97]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${buttonVariants[variant]}
        ${buttonSizes[size]}
      `}
    >
      {isLoading && <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  )
}
```

---

## Design Token → SKILL.md Format

When extracting a full design system from Figma, output in SKILL.md Step 6.5 format:

```css
/* Figma Design System → CSS custom properties */
@theme {
  /* Extracted from Figma: [Brand Name] Design System */
  
  /* Colors — converted from Figma hex to OKLCH */
  --color-brand-primary:  oklch(62% 0.22 264);  /* #6366F1 Indigo 500 */
  --color-brand-accent:   oklch(74% 0.18 160);  /* #34D399 Emerald 400 */
  --color-surface-base:   oklch(98% 0.003 247); /* #F8FAFC Slate 50 */
  --color-surface-raised: oklch(100% 0 0);      /* #FFFFFF */
  --color-text-primary:   oklch(13% 0.02 264);  /* #0F172A Slate 900 */
  --color-text-muted:     oklch(55% 0.03 248);  /* #64748B Slate 500 */
  --color-border:         oklch(91% 0.008 247); /* #E2E8F0 Slate 200 */

  /* Typography — extracted from Figma text styles */
  --font-display: 'Manrope', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
  
  /* Spacing — Figma 8pt grid */
  --radius-sm:  6px;
  --radius-md:  8px;
  --radius-lg:  12px;
  --radius-xl:  16px;
  --radius-2xl: 24px;
}
```

---

## Reading Figma Spacing

```
Figma uses pixel values. Convert to 4pt Tailwind scale:

4px  → gap-1 / p-1 / m-1
8px  → gap-2 / p-2 / m-2
12px → gap-3 / p-3 / m-3
16px → gap-4 / p-4 / m-4
20px → gap-5 / p-5 / m-5
24px → gap-6 / p-6 / m-6
32px → gap-8 / p-8 / m-8
40px → gap-10 / p-10 / m-10
48px → gap-12 / p-12 / m-12
64px → gap-16 / p-16 / m-16

Non-standard values → use arbitrary: gap-[18px] p-[18px]
BUT: prefer rounding to nearest 4pt if the design allows it.
Discuss with design if spacing values aren't on 4pt grid.
```

---

## Figma Variants → Tailwind Conditional Classes

```tsx
// Figma has variants: Size=Small/Medium/Large, State=Default/Hover/Active/Disabled
// → Use cn() (clsx) for conditional Tailwind

import { cn } from '@/lib/utils'

// Pattern 1: Lookup object (preferred for ≥3 variants)
const sizeMap = {
  sm: 'h-8 text-xs px-3',
  md: 'h-10 text-sm px-4',
  lg: 'h-12 text-base px-6',
}

// Pattern 2: cn() with conditionals (for ≤2 variants)
cn(
  'base-classes',
  isPrimary && 'bg-indigo-600 text-white',
  isSecondary && 'bg-white border border-slate-200',
)

// Pattern 3: CVA (class-variance-authority) for complex systems
import { cva } from 'class-variance-authority'

const buttonCVA = cva('inline-flex items-center font-semibold transition-all', {
  variants: {
    variant: {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
      secondary: 'bg-white border border-slate-200 hover:border-slate-300',
    },
    size: {
      sm: 'h-8 px-3 text-xs rounded-lg',
      md: 'h-10 px-4 text-sm rounded-xl',
      lg: 'h-12 px-6 text-base rounded-xl',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})
```

---

## State Extraction

```
Figma states to always check for:

1. Default/Rest
2. Hover          → :hover pseudo-class (CSS)
3. Focus          → :focus-visible pseudo-class (CSS)
4. Active/Pressed → :active pseudo-class (CSS)
5. Disabled       → disabled HTML attribute + :disabled CSS
6. Loading        → isLoading prop + spinner component
7. Error          → aria-invalid + error message
8. Selected       → aria-selected / data-selected
9. Checked        → checked / aria-checked
10. Expanded      → aria-expanded

Figma often shows hover/pressed states only.
Always add focus-visible state even if not in Figma — required for WCAG.
```

---

## Responsive Breakpoints

```
Figma typically provides desktop frame (1440px) and mobile frame (375px).
Infer tablet behavior:

Desktop (1440px) → lg: and above
Tablet (768px)   → md: 
Mobile (375px)   → default (no prefix)

Tailwind mapping:
- sm:  640px  (large phones / landscape)
- md:  768px  (tablets)
- lg:  1024px (laptop)
- xl:  1280px (desktop)
- 2xl: 1536px (wide)

If Figma only has 1440 + 375:
- Apply 1440 layout at lg:
- Apply 375 layout as default
- Infer a reasonable md: transition
```

---

## Typography Extraction Checklist

```
From Figma, note for each text style:
□ Font family (and weight variants used)
□ Font size (px → rem: divide by 16)
□ Line height (px → unitless: divide by font-size, or %)
□ Letter spacing (px → em: divide by font-size, use negative for tight)
□ Font weight (100-900)
□ Text transform (uppercase / normal)
□ Color (→ OKLCH token)

Minimum type scale to define:
- Display/Hero: 56-96px
- H1: 40-56px
- H2: 28-36px
- H3: 20-24px
- Body: 15-16px
- Small/Caption: 12-13px
- Label: 11-12px + uppercase + tracking
```

---

## Common Figma → Code Mistakes

| Figma Behavior | Wrong Code | Correct Code |
|----------------|-----------|-------------|
| Auto layout fill | `width: 360px` | `width: 100%` / `flex: 1` |
| Absolute positioned overlay | `position: fixed` | `position: absolute` (check stacking context) |
| Clip content | `overflow: hidden` on wrong element | Apply to parent container |
| Nested auto layouts | `flex flex-col` + `flex flex-row` nested | Check alignment carefully |
| Font weight 700 + text | `font-bold` | Also check if font has a 700 weight loaded |
| Figma shadow on text | `text-shadow` | Use `drop-shadow` filter for SVG / separate element |
| Border on inside | `ring` (Tailwind) or `box-shadow: inset` | Not `outline` (can't be styled easily) |
| Figma blur effect | `filter: blur(Xpx)` | `backdrop-filter: blur(Xpx)` for frosted glass |

---

## Delivery Checklist (Figma → PR)

```
Before delivering Figma-to-code:
□ All hex colors converted to OKLCH tokens
□ All spacing on 4pt grid (or documented deviation)
□ Typography scale matches Figma styles
□ All 8 interactive states implemented (default/hover/focus/active/disabled/loading/error/empty)
□ Responsive: works on 375px, 768px, 1280px
□ Dark mode: tokens swap correctly if dark-mode is in scope
□ Accessibility: htmlFor/id linked, aria-labels, keyboard nav
□ Motion: prefers-reduced-motion guard on all animations
□ No hardcoded hex in component files (only in token definitions)
```
