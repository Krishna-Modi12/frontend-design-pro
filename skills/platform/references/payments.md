# Payments UI Reference (Stripe Elements + Next.js)

Source: stripe.com/docs, stripe.com/elements, @stripe/stripe-js, @stripe/react-stripe-js

> **Cross-reference:** This file covers Stripe UI patterns, Elements integration, and checkout flows.
> For authentication flows → `references/auth-patterns.md`
> For form validation patterns → `references/react-hook-form.md`
> For server actions / API routes → `references/nextjs-patterns.md`

---

## Contents

- [Package Setup](#package-setup)
- [Elements Provider Setup](#elements-provider-setup)
- [Stripe Appearance API](#stripe-appearance-api)
- [PaymentElement (Recommended)](#paymentelement-recommended)
- [CardElement (Simple Integration)](#cardelement-simple-integration)
- [Server-Side: Payment Intent (App Router)](#server-side-payment-intent-app-router)
- [Server-Side: Webhooks](#server-side-webhooks)
- [Subscription Checkout Pattern](#subscription-checkout-pattern)
- [Customer Portal (Manage Subscription)](#customer-portal-manage-subscription)
- [Checkout UX Patterns](#checkout-ux-patterns)
- [Error Handling Reference](#error-handling-reference)
- [Saved Payment Methods (SetupIntent)](#saved-payment-methods-setupintent)
- [Formatting Utilities](#formatting-utilities)
- [Environment Variables](#environment-variables)
- [Security Checklist](#security-checklist)
- [Testing Reference](#testing-reference)
- [Quick Shortcode Reference](#quick-shortcode-reference)

---

## Package Setup

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

```ts
// lib/stripe.ts — singleton client
import { loadStripe } from '@stripe/stripe-js'

let stripePromise: ReturnType<typeof loadStripe>
export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}
```

---

## Elements Provider Setup

Always wrap at the payment page level, not the app root. Pass `options` with the client secret:

```tsx
// app/checkout/page.tsx
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'

const stripe = getStripe()

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/create-payment-intent', { method: 'POST' })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret))
  }, [])

  if (!clientSecret) return <CheckoutSkeleton />

  return (
    <Elements
      stripe={stripe}
      options={{
        clientSecret,
        appearance: stripeAppearance,
        loader: 'auto',
      }}
    >
      <CheckoutForm />
    </Elements>
  )
}
```

---

## Stripe Appearance API

Match your brand exactly. Use CSS variables from your design tokens:

```ts
// lib/stripe-appearance.ts
import type { Appearance } from '@stripe/stripe-js'

export const stripeAppearance: Appearance = {
  theme: 'stripe', // 'stripe' | 'night' | 'flat' | 'none'
  variables: {
    colorPrimary: '#0f172a',          // Brand primary
    colorBackground: '#ffffff',
    colorText: '#0f172a',
    colorDanger: '#dc2626',
    // Elements render in a cross-origin iframe: a face you have not registered
    // through Stripe's `fonts` option cannot load there, so naming one is
    // decoration that silently falls back. This stack is what actually renders.
    fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
    fontSizeBase: '15px',
    spacingUnit: '4px',
    borderRadius: '8px',
    focusBoxShadow: 'none',
    focusOutline: '2px solid #0f172a',
  },
  rules: {
    '.Input': {
      border: '1px solid #e2e8f0',
      boxShadow: 'none',
      padding: '10px 12px',
      transition: 'border-color 200ms ease, box-shadow 200ms ease',
    },
    '.Input:focus': {
      border: '1px solid #0f172a',
      boxShadow: '0 0 0 3px rgba(15, 23, 42, 0.08)',
    },
    '.Input--invalid': {
      border: '1px solid #dc2626',
    },
    '.Label': {
      fontSize: '13px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '6px',
    },
    '.Error': {
      fontSize: '12px',
      color: '#dc2626',
      marginTop: '4px',
    },
  },
}

// Dark mode variant
export const stripeDarkAppearance: Appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#f8fafc',
    colorBackground: '#0f172a',
    colorText: '#f8fafc',
    colorDanger: '#f87171',
    // Elements render in a cross-origin iframe: a face you have not registered
    // through Stripe's `fonts` option cannot load there, so naming one is
    // decoration that silently falls back. This stack is what actually renders.
    fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
    borderRadius: '8px',
  },
}
```

---

## PaymentElement (Recommended)

`PaymentElement` is Stripe's all-in-one component — handles card, Apple Pay, Google Pay, Link, SEPA, etc. based on customer location and saved methods. Always prefer this over individual elements.

```tsx
'use client'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useState } from 'react'

export function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsLoading(true)
    setErrorMessage(null)

    // Validate without submitting
    const { error: submitError } = await elements.submit()
    if (submitError) {
      setErrorMessage(submitError.message ?? 'Validation failed')
      setIsLoading(false)
      return
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    })

    if (error) {
      // Show inline error (card_error or validation_error)
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setErrorMessage(error.message ?? 'Payment failed')
      } else {
        setErrorMessage('An unexpected error occurred.')
      }
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs', // 'tabs' | 'accordion' | 'auto'
          wallets: {
            applePay: 'auto',
            googlePay: 'auto',
          },
          fields: {
            billingDetails: {
              address: 'never', // 'auto' | 'never' — use your own address fields
            },
          },
        }}
      />

      {errorMessage && (
        <div role="alert" className="text-sm text-red-600 flex items-center gap-2">
          <AlertCircleIcon className="h-4 w-4 shrink-0" aria-hidden />
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full h-11 bg-slate-900 text-white rounded-lg text-sm font-medium
                   hover:bg-slate-800 active:scale-[0.98] transition-[transform,background-color] duration-150
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner className="h-4 w-4 animate-spin" />
            Processing…
          </span>
        ) : (
          'Pay now'
        )}
      </button>
    </form>
  )
}
```

---

## CardElement (Simple Integration)

Use when you only need card input (no wallets, no alternative payment methods):

```tsx
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const CARD_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#0f172a',
      // Elements render in a cross-origin iframe: a face you have not registered
    // through Stripe's `fonts` option cannot load there, so naming one is
    // decoration that silently falls back. This stack is what actually renders.
    fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
      '::placeholder': { color: '#94a3b8' },
    },
    invalid: { color: '#dc2626' },
  },
  hidePostalCode: false, // keep for AVS checks
}

export function SimpleCardForm() {
  const stripe = useStripe()
  const elements = useElements()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    const cardElement = elements.getElement(CardElement)!
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    })

    if (error) {
      console.error(error)
    } else {
      // Send paymentMethod.id to your server
      await confirmOnServer(paymentMethod.id)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-slate-200 p-3.5 focus-within:border-slate-900
                      focus-within:ring-2 focus-within:ring-slate-900/10 transition-[box-shadow,border-color]">
        <CardElement options={CARD_OPTIONS} />
      </div>
      <button type="submit" disabled={!stripe} className="btn-primary w-full">
        Pay
      </button>
    </form>
  )
}
```

---

## Server-Side: Payment Intent (App Router)

```ts
// app/api/create-payment-intent/route.ts
import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'usd', metadata = {} } = await req.json()

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    const message = error instanceof Stripe.errors.StripeError
      ? error.message
      : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

---

## Server-Side: Webhooks

```ts
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      await handlePaymentSuccess(pi)
      break
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      await handlePaymentFailure(pi)
      break
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await syncSubscription(sub)
      break
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      await handleInvoicePaid(invoice)
      break
    }
  }

  return NextResponse.json({ received: true })
}
```

---

## Subscription Checkout Pattern

```tsx
// Pricing card with subscription button
interface PricingPlan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  priceId: string // Stripe Price ID
  features: string[]
  popular?: boolean
}

export function PricingCard({ plan }: { plan: PricingPlan }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubscribe() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: plan.priceId }),
      })
      const { url } = await res.json()
      window.location.href = url // Redirect to Stripe Checkout
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn(
      'relative rounded-2xl border p-6',
      plan.popular ? 'border-slate-900 shadow-lg' : 'border-slate-200'
    )}>
      {plan.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white
                         text-xs font-medium px-3 py-1 rounded-full">
          Most popular
        </span>
      )}
      <h3 className="text-lg font-semibold">{plan.name}</h3>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold">${plan.price}</span>
        <span className="text-slate-500 text-sm">/{plan.interval}</span>
      </div>
      <ul className="mt-6 space-y-3">
        {plan.features.map(feature => (
          <li key={feature} className="flex items-center gap-2 text-sm">
            <CheckIcon className="h-4 w-4 text-emerald-500 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <button
        onClick={handleSubscribe}
        disabled={isLoading}
        className={cn(
          'mt-8 w-full h-10 rounded-lg text-sm font-medium transition-[background-color,box-shadow,opacity] duration-150',
          plan.popular
            ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]'
            : 'border border-slate-200 hover:border-slate-400 active:scale-[0.98]'
        )}
      >
        {isLoading ? <Spinner className="mx-auto h-4 w-4 animate-spin" /> : 'Get started'}
      </button>
    </div>
  )
}
```

```ts
// app/api/create-checkout-session/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  const { priceId } = await req.json()
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    customer_email: userEmail, // from session/auth
    allow_promotion_codes: true,
    billing_address_collection: 'required',
  })
  return NextResponse.json({ url: session.url })
}
```

---

## Customer Portal (Manage Subscription)

```ts
// app/api/create-portal-session/route.ts
export async function POST(req: NextRequest) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId, // from your DB
    return_url: `${process.env.NEXT_PUBLIC_URL}/settings/billing`,
  })
  return NextResponse.json({ url: session.url })
}
```

```tsx
// Billing settings button
export function ManageBillingButton() {
  async function handleManage() {
    const res = await fetch('/api/create-portal-session', { method: 'POST' })
    const { url } = await res.json()
    window.location.href = url
  }
  return (
    <button onClick={handleManage} className="btn-outline">
      Manage billing
    </button>
  )
}
```

---

## Checkout UX Patterns

### Order Summary Sidebar

```tsx
export function OrderSummary({ items, total }: { items: LineItem[]; total: number }) {
  return (
    <aside className="rounded-xl border border-slate-100 bg-slate-50 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-900">Order summary</h2>
      <ul className="space-y-3">
        {items.map(item => (
          <li key={item.id} className="flex justify-between text-sm">
            <span className="text-slate-600">
              {item.name}
              {item.quantity > 1 && (
                <span className="ml-1 text-slate-400">×{item.quantity}</span>
              )}
            </span>
            <span className="font-medium">{formatCurrency(item.price)}</span>
          </li>
        ))}
      </ul>
      <div className="border-t border-slate-200 pt-4 flex justify-between text-sm font-semibold">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <LockIcon className="h-3 w-3" />
        Secured by Stripe
      </div>
    </aside>
  )
}
```

### Multi-Step Checkout

```tsx
// Steps: Cart → Shipping → Payment → Confirmation
const CHECKOUT_STEPS = ['Cart', 'Shipping', 'Payment'] as const
type CheckoutStep = typeof CHECKOUT_STEPS[number]

export function CheckoutStepper({ current }: { current: CheckoutStep }) {
  return (
    <nav aria-label="Checkout progress">
      <ol className="flex items-center gap-0">
        {CHECKOUT_STEPS.map((step, i) => {
          const isComplete = CHECKOUT_STEPS.indexOf(current) > i
          const isCurrent = step === current
          return (
            <li key={step} className="flex items-center">
              <div className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                isComplete ? 'bg-slate-900 text-white' :
                isCurrent ? 'border-2 border-slate-900 text-slate-900' :
                'border border-slate-300 text-slate-400'
              )}>
                {isComplete ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={cn(
                'ml-2 text-sm',
                isCurrent ? 'font-medium' : 'text-slate-500'
              )}>
                {step}
              </span>
              {i < CHECKOUT_STEPS.length - 1 && (
                <div className={cn(
                  'mx-4 h-px w-12',
                  isComplete ? 'bg-slate-900' : 'bg-slate-200'
                )} />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
```

### Success / Confirmation Page

```tsx
export function PaymentSuccess({ amount, email }: { amount: number; email: string }) {
  return (
    <div className="text-center space-y-4">
      {/* Animated checkmark */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
        <CheckIcon className="h-8 w-8 text-emerald-500" />
      </div>
      <h1 className="text-2xl font-semibold">Payment successful</h1>
      <p className="text-slate-500 text-sm max-w-sm mx-auto">
        We sent a confirmation to <strong>{email}</strong>.
        Your order is being processed.
      </p>
      <p className="text-lg font-semibold">{formatCurrency(amount)}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <Link href="/dashboard" className="btn-primary">Go to dashboard</Link>
        <Link href="/orders" className="btn-outline">View order</Link>
      </div>
    </div>
  )
}
```

---

## Error Handling Reference

| Stripe Error Type | UX Response |
|-------------------|-------------|
| `card_error` | Show inline below form, keep form visible |
| `validation_error` | Show inline on field, don't submit |
| `authentication_required` | Auto-handled by `confirmPayment` |
| `insufficient_funds` | "Your card has insufficient funds." |
| `card_declined` | "Your card was declined. Try another card." |
| `expired_card` | "Your card has expired." |
| `incorrect_cvc` | "Your card's security code is incorrect." |
| Network error | "Connection issue. Please try again." |

```tsx
function getErrorMessage(error: Stripe.StripeError): string {
  switch (error.code) {
    case 'card_declined': return 'Your card was declined. Please try a different card.'
    case 'insufficient_funds': return 'Your card has insufficient funds.'
    case 'expired_card': return 'Your card has expired.'
    case 'incorrect_cvc': return 'Your card\'s security code is incorrect.'
    case 'incorrect_number': return 'Your card number is incorrect.'
    case 'processing_error': return 'An error occurred while processing. Please try again.'
    default: return error.message ?? 'Payment failed. Please try again.'
  }
}
```

---

## Saved Payment Methods (SetupIntent)

```ts
// app/api/create-setup-intent/route.ts
export async function POST() {
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    automatic_payment_methods: { enabled: true },
  })
  return NextResponse.json({ clientSecret: setupIntent.client_secret })
}
```

```tsx
// Saved cards list
export function SavedPaymentMethods({ methods }: { methods: PaymentMethod[] }) {
  return (
    <ul className="space-y-2">
      {methods.map(pm => (
        <li key={pm.id} className="flex items-center justify-between rounded-lg border
                                   border-slate-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <CardBrandIcon brand={pm.card!.brand} className="h-6 w-8" />
            <span className="text-sm text-slate-600">
              •••• {pm.card!.last4}
            </span>
            <span className="text-xs text-slate-400">
              {pm.card!.exp_month}/{pm.card!.exp_year}
            </span>
          </div>
          {pm.id === defaultMethodId && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              Default
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
```

---

## Formatting Utilities

```ts
// lib/format.ts
export function formatCurrency(
  amount: number, // in dollars (not cents)
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount)
}

export function formatCentsToDisplay(cents: number, currency = 'usd'): string {
  return formatCurrency(cents / 100, currency.toUpperCase())
}

// Format: "June 15, 2025"
export function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_URL=http://localhost:3000
```

**Never expose `STRIPE_SECRET_KEY` to the client.** Only `NEXT_PUBLIC_` prefixed keys are safe to bundle.

---

## Security Checklist

- [ ] Secret key only in server-side env vars
- [ ] Webhook signature verification on every webhook handler  
- [ ] Amount validation server-side — never trust client-sent amounts
- [ ] Idempotency keys on payment intent creation for retries
- [ ] Rate limiting on `/api/create-payment-intent`
- [ ] HTTPS only (Stripe rejects non-HTTPS origins in production)
- [ ] Test with Stripe's test cards (`4242 4242 4242 4242`) before production

---

## Testing Reference

| Test Card | Scenario |
|-----------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0025 0000 3155` | Requires 3D Secure |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 0069` | Expired card |
| `4000 0000 0000 0127` | Incorrect CVC |

Any future expiry date, any 3-digit CVV, any 5-digit zip.

---

## Quick Shortcode Reference

Use `[payments]` in a SKILL.md prompt to load this file.

**Related shortcodes:**
- `[auth]` → auth-patterns.md (protected routes, middleware)
- `[react-hook-form]` → form validation with Zod
- `[nextjs]` → App Router patterns, server actions
