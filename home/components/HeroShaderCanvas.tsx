"use client";

import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import * as THREE from "three";

export interface HeroShaderCanvasProps {
  /** Freezes the render loop entirely rather than removing the scene — one
      frame still paints, it just never advances on its own
      (`skills/threejs-3d/SKILL.md`'s reduced-motion rule: keep rendering,
      just don't move unprompted). Set from `useReducedMotion()` by
      `HeroBackground`. */
  reduced: boolean;
}

/**
 * Ashima Arts / Ian McEwan `snoise` (3D simplex noise, MIT) — the reference
 * `skills/threejs-3d/references/threejs-advanced.md` points to for anything
 * past a single sine term. Vertex shader displaces a subdivided plane with
 * it; fragment shader mixes the two OKLCH-sourced tokens along that
 * displacement and the plane's own V coordinate.
 */
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;
  varying float vElevation;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    float mouseDist = distance(uv, uMouse);
    // Halved from 0.12 — the pointer warp read as too interactive/gimmicky
    // at full strength; still present, just an ambient nudge now rather
    // than something that visibly chases the cursor.
    float mouseBump = smoothstep(0.5, 0.0, mouseDist) * 0.06;
    float elevation = snoise(vec3(pos.xy * 0.6, uTime * 0.08)) * 0.35 + mouseBump * sin(uTime * 0.6);
    pos.z += elevation;
    vElevation = elevation;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  uniform float uScrollProgress;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    float mixFactor = clamp(vUv.y + vElevation * 0.6, 0.0, 1.0);
    vec3 color = mix(uColorB, uColorA, mixFactor);
    // Scrolling past the hero cools the gradient toward uColorB — already
    // the page's own neutral background token, not a new colour — rather
    // than rotating hue. This palette has no cold/blue member, so "cooling"
    // here means falling chroma, not a different hue family. Capped at 0.6
    // so it settles into a quieter version of the same gradient, never
    // flattens to the bare background.
    vec3 cooled = mix(color, uColorB, uScrollProgress * 0.6);
    gl_FragColor = vec4(cooled, uOpacity);
  }
`;

/** Reads a real design token at runtime rather than duplicating its value —
    falls back to that same token's own literal from `tokens.css` only for
    the SSR/no-window edge, never a hex shortcut (`3D-05` /
    `skills/threejs-3d/SKILL.md`: no raw hex in `THREE.Color`). */
function readColorVar(name: string, fallback: string): THREE.Color {
  if (typeof window === "undefined") return new THREE.Color(fallback);
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(value || fallback);
}

/**
 * Raw `three` — not React Three Fiber — despite `skills/threejs-3d/SKILL.md`'s
 * default ("write R3F, not raw Three.js"). This is a measured deviation, not
 * a preemptive one: an R3F build of this exact scene (Canvas + one
 * shaderMaterial plane, no drei) shipped a lazy chunk that gzipped to ~174KB
 * — R3F's reconciler needs a generic catalog covering most of THREE's export
 * surface to support arbitrary JSX tags, which defeats tree-shaking even for
 * a one-mesh scene. That is more than 3x the brief's ">50KB, find a lighter
 * alternative" ceiling. A manual scene touching only the eight THREE classes
 * this needs (`Scene`, `PerspectiveCamera`, `WebGLRenderer`, `PlaneGeometry`,
 * `ShaderMaterial`, `Color`, `Vector2`, `Mesh`, `Clock`) tree-shakes far
 * better. The pattern-level rules `skills/threejs-3d/SKILL.md` states as
 * constraint ids are followed by hand below, since they're independent of
 * which API expresses them: dpr capped at 2 (3D-01), geometry/material built
 * once and disposed on unmount (3D-03), colour read from an OKLCH token
 * (3D-05), a delta from `THREE.Clock`, never a frame counter (3D-06), no
 * `setTimeout` anywhere in the loop (3D-07).
 */
export function HeroShaderCanvas({ reduced }: HeroShaderCanvasProps): ReactElement {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(dpr);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
    camera.position.z = 1;

    // Built once (3D-03) — recreating a ShaderMaterial every frame would
    // recompile the GLSL program.
    const uniforms = {
      uTime: { value: 0 },
      uColorA: { value: readColorVar("--color-accent", "oklch(55% 0.18 45)") },
      uColorB: { value: readColorVar("--color-bg-page", "oklch(98% 0.008 80)") },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uOpacity: { value: 0.18 },
      uScrollProgress: { value: 0 },
    };
    const geometry = new THREE.PlaneGeometry(1, 1, 48, 48);
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const resize = (): void => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const vFov = (camera.fov * Math.PI) / 180;
      const visibleHeight = 2 * Math.tan(vFov / 2) * camera.position.z;
      mesh.scale.set(visibleHeight * camera.aspect, visibleHeight, 1);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    // Cursor-driven effects gated behind a real pointer, per
    // `skills/animations/references/motion-budget.md` — a touch device
    // never attaches this listener, and reduced motion never does either.
    const mouseTarget = { x: 0.5, y: 0.5 };
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onPointerMove = (e: PointerEvent): void => {
      mouseTarget.x = e.clientX / window.innerWidth;
      mouseTarget.y = 1 - e.clientY / window.innerHeight;
    };
    if (!reduced && fine.matches) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    // Scroll-linked cooling target — how far the viewport has moved through
    // the hero's own height, 0 at rest, 1 a full hero-height past it. Read
    // straight from the host's own bounding rect rather than a passed-down
    // prop: the effect is purely local to this scene, so there's nothing to
    // plumb through `Hero.tsx`/`HeroBackground.tsx`. Not attached at all
    // under reduced motion, so `uScrollProgress` simply never leaves 0.
    let scrollTarget = 0;
    const onScroll = (): void => {
      const rect = host.getBoundingClientRect();
      scrollTarget = rect.height > 0 ? Math.min(Math.max(-rect.top / rect.height, 0), 1) : 0;
    };
    if (!reduced) {
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    const clock = new THREE.Clock();
    let rafId: number | null = null;
    let cancelled = false;

    const tick = (): void => {
      if (cancelled) return;
      const delta = clock.getDelta(); // delta-driven, never a frame counter (3D-06)
      uniforms.uTime.value += delta;
      uniforms.uMouse.value.lerp(new THREE.Vector2(mouseTarget.x, mouseTarget.y), 0.05);
      uniforms.uScrollProgress.value += (scrollTarget - uniforms.uScrollProgress.value) * 0.08;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };

    if (reduced) {
      renderer.render(scene, camera); // one static frame — the scene still renders, it just never moves.
    } else {
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [reduced]);

  return <div ref={hostRef} className="h-full w-full" />;
}

export default HeroShaderCanvas;
