# Three.js Advanced (Animation, Shaders, Post-Processing, Loaders)

Route: `BUILD_3D`, `ADD_3D_EFFECTS` → +threejs-advanced. Shortcodes `[shader]` `[postprocess]` `[webgl]`.
Load after: `threejs-fundamentals.md`. Interaction and camera control live in `threejs-interaction.md`.
Source: topic scope from `CloudAI-X/threejs-skills` (MIT); the R3F-first treatment is this pack's and is **not a verbatim extraction** — see `threejs-fundamentals.md` for what diverges and why.

## Animation

`useFrame` is the loop. It receives `(state, delta)` — **always drive motion by `delta`**, never by counting frames, or the scene runs at different speeds on 60 Hz and 120 Hz displays (constraint `3D-06`).

```tsx
useFrame((state, delta) => {
  ref.current.rotation.y += delta * 0.4;                    // frame-rate independent
  ref.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.2;
});
```

Physics-based UI motion: `useSpring` from `@react-spring/three` for scale/position reactions; it interrupts correctly when input arrives mid-flight. Skeletal animation from a loaded model:

```tsx
const { scene, animations } = useGLTF("/model.glb");
const { actions, names } = useAnimations(animations, scene);
useEffect(() => { actions[names[0]]?.reset().fadeIn(0.3).play(); }, [actions, names]);
```

Gate all idle/auto motion behind `useReducedMotion()`.

## Loaders

`useGLTF("/model.glb")` (Draco-aware) · `useTexture("/albedo.jpg")` · `useFBX` · `useKTX2` for compressed textures. All suspend, so they need a `<Suspense>` boundary — that boundary **is** your loading state:

```tsx
<Suspense fallback={<LoaderOverlay />}>
  <Model />
</Suspense>
```

`useProgress()` from drei gives `{ progress, active, item }` for a real progress bar. **Never fake loading with `setTimeout`** (constraint `3D-07`) — the skeleton shows for exactly as long as the asset takes.

Preload off the critical path with `useGLTF.preload("/model.glb")` at module scope. Wrap the boundary in an error boundary: a 404 on a `.glb` throws, and an unhandled throw inside Suspense blanks the page.

## 3 — ASSET LOADING (GLTF, TEXTURES, MODELS)

### LoadingManager — track all asset progress
```js
const manager = new THREE.LoadingManager()

manager.onStart   = (url, loaded, total) => console.log(`Loading ${url}`)
manager.onProgress = (url, loaded, total) => {
  const pct = (loaded / total * 100).toFixed(0)
  document.querySelector('#progress-bar').style.width = pct + '%'
}
manager.onLoad  = () => console.log('All assets loaded')
manager.onError = (url) => console.error(`Failed: ${url}`)

// Pass manager to all loaders:
const loader = new GLTFLoader(manager)
const texLoader = new THREE.TextureLoader(manager)
```

### GLTF / GLB loading
```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

// DRACO compression — required for large models
const draco = new DRACOLoader()
draco.setDecoderPath('/draco/')  // copy from node_modules/three/examples/jsm/libs/draco/

const loader = new GLTFLoader()
loader.setDRACOLoader(draco)

loader.load(
  '/models/product.glb',
  (gltf) => {
    const model = gltf.scene

    // Traverse and configure materials
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        // Upgrade to physical material for better PBR:
        // child.material = new THREE.MeshPhysicalMaterial({ ...child.material })
      }
    })

    scene.add(model)

    // Access animations
    const mixer = new THREE.AnimationMixer(model)
    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play()
    })
  },
  (progress) => {
    console.log((progress.loaded / progress.total * 100).toFixed(0) + '%')
  },
  (error) => console.error(error)
)
```

### R3F — useGLTF (drei)
```tsx
import { useGLTF, useAnimations } from '@react-three/drei'
import { useEffect, useRef } from 'react'

// Preload so model is ready before component mounts
useGLTF.preload('/models/product.glb')

function ProductModel() {
  const groupRef = useRef()
  const { scene, animations } = useGLTF('/models/product.glb')
  const { actions, names } = useAnimations(animations, groupRef)

  useEffect(() => {
    // Play first animation
    actions[names[0]]?.play()
  }, [actions, names])

  return (
    <primitive
      ref={groupRef}
      object={scene}
      castShadow
      receiveShadow
    />
  )
}
```

### Texture loading
```js
const loader = new THREE.TextureLoader()

// Load and configure
const colorMap = loader.load('/textures/rock_color.jpg', (t) => {
  t.colorSpace = THREE.SRGBColorSpace  // IMPORTANT for color textures
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(4, 4)
})

const normalMap = loader.load('/textures/rock_normal.jpg')  // linear space — no colorSpace flag
const roughnessMap = loader.load('/textures/rock_roughness.jpg')

const material = new THREE.MeshStandardMaterial({
  map:         colorMap,
  normalMap:   normalMap,
  roughnessMap: roughnessMap,
  roughness:   1.0,  // multiplied by roughnessMap value
  metalness:   0.0,
})
```

---## 6 — GLSL SHADERS

### ShaderMaterial basics
```js
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime:  { value: 0 },
    uColor: { value: new THREE.Color('#6366f1') },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      // Fresnel effect — glow on edges
      float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);

      // Animated gradient
      float wave = sin(vUv.x * 10.0 + uTime) * 0.5 + 0.5;

      vec3 color = mix(uColor, vec3(1.0), fresnel * 0.5 + wave * 0.1);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
})

// Update time uniform in render loop:
material.uniforms.uTime.value = clock.getElapsedTime()
```

