/**
 * ❌ BAD EXAMPLE: The Generic AI Slop Component
 * Study every violation. Do NOT produce output like this.
 *
 * VIOLATIONS IN THIS FILE:
 * ❌ [LAYOUT] Equal 4-column card grid — every AI's first instinct, always wrong
 * ❌ [COLOR] Purple-pink-blue diagonal gradient background — the #1 AI cliché
 * ❌ [COLOR] Purple CTA button — overused, meaningless brand signal
 * ❌ [TYPE] Inter as headline font — tech-neutral, zero personality
 * ❌ [TYPE] Bold italic for no reason on the heading
 * ❌ [CONTENT] "Elevate your workflow" — top 5 most AI-generated headline phrases
 * ❌ [CONTENT] "John Doe", "Jane Smith" — placeholder names in visible UI
 * ❌ [CONTENT] "Lorem ipsum" body text — never acceptable in production output
 * ❌ [CONTENT] Round numbers: "10,000+ users", "100% satisfaction" — not credible
 * ❌ [CONTENT] "⭐⭐⭐⭐⭐" hardcoded 5-star ratings — fake and lazy
 * ❌ [CONTENT] Generic stock verbs: "Revolutionize", "Transform", "Empower"
 * ❌ [CODE] Inline styles mixed with Tailwind classes — inconsistent
 * ❌ [CODE] No semantic HTML — div soup, no article/section/nav/header
 * ❌ [CODE] Missing alt text on images (empty alt="")
 * ❌ [CODE] onClick on a <div> — not keyboard accessible
 * ❌ [CODE] Hardcoded px values instead of Tailwind spacing scale
 * ❌ [CODE] // TODO comments left in output — unfinished work
 * ❌ [CODE] Unused import (React) — leftover from copy-paste
 * ❌ [CODE] key={index} on list — masks reorder bugs
 * ❌ [A11Y] No focus-visible styles — keyboard users invisible
 * ❌ [A11Y] Color contrast: white text on #a855f7 — fails WCAG AA
 */

import React from 'react'  // ❌ Unused in React 17+

// ❌ Round numbers, hyperbolic copy, fake proof
const STATS = [
  { label: 'Happy Users', value: '10,000+' },
  { label: 'Satisfaction Rate', value: '100%' },
  { label: 'Countries', value: '50+' },
  { label: 'Awards Won', value: '25+' },
]
export type StatsItem = (typeof STATS)[number]

// ❌ John Doe + Lorem ipsum — placeholder names in final output
const TESTIMONIALS = [
  {
    name: 'John Doe',
    role: 'CEO at Company',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. This product is amazing!',
    stars: 5,
  },
  {
    name: 'Jane Smith',
    role: 'Marketing Manager',
    text: 'Lorem ipsum dolor sit amet. Truly transformed our workflow completely!',
    stars: 5,
  },
  {
    name: 'Bob Johnson',
    role: 'Developer',
    text: 'Lorem ipsum dolor sit amet consectetur. Revolutionary tool for our team!',
    stars: 5,
  },
  {
    name: 'Alice Brown',
    role: 'Designer',
    text: 'Lorem ipsum. Empowering solution that elevated our productivity immensely.',
    stars: 5,
  },
]

// ❌ Generic feature list with no specificity
const FEATURES = [
  { icon: '🚀', title: 'Fast Performance', desc: 'Lightning fast and optimized' },
  { icon: '🔒', title: 'Secure & Safe', desc: 'Enterprise grade security' },
  { icon: '💡', title: 'Smart Features', desc: 'AI-powered intelligence' },
  { icon: '📊', title: 'Analytics', desc: 'Powerful insights dashboard' },
]

