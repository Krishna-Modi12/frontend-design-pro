# shadcn/ui Ecosystem Reference

Source: birobirobiro/awesome-shadcn-ui (19.4k stars, 200+ resources)  
Version: 10.12.0

Community components, animation libraries, theme tools, and starters that extend shadcn/ui. When building with shadcn, check here before writing from scratch.

---

## Component Finder (by Need)

*"I need a ___" → use this community component instead of building from scratch.*

### Editors / Rich Text

| Need | Component | Install |
|---|---|---|
| Notion-style WYSIWYG with AI | **novel** | `npx shadcn@latest add "https://novel.sh/api/components"` |
| Full rich text (AI-powered) | **plate** | `npm install @udecode/plate` |
| Minimal WYSIWYG tiptap | **minimal-tiptap** | Copy from minimal-tiptap GitHub |
| Email editor (Notion-like) | **maily.to** | npm install @maily-to/core |
| WYSIWYG echo-editor (tiptap) | **echo-editor** | npm install echo-editor |

### Date & Time Pickers

| Need | Component | Notes |
|---|---|---|
| Simple date picker | **shadcn-date-picker** | Standard single date |
| Date+time with timezone | **datetime-picker** | Presets + timezone support |
| Date range picker (multi-month) | **date-range-picker-for-shadcn** | Full multi-month range |
| Date-time range with zones | **date-time-range-picker-shadcn** | Timezone-aware range |
| Natural language datetime | **lingua-time** | "next Tuesday at 3pm" input |
| Cal.com replica | **shadcn-cal** | Exact Cal.com calendar UI |
| Calendar with week view | **calendar-cn** | Notion-inspired week view |
| Big full-calendar | **shadcn-full-calendar** | Google Cal-style |
| Event calendar | **shadcn-event-calendar** | Google Cal + Notion inspired |
| Scheduler/planner | **calendar-schedular** | Multi-purpose date-fns based |
| Calendar heatmap | **shadcn-calendar-heatmap** | GitHub contribution style |

### File Upload

| Need | Component | Notes |
|---|---|---|
| Drag & drop upload | **file-uploader** | react-dropzone based |
| Multi-image with cloud | **nextjs-multi-image-upload** | Cloud storage ready |
| Image crop | **shadcn-image-cropper** | react-image-crop wrapper |
| Simple image upload | **image-upload-shadcn** | Basic with validation |
| PDF component library | **pdfx** | Copy-paste PDF components |
| PDF flipbook | **react-pdf-flipbook-viewer** | Zoom + page flip |

### Forms & Input

| Need | Component | Notes |
|---|---|---|
| Auto-generate form from Zod | **auto-form** | `npx shadcn@latest add "https://vrite.io/api/shadcn/auto-form"` |
| Multi-step form/stepper | **next-stepper** or **shadcn-stepper** | Dynamic multi-step |
| Phone input with validation | **shadcn-phone-input** or **shadcn-phone-input-2** | libphonenumber-js |
| Tag input | **emblor** | GitHub-style accessible tags |
| Fancy multi-select | **fancy-multi-select** | Campsite.design inspired |
| Async select with search | **async-select** | Debounced API search |
| Country/state dropdown | **shadcn-country-dropdown** | ISO 3166 |
| Address autocomplete | **shadcn-address-autocomplete** | Google Places |
| Color picker | **shadcn-color-picker** | react-color wrapper |
| Font picker | **shadcn-font-picker** | Google Fonts API |
| Icon picker | **shadcn-iconpicker** | Lucide icons |
| Number scrubber | **shadcn-number-scrubber** | Drag to change value |
| iOS wheel picker | **react-wheel-picker** | Mobile-feel number wheel |
| Password input | **password-input** | Show/hide toggle |
| Textarea with @mentions | **fancy-area** | @mention support |
| TanStack Form integration | **shadcn-tanstack-form** | Type-safe forms |

### Select / Combobox

