---
name: platform
description: Platform surfaces — mobile/PWA, React Native, i18n, SEO/metadata, payments, transactional email, AI chat UI. Use when the work targets a platform surface rather than a generic component — mobile and PWA patterns, React Native/Expo, internationalization and RTL, SEO and metadata, Stripe payments, transactional email, AI chat and streaming UI.
version: "14.8.1"
core-deps:
  - core/component-api.md
  - core/accessibility-baseline.md
---

# Platform

## When to Use
Work that targets a platform surface rather than a generic component: mobile-native patterns and PWA, React Native/Expo, internationalization and RTL, SEO and metadata, Stripe payments, transactional email, AI chat/streaming UI, background-job and agent-status interfaces.

## Stack
React 19 · Next.js App Router · Expo (RN) · next-intl · Stripe · React Email + Resend · Vercel AI SDK

## Core Rules
1. **Mobile is not a narrow desktop.** Bottom tab nav for primary navigation, bottom sheets over centre modals, pull-to-refresh where a list is the content, `env(safe-area-inset-*)` on anything full-bleed.
2. **Touch targets ≥44×44px** with ≥24px spacing; `touch-action: manipulation`; `overscroll-behavior: contain` in sheets and drawers.
3. **React Native is a different renderer, not different rules.** `SafeAreaView`, `Pressable` (never a bare `TouchableOpacity` for primary actions), `FlatList` with `keyExtractor`, Reanimated for motion, 44pt targets, dark mode via `useColorScheme`.
4. **i18n from the start.** `next-intl` routing, ICU messages, `Intl.*` for dates/numbers/currency, RTL via CSS logical properties (never `margin-left`), copy expansion budget of ~30% for German.
5. **SEO is structural.** Next.js metadata API, Open Graph, JSON-LD, sitemap and robots, canonical URLs, and Core Web Vitals as the ranking-relevant part — LCP image `priority`, no CLS from unsized media.
6. **Payments.** Stripe PaymentElement over hand-built card fields, Appearance API for brand match, error handling by decline code, webhooks for truth (never trust the client), saved methods behind explicit consent.
7. **Email is a different CSS universe.** Tables for layout, inline styles, no flex/grid, ~600px width, dark-mode-safe colours, plain-text alternative, tested across clients.
8. **AI chat UI.** Stream tokens, keep a stop control, autoscroll only when the user is at the bottom, announce completion via `aria-live`, surface tool calls rather than hiding them.
9. **Long-running work needs status, not spinners** — progress, an estimate, a cancel path, and `aria-live` announcements.

## Patterns
- **Bottom sheet** (vaul) with snap points and safe-area padding.
- **PWA** — manifest, install prompt, offline shell, `pointer: coarse` guards.
- **Locale switcher** — path-based routing, preserved deep link.
- **Checkout** — PaymentElement + order summary + four states (see also `forms`).
- **OTP email** — React Email template + Resend Server Action.

## Examples
`examples/good-mobile.tsx` (bottom nav, sheet, pull-to-refresh, swipe) · `examples/good-react-native.tsx` (Expo Router, gesture-handler, Reanimated) · `examples/good-ai-chat.tsx` (streaming, stop, autoscroll).

## Reference Index
Load only for the specific task:

| Task | Load |
|---|---|
| Bottom nav, sheets, pull-to-refresh, PWA, safe areas | `references/mobile-patterns.md` |
| Expo Router, Reanimated, NativeWind, FlatList, haptics | `references/react-native.md` |
| next-intl routing, pluralization, RTL, locale switcher | `references/i18n.md` |
| Metadata API, JSON-LD, sitemap, Core Web Vitals | `references/seo.md` |
| Stripe PaymentElement, subscriptions, webhooks, portal | `references/payments.md` |
| React Email + Resend, email-safe CSS, OTP/welcome/reset | `references/email-templates.md` |
| useChat, streamText, tool calling, RSC streaming | `references/vercel-ai-sdk.md` |
| Agent status, SSE, background jobs, human-in-the-loop | `references/subagent-orchestration.md` |
| A/B testing, analytics, adaptive defaults, rollout | `references/continuous-learning.md` |

## Constraints
Shared baseline applies everywhere: TypeScript strict, OKLCH tokens, four states with no fake delays, WCAG 2.2 AA, `prefers-reduced-motion`. Platform-specific: safe-area insets on full-bleed, `SAFE-01`/`TOUCH-01` for mobile surfaces, logical properties for RTL, `Intl.*` for all locale-sensitive formatting.
