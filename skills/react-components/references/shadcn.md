# shadcn/ui Reference — Frontend Design Pro
> shadcn/ui — copy-paste component library built on Radix UI primitives + Tailwind CSS.
> NOT a package you install as a dep — you own the code after `npx shadcn@latest add`.
> As of 2025: default registry at ui.shadcn.com. New York and Default style variants.

---

## WHAT SHADCN IS (AND ISN'T)

**IS:**
- Radix UI primitives (accessible by default) + Tailwind styling you control
- Copy-paste into `/components/ui/` — you own every line
- Style variants: `default` (rounded, softer) and `new-york` (sharper, tighter)
- CSS variables for theming: `--background`, `--foreground`, `--primary`, etc.
- Works with Tailwind v3 and v4

**IS NOT:**
- An npm dependency you import from `shadcn/ui` (wrong — no such package)
- A component you override with `!important` (just edit the file you own)
- A replacement for custom design — use as a foundation, not a ceiling

---

## INSTALLATION

```bash
# New project
npx shadcn@latest init

# Add specific components
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add table
npx shadcn@latest add command

# Add multiple at once
npx shadcn@latest add button card badge dialog form input label select textarea
```

During `init` you'll be asked:
- Style: `default` or `new-york`
- Base color: `slate`, `gray`, `zinc`, `neutral`, `stone`
- CSS variables: yes (always yes)

---

## CSS VARIABLE THEMING

shadcn uses CSS variables. Override in `globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;          /* hsl values, no hsl() wrapper */
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark values */
  }
}
```

**Brand override pattern** — change primary without touching components:
```css
:root {
  --primary: 239 84% 67%;          /* indigo-500 */
  --primary-foreground: 0 0% 100%;
  --ring: 239 84% 67%;             /* focus rings match brand */
  --radius: 0.75rem;               /* rounder cards */
}
```

---

## COMPONENT CATALOGUE (most-used)

### Button
```tsx
import { Button } from '@/components/ui/button'

// Variants: default | destructive | outline | secondary | ghost | link
<Button variant="default" size="sm">Save changes</Button>
<Button variant="outline" size="icon" aria-label="Delete item">
  <Trash2 className="h-4 w-4" />
</Button>
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Saving…
</Button>
```

**Sizes:** `default` (h-10) · `sm` (h-9) · `lg` (h-11) · `icon` (h-10 w-10)

---

### Dialog (Modal)
```tsx
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open settings</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here. Click save when done.
      </DialogDescription>
    </DialogHeader>
    {/* content */}
    <DialogFooter>
      <Button type="submit">Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

Radix handles: focus trap, Escape key, `aria-modal`, `aria-labelledby`, `aria-describedby`.

---

### Form (React Hook Form + Zod)
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form, FormControl, FormDescription,
  FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

type FormValues = z.infer<typeof schema>

export function ProfileForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', name: '' },
  })

  function onSubmit(values: FormValues) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@company.com" {...field} />
              </FormControl>
              <FormDescription>
                We'll send a confirmation to this address.
              </FormDescription>
              <FormMessage />  {/* auto-shows Zod error */}
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving…' : 'Save profile'}
        </Button>
      </form>
    </Form>
  )
}
```

**FormMessage auto-wires `aria-describedby`** — no manual id/linking needed.

---

### Command (Combobox / Search)
```tsx
import {
  Command, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Full combobox pattern
const [open, setOpen] = useState(false)
const [value, setValue] = useState('')

<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger asChild>
    <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
      {value ? options.find(o => o.value === value)?.label : 'Select option…'}
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-[200px] p-0">
    <Command>
      <CommandInput placeholder="Search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {options.map(option => (
            <CommandItem
              key={option.value}
              value={option.value}
              onSelect={(currentValue) => {
                setValue(currentValue === value ? '' : currentValue)
                setOpen(false)
              }}
            >
              <Check className={cn('mr-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')} />
              {option.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>
```

---