| Need | Component | Notes |
|---|---|---|
| Linear-style priority selector | **shadcn-linear-combobox** | Icon + label priority |
| Cascading dropdown | **cascader-shadcn** | Hierarchical selection |
| React-select styling | **react-select** | Shadcn-styled react-select |

### Tables & Data

| Need | Component | Notes |
|---|---|---|
| Advanced DataTable with server ops | **tnks-data-table** | Server-side sort/filter/page |
| DataTable with col resize | **shadcn-data-table-advanced-col-opions** | Resizable columns |
| Drag-drop table | **shadcn-drag-table** | Reorderable rows |
| Dynamic table builder | **shadcn-table-maker** | Runtime column config |
| Table with drizzle ORM | **trable-craft** | DB-powered table engine |
| TanStack table component | **tanstack-ui-table** | Custom TanStack setup |
| Linked chart + data table | **linked-chart** | Chart synced to table |

### Charts

| Need | Component | Notes |
|---|---|---|
| Zoomable charts | **zoom-charts** | Recharts with zoom |
| Crypto charts | **crypto-charts** | Crypto price visualization |
| Tremor charts | **tremor** | Full chart + dashboard lib |
| Country data visualization | **country-data-in-charts** | World data charts |

### Navigation & Layout

| Need | Component | Notes |
|---|---|---|
| Retractable sidebar | **shadcn-ui-sidebar** | Responsive collapsible sidebar |
| Command palette (enhanced) | **data-command** | API-connected command |
| Drop drawer (responsive) | **drop-drawer** | Dropdown/drawer hybrid |
| Drag-to-resize sidebar | **drag-to-resize-sidebar** | Persistent resize |
| Animated header (Vercel-style) | **animated-header** | Vercel nav animation |
| Animated tabs (Vercel-style) | **animated-tabs** | Sliding indicator tabs |
| Timeline | **shadcn-timeline** or **shadcn-timeline-2** | Vertical timeline |
| Roadmap | **roadmap-ui** | Interactive roadmap |
| Event timeline | **event-timeline-roadmap** | Animated timeline |

### Modals & Overlays

| Need | Component | Notes |
|---|---|---|
| Responsive modal (drawer on mobile) | **credenza** | Auto modal → drawer |
| Confirm dialog (declarative) | **confirm-dialog** | No boilerplate needed |
| Vaul drawer | **vaul** | `npm install vaul` — Emil Kowalski |
| Modal via query params | **modal-control-query** | URL-state modals |
| Tour / onboarding | **tour** or **uixmat-onborda** | Next.js product tours |

### Kanban & Drag-Drop

| Need | Component | Notes |
|---|---|---|
| Production Kanban | **kanban-board** | Zero dependencies |
| DnD sortable | **nextjs-dnd** or **sortable** | dnd-kit based |
| Drag-to-swap dashboard | **dnd-dashboard** | Layout swap |
| Recursive nested Kanban | **recursive-dnd-kanban-board** | Infinitely nested |
| Drag-drop sortable pills | **shadcn-drag-and-drop-sort** | Tag-like pills |

### AI / Chat Components

| Need | Component | Notes |
|---|---|---|
| Full AI chat UI | **assistant-ui** | `npm install @assistant-ui/react` |
| Chatbot kit | **shadcn-chatbot-kit** | Customizable chat |
| Chat component | **shadcn-chat** | Simple chat bubbles |
| AI tool call UI | **tool-ui** | Ready UI for AI tools |
| Generative UI components | **nexus-ui** | AI interface primitives |
| AI app blocks | **simple-ai** | Blocks for AI apps |
| Voice agent UI | **agents-ui** | LiveKit voice components |
| Manifest/MCP UI | **manifest-ui** | ChatGPT and MCP apps |
| AI inference components | **ui-nference-sh** | AI app shadcn registry |

### Payments & Billing

| Need | Component | Notes |
|---|---|---|
| Type-safe billing UI | **billingsdk** | Dodo Payments subscriptions |
| Billing components | **billui** | Open source billing |
| Payment gateway UI | **payment-gateways** | Next.js 14 gateway UI |
| Pricing page | **pricing-page-shadcn** | Customizable pricing |
| Pricing generator | **shadcn-pricing-page-generator** | Interactive generator |

