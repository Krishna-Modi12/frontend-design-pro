# Three.js Fundamentals (R3F-First)

Route: `BUILD_3D`, `CREATE_3D_SCENE`, `CREATE_3D_COMPONENT` → +threejs-fundamentals. Shortcodes `[3d]` `[r3f]` `[threejs]`.
Load before: `threejs-advanced.md`, `threejs-interaction.md`.
Consolidates the former `three-js.md` + `react-three-fiber.md` plus geometry/materials/lighting/textures. **Write R3F, not raw Three.js** — drop to imperative `three` only for things R3F has no JSX form for.

## R3F stack

| Package | Role |
|---|---|
| `@react-three/fiber` | React renderer for Three.js — JSX becomes a scene graph |
| `@react-three/drei` | Helpers: `OrbitControls`, `Environment`, `useGLTF`, `useTexture`, `ContactShadows` |
| `@react-three/postprocessing` | `EffectComposer` and effects as components |
| `three` (r160+) | Core library — enums, math, `THREE.Color`, loaders |

## Scene setup

```tsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

export interface SceneProps { className?: string }

export function Scene({ className = "" }: SceneProps) {
  return (
    <div aria-label="Interactive 3D scene: a rotating cube on a neutral backdrop"
         role="img" className={`min-h-[100dvh] touch-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}                 {/* responsive pixel ratio — never window.devicePixelRatio */}
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} castShadow shadow-mapSize={[1024, 1024]} />
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={new THREE.Color("oklch(60% 0.185 276)")} />
        </mesh>
        <Environment preset="city" />
        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
}
```

**JSX → Three.js mapping.** `<Canvas>` = scene + camera + renderer + loop · `<mesh>` = `THREE.Mesh` · `<boxGeometry args={[w,h,d]}>` = `new THREE.BoxGeometry(w,h,d)` (constructor args go in `args`) · `<meshStandardMaterial>` = `THREE.MeshStandardMaterial` · `<group position={[x,y,z]} rotation={[rx,ry,rz]}>` for transforms. Any Three.js class is available as a lowercase JSX element.

**Dashed props** set nested properties: `shadow-mapSize={[1024,1024]}` → `light.shadow.mapSize`, `material-roughness={0.4}` → `mesh.material.roughness`.

## Geometry

Built-ins: `<boxGeometry>` `<sphereGeometry>` `<planeGeometry>` `<cylinderGeometry>` `<torusGeometry>` `<coneGeometry>` `<icosahedronGeometry>`.
Custom: `<bufferGeometry>` with `<bufferAttribute attach="attributes-position" .../>`, or build once with `useMemo(() => new THREE.BufferGeometry(), [])`.
Repeated geometry: `<instancedMesh args={[undefined, undefined, count]}>` + `useRef` + `setMatrixAt(i, matrix)` then `instanceMatrix.needsUpdate = true`. Above ~100 copies, instancing is mandatory — one draw call instead of N.

Segment counts are cost: a sphere at `args={[1, 64, 64]}` is 8k triangles; `[1, 32, 32]` is visually identical at small sizes and a quarter of the cost.

## Colors — OKLCH, never raw hex

`new THREE.Color("oklch(60% 0.185 276)")` — CSS color strings are parsed by `THREE.Color`, so the same tokens as the 2D UI apply. **Never `new THREE.Color(0x4f46e5)`** (constraint `3D-05`). For token-driven scenes, read the CSS custom property and pass it in:

```tsx
const brand = getComputedStyle(document.documentElement).getPropertyValue("--color-brand").trim();
<meshStandardMaterial color={new THREE.Color(brand)} />
```

## Performance

`dpr={[1, 2]}` (cap the ratio; retina at 3× quadruples fragment cost) · `frameloop="demand"` for static scenes, then `invalidate()` on change · `useFrame` for animation, **never** raw `requestAnimationFrame` (constraint `3D-02`) · `useMemo` for manually constructed geometries/materials (`3D-03`) · `<Instances>` / `<Detailed>` (LOD) from drei · R3F disposes automatically for JSX-declared objects; anything you `new` yourself gets `.dispose()` in an effect cleanup.

## Accessibility

A `<canvas>` is opaque to assistive tech. Wrap it in a container with `role="img"` and an `aria-label` describing what is shown (constraint `3D-04`). Provide keyboard access for camera control, and gate auto-rotation and camera animation behind `prefers-reduced-motion` — see `threejs-interaction.md`.

## 2 — LIGHTING & SHADOWS

### Light types quick-reference
| Light | Cost | Use case |
|-------|------|----------|
| `AmbientLight` | Free | Global fill — prevents pure black shadows |
| `HemisphereLight` | Free | Sky/ground gradient fill |
| `DirectionalLight` | Medium | Sun — parallel rays, can cast shadows |
| `PointLight` | Medium | Bulb — radiates in all directions |
| `SpotLight` | High | Cone — flashlight, stage lighting |
| `RectAreaLight` | High | Soft box light — requires `RectAreaLightHelper` |

### Production 3-point lighting rig
```js
// 1. Key light — main illumination + shadows
const key = new THREE.DirectionalLight(0xfff5e0, 2.0)  // warm white
key.position.set(5, 8, 5)
key.castShadow = true
key.shadow.mapSize.set(2048, 2048)  // higher = sharper shadows
key.shadow.camera.near = 0.5
key.shadow.camera.far  = 50
key.shadow.camera.left = key.shadow.camera.bottom = -10
key.shadow.camera.right = key.shadow.camera.top   =  10
key.shadow.bias = -0.001  // fixes shadow acne
scene.add(key)