### DataTable (TanStack Table)
```tsx
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  flexRender, type ColumnDef, type SortingState,
} from '@tanstack/react-table'

// Column definitions
const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <Badge variant={row.original.status === 'paid' ? 'default' : 'secondary'}>{row.original.status}</Badge>,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Amount <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-right font-mono">${row.getValue<number>('amount').toLocaleString()}</div>,
  },
]

// Table component
function DataTable({ data }: { data: Invoice[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable({
    data, columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(hg => (
            <TableRow key={hg.id}>
              {hg.headers.map(h => (
                <TableHead key={h.id}>
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
```

---

### Sheet (Side Panel / Drawer)
```tsx
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open filters</Button>
  </SheetTrigger>
  <SheetContent side="right">  {/* side: top | right | bottom | left */}
    <SheetHeader>
      <SheetTitle>Filters</SheetTitle>
      <SheetDescription>Narrow down your results.</SheetDescription>
    </SheetHeader>
    {/* filter content */}
  </SheetContent>
</Sheet>
```

---

### Toast (Sonner — recommended over shadcn Toaster)
```tsx
// globals / layout
import { Toaster } from 'sonner'
<Toaster position="bottom-right" richColors expand />

// anywhere in app
import { toast } from 'sonner'
toast.success('Profile saved')
toast.error('Something went wrong')
toast.promise(saveProfile(), {
  loading: 'Saving…',
  success: 'Saved!',
  error: 'Save failed.',
})
```

---

### Badge
```tsx
import { Badge } from '@/components/ui/badge'
// Variants: default | secondary | destructive | outline
<Badge variant="secondary">Beta</Badge>
<Badge variant="destructive">Overdue</Badge>
```

---

### Select
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

<Select onValueChange={setValue}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select a role" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="admin">Admin</SelectItem>
    <SelectItem value="editor">Editor</SelectItem>
    <SelectItem value="viewer">Viewer</SelectItem>
  </SelectContent>
</Select>
```

---

### Separator
```tsx
import { Separator } from '@/components/ui/separator'
<Separator />                          // horizontal
<Separator orientation="vertical" />  // vertical
```

---

## cn() UTILITY

Always use `cn()` to merge classes safely:
```tsx
import { cn } from '@/lib/utils'

// lib/utils.ts (generated by shadcn init)
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
<div className={cn('base-classes', isActive && 'active-class', className)} />
```

---

## COMPONENT CUSTOMIZATION PATTERN

Don't fight the component — edit the file you own:

```tsx
// components/ui/button.tsx — your file, your rules
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        // ADD your own variant:
        brand: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
        // ...
      },
    },
  }
)
```

---

## SHADCN + TAILWIND v4 (CSS-first config)

```css
/* globals.css */
@import 'tailwindcss';

@theme {
  --color-primary: hsl(239 84% 67%);
  --color-primary-foreground: hsl(0 0% 100%);
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(222 84% 5%);
  --color-border: hsl(214 32% 91%);
  --color-ring: hsl(239 84% 67%);
  --radius: 0.75rem;
}
```

With Tailwind v4, shadcn variables map directly — no separate CSS variable block needed.

---

## WHEN TO USE SHADCN vs CUSTOM

| Use shadcn | Build custom |
|------------|-------------|
| Dialog / Sheet / Popover | Full-page immersive 3D scene |
| Form inputs with validation | Animated hero headline |
| DataTable with sorting/filtering | Bespoke scroll storytelling |
| Command palette / combobox | Custom data visualization |
| Navigation menu (Radix-based) | Marketing section layouts |
| Toast / Sonner | Canvas / WebGL components |

Rule: shadcn for **interaction complexity** (focus traps, keyboard nav, ARIA). Custom for **visual complexity** (layouts, animations, 3D).

---

## ROUTING IN SKILL (when to load this file)

Load `references/shadcn.md` when request matches:
- "shadcn", "use shadcn", "shadcn/ui", "add a dialog", "add a sheet", "combobox"
- "data table", "tanstack table", "form with validation", "command palette"
- "radix", "radix ui", "headless ui components"
- `[shadcn]` shortcode
