# Email Templates Reference

Source: react.email + resend.com (official patterns)
Version: 10.15.0

React Email + Resend = transactional email in Next.js. React components compile to email-safe HTML.
Resend sends via Server Actions or API routes.

---

## Email vs Web CSS — Critical Differences

| Feature | Web | Email |
|---------|-----|-------|
| Flexbox | ✅ | ❌ Outlook breaks — use `<table>` |
| CSS Grid | ✅ | ❌ Not supported |
| CSS Variables | ✅ | ❌ Not supported |
| External CSS | ✅ | ❌ Inline styles only |
| `position: fixed/absolute` | ✅ | ❌ Not supported |
| `backdrop-filter` | ✅ | ❌ Not supported |
| Web fonts | ✅ | ⚠️ Apple Mail/iOS only — always include fallback |
| `max-width` on `<div>` | ✅ | ⚠️ Use on `<table>` instead |
| `border-radius` | ✅ | ⚠️ Outlook ignores — cosmetic only |
| Media queries | ✅ | ⚠️ Gmail/Apple Mail yes; Outlook no |
| Dark mode | ✅ | ⚠️ Partial — needs `@media (prefers-color-scheme: dark)` |

**Golden rule:** When in doubt, use `<table>` for layout and inline styles for everything.

---

## Installation

```bash
npm install @react-email/components react-email
npm install resend
```

```bash
# Preview server
npx react-email dev
# Opens http://localhost:3000
```

---

## React Email Primitives

```tsx
import {
  Html,         // Root wrapper — sets lang, dir
  Head,         // <head> — for fonts, meta
  Body,         // <body> with default styles
  Container,    // Center-aligned max-width table wrapper
  Section,      // Block-level grouping (<table> under the hood)
  Row,          // Table row
  Column,       // Table cell
  Text,         // Paragraph / heading text
  Button,       // CTA button (table-based, works in Outlook)
  Img,          // Email-safe image (always set width + height)
  Link,         // Anchor tag
  Hr,           // Horizontal rule
  Preview,      // Preview text (shows in inbox before opening)
  Font,         // Web font loader (Apple Mail / iOS only)
} from '@react-email/components'
```

---

## Welcome Email — Full Example

```tsx
import {
  Html, Head, Body, Container, Section, Text,
  Button, Img, Hr, Preview, Font
} from '@react-email/components'

interface WelcomeEmailProps {
  username: string
  ctaUrl: string
}

export function WelcomeEmail({ username, ctaUrl }: WelcomeEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{ url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', format: 'woff2' }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Welcome to Acme, {username}! Get started in 2 minutes.</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Logo */}
          <Section style={{ paddingTop: '32px', paddingBottom: '24px' }}>
            <Img
              src="https://yourapp.com/logo.png"
              width={120}
              height={32}
              alt="Acme"
              style={{ display: 'block' }}
            />
          </Section>

          {/* Hero */}
          <Section>
            <Text style={h1}>Welcome, {username} 👋</Text>
            <Text style={paragraph}>
              You're in. Your account is ready and you can start using Acme right now.
              Here's everything you need to get going in the next 2 minutes.
            </Text>
          </Section>

          {/* CTA */}
          <Section style={{ textAlign: 'center', paddingTop: '24px', paddingBottom: '24px' }}>
            <Button href={ctaUrl} style={button}>
              Open your dashboard →
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Feature highlights */}
          <Section>
            <Text style={h2}>3 things to do first</Text>
            <Text style={paragraph}>
              <strong>1. Complete your profile</strong> — Add your name and photo so teammates recognize you.
            </Text>
            <Text style={paragraph}>
              <strong>2. Invite your team</strong> — Collaboration works better with more people.
            </Text>
            <Text style={paragraph}>
              <strong>3. Create your first project</strong> — It takes 30 seconds.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section>
            <Text style={footer}>
              You received this because you signed up at acme.com.{' '}
              <Link href="https://acme.com/unsubscribe" style={link}>Unsubscribe</Link>
              {' · '}
              <Link href="https://acme.com/privacy" style={link}>Privacy policy</Link>
            </Text>
            <Text style={{ ...footer, marginTop: '4px' }}>
              Acme Inc., 123 Market St, San Francisco, CA 94105
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

// Inline style objects — required for email
const body = { backgroundColor: '#f6f9fc', fontFamily: 'Inter, Arial, sans-serif' }

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0 24px 40px',
  maxWidth: '580px',
  borderRadius: '8px',
}

const h1 = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#0f1419',
  lineHeight: '1.3',
  margin: '0 0 16px',
}

const h2 = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#0f1419',
  margin: '0 0 12px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 16px',
}

const button = {
  backgroundColor: '#6366f1',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '14px 28px',
  display: 'inline-block',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const footer = {
  fontSize: '13px',
  color: '#9ca3af',
  lineHeight: '1.5',
  margin: '0',
}

const link = {
  color: '#6366f1',
  textDecoration: 'underline',
}
```

