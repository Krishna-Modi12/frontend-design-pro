# Icons & Avatars Reference — Frontend Design Pro
> Standard: Lucide React for icons. Gradient initials for avatars. No egg icons. No generic placeholders.

---

## ICONS — LUCIDE REACT (DEFAULT)

Lucide React is the default icon library. Consistent stroke width, tree-shakeable, accessible.

**The default is overridable per aesthetic, and the reflex metaphor matters more than the set.** `skills/design-system/references/styles/minimalist.md` and `styles/soft.md` route to Phosphor or Radix within those directions — follow the style file when one is in play. What reads as AI-generated is not Lucide itself but the stock metaphor pulled from it (rocket for Launch, shield for Security); see the iconography row in `skills/landing-pages/references/redesign-framework.md`.

```bash
npm install lucide-react
```

### Basic usage
```tsx
import { ArrowRight, Check, X, ChevronDown, Loader2 } from 'lucide-react'

// Always set aria-hidden on decorative icons
<ArrowRight className="h-4 w-4" aria-hidden="true" />

// Icon-only buttons MUST have aria-label
<button aria-label="Close dialog" className="...">
  <X className="h-4 w-4" aria-hidden="true" />
</button>

// Meaningful icon (conveys info) — use title or aria-label on wrapper
<span role="img" aria-label="Success">
  <Check className="h-5 w-5 text-emerald-500" />
</span>
```

### Size scale (use these — never arbitrary px)
| Class | Size | Use case |
|-------|------|----------|
| `h-3 w-3` | 12px | Inline badges, micro-indicators |
| `h-4 w-4` | 16px | Body text icons, button icons ← **default** |
| `h-5 w-5` | 20px | Navigation, list items |
| `h-6 w-6` | 24px | Section headers, card icons |
| `h-8 w-8` | 32px | Feature icons |
| `h-10 w-10` | 40px | Empty state icons |
| `h-12 w-12` | 48px | Hero / illustration icons |

### Stroke width
```tsx
// Default stroke = 2 (Lucide default) — good for most use cases
<Check className="h-4 w-4" />

// Thinner — for large display sizes (48px+)
<ArrowRight className="h-12 w-12" strokeWidth={1.5} />

// Thicker — for small sizes or bold aesthetic
<X className="h-3 w-3" strokeWidth={2.5} />
```

### Common icon sets by context

**Navigation:**
```tsx
import { Home, LayoutDashboard, Settings, Bell, Search, Menu, X } from 'lucide-react'
```

**Actions:**
```tsx
import { Plus, Pencil, Trash2, Copy, Download, Upload, Share2, ExternalLink } from 'lucide-react'
```

**Status / feedback:**
```tsx
import { Check, CheckCircle2, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react'
// Loader2 spins: className="animate-spin"
```

**Data / dashboard:**
```tsx
import { TrendingUp, TrendingDown, BarChart3, LineChart, PieChart, Activity } from 'lucide-react'
```

**Communication:**
```tsx
import { Mail, MessageSquare, Phone, Video, Send } from 'lucide-react'
```

**Files:**
```tsx
import { File, FileText, Image, Paperclip, FolderOpen } from 'lucide-react'
```

---

## ICON BUTTON — ACCESSIBLE PATTERN

```tsx
// ✅ Correct — aria-label on button, aria-hidden on icon
<button
  aria-label="Delete invoice INV-1042"
  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none transition-colors"
>
  <Trash2 className="h-4 w-4" aria-hidden="true" />
</button>

// ✅ With tooltip (Radix)
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
<Tooltip>
  <TooltipTrigger asChild>
    <button aria-label="Download CSV" className="...">
      <Download className="h-4 w-4" aria-hidden="true" />
    </button>
  </TooltipTrigger>
  <TooltipContent>Download CSV</TooltipContent>
</Tooltip>

// ❌ Wrong — no label, icon text read by screen reader
<button onClick={handleDelete}>
  <Trash2 />
</button>
```

---

## ICON + TEXT BUTTON — SPACING

```tsx
// Leading icon (most common for actions)
<button className="inline-flex items-center gap-2 ...">
  <Plus className="h-4 w-4" aria-hidden="true" />
  Add team member
</button>

// Trailing icon (navigation, "go" actions)
<a href="/dashboard" className="inline-flex items-center gap-1.5 ...">
  Go to dashboard
  <ArrowRight className="h-4 w-4" aria-hidden="true" />
</a>

// Loading state — swap icon for spinner
<button disabled className="inline-flex items-center gap-2 ...">
  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
  Saving…
</button>
```

---

## STATUS ICONS — ALWAYS PAIR WITH TEXT OR COLOR

```tsx
// ❌ Color-only status (colorblind users lose the signal)
<span className="text-green-600">Paid</span>

// ✅ Icon + color + text
<span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
  Paid
</span>

// ✅ Badge with icon
<span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
  <Check className="h-3 w-3" aria-hidden="true" />
  Paid
</span>
```

---

## AVATARS — GRADIENT INITIALS (DEFAULT)

