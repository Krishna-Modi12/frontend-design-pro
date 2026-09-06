# Industry-Specific Design Reasoning Rules

Source: nextlevelbuilder/ui-ux-pro-max-skill (161 rules condensed)

## How to Use

When Step 2 identifies a product type, find the matching section below. Apply the industry-specific rules ON TOP of the standard pipeline. Brand-provided DESIGN.md values always override these defaults.

---

## SaaS / Dashboard / Admin

**Visual Language:** Trust blue + functional accents. Clean, information-dense but not cluttered.
**Typography:** Sans-serif only. Serif fonts are BANNED for software UI. Use Geist, Inter (body only), or Plus Jakarta Sans.
**Color:** Primary blue (#0052FF or similar), success green, warning amber, error red. Dark mode mandatory.
**Layout:** Sidebar + main content. Data tables with sort/filter. Metric cards at top.
**Animation:** Subtle. Skeleton loaders, micro-transitions on state changes. No decorative animation.
**Anti-patterns:** Avoid dark mode by default (let user choose), avoid AI purple/pink gradients, avoid marketing-style hero sections in app UI.
**Key metrics:** Time-to-insight, task completion rate.

## Marketing / Landing Page

**Visual Language:** Bold, conversion-focused. Clear hierarchy leading to CTA.
**Typography:** Display fonts for headlines (Clash Display, Cabinet Grotesk). Large type contrast (5:1 heading:body ratio).
**Color:** Brand-first. Single strong accent for CTA with 7:1 contrast ratio. Limit to 3 colors max.
**Layout:** Hero → Social proof → Features → Pricing → CTA. Sticky nav CTA.
**Animation:** Scroll-triggered reveals, staggered entrances, parallax. MOTION_INTENSITY 5–8.
**Anti-patterns:** Avoid walls of text, avoid multiple competing CTAs, avoid stock photography.
**Conversion:** Forms ≤ 3 fields. Testimonials BEFORE CTA. Place CTA in 3 zones: hero, post-feature, footer.

## E-commerce / Product

**Visual Language:** Product-focused. Trust signals. Urgency without pressure.
**Typography:** Clean sans-serif. Price in bold, larger than surrounding text.
**Color:** Success green for "Add to Cart". Urgency orange for limited stock. Trust badges in muted tones.
**Layout:** Product grid (varied sizes, not equal cards), quick-view modals, sticky add-to-cart on mobile.
**Animation:** Smooth cart updates, add-to-cart confirmation, image zoom on hover.
**Anti-patterns:** Avoid cluttered product cards, avoid hidden shipping costs, avoid autoplay video.

## Fintech / Banking / Crypto

**Visual Language:** Precision, security, trust. Dark backgrounds with bright data accents.
**Typography:** Monospace for numbers/prices. System sans-serif for UI. Tabular numerals (`font-variant-numeric: tabular-nums`).
**Color:** Dark base (#0A0A0F to #1A1A2E). Green for gains, red for losses. Gold/amber for premium features. Bitcoin orange (#F7931A) for crypto.
**Layout:** Dense data grids, real-time charts, portfolio summaries. Persistent nav with account balance.
**Animation:** Real-time number tickers, chart transitions, loading shimmer. No playful motion.
**Anti-patterns:** NEVER use AI purple/pink gradients. NEVER use playful illustrations. Avoid round numbers in mock data.
**Security:** 2FA UI patterns, session timeout warnings, sensitive data masking (•••• 4242).

## Healthcare / Medical / Wellness

**Visual Language:** Calm, trustworthy, accessible. High contrast for aging users.
**Typography:** Highly legible. Atkinson Hyperlegible or similar. Minimum 18px body text.
**Color:** Calming cyan/teal (#0891B2), health green (#10B981), warm white backgrounds. Avoid harsh reds (use for emergencies only).
**Layout:** Clear information hierarchy, large touch targets (minimum 48px), generous whitespace.
**Animation:** Minimal. Gentle transitions only. No sudden movements.
**Anti-patterns:** Avoid dark mode as default, avoid dense data tables (progressive disclosure instead), avoid harsh animations.
**Accessibility:** WCAG AAA target (7:1 contrast). Screen reader optimization mandatory.

## Content / Blog / Documentation

**Visual Language:** Reading-optimized. Typography-first design.
**Typography:** Serif for body text (Lyon Text, Lora, Merriweather). `max-w-[65ch]` for optimal line length. `leading-relaxed` (1.625).
**Color:** Warm, low-contrast backgrounds (#FAFAF9 or similar). Minimal accent colors.
**Layout:** Single column with TOC sidebar. Clear heading hierarchy. Code blocks with syntax highlighting.
**Animation:** Almost none. Smooth scroll, subtle link hover. MOTION_INTENSITY 1–2.
**Anti-patterns:** Avoid sidebar ads, avoid infinite scroll without progress indicator, avoid low-contrast body text.

## Portfolio / Creative

**Visual Language:** Showcase-focused. Design IS the content.
**Typography:** Experimental display fonts allowed. Large headlines (80px+). Creative type hierarchy.
**Color:** Brand-specific. Black/white base with one signature accent is classic approach.
**Layout:** Full-bleed images, case study grids (varied sizes), horizontal scroll for galleries.
**Animation:** MOTION_INTENSITY 7–9. Page transitions, image reveals, cursor effects, scroll-driven.
**Anti-patterns:** Avoid template-looking grids, avoid generic stock content, avoid slow loading without progress.

## Gaming / Entertainment

**Visual Language:** Immersive, energetic, high-contrast.
**Typography:** Bold, condensed display fonts. Neon/glow effects for headings.
**Color:** Dark base with vivid accents. Neon purple (#A855F7), electric blue (#3B82F6), hot pink (#EC4899).
**Layout:** Full-screen sections, parallax backgrounds, immersive scroll.
**Animation:** MOTION_INTENSITY 8–10. Particle effects, 3D elements, cinematic transitions.
**Anti-patterns:** Avoid corporate aesthetics, avoid walls of text, avoid slow page loads.

---

## Universal Anti-Patterns by Industry

These patterns are flagged as mistakes across 15+ industry categories:
1. AI purple/pink gradients applied indiscriminately
2. Dark mode forced as default (except fintech/gaming)
3. Missing search functionality in content-heavy apps
4. Generic placeholder data (round numbers, "Lorem ipsum")
5. Hover-dependent interactions on mobile
6. Missing loading states for async content
7. Insufficient color contrast for text
8. Auto-playing media without user consent

---

## Expanded Vertical Rules

### SaaS / Dashboard / Admin — Detailed

**Component must-haves:** Sidebar navigation with collapsible sections, metric cards (KPI strip) at page top, sortable/filterable data tables, breadcrumb trail, global search (cmd+K), notification bell, user avatar menu, skeleton loaders on every async surface.

**Color conventions:** Primary blue `oklch(52% 0.22 264)` for interactive elements. Success `oklch(62% 0.18 145)`. Warning `oklch(72% 0.16 75)`. Error `oklch(55% 0.22 25)`. Surface tokens: `oklch(99.5% 0.004 255)` light / `oklch(14% 0.01 255)` dark.

**Typography norms:** Inter or Geist, 14px body, 12px labels, 24–32px metric values in `font-weight: 700`. Tabular numerals everywhere numbers appear. Column headers in `font-weight: 500`, `text-transform: uppercase`, `letter-spacing: 0.05em`.

**Trust signals:** SOC 2 Type II badge in footer or security page. SSL padlock on auth pages. Audit log page. Role-based access labels. "Your data is encrypted at rest" copy near sensitive settings.

**Performance budget:** LCP ≤ 2.0s. Dashboard initial load: ≤ 1.5s to skeleton, ≤ 3.0s to full data. Use TanStack Query with `staleTime: 60_000` and skeleton placeholders to eliminate blank states.

**Anti-patterns:** Marketing hero sections inside the app shell. Decorative gradients on data tables. Emoji in column headers. Modal dialogs for non-critical confirmations (use inline confirmation instead). Round numbers in demo data.

---

### Marketing / Landing Page — Detailed

**Component must-haves:** Full-width hero with headline + sub-headline + primary CTA, social proof strip (logos or testimonials), feature grid (3 or 6 columns), pricing table with highlighted recommended plan, FAQ accordion, sticky nav with CTA button.

**Color conventions:** Single brand accent for all CTAs — must be consistent across the page. Background alternates between white and a very light tint (`oklch(97% 0.005 264)`) to create section rhythm without borders.

**Typography norms:** Display font (Clash Display, Cabinet Grotesk, or similar) for H1/H2 at 56–96px. Body in Inter or system sans at 18px, `leading-7`. CTA buttons: 16–18px, `font-weight: 600`. Hero headline line-height: 1.1.

**Trust signals:** Customer logos (recognizable brands, varied sizes). Star ratings with review counts (must be real or clearly fictional). "As seen in" press mentions. Named testimonials with photo, title, company. Money-back guarantee badge.

**Performance budget:** LCP ≤ 1.5s. Hero image must use `<Image>` with `priority` prop. Above-the-fold JS bundle ≤ 50kB gzipped. Use `loading="lazy"` on all below-fold images.

**Anti-patterns:** Multiple equally-weighted CTAs competing on the same screen. Stock photography of people pointing at laptops. "Revolutionary" / "game-changing" copy. Form with more than 3 fields in the hero. Auto-playing background video.

---

### E-commerce / Commerce — Detailed

**Component must-haves:** Product image gallery with zoom, size/variant selector, "Add to Cart" with loading state, sticky cart summary sidebar on checkout, order progress stepper, trust badge strip (secure checkout, free returns, support), product reviews with star distribution.

**Color conventions:** "Add to Cart" always in success green `oklch(62% 0.18 145)`. "Sold out" in muted gray. Discount price in red `oklch(55% 0.22 25)`, original price struck through. Urgency badges ("Only 3 left") in amber `oklch(72% 0.16 75)`.

**Typography norms:** Product title 20–24px `font-weight: 600`. Price 24–32px `font-weight: 700`. Description body 16px `leading-7`. Review text 14px. Category filters 13px uppercase labels.

**Trust signals:** Star rating + review count adjacent to product title. "Verified Purchase" label on reviews. Payment method icons (Visa, Mastercard, PayPal, Apple Pay). "Free shipping over $X" callout. 30-day return policy in cart sidebar.

**Performance budget:** LCP ≤ 2.5s. Product image above fold: WebP, `srcset` with 400/800/1200px, `loading="eager"`. Product grid: virtualize beyond 50 items (use `react-virtual`).

**Anti-patterns:** Hidden shipping costs revealed only at checkout. Auto-advancing image carousel. "Limited time offer" countdown timers that reset on refresh. Pop-up discount modals that appear immediately on page load. Equal-sized product cards that make varied products look identical.

---

### Fintech / Banking / Crypto — Detailed

**Component must-haves:** Portfolio balance display with masked mode toggle (show/hide values), real-time price ticker, transaction history table with filters, send/receive flow with confirmation step, 2FA prompt, session timeout warning modal, sensitive data masking (••••4242).

**Color conventions:** Dark base mandatory. `oklch(10% 0.01 255)` background. Gains: `oklch(62% 0.18 145)` (green). Losses: `oklch(55% 0.22 25)` (red). Premium/gold tier: `oklch(72% 0.16 75)` (amber). Never use gradient purples — they signal "crypto scam" to informed users.

**Typography norms:** All monetary values in monospace with `font-variant-numeric: tabular-nums`. Avoid rounding — show `$1,284.73` not `$1.2k`. Use `Geist Mono` or `JetBrains Mono` for price displays. UI labels in Inter or Geist sans.

**Trust signals:** Lock icon on all form fields collecting financial data. "Bank-level encryption" copy with TLS/AES reference. FDIC insured badge (if applicable). SOC 2 Type II in footer. Two-factor authentication with explicit "Your account is protected" confirmation screen.

**Performance budget:** LCP ≤ 1.5s. Real-time data: WebSocket connection with reconnect logic, visual indicator for connection status. No user should see stale price data without a staleness indicator.

**Anti-patterns:** Round numbers in portfolio mock data (use `$14,382.47` not `$15,000`). Playful illustrations (rockets, confetti) on serious financial flows. Vague error messages on transaction failures — always show specific reason + action. Red flash animations on price drops without prefers-reduced-motion guard.

---

### Healthcare / Medical / Wellness — Detailed

**Component must-haves:** Patient/user profile header with key health metrics, appointment scheduling calendar, medication reminder list, dosage instructions with clear hierarchy, emergency contact section, HIPAA notice banner, accessibility toolbar (font size, contrast toggle).

**Color conventions:** Calm palette: `oklch(70% 0.14 200)` (teal), `oklch(62% 0.18 145)` (health green), `oklch(98% 0 0)` warm white background. Reserve red `oklch(55% 0.22 25)` only for critical alerts/emergencies. Never use dark mode as default — it reduces readability for aging users.

**Typography norms:** Minimum 18px body text. Prefer Atkinson Hyperlegible or similar high-legibility font. Line height 1.7 for instructional content. Headings max 32px (avoid the overwhelming scale of marketing sites). All interactive elements minimum 48px touch target.

**Trust signals:** HIPAA compliance notice visible on data-collection forms. "Your health data is private" statement with link to privacy policy. Doctor/provider credentials displayed with credentials (MD, RN). SSL indicators. Clear data deletion policy.

**Performance budget:** LCP ≤ 2.5s. Prioritize content over decoration. Images: always include meaningful alt text describing medical content. Forms: auto-save draft state — losing a health intake form is a critical UX failure.

**Anti-patterns:** Dense data tables without progressive disclosure. Animation near medical alert content (seizure risk). Dark mode forced on elderly users. Gamification elements (badges, streaks) on serious medical contexts. Chatbot that cannot escalate to a human.

---

### 3D Experience / Immersive / WebGL — Detailed

**Component must-haves:** Loading progress indicator (3D scenes can be 5–30MB), fallback for devices without WebGL, play/pause control for animations, camera reset button, mobile touch-drag orbit control, performance warning for low-end devices.

**Color conventions:** Dark base preferred — `oklch(8% 0 0)` — so 3D lighting stands out. Accent UI in high-contrast white or neon. Avoid competing background colors that clash with 3D scene lighting. UI overlay elements: semi-transparent dark panels `oklch(10% 0 0 / 70%)`.

**Typography norms:** Minimal text in immersive experiences. When text exists: white or near-white, `font-weight: 300–400` (light weight reads better over dark 3D). Avoid serif fonts in 3D UI overlays. Caption text 14px minimum — never smaller in immersive context.

**Trust signals:** "Works best in Chrome/Firefox" browser notice if using experimental WebGPU. Frame rate indicator in dev mode. Graceful fallback image when WebGL not supported. Clear "Exit" or "Back" affordance — users must never feel trapped in an immersive experience.

**Performance budget:** Initial load: WebGL canvas visible ≤ 3.0s with progress bar. Target 60fps on mid-range desktop; 30fps acceptable on mobile. Geometry: compress with Draco for GLTF. Textures: KTX2 + Basis compression. Use `<Suspense>` with skeleton for Spline embeds.

**Anti-patterns:** No loading state for a 20MB 3D asset. Autoplay audio in 3D scenes. Full-screen 3D with no escape route. Requiring WebGL 2.0 without checking support. Spline embed without a `<noscript>` fallback image.

---

### Portfolio / Creative — Detailed

**Component must-haves:** Full-bleed project hero images, case study structure (problem → process → outcome), contact form, work grid with varied card sizes (avoid symmetrical sameness), "Selected work" vs "All work" toggle, cursor effects or custom cursor.

**Color conventions:** Strong personal brand identity — black/white base with one signature accent is the classic approach. Signature accent must appear consistently on hover states, active links, and CTA elements. Avoid generic blue links — this is your design voice.

**Typography norms:** Experimental display fonts for headlines (PP Neue Montreal, Founders Grotesk, editorial serifs). Body text for case studies: 18px, `leading-7`, `max-w-[65ch]`. Large headline sizing: 80–160px on desktop for hero statements. Creative ligature and kerning adjustments are expected.

**Trust signals:** Featured in / Awards section (Awwwards, CSS Design Awards). Client logos or project credits. Process documentation showing depth of thinking. Real project outcomes with metrics ("Increased conversions 34%"). Availability status ("Open for freelance — Q3 2026").

**Performance budget:** LCP ≤ 2.0s even with large imagery. Use Next.js `<Image>` with `priority` for above-fold project hero. Lazy-load below-fold images. Page transitions: use View Transition API or Framer Motion layout animations — must not block interactivity.

**Anti-patterns:** Template-looking equal-height card grids. Generic Unsplash placeholder images in a portfolio. "Coming soon" project cards. Contact form with 8+ fields. Loading spinners that last > 2s without progress indication. Fonts that load after content (use `font-display: swap` or preload).

---

### Gaming / Entertainment — Detailed

**Component must-haves:** Hero section with cinematic video or 3D background, game feature showcase with parallax, character/item showcase grid, leaderboard or social proof mechanic, countdown timer for launch/event, mobile-optimized nav with touch gestures.

**Color conventions:** Dark immersive base `oklch(8–12% 0 0)`. Vivid accent palette: electric blue `oklch(60% 0.28 264)`, neon purple `oklch(58% 0.28 300)`, hot pink `oklch(62% 0.28 340)`. Glow effects: `box-shadow: 0 0 24px oklch(60% 0.28 264 / 60%)`. Gold for achievements/premium `oklch(75% 0.18 75)`.

**Typography norms:** Bold condensed display fonts (Barlow Condensed, Bebas Neue, Tungsten). Headline size: 96–160px. Body text rare and short. Glow/outline text effects on headings acceptable and expected. All-caps for UI labels, CTAs, and navigation.

**Trust signals:** Player count ("2.4M active players"). Community Discord link with member count. Press quotes from gaming outlets (IGN, Kotaku). Twitch/YouTube integration or clip gallery. "Free to play" or "No pay-to-win" callout if applicable.

**Performance budget:** LCP ≤ 2.5s despite heavy assets. Video: use `<video>` with `preload="metadata"`, poster image shows instantly. Particle effects: use CSS or lightweight canvas — avoid Three.js for purely decorative particles. Target 60fps scroll performance — test on mid-range Android.

**Anti-patterns:** Corporate-looking sans-serif body fonts. White backgrounds (kills immersion). Static flat imagery where competitors use video/animation. Slow-loading hero with no visual feedback. Inaccessible contrast on dark backgrounds (dark gray text on dark backgrounds). Missing mobile navigation — gaming audiences are majority mobile.
