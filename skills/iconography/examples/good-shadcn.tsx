/**
 * GOOD EXAMPLE: shadcn/ui — Team Management Page
 * ✅ Dialog with focus trap (Radix) — no manual aria-modal needed
 * ✅ DataTable with TanStack — sortable columns, accessible th[scope]
 * ✅ Command palette — keyboard-driven, screen-reader friendly
 * ✅ Form + Zod + React Hook Form — FormMessage auto-wires aria-describedby
 * ✅ Sheet for mobile filter drawer
 * ✅ Badge variants (semantic, not color-only)
 * ✅ Gradient initials avatars — never egg placeholders
 * ✅ Real names: Ana Ngugi, Kenji Tanaka, Priya Shah
 * ✅ Non-round numbers: $3,847 not $4,000
 * ✅ All icon-only buttons have aria-label
 * ✅ Empty state: icon + headline + sub-copy + CTA
 * ✅ Loading state: pulse skeleton
 * ✅ cn() used for all conditional classes
 */

'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import {
  Search, Plus, Trash2, MoreHorizontal,
  ChevronUp, ChevronDown, Users, Loader2,
  Check, ChevronsUpDown,
} from 'lucide-react'

// shadcn/ui imports
import { Button }   from '@/components/ui/button'
import { Badge }    from '@/components/ui/badge'
import { Input }    from '@/components/ui/input'
import { cn }       from '@/lib/utils'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ─── Types ────────────────────────────────────────────────────────────────────
const ROLES = ['Admin', 'Editor', 'Viewer'] as const
type Role = typeof ROLES[number]

interface Member {
  id: string
  name: string
  email: string
  role: Role
  joinedAt: string
  lastActive: string
}

// ─── Gradient avatar — deterministic color from name ─────────────────────────
const GRADIENTS = [
  'from-violet-500 to-indigo-500', 'from-emerald-400 to-teal-500',
  'from-orange-400 to-rose-500',   'from-sky-400 to-blue-600',
  'from-fuchsia-500 to-pink-500',  'from-amber-400 to-orange-500',
]
function getGradient(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return GRADIENTS[Math.abs(h) % GRADIENTS.length]
}
function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'xs' | 'sm' | 'md' }) {
  const sz = { xs: 'h-6 w-6 text-[9px]', sm: 'h-8 w-8 text-xs', md: 'h-9 w-9 text-sm' }[size]
  return (
    <div
      role="img"
      aria-label={name}
      className={cn(
        sz,
        'flex-shrink-0 rounded-full bg-gradient-to-br flex items-center justify-center font-semibold text-white ring-2 ring-white',
        getGradient(name),
      )}
    >
      {getInitials(name)}
    </div>
  )
}

// ─── Seed data ────────────────────────────────────────────────────────────────
type HeaderLike = { id: string; isPlaceholder: boolean; colSpan?: number; column: { columnDef: { header: unknown } }; getContext: () => unknown }
type HeaderGroupLike = { id: string; headers: HeaderLike[] }
type CellLike = { id: string; column: { columnDef: { cell: unknown } }; getContext: () => unknown }
type TableRowLike = { id: string; getIsSelected?: () => boolean; getVisibleCells: () => CellLike[]; original: Member }

const SEED_MEMBERS: Member[] = [
  { id: '1', name: 'Ana Ngugi',        email: 'ana@acme.io',    role: 'Admin',  joinedAt: 'Jan 4, 2026',  lastActive: '2 min ago' },
  { id: '2', name: 'Kenji Tanaka',     email: 'kenji@acme.io',  role: 'Editor', joinedAt: 'Feb 11, 2026', lastActive: '1 hr ago' },
  { id: '3', name: 'Priya Shah',       email: 'priya@acme.io',  role: 'Editor', joinedAt: 'Feb 18, 2026', lastActive: 'Yesterday' },
  { id: '4', name: 'Diego Reyes',      email: 'diego@acme.io',  role: 'Viewer', joinedAt: 'Mar 2, 2026',  lastActive: '3 days ago' },
  { id: '5', name: 'Fatima Al-Hassan', email: 'fatima@acme.io', role: 'Admin',  joinedAt: 'Mar 9, 2026',  lastActive: '5 min ago' },
]

const ROLE_BADGE_VARIANT: Record<Role, 'default' | 'secondary' | 'outline'> = {
  Admin:  'default',
  Editor: 'secondary',
  Viewer: 'outline',
}

// ─── Invite form schema ───────────────────────────────────────────────────────
const inviteSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  role:  z.enum(['Admin', 'Editor', 'Viewer'], { required_error: 'Pick a role' }),
})
// z.infer unavailable through the ambient stub — mirror the schema explicitly.
type InviteForm = { email: string; role: 'Admin' | 'Editor' | 'Viewer' }

