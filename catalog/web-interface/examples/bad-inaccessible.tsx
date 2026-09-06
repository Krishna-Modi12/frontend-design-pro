/**
 * ❌ BAD EXAMPLE: Inaccessible Component Patterns
 * Study every violation. Do NOT produce output like this.
 *
 * VIOLATIONS IN THIS FILE:
 * ❌ [A11Y] Nav uses <div> not <nav> — no landmark for screen readers
 * ❌ [A11Y] Logo link has no visible label — screen reader says "link" with no destination
 * ❌ [A11Y] Hamburger button has no aria-label — reads as "button" only
 * ❌ [A11Y] Hero image is missing alt text (alt="") — conveyed content lost
 * ❌ [A11Y] Heading hierarchy skipped: h1 → h4 (h2 and h3 never used)
 * ❌ [A11Y] Color-only error state: red border, no icon, no text message
 * ❌ [A11Y] Form inputs have no <label> — only placeholder text
 * ❌ [A11Y] Placeholder used as label substitute — disappears on type
 * ❌ [A11Y] Required fields not marked aria-required="true" or required attr
 * ❌ [A11Y] Error message not linked via aria-describedby
 * ❌ [A11Y] Custom checkbox built from <div> — not keyboard focusable
 * ❌ [A11Y] Modal has no role="dialog" + aria-modal — not announced by screen readers
 * ❌ [A11Y] Modal has no aria-labelledby — no accessible name
 * ❌ [A11Y] Focus not trapped inside modal — Tab escapes to background
 * ❌ [A11Y] Close button inside modal is a <span> — not keyboard reachable
 * ❌ [A11Y] Icon-only button has no aria-label — reads as empty button
 * ❌ [A11Y] Link styled as button with no role="button" — confusing to AT
 * ❌ [A11Y] focus:outline-none without replacement — keyboard users invisible
 * ❌ [A11Y] Decorative divider has role="img" (wrong) — should be aria-hidden
 * ❌ [A11Y] Live region not marked aria-live — dynamic toast goes unannounced
 * ❌ [A11Y] Table has no <caption> or aria-label — no accessible context
 * ❌ [A11Y] Table uses <div> rows — no row/cell semantics for screen readers
 */

import { useState } from 'react'

/** Anti-example: violations are in the A11Y rules, not the types. */
export type ToastState = string | null

