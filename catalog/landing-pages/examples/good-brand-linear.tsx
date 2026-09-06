/**
 * good-brand-linear.jsx — Gold Standard Example
 * Brand archetype: Dark Precision (Linear.app profile)
 * OKLCH palette, command palette, sidebar nav, micro-interactions
 * Stack: React 19, Next.js, Tailwind v4, shadcn/ui
 *
 * Design signals:
 * - Near-black surface: oklch(12% 0.010 240)
 * - Accent: oklch(62% 0.190 255) — cool purple-blue
 * - 1px borders: oklch(25% 0.010 240)
 * - Inter allowed here (Linear's brand identity)
 * - Motion: snappy springs, 150ms max
 * - Typography: tight tracking on headings, tabular nums on data
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

// --- Tokens (Dark Precision archetype) ---
const tokens = {
  bg:         'oklch(10% 0.008 240)',
  surface:    'oklch(14% 0.010 240)',
  surfaceHi:  'oklch(18% 0.010 240)',
  border:     'oklch(22% 0.010 240)',
  borderHi:   'oklch(32% 0.010 240)',
  ink:        'oklch(92% 0.005 240)',
  inkMuted:   'oklch(55% 0.008 240)',
  accent:     'oklch(62% 0.190 255)',
  accentDim:  'oklch(62% 0.190 255 / 0.15)',
  red:        'oklch(58% 0.200 25)',
  green:      'oklch(65% 0.170 155)',
  yellow:     'oklch(78% 0.160 85)',
}

// --- Issues data ---
const issues = [
  { id: 'LIN-1247', title: 'Add keyboard shortcut for quick-switch', status: 'in-progress', priority: 'urgent', assignee: 'Kenji T.', team: 'Product', updated: '2h ago' },
  { id: 'LIN-1246', title: 'Fix command palette search ranking', status: 'done', priority: 'high', assignee: 'Ana Ngugi', team: 'Platform', updated: '4h ago' },
  { id: 'LIN-1245', title: 'Sidebar width persists across sessions', status: 'todo', priority: 'medium', assignee: 'Priya S.', team: 'Design', updated: '1d ago' },
  { id: 'LIN-1244', title: 'Workspace switcher flickers on load', status: 'in-progress', priority: 'high', assignee: 'Marco D.', team: 'Platform', updated: '1d ago' },
  { id: 'LIN-1243', title: 'Export to CSV missing labels column', status: 'todo', priority: 'low', assignee: 'Sara Kim', team: 'Product', updated: '2d ago' },
]
export type Issue = (typeof issues)[number]

const statusConfig = {
  'todo':        { label: 'Todo',        color: tokens.inkMuted,  dot: '○' },
  'in-progress': { label: 'In Progress', color: tokens.yellow,    dot: '◑' },
  'done':        { label: 'Done',        color: tokens.green,     dot: '●' },
}

const priorityConfig = {
  'urgent': { label: 'Urgent', color: tokens.red },
  'high':   { label: 'High',   color: tokens.yellow },
  'medium': { label: 'Medium', color: tokens.inkMuted },
  'low':    { label: 'Low',    color: tokens.inkMuted },
}

// --- Command Palette ---
function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (open) setQuery('')
  }, [open])

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const commands = [
    { label: 'Create new issue', shortcut: 'C', icon: '+' },
    { label: 'Go to inbox', shortcut: 'G I', icon: '📥' },
    { label: 'Switch workspace', shortcut: 'G W', icon: '⇄' },
    { label: 'View my issues', shortcut: 'G M', icon: '◉' },
    { label: 'Open settings', shortcut: ',', icon: '⚙' },
  ].filter(c => !query || c.label.toLowerCase().includes(query.toLowerCase()))

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
          style={{ backgroundColor: 'oklch(0% 0 0 / 0.6)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            style={{ backgroundColor: tokens.surface, borderColor: tokens.borderHi }}
            className="w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            role="dialog"
            aria-label="Command palette"
          >
            <div style={{ borderColor: tokens.border }} className="overscroll-contain flex items-center gap-3 px-4 py-3 border-b">
              <span style={{ color: tokens.inkMuted }} className="text-sm">⌘</span>
              <label htmlFor="cmd-search" className="sr-only">Command search</label>
              <input
                id="cmd-search"
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type a command or search…"
                spellCheck={false}
                style={{ background: 'transparent', color: tokens.ink }}
                className="flex-1 text-sm outline-none placeholder:opacity-40 focus:ring-0"
                aria-label="Command search"
                aria-describedby="cmd-hint"
              />
              <span id="cmd-hint" className="sr-only">
                {commands.length === 0 ? `No results for "${query}"` : `${commands.length} command${commands.length !== 1 ? 's' : ''} available`}
              </span>
              <kbd style={{ color: tokens.inkMuted, borderColor: tokens.border }}
                className="text-xs border rounded px-1.5 py-0.5">
                ESC
              </kbd>
            </div>
            <ul className="py-2 max-h-80 overflow-y-auto" role="listbox">
              {commands.map((cmd, i) => (
                <li key={i} role="option"
                  style={{ color: tokens.ink }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer
                    hover:bg-[oklch(98.4%_0.003_247.9)]/5 transition-colors"
                >
                  <span className="w-5 text-center opacity-60">{cmd.icon}</span>
                  <span className="flex-1">{cmd.label}</span>
                  <kbd style={{ color: tokens.inkMuted }} className="text-xs font-mono">{cmd.shortcut}</kbd>
                </li>
              ))}
              {commands.length === 0 && (
                <li style={{ color: tokens.inkMuted }} className="px-4 py-6 text-sm text-center">
                  No results for "{query}"
                </li>
              )}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// --- Sidebar ---
const navItems = [
  { icon: '◉', label: 'My issues', href: '#' },
  { icon: '📥', label: 'Inbox', href: '#', badge: 3 },
  { icon: '⊞', label: 'All issues', href: '#', active: true },
  { icon: '⊙', label: 'Cycles', href: '#' },
  { icon: '◫', label: 'Projects', href: '#' },
  { icon: '◈', label: 'Views', href: '#' },
]

function Sidebar({ onCommandPalette }: { onCommandPalette: () => void }) {
  return (
    <aside style={{ backgroundColor: tokens.surface, borderColor: tokens.border }}
      className="w-56 border-r flex flex-col h-[100dvh]">

      {/* Workspace header */}
      <div style={{ borderColor: tokens.border }}
        className="flex items-center gap-2 px-3 py-3 border-b">
        <div style={{ backgroundColor: tokens.accent }}
          className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold">
          H
        </div>
        <span style={{ color: tokens.ink }} className="text-sm font-medium">Halyard</span>
        <span style={{ color: tokens.inkMuted }} className="ml-auto text-xs">⌄</span>
      </div>

      {/* Search / Command */}
      <button
        onClick={onCommandPalette}
        style={{ color: tokens.inkMuted, borderColor: tokens.border }}
        className="flex items-center gap-2 mx-3 my-2 px-2.5 py-1.5 rounded-md border text-xs
          hover:bg-[oklch(98.4%_0.003_247.9)]/5 transition-colors text-left"
      >
        <span>⌘</span>
        <span>Search…</span>
        <kbd className="ml-auto font-mono">K</kbd>
      </button>

      {/* Nav */}
      <nav className="flex-1 px-2 py-1 overflow-y-auto">
        {navItems.map(item => (
          <a key={item.label} href={item.href}
            style={{
              color: item.active ? tokens.ink : tokens.inkMuted,
              backgroundColor: item.active ? tokens.accentDim : 'transparent',
            }}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm
              hover:bg-[oklch(98.4%_0.003_247.9)]/5 transition-colors mb-0.5"
          >
            <span className="text-xs w-4 text-center">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span style={{ backgroundColor: tokens.surfaceHi, color: tokens.inkMuted }}
                className="text-xs px-1.5 rounded-full">
                {item.badge}
              </span>
            )}
          </a>
        ))}
      </nav>

      {/* User */}
      <div style={{ borderColor: tokens.border }} className="border-t px-3 py-3">
        <div className="flex items-center gap-2">
          <div style={{ backgroundColor: tokens.accentDim, color: tokens.accent }}
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
            KM
          </div>
          <span style={{ color: tokens.inkMuted }} className="text-xs">krishnamodi241</span>
        </div>
      </div>
    </aside>
  )
}

