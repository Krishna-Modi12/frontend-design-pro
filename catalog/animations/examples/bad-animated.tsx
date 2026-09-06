/**
 * ❌ BAD EXAMPLE: Broken Animation Patterns
 * Study every violation. Do NOT produce output like this.
 *
 * VIOLATIONS IN THIS FILE:
 * ❌ [MOTION] ease-in on entrance animations — elements decelerate INTO view (wrong)
 * ❌ [MOTION] scale from 0 on entrance — creepy "popping" effect, not professional
 * ❌ [MOTION] No prefers-reduced-motion check — excludes vestibular disorder users
 * ❌ [MOTION] useEffect for GSAP — should use useGSAP (@gsap/react) for cleanup
 * ❌ [MOTION] No cleanup return in useEffect — animations persist after unmount
 * ❌ [MOTION] ScrollTrigger not killed on unmount — ghost triggers accumulate
 * ❌ [MOTION] Missing gsap.registerPlugin() — plugins silently fail in some builds
 * ❌ [MOTION] toggleActions with wrong word count — needs exactly 4 words
 * ❌ [MOTION] Multiple Spline scenes on one page — destroys frame rate
 * ❌ [MOTION] animate-bounce on primary UI element — distracting, unprofessional
 * ❌ [MOTION] CSS transition-property: color, background-color, border-color, box-shadow, transform, opacity — animates unexpected properties (layout thrash)
 * ❌ [MOTION] Infinite rotate on logo — users find this disorienting
 * ❌ [MOTION] duration: 0.1s — too fast to perceive, feels broken
 * ❌ [MOTION] duration: 5s for a button hover — far too slow
 * ❌ [CODE] GSAP used without @gsap/react — manual cleanup required but missing
 * ❌ [CODE] SplitText without onSplit() — breaks on font load / window resize
 * ❌ [CODE] Framer Motion whileHover scale 1.5 — aggressive, causes layout shift
 */

import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
// ❌ Missing: gsap.registerPlugin(ScrollTrigger, SplitText)

/** Anti-example: violations are in the ANIMATION rules, not the types. */
export type ToastState = string | null

