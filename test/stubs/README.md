# Runtime stubs for the gold examples' peer libraries

## Why these exist

`skills/*/examples/good-*.tsx` import ~25 peer libraries — `three`, `motion/react`,
`react-hook-form`, `react-native`, `gsap`, `recharts` — that this repo deliberately
does not install. The pack ships no runtime; installing three.js and React Native to
render a markdown skill pack would be absurd, and the ambient `_stubs.d.ts`
declarations are what make strict compilation cheap.

Declaration files do not exist at runtime, though. Vite could not resolve the bare
specifiers, so 29 of 39 test files failed at import before running a single
assertion — which is why `docs/ARCHITECTURE.md` carried "the vitest suite does not
execute end-to-end" as its first known gap for four minor versions.

Each file here is the smallest real module that lets the components render.
`vitest.config.ts` aliases the specifier to it. They are **test-only**:
`scripts/build_release.py` ships `core/ skills/ scripts/ evals/ rules/ install/`
plus four root files, and `test/` is in none of them.

## The contract

**One file per bare specifier.** Not per package family, not per domain. Three
different failures forced this, and each is silent:

1. **`export default` is singular.** `gsap` and `@splinetool/react-spline` both
   default-export. One shared file cannot serve both, and the loser silently
   receives the winner's object instead of a component.
2. **Namespace imports read the whole module.** `import * as z from 'zod'` needs
   `string`/`object`/`enum` as *named exports* of the zod module. In a shared file
   they sit beside `Bell` and `ResponsiveContainer`, and `z.string` is `undefined`.
3. **`vi.mock` keys on the resolved path.** Alias three specifiers to one file and
   the three `vi.mock` factories in a test collide — last one wins, and the other
   two modules silently lose their exports.

**Forward every prop.** A stub that swallows props deletes `role`, `aria-label` and
`onClick`, which turns a passing accessibility assertion into a false negative —
worse than the import error it replaced. Strip only props that belong to the
library rather than the DOM (`initial`, `whileHover`, `dpr`), because React warns on
those and, for some, emits an invalid HTML attribute.

**Do not model what the environment cannot show.** jsdom has no layout and no WebGL.
`Canvas` renders its container and discards the scene graph, because a real R3F
canvas contributes nothing to the accessibility tree — that is exactly why the golds
put `role="img"` and an `aria-label` on the wrapper. A stub that rendered `<mesh>`
into the DOM would let a test assert content no user can perceive.

## Adding one

Alias the specifier in `vitest.config.ts`, add the file here, and run
`npx vitest run`. If the module has submodules (`gsap/ScrollTrigger`), give each
entry point its own file and re-export from the main one.