// --- Issue Row ---
function IssueRow({ issue }: { issue: Issue }) {
  const status = statusConfig[issue.status as keyof typeof statusConfig]
  const priority = priorityConfig[issue.priority as keyof typeof priorityConfig]

  return (
    <motion.tr
      whileHover={{ backgroundColor: 'oklch(100% 0 0 / 0.02)' }}
      transition={{ duration: 0.1 }}
      style={{ borderColor: tokens.border }}
      className="border-b cursor-pointer"
    >
      <td className="py-2.5 pl-4 pr-2 w-8">
        <span style={{ color: status.color }} className="text-sm" aria-label={`Status: ${status.label}`}>
          {status.dot}
        </span>
      </td>
      <td className="py-2.5 pr-2 w-24">
        <span style={{ color: tokens.inkMuted }} className="text-xs font-mono tabular-nums">
          {issue.id}
        </span>
      </td>
      <td className="py-2.5 pr-4">
        <span style={{ color: tokens.ink }} className="text-sm">{issue.title}</span>
      </td>
      <td className="py-2.5 pr-4 hidden md:table-cell">
        <span style={{ color: priority.color }} className="text-xs">{priority.label}</span>
      </td>
      <td className="py-2.5 pr-4 hidden lg:table-cell">
        <span style={{ color: tokens.inkMuted }} className="text-xs">{issue.assignee}</span>
      </td>
      <td className="py-2.5 pr-4 hidden lg:table-cell">
        <span style={{ color: tokens.inkMuted }} className="text-xs">{issue.updated}</span>
      </td>
    </motion.tr>
  )
}