### Notifications & Feedback

| Need | Component | Notes |
|---|---|---|
| Morphing toast | **goey-toast** | Organic blob animation |
| Progress button | **progress-button** | Button with progress UX |
| Stateful button | **stateful-button** | Async operation states |
| Enhanced button | **enhanced-button** | More variant options |
| Cookie consent | **shadcn-cookies** or **shadcn-cookie-consent** | GDPR ready |
| Onboarding tour | **uixmat-onborda** | Next.js onboarding |

### Maps & Location

| Need | Component | Notes |
|---|---|---|
| Interactive map | **shadcn-map** | Leaflet-based |
| Location picker | **shadcn-location-picker** | Google Maps picker |
| Address search | **search-address** | OpenStreetMap |

### Numbers & Animation

| Need | Component | Notes |
|---|---|---|
| Animated number transitions | **number-flow** | `npm install @number-flow/react` |
| Stocks/charts | **stocks** | Next.js stock charts |

### Specialized / Fun

| Need | Component | Notes |
|---|---|---|
| Mind maps | **mindmapcn** | shadcn mind map |
| Flight routes | **flightcn** | Route visualization |
| Terminal UI | **termcn** | Beautiful terminal components |
| Camera capture | **capture-photo** | Browser camera API |
| QR code | **creatorem/ui** | QR + stepper + tour |
| Audio player | **audio/ui** | Accessible audio components |
| Waveform/ElevenLabs | Build with audio/ui | Waveform visualizer |

---

## Animation Libraries for shadcn

*Pairs with shadcn components. Use when MOTION_INTENSITY ≥ 6.*

### Tier 1 — Landing Pages (High visual impact)

**Magic UI** (`magicui.design`)
```bash
npx shadcn@latest add "https://magicui.design/r/magic-card"
# or install individual components via CLI
```
- Largest landing page component collection
- Shimmer buttons, animated gradients, sparkles, meteor effects, dot patterns
- Globe, beam effects, animated lists
- Best for: hero sections, marketing pages

**Aceternity UI** (`aceternity-ui.com`)
```bash
# Copy-paste components from aceternity-ui.com
```
- Trending animated components — "cards that tilt", "spotlight" effects
- Parallax cards, 3D card rotate, background beams
- Best for: portfolio, agency, SaaS marketing

**Cult UI** (`cult-ui.com`)
- Curated hand-crafted animations, fewer but higher quality
- Best for: premium/selective use

**Eldora UI** (`eldora.ui.beer`)
- Free animated components, good variety
- Best for: general landing pages

**Skiper UI** (`skiper-ui.com`)
- Animated components behind a **free/pro split** — the only entry here that gates part of its catalogue. Check the tier before promising a component to a client
- Client-rendered catalogue: the component list does not appear in the page source, so an agent fetching the URL gets a loading shell, not an inventory. Browse it, do not scrape it
- Best for: motion-led marketing surfaces, once the licence question is settled

### Tier 2 — Component Animations

**Animata** (`animata.design`)
- Hand-crafted interaction animations
- Focused on micro-interactions and component-level

**Berlix**
- Tailwind CSS + Motion (Motion One)
- Lightweight animation library pair

**animate-ui**
- Animated primitives — extends shadcn directly
- `npx shadcn@latest add "https://animate-ui.com/r/[component]"`

**bundui**
- Reusable animated components with Framer Motion
- Dashboard-appropriate animations

**dy-comps**
- Framer Motion components for React

**edil-ozi**
- GSAP + Framer Motion components

**farmui**
- Styled animated component library with npm support

**ui-beats**
- Animated React components, good variety

**uselayouts**
- Animated components with Framer Motion

**smooth-ui**
- Production-ready customizable blocks

**shsfui**
- Motion-first components with Framer Motion

### Tier 3 — CSS Animation Libraries