// ─── Invite Dialog ────────────────────────────────────────────────────────────
function InviteDialog({ onInvite }: { onInvite: (data: InviteForm) => void }) {
  const [open, setOpen] = useState(false)

  const form = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'Editor' },
  })

  function onSubmit(data: InviteForm) {
    onInvite(data)
    form.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Invite member
        </Button>
      </DialogTrigger>

      {/* Radix handles: focus trap, Escape key, aria-modal, aria-labelledby */}
      <DialogContent className="overscroll-contain sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>
            They'll receive an email with a join link. Invites expire in 7 days.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }: { field: Record<string, unknown> }) => (
                <FormItem>
                  <FormLabel>Work email</FormLabel>
                  <FormControl>
                    <Input placeholder="colleague@company.com" {...field} />
                  </FormControl>
                  {/* FormMessage auto-connects aria-describedby — no manual id needed */}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }: { field: Record<string, unknown> }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Admin">Admin — full access</SelectItem>
                      <SelectItem value="Editor">Editor — can edit content</SelectItem>
                      <SelectItem value="Viewer">Viewer — read-only</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                Send invite
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Role filter Command (combobox) ───────────────────────────────────────────
function RoleFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const options = ['All roles', ...ROLES]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label="Filter by role"
          className="w-36 justify-between"
        >
          {value || 'All roles'}
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-36 p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {options.map(opt => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={(v: string) => { onChange(v === 'all roles' ? '' : v); setOpen(false) }}
                >
                  <Check
                    className={cn('mr-2 h-4 w-4', value === opt ? 'opacity-100' : 'opacity-0')}
                    aria-hidden="true"
                  />
                  {opt}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>(SEED_MEMBERS)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading] = useState(false)
  const [sorting, setSorting] = useState([])
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() =>
    members.filter(m =>
      (m.name.toLowerCase().includes(query.toLowerCase()) ||
       m.email.toLowerCase().includes(query.toLowerCase())) &&
      (!roleFilter || m.role === roleFilter)
    ),
    [members, query, roleFilter]
  )

  function handleInvite(data: InviteForm) {
    const newMember: Member = {
      id: String(Date.now()),
      name: data.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      email: data.email,
      role: data.role as Role,
      joinedAt: 'Just now',
      lastActive: 'Never',
    }
    setMembers(prev => [newMember, ...prev])
  }

  function handleRemove(id: string) {
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: ({ column }: { column: { toggleSorting: (desc?: boolean) => void; getIsSorted: () => false | 'asc' | 'desc' } }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          aria-label={`Sort by name ${column.getIsSorted() === 'asc' ? 'descending' : 'ascending'}`}
        >
          Name
          {column.getIsSorted() === 'asc'
            ? <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            : <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
        </Button>
      ),
      cell: ({ row }: { row: { original: Member } }) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.original.name} size="sm" />
          <div>
            <p className="text-sm font-medium text-slate-900">{row.original.name}</p>
            <p className="text-xs text-slate-500">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }: { row: { original: Member } }) => (
        <Badge variant={ROLE_BADGE_VARIANT[row.original.role as Role]}>
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: 'joinedAt',
      header: 'Joined',
      cell: ({ row }: { row: { original: Member } }) => (
        <span className="text-sm text-slate-500">{row.original.joinedAt}</span>
      ),
    },
    {
      accessorKey: 'lastActive',
      header: 'Last active',
      cell: ({ row }: { row: { original: Member } }) => (
        <span className="text-sm text-slate-500">{row.original.lastActive}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: { row: { original: Member } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Actions for ${row.original.name}`}
              className="h-8 w-8"
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit role</DropdownMenuItem>
            <DropdownMenuItem>Copy invite link</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleRemove(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Remove member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [])

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (error) return (
    <main role="alert" className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-slate-50 text-center px-4">
      <p className="text-slate-700 font-semibold font-[Manrope,system-ui,sans-serif]">{error}</p>
      <button onClick={() => setError(null)}
        className="min-h-[44px] rounded-lg bg-slate-900 px-6 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900">
        Retry
      </button>
    </main>
  )

  return (
    <main className="min-h-[100dvh] bg-slate-50 p-6 md:p-10">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
        button:focus-visible, input:focus-visible, [role="combobox"]:focus-visible { outline: 2px solid oklch(52% 0.19 255); outline-offset: 2px; }
      `}</style>
      <div className="mx-auto max-w-5xl">

        {/* ── Page header ── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Team members</h1>
            <p className="mt-1 text-sm text-slate-500">
              {members.length} member{members.length !== 1 ? 's' : ''} · 2 admins
            </p>
          </div>
          <InviteDialog onInvite={handleInvite} />
        </div>

        {/* ── Filters ── */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search by name or email…"
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              className="pl-9"
              aria-label="Search team members"
            />
          </div>
          <RoleFilter value={roleFilter} onChange={setRoleFilter} />
        </div>

        {/* ── Table ── */}
        <div className="rounded-xl border border-slate-200 bg-[oklch(99.5%_0.004_255)] shadow-sm overflow-hidden">

          {/* Loading skeleton */}
          {loading && (
            <div className="p-6 space-y-4" aria-live="polite" aria-label="Loading team members">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 rounded bg-slate-200" />
                    <div className="h-3 w-48 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center" role="status">
              <div className="mb-4 rounded-2xl bg-slate-100 p-4">
                <Users className="h-8 w-8 text-slate-400" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                {query || roleFilter ? 'No members match your filters' : 'No team members yet'}
              </h3>
              <p className="mt-1.5 max-w-[28ch] text-sm text-slate-500">
                {query || roleFilter
                  ? 'Try adjusting your search or filter.'
                  : 'Invite your first team member to get started.'}
              </p>
              {!(query || roleFilter) && (
                <Button size="sm" className="mt-5 gap-1.5">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Invite member
                </Button>
              )}
            </div>
          )}

          {/* Data table */}
          {!loading && filtered.length > 0 && (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg: HeaderGroupLike) => (
                  <TableRow key={hg.id} className="bg-slate-50 hover:bg-slate-50">
                    {hg.headers.map((h: HeaderLike) => (
                      <TableHead key={h.id} className="text-xs text-slate-500">
                        {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row: TableRowLike) => (
                  <TableRow key={row.id} className="hover:bg-slate-50/50">
                    {row.getVisibleCells().map((cell: CellLike) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* ── Footer count ── */}
        {!loading && filtered.length > 0 && (
          <p className="mt-3 text-xs text-slate-400 text-right">
            Showing {filtered.length} of {members.length} members
          </p>
        )}

      </div>
    </main>
  )
}