Never use egg/silhouette placeholders. Always use initials with deterministic gradient.

### Gradient avatar component
```tsx
// Deterministic color from name — same name always = same color
function getAvatarGradient(name: string): string {
  const gradients = [
    'from-violet-500 to-indigo-500',
    'from-emerald-400 to-teal-500',
    'from-orange-400 to-rose-500',
    'from-sky-400 to-blue-600',
    'from-fuchsia-500 to-pink-500',
    'from-amber-400 to-orange-500',
    'from-lime-400 to-emerald-500',
    'from-indigo-400 to-purple-600',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradients[Math.abs(hash) % gradients.length]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// Size variants
type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',    // default
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

interface AvatarProps {
  name: string
  src?: string
  size?: AvatarSize
  className?: string
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const gradient = getAvatarGradient(name)
  const initials = getInitials(name)
  const sizeClass = sizeClasses[size]

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-white ${className ?? ''}`}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={name}
      className={`${sizeClass} flex-shrink-0 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-semibold text-white ring-2 ring-white ${className ?? ''}`}
    >
      {initials}
    </div>
  )
}
```

### Avatar group (overlapping stack)
```tsx
interface AvatarGroupProps {
  users: Array<{ name: string; src?: string }>
  max?: number
  size?: AvatarSize
}

export function AvatarGroup({ users, max = 4, size = 'sm' }: AvatarGroupProps) {
  const visible = users.slice(0, max)
  const overflow = users.length - max

  return (
    <div
      className="flex -space-x-2"
      role="group"
      aria-label={`${users.length} team members`}
    >
      {visible.map((user) => (
        <Avatar
          key={user.name}
          name={user.name}
          src={user.src}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {overflow > 0 && (
        <div
          aria-label={`and ${overflow} more`}
          className={`${sizeClasses[size]} flex-shrink-0 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 ring-2 ring-white`}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}

// Usage
<AvatarGroup
  users={[
    { name: 'Ana Ngugi' },
    { name: 'Kenji Tanaka' },
    { name: 'Priya Shah' },
    { name: 'Diego Reyes' },
    { name: 'Fatima Al-Hassan' },
  ]}
  max={4}
  size="sm"
/>
```

---

## AVATAR USAGE PATTERNS

### Feed / activity item
```tsx
<div className="flex items-start gap-3">
  <Avatar name="Ana Ngugi" size="sm" />
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium text-slate-900">Ana Ngugi</p>
    <p className="text-sm text-slate-500 truncate">Merged PR #447 — Update auth flow</p>
  </div>
  <time className="text-xs text-slate-400 flex-shrink-0">2m ago</time>
</div>
```

### Table cell with avatar
```tsx
<td className="px-4 py-3">
  <div className="flex items-center gap-3">
    <Avatar name="Kenji Tanaka" size="xs" />
    <div>
      <p className="text-sm font-medium text-slate-900">Kenji Tanaka</p>
      <p className="text-xs text-slate-500">kenji@company.com</p>
    </div>
  </div>
</td>
```

### Comment thread
```tsx
<div className="flex gap-3">
  <Avatar name="Priya Shah" size="sm" className="mt-0.5 flex-shrink-0" />
  <div className="flex-1">
    <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">
      <p className="text-sm font-semibold text-slate-900 mb-1">Priya Shah</p>
      <p className="text-sm text-slate-700">Looks good to me. Ship it.</p>
    </div>
    <p className="text-xs text-slate-400 mt-1 pl-4">Today at 2:47 PM</p>
  </div>
</div>
```

---

## REAL NAMES TO USE (never John Doe / Jane Smith)

```
Ana Ngugi · Kenji Tanaka · Priya Shah · Diego Reyes · Fatima Al-Hassan
Marcus Webb · Yuki Okonkwo · Laila Espinoza · Arjun Mehta · Saoirse Flynn
Tobias Klein · Amara Osei · Rin Nakamura · Sofía Reyes · Elias Bergström
```

Diversity of origin, realistic, no generic Anglo placeholders.

---

## EMPTY STATE WITH ICON

```tsx
// Empty state — icon + headline + sub-copy + optional CTA
// Never just "No data found."
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="rounded-2xl bg-slate-100 p-4 mb-5">
    <FolderOpen className="h-8 w-8 text-slate-400" aria-hidden="true" />
  </div>
  <h3 className="text-base font-semibold text-slate-900">No invoices yet</h3>
  <p className="mt-1.5 text-sm text-slate-500 max-w-[32ch]">
    Create your first invoice to start tracking payments.
  </p>
  <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none">
    <Plus className="h-4 w-4" aria-hidden="true" />
    Create invoice
  </button>
</div>
```

---

## ROUTING IN SKILL (when to load this file)

Load `references/icons-avatars.md` when request matches:
- "icon", "icons", "lucide", "avatar", "initials", "profile picture"
- "icon button", "icon-only button", "empty state"
- "avatar group", "user list", "team members"
- "placeholder image", "user icon", "profile icon"
- `[icons]` shortcode
