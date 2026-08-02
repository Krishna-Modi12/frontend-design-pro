# MCP and Browser Tooling for Design Research

## What This Covers

Extraction needs a way to open a page and read values off it. That capability is not guaranteed — it depends on what the host has configured. This file describes what is actually available, what each tool can and cannot do, and what to do when none of it is present.

**Honesty rule:** most design sites have no MCP server. Do not claim a capability you do not have. If a tool is not connected, say so and fall back.

## Model Context Protocol, briefly

MCP is a standard interface through which a host exposes external tools — browsers, APIs, file systems — to a model. A configured MCP server appears as callable tools. An unconfigured one does not exist, no matter what its documentation promises.

## Available Tooling

### Playwright MCP — `microsoft/playwright-mcp`

The most capable option for this work. Real browser automation.

Can do:
- Navigate, click, scroll, wait for network idle
- Screenshot the page or a specific element
- Read computed styles off any node — this is the important one, it gives you real values rather than guesses
- Extract DOM structure and text content
- Emulate viewports and media features, including `prefers-reduced-motion` and `prefers-color-scheme`

Use for: computed-style extraction from component libraries, palette sampling, verifying that a source actually handles reduced motion, capturing the same page at three widths.

Configuration lives in the host's MCP settings; the server is launched via `npx`. Check the host's connected-tools list before assuming it is available.

### Browser-use style MCP servers

General-purpose browsing driven by natural language. Easier to steer, less precise.

Use for: exploration ("find three dark-mode developer-tool landing pages"), quick binary checks ("does this site have a dark mode?"). Not for numeric extraction — if you need an exact `cubic-bezier`, use Playwright or read it yourself in DevTools.

### Plain fetch / web-search tooling

If the host has web fetch but no browser, you get HTML and CSS text but no computed styles, no rendering, no JavaScript-applied values. Usable for reading a documentation page or a published source file. Not usable for sampling colours off a rendered page.

## Sources With No MCP

Be explicit about this — it is where overclaiming usually happens.

| Source | Reality | Workaround |
|---|---|---|
| 21st.dev | No official MCP server | Playwright against the component registry pages; inspect the network tab for JSON endpoints backing the listing |
| reactbits.dev | No MCP. Static site | Playwright DOM extraction reads the published source blocks directly |
| dribbble.com | No MCP. Aggressive bot protection | Often needs the user to supply a screenshot or sampled values; expect to fail and have the fallback ready |
| mobbin.com | No MCP. Authentication required | The user must browse it; you consume their notes |
| motion.dev, aceternity, cult-ui | No MCP. Public docs | Playwright works well; these are the easiest targets |

## Research Session Note

Keep one of these per session so the user can see what was actually looked at:

```markdown
## Research Session: [project]

**Tools active:** [playwright | browsing | none]

**Sources:**
1. [URL] — extracting: [values]  — status: [done | blocked: reason]
2. [URL] — extracting: [values]  — status: [...]

**Values extracted:** [link to the extraction notes]
**Blocked / not reachable:** [what, and what you did instead]
```

The "blocked" line is not an admission of failure. It is the difference between a constraint grounded in a real page and one you invented.

## Fallback: No Browsing At All

Emit a research prompt for the user, then stop and wait:

```markdown
## Research Prompt

I cannot open these directly. Please paste back:

**[URL 1]**
- Background colour of the page surface (hex is fine, I will convert)
- Accent colour
- Approximate width split of the hero (e.g. 60/40)

**[URL 2]**
- DevTools → Animations → the easing and duration on the card hover
```

Ask for the smallest set of values that unblocks the build. A request for twelve measurements gets abandoned; a request for three gets answered.

Do not proceed to code with invented values attributed to a source. If the user does not come back with the numbers, build from the project's existing tokens and say plainly that the reference was not incorporated.