---

## OTP / Verification Code Email

```tsx
import { Html, Head, Body, Container, Section, Text, Hr, Preview } from '@react-email/components'

interface OTPEmailProps {
  otp: string
  expiresInMinutes: number
}

export function OTPEmail({ otp, expiresInMinutes = 10 }: OTPEmailProps) {
  return (
    <Html lang="en">
      <Preview>Your verification code: {otp}</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#fff', margin: '0 auto', padding: '40px 24px', maxWidth: '480px' }}>

          <Text style={{ fontSize: '24px', fontWeight: '700', color: '#0f1419', margin: '0 0 8px' }}>
            Verify your email
          </Text>
          <Text style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 32px' }}>
            Enter this code to confirm your identity. It expires in {expiresInMinutes} minutes.
          </Text>

          {/* OTP code display */}
          <Section style={{
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center',
            margin: '0 0 24px',
          }}>
            <Text style={{
              fontSize: '40px',
              fontWeight: '800',
              letterSpacing: '0.25em',
              color: '#111827',
              fontFamily: 'Courier New, monospace',
              margin: '0',
            }}>
              {otp}
            </Text>
          </Section>

          <Hr style={{ borderColor: '#e5e7eb', margin: '0 0 24px' }} />

          <Text style={{ fontSize: '14px', color: '#9ca3af', margin: '0' }}>
            If you didn't request this code, you can safely ignore this email.
            Someone else may have typed your address by mistake.
          </Text>

        </Container>
      </Body>
    </Html>
  )
}
```

---

## Password Reset Email

```tsx
import { Html, Body, Container, Section, Text, Button, Hr, Preview } from '@react-email/components'

interface PasswordResetEmailProps {
  resetUrl: string
  expiresInHours?: number
}

export function PasswordResetEmail({ resetUrl, expiresInHours = 1 }: PasswordResetEmailProps) {
  return (
    <Html lang="en">
      <Preview>Reset your password — link expires in {expiresInHours} hour</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#fff', margin: '0 auto', padding: '40px 24px', maxWidth: '520px' }}>

          <Text style={{ fontSize: '24px', fontWeight: '700', color: '#0f1419', margin: '0 0 16px' }}>
            Reset your password
          </Text>
          <Text style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6', margin: '0 0 24px' }}>
            We received a request to reset the password for your account.
            Click the button below to choose a new password.
          </Text>

          <Section style={{ textAlign: 'center', margin: '0 0 24px' }}>
            <Button
              href={resetUrl}
              style={{
                backgroundColor: '#0f1419',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '600',
                padding: '14px 28px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Reset password
            </Button>
          </Section>

          <Text style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px' }}>
            This link expires in {expiresInHours} hour{expiresInHours !== 1 ? 's' : ''}.
            After that, you'll need to request a new one.
          </Text>

          <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />

          <Text style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.5', margin: '0' }}>
            If you didn't request a password reset, ignore this email — your password won't change.
            For security questions, contact support@acme.com.
          </Text>

        </Container>
      </Body>
    </Html>
  )
}
```

---

## Resend Integration — Next.js Server Action

```tsx
// lib/email.ts
import { Resend } from 'resend'
import { WelcomeEmail } from '@/emails/welcome'
import { OTPEmail } from '@/emails/otp'
import { PasswordResetEmail } from '@/emails/password-reset'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(to: string, username: string) {
  const { data, error } = await resend.emails.send({
    from: 'Acme <noreply@acme.com>',
    to,
    subject: `Welcome to Acme, ${username}!`,
    react: WelcomeEmail({ username, ctaUrl: 'https://app.acme.com/dashboard' }),
  })

  if (error) {
    console.error('Failed to send welcome email:', error)
    throw new Error('Email delivery failed')
  }

  return data
}

export async function sendOTPEmail(to: string, otp: string) {
  return resend.emails.send({
    from: 'Acme <noreply@acme.com>',
    to,
    subject: `Your verification code: ${otp}`,
    react: OTPEmail({ otp, expiresInMinutes: 10 }),
  })
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return resend.emails.send({
    from: 'Acme <noreply@acme.com>',
    to,
    subject: 'Reset your Acme password',
    react: PasswordResetEmail({ resetUrl, expiresInHours: 1 }),
  })
}
```

