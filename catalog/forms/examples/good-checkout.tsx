// EXAMPLE: Reference-quality Stripe Checkout Page
// Intent: CREATE_PAGE · Product: saas · Dials: DV=4 MI=4 VD=7
// This is what the skill should produce. Use as gold-standard reference.
// Key principles on display:
//   • Premium font (Manrope) declared via @import AND font-[] inline class
//   • Organic non-round prices ($29.00 + $12.50 + $3.21 = $44.71 total)
//   • Four states: LOADING skeleton, READY payment form, ERROR alert, SUCCESS confirmation
//   • Realistic diverse names (Priya Shah, Kenji Tanaka) — no placeholder names
//   • aria-label on icon buttons, htmlFor on all labels, aria-describedby on error inputs
//   • Skip-to-content link (sr-only focus:not-sr-only)
//   • prefers-reduced-motion via CSS @media block
//   • No AI-slop copy — generic marketing buzzwords are absent
//   • Trust strip: Secured by Stripe + PCI-DSS compliant
//   • 2-column desktop (lg:grid-cols-[1fr_380px]), sticky mobile bottom bar

import { useState, useEffect } from "react";

// In a real app: import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
// Mock for demo purposes:
const useStripe = () => ({ confirmPayment: async () => ({ error: null }) });
const useElements = () => ({ submit: async () => ({ error: null }), getElement: () => null });

// ─── Sub-components ────────────────────────────────────────────────────────────

export interface LineItem {
  name: string
  detail?: string
  amount: number
}