// --- Main App ---
export interface LinearAppProps {
  /** Skeleton state — drive from real data fetching; never an artificial delay. */
  isLoading?: boolean
}

export default function LinearApp({ isLoading = false }: LinearAppProps = {}) {
  const [cmdOpen, setCmdOpen] = useState(false)
  const mounted = !isLoading
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!mounted) return <div className="min-h-[100dvh] animate-pulse" style={{ backgroundColor: tokens.bg }} />
  if (error) return (
    <div role="alert" className="min-h-[100dvh] flex items-center justify-center p-8"
      style={{ backgroundColor: tokens.bg, color: tokens.red }}>
      <div className="text-center">
        <p className="font-semibold mb-2">Failed to load workspace</p>
        <p className="text-sm opacity-70">{error}</p>
        <button onClick={() => setError(null)}
          style={{ color: tokens.accent }}
          className="mt-4 text-sm underline focus-visible:ring-2 focus-visible:ring-offset-2">
          Try again
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ backgroundColor: tokens.bg, color: tokens.ink, fontFamily: 'Manrope, Inter, system-ui, sans-serif' }}
      className="flex h-[100dvh] overflow-hidden text-sm antialiased">

      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded"
        style={{ backgroundColor: tokens.accent, color: 'oklch(100% 0 0)' }}>
        Skip to content
      </a>

      <Sidebar onCommandPalette={() => setCmdOpen(true)} />

      <main id="main-content" className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <header style={{ backgroundColor: tokens.surface, borderColor: tokens.border }}
          className="flex items-center justify-between px-5 py-3 border-b shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold">
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(90deg, ${tokens.ink} 0%, ${tokens.inkMuted} 100%)` }}
              >All</span>
              <span style={{ color: tokens.ink }}> Issues</span>
            </h1>
            <span style={{ color: tokens.inkMuted }} className="text-xs tabular-nums">
              {issues.length} issues
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              style={{ color: tokens.inkMuted, borderColor: tokens.border }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs hover:bg-[oklch(98.4%_0.003_247.9)]/5 transition-colors"
            >
              ⊞ Group
            </button>
            <button
              style={{ color: tokens.inkMuted, borderColor: tokens.border }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs hover:bg-[oklch(98.4%_0.003_247.9)]/5 transition-colors"
            >
              ↕ Sort
            </button>
            <button
              style={{ backgroundColor: tokens.accent, color: 'oklch(100% 0 0)' }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium hover:opacity-90 transition-opacity"
            >
              + New issue
            </button>
          </div>
        </header>

        {/* Issues table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full" role="grid" aria-label="Issues list">
            <thead>
              <tr style={{ borderColor: tokens.border }} className="border-b">
                {['', 'ID', 'Title', 'Priority', 'Assignee', 'Updated'].map(h => (
                  <th key={h} scope="col"
                    style={{ color: tokens.inkMuted }}
                    className="py-2 pr-4 text-left text-xs font-medium first:pl-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {issues.map(issue => (
                <IssueRow key={issue.id} issue={issue} />
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  )
}