```tsx
// app/actions/auth.ts
'use server'

import { sendWelcomeEmail } from '@/lib/email'

export async function registerUser(formData: FormData) {
  const email = formData.get('email') as string
  const name = formData.get('name') as string

  // ... create user in DB ...

  // Send welcome email (don't block on it)
  sendWelcomeEmail(email, name).catch(console.error)

  return { success: true }
}
```

### Environment setup

```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
```

```ts
// Verify domain in Resend dashboard for production
// Development: use Resend's test email (delivered@resend.dev)
```

---

## Responsive Email

```tsx
// Media queries work in Gmail app, Apple Mail, iOS — NOT Outlook
// Always include as progressive enhancement

const responsiveStyles = `
  @media (max-width: 600px) {
    .container { padding: 0 16px !important; }
    .hero-text { font-size: 24px !important; }
    .cta-button { width: 100% !important; text-align: center !important; }
    .two-col { display: block !important; width: 100% !important; }
  }
`

// In React Email, inject via <style> in <Head>
import { Head } from '@react-email/components'

<Head>
  <style>{responsiveStyles}</style>
</Head>
```

---

## Dark Mode in Email

```tsx
const darkModeStyles = `
  @media (prefers-color-scheme: dark) {
    .email-body { background-color: #1a1a2e !important; }
    .email-container { background-color: #16213e !important; }
    .email-text { color: #e2e8f0 !important; }
    .email-muted { color: #94a3b8 !important; }
    .email-hr { border-color: #2d3748 !important; }
  }

  /* Gmail dark mode hack — applies even when prefers-color-scheme isn't triggered */
  [data-ogsc] .email-body { background-color: #1a1a2e !important; }
  [data-ogsc] .email-container { background-color: #16213e !important; }
`

// Gotcha: Outlook ignores dark mode entirely — design for light mode first
// Safe colors: avoid pure white and pure black, use near-values (#f8fafc, #0f1419)
// Logo: use transparent PNG or provide dark logo variant via <picture> (not supported in email — use a neutral logo)
```

---

## Typography in Email

```tsx
// Safe system font stacks (no web font loading)
const safeSerif = "Georgia, 'Times New Roman', Times, serif"
const safeSans  = "Arial, Helvetica, sans-serif"
const safeMono  = "'Courier New', Courier, monospace"

// Web fonts — load via @font-face in <Head>, MUST include fallback
// Only renders in: Apple Mail, iOS Mail, some Android
// Gmail, Outlook: always falls back to system font

// Minimum sizes
const bodyText   = { fontSize: '16px', lineHeight: '1.6' }  // never below 14px
const headingLg  = { fontSize: '28px', lineHeight: '1.3' }
const headingSm  = { fontSize: '20px', lineHeight: '1.4' }
const caption    = { fontSize: '13px', lineHeight: '1.5' }  // footer/legal only
```

---

## Preview Server Setup

```bash
# Add to package.json scripts
"email:dev": "react-email dev --dir emails --port 3001"

# Run alongside Next.js dev server
npm run email:dev
```

```
emails/
  welcome.tsx
  otp.tsx
  password-reset.tsx
  _components/
    email-footer.tsx
    email-header.tsx
```

### Testing checklist

- [ ] Tested in Gmail (web + app)
- [ ] Tested in Apple Mail (macOS)
- [ ] Tested on iOS Mail
- [ ] Tested in Outlook (if B2B product)
- [ ] Images load from absolute URLs (not relative)
- [ ] All links are absolute URLs with https://
- [ ] Unsubscribe link present in footer
- [ ] Physical address in footer (CAN-SPAM requirement)
- [ ] Preview text set (shows in inbox preview line)
- [ ] Subject line < 50 chars

---

## Anti-Patterns Table

| Anti-Pattern | Fix |
|---|---|
| `display: flex` for layout | Use `<table>` / `<Row>` / `<Column>` |
| CSS variables (`var(--color)`) | Hardcode values inline |
| `position: absolute/fixed` | Not supported — restructure layout |
| Relative image URLs (`/images/logo.png`) | Absolute: `https://yourapp.com/images/logo.png` |
| Images without `width` + `height` | Always set both — prevents layout collapse |
| `<div>` for email layout | `<table>` / React Email primitives |
| No `Preview` component | Always add — controls inbox snippet |
| No unsubscribe link | Legal requirement (CAN-SPAM / GDPR) |
| No physical address | Legal requirement (CAN-SPAM) |
| Testing only in browser | Test in actual email clients |
| Blocking user registration on email failure | Fire-and-forget: `.catch(console.error)` |
