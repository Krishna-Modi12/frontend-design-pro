# Color Palettes by Industry

> **All values in OKLCH** (original hex preserved in comments for designer reference).
> Agents MUST emit OKLCH in component code per SKILL.md BUILD — never raw hex.
> Legacy systems: convert at build time; do not hand-translate.

Source: nextlevelbuilder/ui-ux-pro-max-skill (161 palettes condensed) + taste-skill

## Universal Token Structure

Every palette maps to these semantic tokens:

```css
:root {
  --color-primary: <oklch>;
  --color-primary-hover: <oklch>;
  --color-on-primary: <oklch>;       /* text on primary bg */
  --color-secondary: <oklch>;
  --color-accent: <oklch>;           /* CTA, highlights */
  --color-background: <oklch>;
  --color-foreground: <oklch>;       /* primary text */
  --color-surface: <oklch>;          /* cards, raised areas */
  --color-surface-raised: <oklch>;
  --color-muted: <oklch>;            /* secondary text */
  --color-border: <oklch>;
  --color-destructive: <oklch>;
  --color-success: <oklch>;
  --color-warning: <oklch>;
  --color-ring: <oklch>;             /* focus rings */
}
```

---

## SaaS / Software

```css
--color-primary: oklch(58.5% 0.204 277.1);          /* Indigo */  /* #6366F1 */
--color-primary-hover: oklch(51.1% 0.23 277.0);  /* #4F46E5 */
--color-on-primary: oklch(100.0% 0 0);  /* #FFFFFF */
--color-accent: oklch(62.3% 0.188 259.8);           /* Blue */  /* #3B82F6 */
--color-background: oklch(98.4% 0.003 247.9);  /* #F8FAFC */
--color-foreground: oklch(18.8% 0.013 248.5);  /* #0F1419 */
--color-surface: oklch(99.5% 0.004 255);  /* #FFFFFF */
--color-muted: oklch(55.1% 0.023 264.4);  /* #6B7280 */
--color-border: oklch(92.8% 0.006 264.5);  /* #E5E7EB */
--color-destructive: oklch(63.7% 0.208 25.3);  /* #EF4444 */
--color-success: oklch(69.6% 0.149 162.5);  /* #10B981 */
--color-warning: oklch(76.9% 0.165 70.1);  /* #F59E0B */
```

Dark mode:
```css
--color-background: oklch(20.8% 0.04 265.8);  /* #0F172A */
--color-foreground: oklch(96.8% 0.007 247.9);  /* #F1F5F9 */
--color-surface: oklch(27.9% 0.037 260.0);  /* #1E293B */
--color-border: oklch(37.2% 0.039 257.3);  /* #334155 */
--color-muted: oklch(71.1% 0.035 256.8);  /* #94A3B8 */
```

## Marketing / Agency

```css
--color-primary: oklch(18.8% 0.013 248.5);          /* Near-black */  /* #0F1419 */
--color-accent: oklch(58.5% 0.204 277.1);           /* Single vibrant accent */  /* #6366F1 */
--color-background: oklch(98.5% 0 0);  /* #FAFAFA */
--color-foreground: oklch(18.8% 0.013 248.5);  /* #0F1419 */
--color-surface: oklch(99.5% 0.004 255);  /* #FFFFFF */
--color-muted: oklch(55.2% 0.014 285.9);  /* #71717A */
--color-border: oklch(92.0% 0.004 286.3);  /* #E4E4E7 */
```

Rule: Single accent color with saturation < 80%. Color is a scarce resource — use only for semantic meaning or subtle accents.

## E-commerce

```css
--color-primary: oklch(21.0% 0.006 285.9);  /* #18181B */
--color-accent: oklch(70.5% 0.187 47.6);           /* Orange — urgency/CTA */  /* #F97316 */
--color-background: oklch(98.5% 0 0);  /* #FAFAFA */
--color-foreground: oklch(21.0% 0.006 285.9);  /* #18181B */
--color-surface: oklch(99.5% 0.004 255);  /* #FFFFFF */
--color-success: oklch(72.3% 0.192 149.6);          /* Add to cart, in stock */  /* #22C55E */
--color-destructive: oklch(63.7% 0.208 25.3);      /* Out of stock, errors */  /* #EF4444 */
--color-warning: oklch(79.5% 0.162 86.0);          /* Low stock */  /* #EAB308 */
```

## Fintech / Banking

