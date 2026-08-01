# Generative UI Runtimes (ai-ui-generation)

Route: building a surface where a model **chooses and populates** components at runtime.
Sources: `tambo-ai/tambo`, `thesysdev/openui`, `vercel-labs/json-render`, `miurla/morphic`.

`generation-patterns.md` establishes *that* the registry pattern is the safe shape. This file
is the mechanics — three independent implementations that converged on the same architecture,
which is decent evidence it is the right one.

## The shared architecture

All four systems are the same four steps:

1. **Declare a catalog** — the finite set of components a model may use.
2. **Attach a schema to each** — the props contract, in Zod.
3. **Feed the schemas to the model as tool definitions** — the model calls components the way
   it calls functions.
4. **Stream the output and render progressively** — partial output renders as it arrives.

The safety property falls out of step 1, not from filtering the model's output:
**the model cannot name a component that is not in the catalog, and cannot pass props that
fail the schema.** Generated content is still untrusted input, but the blast radius is
bounded by a list you wrote.

## Registration — props schema *is* the tool definition

```ts
const components: TamboComponent[] = [{
  name: "Graph",
  description: "Displays data as charts using Recharts",
  component: Graph,
  propsSchema: z.object({
    data: z.array(z.object({ name: z.string(), value: z.number() })),
    type: z.enum(["line", "bar", "pie"]),
  }),
}]
```

The `description` and the schema are the entire prompt surface for that component — the model
sees nothing else. Consequences worth designing around:

- **Write `description` for a reader who cannot see the component.** Say when to use it and
  when not to; a vague description produces a component chosen for the wrong data.
- **Prefer `z.enum` over `z.string()`** wherever the value is one of a known set. An enum is a
  constraint the model cannot violate; a free string is a hallucination surface.
- **Every optional prop is a decision you delegated.** Required props with narrow types produce
  more predictable output than a permissive schema with sensible defaults.

## The catalog/registry split

`json-render` separates *what may exist* from *how it renders*:

```ts
const catalog = defineCatalog(schema, {
  components: { Card: { props: z.object({ title: z.string() }), description: "A card container" } }
})

const { registry } = defineRegistry(catalog, {
  components: { Card: ({ props, children }) => <div>{props.title}{children}</div> }
})
```

Worth copying even outside that library: the model is prompted from the catalog, the renderer
is bound from the registry, and one catalog can drive several renderers (React, Vue, Svelte,
native) without the model knowing which is downstream.

## Wire format

`json-render` uses a flat, id-addressed spec rather than a nested tree:

```json
{
  "root": "el-1",
  "elements": {
    "el-1": { "type": "Card", "props": {...}, "children": ["el-2"], "visible": [...], "watch": {...} }
  }
}
```

Fields: `root` · `elements` · `type` · `props` · `children` · `visible` · `watch`.

Flat-with-ids beats a nested tree for streamed output — a partial nested tree is unparseable
until its brackets close, whereas an element map can render every complete entry while later
ones are still arriving.

Dynamic behaviour is restricted to declared expression forms — `$cond`, `$template`,
`$computed`, `$bindState` — and visibility conditions may reference only `$state` paths.
**No arbitrary expressions, no model-authored code.** Actions come from a predefined set
(`setState` and friends) declared upfront. This is the line that keeps generative UI from
becoming remote code execution.

`openui` makes the opposite tradeoff with a purpose-built DSL ("OpenUI Lang") reporting **up
to 67% fewer tokens than JSON** for the same tree. Worth it only when output volume is the
binding constraint — JSON costs more tokens but every tool already parses it.

## Streaming

```ts
const { result, newPatches } = compiler.push(chunk)
setSpec(result)                    // render the partial spec
// …
const final = compiler.getResult()
```

The compiler accumulates patches and does **not** require each chunk to be well-formed JSON.
Do not wait for a complete document before rendering — the perceived-latency win is the main
reason to build this way at all.

Tambo streams the *props themselves*, so a component mounts and fills in progressively.
That means every registered component must tolerate **partially-populated props**: render a
skeleton for absent fields rather than throwing. Design each one to accept its own props as
incomplete, and never gate the mount on a field the model has not finished emitting.

## Hooks worth mirroring

`TamboProvider` takes `components`, `tools`, `mcpServers`, `contextHelpers`.
`useTambo() → { messages, isStreaming }` · `useTamboThreadInput() → { value, setValue, submit, isPending }`.
The shape to copy: a provider holding the catalog, one hook for stream state, one for input,
and cancellation/reconnection owned by the runtime rather than each component.

## Non-negotiables

1. Catalog is an allow-list. Never render a `type` you did not register.
2. Schema-validate every prop set before render; a type mismatch fails closed.
3. No model-authored expressions or handlers — declared forms only.
4. Every component renders correctly with incomplete props.
5. All four states still apply (`core/validate-checklist.md`): a streaming state is a loading
   state, and it must not be faked with a timer.