export default function BadGenericPage() {
  return (
    // ❌ Inline style mixed with className; no semantic landmark
    <div style={{ fontFamily: 'Inter, sans-serif' }} className="min-h-[100dvh]">

      {/* ❌ Purple-pink-blue diagonal gradient — the canonical AI cliché */}
      {/* ❌ "Elevate your workflow" — forbidden phrase */}
      {/* ❌ "Transform", "Revolutionize" — banned generic verbs */}
      <div
        className="text-white text-center py-32 px-4"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' }}
      >
        <h1 className="text-6xl font-bold italic mb-4">  {/* ❌ Inter, italic for no reason */}
          Elevate Your Workflow
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Transform and revolutionize your business with our amazing platform.
          Empower your team to achieve more.
        </p>
        {/* ❌ Purple CTA — overused, low contrast */}
        <button
          className="px-8 py-4 rounded-full text-white font-bold text-lg"
          style={{ backgroundColor: '#a855f7' }}  // ❌ Fails WCAG AA contrast
        >
          Get Started Today!
        </button>
      </div>

      {/* ❌ Equal 4-column card grid — every AI's first layout choice */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Our Amazing Features</h2>
        <div className="grid grid-cols-4 gap-6">  {/* ❌ Rigid equal grid */}
          {FEATURES.map((f, index) => (  // ❌ key={index} — hides reorder bugs
            <div
              key={index}
              className="p-6 border rounded-lg text-center"
              onClick={() => console.log('clicked')}  // ❌ onClick on div — inaccessible
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ❌ Round number stats with no source or specificity */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">By The Numbers</h2>
          {/* ❌ Another equal 4-column grid */}
          <div className="grid grid-cols-4 gap-8 text-center">
            {STATS.map((s, index) => (  // ❌ index as key again
              <div key={index}>
                <div className="text-5xl font-bold text-purple-600 mb-2">{s.value}</div>
                <div className="text-gray-600">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ❌ John Doe testimonials with Lorem ipsum and 5-star emoji */}
      <div className="py-20 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        {/* ❌ Yet another equal 4-column grid */}
        <div className="grid grid-cols-4 gap-6 max-w-6xl mx-auto">
          {TESTIMONIALS.map((t, index) => (  // ❌ index key
            <div key={index} className="p-6 bg-white border rounded-lg shadow-sm">
              {/* ❌ Empty alt — would be caught by linter */}
              <img src="/avatar-placeholder.jpg" alt="" className="w-12 h-12 rounded-full mb-3" />
              {/* ❌ Hardcoded 5-star emoji — fake social proof */}
              <div className="text-yellow-400 mb-2">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 mb-3 text-sm">{t.text}</p>
              <div>
                <p className="font-bold">{t.name}</p>  {/* ❌ John Doe */}
                <p className="text-gray-400 text-sm">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ❌ TODO comment left in final output */}
      {/* TODO: add pricing section */}
      {/* TODO: add footer */}
      {/* TODO: make this responsive */}

      {/* ❌ Second purple gradient CTA section */}
      <div
        className="text-white text-center py-20 px-4"
        style={{ background: 'linear-gradient(135deg, #764ba2, #f093fb)' }}
      >
        <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-xl mb-8">Join 10,000+ satisfied customers today!</p>  {/* ❌ Round number */}
        <button className="bg-white text-purple-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100">
          Start Your Free Trial
        </button>
      </div>

    </div>
  )
}

/*
 * ─── WHAT TO DO INSTEAD ────────────────────────────────────────────────────
 *
 * LAYOUT:    Asymmetric grid — 8/12 + 4/12, or 2/3 + 1/3. Never equal.
 * COLOR:     Pick ONE brand color. Use it for 1 accent, not gradients everywhere.
 * FONT:      Bricolage Grotesque, DM Serif, Instrument Serif for headlines.
 *            Inter is fine for BODY TEXT only.
 * COPY:      Specific numbers (4,217 not 10,000+). Real names or initials only.
 *            Banned: "Elevate", "Transform", "Revolutionize", "Empower", "Streamline".
 * CODE:      semantic HTML (section/article/header/nav/main).
 *            Key by stable ID, never index. No onClick on divs.
 *            All images need meaningful alt text or aria-hidden if decorative.
 * A11Y:      focus-visible on every interactive element.
 *            Test color contrast before shipping (target ≥ 4.5:1 for text).
 */