```css
--color-primary: oklch(52.8% 0.263 262.9);          /* Trust blue */  /* #0052FF */
--color-accent: oklch(69.6% 0.149 162.5);           /* Gains green */  /* #10B981 */
--color-background: oklch(14.7% 0.011 285.0);       /* Deep dark */  /* #0A0A0F */
--color-foreground: oklch(98.4% 0.003 247.9);  /* #F8FAFC */
--color-surface: oklch(19.7% 0.024 284.0);  /* #141420 */
--color-success: oklch(72.3% 0.192 149.6);          /* Profit */  /* #22C55E */
--color-destructive: oklch(63.7% 0.208 25.3);      /* Loss */  /* #EF4444 */
--color-warning: oklch(76.9% 0.165 70.1);  /* #F59E0B */
--color-muted: oklch(55.1% 0.023 264.4);  /* #6B7280 */
--color-border: oklch(24.6% 0.028 284.1);  /* #1F1F2E */
```

Crypto variant:
```css
--color-accent: oklch(75.2% 0.166 62.6);           /* Bitcoin orange */  /* #F7931A */
--color-secondary: oklch(88.5% 0.182 94.9);        /* Digital gold */  /* #FFD600 */
```

## Healthcare / Wellness

```css
--color-primary: oklch(60.9% 0.111 221.7);          /* Calming cyan */  /* #0891B2 */
--color-accent: oklch(69.6% 0.149 162.5);           /* Health green */  /* #10B981 */
--color-background: oklch(98.4% 0.014 180.7);       /* Warm mint */  /* #F0FDFA */
--color-foreground: oklch(38.6% 0.059 188.4);  /* #134E4A */
--color-surface: oklch(99.5% 0.004 255);  /* #FFFFFF */
--color-destructive: oklch(57.7% 0.215 27.3);      /* Emergency only */  /* #DC2626 */
--color-muted: oklch(55.1% 0.023 264.4);  /* #6B7280 */
--color-border: oklch(95.0% 0.051 163.1);  /* #D1FAE5 */
```

Rule: Avoid harsh reds except for true emergencies. High contrast mandatory (WCAG AAA 7:1).

## Content / Editorial

```css
--color-primary: oklch(21.6% 0.006 56.0);  /* #1C1917 */
--color-background: oklch(98.5% 0.001 106.4);       /* Warm white */  /* #FAFAF9 */
--color-foreground: oklch(21.6% 0.006 56.0);  /* #1C1917 */
--color-surface: oklch(99.5% 0.004 255);  /* #FFFFFF */
--color-accent: oklch(66.6% 0.157 58.3);           /* Warm amber accent */  /* #D97706 */
--color-muted: oklch(55.3% 0.012 58.1);  /* #78716C */
--color-border: oklch(92.3% 0.003 48.7);  /* #E7E5E4 */
```

## Portfolio / Creative

```css
--color-primary: oklch(0.0% 0 0);          /* Exception: true black OK for creative */  /* #000000 */
--color-accent: <signature-color>; /* One bold personal brand color */
--color-background: oklch(99.5% 0.004 255);  /* #FFFFFF */
--color-foreground: oklch(0.0% 0 0);  /* #000000 */
--color-surface: oklch(97.0% 0 0);  /* #F5F5F5 */
--color-muted: oklch(55.6% 0 0);  /* #737373 */
```

## Gaming / Entertainment

```css
--color-primary: oklch(62.7% 0.233 303.9);          /* Vivid purple */  /* #A855F7 */
--color-accent: oklch(65.6% 0.212 354.3);           /* Hot pink */  /* #EC4899 */
--color-background: oklch(14.7% 0.011 285.0);  /* #0A0A0F */
--color-foreground: oklch(98.4% 0.003 247.9);  /* #F8FAFC */
--color-surface: oklch(21.0% 0.006 285.9);  /* #18181B */
--color-success: oklch(72.3% 0.192 149.6);  /* #22C55E */
--color-border: oklch(27.4% 0.005 286.0);  /* #27272A */
```

---

## Forbidden Color Patterns

1. `#000000` as background/surface for non-creative contexts → use `#0F1419` or `#0A0A0F`
2. `#FFFFFF` as page background → use `#F8FAFC`, `#FAFAFA`, or `#FAFAF9`
3. Purple→Pink→Blue gradient unless brand-specified (the "AI gradient")
4. Neon glows or outer box-shadows as decorative effect
5. Warm/cool gray mixing in same palette (pick one temperature)
6. Red-green only indicators (always pair with icon or text)

## Contrast Requirements

| Context | Minimum ratio |
|---------|--------------|
| Normal text (< 18px) | 4.5:1 (WCAG AA) |
| Large text (≥ 18px bold or 24px) | 3:1 (WCAG AA) |
| UI components/borders | 3:1 |
| Target for healthcare/accessibility | 7:1 (WCAG AAA) |

## Shadow System

```css
--shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
--shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
--shadow-md: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
--shadow-lg: 0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.05);
--shadow-xl: 0 20px 40px rgba(0,0,0,0.1);
/* taste-skill diffusion shadow: */
--shadow-diffuse: 0 20px 40px -15px rgba(0,0,0,0.05);
```

Use diffusion shadows (wide spread, low opacity) — never sharp drop shadows.
