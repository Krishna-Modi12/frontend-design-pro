# Spline 3D Reference — Frontend Design Pro
> Spline (spline.design) — browser-based 3D design tool with real-time collaboration.
> Export interactive 3D scenes directly to React, Next.js, HTML, Webflow, and Framer.
> As of 2026: used by Scale AI, Resend, and enterprise teams for hero sections and product showcases.

---

## WHAT SPLINE IS GOOD FOR

Use Spline when:
- Hero section needs a "wow factor" 3D element without Three.js code
- Product 3D showcase / rotating model
- Interactive blob / morphing shape as background
- Particle field or abstract 3D scene
- Animated logo or 3D icon
- Mouse-tracking 3D interactive element
- Physics-based interactive playground

Do NOT use Spline when:
- Fully custom shader effects needed (use Three.js / R3F instead)
- Scene needs to change at runtime from code (limited programmatic control)
- Bundle size is critical without lazy loading (scene files are large)

---

## INSTALLATION

```bash
npm install @splinetool/react-spline @splinetool/runtime
```

For Next.js (SSR-safe):
```bash
# Same package — use the /next import path
npm install @splinetool/react-spline @splinetool/runtime
```

---

## SCENE URL FORMAT

Get the public URL from the Spline editor:
**Editor → Export → Public URL** → copies `https://prod.spline.design/[scene-id]/scene.splinecode`

Or: **Editor → Export → Code → React** → auto-generates component with scene URL.

URL format:
```
https://prod.spline.design/xxxxxxxxxxxxxxxx/scene.splinecode
```

To avoid CORS: self-host the `.splinecode` file. Download from editor and serve from your own domain.

---

## BASIC USAGE

```jsx
import Spline from '@splinetool/react-spline'

export default function Hero() {
  return (
    <div className="relative w-full h-screen">
      <Spline
        scene="https://prod.spline.design/YOUR_SCENE_ID/scene.splinecode"
        className="w-full h-full"
      />
    </div>
  )
}
```

---

## NEXT.JS INTEGRATION (SSR-SAFE)

```jsx
// Use /next import — auto-generates server-side placeholder
import Spline from '@splinetool/react-spline/next'

export default function Page() {
  return (
    <main>
      <Spline scene="https://prod.spline.design/YOUR_SCENE_ID/scene.splinecode" />
    </main>
  )
}
```

**Or lazy-load (recommended for performance):**
```jsx
'use client'
import { Suspense, lazy } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

function SplineScene() {
  return (
    <Suspense fallback={
      <div className="w-full h-full bg-slate-900 animate-pulse rounded-2xl" />
    }>
      <Spline scene="https://prod.spline.design/YOUR_SCENE_ID/scene.splinecode" />
    </Suspense>
  )
}
```

---

## COMPONENT PROPS

| Prop | Type | Description |
|------|------|-------------|
| `scene` | `string` | Scene URL from Spline editor (required) |
| `onLoad` | `(spline: Application) => void` | Fires when scene finishes loading |
| `renderOnDemand` | `boolean` | Only render when in viewport (default: `true`) — keep true for performance |
| `className` | `string` | CSS classes for canvas container |
| `style` | `object` | Inline styles |
| `id` | `string` | Canvas element ID |

---

## EVENT LISTENERS

```jsx
<Spline
  scene="https://prod.spline.design/YOUR_ID/scene.splinecode"
  onSplineMouseDown={(e) => {
    if (e.target.name === 'Button') handleClick()
  }}
  onSplineMouseHover={(e) => {
    if (e.target.name === 'Card') setHovered(true)
  }}
  onSplineMouseUp={(e) => {}}
  onSplineKeyDown={(e) => {}}
  onSplineKeyUp={(e) => {}}
  onSplineStart={(e) => {}}     // scene initialized
  onSplineScroll={(e) => {}}
/>
```

Available events: `onSplineMouseDown` · `onSplineMouseHover` · `onSplineMouseUp` · `onSplineKeyDown` · `onSplineKeyUp` · `onSplineStart` · `onSplineLookAt` · `onSplineFollow` · `onSplineScroll`

---

## APPLICATION API (onLoad callback)

```jsx
import { useRef } from 'react'
import Spline from '@splinetool/react-spline'

export default function Scene() {
  const splineRef = useRef()

  function onLoad(spline) {
    splineRef.current = spline

    // Find objects by name (name set in Spline editor)
    const cube = spline.findObjectByName('Cube')
    const logo = spline.findObjectByName('Logo')

    // Find by UUID
    const obj = spline.findObjectById('uuid-string')

    // Modify object properties
    cube.position.x += 100
    cube.scale.x = 2
    logo.rotation.y = Math.PI

    // Trigger Spline animations (events defined in editor)
    spline.emitEvent('mouseDown', 'Button')       // trigger animation
    spline.emitEventReverse('mouseDown', 'Button') // reverse animation

    // Set camera zoom
    spline.setZoom(1.2)
  }

  // Trigger animations from React events
  const handleClick = () => {
    splineRef.current?.emitEvent('mouseDown', 'MyButton')
  }

  return (
    <>
      <Spline scene="https://prod.spline.design/YOUR_ID/scene.splinecode" onLoad={onLoad} />
      <button onClick={handleClick}>Trigger animation</button>
    </>
  )
}
```

**emitEvent event names:** `mouseDown` · `mouseHover` · `mouseUp` · `keyDown` · `keyUp` · `start` · `lookAt` · `follow` · `scroll`

---

## COMMUNITY TEMPLATE CATEGORIES

Browse at: https://community.spline.design