function OrderSummary() {
  const lineItems = [
    { label: "Pro Plan — monthly", amount: "$29.00" },
    { label: "Team seats (3)", amount: "$12.50" },
    { label: "Tax", amount: "$3.21" },
  ];

  return (
    <aside
      aria-label="Order summary"
      className="bg-[oklch(96.8%_0.007_247.9)] rounded-2xl p-6 border border-slate-200/80 h-fit lg:sticky lg:top-8"
    >
      <h2 className="font-bold text-lg text-[oklch(18.8%_0.013_248.5)] mb-5">Order summary</h2>
      <ul className="space-y-3 mb-5" aria-label="Line items">
        {lineItems.map((item) => (
          <li key={item.label} className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{item.label}</span>
            <span className="font-medium text-[oklch(18.8%_0.013_248.5)]">{item.amount}</span>
          </li>
        ))}
      </ul>
      <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
        <span className="font-bold text-[oklch(18.8%_0.013_248.5)]">Total due today</span>
        <span className="font-extrabold text-xl text-[oklch(18.8%_0.013_248.5)]">$44.71</span>
      </div>

      {/* Trust strip */}
      <div className="mt-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span aria-hidden="true">🔒</span>
          <span>Secured by Stripe</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span aria-hidden="true">✓</span>
          <span>PCI-DSS compliant — your card data never touches our servers</span>
        </div>
      </div>
    </aside>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-[100dvh] bg-[oklch(98.4%_0.003_247.9)] p-6 sm:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse bg-slate-200 rounded-lg h-8 w-48 mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-5">
            <div className="animate-pulse bg-slate-200 rounded-2xl h-16 w-full" />
            <div className="animate-pulse bg-slate-200 rounded-2xl h-16 w-full" />
            <div className="animate-pulse bg-slate-200 rounded-2xl h-40 w-full" />
            <div className="animate-pulse bg-slate-200 rounded-xl h-12 w-full" />
          </div>
          <div className="animate-pulse bg-slate-200 rounded-2xl h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

function SuccessState({ orderNumber, email }: { orderNumber: string; email: string }) {
  return (
    <div className="min-h-[100dvh] bg-[oklch(98.4%_0.003_247.9)] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div
          className="mx-auto mb-6 size-20 rounded-full bg-emerald-100 flex items-center justify-center
                     transition-transform duration-500 scale-100"
          aria-hidden="true"
        >
          <svg
            className="w-10 h-10 text-emerald-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-[oklch(18.8%_0.013_248.5)] tracking-tight mb-2">
          Payment confirmed
        </h1>
        <p className="text-slate-500 mb-1">
          Order <span className="font-semibold text-[oklch(18.8%_0.013_248.5)]">#{orderNumber}</span>
        </p>
        <p className="text-slate-500 text-sm mb-8">
          Receipt sent to{" "}
          <span className="font-medium text-[oklch(18.8%_0.013_248.5)]">{email}</span>
        </p>
        <div className="bg-[oklch(96.8%_0.007_247.9)] rounded-2xl p-5 border border-slate-200 text-left text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Plan</span>
            <span className="font-medium text-[oklch(18.8%_0.013_248.5)]">Pro — monthly</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Team seats</span>
            <span className="font-medium text-[oklch(18.8%_0.013_248.5)]">3</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
            <span className="font-bold text-[oklch(18.8%_0.013_248.5)]">Total charged</span>
            <span className="font-bold text-[oklch(18.8%_0.013_248.5)]">$44.71</span>
          </div>
        </div>
        <button
          className="mt-8 h-11 px-8 rounded-xl bg-indigo-600 text-white font-semibold
                     hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500
                     focus-visible:ring-offset-2 transition-colors"
          onClick={() => window.location.assign("/dashboard")}
        >
          Go to dashboard
        </button>
      </div>
    </div>
  );
}

function PaymentForm({ onSuccess, onError, errorMessage }: { onSuccess: () => void; onError: (msg: string) => void; errorMessage?: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardError, setCardError] = useState(errorMessage || "");

  const hasError = Boolean(cardError || errorMessage);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCardError("");

    const { error } = await stripe.confirmPayment();

    if (error) {
      setCardError((error as { message?: string }).message || "Your card was declined. Try another card.");
      setIsSubmitting(false);
      return;
    }

    onSuccess();
  };

  return (
    <section aria-label="Payment details" className="space-y-6">
      {/* Error alert */}
      {(hasError || errorMessage) && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm"
        >
          <span className="text-rose-500 mt-0.5 shrink-0" aria-hidden="true">⚠</span>
          <div>
            <p className="font-semibold text-rose-700">Payment failed</p>
            <p className="text-rose-600 mt-0.5">
              {cardError || errorMessage || "Your card was declined. Try another card."}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Billing name */}
        <div className="space-y-1.5">
          <label
            htmlFor="billing-name"
            className="block text-sm font-medium text-[oklch(18.8%_0.013_248.5)]"
          >
            Name on card
          </label>
          <input
            id="billing-name"
            type="text"
            autoComplete="cc-name"
            placeholder="Priya Shah"
            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-[oklch(98.4%_0.003_247.9)]
                       text-[oklch(18.8%_0.013_248.5)] placeholder:text-slate-400 text-base
                       focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none
                       focus-visible:border-indigo-400 transition-colors"
            aria-describedby={hasError ? "card-error-msg" : undefined}
          />
        </div>

        {/* Card number (mocked) */}
        <div className="space-y-1.5">
          <label
            htmlFor="card-number"
            className="block text-sm font-medium text-[oklch(18.8%_0.013_248.5)]"
          >
            Card number
          </label>
          <div className="relative">
            <input
              id="card-number"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full h-11 px-4 pr-12 rounded-xl border border-slate-200 bg-[oklch(98.4%_0.003_247.9)]
                         text-[oklch(18.8%_0.013_248.5)] placeholder:text-slate-400 text-sm font-mono
                         focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none
                         focus-visible:border-indigo-400 transition-colors"
              aria-describedby={hasError ? "card-error-msg" : "card-number-hint"}
            />
            <span
              id="card-number-hint"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-lg"
              aria-hidden="true"
            >
              💳
            </span>
          </div>
        </div>

        {/* Expiry + CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="card-expiry"
              className="block text-sm font-medium text-[oklch(18.8%_0.013_248.5)]"
            >
              Expiry
            </label>
            <input
              id="card-expiry"
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM / YY"
              value={cardExpiry}
              onChange={(e) => setCardExpiry(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-[oklch(98.4%_0.003_247.9)]
                         text-[oklch(18.8%_0.013_248.5)] placeholder:text-slate-400 text-sm font-mono
                         focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none
                         focus-visible:border-indigo-400 transition-colors"
              aria-describedby={hasError ? "card-error-msg" : undefined}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="card-cvc"
              className="block text-sm font-medium text-[oklch(18.8%_0.013_248.5)]"
            >
              CVC
            </label>
            <input
              id="card-cvc"
              type="text"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              value={cardCvc}
              onChange={(e) => setCardCvc(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-[oklch(98.4%_0.003_247.9)]
                         text-[oklch(18.8%_0.013_248.5)] placeholder:text-slate-400 text-sm font-mono
                         focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none
                         focus-visible:border-indigo-400 transition-colors"
              aria-describedby={hasError ? "card-error-msg" : undefined}
            />
          </div>
        </div>

        {/* Hidden error message anchor for aria-describedby */}
        {hasError && (
          <p id="card-error-msg" className="sr-only">
            {cardError || errorMessage || "Your card was declined. Try another card."}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 rounded-xl bg-indigo-600 text-white font-semibold text-sm
                     hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed
                     focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
                     transition duration-200"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Processing…
            </span>
          ) : (
            "Pay $44.71"
          )}
        </button>

        <p className="text-xs text-center text-slate-400">
          By completing your purchase you agree to our{" "}
          <a href="/terms" className="underline focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">
            Privacy Policy
          </a>
          .
        </p>
      </form>
    </section>
  );
}

// ─── Page states ───────────────────────────────────────────────────────────────

// Simulate the four checkout states for demo purposes
const STATES = ["loading", "ready", "error", "success"];

export default function CheckoutPage() {
  type PageState = "loading" | "ready" | "error" | "success"
  const [pageState, setPageState] = useState<PageState>("loading");
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Fetch clientSecret from your backend; resolves immediately in this demo.
    // (Production: fetch('/api/create-payment-intent') — the skeleton shows for
    // exactly as long as the real request takes. Never add artificial delay.)
    let cancelled = false;
    Promise.resolve("pi_mock_3FtYUV82bX_secret_demo").then((secret) => {
      if (cancelled) return;
      setClientSecret(secret);
      setPageState("ready");
    });
    return () => { cancelled = true; };
  }, []);

  // LOADING: skeleton while clientSecret loads
  if (pageState === "loading" || !clientSecret) {
    return <LoadingSkeleton />;
  }

  // SUCCESS state
  if (pageState === "success") {
    return (
      <SuccessState
        orderNumber="8429-GH"
        email="priya@example.com"
      />
    );
  }

  const isError = pageState === "error";

  return (
    <div className="min-h-[100dvh] bg-[oklch(98.4%_0.003_247.9)] font-[Manrope,system-ui,sans-serif] text-[oklch(18.8%_0.013_248.5)]">
      {/* Skip-to-content link */}
      <a
        href="#checkout-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                   focus:bg-[oklch(98.4%_0.003_247.9)] focus:px-4 focus:py-2 focus:rounded-lg focus:ring-2
                   focus:ring-indigo-500 focus:z-50 text-sm font-medium"
      >
        Skip to checkout
      </a>

      {/* Header */}
      <header className="border-b border-slate-200/80 bg-[oklch(96.8%_0.007_247.9)]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700" aria-hidden="true" />
            <span className="font-bold tracking-tight text-lg">Atlas</span>
            <span className="hidden sm:inline text-slate-300 ml-1">·</span>
            <span className="hidden sm:inline text-sm text-slate-500">Secure checkout</span>
          </div>
          <button
            aria-label="Open account menu"
            className="size-11 rounded-full bg-slate-100 hover:bg-slate-200
                       focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
                       transition-colors flex items-center justify-center text-sm font-semibold text-slate-600"
          >
            PS
          </button>
        </div>
      </header>

      {/* Demo state switcher (not part of real app) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div
          role="group"
          aria-label="Demo state switcher"
          className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-xl p-1 text-xs"
        >
          <span className="px-2 text-amber-700 font-medium">Demo:</span>
          {STATES.map((s) => (
            <button
              key={s}
              onClick={() => {
                if (s === "loading") { setPageState("loading"); setClientSecret(null); Promise.resolve().then(() => { setClientSecret("pi_mock"); setPageState("ready"); }); }
                else setPageState(s as PageState);
              }}
              className={`h-7 px-3 rounded-lg font-medium transition-colors focus-visible:ring-2 focus-visible:ring-amber-400
                ${pageState === s ? "bg-amber-400 text-amber-900" : "text-amber-700 hover:bg-amber-100"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main two-column layout */}
      <main
        id="checkout-main"
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12
                   grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 pb-32 lg:pb-12"
      >
        {/* Left: payment form */}
        <div>
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[oklch(18.8%_0.013_248.5)]">
              Complete your purchase
            </h1>
            <p className="mt-1 text-slate-500 text-sm">
              Billed monthly · Cancel anytime · Kenji Tanaka and team
            </p>
          </div>

          <PaymentForm
            onSuccess={() => setPageState("success")}
            onError={() => setPageState("error")}
            errorMessage={
              isError ? "Your card was declined. Try another card." : ""
            }
          />
        </div>

        {/* Right: order summary */}
        <OrderSummary />
      </main>

      {/* Sticky mobile bottom bar */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 bg-[oklch(96.8%_0.007_247.9)]/95 backdrop-blur border-t
                   border-slate-200 px-4 py-3 flex items-center justify-between gap-4 z-20 pb-[env(safe-area-inset-bottom)]"
        aria-label="Mobile checkout summary"
      >
        <div>
          <p className="text-xs text-slate-500">Total due today</p>
          <p className="font-extrabold text-[oklch(18.8%_0.013_248.5)]">$44.71</p>
        </div>
        <button
          className="h-11 px-6 rounded-xl bg-indigo-600 text-white font-semibold text-sm
                     hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500
                     focus-visible:ring-offset-2 transition-colors shrink-0"
          onClick={() => document.querySelector("form")?.requestSubmit()}
        >
          Pay $44.71
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
