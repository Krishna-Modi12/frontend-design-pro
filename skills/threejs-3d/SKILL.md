---
name: threejs-3d
description: 3D web experiences with React Three Fiber — scenes, geometry, materials, lighting, shaders, post-processing, model loading, raycasting.
version: "14.7.0"
core-deps:
  - core/component-api.md
  - core/accessibility-baseline.md
---

# Three.js / R3F

## When to Use
Anything 3D in the browser: scenes, models (GLTF/GLB), shaders, WebGL, post-processing, orbit/camera controls, raycasting and object selection, Spline embeds, particle systems, 3D heroes.

## Stack
React 19 · TypeScript strict · `@react-three/fiber` · `@react-three/drei` · `@react-three/postprocessing` · `three` r160+

## Core Rules
1. **Write R3F, not raw Three.js.** JSX is the scene graph: `<mesh>`, `<boxGeometry args={[w,h,d]}>`, `<meshStandardMaterial>`. Drop to imperative `three` only for enums, `THREE.Color` and types.
2. **Cap the pixel ratio** — `dpr={[1, 2]}`, never `window.devicePixelRatio`. Retina at 3× quadruples fragment cost.
3. **`useFrame((state, delta) => …)` is the loop.** Drive motion by `delta`, never a frame counter. Raw `requestAnimationFrame` in an R3F component is a defect.
4. **Colours are OKLCH** — `new THREE.Color("oklch(60% 0.185 276)")`. Never `new THREE.Color(0x4f46e5)`. Read CSS custom properties to share tokens with the 2D UI.
5. **Memoize anything you construct.** A `new THREE.BoxGeometry()` in a component body is rebuilt every render. `useMemo` it, or declare it as JSX and let R3F own the lifecycle.
6. **Suspense is the loading state.** `useGLTF`/`useTexture` suspend; wrap them and use `useProgress()` for a real progress bar. Never a `setTimeout` loading flag. Wrap the boundary in an error boundary — a 404 on a `.glb` throws.
7. **A canvas is opaque to assistive tech.** The container gets `role="img"` + an `aria-label` describing the *content*, or `aria-hidden="true"` if purely decorative. Selectable 3D objects need a parallel keyboard path.
8. **`prefers-reduced-motion` disables** auto-rotate, camera shake and idle animation — render the scene, just don't move it unprompted.
9. **`touch-action: none`** on the canvas container so gestures aren't stolen for scrolling.
10. **Instance above ~100 copies**; `frameloop="demand"` for static scenes; `<Detailed>` for LOD.

## Patterns
- **Scene shell** — `<Canvas>` with camera, ACES tone mapping, shadows, `<Environment>`, `<OrbitControls enableDamping>`.
- **Pointer selection** — `onPointerOver`/`onClick` with `e.stopPropagation()`, `useCursor` for hover, `emissive` + scale for selection.
- **Model + animation** — `useGLTF` → `useAnimations` → `reset().fadeIn(0.3).play()`.
- **Custom shader** — `<shaderMaterial>` with memoized uniforms, `uTime` advanced by `delta` in `useFrame`.
- **Post-processing** — `<EffectComposer>` wrapping `<Bloom>`/`<DepthOfField>`; composer wraps the scene, it doesn't replace it.

## Examples
`examples/good-3d-scene.tsx` · `examples/good-3d-interaction.tsx` · `examples/good-3d-loader.tsx` · `examples/good-3d-shader.tsx` · `examples/good-3d.tsx` (particles) · `examples/good-hero-spline.tsx` · `examples/bad-3d-practices.tsx` (anti-example).

## Reference Index
Load only for the specific task:

| Task | Load |
|---|---|
| Scene setup, geometry, materials, lighting, textures, perf | `references/threejs-fundamentals.md` |
| Animation, GLSL shaders, post-processing, loaders | `references/threejs-advanced.md` |
| Raycasting, camera controls, selection, 3D a11y | `references/threejs-interaction.md` |
| Spline scene embedding and fallbacks | `references/spline.md` |

## Constraints
`3D-01` Canvas declares `dpr` · `3D-02` no raw `requestAnimationFrame` · `3D-03` constructed geometry/material memoized · `3D-04` canvas container labelled or explicitly decorative · `3D-05` no raw hex in `THREE.Color` · `3D-06` delta-driven `useFrame` · `3D-07` Suspense loading, not `setTimeout` · plus the shared baseline (TypeScript strict, OKLCH, four states, reduced motion).
