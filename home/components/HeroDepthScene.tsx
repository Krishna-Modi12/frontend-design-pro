"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import * as THREE from "three";
import type { ReferenceRecord } from "../lib/data.types";

export interface HeroDepthSceneProps {
  /** Every `skills/*&#47;references/*.md` on disk, from `data.generated.json`.
      One stratum is built per record and scaled by its real token count, so
      the object's proportions are the reference tree's own. */
  references: ReferenceRecord[];
  /** Freezes the scene at its destination state — one frame is still rendered,
      the loop is simply never started, and no pointer/scroll listener is
      attached. `skills/threejs-3d/SKILL.md`'s reduced-motion rule: keep
      rendering, just don't move unprompted. */
  reduced: boolean;
  /** 0 → 1 across the pinned scroll range, written by `Hero.tsx`'s
      ScrollTrigger. Drives the camera's travel into the slab and the ignition
      of the one stratum a request loads. Stays 0 under reduced motion. */
  progressRef: React.MutableRefObject<number>;
}

/**
 * The hero's single object: the pack's reference corpus as one lit slab.
 *
 * One idea, and everything else is budget for it. There is no background
 * layer, no particle layer and no second effect — light, depth and a single
 * ignition are the whole vocabulary, and load, pointer and scroll all drive
 * this same object rather than adding devices beside it.
 *
 * **Raw `three`, not React Three Fiber.** The same measured deviation the
 * scene this replaced documented, and it survives the rewrite for the same
 * reason: an R3F build of a one-mesh scene shipped a lazy chunk gzipping to
 * ~174KB, because R3F's reconciler needs a generic catalog of THREE's export
 * surface to resolve arbitrary JSX tags and that defeats tree-shaking however
 * small the scene is. That is more than 3x this pass's own ">50KB, find a
 * lighter alternative" ceiling, and R3F would buy nothing here in any case —
 * the whole corpus is ONE `InstancedMesh`, one draw call. `skills/threejs-3d/
 * SKILL.md`'s constraint ids are followed by hand, independent of which API
 * expresses them: dpr capped at 2 (3D-01), geometry and material built once
 * and disposed on unmount (3D-03), colour read from an OKLCH token rather
 * than a hex literal (3D-05), a delta from `THREE.Clock` rather than a frame
 * counter (3D-06), no `setTimeout` anywhere in the loop (3D-07).
 *
 * The canvas is `aria-hidden`: it is decoration behind a real DOM `<h1>`, and
 * never the only copy of anything.
 */

/** The stratum that ignites. Deliberately not random and not an index: it is
    the reference this pack would itself load to build this page, which is the
    only choice that makes the ignition mean something rather than pick
    something. Falls back to the largest reference if it is ever renamed —
    `home/lib/data.generated.json` is regenerated from disk, so a rename shows
    up here as a silently different stratum rather than a crash. */
const IGNITED_SKILL = "landing-pages";
const IGNITED_NAME = "landing-patterns.md";

/** Thickness floor as a fraction of the slab, applied before renormalising.
    Eleven of the references sit under ~1,200 tokens and would otherwise
    render thinner than one device pixel — a stratum nobody can see is a file
    the object silently omits. Everything above the floor stays strictly
    proportional to its real token count. */
const MIN_SHARE = 0.005;

/** Slab dimensions in world units. */
const SLAB_HEIGHT = 4.7;
const SLAB_WIDTH = 2.85;
const SLAB_DEPTH = 1.15;
/** Share of each stratum's pitch left empty as the seam above it. */
const GAP_RATIO = 0.3;