export default function BadInaccessiblePage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    // ❌ No skip-to-main link — keyboard users must tab through entire nav
    <div className="min-h-[100dvh] bg-white">

      {/* ❌ <div> instead of <nav aria-label="Main"> — no navigation landmark */}
      <div className="flex items-center justify-between px-6 py-4 border-b">

        {/* ❌ Logo link: no aria-label, no text — reads as "link" */}
        <a href="/">
          <div className="h-8 w-24 bg-gray-200 rounded" />  {/* ❌ Image with no alt */}
        </a>

        <div className="flex items-center gap-4">
          <a href="/features">Features</a>
          <a href="/pricing">Pricing</a>
          {/* ❌ Icon-only button with no aria-label */}
          <button className="p-2 focus:outline-none">  {/* ❌ outline-none with no replacement */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              {/* ❌ SVG has no aria-hidden — screen reader reads path data */}
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ❌ <main> missing — no main landmark */}
      <div className="max-w-4xl mx-auto px-4 py-16">

        {/* ❌ Hero image with alt="" when image conveys meaning */}
        <img
          src="/hero-product-screenshot.jpg"
          alt=""  // ❌ Empty alt on a meaningful image
          className="w-full rounded-xl mb-12"
        />

        {/* ❌ h1 directly followed by h4 — skips h2 and h3 */}
        <h1 className="text-4xl font-bold mb-8">Account Settings</h1>

        {/* ❌ Form with no accessible labels */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!email.includes('@')) setError(true)
          }}
          className="space-y-4"
          // ❌ No aria-label or aria-labelledby on the form
        >
          <div>
            {/* ❌ No <label> — only placeholder as label substitute */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"  // ❌ Placeholder disappears on type
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                error ? 'border-red-500' : 'border-gray-300'  // ❌ Color-only error
              }`}
              // ❌ No aria-required="true" — screen reader unaware it's required
              // ❌ No aria-invalid={error} — error state not announced
              // ❌ No aria-describedby linking to error message
            />
            {/* ❌ Error message not linked to input via aria-describedby */}
            {error && (
              <p className="text-red-500 text-sm mt-1">
                Invalid email  {/* ❌ No role="alert" — not announced automatically */}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"  // ❌ No label
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>

          {/* ❌ Custom checkbox built from div — not focusable, no checked state */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {}}  // ❌ onClick div — not keyboard accessible
          >
            <div className="h-4 w-4 border border-gray-400 rounded" />  {/* ❌ Not a real checkbox */}
            <span>I agree to terms</span>  {/* ❌ No htmlFor linkage */}
          </div>

          {/* ❌ <h4> after <h1> — heading hierarchy skipped entirely */}
          <h4 className="text-sm font-semibold text-gray-700">
            Notification preferences
          </h4>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold focus:outline-none"
            // ❌ focus:outline-none with no focus-visible replacement
          >
            Save changes
          </button>
        </form>

        {/* ❌ Toast: not in aria-live region — dynamic content invisible to AT */}
        {toast && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg">
            {/* ❌ No role="status" or aria-live="polite" */}
            {toast}
          </div>
        )}

        {/* ❌ Decorative divider with wrong role */}
        <div
          role="img"  // ❌ Should be aria-hidden="true" — it's decorative
          className="my-8 h-px bg-gray-200"
        />

        {/* ❌ Table built from divs — no table semantics */}
        <div>
          {/* ❌ No <caption> or aria-label — no context for screen readers */}
          <div className="flex font-semibold text-sm text-gray-600 border-b pb-2 mb-2">
            <div className="flex-1">Name</div>
            <div className="flex-1">Date</div>
            <div className="flex-1">Status</div>
          </div>
          {[
            { name: 'Invoice #1042', date: 'Mar 12, 2026', status: 'Paid' },
            { name: 'Invoice #1041', date: 'Feb 10, 2026', status: 'Pending' },
          ].map((row) => (
            // ❌ div rows — screen reader cannot navigate by row/column
            <div key={row.name} className="flex py-2 border-b text-sm">
              <div className="flex-1">{row.name}</div>
              <div className="flex-1">{row.date}</div>
              {/* ❌ Status color-coded only — colorblind users lose the signal */}
              <div className={`flex-1 ${row.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                {row.status}
              </div>
            </div>
          ))}
        </div>

        {/* ❌ Link styled as button — no role="button", confusing to AT */}
        <a
          href="#open-modal"
          onClick={(e) => { e.preventDefault(); setModalOpen(true) }}
          className="mt-8 inline-block bg-gray-800 text-white px-6 py-3 rounded-lg font-medium"
          // ❌ Should be <button>, or at minimum role="button" + keyboard handler
        >
          Open settings modal
        </a>

      </div>

      {/* ❌ Modal: no role="dialog", no aria-modal, no aria-labelledby */}
      {/* ❌ Focus not trapped — Tab key escapes to background page */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          // ❌ Click-outside handler missing — trap not implemented
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            // ❌ No role="dialog"
            // ❌ No aria-modal="true"
            // ❌ No aria-labelledby pointing to the modal title
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold">Delete account</h4>  {/* ❌ h4 in modal, not h2 */}
              {/* ❌ <span> as close button — not keyboard reachable */}
              <span
                onClick={() => setModalOpen(false)}
                className="cursor-pointer text-gray-500 hover:text-gray-800"
                // ❌ No role="button", no tabIndex, no onKeyDown
              >
                ✕
              </span>
            </div>
            <p className="text-gray-600 mb-6">
              This action cannot be undone.
            </p>
            <button
              onClick={() => { setModalOpen(false); showToast('Account deleted') }}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold focus:outline-none"
              // ❌ focus:outline-none — keyboard users can't see focus ring on confirm button
            >
              Yes, delete my account
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

/*
 * ─── WHAT TO DO INSTEAD ────────────────────────────────────────────────────
 *
 * LANDMARKS:
 *   <a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>
 *   <nav aria-label="Main navigation">
 *   <main id="main">
 *
 * FORM LABELS:
 *   <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email</label>
 *   <input id="email" aria-required="true" aria-invalid={error} aria-describedby="email-error" />
 *   <p id="email-error" role="alert" className="text-red-500 text-sm mt-1">{errorMsg}</p>
 *
 * CHECKBOXES: Use native <input type="checkbox"> — NEVER a div
 *   <input id="terms" type="checkbox" className="..." />
 *   <label htmlFor="terms">I agree to terms</label>
 *
 * HEADING HIERARCHY: h1 → h2 → h3 → h4, never skip levels
 *
 * FOCUS STYLES: Never outline-none without a replacement
 *   className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
 *
 * ICONS: Always aria-hidden="true" on decorative SVGs
 *   Icon-only buttons: <button aria-label="Close menu">
 *
 * MODALS:
 *   <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
 *   Use a focus trap hook (e.g. focus-trap-react or @radix-ui/react-dialog)
 *   Return focus to trigger element on close
 *
 * LIVE REGIONS:
 *   <div role="status" aria-live="polite" aria-atomic="true">{toast}</div>
 *   Keep the element in the DOM at all times — just update its content
 *
 * TABLES: Use semantic <table>, <thead>, <tbody>, <tr>, <th scope="col">, <td>
 *   <table aria-label="Invoices">
 *   Status colors: always pair with icon or text label for colorblind users
 *
 * COLOR-ONLY STATES:
 *   Don't rely on color alone. Use: icon + color + text
 *   <span aria-hidden="true">✓</span> Paid  (not just green text)
 */
