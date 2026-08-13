# Three.js Interaction (Raycasting, Controls, Input)

Route: `BUILD_3D`, `ADD_3D_INTERACTION` → +threejs-interaction. Shortcode `[3d-interaction]`.
Load after: `threejs-fundamentals.md`.
Source: topic scope from `CloudAI-X/threejs-skills` (MIT); the R3F-first treatment is this pack's and is **not a verbatim extraction** — see `threejs-fundamentals.md` for what diverges and why.

## R3F pointer events (raycasting, done for you)

R3F raycasts every frame and dispatches DOM-like events on meshes — you rarely construct a `THREE.Raycaster` yourself.

```tsx
<mesh
  onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
  onPointerOut={() => setHovered(false)}
  onClick={(e) => { e.stopPropagation(); setSelected(id); }}
/>
```

`e.stopPropagation()` matters: without it every mesh behind the cursor along the ray also fires. Event payload: `e.object` (the hit mesh) · `e.point` (world-space hit) · `e.uv` (UV at the hit) · `e.distance` · `e.face`.

Hover cursor: `useCursor(hovered)` from drei swaps `document.body.style.cursor` — don't hand-roll it.

## Camera controls (drei)

| Control | Use for |
|---|---|
| `<OrbitControls enableDamping />` | General inspection — rotate, zoom, pan |
| `<PresentationControls>` | Product hero — constrained spin with snap-back |
| `<ScrollControls>` | Scroll-driven camera paths |
| `<CameraShake>` | Cinematic idle motion |
| `<MapControls>` / `<FlyControls>` | Top-down navigation / free flight |

Constrain rather than letting users get lost: `minPolarAngle` / `maxPolarAngle` stop the camera going under the floor, `minDistance` / `maxDistance` bound zoom, `enablePan={false}` for hero scenes.

## Selection

Keep selection state in React (`useState<string | null>`), never on the mesh. Signal it with `emissive` plus a scale bump — colour alone fails WCAG 1.4.1:

```tsx
<meshStandardMaterial
  color={base}
  emissive={selected ? new THREE.Color("oklch(60% 0.185 276)") : new THREE.Color("oklch(0% 0 0)")}
  emissiveIntensity={selected ? 0.6 : 0}
/>
```

Animate the bump with `useSpring` from `@react-spring/three` — physics reads better than a linear tween, and it interrupts cleanly when the user clicks again mid-animation.

## Touch and mobile

R3F pointer events cover touch with no extra code. Put `touch-action: none` on the Canvas *container* so the browser doesn't steal the gesture for scrolling. The 44×44px target rule does not apply to raycast hit areas (they're geometric), but it absolutely applies to any HTML overlay — buttons, legends, close controls.

## Accessibility

A canvas is a black box to screen readers. Non-negotiable:

- Container gets `role="img"` and an `aria-label` that **describes the content**, not the technology: "Product model, rotatable" beats "3D canvas".
- Anything selectable in 3D needs a parallel keyboard path — a visually-hidden list of buttons that sets the same state is the simplest honest solution.
- `OrbitControls` has `keys` and `keyPanSpeed`, but keyboard rotation still needs the canvas focusable (`tabIndex={0}`) and a visible focus ring on the container.
- **`prefers-reduced-motion`: disable auto-rotate, camera shake, and idle animation.** Render the scene, just don't move it on its own:

```tsx
const reduce = useReducedMotion();
useFrame((_, delta) => { if (!reduce) ref.current.rotation.y += delta * 0.2; });
<OrbitControls autoRotate={!reduce} />
```
- Offer a static fallback (rendered image or text summary) when WebGL is unavailable — `<Canvas fallback={…}>`.

## 1 — INTERACTION & RAYCASTING

### Mouse picking — click / hover object detection
```js
import * as THREE from 'three'

const raycaster = new THREE.Raycaster()
const pointer   = new THREE.Vector2()

function onPointerMove(e) {
  // Normalize to [-1, +1]
  pointer.x =  (e.clientX / window.innerWidth)  * 2 - 1
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
}

function onPointerDown(e) {
  raycaster.setFromCamera(pointer, camera)
  const hits = raycaster.intersectObjects(scene.children, true) // true = recursive
  if (hits.length > 0) {
    const hit = hits[0]
    console.log('Hit:', hit.object.name, 'at', hit.point)
    // hit.point — THREE.Vector3 world position of intersection
    // hit.distance — distance from camera
    // hit.face — face that was hit
    // hit.uv — UV coordinate at hit point
  }
}

window.addEventListener('pointermove', onPointerMove)
window.addEventListener('pointerdown', onPointerDown)
```

### R3F raycasting (onClick, onPointerOver)
```tsx
// R3F mesh events are built-in — no raycaster setup needed
function InteractiveMesh() {
  const [hovered, setHovered] = useState(false)
  const [active, setActive] = useState(false)

  return (
    <mesh
      onClick={(e) => {
        e.stopPropagation()  // prevent parent meshes from also receiving event
        setActive(v => !v)
      }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true)  }}
      onPointerOut={(e)  => { setHovered(false) }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? '#818cf8' : '#6366f1'} />
    </mesh>
  )
}
```

### Camera controls — OrbitControls (vanilla)
```js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping  = true      // smooth inertia
controls.dampingFactor  = 0.05
controls.enableZoom     = true
controls.minDistance    = 2
controls.maxDistance    = 20
controls.maxPolarAngle  = Math.PI * 0.85  // prevent going under ground
controls.autoRotate     = true
controls.autoRotateSpeed = 0.5

// Call in render loop:
function animate() {
  requestAnimationFrame(animate)
  controls.update()  // required when damping or autoRotate is on
  renderer.render(scene, camera)
}
```

### Drag and drop objects
```js
import { DragControls } from 'three/addons/controls/DragControls.js'

const draggable = [mesh1, mesh2]
const dragControls = new DragControls(draggable, camera, renderer.domElement)

dragControls.addEventListener('dragstart', (e) => {
  orbitControls.enabled = false  // disable orbit while dragging
  e.object.material.opacity = 0.7
})
dragControls.addEventListener('dragend', (e) => {
  orbitControls.enabled = true
  e.object.material.opacity = 1
})
```

### Touch input — normalize for mobile
```js
function getTouchPointer(e, canvas) {
  const rect = canvas.getBoundingClientRect()
  const touch = e.touches[0]
  return {
    x:  ((touch.clientX - rect.left) / rect.width)  * 2 - 1,
    y: -((touch.clientY - rect.top)  / rect.height) * 2 + 1,
  }
}
```

---