const vertexShader = /* glsl */ `
  uniform float uReveal;
  uniform float uProgress;
  uniform float uHoverY;
  uniform float uHoverStrength;

  attribute float aIgnite;
  attribute float aNorm;

  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying float vIgnite;
  varying float vLit;
  varying float vHover;
  varying float vFade;

  void main() {
    // The ignited stratum lifts out of the stack, toward the reader, as the
    // pinned range advances. Every other instance is untouched.
    float lift = aIgnite * smoothstep(0.35, 0.85, uProgress);

    vec3 pos = position;
    pos.z += lift * 0.85;
    pos.x += lift * 0.22;

    vec4 world = instanceMatrix * vec4(pos, 1.0);
    vec4 mvPosition = modelViewMatrix * world;

    // Non-uniform instance scale skews the normal's length but not its axis
    // on an axis-aligned box, so a normalize() after the fact is exact here.
    vec3 n = normalize(mat3(instanceMatrix) * normal);
    vNormalW = normalize(normalMatrix * n);
    vViewDir = normalize(-mvPosition.xyz);

    vIgnite = aIgnite * smoothstep(0.3, 0.6, uProgress);

    // Load sweep: a front travelling bottom to top once, lighting each
    // stratum as it passes. uReveal runs 0 → 1 over the entrance.
    vLit = clamp((uReveal * 1.4 - aNorm) * 7.0, 0.0, 1.0);

    // Pointer proximity, in the slab's own normalised height so the reveal
    // tracks the strata rather than the screen.
    vHover = (1.0 - smoothstep(0.0, 0.09, abs(aNorm - uHoverY))) * uHoverStrength;

    // Strata that reach the near plane as the camera pushes in dissolve
    // instead of clipping through it.
    vFade = smoothstep(0.15, 1.1, -mvPosition.z);

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uAccent;
  uniform vec3 uInk;
  uniform vec3 uPaper;
  uniform float uOpacity;

  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying float vIgnite;
  varying float vLit;
  varying float vHover;
  varying float vFade;

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(vViewDir);

    // One key direction and one rim term — a lit object, not a light rig.
    vec3 L = normalize(vec3(-0.62, 0.55, 0.66));
    float key = max(dot(N, L), 0.0);

    // The rim is confined to the SILHOUETTE by the (1 - abs(N.y)) factor.
    // Without it a plain fresnel term peaks on exactly the faces a stack of
    // thin slabs shows most of — the horizontal ones, seen almost edge-on —
    // so every stratum's top and bottom glowed and the whole object read as
    // a solid terracotta mass rather than a graphite one with a lit edge.
    // The flat faces are lit in ink; only the turning edge takes the hue.
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    float rim = fresnel * (1.0 - abs(N.y));

    // The body is a warm taupe — the page's ink carried most of the way to
    // its paper. Two earlier passes proved the extremes both fail on a cream
    // ground: at full ink the object is a black brick whose seams vanish, and
    // with the accent mixed into the body it is a terracotta one. A mid tone
    // is what lets all three cues read at once — the lit top face of each
    // stratum, the page showing through the seam beneath it, and the hue on
    // the turning edge. It also keeps the accent scarce, which is the rule
    // the whole palette is built on: one hue, on the things meant to be
    // looked at, not smeared across the largest object on the page.
    vec3 body = mix(uInk, uPaper, 0.5);
    vec3 color = mix(body * 0.32, body * 1.04, key) * vLit;
    color += uAccent * rim * 0.9 * vLit;
    color += uAccent * vHover * 0.55;
    color = mix(color, uAccent, clamp(vIgnite, 0.0, 1.0) * 0.94);

    float alpha = uOpacity * vFade * max(vLit, vIgnite);
    if (alpha < 0.004) discard;

    gl_FragColor = vec4(color, alpha);
  }
`;

/** `THREE.Color`'s `setStyle()` (this `three` version, 0.171.0) doesn't parse
    `oklch()` — it logs "Unknown color model" and silently leaves the colour at
    its constructor default, so every uniform built from a raw token string
    lands on the wrong colour. Reading it back through `getComputedStyle`
    fails too: a modern Chromium's serializer can hand an `oklch()` value
    straight back out rather than downgrading to `rgb()`. A 1x1 canvas is not
    optional — `fillStyle` accepts any CSS colour the browser understands and
    `getImageData` always returns concrete 0-255 RGBA, because pixels have no
    colour space to preserve and so no serialization path back to `oklch()` to
    fall into. Carried over intact from the scene this replaced, where it was
    a real bug fix rather than a precaution. */