// 2. Fill light — soften shadows
const fill = new THREE.DirectionalLight(0xe8f0ff, 0.6)  // cool blue
fill.position.set(-5, 3, -3)
scene.add(fill)

// 3. Rim light — edge definition / silhouette
const rim = new THREE.DirectionalLight(0xffffff, 0.8)
rim.position.set(0, 2, -8)
scene.add(rim)

// 4. Ambient — prevent total black
const ambient = new THREE.AmbientLight(0xffffff, 0.3)
scene.add(ambient)
```

### IBL — Image-Based Lighting (HDRI environment)
```js
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { PMREMGenerator } from 'three'

const pmrem = new PMREMGenerator(renderer)
pmrem.compileEquirectangularShader()

new RGBELoader()
  .setPath('/hdri/')
  .load('studio.hdr', (texture) => {
    const envMap = pmrem.fromEquirectangular(texture).texture
    scene.environment = envMap  // affects all MeshStandardMaterial
    scene.background  = envMap  // also use as background (optional)
    texture.dispose()
    pmrem.dispose()
  })
```

### R3F — Environment (drei shorthand)
```tsx
import { Environment } from '@react-three/drei'

// Preset HDRIs (no file needed):
// 'apartment' | 'city' | 'dawn' | 'forest' | 'lobby' | 'night' | 'park' | 'studio' | 'sunset' | 'warehouse'
<Environment preset="studio" />

// Custom HDR file:
<Environment files="/hdri/studio.hdr" />

// Background too:
<Environment preset="city" background backgroundBlurriness={0.5} />
```

### Shadow performance tips
```js
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap  // good quality/perf balance
// VSMShadowMap — softer but more expensive
// BasicShadowMap — fastest, hard edges

// Only cast/receive shadows on objects that need them
mesh.castShadow    = true   // emits shadow
ground.receiveShadow = true // shows shadow on surface
// Don't set both on every mesh — doubles draw calls
```

---## 4 — MATERIALS (PBR)

### Material decision tree
| Material | When to use |
|----------|-------------|
| `MeshBasicMaterial` | UI overlays, icons, unlit flat color |
| `MeshLambertMaterial` | Non-reflective surfaces, cheap diffuse |
| `MeshPhongMaterial` | Shiny plastic — fast but not physically accurate |
| `MeshStandardMaterial` | **Default for 90% of objects** — PBR, needs lights |
| `MeshPhysicalMaterial` | Glass, car paint, skin — adds clearcoat, transmission, iridescence |
| `ShaderMaterial` | Fully custom GLSL |
| `MeshMatcapMaterial` | Stylized renders, no lighting needed |

### MeshStandardMaterial — full config
```js
const material = new THREE.MeshStandardMaterial({
  color:         0x6366f1,    // base color
  metalness:     0.0,         // 0 = dielectric, 1 = metal
  roughness:     0.5,         // 0 = mirror, 1 = fully rough
  map:           colorTex,    // base color texture
  normalMap:     normalTex,   // bump detail
  normalScale:   new THREE.Vector2(1, 1),
  roughnessMap:  roughTex,
  metalnessMap:  metalTex,
  aoMap:         aoTex,       // ambient occlusion
  aoMapIntensity: 1.0,
  emissive:      0x000000,    // glow color (independent of lighting)
  emissiveIntensity: 0,
  envMapIntensity: 1.0,       // how much environment map affects surface
  transparent:   false,
  opacity:       1.0,
  side:          THREE.FrontSide,  // FrontSide | BackSide | DoubleSide
})
```

### MeshPhysicalMaterial — glass / car paint
```js
// Glass
const glass = new THREE.MeshPhysicalMaterial({
  color:            0xffffff,
  metalness:        0,
  roughness:        0,
  transmission:     1.0,     // 0–1: how transparent (requires WebGLRenderer with transmission)
  thickness:        0.5,     // refraction depth
  ior:              1.5,     // index of refraction (glass=1.5, water=1.33, diamond=2.42)
  transparent:      true,
  opacity:          0.1,
})

