# Landing Page Patterns

Source: nextlevelbuilder/ui-ux-pro-max-skill — full 34-pattern specification  
Version: 10.7.0

---

## Contents

- [How to Use](#how-to-use)
- [Pattern 1 — Hero + Features + CTA](#pattern-1--hero--features--cta)
- [Pattern 2 — Hero + Testimonials + CTA](#pattern-2--hero--testimonials--cta)
- [Pattern 3 — Product Demo + Features](#pattern-3--product-demo--features)
- [Pattern 4 — Minimal Single Column](#pattern-4--minimal-single-column)
- [Pattern 5 — Funnel (3-Step)](#pattern-5--funnel-3-step)
- [Pattern 6 — Comparison Table + CTA](#pattern-6--comparison-table--cta)
- [Pattern 7 — Lead Magnet + Form](#pattern-7--lead-magnet--form)
- [Pattern 8 — Pricing Page + CTA](#pattern-8--pricing-page--cta)
- [Pattern 9 — Video-First Hero](#pattern-9--video-first-hero)
- [Pattern 10 — Scroll-Triggered Storytelling](#pattern-10--scroll-triggered-storytelling)
- [Pattern 11 — AI Personalization](#pattern-11--ai-personalization)
- [Pattern 12 — Waitlist / Coming Soon](#pattern-12--waitlist--coming-soon)
- [Pattern 13 — Comparison Table Focus](#pattern-13--comparison-table-focus)
- [Pattern 14 — Pricing-Focused Landing](#pattern-14--pricing-focused-landing)
- [Pattern 15 — App Store Style](#pattern-15--app-store-style)
- [Pattern 16 — FAQ / Documentation](#pattern-16--faq--documentation)
- [Pattern 17 — Immersive / Interactive](#pattern-17--immersive--interactive)
- [Pattern 18 — Event / Conference](#pattern-18--event--conference)
- [Pattern 19 — Product Review / Ratings](#pattern-19--product-review--ratings)
- [Pattern 20 — Community / Forum](#pattern-20--community--forum)
- [Pattern 21 — Before-After Transformation](#pattern-21--before-after-transformation)
- [Pattern 22 — Marketplace / Directory](#pattern-22--marketplace--directory)
- [Pattern 23 — Newsletter / Content First](#pattern-23--newsletter--content-first)
- [Pattern 24 — Webinar Registration](#pattern-24--webinar-registration)
- [Pattern 25 — Enterprise Gateway](#pattern-25--enterprise-gateway)
- [Pattern 26 — Portfolio Grid](#pattern-26--portfolio-grid)
- [Pattern 27 — Horizontal Scroll Journey](#pattern-27--horizontal-scroll-journey)
- [Pattern 28 — Bento Grid Showcase](#pattern-28--bento-grid-showcase)
- [Pattern 29 — Interactive 3D Configurator](#pattern-29--interactive-3d-configurator)
- [Pattern 30 — AI-Driven Dynamic](#pattern-30--ai-driven-dynamic)
- [Pattern 31 — Feature-Rich Showcase](#pattern-31--feature-rich-showcase)
- [Pattern 32 — Hero-Centric Design](#pattern-32--hero-centric-design)
- [Pattern 33 — Trust & Authority](#pattern-33--trust--authority)
- [Pattern 34 — Real-Time / Operations](#pattern-34--real-time--operations)
- [CTA Placement Rules (Cross-Pattern)](#cta-placement-rules-cross-pattern)
- [Social Proof Formulas](#social-proof-formulas)
- [Form Conversion Rules](#form-conversion-rules)
- [Mobile Optimization Rules](#mobile-optimization-rules)
- [Anti-Patterns](#anti-patterns)

---

## How to Use

Each pattern specifies **section order**, **CTA placement**, **color strategy**, **recommended effects**, and **conversion optimization** notes. Match the pattern to your product type and intent, then apply the CTA placement and color rules directly.

Quick-select by keyword:
- **SaaS / B2B** → #1 Hero+Features+CTA, #25 Enterprise Gateway, #33 Trust & Authority
- **Product demo** → #3 Product Demo+Features, #29 Interactive 3D Configurator, #30 AI-Driven Dynamic
- **Mobile app** → #15 App Store Style
- **E-commerce** → #19 Product Review, #21 Before-After Transformation, #29 3D Configurator
- **Community / newsletter** → #20 Community/Forum, #23 Newsletter/Content First
- **Events** → #18 Event/Conference, #24 Webinar Registration
- **Portfolio** → #26 Portfolio Grid, #27 Horizontal Scroll Journey, #28 Bento Grid Showcase
- **Pricing-led** → #8 Pricing Page, #14 Pricing-Focused Landing
- **Lead gen** → #7 Lead Magnet+Form, #12 Waitlist/Coming Soon
- **Competitive** → #6 Comparison Table+CTA, #13 Comparison Table Focus
- **Storytelling** → #10 Scroll-Triggered Storytelling, #21 Before-After, #27 Horizontal Scroll

---

## Pattern 1 — Hero + Features + CTA

**Keywords**: hero, cta, saas, b2b, classic

**Section order**:
```
Hero (full-viewport VP) → Value prop strip → Features (3–5 cards) → Social proof → CTA → Footer
```

**CTA placement**: Hero sticky + bottom section

**Color strategy**: Brand primary, `#FAFAFA` card backgrounds, contrasting accent for CTA button (7:1 contrast ratio minimum)

**Effects**: Parallax on hero background, hover-lift on feature cards (`translateY(-4px)`), glow on CTA button

**Conversion tips**:
- 7:1 contrast ratio on CTA — non-negotiable
- Sticky navbar CTA (smaller variant, same color)
- Feature cards: icon + headline + 1-sentence description — no paragraphs
- Social proof positioned immediately before nearest CTA

---

## Pattern 2 — Hero + Testimonials + CTA

**Keywords**: testimonials, social-proof, reviews, trust

**Section order**:
```
Hero → Problem statement → Solution overview → Testimonials (3–5) → CTA → Footer
```

**CTA placement**: Hero sticky + post-testimonials

**Color strategy**: Brand color, `#F5F5F5` background, `#666` for quote text

**Effects**: Carousel slides with auto-advance (pause on hover), fade-in animations on scroll

**Conversion tips**:
- 3–5 testimonials minimum; include photo + name + role + company
- Position testimonials BEFORE the CTA — never after
- Use real photos, not avatars; real names, not initials

---

## Pattern 3 — Product Demo + Features

**Keywords**: demo, interactive, showcase, video, mockup

**Section order**:
```
Hero → Video/mockup center → Features list → Comparison → CTA
```

**CTA placement**: Inline with video/mockup center + CTA right/below

**Color strategy**: Brand overlay on video, `#0080FF` icon accents

**Effects**: Video pulse animation on play button, scroll-triggered feature reveals

**Conversion tips**:
- Interactive mockup preferred over static screenshot
- Auto-play video muted; show captions toggle
- Feature list should annotate the demo, not repeat the hero copy

---

## Pattern 4 — Minimal Single Column

**Keywords**: minimal, simple, direct, clean, personal

**Section order**:
```
Hero → Description → Benefits (3 max) → CTA → Footer
```

**CTA placement**: Centered, large primary button

**Color strategy**: Brand accent + `#FFFFFF` background + single accent color only

**Effects**: Subtle hover scale on CTA (`scale(1.02)`), no scroll animations

**Conversion tips**:
- Large typography (clamp `2.5rem`–`5rem`) — whitespace is the design
- Mobile-first; test at 390px first
- Max 3 benefits; cut everything else
- One CTA. One. Not two.

---

## Pattern 5 — Funnel (3-Step)

**Keywords**: funnel, conversion, wizard, steps, progressive

**Section order**:
```
Hero → Step 1 (problem) → Step 2 (solution) → Step 3 (action) → Main CTA
```

**CTA placement**: Mini-CTA at each step transition + primary CTA at end

**Color strategy**: Red → Orange → Green progression matching urgency-to-resolution

**Effects**: Progress bar fill animation between steps, step entrance animations

**Conversion tips**:
- Progressive disclosure; never show all content at once
- Each step must answer one question and move forward
- Progress bar keeps users committed (completion psychology)

---

## Pattern 6 — Comparison Table + CTA

**Keywords**: comparison, table, versus, competitor, side-by-side

**Section order**:
```
Hero → Problem framing → Comparison table (you vs. competitors) → Pricing → CTA
```

**CTA placement**: In your highlighted table column + below table

**Color strategy**: Alternating table rows, `#FFFACD` highlight on your column, competitors in neutral grays

**Effects**: Row hover highlight, checkmark draw animations, sticky table header

**Conversion tips**:
- Always highlight YOUR row/column — don't make them search for it
- Include a free trial option in your column even if competitors don't
- Be factual; false claims destroy credibility. Cite sources for stats.

---

## Pattern 7 — Lead Magnet + Form

**Keywords**: lead, form, signup, email, magnet, freebie

**Section order**:
```
Hero → Magnet preview (mockup/cover) → Form (minimal) → Submit → Thank you state
```

**CTA placement**: Form submit button (full-width, high contrast)

**Color strategy**: Professional design, white background, `#CCCCCC` borders, brand accent on CTA only

**Effects**: Form field focus animations, real-time validation feedback, shake on error

**Conversion tips**:
- ≤ 3 fields for maximum conversion (ideally email only)
- Show a preview of the lead magnet — make them want it
- Submit button text: action verb + benefit ("Get the Free Guide", not "Submit")
- Social login reduces friction by ~30%

---

## Pattern 8 — Pricing Page + CTA

**Keywords**: pricing, plans, tiers, subscription, saas

**Section order**:
```
Hero → Pricing cards (2–4 tiers) → Feature comparison table → FAQ → CTA
```

**CTA placement**: Inside each pricing card + sticky nav CTA + bottom

**Color strategy**: Color-coded tier system: Free/grey → Starter/blue → Pro/brand → Enterprise/dark; popular plan highlighted with brand color border

**Effects**: Monthly/annual toggle with smooth height transition, hover lift on cards

**Conversion tips**:
- Offer 20–30% annual discount — show savings prominently
- Highlight the mid-tier ("Most popular" badge)
- FAQ section reduces objections — include "Can I cancel anytime?" and "What happens when I upgrade?"

---

## Pattern 9 — Video-First Hero

**Keywords**: video, hero, media, engaging, film, product

**Section order**:
```
Hero with full-bleed video → Feature highlights overlaid → Benefits → CTA
```

**CTA placement**: Video overlay center/bottom + section below

**Color strategy**: 60% dark overlay on video, brand accent for UI elements, white text throughout

**Effects**: Autoplay muted on load, parallax on scroll, fade-in for overlay text

**Conversion tips**:
- Video with captions = 86% higher engagement
- Keep video under 90 seconds; make first 5 seconds count
- Always provide a static fallback for low-bandwidth users

---

## Pattern 10 — Scroll-Triggered Storytelling

**Keywords**: storytelling, scroll, narrative, chapters, journey

**Section order**:
```
Intro scene → Chapter 1 (problem) → Chapter 2 (journey/process) → Chapter 3 (solution/outcome) → CTA
```

**CTA placement**: End of each chapter (progressive) + final CTA after conclusion

**Color strategy**: Distinct palette per chapter (transition on scroll position), dark → medium → light progression

**Effects**: GSAP ScrollTrigger pinning, parallax layers, progressive text/element reveals

**Conversion tips**:
- 3× time-on-page increase vs standard layouts
- Progress indicator (dot nav or thin progress bar) prevents disorientation
- Chapters must follow problem → journey → resolution arc — not feature lists

---

## Pattern 11 — AI Personalization

**Keywords**: ai, personalization, dynamic, adaptive, segmentation

**Section order**:
```
Dynamic hero (segment-matched) → Relevant feature subset → Tailored testimonials → CTA
```

**CTA placement**: Context-aware — placed where analytics show highest intent

**Color strategy**: Adaptive based on user segment data; consistent fallback palette

**Effects**: Dynamic content swap with fade transitions, segment-based content variations

**Conversion tips**:
- 20%+ conversion improvement possible — but requires solid analytics infrastructure
- Always define a fallback variant for unidentified users
- Test: generic vs. segment A vs. segment B before full rollout

---

## Pattern 12 — Waitlist / Coming Soon

**Keywords**: waitlist, launch, early-access, countdown, teaser

**Section order**:
```
Hero with countdown timer → Teaser content (blurred/locked) → Email form → Social proof (waitlist count)
```

**CTA placement**: Email form above the fold + sticky banner

**Color strategy**: Dark background + brand accent, urgency indicators (red countdown numbers)

**Effects**: Countdown timer animation, confetti on signup, form validation feedback

**Conversion tips**:
- Show live waitlist count ("2,847 people waiting") — social proof + FOMO
- Referral program: "Move up the list by referring 3 friends"
- Teaser content (blurred preview) increases curiosity-driven signups

---

## Pattern 13 — Comparison Table Focus

**Keywords**: comparison, versus, features, matrix, differentiation

**Section order**:
```
Hero → Problem statement → Feature matrix (you vs. 2–3 competitors) → Deep-dive sections → CTA
```

**CTA placement**: After comparison table (in highlighted column) + page bottom

**Color strategy**: Accent/green for your checkmarks, neutral gray for competitors, white/light row alternation

**Effects**: Row hover highlight, animated checkmark reveals, sticky table header on scroll

**Conversion tips**:
- 35% higher conversion when highlighting clear superiority
- Be factual — cite sources or link to benchmark data
- Deep-dive section allows users to verify table claims

---

## Pattern 14 — Pricing-Focused Landing

**Keywords**: pricing, plans, subscription, tiers, upgrade

**Section order**:
```
Hero (value + urgency) → Pricing cards (3 tiers) → Feature comparison → FAQ → CTA
```

**CTA placement**: Inside each card + sticky nav CTA + page bottom

**Color strategy**: Popular plan highlighted (brand border + badge), color-coded tier system

**Effects**: Monthly/annual billing toggle, card hover lift, FAQ accordion

**Conversion tips**:
- Mid-tier "Most popular" badge drives 40–60% of conversions
- Annual discount (20–30%) displayed as $ saved per year, not just %
- FAQ must address cancellation, upgrade/downgrade, and data ownership

---

## Pattern 15 — App Store Style

**Keywords**: app, mobile, download, ios, android, store

**Section order**:
```
Hero with device mockup → Screenshots carousel → Feature list → User reviews → Download CTAs
```

**CTA placement**: Download buttons persistent in hero + footer + after reviews

**Color strategy**: Store-matched aesthetic, gold stars for ratings, device frames

**Effects**: Device mockup rotation on scroll, screenshot slider, star rating animation

**Conversion tips**:
- Show 4.5+ star rating with review count prominently
- QR code for desktop visitors ("scan to download")
- Separate CTAs for App Store and Google Play — never combine into one button

---

## Pattern 16 — FAQ / Documentation

**Keywords**: faq, documentation, help, support, knowledge-base

**Section order**:
```
Hero with search bar → Category navigation → Accordion FAQ sections → Related articles → Contact CTA
```

**CTA placement**: Search bar as primary entry point + contact CTA below FAQ

**Color strategy**: Clean minimal design, brand icons, green checkmarks for resolved states

**Effects**: Search autocomplete, smooth accordion height transitions, highlight on search match

**Conversion tips**:
- Search bar IS the primary CTA — make it prominent and functional
- Related articles at end of each FAQ item reduces support contact
- "Was this helpful?" micro-feedback at item level improves over time

---

## Pattern 17 — Immersive / Interactive

**Keywords**: immersive, 3d, animation, experience, webgl, game

**Section order**:
```
Full-screen interactive experience → Guided tour overlay → Benefits reveal → CTA
```

**CTA placement**: After experience completion + "Skip" option (always visible)

**Color strategy**: Dark background for focus, brand accent for UI chrome

**Effects**: WebGL / Three.js scene, gamification elements, reward animations

**Conversion tips**:
- 40% engagement increase vs. static pages
- Always provide "Skip to product" — don't trap users
- Mobile fallback is mandatory — video or static for < 768px
- Keep load under 3s or show progress indicator

---

## Pattern 18 — Event / Conference

**Keywords**: event, conference, registration, summit, meetup

**Section order**:
```
Hero (event name + date + countdown) → Speaker lineup → Agenda/schedule → Sponsors → Registration form
```

**CTA placement**: Sticky "Register Now" nav button + after speakers section

**Color strategy**: Urgency palette (limited seats), professional speaker cards, neutral sponsor logos

**Effects**: Countdown timer, speaker card hover with bio reveal, agenda tab switching

**Conversion tips**:
- Early-bird deadline creates urgency — display clearly with countdown
- Speaker credibility drives registration more than agenda
- Display remaining spots if under 50

---

## Pattern 19 — Product Review / Ratings

**Keywords**: reviews, ratings, social-proof, e-commerce, trust

**Section order**:
```
Hero (product + aggregate rating) → Rating breakdown → Individual reviews → Buy CTA
```

**CTA placement**: After rating summary + alongside individual reviews (sticky on desktop)

**Color strategy**: Trust colors (blue/green), gold stars, green "Verified Purchase" badges

**Effects**: Star rating animation on load, review filtering, image lightbox

**Conversion tips**:
- "Verified purchase" badge increases trust significantly
- Filter by rating (1–5 stars) reduces anxiety for concerned buyers
- Highlight the most helpful positive AND negative review — transparency builds trust

---

## Pattern 20 — Community / Forum

**Keywords**: community, forum, members, social, network

**Section order**:
```
Hero (community value) → Topic categories → Active member showcase → Recent activity → Join CTA
```

**CTA placement**: "Join the Community" prominent in hero + after member showcase

**Color strategy**: Warm tone, member photo avatars, brand badges for contributors

**Effects**: Live member count updates, avatar cluster animations, activity ticker

**Conversion tips**:
- Show member count + posts today + online now — proof of activity
- Feature 3–5 notable members with real bios
- "Join free" removes pricing friction for community CTAs

---

## Pattern 21 — Before-After Transformation

**Keywords**: transformation, results, comparison, before-after, outcome

**Section order**:
```
Hero (problem statement) → Before/After slider or split view → How it works (3 steps) → Results/metrics → CTA
```

**CTA placement**: After slider interaction + page bottom

**Color strategy**: Muted/grey palette for "before" state, vibrant color for "after", green for metric numbers

**Effects**: Drag-to-compare slider interaction, animated metric counters, step entrance animations

**Conversion tips**:
- 45% higher conversion with specific metrics ("from 4h to 12 minutes")
- Use real customer transformations — not generic copy
- Counter animations trigger on scroll into view

---

## Pattern 22 — Marketplace / Directory

**Keywords**: marketplace, directory, search, listing, platform

**Section order**:
```
Hero (search-focused) → Category grid → Featured listings → Trust indicators → Host/list CTA
```

**CTA placement**: Search bar as primary CTA + "List your item" in nav

**Color strategy**: High contrast search bar, visual category icons, brand accent

**Effects**: Search autocomplete suggestions, map pin animations, listing carousel

**Conversion tips**:
- Search bar IS the primary CTA — not a button
- Show popular search suggestions to guide users
- Dual CTAs: "Find X" for buyers + "List your X" for sellers

---

## Pattern 23 — Newsletter / Content First

**Keywords**: newsletter, blog, subscribe, content, editorial

**Section order**:
```
Hero (value prop + inline subscribe form) → Archive samples → Subscriber count → Author bio
```

**CTA placement**: Hero inline subscribe form + sticky header variant

**Color strategy**: Minimalist, paper-like, single accent for subscribe button

**Effects**: Typewriter effect for tagline, text highlight animations, sample issue preview

**Conversion tips**:
- Email-only form (no name field) maximizes conversion
- Show reader count ("Trusted by 14,200 readers")
- Archive samples let people judge content quality before subscribing

---

## Pattern 24 — Webinar Registration

**Keywords**: webinar, registration, training, online-event, workshop

**Section order**:
```
Hero (topic + timer + form) → Learning outcomes list → Speaker bio → Bonuses → Repeat form
```

**CTA placement**: Hero right-column form (above fold) + repeat form at bottom

**Color strategy**: Urgency (red/orange) for timer, professional blue for credibility, white form background

**Effects**: Countdown clock, speaker headshot float animation, seat ticker

**Conversion tips**:
- Limited seats display ("Only 47 seats remaining")
- "Live" indicator badge increases perceived urgency
- Auto-detect and display user's timezone — remove all timezone friction

---

## Pattern 25 — Enterprise Gateway

**Keywords**: enterprise, corporate, trust, b2b, sales

**Section order**:
```
Hero (mission video or statement) → Solutions by industry → Solutions by role → Client logos → Contact Sales
```

**CTA placement**: "Contact Sales" as primary (not a sign-up) + "Request Demo" secondary + nav login

**Color strategy**: Navy/grey corporate palette, conservative accent, no bright consumer colors

**Effects**: Slow hero video (no autoplay audio), logo carousel, industry/role tab switching

**Conversion tips**:
- Path selection (by industry OR by role) reduces cognitive load
- Mega menu supports complex product portfolios
- "Schedule a call" > "Contact Sales" — lower friction language

---

## Pattern 26 — Portfolio Grid

**Keywords**: portfolio, gallery, masonry, creative, work

**Section order**:
```
Hero (name + role + tagline) → Project grid → About/philosophy section → Contact
```

**CTA placement**: Card hover CTA ("View Project") + footer contact CTA

**Color strategy**: Neutral background (let the work set the palette), minimal brand accent

**Effects**: Lazy-load images, hover overlay with project title + type, lightbox on click

**Conversion tips**:
- Visuals first — clients judge on work, not copy
- Filter by category (Web / Mobile / Brand) helps targeted visitors
- 6–12 projects is ideal — curate ruthlessly

---

## Pattern 27 — Horizontal Scroll Journey

**Keywords**: horizontal, journey, storytelling, scroll, cinematic

**Section order**:
```
Intro section (vertical) → Horizontal journey chapters → Detail reveals → Footer (vertical)
```

**CTA placement**: Floating sticky CTA alongside journey OR at journey end

**Color strategy**: Palette transitions chapter to chapter, `#000000` progress bar, chapter accent colors

**Effects**: GSAP horizontal scroll with ScrollTrigger, parallax layers, chapter progress indicator

**Conversion tips**:
- High engagement pattern — but always keep nav visible
- Chapter indicator shows position to prevent disorientation
- Smooth transition back to vertical scroll at end

---

## Pattern 28 — Bento Grid Showcase

**Keywords**: bento, features, apple-style, grid, showcase

**Section order**:
```
Hero → Bento grid (feature cards, varied sizes) → Detail/spotlight cards → Specs/comparison → CTA
```

**CTA placement**: Floating FAB or grid bottom anchor

**Color strategy**: `#F5F5F7` or glass card backgrounds, vibrant icon accents, dark text

**Effects**: Hover scale (`1.02`), embedded mini-videos in cards, tilt effect, staggered reveal

**Conversion tips**:
- High information density — use large cards for key features
- Cards must stack to single column on mobile (no horizontal scroll)
- Embed short looping videos in key cards (muted, no controls)

---

## Pattern 29 — Interactive 3D Configurator

**Keywords**: 3d, configurator, customizer, product, e-commerce

**Section order**:
```
Hero (configurator UI) → Feature highlight panel → Price/specs display → Purchase CTA
```

**CTA placement**: Inside configurator UI + sticky bottom bar with current config summary

**Color strategy**: Studio/neutral background, realistic materials, minimal UI chrome overlay

**Effects**: Real-time Three.js/WebGL rendering, material/color swap, 360° rotation, zoom

**Conversion tips**:
- 360° view reduces return rates significantly
- "Add to cart" directly from configurator — don't force a page navigation
- Save/share configuration link increases return visits

---

## Pattern 30 — AI-Driven Dynamic

**Keywords**: ai, dynamic, adaptive, generative, demo, tool

**Section order**:
```
Prompt/input hero → Generated preview → How it works → Value proof → CTA
```

**CTA placement**: Input field as primary CTA + "Try it" buttons throughout

**Color strategy**: Dark compute aesthetic, neon accent, adaptive output colors

**Effects**: Typing/generation effects, shimmer loading states, morphing output animations

**Conversion tips**:
- Immediate demonstration — let users try before signup
- Low friction: pre-fill example prompts
- Show generation process (not instant) — perceived quality increases with visible work

---

## Pattern 31 — Feature-Rich Showcase

**Keywords**: feature-rich, showcase, product, capabilities, comprehensive

**Section order**:
```
Hero → Feature grid (4–6 items) → Use case scenarios → Social proof → CTA
```

**CTA placement**: Sticky hero + after feature grid + page bottom

**Color strategy**: Brand primary, `#FAFAFA` card backgrounds, accent icon colors

**Effects**: Hover lift on feature cards, scroll-triggered feature reveals, micro-interactions on icons

**Conversion tips**:
- Clear visual hierarchy — one message per feature card
- Use case section bridges features to real-world benefit
- Social proof after features, not before (feature comprehension first)

---

## Pattern 32 — Hero-Centric Design

**Keywords**: hero-centric, hero-first, immersive-hero, visual-impact

**Section order**:
```
Full-bleed hero (60–80% viewport) → Value prop strip → Benefit/proof row → Primary CTA
```

**CTA placement**: Hero dominant (centered or lower-third) + sticky nav

**Color strategy**: High-impact hero visual, minimal text, 7:1 contrast ratio on CTA

**Effects**: Parallax on hero image/video, pulse/glow animation on CTA on scroll entry

**Conversion tips**:
- 60–80% of viewport should be hero — commit to it
- ONE primary CTA — no secondary options in hero
- Hero copy: max 8 words headline + 1 sentence sub

---

## Pattern 33 — Trust & Authority

**Keywords**: trust, authority, credibility, compliance, enterprise

**Section order**:
```
Hero (mission/statement) → Proof row (logos + certs + stats) → Solution overview → CTA path
```

**CTA placement**: "Contact Sales" or "Get a Quote" as primary + demo request secondary

**Color strategy**: Navy/grey palette, trust blue accents, brand accent ONLY on CTA

**Effects**: Logo carousel (client logos), animated stat counters, testimonial carousel

**Conversion tips**:
- Security/compliance badges in hero (SOC 2, ISO 27001, GDPR)
- Case study links alongside stats — let them verify
- Transparent pricing or "pricing on request" must be clear — ambiguity kills enterprise trust

---

## Pattern 34 — Real-Time / Operations

**Keywords**: real-time, operations, dashboard, monitoring, status

**Section order**:
```
Hero (product + live data preview) → Key metrics/indicators → How it works → CTA
```

**CTA placement**: Primary in nav ("Start Monitoring") + after metrics section

**Color strategy**: Dark/neutral background, green/amber/red status colors, minimal decoration

**Effects**: Live ticker animations, status pulse indicators, real-time number counters

**Conversion tips**:
- Demo/sandbox link is the most effective CTA for ops tools
- Show real (or realistic demo) live data — static screenshots kill credibility
- Uptime/reliability stats (e.g., "99.99% uptime") are the primary trust signal

---

## CTA Placement Rules (Cross-Pattern)

Place CTAs in exactly 3 zones for optimal conversion:

1. **Hero section** — immediate visibility (sticky nav variant)
2. **Post-feature/proof reveal** — after value comprehension
3. **Page bottom** — final catch for scrollers

Additional rules:
- Sticky navbar CTA: persistent, 20–30% smaller than section CTAs, same color
- CTAs before social proof underperform — always lead with proof, then ask
- CTA text: verb-first ("Start", "Get", "Try", "Join") + benefit noun — never "Submit" or "Click Here"
- Mobile: sticky bottom CTA bar in addition to in-content CTAs

---

## Social Proof Formulas

| Type | Spec | Placement |
|------|------|-----------|
| Testimonials | 3–5 cards, photo + name + role + company | Before nearest CTA |
| Logo bar | 5–8 client logos, grayscale, single row | Hero lower section |
| Stats | 3 metrics (users, uptime, rating), counter animation | Post-feature or hero strip |
| Star rating | Score + count + source platform | Review pages, hero badge |
| Case studies | Title + metric outcome + link | After stats, before CTA |

---

## Form Conversion Rules

- ≤ 3 fields = maximum conversion; every additional field costs ~10% conversion
- Single-column layout always
- Real-time validation on blur (not on keystroke)
- Error state: red border + message below field (never above)
- Submit button: full-width, high contrast, verb + noun ("Get My Free Guide")
- Social login reduces friction by ~30% — offer where appropriate
- Progress indicator for multi-step forms (show step X of Y)

---

## Mobile Optimization Rules

- Reduce animation intensity by 2 levels on mobile (check `prefers-reduced-motion`)
- Stack all grid/flex layouts to single-column below 768px
- Touch targets: 48px minimum (44px Apple HIG / 48dp Material Design)
- Sticky bottom CTA bar (not just top nav)
- Reduce hero headline to `text-3xl` / `text-4xl` (clamp `1.75rem`–`2.5rem`)
- Disable parallax effects on mobile (performance + motion sensitivity)

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Fix |
|---|---|---|
| Multiple competing CTAs in one viewport | Splits attention, reduces clarity | One primary CTA per viewport section |
| "Learn More" as primary CTA | Too vague, no commitment | Action verb + benefit ("See How It Works") |
| Hero without clear value prop | Users leave in < 5s | Headline = who it's for + what it does |
| Stock photography in hero | Erodes trust immediately | Product screenshots, real team, custom illustrations |
| Text walls without visual breaks | Skimmers leave | Max 3 sentences per block; add icons/images |
| No social proof above fold | Trust not established before CTA | Logo bar or rating badge in hero |
| Testimonials after CTA | Proof too late | Always testimonials → CTA, not reverse |
| Form with > 5 fields | Conversion drops sharply | Remove non-essential fields ruthlessly |