### Hero / Landing
- Floating 3D logo or product mark with orbit animation
- Abstract morphing blob behind headline text
- 3D floating cards / feature showcase
- Particle field with mouse-responsive movement
- Isometric 3D interface mockup

### Blobs & Organic (#blob)
- Animated liquid blob with physics
- Morphing geometric shape as background
- Noise-displaced sphere
- Gradient blob with mouse tracking

### Morph (#morph)
- Shape-to-shape morph sequence
- Logo morph animation
- Letter morphing / type animation

### Interactive
- Draggable 3D objects with physics
- Click-to-explode product reveal
- Hover-responsive 3D cards
- Scroll-triggered camera flythrough

### Product Showcase
- 360° rotating product model
- Exploded view with hover highlights
- Color variant switcher with 3D update
- AR-preview-style floating product

### Abstract / Dark (#dark)
- Dark tunnel / portal
- Nebula / space environment
- Circuit board / tech grid
- Holographic UI panel

---

## HERO SECTION PATTERN (React + Spline)

```jsx
'use client'
import { Suspense, lazy } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-[#0F1419] overflow-hidden">
      {/* 3D scene as full-bleed background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={
          <div className="w-full h-full bg-gradient-to-br from-indigo-950 to-slate-900" />
        }>
          <Spline
            scene="https://prod.spline.design/YOUR_SCENE_ID/scene.splinecode"
            className="w-full h-full"
            renderOnDemand={true}
          />
        </Suspense>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-start justify-center min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-tighter leading-none">
          Your headline
        </h1>
        <p className="mt-6 text-xl text-white/60 max-w-[52ch]">
          Specific, concrete value proposition.
        </p>
        <a href="#start" className="mt-8 h-12 px-7 inline-flex items-center bg-white text-[#0F1419] font-semibold rounded-xl hover:bg-slate-100 transition-colors">
          Get started →
        </a>
      </div>
    </section>
  )
}
```

---

## SPLINE + FRAMER MOTION HYBRID

```jsx
'use client'
import { Suspense, lazy, useRef } from 'react'
import { motion } from 'framer-motion'

const Spline = lazy(() => import('@splinetool/react-spline'))

export default function ProductCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="relative bg-slate-900 rounded-3xl overflow-hidden h-96"
    >
      <Suspense fallback={<div className="w-full h-full animate-pulse bg-slate-800" />}>
        <Spline
          scene="https://prod.spline.design/YOUR_SCENE_ID/scene.splinecode"
          className="w-full h-full"
        />
      </Suspense>
      <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-white font-bold text-xl">Product Name</p>
      </div>
    </motion.div>
  )
}
```

---

## HTML / VANILLA EMBED

```html
<!-- Option 1: spline-viewer custom element -->
<script type="module" src="https://unpkg.com/@splinetool/viewer@1.9.82/build/spline-viewer.js"></script>
<spline-viewer url="https://prod.spline.design/YOUR_SCENE_ID/scene.splinecode"></spline-viewer>

<!-- Option 2: iframe embed -->
<iframe
  src='https://my.spline.design/YOUR_SCENE_ID/'
  frameborder='0'
  width='100%'
  height='100%'
  title="Interactive 3D scene"
  allow="autoplay"
></iframe>
```

---

## PERFORMANCE BEST PRACTICES

```jsx
// 1. ALWAYS lazy-load Spline — never in main bundle
const Spline = lazy(() => import('@splinetool/react-spline'))

// 2. Keep renderOnDemand: true (default) — pauses when off-screen

// 3. Show a meaningful fallback, not just a spinner
<Suspense fallback={
  <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl" />
}>
  <Spline scene="..." />
</Suspense>

// 4. Self-host .splinecode to avoid CORS issues and CDN latency
// Download from editor → serve from /public/scenes/hero.splinecode

// 5. Only one Spline scene per viewport — multiple scenes = frame rate drops

// 6. Optimize in Spline editor before export:
//    - Reduce polygon count on hero models
//    - Disable unused materials/lights
//    - Limit particle count to < 5000
//    - Use baked lighting instead of real-time where possible

// 7. Use prefers-reduced-motion to disable on accessibility preference
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
// If true: show static image fallback instead of Spline scene
```

---

## SELF-HOSTING .SPLINECODE FILES

To avoid CORS and CDN dependency:

```
1. In Spline editor: Export → Download (.splinecode file)
2. Place in /public/scenes/hero.splinecode
3. Reference as: scene="/scenes/hero.splinecode"
```

```jsx
<Spline scene="/scenes/hero.splinecode" />  // served from your own domain
```

---

## ROUTING IN SKILL (when to load this file)

Load `references/spline.md` when request matches:
- "spline", "3d hero", "interactive 3d background", "blob background"
- "spline scene", "splinecode", "react-spline"
- "3d product showcase", "floating 3d", "3d landing"
- User pastes a `prod.spline.design` URL
- `[spline]` shortcode used

---

## SPLINE vs THREE.JS DECISION

| Use Spline | Use Three.js / R3F |
|-----------|-------------------|
| Designer creates 3D in editor | Developer needs programmatic control |
| Quick embed, no 3D code | Custom shaders, postprocessing |
| Mouse/scroll interactivity is enough | Real-time data-driven 3D |
| Fast delivery, no 3D expertise | Full creative control |
| Hero section "wow factor" | Game-quality rendering |
| Self-contained scene | Scene depends on app state |

---

## ACCESSIBILITY NOTE

Spline canvas elements are purely decorative. Always:
```jsx
<div role="img" aria-label="Interactive 3D illustration of [describe what it shows]">
  <Spline scene="..." />
</div>
```
And ensure all text content is in the HTML layer, NOT inside the 3D scene.