### Vertex displacement shader
```glsl
// vertexShader — morphing blob
uniform float uTime;
uniform float uStrength;

varying vec2 vUv;
varying float vElevation;

// Classic Perlin noise (include noise function above main):
// float noise(vec3 p) { ... }

void main() {
  vUv = uv;
  vec3 pos = position;

  float n = noise(pos * 2.0 + uTime * 0.3);
  pos += normal * n * uStrength;
  vElevation = n;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

### R3F — shaderMaterial (drei helper)
```tsx
import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import { useRef } from 'react'

const WaveMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color('#6366f1') },
  // vertex
  `varying vec2 vUv;
   void main() {
     vUv = uv;
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }`,
  // fragment
  `uniform float uTime;
   uniform vec3 uColor;
   varying vec2 vUv;
   void main() {
     float wave = sin(vUv.x * 20.0 + uTime) * 0.5 + 0.5;
     gl_FragColor = vec4(uColor * wave, 1.0);
   }`
)

extend({ WaveMaterial })

function WaveMesh() {
  const matRef = useRef()
  useFrame(({ clock }) => {
    matRef.current.uTime = clock.getElapsedTime()
  })
  return (
    <mesh>
      <planeGeometry args={[2, 2, 32, 32]} />
      <waveMaterial ref={matRef} />
    </mesh>
  )
}
```

### GLSL utility functions (include in shaders)
```glsl
// Remap value from one range to another
float remap(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

// Smooth step — already in GLSL as smoothstep(edge0, edge1, x)

// Fresnel effect
float fresnel(vec3 viewDir, vec3 normal, float power) {
  return pow(1.0 - abs(dot(viewDir, normal)), power);
}

// Random (hash-based)
float random(vec2 st) {
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
}
```

---## 5 — POSTPROCESSING

### Setup EffectComposer (vanilla)
```js
import { EffectComposer }     from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass }         from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass }    from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass }         from 'three/addons/postprocessing/OutputPass.js'

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))

// Bloom
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.4,   // strength
  0.3,   // radius
  0.85   // threshold — only pixels above this brightness glow
)
composer.addPass(bloom)
composer.addPass(new OutputPass())  // always last — converts to sRGB

// In render loop: composer.render() instead of renderer.render()
function animate() {
  requestAnimationFrame(animate)
  composer.render()
}
```

### R3F postprocessing (@react-three/postprocessing)
```tsx
import { EffectComposer, Bloom, DepthOfField, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

<Canvas>
  <Scene />
  <EffectComposer>
    <Bloom
      luminanceThreshold={0.9}
      luminanceSmoothing={0.025}
      intensity={0.5}
      mipmapBlur
    />
    <DepthOfField
      focusDistance={0.01}
      focalLength={0.02}
      bokehScale={3}
    />
    <ChromaticAberration
      blendFunction={BlendFunction.NORMAL}
      offset={[0.0005, 0.0005]}
    />
    <Vignette eskil={false} offset={0.1} darkness={0.8} />
  </EffectComposer>
</Canvas>
```

### Performance: selective bloom (only certain objects glow)
```js
// Technique: render scene twice with two layers
const BLOOM_LAYER = 1
const bloomLayer = new THREE.Layers()
bloomLayer.set(BLOOM_LAYER)

// Mark objects to bloom
glowMesh.layers.enable(BLOOM_LAYER)

// Pass 1: render only bloom objects → bloom composer
// Pass 2: render full scene → normal composer
// Combine with additive blending
```

---## 8 — PERFORMANCE CHECKLIST

```
Geometry:
  [ ] Dispose geometry on unmount: geometry.dispose()
  [ ] Merge static meshes: BufferGeometryUtils.mergeGeometries()
  [ ] Use instancing for 100+ identical objects: InstancedMesh
  [ ] Reduce polygon count — use LOD for distant objects

Materials:
  [ ] Dispose materials and textures on unmount
  [ ] Share materials between meshes (don't create per-instance)
  [ ] Avoid transparent materials where possible (sorting cost)
  [ ] Use MeshBasicMaterial for unlit / UI elements

Renderer:
  [ ] dpr capped at 2: renderer.setPixelRatio(Math.min(dpr, 2))
  [ ] shadowMap.type = PCFSoftShadowMap (not VSM unless needed)
  [ ] Only castShadow / receiveShadow on objects that need it
  [ ] Use frustum culling (default on) — avoid disabling
  [ ] Pause render loop when tab hidden: document.addEventListener('visibilitychange')

Textures:
  [ ] Use power-of-2 sizes: 512, 1024, 2048, 4096
  [ ] Compress with KTX2 / Basis for web (use @loaders.gl/textures)
  [ ] Generate mipmaps = true for tiled textures
  [ ] Max texture size: 2048 for mobile, 4096 for desktop

R3F specific:
  [ ] frameloop="demand" — only render on change, not every frame
  [ ] <Preload all /> — warm up GPU with all assets before showing scene
  [ ] <AdaptiveDpr pixelated /> — auto-lower dpr when FPS drops
  [ ] <BVH> on large scenes for faster raycasting
```

---

## ROUTING IN SKILL (when to load this file)

Load `references/threejs-advanced.md` when request matches:
- "raycasting", "click on 3D object", "object picking", "hover 3D mesh"
- "OrbitControls", "DragControls", "camera controls"
- "GLTF", "GLB", "load 3D model", "DRACOLoader"
- "bloom", "postprocessing", "EffectComposer", "depth of field", "DOF", "vignette"
- "ShaderMaterial", "GLSL", "vertex shader", "fragment shader", "uniforms"
- "PBR material", "MeshPhysicalMaterial", "glass material", "transmission"
- "texture UV", "UV mapping", "environment map", "HDRI", "IBL"
- "shadow configuration", "PCFSoftShadowMap"
- `[webgl]` shortcode