// Car paint with clearcoat
const carPaint = new THREE.MeshPhysicalMaterial({
  color:              0x2d1b69,
  metalness:          0.9,
  roughness:          0.1,
  clearcoat:          1.0,      // lacquer layer strength
  clearcoatRoughness: 0.05,
  iridescence:        0.3,      // rainbow sheen
  iridescenceIOR:     1.3,
})
```

### Dispose materials to prevent GPU memory leaks
```js
// On component unmount / scene destruction:
function disposeMaterial(material) {
  Object.values(material).forEach(value => {
    if (value?.isTexture) value.dispose()
  })
  material.dispose()
}

scene.traverse((obj) => {
  if (obj.isMesh) {
    obj.geometry.dispose()
    if (Array.isArray(obj.material)) {
      obj.material.forEach(disposeMaterial)
    } else {
      disposeMaterial(obj.material)
    }
  }
})
```

---## 7 — TEXTURES & UV MAPPING

### Texture settings — critical
```js
const tex = new THREE.TextureLoader().load('/tex/color.jpg')

// colorSpace — most important setting
tex.colorSpace = THREE.SRGBColorSpace   // for color/albedo maps
// tex.colorSpace = THREE.LinearSRGBColorSpace  // for normal/roughness/AO maps

// Wrapping
tex.wrapS = tex.wrapT = THREE.RepeatWrapping  // tile
// ClampToEdgeWrapping | MirroredRepeatWrapping

// Repeat (tiling)
tex.repeat.set(4, 4)

// Filter — how to sample between pixels
tex.magFilter = THREE.LinearFilter        // upscale — always Linear
tex.minFilter = THREE.LinearMipmapLinearFilter  // downscale — use mipmap

// Generate mipmaps (auto, enabled by default — disable for render targets)
tex.generateMipmaps = true

// Anisotropy — sharpness at grazing angles (check max first)
tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
```

### UV manipulation
```js
// Offset — shift texture position
tex.offset.set(0.5, 0)  // shift right by half

// Rotation (radians, around center)
tex.rotation = Math.PI / 4
tex.center.set(0.5, 0.5)  // rotate around center of texture

// Per-face UV channel (AO maps need UV2)
geometry.setAttribute('uv2', geometry.getAttribute('uv'))  // copy UV0 → UV2
material.aoMap = aoTexture
```

### Environment / cube maps
```js
import { CubeTextureLoader } from 'three'

// Cube map from 6 faces
const cubeLoader = new CubeTextureLoader()
cubeLoader.setPath('/cubemap/')
const envMap = cubeLoader.load(['px.jpg','nx.jpg','py.jpg','ny.jpg','pz.jpg','nz.jpg'])
scene.environment = envMap

// Equirectangular (single image) — use with PMREMGenerator
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
new RGBELoader().load('/studio.hdr', (hdr) => {
  hdr.mapping = THREE.EquirectangularReflectionMapping
  scene.environment = hdr
  scene.background  = hdr
})
```

### R3F — useTexture (drei)
```tsx
import { useTexture } from '@react-three/drei'

function TexturedMesh() {
  // Load multiple textures at once
  const [colorMap, normalMap, roughnessMap] = useTexture([
    '/textures/rock_color.jpg',
    '/textures/rock_normal.jpg',
    '/textures/rock_roughness.jpg',
  ])

  // Apply colorSpace
  colorMap.colorSpace = THREE.SRGBColorSpace

  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        map={colorMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
      />
    </mesh>
  )
}
```

---