**tailwindcss-motion**
```bash
npm install tailwindcss-motion
# Usage: className="motion-preset-bounce"
```
- Simple class-based animation syntax
- No JS dependencies

**motionvariants**
- Pre-built Framer Motion variants
- Import and apply directly

---

## Theme / Color Tools

| Tool | Use Case |
|---|---|
| **tweakcn** (`tweakcn.com`) | Best shadcn theme editor — Tailwind v4 compatible, visual |
| **10000+ Themes** | Browse pre-built themes at shadcn-ui.com/themes |
| **shadesigner.com** | Palette generator with theme designer |
| **shadcn-ui-customizer** | Color picker themes |
| **ui-colorgen** | Color configuration assistance |
| **navnote/rangeen** | Website palette creation tool |
| **ewgenius/ui** | Create themes with Radix Colors |
| **gradient-picker** | Gradient picker component |
| **sweep** | Modern gradient generator |
| **designgui** | VSCode CSS variables color manager |

**Quick theme customization (globals.css override):**
```css
@layer base {
  :root {
    --primary: 262 80% 50%;          /* Your brand purple */
    --primary-foreground: 0 0% 100%;
    --radius: 0.5rem;                /* Adjust border radius globally */
  }
  .dark {
    --primary: 262 70% 65%;          /* Lighter for dark mode */
  }
}
```

---

## Figma Design Files

| Resource | What's included |
|---|---|
| **obra-shadcn-ui** | Complete Figma library — all 51 shadcn components |
| **shadcn-ui-components** | All components in Figma |
| **mynaui** | TailwindCSS + shadcn Figma UI Kit |

---

## Storybook

| Resource | Notes |
|---|---|
| **shadcn-storybook-registry** | Story registry for all shadcn components |
| **shadcn-ui-storybook (JheanAntunes)** | Full storybook registration |
| **shadcn-ui-storybook (fellipeutaka)** | Alternative implementation |

---

## Boilerplate Starters (Best Picks)

### SaaS / Full-Stack

| Starter | Stack | Use Case |
|---|---|---|
| **chadnext** | Next.js 15 + LuciaAuth + Stripe + Prisma | Quick SaaS |
| **onyx** | Next.js + Supabase + Stripe | Full-stack MVP |
| **horizon-ai-nextjs-shadcn-boilerplate** | Next.js + AI | AI SaaS premium |
| **cloudflare-saas-stack** | Cloudflare + Drizzle + Auth | Edge SaaS |
| **next-js-boilerplate** | Production Next.js + Prisma + NextAuth | Standard SaaS |
| **shadcnship** | Production-ready SaaS registry | Complete SaaS |

### Admin / Dashboard

| Starter | Notes |
|---|---|
| **shadcn-admin** | Multi-framework admin (Vite + React Router) |
| **next-shadcn-dashboard-starter** | Next.js 14 admin |
| **shadboard** | Next.js 15 + React 19 admin |
| **next-shadcn-admin-dashboard** | Modern admin |
| **tailwind-admin** | Open source admin |

### AI / Chatbot

| Starter | Notes |
|---|---|
| **openui-shadcn-chat** | Generative UI chatbot template |
| **agentic-react-nextjs-shadcn** | Agent-testable SaaS |
| **shadcn-nextjs-free-boilerplate** | ChatGPT dashboard |

### Landing Pages

| Starter | Notes |
|---|---|
| **shadcn-landing-page** | Clean landing template |
| **shadcn-saas-landing** | Full-fledged SaaS landing |
| **magicui-startup-templates** | MagicUI animated landing |
| **launch-ui** | Landing page components |
| **saas-blocks-kit** | 10 production SaaS sections |

### Monorepos

| Starter | Notes |
|---|---|
| **turborepo-shadcn-ui-tailwindcss** | Turborepo + shadcn starter |
| **turborepo-launchpad** | Comprehensive monorepo |
| **full-stack-monorepo-starter** | Fastify + React monorepo |
| **design-system-template** | Turborepo + Storybook |

### Specialized

