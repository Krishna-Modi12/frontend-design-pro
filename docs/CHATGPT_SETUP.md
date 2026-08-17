# ChatGPT Setup

The skill is a folder of markdown built around a registry (`SKILL.md`) that routes to one skill file per request. ChatGPT has no filesystem and no tool that reads a path on demand, so the routing model survives but the *loading* model does not — everything you give it is retrieved by search over uploaded knowledge, not fetched by an agent deciding what it needs. Set expectations accordingly.

## Custom GPT / Projects (file uploads + instructions)

1. Unzip the archive: `unzip frontend-design-pro-v*.skill -d ./frontend-design-pro/`
2. **Create a Custom GPT** (or a Project, if you're using ChatGPT Projects instead) and open its Knowledge / file upload section.
3. Upload `SKILL.md` and the `core/*.md` files individually. **A Custom GPT accepts at most 20 knowledge files for the lifetime of that GPT** ([OpenAI Help Center](https://help.openai.com/en/articles/8555545-file-uploads-faq)) — the pack has 8 `core/` files, 19 skill routers and 104 references, so you are picking a subset before the first message. A workable split: `SKILL.md` + the 4 `core/` files a typical request needs + the 2–3 skill routers your work actually hits, leaving a few slots for the specific `references/*.md` you know you want. Uploading more files does not buy more depth — retrieval is chunked semantic search, so extra files mostly add chunks competing for the same slots.
4. **Instructions** field — paste something close to this:

```
You have access to a knowledge base called frontend-design-pro. SKILL.md is
a registry, not a document: it has a routing table matching request keywords
to exactly one skills/{id}/SKILL.md, plus a short list of core/ dependencies
that skill declares. When asked for frontend UI/UX work:

1. Identify which single skill in the routing table matches the request.
2. Search your knowledge for that skill's SKILL.md and its declared core-deps.
3. State which skill and core files you are using before writing code.
4. Follow the anti-slop rules and validation checklist in SKILL.md /
   core/validate-checklist.md as far as you can verify by inspection —
   you cannot execute or compile code yourself, so flag anything you
   could not check (TypeScript strictness, aria wiring, animation timing).

Do not try to load "everything" — if you cannot find the specific skill
file via search, say so rather than improvising generic advice.
```

## Plain ChatGPT (no Custom GPT)

Paste `SKILL.md` directly into the conversation, then paste the specific `skills/{id}/SKILL.md` and `core/*.md` files the request needs, based on the routing table. This is the most reliable mode precisely because no retrieval step is guessing at relevance — you do the routing by hand. It does not scale to 358k tokens of references, so expect shallower output on skills that lean on `references/*.md`.

## Verifying it took

Ask: **"Which skill file are you using, and what does its routing table say matched this request?"**

A correctly wired setup names one `skills/{id}/SKILL.md`, roughly quotes the keyword row that matched, and lists the core deps it pulled in. A plausible summary instead of a quoted routing row means it is improvising from training knowledge, not retrieving your upload. That failure is harder to catch here than in a tool-using agent — ChatGPT answers confidently either way.

## Honest limitations

- **Retrieval, not lazy loading.** A Custom GPT's Knowledge files are chunked and searched by relevance, not read as whole files on demand. It cannot decide mid-conversation to "go fetch `references/animation-recipes.md`" the way an agent with real file tools can — it can only surface whatever chunks its retrieval step already pulled. Treat this as "everything is fuzzy-searchable," not "the skill decides what to load."
- **No code execution, so no enforced constraints.** ChatGPT cannot run `scripts/build_release.py` or the AST/regex constraint checks against its own output — those need a Node/TypeScript toolchain. It can reason about whether code plausibly satisfies a rule; reciting "this passes A11Y-01" is a claim, not a verified result. Run `npm run gates` locally if enforcement matters.
- **The 20-file cap forces a subset.** 100 files in the pack, 20 slots. You are curating in advance exactly the decision the registry was designed to defer until the request arrives. Pick for the work you actually do; a GPT scoped to "landing pages and design systems" beats one that tries to cover all 19 skills.
- **Limits move.** The 20-file cap and 512 MB / 2M-token per-file limits are current as of writing; check [OpenAI's file uploads FAQ](https://help.openai.com/en/articles/8555545-file-uploads-faq) if a limit is load-bearing for your setup.

Full routing reference: [USAGE.md](USAGE.md). Architecture and gates: [ARCHITECTURE.md](ARCHITECTURE.md). Compatibility across agents: [AGENT_COMPATIBILITY.md](AGENT_COMPATIBILITY.md).