export default function BadAnimatedPage() {
  const headlineRef = useRef(null)
  const cardsRef = useRef(null)
  const logoRef = useRef(null)

  // ❌ useEffect instead of useGSAP — no automatic cleanup
  useEffect(() => {
    // ❌ SplitText without autoSplit: true or onSplit() callback
    // Text breaks on resize and never re-splits
    const split = new SplitText(headlineRef.current, { type: 'chars' })

    gsap.from(split.chars, {
      opacity: 0,
      scale: 0,           // ❌ Scale from 0 — creepy pop-in
      ease: 'ease-in',    // ❌ ease-in on entrance — wrong direction of acceleration
      duration: 0.1,      // ❌ 0.1s — imperceptibly fast, feels broken
      stagger: 0.01,
    })

    // ❌ No prefers-reduced-motion check anywhere in this file
    ScrollTrigger.create({
      trigger: cardsRef.current,
      start: 'top bottom',
      // ❌ toggleActions with 3 words — needs exactly 4
      // correct: "play none none reset"
      toggleActions: 'play reverse',  // ❌ WRONG — only 2 words
      animation: gsap.from('[data-card]', {
        y: 200,            // ❌ Too large a travel distance — cards fly in from way below
        opacity: 0,
        scale: 0,          // ❌ Scale from 0 again
        ease: 'ease-in',   // ❌ ease-in on entrance again
        stagger: 0.5,      // ❌ 0.5s stagger — last card waits 2s before starting
        duration: 0.15,    // ❌ Way too fast for the scale + move combined
      }),
    })

    // ❌ Infinite rotation on the logo — disorienting
    gsap.to(logoRef.current, {
      rotation: 360,
      duration: 2,
      repeat: -1,
      ease: 'linear',
      // ❌ No prefers-reduced-motion guard
    })

    // ❌ No cleanup return — animations leak on unmount
    // Should return: () => { split.revert(); ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  return (
    <div className="min-h-[100dvh] bg-white">

      {/* ❌ animate-spin on a non-loading element — logo is not a spinner */}
      {/* ❌ No aria-hidden — screen reader announces "spinning" continuously */}
      <header className="flex items-center gap-3 p-6">
        <div
          ref={logoRef}
          className="h-10 w-10 rounded-xl bg-purple-500"
          // ❌ Infinite CSS spin on the logo — completely unprofessional
        />
        <span className="font-bold text-xl">MyApp</span>
      </header>

      <section className="px-8 py-24 text-center">
        <h1
          ref={headlineRef}
          className="text-6xl font-bold"
          // ❌ Will break on resize — SplitText chars don't re-split
        >
          Welcome to MyApp
        </h1>

        {/* ❌ animate-bounce on a primary button — looks broken, not intentional */}
        <button className="mt-8 animate-bounce bg-purple-600 text-white px-8 py-4 rounded-full font-bold">
          Get Started
        </button>

        {/* ❌ transition-property: color, background-color, border-color, box-shadow, transform, opacity — will animate width, height, padding unexpectedly */}
        <button
          className="mt-4 ml-4 bg-gray-200 text-gray-800 px-8 py-4 rounded-full"
          style={{ transition: 'all 5s ease' }}  // ❌ 5s hover transition — absurdly slow
        >
          Learn More
        </button>
      </section>

      {/* ❌ whileHover scale 1.5 — 50% bigger on hover causes massive layout shift */}
      {/* ❌ No AnimatePresence — exit animations won't work */}
      <div ref={cardsRef} className="grid grid-cols-3 gap-6 px-8 py-12">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            data-card
            whileHover={{ scale: 1.5 }}  // ❌ 1.5 is way too large (0.02–0.04 is good)
            whileTap={{ scale: 0 }}       // ❌ scale 0 on tap — element disappears
            transition={{ duration: 5 }} // ❌ 5s hover — unusable
            className="rounded-xl border p-8 text-center"
          >
            <h3 className="text-xl font-bold mb-2">Feature {i}</h3>
            <p className="text-gray-500">Some feature description here.</p>
          </motion.div>
        ))}
      </div>

      {/* ❌ Two Spline scenes on one page — GPU cannot handle it, FPS collapses */}
      {/* This is a comment showing the anti-pattern — don't import multiple scenes */}
      {/*
        <Spline scene="https://prod.spline.design/scene1.splinecode" />
        ... more content ...
        <Spline scene="https://prod.spline.design/scene2.splinecode" />
        ❌ Two Spline scenes = 2x GPU load = frame drops on mid-range devices
      */}

    </div>
  )
}

/*
 * ─── WHAT TO DO INSTEAD ────────────────────────────────────────────────────
 *
 * GSAP:
 *   - Use useGSAP(@gsap/react) — auto-cleans on unmount, no manual kill needed
 *   - Always call gsap.registerPlugin(ScrollTrigger, SplitText) before use
 *   - toggleActions: "play none none reset" — exactly 4 words
 *   - SplitText: add autoSplit: true + onSplit(self) { ... } callback
 *   - ease: 'power3.out' or 'expo.out' for entrances — objects decelerate OUT
 *   - ease: 'power3.in' only for exits — objects accelerate OUT of frame
 *   - Never ease-in an entrance. Never.
 *
 * MOTION AMOUNTS:
 *   - scale: from 0.94–0.96 (not 0)
 *   - y: from 24–48px (not 200px)
 *   - stagger: 0.06–0.12s (not 0.5s)
 *   - duration: 0.5–0.9s for entrances (not 0.1s or 5s)
 *   - whileHover scale: 1.02–1.04 max
 *
 * REDUCED MOTION:
 *   const mm = gsap.matchMedia()
 *   mm.add('(prefers-reduced-motion: reduce)', () => {
 *     gsap.set('[data-animate]', { opacity: 1, y: 0 })
 *   })
 *   mm.add('(prefers-reduced-motion: no-preference)', () => {
 *     // full animation here
 *   })
 *
 * SPLINE:
 *   - ONE scene per page maximum
 *   - Always lazy-load: const Spline = lazy(() => import(...))
 *   - Always wrap in <Suspense> with gradient fallback
 *   - renderOnDemand={true} — pauses when off-screen
 */