function resolveCssColor(value: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return value;
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${g}, ${b})`;
}

/** Reads a real design token at runtime rather than duplicating its value.
    The fallback is that same token's own literal from `tokens.css`, never a
    hex shortcut (3D-05). Because the hue is read at mount rather than
    compiled in, every world renders this scene in its own accent — which is
    what lets all four worlds share one object. */
function readColorVar(name: string, fallback: string): THREE.Color {
  if (typeof window === "undefined") return new THREE.Color(fallback);
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(resolveCssColor(value || fallback));
}

export function HeroDepthScene({
  references,
  reduced,
  progressRef,
}: HeroDepthSceneProps): ReactElement {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<{ label: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) return;
    if (references.length === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2); // 3D-01
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      // No WebGL — `HeroBackground` is already showing the static fallback
      // behind this host, so bailing leaves a complete hero rather than a gap.
      return;
    }
    renderer.setPixelRatio(dpr);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 24);

    // Built once (3D-03) — a geometry or material rebuilt per frame would
    // recompile the GLSL program every frame.
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const uniforms = {
      uAccent: { value: readColorVar("--color-accent", "oklch(55% 0.18 45)") },
      uInk: { value: readColorVar("--color-text-primary", "oklch(18% 0.02 80)") },
      uPaper: { value: readColorVar("--color-bg-page", "oklch(98% 0.008 80)") },
      uReveal: { value: reduced ? 1 : 0 },
      uProgress: { value: 0 },
      uHoverY: { value: -1 },
      uHoverStrength: { value: 0 },
      uOpacity: { value: 0.96 },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      // Depth IS written, despite `transparent`. 119 opaque slabs overlap each
      // other from every angle, and with depth writes off they composite in
      // draw order rather than depth order — which rendered the stack's edge
      // as a ragged comb of strata showing through the ones in front of them.
      // Alpha here only ever fades the whole object (the entrance sweep and
      // the near-plane dissolve), never blends two strata against each other,
      // so writing depth costs nothing and fixes the sorting.
      depthWrite: true,
    });

    const count = references.length;
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.frustumCulled = false;

    // Thickness is the file's real share of the corpus, floored so the
    // smallest reference is still a visible line, then renormalised so the
    // stack still fills the slab exactly.
    const total = references.reduce((sum, r) => sum + r.tokens, 0);
    const shares = references.map((r) => Math.max(r.tokens / total, MIN_SHARE));
    const shareSum = shares.reduce((sum, s) => sum + s, 0);
    const materialHeight = SLAB_HEIGHT;

    const exactIgnited = references.findIndex(
      (r) => r.skill === IGNITED_SKILL && r.name === IGNITED_NAME,
    );
    const ignitedRef =
      exactIgnited !== -1
        ? references[exactIgnited]
        : references.reduce((best, r) => (r.tokens > best.tokens ? r : best));

    // One record per stratum, laid out bottom to top. Built as objects rather
    // than parallel index lookups so the raycast below can read a hit's
    // stratum without an unchecked index into four separate arrays.
    //
    // `pitch` is the file's full share of the slab; the block drawn inside it
    // is `GAP_RATIO` shorter, and the remainder is the seam. Sizing the seam
    // as a fraction of each stratum rather than as one constant divided
    // between them is what makes the stack legible: a fixed total gap spread
    // over this many strata works out under a pixel each, and the object
    // renders as a solid brick with no visible slices at all — which is what
    // the first build of this scene did.
    let cursor = -SLAB_HEIGHT / 2;
    const strata = references.map((reference, index) => {
      const pitch = ((shares[index] ?? MIN_SHARE) / shareSum) * materialHeight;
      const centerY = cursor + pitch / 2;
      cursor += pitch;
      return {
        reference,
        height: pitch * (1 - GAP_RATIO),
        centerY,
        norm: (centerY + SLAB_HEIGHT / 2) / SLAB_HEIGHT,
        ignite: reference === ignitedRef,
      };
    });

    const aIgnite = new Float32Array(count);
    const aNorm = new Float32Array(count);
    const matrix = new THREE.Matrix4();

    for (const [index, stratum] of strata.entries()) {
      matrix.makeScale(SLAB_WIDTH, stratum.height, SLAB_DEPTH);
      matrix.setPosition(0, stratum.centerY, 0);
      mesh.setMatrixAt(index, matrix);
      aNorm[index] = stratum.norm;
      aIgnite[index] = stratum.ignite ? 1 : 0;
    }
    mesh.instanceMatrix.needsUpdate = true;
    geometry.setAttribute("aIgnite", new THREE.InstancedBufferAttribute(aIgnite, 1));
    geometry.setAttribute("aNorm", new THREE.InstancedBufferAttribute(aNorm, 1));

    // The slab reads as an object rather than a chart because it is turned
    // away from the reader — one three-quarter view, held.
    const group = new THREE.Group();
    group.add(mesh);
    group.rotation.set(0.1, -0.42, 0.03);
    scene.add(group);

    // The camera sits ABOVE the stack's mid-line and looks back down at it.
    // Level with the middle, strata above eye level show only their unlit
    // undersides and the seams between them close up entirely, so the top
    // half of the object rendered as a solid mass. From above, every stratum
    // presents a lit top face and an open seam, which is what makes the count
    // legible rather than implied.
    const CAMERA_Y = 1.75;
    const CAMERA_Z_REST = 7.4;
    // How far in the pin travels. Deeper than this and the stack fills the
    // frame edge to edge: it stops having a silhouette, and a lit object
    // without a silhouette reads as flat stripes on a panel rather than
    // something you have moved closer to. The approach has to end while the
    // object is still an object.
    const CAMERA_Z_IN = 5.05;
    camera.position.set(0, CAMERA_Y, CAMERA_Z_REST);
    camera.lookAt(0, 0, 0);

    /** Assigned once the loop below is set up; requests exactly one more
        rendered frame. Everything that changes what the object looks like
        without changing a uniform the loop already watches — a resize, a
        pointer event — goes through this. */
    let markDirty = (): void => {};

    const resize = (): void => {
      const { clientWidth, clientHeight } = host;
      if (clientWidth === 0 || clientHeight === 0) return;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      markDirty();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    // ── Pointer: uncovers, never repels ──────────────────────────────────
    // A raycast against the InstancedMesh gives the exact stratum under the
    // pointer including the group's rotation, and correctly reports nothing
    // when the pointer is off the object — which a screen-space distance
    // approximation cannot do.
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const projected = new THREE.Vector3();
    let pointerPending = false;
    let pointerInside = false;
    let hoverTargetY = -1;
    let hoverTargetStrength = 0;

    const readPointer = (): void => {
      pointerPending = false;
      if (!pointerInside) {
        hoverTargetStrength = 0;
        setHovered(null);
        return;
      }
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObject(mesh, false)[0];
      if (hit === undefined || hit.instanceId === undefined) {
        hoverTargetStrength = 0;
        setHovered(null);
        return;
      }
      const stratum = strata[hit.instanceId];
      if (stratum === undefined) {
        hoverTargetStrength = 0;
        setHovered(null);
        return;
      }
      hoverTargetY = stratum.norm;
      hoverTargetStrength = 1;

      projected.set(0, stratum.centerY, 0).applyMatrix4(group.matrixWorld).project(camera);
      const rect = host.getBoundingClientRect();
      setHovered({
        label: `${stratum.reference.skill}/${stratum.reference.name}`,
        x: ((projected.x + 1) / 2) * rect.width,
        y: ((1 - projected.y) / 2) * rect.height,
      });
    };

    const onPointerMove = (event: PointerEvent): void => {
      const rect = host.getBoundingClientRect();
      ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      pointerInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      // Throttled to one read per frame — a raycast per pointer event would
      // run several times between paints for nothing (ANI-04's reasoning,
      // applied to a raycast rather than a setState).
      if (!pointerPending) {
        pointerPending = true;
        markDirty();
      }
    };

    // A touch device never attaches the listener at all, matching the gate
    // the scene this replaced already used.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!reduced && fine) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    // ── Loop ─────────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let rafId: number | null = null;
    let cancelled = false;
    let reveal = 0;

    /**
     * Render-on-demand. The rAF callback runs every frame, but it only calls
     * `renderer.render` when something has actually moved.
     *
     * This is the difference between a hero that costs nothing and one that
     * costs the frame budget. An earlier build redrew unconditionally so that
     * the slab could carry a slow idle rotation, and measured — production
     * build, 4x CPU throttle — a median frame time of 29.9ms against a
     * 16.7ms baseline for the same page with the scene absent: the object was
     * spending two thirds of the budget animating a drift of ±0.03 radians
     * that no reader would ever notice. The drift is gone and the object is
     * still: it moves when the reader moves the pointer, when the pinned
     * range scrubs, and during its own entrance, and at every other moment it
     * is a rendered frame that costs exactly nothing to keep on screen.
     */
    let needsRender = true;
    const EPSILON = 0.0005;
    markDirty = () => {
      needsRender = true;
    };

    const tick = (): void => {
      if (cancelled) return;
      const delta = Math.min(clock.getDelta(), 0.05); // 3D-06: delta, never a frame count

      if (pointerPending) {
        readPointer();
        needsRender = true;
      }

      if (reveal < 1) {
        reveal = Math.min(reveal + delta / 1.1, 1);
        uniforms.uReveal.value = reveal;
        needsRender = true;
      }

      const progress = progressRef.current;
      if (Math.abs(progress - uniforms.uProgress.value) > EPSILON) {
        uniforms.uProgress.value += (progress - uniforms.uProgress.value) * Math.min(delta * 6, 1);
        needsRender = true;
      }

      if (Math.abs(hoverTargetStrength - uniforms.uHoverStrength.value) > EPSILON) {
        uniforms.uHoverStrength.value +=
          (hoverTargetStrength - uniforms.uHoverStrength.value) * Math.min(delta * 8, 1);
        needsRender = true;
      }
      if (hoverTargetY >= 0) uniforms.uHoverY.value = hoverTargetY;

      if (needsRender) {
        // The camera travels through Z into the stack rather than the stack
        // translating past a fixed camera — depth you move through, not
        // layers sliding.
        const travel = uniforms.uProgress.value;
        camera.position.z = CAMERA_Z_REST + (CAMERA_Z_IN - CAMERA_Z_REST) * travel;
        // Levelling off as it pushes in: the three-quarter view from above is
        // the reading angle, but arriving at the ignited stratum face-on is
        // what makes it read as a single sheet rather than another slab.
        camera.position.y = CAMERA_Y * (1 - travel * 0.75);
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
        needsRender = false;
      }

      rafId = requestAnimationFrame(tick);
    };

    if (reduced) {
      // Destination state, rendered once: fully lit, the stratum already
      // ignited, and no loop ever scheduled.
      uniforms.uReveal.value = 1;
      uniforms.uProgress.value = 0.62;
      camera.position.z = CAMERA_Z_REST + (CAMERA_Z_IN - CAMERA_Z_REST) * 0.62;
      camera.position.y = CAMERA_Y * (1 - 0.62 * 0.75);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    } else {
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      mesh.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [references, reduced, progressRef]);

  return (
    <div ref={hostRef} aria-hidden="true" data-hero-scene-canvas className="relative h-full w-full">
      {hovered !== null ? (
        <span
          data-hero-stratum-label
          className="pointer-events-none absolute whitespace-nowrap rounded-md border border-border bg-bg-elevated px-2 py-1 font-mono text-[0.6875rem] text-text-secondary"
          style={{ left: `${hovered.x}px`, top: `${hovered.y}px`, transform: "translate(12px, -50%)" }}
        >
          {hovered.label}
        </span>
      ) : null}
    </div>
  );
}

export default HeroDepthScene;