| Starter | Stack | Use Case |
|---|---|---|
| **create-tauri-ui** | Tauri + shadcn | Desktop apps |
| **taxonomy** | Next.js RSC + shadcn | App/blog hybrid |
| **next-wp** | WordPress + RSC | Headless CMS |
| **astro-erudite** | Astro + shadcn | Static blog |
| **a11y-starter-kit** | WCAG 2.1 AA | Accessible-first |
| **atomic-crm** | React + shadcn | Open source CRM |

---

## Community Component Registries

*Install from these registries directly with the shadcn CLI:*

```bash
# Install from a registry URL
npx shadcn@latest add "https://registry.url/r/component-name"
```

| Registry | Specialty |
|---|---|
| **21st.dev** | Open source npm for shadcn components |
| **registry.directory** | Curated directory of all registries |
| **origin-ui** | Beautiful Next.js components |
| **kibo-ui** | Comprehensive complex app components |
| **shadcn-blocks.com** | Hundreds of extra pre-built blocks |
| **shadcn-blocks** | Official pre-made customizable blocks |
| **tailark** | Marketing website blocks |
| **mvpblocks** | Responsive blocks without styling worry |
| **blocks.so** | Clean modern React building blocks |
| **chanhdai-components** | Quality reusable components |

---

## Framework Ports

*shadcn is React-first, but ports exist for:*

| Framework | Project |
|---|---|
| **Vue** | shadcn-vue |
| **Svelte** | shadcn-svelte |
| **Angular** | Spartan |
| **Solid** | solid-ui |
| **React Native** | react-native-reusables (recommended) |
| **Flutter** | flutter-shadcn-ui |
| **Swift (iOS)** | swiftcn-ui |
| **PHP (Blade)** | (community ports) |
| **Basecoat** | Vanilla HTML/CSS/JS — no framework |

---

## Design System Integration

### Adding shadcn to a Figma workflow

```
1. Import "obra-shadcn-ui" or "shadcn-ui-components" Figma library
2. Design in Figma using shadcn tokens
3. Export CSS variables from Figma → paste into globals.css
4. Generate DESIGN.md with [stitch] shortcode for AI agent context
5. Developers install components: npx shadcn@latest add <component>
```

### Custom Registry Pattern

Build your own sharable component registry:

```json
// registry.json at your-site.com/r/registry.json
{
  "name": "my-registry",
  "homepage": "https://your-site.com",
  "items": [
    {
      "name": "custom-button",
      "type": "registry:component",
      "files": [{ "path": "registry/custom-button.tsx", "type": "registry:component" }]
    }
  ]
}
```

```bash
# Users install from your registry
npx shadcn@latest add "https://your-site.com/r/custom-button"
```

Use **wds registry** or **shadcn-registry-template** as starting point.

---

## Key Third-Party Packages (Direct npm)

These are the most production-proven shadcn ecosystem packages:

```bash
# Drawer (Emil Kowalski)
npm install vaul

# Number animations
npm install @number-flow/react

# Rich text (Notion-style)
npm install novel

# Tag input
npm install emblor

# Auto form from Zod
# (shadcn registry install — see auto-form above)

# Animated icons
npm install @pqoqubbw/icons

# AI chat UI
npm install @assistant-ui/react

# Plate rich text
npm install @udecode/plate

# Tremor charts
npm install @tremor/react
```

---

## Anti-Patterns with shadcn + Ecosystem

| Anti-Pattern | Correct Approach |
|---|---|
| Installing the entire aceternity-ui package | Copy-paste only the components you need |
| Using magicui for every element | Use for hero/marketing only — not for all UI |
| Combining 3+ animation libraries on same page | Pick one animation system per project |
| Overriding shadcn with `!important` | Edit the component file you own |
| Installing shadcn as an npm dependency | Use the CLI — you own the source code |
| Custom-building date pickers / rich text | Use community components above |
| Missing `prefers-reduced-motion` in animation libs | Always wrap with motion safety check |
| Using generic themes from tweakcn without adjustment | Customize — don't ship default tweakcn theme |
