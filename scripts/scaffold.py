#!/usr/bin/env python3
"""
Frontend Design Pro — Component Scaffold Generator
Generates differentiated component boilerplate by intent type.
Each intent gets a purpose-built starting structure, not a generic placeholder.

Usage: python scaffold.py <intent> [output_file]
"""

import sys
from pathlib import Path

# Windows consoles default to cp1252 and cannot encode this script's ✓/✗ glyphs.
for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

INTENTS = {
    "dashboard": "SaaS dashboard — metric cards, revenue chart, activity feed, tabs",
    "landing":   "Marketing landing page — hero, social proof, features, testimonial, CTA",
    "form":      "Accessible form — inputs, validation, error states, all ARIA linked",
    "modal":     "Dialog — focus trap, backdrop, animations, keyboard dismiss",
    "nav":       "Navigation — mobile hamburger, active states, skip link",
    "card":      "Content card — hover lift, variants, accessible",
    "table":     "Data table — sort headers, pagination, empty+loading states",
    "hero":      "Hero section — asymmetric layout, CTA, floating visual",
    "chart":     "Data visualization — Recharts with accessible aria-label",
    "notification": "Notification center — unread badge, skeleton, mark-all-read",
    "mobile":    "Mobile-native layout — bottom nav, safe area, bottom sheet, FAB",
    "auth":      "Auth UI — login / signup / OAuth buttons / magic link / protected route",
    "email":     "React Email template — welcome / OTP / password reset (React Email + Resend)",
    "checkout":  "Stripe checkout — PaymentElement, order summary, success screen",
    # New templates
    "react 19":      "React 19 task manager — useOptimistic, useActionState, useFormStatus, startTransition",
    "useoptimistic": "React 19 task manager — useOptimistic, useActionState, useFormStatus, startTransition",
    "server action": "React 19 task manager — useOptimistic, useActionState, useFormStatus, startTransition",
    "ai chat":   "AI chat UI — streaming, stop button, example prompts, auto-scroll",
    "chat ui":   "AI chat UI — streaming, stop button, example prompts, auto-scroll",
    "chatbot":   "AI chat UI — streaming, stop button, example prompts, auto-scroll",
    "virtualized":   "Virtualized list — useVirtualizer, React.lazy + Suspense, prefetch, useMemo",
    "virtual list":  "Virtualized list — useVirtualizer, React.lazy + Suspense, prefetch, useMemo",
    "performance":   "Virtualized list — useVirtualizer, React.lazy + Suspense, prefetch, useMemo",
}

DIAL_DEFAULTS = {
    "dashboard":    (4, 3, 7),
    "landing":      (8, 6, 3),
    "form":         (3, 2, 4),
    "modal":        (3, 5, 4),
    "nav":          (4, 4, 3),
    "card":         (5, 5, 4),
    "table":        (3, 3, 7),
    "hero":         (8, 7, 3),
    "chart":        (4, 3, 7),
    "notification": (4, 4, 5),
    "mobile":       (5, 6, 5),
    "auth":         (4, 5, 5),
    "email":        (3, 2, 6),
    "checkout":     (4, 4, 6),
    "react19":      (4, 4, 5),
    "ai-chat":      (4, 4, 7),
    "perf":         (4, 3, 7),
}

# ─────────────────────────────────────────────
# TEMPLATE: DASHBOARD
# Asymmetric layout: 2/3 revenue card + 1/3 activity feed, then 3-col stat strip
# ─────────────────────────────────────────────
TEMPLATE_DASHBOARD = '''\
import {{ useState, useEffect }} from "react";
// @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap')

// Intent: CREATE_PAGE · Product: saas · Dials: DV=4 MI=3 VD=7
// Reference: examples/good-dashboard.jsx

export default function Dashboard() {{
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {{
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }}, []);

  if (isLoading) {{
    return (
      <div className="min-h-[100dvh] bg-[#F8FAFC] p-8 font-[Manrope,system-ui,sans-serif]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse bg-slate-200 rounded-lg h-10 w-56" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="animate-pulse bg-slate-200 rounded-2xl h-48" />
            <div className="animate-pulse bg-slate-200 rounded-2xl h-48" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {{[1,2,3].map(i => <div key={{i}} className="animate-pulse bg-slate-200 rounded-xl h-28" />)}}
          </div>
        </div>
      </div>
    );
  }}

  const stats = [
    {{ label: "Active Users", value: "14,829", change: "+4.1%", trend: "up" }},
    {{ label: "Conversion", value: "3.47%", change: "-0.8%", trend: "down" }},
    {{ label: "Churn (30d)", value: "2.14%", change: "+0.3%", trend: "down" }},
  ];

  const activity = [
    {{ name: "Ana Ngugi", action: "upgraded to Team plan", time: "8m ago" }},
    {{ name: "Kenji Tanaka", action: "invited 3 members", time: "23m ago" }},
    {{ name: "Priya Shah", action: "exported Q4 report", time: "41m ago" }},
  ];

  return (
    <main id="main" className="min-h-[100dvh] bg-[#F8FAFC] font-[Manrope,system-ui,sans-serif] text-[#0F1419]">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:ring-2 focus:ring-indigo-500">
        Skip to main content
      </a>

      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-indigo-600" />
            <span className="font-bold text-lg tracking-tight">AppName</span>
          </div>
          <button aria-label="Open user menu" className="size-11 rounded-full bg-slate-100 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 flex items-center justify-center transition-colors">
            <span className="text-sm font-medium">AN</span>
          </button>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight">Good morning, Ana.</h1>
            <p className="mt-2 text-lg text-slate-500">You're up 12.3% this month.</p>
          </div>
          <div role="tablist" aria-label="Dashboard sections" className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {{["overview","analytics","settings"].map(t => (
              <button key={{t}} role="tab" aria-selected={{tab === t}} onClick={{() => setTab(t)}}
                className={{`h-11 px-4 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 ${{tab===t ? "bg-white text-[#0F1419] shadow-sm" : "text-slate-600 hover:text-[#0F1419]"}}`}}>
                {{t.charAt(0).toUpperCase() + t.slice(1)}}
              </button>
            ))}}
          </div>
        </div>

        {{/* Asymmetric: 2/3 revenue + 1/3 activity — NOT equal grid */}}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <article className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200/80">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Monthly Revenue</p>
            <p className="mt-2 text-5xl font-extrabold tracking-tighter">$82,417</p>
            <p className="mt-1 text-sm text-emerald-600 font-medium">+12.3% vs last month</p>
            <div className="h-40 flex items-end gap-2 mt-6" role="img" aria-label="Revenue trend: steady growth over 12 weeks">
              {{[32,48,41,56,62,58,71,68,76,82,78,89].map((h,i) => (
                <div key={{i}} className="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-md" style={{{{height:`${{h}}%`}}}} />
              ))}}
            </div>
          </article>
          <aside className="bg-white rounded-3xl p-6 border border-slate-200/80">
            <h2 className="font-bold text-lg mb-4">Recent Activity</h2>
            <ul className="space-y-4">
              {{activity.map((a,i) => (
                <li key={{i}} className="flex items-start gap-3 text-sm">
                  <div className="size-9 rounded-full bg-slate-100 flex items-center justify-center font-medium text-slate-700 shrink-0">
                    {{a.name.split(" ").map(n => n[0]).join("")}}
                  </div>
                  <div>
                    <p><span className="font-semibold">{{a.name}}</span> <span className="text-slate-500">{{a.action}}</span></p>
                    <p className="text-xs text-slate-400 mt-0.5">{{a.time}}</p>
                  </div>
                </li>
              ))}}
            </ul>
          </aside>
        </div>

        {{/* 3-col stat strip — breaks equal-grid rhythm */}}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {{stats.map(s => (
            <div key={{s.label}} className="bg-white rounded-2xl p-5 border border-slate-200/80">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{{s.label}}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight">{{s.value}}</p>
              <p className={{`mt-1 text-sm font-medium ${{s.trend==="up"?"text-emerald-600":"text-rose-600"}}`}}>{{s.change}}</p>
            </div>
          ))}}
        </div>
      </section>

      <style>{{`
        @media (prefers-reduced-motion: reduce) {{
          *, *::before, *::after {{ animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }}
        }}
      `}}</style>
    </main>
  );
}}
'''

# ─────────────────────────────────────────────
# TEMPLATE: LANDING PAGE
# Asymmetric hero (8/12 text + 4/12 visual), social proof, feature grid, testimonial, dark CTA
# ─────────────────────────────────────────────
TEMPLATE_LANDING = '''\
import {{ motion, useReducedMotion }} from "framer-motion";
// @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap')

// Intent: CREATE_PAGE · Product: marketing · Dials: DV=8 MI=6 VD=3
// Reference: examples/good-landing.jsx

const EASE_OUT = [0.23, 1, 0.32, 1];
const container = {{ hidden: {{}}, show: {{ transition: {{ staggerChildren: 0.08 }} }} }};
const item = {{ hidden: {{ opacity: 0, y: 24 }}, show: {{ opacity: 1, y: 0, transition: {{ duration: 0.6, ease: EASE_OUT }} }} }};

export default function Landing() {{
  const reduce = useReducedMotion();

  return (
    <main className="min-h-[100dvh] bg-[#FAFAF9] font-[Manrope,system-ui,sans-serif] text-[#0F1419] overflow-x-hidden">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:ring-2 focus:ring-indigo-500">
        Skip to content
      </a>

      <header className="absolute top-0 inset-x-0 z-20">
        <nav aria-label="Primary" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-md bg-[#0F1419]" />
            <span className="font-extrabold tracking-tight">AppName</span>
          </div>
          <a href="#start" className="h-11 px-5 inline-flex items-center bg-[#0F1419] text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
            Get started →
          </a>
        </nav>
      </header>

      {{/* HERO — asymmetric, left-weighted */}}
      <section id="content" className="relative pt-40 pb-24 lg:pt-52 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <motion.div variants={{container}} initial="hidden" animate="show" className="lg:col-span-8">
              <motion.div variants={{item}} className="inline-flex items-center gap-2 px-3 h-8 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold tracking-wide mb-6">
                <span className="size-1.5 rounded-full bg-indigo-600" />
                v1.0 — Now live
              </motion.div>
              <motion.h1 variants={{item}} className="text-5xl sm:text-6xl lg:text-7xl xl:text-[88px] font-extrabold tracking-tighter leading-[0.95]">
                Your headline<br /><span className="text-indigo-600">goes here.</span>
              </motion.h1>
              <motion.p variants={{item}} className="mt-6 text-lg md:text-xl text-slate-600 max-w-[52ch] leading-relaxed">
                One or two sentences that explain the product's core value. Specific, concrete, no filler words.
              </motion.p>
              <motion.div variants={{item}} className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#start" className="h-12 px-6 inline-flex items-center bg-[#0F1419] text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
                  Primary CTA
                </a>
                <a href="#demo" className="h-12 px-6 inline-flex items-center font-semibold rounded-xl hover:bg-slate-200/60 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500">
                  Watch demo ↗
                </a>
              </motion.div>
            </motion.div>
            {{/* Floating visual — offset right, breaks grid */}}
            <motion.div
              initial={{{{ opacity: 0, scale: reduce ? 1 : 0.96, y: reduce ? 0 : 16 }}}}
              animate={{{{ opacity: 1, scale: 1, y: 0 }}}}
              transition={{{{ duration: 0.8, delay: 0.2, ease: EASE_OUT }}}}
              className="lg:col-span-4 lg:translate-y-6"
            >
              <div className="bg-[#0F1419] text-emerald-400 font-mono text-sm rounded-2xl p-6 shadow-2xl shadow-indigo-500/10">
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="size-2.5 rounded-full bg-rose-500/60" />
                  <div className="size-2.5 rounded-full bg-amber-500/60" />
                  <div className="size-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <pre className="leading-relaxed">{{`$ your-cli run\\n→ processing...\\n✓ done in 0.41s`}}</pre>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {{/* SOCIAL PROOF */}}
      <section aria-label="Companies" className="border-y border-slate-200 py-10 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-6">Trusted by teams at</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {{["Linear","Raycast","Vercel","Planetscale","Resend"].map(co => (
              <li key={{co}} className="font-bold text-xl tracking-tight text-slate-700">{{co}}</li>
            ))}}
          </ul>
        </div>
      </section>

      {{/* FEATURES — 2-col asymmetric, NOT 3-equal-grid */}}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter max-w-2xl mb-16">Why teams switch after one try.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
            {{[
              {{ stat: "10.4×", title: "Feature one", copy: "Specific, organic description. Use real numbers like 10.4× not 10×." }},
              {{ stat: "92%", title: "Feature two", copy: "Concrete benefit with real data. No filler words." }},
              {{ stat: "0", title: "Feature three", copy: "Third key value proposition." }},
              {{ stat: "2.3s", title: "Feature four", copy: "Fourth concrete benefit." }},
            ].map((f,i) => (
              <motion.div key={{f.title}} initial={{{{opacity:0,y:24}}}} whileInView={{{{opacity:1,y:0}}}} viewport={{{{once:true,margin:"-80px"}}}} transition={{{{duration:0.5,delay:i*0.05,ease:EASE_OUT}}}}>
                <div className="text-5xl lg:text-6xl font-extrabold tracking-tighter text-indigo-600 mb-3">{{f.stat}}</div>
                <h3 className="text-xl font-bold mb-2">{{f.title}}</h3>
                <p className="text-slate-600 leading-relaxed max-w-[52ch]">{{f.copy}}</p>
              </motion.div>
            ))}}
          </div>
        </div>
      </section>

      {{/* FINAL CTA — dark block */}}
      <section id="start" className="py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0F1419] text-white rounded-3xl p-10 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-tight max-w-3xl mx-auto">Your closing headline.</h2>
            <p className="mt-5 text-lg text-white/70 max-w-xl mx-auto">Free for open source. 14-day trial. No credit card.</p>
            <a href="#install" className="mt-8 h-12 px-7 inline-flex items-center bg-white text-[#0F1419] font-semibold rounded-xl hover:bg-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1419]">
              Start free →
            </a>
          </div>
        </div>
      </section>

      <footer className="py-10 border-t border-slate-200 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between flex-wrap gap-4">
          <p>© AppName</p>
          <ul className="flex gap-6">
            {{["Privacy","Terms","Changelog"].map(l => <li key={{l}}><a href={{`#${{l.toLowerCase()}}`}} className="hover:text-[#0F1419]">{{l}}</a></li>)}}
          </ul>
        </div>
      </footer>

      <style>{{`
        @media (prefers-reduced-motion: reduce) {{
          *, *::before, *::after {{ animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }}
        }}
      `}}</style>
    </main>
  );
}}
'''

# ─────────────────────────────────────────────
# TEMPLATE: FORM
# All 4 states, full ARIA, proper label linkage, error messages, file upload
# ─────────────────────────────────────────────
TEMPLATE_FORM = '''\
import {{ useState, useRef }} from "react";
// @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap')

// Intent: CREATE_COMPONENT · Product: saas · Dials: DV=3 MI=2 VD=4
// Reference: examples/good-form.jsx
// Key: every input has htmlFor/id, aria-describedby links error, aria-invalid dynamic

export default function FormComponent() {{
  const [fields, setFields] = useState({{ name: "", email: "", message: "" }});
  const [errors, setErrors] = useState({{}});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [serverError, setServerError] = useState("");

  function validate() {{
    const e = {{}};
    if (!fields.name.trim()) e.name = "Please enter your name.";
    else if (fields.name.trim().length < 2) e.name = "Name must be at least 2 characters.";
    if (!fields.email.trim()) e.email = "Please enter your email.";
    else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(fields.email)) e.email = "That email doesn't look right.";
    if (!fields.message.trim()) e.message = "Please add a message.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }}

  async function handleSubmit(ev) {{
    ev.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    setServerError("");
    try {{
      await new Promise(r => setTimeout(r, 1400));
      setStatus("success");
    }} catch (err) {{
      setStatus("error");
      setServerError(err.message || "Something went wrong. Try again.");
    }}
  }}

  if (status === "success") {{
    return (
      <div role="status" aria-live="polite" className="max-w-lg mx-auto p-8 bg-white rounded-2xl border border-emerald-200 text-center font-[Manrope,system-ui,sans-serif]">
        <div className="size-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-2xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-[#0F1419]">Got it — thanks!</h2>
        <p className="mt-2 text-slate-600">We'll reply to <span className="font-medium">{{fields.email}}</span> within one business day.</p>
        <button type="button" onClick={{() => {{ setFields({{name:"",email:"",message:""}}); setStatus("idle"); }}}}
          className="mt-6 h-11 px-5 inline-flex items-center font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
          Send another
        </button>
      </div>
    );
  }}

  return (
    <form onSubmit={{handleSubmit}} noValidate className="max-w-lg mx-auto p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 font-[Manrope,system-ui,sans-serif]">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-[#0F1419]">Get in touch</h2>
        <p className="mt-1.5 text-sm text-slate-500">Usually a reply within one business day.</p>
      </div>

      {{serverError && (
        <div role="alert" className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm">
          <p className="font-semibold mb-1">Didn't send.</p>
          <p>{{serverError}}</p>
        </div>
      )}}

      <div className="space-y-5">
        {{/* NAME */}}
        <div>
          <label htmlFor="f-name" className="block text-sm font-semibold text-[#0F1419] mb-1.5">Name</label>
          <input id="f-name" name="name" type="text" autoComplete="name" value={{fields.name}}
            onChange={{e => setFields({{...fields, name: e.target.value}})}}
            aria-invalid={{!!errors.name}} aria-describedby={{errors.name ? "f-name-error" : undefined}}
            disabled={{status === "submitting"}}
            className={{`w-full h-12 px-4 bg-white text-[#0F1419] border-2 rounded-xl outline-none transition-colors focus:border-indigo-500 disabled:bg-slate-100 ${{errors.name ? "border-rose-400" : "border-slate-200 hover:border-slate-300"}}`}} />
          {{errors.name && <p id="f-name-error" role="alert" className="mt-1.5 text-sm text-rose-600">{{errors.name}}</p>}}
        </div>

        {{/* EMAIL */}}
        <div>
          <label htmlFor="f-email" className="block text-sm font-semibold text-[#0F1419] mb-1.5">Email</label>
          <input id="f-email" name="email" type="email" autoComplete="email" inputMode="email" value={{fields.email}}
            onChange={{e => setFields({{...fields, email: e.target.value}})}}
            aria-invalid={{!!errors.email}} aria-describedby={{errors.email ? "f-email-error" : undefined}}
            disabled={{status === "submitting"}}
            className={{`w-full h-12 px-4 bg-white text-[#0F1419] border-2 rounded-xl outline-none transition-colors focus:border-indigo-500 disabled:bg-slate-100 ${{errors.email ? "border-rose-400" : "border-slate-200 hover:border-slate-300"}}`}} />
          {{errors.email && <p id="f-email-error" role="alert" className="mt-1.5 text-sm text-rose-600">{{errors.email}}</p>}}
        </div>

        {{/* MESSAGE */}}
        <div>
          <label htmlFor="f-message" className="block text-sm font-semibold text-[#0F1419] mb-1.5">Message</label>
          <textarea id="f-message" name="message" rows={{5}} value={{fields.message}}
            onChange={{e => setFields({{...fields, message: e.target.value}})}}
            aria-invalid={{!!errors.message}} aria-describedby={{errors.message ? "f-message-error" : "f-message-hint"}}
            disabled={{status === "submitting"}}
            className={{`w-full px-4 py-3 bg-white text-[#0F1419] border-2 rounded-xl outline-none transition-colors focus:border-indigo-500 disabled:bg-slate-100 resize-y ${{errors.message ? "border-rose-400" : "border-slate-200 hover:border-slate-300"}}`}} />
          {{errors.message
            ? <p id="f-message-error" role="alert" className="mt-1.5 text-sm text-rose-600">{{errors.message}}</p>
            : <p id="f-message-hint" className="mt-1.5 text-xs text-slate-500">Minimum 10 characters.</p>}}
        </div>
      </div>

      <button type="submit" disabled={{status === "submitting"}} aria-live="polite"
        className="mt-6 w-full h-12 inline-flex items-center justify-center bg-[#0F1419] text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:bg-slate-400 disabled:cursor-wait">
        {{status === "submitting"
          ? <><span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2" />Sending…</>
          : "Send message"}}
      </button>

      <style>{{`
        @media (prefers-reduced-motion: reduce) {{
          *, *::before, *::after {{ animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }}
        }}
      `}}</style>
    </form>
  );
}}
'''

# ─────────────────────────────────────────────
# TEMPLATE: GENERIC (modal, nav, card, table, chart, notification, hero)
# Purpose-built structure with correct state handling and semantic markup
# ─────────────────────────────────────────────
TEMPLATE_GENERIC = '''\
import {{ useState, useEffect }} from "react";
// @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap')

// Intent: CREATE_COMPONENT · Product: saas · Dials: DV={dv} MI={mi} VD={vd}
// Component: {component_name} — {description}

export default function {component_name}() {{
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {{
    const t = setTimeout(() => {{
      // Replace with real data fetch
      setData({{ items: [], total: 0 }});
      setIsLoading(false);
    }}, 600);
    return () => clearTimeout(t);
  }}, []);

  // LOADING STATE — skeleton
  if (isLoading) {{
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 font-[Manrope,system-ui,sans-serif]">
        <div className="animate-pulse space-y-3">
          <div className="bg-slate-200 rounded h-6 w-1/3" />
          <div className="bg-slate-200 rounded h-4 w-full" />
          <div className="bg-slate-200 rounded h-4 w-5/6" />
          <div className="bg-slate-200 rounded h-32 w-full mt-4" />
        </div>
      </div>
    );
  }}

  // ERROR STATE
  if (error) {{
    return (
      <div role="alert" className="bg-rose-50 border border-rose-200 rounded-2xl p-6 font-[Manrope,system-ui,sans-serif]">
        <p className="font-semibold text-rose-900 mb-1">Something went wrong</p>
        <p className="text-rose-700 text-sm">{{error}}</p>
        <button onClick={{() => {{ setError(null); setIsLoading(true); }}}}
          className="mt-4 h-9 px-4 text-sm font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 transition-colors">
          Try again
        </button>
      </div>
    );
  }}

  // EMPTY STATE
  if (!data?.items?.length) {{
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center font-[Manrope,system-ui,sans-serif]">
        <div className="size-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center text-2xl mb-4">□</div>
        <p className="font-semibold text-[#0F1419] text-lg">Nothing here yet</p>
        <p className="text-slate-500 text-sm mt-1 max-w-[32ch] mx-auto">Add your first item to get started.</p>
        <button className="mt-6 h-10 px-5 text-sm font-semibold bg-[#0F1419] text-white rounded-xl hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors">
          Add item
        </button>
      </div>
    );
  }}

  // SUCCESS STATE
  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 p-6 font-[Manrope,system-ui,sans-serif] text-[#0F1419]">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold tracking-tight">{component_name}</h2>
        <button aria-label="More options" className="size-9 rounded-lg hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center justify-center transition-colors">
          ⋯
        </button>
      </header>

      {{/* Main content goes here */}}
      <p className="text-slate-500 text-sm">Implement {description}.</p>

      <style>{{`
        @media (prefers-reduced-motion: reduce) {{
          *, *::before, *::after {{ animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }}
        }}
      `}}</style>
    </section>
  );
}}
'''

# ─────────────────────────────────────────────
# TEMPLATE: MOBILE
# Bottom nav + safe area + bottom sheet + FAB
# ─────────────────────────────────────────────
TEMPLATE_MOBILE = '''\
import {{ useState, useEffect, useRef }} from "react";
// @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap')

// Intent: CREATE_PAGE · Product: mobile-first · Dials: DV=5 MI=6 VD=5
// Reference: references/mobile-patterns.md

const NAV_ITEMS = [
  {{ id: "home",    label: "Home",        icon: "⌂" }},
  {{ id: "explore", label: "Explore",     icon: "◎" }},
  {{ id: "post",    label: "Post",        icon: "+",  fab: true }},
  {{ id: "notif",   label: "Notifications", icon: "🔔", badge: 4 }},
  {{ id: "profile", label: "Profile",     icon: "◉" }},
];

export default function MobileLayout() {{
  const [activeTab, setActiveTab] = useState("home");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {{
    const t = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(t);
  }}, []);

  if (isLoading) {{
    return (
      <div className="relative min-h-[100dvh] bg-[#FAFAF9] font-[Manrope,system-ui,sans-serif] md:max-w-sm md:mx-auto p-4 space-y-3">
        {{[1,2,3,4,5].map(i => (
          <div key={{i}} className="animate-pulse bg-slate-200 rounded-2xl h-20" />
        ))}}
      </div>
    );
  }}

  if (error) {{
    return (
      <div role="alert" className="min-h-[100dvh] bg-[#FAFAF9] flex items-center justify-center p-8 font-[Manrope,system-ui,sans-serif]">
        <div className="text-center">
          <p className="font-semibold text-[#0F1419] mb-2">Something went wrong</p>
          <p className="text-slate-500 text-sm mb-4">{{error}}</p>
          <button onClick={{() => setError(null)}}
            className="h-11 px-5 rounded-xl bg-[#0F1419] text-white font-semibold text-sm
                       hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors">
            Try again
          </button>
        </div>
      </div>
    );
  }}

  return (
    <div className="relative min-h-[100dvh] bg-[#FAFAF9] font-[Manrope,system-ui,sans-serif] overflow-hidden md:max-w-sm md:mx-auto">
      <a href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50
                   focus:px-3 focus:py-2 focus:rounded-lg focus:bg-[#F8FAFC] focus:ring-2 focus:ring-indigo-500 text-sm font-medium">
        Skip to main content
      </a>
      {{/* Page content — pad for bottom nav */}}
      <main id="main" className="pb-[calc(64px+env(safe-area-inset-bottom))] overflow-y-auto">
        <section className="px-4 pt-safe-top">
          <div className="pt-12 pb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0F1419]">
              {{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}}
            </h1>
            <p className="mt-1 text-slate-500 text-sm">Saturday, April 2025</p>
          </div>

          {{/* Card list */}}
          <ul className="space-y-3">
            {{[1,2,3,4,5].map(i => (
              <li key={{i}} className="bg-[#F8FAFC] rounded-2xl border border-slate-100 p-4 shadow-sm sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-full bg-slate-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="font-semibold text-sm text-[#0F1419] truncate">Item {{i}}</p>
                      <span className="text-xs text-slate-400 shrink-0 ml-2">3m ago</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                      A short description of this item. Keep it concise, two lines max.
                    </p>
                  </div>
                </div>
              </li>
            ))}}
          </ul>
        </section>
      </main>

      {{/* Bottom Sheet */}}
      {{sheetOpen && (
        <div className="absolute inset-0 z-40">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={{() => setSheetOpen(false)}} />
          <div className="absolute inset-x-0 bottom-0 bg-[#F8FAFC] rounded-t-3xl pb-[env(safe-area-inset-bottom)]"
               style={{{{ animation: "slideUp 0.32s cubic-bezier(0.32,0.72,0,1)" }}}}>
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-3 mb-6" />
            <div className="px-4 pb-8 space-y-3">
              <h2 className="text-xl font-bold text-[#0F1419] mb-4">Create new</h2>
              {{["Post","Story","Reel"].map(opt => (
                <button key={{opt}} onClick={{() => setSheetOpen(false)}}
                  className="w-full h-14 flex items-center gap-4 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-[0.98] transition-all">
                  <div className="size-9 rounded-full bg-slate-200 flex items-center justify-center text-lg">+</div>
                  <span className="font-semibold text-[#0F1419]">{{opt}}</span>
                </button>
              ))}}
            </div>
          </div>
        </div>
      )}}

      {{/* Bottom Navigation */}}
      <nav role="navigation" aria-label="Primary"
           className="fixed bottom-0 inset-x-0 z-30 bg-[#F8FAFC]/90 backdrop-blur-xl border-t border-slate-200/80 md:max-w-sm md:mx-auto md:inset-x-auto md:left-[50%] md:-translate-x-1/2 md:w-full"
           style={{{{ paddingBottom: "env(safe-area-inset-bottom)" }}}}>
        <ul className="flex items-center">
          {{NAV_ITEMS.map(item => (
            <li key={{item.id}} className="flex-1">
              {{item.fab ? (
                <button
                  onClick={{() => setSheetOpen(true)}}
                  aria-label="Create post"
                  className="relative mx-auto -mt-6 mb-1 flex size-14 items-center justify-center rounded-full bg-[#0F1419] text-white text-2xl shadow-lg active:scale-95 transition-transform"
                >
                  +
                </button>
              ) : (
                <button
                  aria-current={{activeTab === item.id ? "page" : undefined}}
                  onClick={{() => setActiveTab(item.id)}}
                  className="relative flex flex-col items-center justify-center w-full min-h-[56px] gap-1 py-2
                             focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 focus-visible:outline-none"
                >
                  {{item.badge && activeTab !== item.id && (
                    <span className="absolute top-2 right-[calc(50%-12px)] size-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                      {{item.badge}}
                    </span>
                  )}}
                  <span className={{`text-xl transition-transform ${{activeTab === item.id ? "scale-110" : ""}}`}}>
                    {{item.icon}}
                  </span>
                  <span className={{`text-[10px] font-semibold ${{activeTab === item.id ? "text-[#0F1419]" : "text-slate-400"}}`}}>
                    {{item.label}}
                  </span>
                </button>
              )}}
            </li>
          ))}}
        </ul>
      </nav>

      <style>{{`
        @keyframes slideUp {{
          from {{ transform: translateY(100%); }}
          to   {{ transform: translateY(0); }}
        }}
        @media (prefers-reduced-motion: reduce) {{
          *, *::before, *::after {{ animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }}
        }}
      `}}</style>
    </div>
  );
}}
'''

# ─────────────────────────────────────────────
# TEMPLATE: AUTH
# Login + Signup with OAuth buttons, magic link, error states
# ─────────────────────────────────────────────
TEMPLATE_AUTH = '''\
import {{ useState, useEffect }} from "react";

// Intent: CREATE_COMPONENT · Product: saas · Dials: DV=4 MI=5 VD=5
// Reference: references/auth-patterns.md

export default function AuthPage() {{
  const [mode, setMode] = useState("login"); // login | signup | magic
  const [fields, setFields] = useState({{ email: "", password: "", name: "" }});
  const [errors, setErrors] = useState({{}});
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {{
    const t = setTimeout(() => setPageLoaded(true), 400);
    return () => clearTimeout(t);
  }}, []);

  if (!pageLoaded) {{
    return (
      <main className="min-h-[100dvh] bg-[#FAFAF9] flex items-center justify-center px-4">
        <div className="max-w-sm w-full space-y-4 animate-pulse">
          <div className="h-10 bg-slate-200 rounded-xl mx-auto w-10" />
          <div className="h-6 bg-slate-200 rounded-lg w-48 mx-auto" />
          <div className="h-4 bg-slate-200 rounded-lg w-64 mx-auto" />
          <div className="h-11 bg-slate-200 rounded-xl" />
          <div className="h-11 bg-slate-200 rounded-xl" />
          <div className="h-12 bg-slate-200 rounded-xl" />
        </div>
      </main>
    );
  }}

  async function handleSubmit(ev) {{
    ev.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {{
      await new Promise(r => setTimeout(r, 1200));
      if (mode === "magic") {{
        setStatus("success");
      }} else {{
        // redirect to dashboard
        window.location.href = "/dashboard";
      }}
    }} catch (err) {{
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Try again.");
    }}
  }}

  if (mode === "magic" && status === "success") {{
    return (
      <main className="min-h-[100dvh] bg-[#FAFAF9] font-[Manrope,system-ui,sans-serif] flex items-center justify-center px-4">
        <div className="max-w-sm sm:max-w-sm w-full text-center">
          <div className="size-16 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl mb-6">✉</div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1419]">Check your inbox</h1>
          <p className="mt-2 text-slate-500">We sent a magic link to <strong>{{fields.email}}</strong>.<br />It expires in 15 minutes.</p>
          <button onClick={{() => {{ setMode("login"); setStatus("idle"); }}}}
            className="mt-6 text-sm text-indigo-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500">
            ← Back to sign in
          </button>
        </div>
      </main>
    );
  }}

  return (
    <main className="min-h-[100dvh] bg-[#FAFAF9] font-[Manrope,system-ui,sans-serif] flex items-center justify-center px-4 sm:px-6 py-12">
      <style>{{\`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        @media (prefers-reduced-motion: reduce) {{ *, *::before, *::after {{ animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }} }}\`}}</style>
      <div className="max-w-sm sm:max-w-sm w-full">
        {{/* Logo */}}
        <div className="text-center mb-8">
          <div className="size-10 rounded-xl bg-[#0F1419] mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1419]">
            {{mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Sign in with email"}}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {{mode === "login" ? "Sign in to your account" : mode === "signup" ? "Start your free trial — no card required" : "We'll send a magic link"}}
          </p>
        </div>

        {{/* OAuth buttons */}}
        {{mode !== "magic" && (
          <div className="space-y-3 mb-6">
            <button className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border-2 border-slate-200 bg-[#F8FAFC] hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] transition-all text-sm font-semibold focus-visible:ring-2 focus-visible:ring-indigo-500">
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            <button className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border-2 border-slate-200 bg-[#F8FAFC] hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] transition-all text-sm font-semibold focus-visible:ring-2 focus-visible:ring-indigo-500">
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              Continue with GitHub
            </button>
          </div>
        )}}

        {{/* Divider */}}
        {{mode !== "magic" && (
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-xs text-slate-500 bg-[#FAFAF9] px-3 w-fit mx-auto">or continue with email</div>
          </div>
        )}}

        {{/* Error */}}
        {{errorMsg && (
          <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">{{errorMsg}}</div>
        )}}

        {{/* Form */}}
        <form onSubmit={{handleSubmit}} noValidate className="space-y-4">
          {{mode === "signup" && (
            <div>
              <label htmlFor="auth-name" className="block text-sm font-semibold text-[#0F1419] mb-1.5">Full name</label>
              <input id="auth-name" type="text" autoComplete="name" value={{fields.name}} onChange={{e => setFields({{...fields, name: e.target.value}})}}
                className="w-full h-12 px-4 bg-[#F8FAFC] border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-colors text-[#0F1419]" />
            </div>
          )}}
          <div>
            <label htmlFor="auth-email" className="block text-sm font-semibold text-[#0F1419] mb-1.5">Email</label>
            <input id="auth-email" type="email" autoComplete="email" inputMode="email" value={{fields.email}} onChange={{e => setFields({{...fields, email: e.target.value}})}}
              aria-invalid={{!!errors.email}} aria-describedby={{errors.email ? "auth-email-error" : undefined}}
              className="w-full h-12 px-4 bg-[#F8FAFC] border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-colors text-[#0F1419]" />
            {{errors.email && <p id="auth-email-error" role="alert" className="mt-1.5 text-sm text-rose-600">{{errors.email}}</p>}}
          </div>
          {{mode !== "magic" && (
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label htmlFor="auth-pass" className="text-sm font-semibold text-[#0F1419]">Password</label>
                {{mode === "login" && (
                  <button type="button" onClick={{() => setMode("magic")}} className="text-xs text-indigo-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">
                    Forgot password?
                  </button>
                )}}
              </div>
              <input id="auth-pass" type="password" autoComplete={{mode === "login" ? "current-password" : "new-password"}} value={{fields.password}} onChange={{e => setFields({{...fields, password: e.target.value}})}}
                className="w-full h-12 px-4 bg-[#F8FAFC] border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-colors text-[#0F1419]" />
            </div>
          )}}

          <button type="submit" disabled={{status === "loading"}}
            className="w-full h-12 bg-[#0F1419] text-white font-semibold rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2">
            {{status === "loading"
              ? <><span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Please wait…</>
              : mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send magic link"}}
          </button>
        </form>

        {{/* Toggle mode */}}
        <p className="mt-6 text-center text-sm text-slate-500">
          {{mode === "login"
            ? <> Don't have an account?{{" "}}<button onClick={{() => setMode("signup")}} className="text-indigo-600 font-semibold hover:underline">Sign up free</button></>
            : mode === "signup"
            ? <> Already have an account?{{" "}}<button onClick={{() => setMode("login")}} className="text-indigo-600 font-semibold hover:underline">Sign in</button></>
            : <> <button onClick={{() => setMode("login")}} className="text-indigo-600 font-semibold hover:underline">← Back to sign in</button></>}}
        </p>

        {{mode === "signup" && (
          <p className="mt-4 text-center text-xs text-slate-400">
            By creating an account you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>.
          </p>
        )}}
      </div>
    </main>
  );
}}
'''

# ─────────────────────────────────────────────
# TEMPLATE: EMAIL (React Email)
# Welcome email template — text-safe, Outlook-compatible
# ─────────────────────────────────────────────
TEMPLATE_EMAIL = '''\
// React Email template — install: npm install @react-email/components
// Preview: npx react-email dev
// Send: use Resend (https://resend.com)
// Reference: references/email-templates.md
// Font: Manrope (web-safe fallback stack applied inline for email clients)

import {{ useState, useEffect }} from "react";
import {{
  Body, Button, Container, Head, Heading,
  Hr, Html, Img, Link, Preview, Section, Text
}} from "@react-email/components";

interface WelcomeEmailProps {{
  username?: string;
  confirmUrl?: string;
}}

// ─── Email template (use with React Email + Resend) ──────────────────────────
function WelcomeEmail({{
  username = "there",
  confirmUrl = "https://example.com/confirm?token=...",
}}: WelcomeEmailProps) {{
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Welcome to AppName — confirm your email to get started</Preview>
      <Body style={{{{
        backgroundColor: "#f8fafc",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        margin: 0, padding: 0,
      }}}}>
        <Container style={{{{ maxWidth: "560px", margin: "0 auto", padding: "40px 20px" }}}}>

          {{/* Logo */}}
          <Section style={{{{ textAlign: "center", marginBottom: "32px" }}}}>
            <div style={{{{ width: "40px", height: "40px", backgroundColor: "#0f172a", borderRadius: "10px", display: "inline-block" }}}} />
            <Text style={{{{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "12px 0 0" }}}}>AppName</Text>
          </Section>

          {{/* Card */}}
          <Section style={{{{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "40px",
            border: "1px solid #e2e8f0",
          }}}}>
            <Heading style={{{{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px" }}}}>
              Welcome, {{username}}!
            </Heading>
            <Text style={{{{ fontSize: "16px", color: "#64748b", lineHeight: "1.6", margin: "0 0 24px" }}}}>
              Thanks for signing up. Confirm your email to activate your account and start using AppName.
            </Text>

            <Button
              href={{confirmUrl}}
              style={{{{
                backgroundColor: "#0f172a",
                borderRadius: "10px",
                color: "#ffffff",
                display: "block",
                fontSize: "15px",
                fontWeight: "600",
                padding: "14px 28px",
                textAlign: "center",
                textDecoration: "none",
              }}}}
            >
              Confirm email address
            </Button>

            <Text style={{{{ fontSize: "13px", color: "#94a3b8", marginTop: "20px" }}}}>
              Button not working?{{" "}}
              <Link href={{confirmUrl}} style={{{{ color: "#6366f1", textDecoration: "underline" }}}}>
                Copy this link
              </Link>
            </Text>
          </Section>

          {{/* Security notice */}}
          <Hr style={{{{ borderColor: "#e2e8f0", margin: "24px 0" }}}} />
          <Text style={{{{ fontSize: "12px", color: "#94a3b8", textAlign: "center", margin: "0" }}}}>
            If you didn't create an AppName account, you can safely ignore this email.
            This link expires in 24 hours.
          </Text>
          <Text style={{{{ fontSize: "12px", color: "#94a3b8", textAlign: "center", margin: "8px 0 0" }}}}>
            <Link href="https://example.com" style={{{{ color: "#94a3b8" }}}}>AppName</Link>
            {{" "}}·{{" "}}
            <Link href="https://example.com/unsubscribe" style={{{{ color: "#94a3b8" }}}}>Unsubscribe</Link>
          </Text>

        </Container>
      </Body>
    </Html>
  );
}}

// ─── Dev Preview wrapper (not part of email — used for local testing) ─────────
// Default export renders a browser preview of the email template
export default function EmailPreview() {{
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {{
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }}, []);

  if (isLoading) {{
    return (
      <main className="min-h-[100dvh] bg-[#F8FAFC] flex items-center justify-center p-8">
        <div className="animate-pulse space-y-3 w-full max-w-lg">
          <div className="h-8 bg-slate-200 rounded-lg w-48 mx-auto" />
          <div className="h-[600px] bg-slate-200 rounded-2xl w-full" />
        </div>
      </main>
    );
  }}

  if (error) {{
    return (
      <main className="min-h-[100dvh] bg-[#F8FAFC] flex items-center justify-center p-8">
        <div role="alert" className="text-center max-w-sm">
          <p className="font-semibold text-[#0F1419] mb-2">Preview failed</p>
          <p className="text-slate-500 text-sm mb-4">{{error}}</p>
          <button onClick={{() => setError(null)}}
            className="h-11 px-5 rounded-xl bg-[#0F1419] text-white font-semibold text-sm
                       hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-500
                       focus-visible:ring-offset-2 transition-colors">
            Try again
          </button>
        </div>
      </main>
    );
  }}

  return (
    <main className="min-h-[100dvh] bg-[#F8FAFC] font-[Manrope,system-ui,sans-serif] py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <a href="#email-preview"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50
                   focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#F8FAFC] focus:ring-2 focus:ring-indigo-500 text-sm">
        Skip to preview
      </a>
      <header className="max-w-2xl mx-auto mb-6 flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#0F1419]">Email Preview</h1>
        <section aria-label="Preview controls" className="flex items-center gap-2">
          {{sent && (
            <span className="text-sm text-emerald-600 font-medium">✓ Test sent</span>
          )}}
          <button
            onClick={{() => setSent(true)}}
            className="h-9 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium
                       hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500
                       focus-visible:ring-offset-2 transition-colors"
          >
            Send test
          </button>
        </section>
      </header>
      <article id="email-preview" className="max-w-2xl mx-auto bg-[#F8FAFC] rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <WelcomeEmail username="Kenji" confirmUrl="https://example.com/confirm?token=demo" />
      </article>

      <style>{{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        @media (prefers-reduced-motion: reduce) {{
          *, *::before, *::after {{ animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }}
        }}
      `}}</style>
    </main>
  );
}}
'''

# ─────────────────────────────────────────────
# TEMPLATE: CHECKOUT (Stripe)
# PaymentElement + order summary + success screen
# ─────────────────────────────────────────────
TEMPLATE_CHECKOUT = '''\
"use client";
import {{ useState, useEffect }} from "react";
import {{ Elements, PaymentElement, useStripe, useElements }} from "@stripe/react-stripe-js";
import {{ loadStripe }} from "@stripe/stripe-js";
// @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap')

// Intent: CREATE_PAGE · Product: commerce · Dials: DV=4 MI=4 VD=6
// Reference: references/payments.md · references/auth-patterns.md

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const ORDER = {{
  items: [
    {{ name: "Pro Plan (monthly)", price: 29 }},
  ],
  subtotal: 29,
  tax: 2.32,
  total: 31.32,
}};

// ─── Inner form (must be inside <Elements>) ──────────────────────────────────
function CheckoutForm() {{
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  async function handleSubmit(ev: React.FormEvent) {{
    ev.preventDefault();
    if (!stripe || !elements) return;
    setIsLoading(true);
    setErrorMsg(null);

    const {{ error: submitError }} = await elements.submit();
    if (submitError) {{
      setErrorMsg(submitError.message ?? "Validation failed");
      setIsLoading(false);
      return;
    }}

    const {{ error }} = await stripe.confirmPayment({{
      elements,
      confirmParams: {{ return_url: `${{window.location.origin}}/checkout/success` }},
      redirect: "if_required",
    }});

    if (error) {{
      setErrorMsg(
        error.type === "card_error" || error.type === "validation_error"
          ? error.message ?? "Payment failed"
          : "An unexpected error occurred."
      );
    }} else {{
      setSucceeded(true);
    }}
    setIsLoading(false);
  }}

  if (succeeded) {{
    return (
      <div className="text-center py-8" role="status" aria-live="polite">
        <div className="mx-auto size-16 rounded-full bg-emerald-50 flex items-center justify-center text-3xl mb-4">✓</div>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#0F1419]">Payment successful</h2>
        <p className="mt-2 text-slate-500 text-sm">You're all set! Check your inbox for the receipt.</p>
        <a href="/dashboard" className="mt-6 inline-flex h-11 items-center px-6 bg-[#0F1419] text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors">
          Go to dashboard →
        </a>
      </div>
    );
  }}

  return (
    <form onSubmit={{handleSubmit}} className="space-y-6">
      <PaymentElement
        options={{{{
          layout: "tabs",
          wallets: {{ applePay: "auto", googlePay: "auto" }},
        }}}}
      />

      {{errorMsg && (
        <div role="alert" className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          <span>⚠</span> {{errorMsg}}
        </div>
      )}}

      <button
        type="submit"
        disabled={{!stripe || isLoading}}
        className="w-full h-12 bg-[#0F1419] text-white font-semibold rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {{isLoading
          ? <><span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Processing…</>
          : `Pay ${{ORDER.total.toFixed(2)}}`}}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
        🔒 Payments secured by Stripe
      </p>
    </form>
  );
}}

// ─── Page wrapper ─────────────────────────────────────────────────────────────
export default function CheckoutPage() {{
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {{
    fetch("/api/create-payment-intent", {{
      method: "POST",
      headers: {{ "Content-Type": "application/json" }},
      body: JSON.stringify({{ amount: ORDER.total }}),
    }})
      .then(r => r.json())
      .then(d => setClientSecret(d.clientSecret));
  }}, []);

  return (
    <main className="min-h-[100dvh] bg-[#F8FAFC] font-[Manrope,system-ui,sans-serif] py-12 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

        {{/* Order Summary */}}
        <aside className="bg-white rounded-2xl border border-slate-200 p-8 lg:sticky lg:top-8">
          <h2 className="font-bold text-lg text-[#0F1419] mb-6">Order summary</h2>
          <ul className="space-y-4">
            {{ORDER.items.map(item => (
              <li key={{item.name}} className="flex justify-between text-sm">
                <span className="text-slate-600">{{item.name}}</span>
                <span className="font-semibold">${{item.price.toFixed(2)}}</span>
              </li>
            ))}}
          </ul>
          <div className="mt-6 border-t border-slate-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>${{ORDER.subtotal.toFixed(2)}}</span></div>
            <div className="flex justify-between text-slate-500"><span>Tax</span><span>${{ORDER.tax.toFixed(2)}}</span></div>
            <div className="flex justify-between font-bold text-base text-[#0F1419] pt-2 border-t border-slate-100">
              <span>Total</span><span>${{ORDER.total.toFixed(2)}}</span>
            </div>
          </div>
        </aside>

        {{/* Payment form */}}
        <section className="bg-white rounded-2xl border border-slate-200 p-8">
          <h1 className="font-extrabold text-xl text-[#0F1419] tracking-tight mb-6">Payment details</h1>
          {{clientSecret ? (
            <Elements stripe={{stripePromise}} options={{{{ clientSecret, loader: "auto" }}}}>
              <CheckoutForm />
            </Elements>
          ) : (
            <div className="space-y-4 animate-pulse">
              <div className="h-14 bg-slate-200 rounded-xl" />
              <div className="h-14 bg-slate-200 rounded-xl" />
              <div className="h-12 bg-slate-200 rounded-xl" />
            </div>
          )}}
        </section>

      </div>

      <style>{{`
        @media (prefers-reduced-motion: reduce) {{
          *, *::before, *::after {{ animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }}
        }}
      `}}</style>
    </main>
  );
}}
'''

# ─────────────────────────────────────────────
# TEMPLATE: DATA TABLE
# Sortable, selectable, paginated admin data table with search and bulk actions
# ─────────────────────────────────────────────
TEMPLATE_DATA_TABLE = '''\
import {{ useState, useEffect, useRef }} from "react";

// Intent: CREATE_COMPONENT · Product: saas · Dials: DV=3 MI=3 VD=7
// Reference: examples/good-dashboard.jsx

export default function DataTable() {{
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const selectAllRef = useRef(null);
  const PAGE_SIZE = 5;

  useEffect(() => {{
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }}, []);

  const ROWS = [
    {{ id: 1, name: "Ana Ngugi",      email: "ana@ngugi.dev",     plan: "Team",       status: "Active",  mrr: 1247.83, joined: "2023-03-14" }},
    {{ id: 2, name: "Kenji Tanaka",   email: "kenji@tanaka.io",   plan: "Pro",        status: "Trial",   mrr: 847.23,  joined: "2024-01-08" }},
    {{ id: 3, name: "Priya Shah",     email: "priya@shahco.com",  plan: "Enterprise", status: "Active",  mrr: 4102.55, joined: "2022-11-29" }},
    {{ id: 4, name: "Ravi Okonkwo",   email: "ravi@okonkwo.ng",   plan: "Starter",    status: "Churned", mrr: 389.10,  joined: "2023-07-02" }},
    {{ id: 5, name: "Lena Müller",    email: "lena@muller.de",    plan: "Team",       status: "Active",  mrr: 2891.40, joined: "2023-05-17" }},
    {{ id: 6, name: "Fatima Al-Sayed",email: "fatima@alsayed.ae", plan: "Pro",        status: "Trial",   mrr: 673.20,  joined: "2024-02-21" }},
    {{ id: 7, name: "Diego Vasquez",  email: "diego@vasquez.mx",  plan: "Team",       status: "Active",  mrr: 1584.90, joined: "2023-09-10" }},
    {{ id: 8, name: "Wen Liu",        email: "wen@liu.studio",    plan: "Enterprise", status: "Active",  mrr: 5432.17, joined: "2022-08-04" }},
  ];

  const STATUS_STYLES = {{
    Active:  "bg-[oklch(93%_0.08_145)] text-[oklch(38%_0.12_145)]",
    Trial:   "bg-[oklch(93%_0.08_80)]  text-[oklch(42%_0.12_80)]",
    Churned: "bg-[oklch(93%_0.08_25)]  text-[oklch(42%_0.12_25)]",
  }};

  const COLS = [
    {{ key: "name",   label: "Name"   }},
    {{ key: "email",  label: "Email"  }},
    {{ key: "plan",   label: "Plan"   }},
    {{ key: "status", label: "Status" }},
    {{ key: "mrr",    label: "MRR"    }},
    {{ key: "joined", label: "Joined" }},
  ];

  function handleSort(col) {{
    if (sortBy === col) {{
      setSortDir(d => d === "asc" ? "desc" : "asc");
    }} else {{
      setSortBy(col);
      setSortDir("asc");
    }}
    setCurrentPage(1);
  }}

  const filtered = ROWS.filter(r =>
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.email.toLowerCase().includes(query.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {{
    const va = a[sortBy]; const vb = b[sortBy];
    const cmp = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb));
    return sortDir === "asc" ? cmp : -cmp;
  }});

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const allSelected = page.length > 0 && page.every(r => selectedRows.has(r.id));
  const someSelected = page.some(r => selectedRows.has(r.id)) && !allSelected;

  useEffect(() => {{
    if (selectAllRef.current) {{
      selectAllRef.current.indeterminate = someSelected;
    }}
  }}, [someSelected]);

  function toggleAll() {{
    setSelectedRows(prev => {{
      const next = new Set(prev);
      if (allSelected) {{ page.forEach(r => next.delete(r.id)); }}
      else             {{ page.forEach(r => next.add(r.id)); }}
      return next;
    }});
  }}

  function toggleRow(id) {{
    setSelectedRows(prev => {{
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    }});
  }}

  if (isLoading) {{
    return (
      <main className="min-h-[100dvh] bg-[oklch(99.5%_0.004_255)] font-[Manrope,system-ui,sans-serif] p-6 sm:p-8">
        <style>{{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
          @media (prefers-reduced-motion: reduce) {{
            *, *::before, *::after {{ animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }}
          }}
        `}}</style>
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="animate-pulse bg-slate-200 rounded h-8 w-48 mb-6" />
          {{[1,2,3,4,5,6].map(i => (
            <div key={{i}} className="animate-pulse bg-slate-200 rounded h-12 w-full" />
          ))}}
        </div>
      </main>
    );
  }}

  if (error) {{
    return (
      <main className="min-h-[100dvh] bg-[oklch(99.5%_0.004_255)] font-[Manrope,system-ui,sans-serif] flex items-center justify-center p-8">
        <div role="alert" className="max-w-sm w-full bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
          <p className="font-semibold text-rose-900 mb-1">Something went wrong</p>
          <p className="text-rose-700 text-sm mb-4">{{error}}</p>
          <button
            onClick={{() => {{ setError(null); setIsLoading(true); }}}}
            className="h-11 px-5 rounded-xl bg-rose-600 text-white font-semibold text-sm
                       hover:bg-rose-700 transition-colors
                       focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2">
            Try again
          </button>
        </div>
      </main>
    );
  }}

  return (
    <main className="min-h-[100dvh] bg-[oklch(99.5%_0.004_255)] font-[Manrope,system-ui,sans-serif] text-[#0F1419] p-6 sm:p-8">
      <style>{{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        @media (prefers-reduced-motion: reduce) {{
          *, *::before, *::after {{ animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }}
        }}
      `}}</style>

      <a href="#users-table" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-[oklch(99.5%_0.004_255)] focus:px-4 focus:py-2 focus:rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm font-medium">
        Skip to table
      </a>

      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-slate-500">{{ROWS.length}} total users</p>
        </div>

        {{/* Toolbar */}}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative">
            <label htmlFor="user-search" className="sr-only">Search users</label>
            <input
              id="user-search"
              type="search"
              aria-label="Search users"
              aria-describedby="user-search-hint"
              value={{query}}
              onChange={{e => {{ setQuery(e.target.value); setCurrentPage(1); }}}}
              placeholder="Search by name or email…"
              className="h-11 w-full sm:w-72 px-4 rounded-xl border-2 border-slate-200 bg-[oklch(99.5%_0.004_255)]
                         text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                         focus-visible:ring-offset-2 placeholder:text-slate-400 transition-colors
                         hover:border-slate-300"
            />
            <span id="user-search-hint" className="sr-only">Filters by name or email address</span>
          </div>
        </div>

        {{/* Bulk action bar */}}
        {{selectedRows.size > 0 && (
          <div className="flex items-center gap-3 min-h-[44px] px-4 py-2 mb-3 rounded-xl
                          bg-indigo-50 border border-indigo-200 text-sm font-medium text-indigo-900">
            <span>{{selectedRows.size}} selected</span>
            <button
              aria-label="Delete selected rows"
              onClick={{() => setSelectedRows(new Set())}}
              className="h-8 px-3 rounded-lg bg-rose-600 text-white text-xs font-semibold
                         hover:bg-rose-700 transition-colors
                         focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2">
              Delete
            </button>
            <button
              aria-label="Export selected rows"
              onClick={{() => {{}}}}
              className="h-8 px-3 rounded-lg bg-[oklch(99.5%_0.004_255)] border border-indigo-300 text-indigo-700
                         text-xs font-semibold hover:bg-indigo-100 transition-colors
                         focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
              Export
            </button>
          </div>
        )}}

        {{/* Table */}}
        <div id="users-table" className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-[oklch(99.5%_0.004_255)] shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th scope="col" className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    ref={{selectAllRef}}
                    checked={{allSelected}}
                    onChange={{toggleAll}}
                    aria-label="Select all rows on this page"
                    className="size-4 rounded border-slate-300 accent-indigo-600
                               focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  />
                </th>
                {{COLS.map(col => (
                  <th
                    key={{col.key}}
                    scope="col"
                    aria-sort={{sortBy === col.key ? sortDir : "none"}}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-[#0F1419] transition-colors"
                    onClick={{() => handleSort(col.key)}}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {{col.label}}
                      {{sortBy === col.key && (
                        <span aria-hidden className="text-indigo-500">
                          {{sortDir === "asc" ? "↑" : "↓"}}
                        </span>
                      )}}
                    </span>
                  </th>
                ))}}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {{page.length === 0 ? (
                <tr>
                  <td colSpan={{7}} className="px-4 py-12 text-center text-slate-400 text-sm">
                    No users match your search.
                  </td>
                </tr>
              ) : page.map(row => (
                <tr
                  key={{row.id}}
                  className={{`transition-colors hover:bg-slate-50/60 ${{selectedRows.has(row.id) ? "bg-indigo-50/40" : ""}}`}}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={{selectedRows.has(row.id)}}
                      onChange={{() => toggleRow(row.id)}}
                      aria-label={{`Select row for ${{row.name}}`}}
                      className="size-4 rounded border-slate-300 accent-indigo-600
                                 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{{row.name}}</td>
                  <td className="px-4 py-3 text-slate-500">{{row.email}}</td>
                  <td className="px-4 py-3 text-slate-600">{{row.plan}}</td>
                  <td className="px-4 py-3">
                    <span className={{`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${{STATUS_STYLES[row.status]}}`}}>
                      {{row.status}}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium tabular-nums">${{row.mrr.toFixed(2)}}</td>
                  <td className="px-4 py-3 text-slate-500 tabular-nums">{{row.joined}}</td>
                </tr>
              ))}}
            </tbody>
          </table>
        </div>

        {{/* Pagination */}}
        <nav aria-label="Pagination" className="flex items-center justify-between mt-4 text-sm">
          <p className="text-slate-500">
            Page {{currentPage}} of {{totalPages}}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={{() => setCurrentPage(p => Math.max(1, p - 1))}}
              disabled={{currentPage === 1}}
              aria-label="Previous page"
              className="h-9 px-4 rounded-lg border border-slate-200 font-medium
                         hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
              ← Previous
            </button>
            <button
              onClick={{() => setCurrentPage(p => Math.min(totalPages, p + 1))}}
              disabled={{currentPage === totalPages}}
              aria-label="Next page"
              className="h-9 px-4 rounded-lg border border-slate-200 font-medium
                         hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
              Next →
            </button>
          </div>
        </nav>
      </div>
    </main>
  );
}}
'''

# ─────────────────────────────────────────────
# TEMPLATE: REACT19
# React 19 Task Manager — useOptimistic, useActionState, useFormStatus, startTransition
# ─────────────────────────────────────────────
TEMPLATE_REACT19 = '''\
import {{
  useState,
  useOptimistic,
  useActionState,
  useTransition,
  useRef,
  useEffect,
  startTransition,
}} from "react";

// Intent: CREATE_COMPONENT · Product: productivity · Dials: DV=4 MI=4 VD=5
// Reference: examples/good-react19.jsx

// ── Simulated server actions ────────────────────────────────────────────────
async function serverAddTask(prevState, formData) {{
  const title = formData.get("title")?.toString().trim();
  if (!title || title.length < 3) return {{ error: "Title must be at least 3 characters.", task: null }};
  await new Promise(r => setTimeout(r, 340 + Math.random() * 160));
  return {{
    error: null,
    task: {{
      id: `task-${{Date.now()}}-${{Math.floor(Math.random() * 9999)}}`,
      title,
      priority: formData.get("priority") || "medium",
      completed: false,
      createdAt: new Date().toISOString(),
    }},
  }};
}}

async function serverToggleTask(id, completed) {{
  await new Promise(r => setTimeout(r, 180 + Math.random() * 100));
  return {{ id, completed }};
}}

const SEED_TASKS = [
  {{ id: "t1", title: "Migrate auth layer to Lucia v3 before Q2 cutover", priority: "high",   completed: false, createdAt: "2026-04-14T09:12:00Z" }},
  {{ id: "t2", title: "Write integration tests for payment webhook handlers",  priority: "high",   completed: false, createdAt: "2026-04-14T11:30:00Z" }},
  {{ id: "t3", title: "Update OpenAPI spec to reflect v2.4 schema changes",    priority: "medium", completed: true,  createdAt: "2026-04-13T08:00:00Z" }},
  {{ id: "t4", title: "Refactor useInfiniteQuery calls to TanStack v5 syntax", priority: "medium", completed: false, createdAt: "2026-04-15T10:05:00Z" }},
  {{ id: "t5", title: "Profile rendering bottleneck in data-grid virtualization", priority: "high", completed: false, createdAt: "2026-04-15T14:22:00Z" }},
];

// ── useFormStatus-aware submit button (must be child of form with action) ───
function SubmitButton({{ isPending }}) {{
  return (
    <button
      type="submit"
      disabled={{isPending}}
      aria-busy={{isPending}}
      className="h-11 min-h-[44px] px-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[oklch(54%_0.19_264)] text-white font-semibold text-sm hover:bg-[oklch(48%_0.19_264)] active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-[oklch(54%_0.19_264)] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-wait dark:focus-visible:ring-offset-[oklch(16%_0.012_264)]"
    >
      {{isPending ? (
        <>
          <span aria-hidden="true" className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          Saving…
        </>
      ) : "Add task"}}
    </button>
  );
}}

function PriorityBadge({{ priority }}) {{
  const styles = {{
    high:   "bg-[oklch(92%_0.06_22)] text-[oklch(38%_0.14_22)] dark:bg-[oklch(28%_0.08_22)] dark:text-[oklch(82%_0.1_22)]",
    medium: "bg-[oklch(93%_0.06_72)] text-[oklch(38%_0.12_72)] dark:bg-[oklch(28%_0.07_72)] dark:text-[oklch(82%_0.1_72)]",
    low:    "bg-[oklch(93%_0.05_155)] text-[oklch(38%_0.12_155)] dark:bg-[oklch(28%_0.07_155)] dark:text-[oklch(78%_0.1_155)]",
  }};
  return (
    <span className={{`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${{styles[priority] ?? styles.medium}}`}}>
      {{priority}}
    </span>
  );
}}

export default function React19TaskManager() {{
  const [tasks, setTasks] = useState(SEED_TASKS);
  const [filter, setFilter] = useState("all");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPending, startFilterTransition] = useTransition();
  const [deleteError, setDeleteError] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {{
    const t = setTimeout(() => setIsInitialLoading(false), 480);
    return () => clearTimeout(t);
  }}, []);

  // useOptimistic: instant task completion feedback before server confirms
  const [optimisticTasks, addOptimisticUpdate] = useOptimistic(
    tasks,
    (current, {{ id, completed }}) => current.map(t => t.id === id ? {{ ...t, completed }} : t)
  );

  // useActionState: drives the add-task form — returns [state, action, isPending]
  const [addState, addAction, isAddPending] = useActionState(
    async (prevState, formData) => {{
      try {{
        const result = await serverAddTask(prevState, formData);
        if (result.error) return result;
        setTasks(prev => [result.task, ...prev]);
        formRef.current?.reset();
        return {{ error: null, task: result.task }};
      }} catch (err) {{
        return {{ error: err.message || "Failed to add task — please retry.", task: null }};
      }}
    }},
    {{ error: null, task: null }}
  );

  async function handleToggle(taskId, newCompleted) {{
    addOptimisticUpdate({{ id: taskId, completed: newCompleted }});
    try {{
      await serverToggleTask(taskId, newCompleted);
      setTasks(prev => prev.map(t => t.id === taskId ? {{ ...t, completed: newCompleted }} : t));
    }} catch {{
      setTasks(prev => [...prev]); // revert via reconciliation
    }}
  }}

  async function handleDelete(taskId) {{
    setDeleteError(null);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {{
      await new Promise(r => setTimeout(r, 220));
    }} catch (err) {{
      setDeleteError("Couldn't delete task — please try again.");
    }}
  }}

  function handleFilterChange(f) {{
    startTransition(() => {{ startFilterTransition(() => {{ setFilter(f); }}); }});
  }}

  const filteredTasks = optimisticTasks.filter(t => {{
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  }});

  const stats = {{
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    high: tasks.filter(t => t.priority === "high" && !t.completed).length,
  }};
  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  if (isInitialLoading) {{
    return (
      <main aria-label="Task manager loading" className="min-h-[100dvh] bg-[oklch(97%_0.004_264)] dark:bg-[oklch(13%_0.012_264)] p-6 font-[Manrope,system-ui,sans-serif]">
        <style>{{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
          @media (prefers-reduced-motion: reduce) {{
            *, *::before, *::after {{ animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }}
          }}
        `}}</style>
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="animate-pulse h-9 w-52 rounded-xl bg-[oklch(90%_0.008_264)] dark:bg-[oklch(22%_0.014_264)]" />
          <div className="animate-pulse h-16 w-full rounded-2xl bg-[oklch(92%_0.006_264)] dark:bg-[oklch(20%_0.012_264)]" />
          {{[1,2,3].map(i => <div key={{i}} className="animate-pulse h-20 w-full rounded-xl bg-[oklch(92%_0.006_264)] dark:bg-[oklch(20%_0.012_264)]" />)}}
        </div>
      </main>
    );
  }}

  return (
    <main id="main-content" className="min-h-[100dvh] bg-[oklch(97%_0.004_264)] dark:bg-[oklch(13%_0.012_264)] font-[Manrope,system-ui,sans-serif] text-[oklch(16%_0.02_264)] dark:text-[oklch(92%_0.012_264)]">
      <style>{{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        @media (prefers-reduced-motion: reduce) {{
          *, *::before, *::after {{ animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }}
        }}
      `}}</style>

      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-[oklch(99.5%_0.004_264)] focus:px-4 focus:py-2 focus:rounded-lg focus:ring-2 focus:ring-[oklch(54%_0.19_264)] focus:text-sm font-semibold">
        Skip to main content
      </a>

      <header className="sticky top-0 z-10 border-b border-[oklch(90%_0.012_264)] bg-[oklch(99%_0.004_264)]/80 backdrop-blur-xl dark:border-[oklch(24%_0.016_264)] dark:bg-[oklch(15%_0.012_264)]/80">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-base tracking-tight">Taskcroft</span>
          <span className="text-xs font-medium text-[oklch(55%_0.025_264)] dark:text-[oklch(58%_0.02_264)]">React 19 patterns</span>
        </div>
      </header>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Sprint tasks</h1>
          <p className="mt-1 text-sm text-[oklch(52%_0.025_264)] dark:text-[oklch(58%_0.02_264)]">
            {{stats.completed}} of {{stats.total}} done · {{stats.high}} high-priority remaining
          </p>
          <div className="mt-4" role="progressbar" aria-valuenow={{completionPct}} aria-valuemin={{0}} aria-valuemax={{100}} aria-label={{`${{completionPct}}% of tasks completed`}}>
            <div className="h-2 w-full rounded-full bg-[oklch(90%_0.012_264)] dark:bg-[oklch(24%_0.016_264)] overflow-hidden">
              <div className="h-full rounded-full bg-[oklch(54%_0.19_264)] transition-all duration-500 ease-out" style={{{{ width: `${{completionPct}}%` }}}} />
            </div>
          </div>
        </div>

        {{/* useActionState form — action prop drives the async server action */}}
        <section aria-label="Add new task" className="mb-6">
          <h2 className="sr-only">Add a new task</h2>
          <form ref={{formRef}} action={{addAction}} className="bg-[oklch(99.5%_0.004_264)] dark:bg-[oklch(17%_0.014_264)] rounded-2xl border border-[oklch(91%_0.012_264)] dark:border-[oklch(26%_0.016_264)] p-4">
            {{addState.error && (
              <div role="alert" aria-live="assertive" className="mb-3 p-3 rounded-lg bg-[oklch(94%_0.06_22)] dark:bg-[oklch(24%_0.07_22)] border border-[oklch(84%_0.1_22)] text-sm text-[oklch(36%_0.14_22)] dark:text-[oklch(80%_0.1_22)]">
                {{addState.error}}
              </div>
            )}}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label htmlFor="task-title" className="sr-only">Task title</label>
                <input
                  id="task-title" name="title" type="text"
                  placeholder="e.g. Migrate CI pipeline to GitHub Actions"
                  autoComplete="off"
                  aria-invalid={{!!addState.error}}
                  aria-describedby={{addState.error ? "task-add-error" : undefined}}
                  className="w-full h-11 min-h-[44px] px-4 rounded-xl border-2 border-[oklch(88%_0.015_264)] dark:border-[oklch(30%_0.018_264)] bg-transparent text-sm outline-none transition-colors focus:border-[oklch(54%_0.19_264)] focus-visible:ring-2 focus-visible:ring-[oklch(54%_0.19_264)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[oklch(17%_0.014_264)]"
                />
              </div>
              <div>
                <label htmlFor="task-priority" className="sr-only">Priority</label>
                <select
                  id="task-priority" name="priority"
                  className="h-11 min-h-[44px] px-3 rounded-xl border-2 border-[oklch(88%_0.015_264)] dark:border-[oklch(30%_0.018_264)] bg-transparent text-sm outline-none focus-visible:ring-2 focus-visible:ring-[oklch(54%_0.19_264)] focus-visible:ring-offset-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <SubmitButton isPending={{isAddPending}} />
            </div>
          </form>
        </section>

        {{deleteError && (
          <div role="alert" aria-live="assertive" className="mb-4 p-3 rounded-xl bg-[oklch(94%_0.06_22)] dark:bg-[oklch(24%_0.07_22)] border border-[oklch(84%_0.1_22)] text-sm text-[oklch(36%_0.14_22)] dark:text-[oklch(80%_0.1_22)] flex items-center justify-between">
            <span>{{deleteError}}</span>
            <button onClick={{() => setDeleteError(null)}} aria-label="Dismiss error" className="ml-3 opacity-70 hover:opacity-100 focus-visible:ring-2 rounded-md">✕</button>
          </div>
        )}}

        {{/* Filter bar uses startTransition for non-urgent updates */}}
        <div role="tablist" aria-label="Filter tasks" className="inline-flex items-center gap-1 bg-[oklch(92%_0.008_264)] dark:bg-[oklch(20%_0.014_264)] p-1 rounded-xl mb-4">
          {{[{{key:"all",label:"All"}},{{key:"active",label:"Active"}},{{key:"completed",label:"Done"}}].map(({{key,label}}) => (
            <button key={{key}} role="tab" aria-selected={{filter===key}} onClick={{()=>handleFilterChange(key)}}
              className={{`h-8 px-4 rounded-lg text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-[oklch(54%_0.19_264)] ${{filter===key ? "bg-[oklch(99.5%_0.004_264)] dark:bg-[oklch(26%_0.016_264)] shadow-sm" : "text-[oklch(48%_0.025_264)] dark:text-[oklch(56%_0.02_264)]"}} ${{isPending ? "opacity-60" : ""}}`}}>
              {{label}}
            </button>
          ))}}
        </div>

        {{/* Task list with useOptimistic — changes appear instantly */}}
        <section aria-label="Task list">
          {{filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-sm text-[oklch(52%_0.025_264)] dark:text-[oklch(54%_0.02_264)]">
              {{filter === "completed" ? "No completed tasks yet." : filter === "active" ? "All caught up!" : "No tasks yet — add one above."}}
            </div>
          ) : (
            <ul className="space-y-2" aria-live="polite" aria-atomic="false">
              {{filteredTasks.map(task => {{
                const isCompleted = optimisticTasks.find(t => t.id === task.id)?.completed ?? task.completed;
                return (
                  <li key={{task.id}} className={{`group flex items-start gap-3 p-4 rounded-xl border transition-all ${{isCompleted ? "bg-[oklch(97%_0.004_264)] border-[oklch(90%_0.01_264)] dark:bg-[oklch(20%_0.008_264)] dark:border-[oklch(28%_0.012_264)]" : "bg-[oklch(99.5%_0.004_264)] border-[oklch(92%_0.012_264)] dark:bg-[oklch(18%_0.012_264)] dark:border-[oklch(26%_0.016_264)]"}}`}}>
                    <button
                      onClick={{()=>handleToggle(task.id, !isCompleted)}}
                      aria-label={{isCompleted ? `Mark "${{task.title}}" incomplete` : `Complete "${{task.title}}"`}}
                      aria-pressed={{isCompleted}}
                      className="mt-0.5 size-5 min-h-[44px] min-w-[44px] -m-2.5 p-2.5 flex items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-[oklch(54%_0.19_264)] focus-visible:ring-offset-2 transition-colors flex-shrink-0"
                    >
                      <span className={{`size-5 rounded-md border-2 flex items-center justify-center transition-all ${{isCompleted ? "bg-[oklch(54%_0.19_264)] border-[oklch(54%_0.19_264)]" : "border-[oklch(72%_0.025_264)] dark:border-[oklch(44%_0.025_264)]"}}`}}>
                        {{isCompleted && <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3 text-white fill-none stroke-current stroke-2"><polyline points="2,6 5,9 10,3" /></svg>}}
                      </span>
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={{`text-sm font-medium leading-snug ${{isCompleted ? "line-through text-[oklch(62%_0.02_264)] dark:text-[oklch(50%_0.02_264)]" : "text-[oklch(16%_0.02_264)] dark:text-[oklch(92%_0.012_264)]"}}`}}>{{task.title}}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <PriorityBadge priority={{task.priority}} />
                        <time dateTime={{task.createdAt}} className="text-xs text-[oklch(58%_0.02_264)] dark:text-[oklch(52%_0.02_264)]">
                          {{new Date(task.createdAt).toLocaleDateString("en-US",{{month:"short",day:"numeric"}})}}
                        </time>
                      </div>
                    </div>
                    <button onClick={{()=>handleDelete(task.id)}} aria-label={{`Delete task: ${{task.title}}`}}
                      className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 size-8 min-h-[44px] min-w-[44px] -m-2 p-3 flex items-center justify-center rounded-lg text-[oklch(58%_0.02_264)] hover:text-[oklch(44%_0.18_22)] hover:bg-[oklch(94%_0.04_22)] dark:hover:bg-[oklch(26%_0.06_22)] focus-visible:ring-2 focus-visible:ring-[oklch(54%_0.19_22)] transition-all">
                      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 fill-current">
                        <path d="M5.5 1.5A1.5 1.5 0 0 1 7 0h2a1.5 1.5 0 0 1 1.5 1.5H13a1 1 0 1 1 0 2H3a1 1 0 0 1 0-2h2.5Zm-2 4a1 1 0 0 1 1 1V13a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V6.5a1 1 0 1 1 2 0V13a3 3 0 0 1-3 3H5.5a3 3 0 0 1-3-3V6.5a1 1 0 0 1 1-1Z" />
                      </svg>
                    </button>
                  </li>
                );
              }})}}
            </ul>
          )}}
        </section>

        <footer className="mt-8 pt-6 border-t border-[oklch(90%_0.012_264)] dark:border-[oklch(22%_0.016_264)]">
          <dl className="grid grid-cols-3 gap-4 text-center">
            {{[{{label:"Total",value:stats.total}},{{label:"Done",value:stats.completed}},{{label:"High pri.",value:stats.high}}].map(({{label,value}}) => (
              <div key={{label}} className="bg-[oklch(99.5%_0.004_264)] dark:bg-[oklch(17%_0.014_264)] rounded-xl p-3 border border-[oklch(91%_0.012_264)] dark:border-[oklch(26%_0.016_264)]">
                <dt className="text-xs text-[oklch(55%_0.025_264)] dark:text-[oklch(54%_0.02_264)] font-medium">{{label}}</dt>
                <dd className="mt-0.5 text-2xl font-bold tracking-tight">{{value}}</dd>
              </div>
            ))}}
          </dl>
          <p className="mt-4 text-xs text-center text-[oklch(62%_0.02_264)] dark:text-[oklch(48%_0.02_264)]">
            React 19 · useOptimistic · useActionState · useFormStatus · startTransition
          </p>
        </footer>
      </section>
    </main>
  );
}}
'''

# ─────────────────────────────────────────────
# TEMPLATE: AI_CHAT
# AI chat UI — simulated streaming, stop button, example prompts, auto-scroll
# ─────────────────────────────────────────────
TEMPLATE_AI_CHAT = '''\
import {{ useState, useEffect, useRef, useCallback }} from "react";

// Intent: CREATE_COMPONENT · Product: ai-assistant · Dials: DV=4 MI=4 VD=7
// Reference: examples/good-ai-chat.jsx

const MOCK_RESPONSES = [
  "That's an interesting angle. When I look at the architecture here, the key bottleneck is likely the N+1 query pattern in your data layer — each list item fires a separate DB call. Batching with DataLoader would cut latency by roughly 73.4% based on similar workloads.",
  "The component re-renders on every keystroke because filteredItems is recalculated inline. Moving it into a useMemo with the right dependency array should drop your render count from 847ms to under 60ms.",
  "For the TypeScript migration path, start with allowJs: true and checkJs: true in tsconfig — that gives you incremental safety without rewriting everything at once. Your utils/ folder looks like the highest-value target first.",
  "Your contrast ratio between card text and background is 3.2:1 — that fails WCAG AA (needs 4.5:1 minimum). Shifting the body text from slate-400 to slate-600 gets you to 6.8:1 without changing visual weight significantly.",
];

const EXAMPLE_PROMPTS = [
  {{ label: "Debug slow renders",     prompt: "My React list re-renders on every keystroke — how do I profile and fix it?" }},
  {{ label: "Improve color contrast", prompt: "Can you audit my design for WCAG AA color contrast issues and suggest fixes?" }},
  {{ label: "TypeScript migration",   prompt: "What's the safest incremental path to migrate a large JavaScript codebase to TypeScript?" }},
  {{ label: "Pricing strategy",       prompt: "Our pricing page has three tiers but conversion is low — what does the data suggest?" }},
];

function ThinkingDots() {{
  return (
    <span className="inline-flex items-center gap-1" aria-label="Assistant is thinking">
      {{[0,1,2].map(i => (
        <span key={{i}} className="size-1.5 rounded-full bg-[oklch(55%_0.18_255)] animate-bounce" style={{{{ animationDelay: `${{i*140}}ms` }}}} />
      ))}}
    </span>
  );
}}

function MessageBubble({{ message }}) {{
  const isUser = message.role === "user";
  return (
    <article className={{`flex gap-3 ${{isUser ? "flex-row-reverse" : "flex-row"}}`}} aria-label={{`${{isUser ? "You" : "Assistant"}} said`}}>
      <div className={{`size-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-1 ${{isUser ? "bg-[oklch(55%_0.2_255)] text-[oklch(98%_0.01_255)]" : "bg-[oklch(72%_0.15_160)] text-[oklch(20%_0.04_255)]"}}`}} aria-hidden="true">
        {{isUser ? "Y" : "AI"}}
      </div>
      <div className={{`flex flex-col gap-1 max-w-[78%] ${{isUser ? "items-end" : "items-start"}}`}}>
        <div className={{`px-4 py-3 rounded-2xl text-sm leading-relaxed ${{isUser ? "bg-[oklch(55%_0.2_255)] text-[oklch(98%_0.01_255)] rounded-tr-sm" : "bg-[oklch(96%_0.01_255)] dark:bg-[oklch(22%_0.015_255)] text-[oklch(18%_0.02_255)] dark:text-[oklch(92%_0.01_255)] border border-[oklch(88%_0.02_255)] dark:border-[oklch(30%_0.02_255)] rounded-tl-sm"}}`}}>
          {{message.isStreaming && !message.content ? <ThinkingDots /> : (
            <p>
              {{message.content}}
              {{message.isStreaming && <span className="inline-block w-0.5 h-3.5 bg-current ml-0.5 animate-pulse align-middle" aria-hidden="true" />}}
            </p>
          )}}
          {{message.aborted && <p className="mt-1 text-xs opacity-60 italic">[Response stopped]</p>}}
        </div>
        <time dateTime={{message.timestamp?.toISOString()}} className="text-[10px] text-[oklch(55%_0.02_255)] dark:text-[oklch(60%_0.02_255)] px-1">
          {{message.timestamp?.toLocaleTimeString([],{{hour:"2-digit",minute:"2-digit"}})}}
        </time>
      </div>
    </article>
  );
}}

export default function AIChatUI() {{
  const [messages, setMessages] = useState([{{
    id: "welcome-1", role: "assistant",
    content: "Hi — I can help you debug code, review design decisions, or analyze metrics. What are you working on?",
    timestamp: new Date(Date.now() - 120_000),
  }}]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPrompts, setShowPrompts] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {{
    bottomRef.current?.scrollIntoView({{ behavior: "smooth", block: "end" }});
  }}, [messages]);

  useEffect(() => {{
    if (messages.some(m => m.role === "user")) setShowPrompts(false);
  }}, [messages]);

  const handleSubmit = useCallback(async (e) => {{
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMsg = {{ id: `user-${{Date.now()}}`, role: "user", content: input.trim(), timestamp: new Date() }};
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const assistantId = `assistant-${{Date.now()}}`;
    const fullResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];

    setMessages(prev => [...prev, {{ id: assistantId, role: "assistant", content: "", timestamp: new Date(), isStreaming: true }}]);
    let charIndex = 0;
    const interval = setInterval(() => {{
      if (controller.signal.aborted) {{
        clearInterval(interval);
        setMessages(prev => prev.map(m => m.id === assistantId ? {{ ...m, isStreaming: false, aborted: true }} : m));
        setIsLoading(false);
        return;
      }}
      charIndex += Math.floor(Math.random() * 4) + 2;
      const done = charIndex >= fullResponse.length;
      setMessages(prev => prev.map(m => m.id === assistantId
        ? {{ ...m, content: done ? fullResponse : fullResponse.slice(0, charIndex), isStreaming: !done }} : m));
      if (done) {{ clearInterval(interval); setIsLoading(false); }}
    }}, 28);
  }}, [input, isLoading]);

  const stop = useCallback(() => {{ abortControllerRef.current?.abort(); }}, []);

  const handlePromptClick = (prompt) => {{ setInput(prompt); setShowPrompts(false); inputRef.current?.focus(); }};

  return (
    <main className="flex flex-col min-h-[100dvh] bg-[oklch(97%_0.008_255)] dark:bg-[oklch(12%_0.015_255)] font-[Manrope,system-ui,sans-serif]" aria-label="AI Chat interface">
      <style>{{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        @media (prefers-reduced-motion: reduce) {{
          *, *::before, *::after {{ animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }}
        }}
      `}}</style>

      <a href="#chat-input" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[oklch(55%_0.2_255)] focus:text-[oklch(98%_0.01_255)] focus:px-4 focus:py-2 focus:rounded-lg focus:ring-2 focus:ring-offset-2 focus:ring-[oklch(55%_0.2_255)] text-sm font-medium">
        Skip to main content
      </a>

      <header className="sticky top-0 z-10 border-b border-[oklch(88%_0.02_255)] dark:border-[oklch(25%_0.02_255)] bg-[oklch(97%_0.008_255)]/80 dark:bg-[oklch(12%_0.015_255)]/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-[oklch(55%_0.2_255)] flex items-center justify-center" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8c0 1.54.52 2.96 1.38 4.1L1.5 14.5l2.46-1.37A6.46 6.46 0 0 0 8 14.5c3.59 0 6.5-2.91 6.5-6.5S11.59 1.5 8 1.5z" fill="oklch(98% 0.01 255)" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-[oklch(18%_0.02_255)] dark:text-[oklch(93%_0.01_255)] leading-none">Meridian AI</h1>
              <p className="text-[10px] text-[oklch(55%_0.03_255)] dark:text-[oklch(65%_0.02_255)] mt-0.5">Code · Design · Strategy</p>
            </div>
          </div>
          {{isLoading && <span className="text-xs text-[oklch(55%_0.18_255)] dark:text-[oklch(70%_0.15_255)] font-medium animate-pulse">Thinking…</span>}}
          <button aria-label="New conversation" className="size-9 rounded-lg hover:bg-[oklch(91%_0.02_255)] dark:hover:bg-[oklch(22%_0.02_255)] transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.2_255)] focus-visible:ring-offset-2 flex items-center justify-center text-[oklch(45%_0.03_255)] dark:text-[oklch(70%_0.02_255)]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
          </button>
        </div>
      </header>

      <section className="flex-1 overflow-y-auto" aria-label="Conversation history" aria-live="polite" aria-atomic="false">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
          {{messages.map(msg => <MessageBubble key={{msg.id}} message={{msg}} />)}}
          {{error && (
            <div role="alert" aria-describedby="chat-error-desc" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[oklch(95%_0.05_25)] dark:bg-[oklch(20%_0.04_25)] border border-[oklch(82%_0.08_25)] dark:border-[oklch(35%_0.06_25)]">
              <span className="text-[oklch(52%_0.18_25)]" aria-hidden="true">⚠</span>
              <p id="chat-error-desc" className="text-sm text-[oklch(42%_0.12_25)] dark:text-[oklch(75%_0.1_25)] font-medium">{{error}}</p>
            </div>
          )}}
          {{showPrompts && (
            <div className="pt-4">
              <p className="text-xs font-semibold text-[oklch(55%_0.03_255)] dark:text-[oklch(60%_0.02_255)] uppercase tracking-wider mb-3">Try asking about</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {{EXAMPLE_PROMPTS.map(p => (
                  <button key={{p.label}} onClick={{()=>handlePromptClick(p.prompt)}}
                    className="text-left px-4 py-3 min-h-[44px] rounded-xl border border-[oklch(85%_0.025_255)] dark:border-[oklch(28%_0.025_255)] bg-[oklch(99%_0.005_255)] dark:bg-[oklch(17%_0.015_255)] hover:border-[oklch(60%_0.15_255)] dark:hover:border-[oklch(55%_0.15_255)] transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.2_255)] focus-visible:ring-offset-2"
                    aria-label={{`Start with prompt: ${{p.prompt}}`}}>
                    <span className="block text-xs font-semibold text-[oklch(40%_0.04_255)] dark:text-[oklch(80%_0.02_255)]">{{p.label}}</span>
                    <span className="block text-[11px] text-[oklch(60%_0.025_255)] dark:text-[oklch(58%_0.02_255)] mt-0.5 line-clamp-2">{{p.prompt}}</span>
                  </button>
                ))}}
              </div>
            </div>
          )}}
          <div ref={{bottomRef}} aria-hidden="true" />
        </div>
      </section>

      <footer className="border-t border-[oklch(88%_0.02_255)] dark:border-[oklch(25%_0.02_255)] bg-[oklch(97%_0.008_255)] dark:bg-[oklch(12%_0.015_255)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <form onSubmit={{handleSubmit}} className="flex items-end gap-3">
            <label htmlFor="chat-input" className="sr-only">Message Meridian AI</label>
            <div className="flex-1 relative">
              <textarea
                id="chat-input" ref={{inputRef}} value={{input}}
                onChange={{e => setInput(e.target.value)}}
                onKeyDown={{e => {{ if (e.key==="Enter" && !e.shiftKey) {{ e.preventDefault(); handleSubmit(e); }} }}}}
                placeholder="Ask about code, design decisions, or business metrics…"
                rows={{1}} disabled={{isLoading}}
                aria-describedby={{error ? "chat-error-desc" : undefined}}
                className="w-full resize-none rounded-2xl border border-[oklch(85%_0.025_255)] dark:border-[oklch(28%_0.025_255)] bg-[oklch(99%_0.005_255)] dark:bg-[oklch(17%_0.015_255)] px-4 py-3 text-sm text-[oklch(18%_0.02_255)] dark:text-[oklch(92%_0.01_255)] placeholder:text-[oklch(65%_0.02_255)] min-h-[44px] max-h-[160px] focus:outline-none focus:ring-2 focus:ring-[oklch(55%_0.2_255)] focus:border-transparent transition-colors disabled:opacity-50 leading-relaxed"
              />
            </div>
            {{/* Stop button — only visible during streaming */}}
            {{isLoading && (
              <button type="button" onClick={{stop}} aria-label="Stop generating response"
                className="size-11 rounded-2xl bg-[oklch(92%_0.03_25)] dark:bg-[oklch(22%_0.04_25)] hover:bg-[oklch(88%_0.06_25)] border border-[oklch(82%_0.06_25)] dark:border-[oklch(35%_0.06_25)] transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.2_255)] focus-visible:ring-offset-2 flex items-center justify-center shrink-0 min-h-[44px]">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><rect x="2" y="2" width="10" height="10" rx="2" fill="oklch(52% 0.18 25)" /></svg>
              </button>
            )}}
            {{!isLoading && (
              <button type="submit" disabled={{!input.trim()}} aria-label="Send message"
                className="size-11 rounded-2xl bg-[oklch(55%_0.2_255)] hover:bg-[oklch(50%_0.22_255)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.2_255)] focus-visible:ring-offset-2 flex items-center justify-center shrink-0 min-h-[44px]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M14 8L2 2l3 6-3 6 12-6z" fill="oklch(98% 0.01 255)" /></svg>
              </button>
            )}}
          </form>
          <p className="mt-2 text-[10px] text-[oklch(62%_0.02_255)] dark:text-[oklch(50%_0.02_255)] text-center">
            Press <kbd className="font-mono bg-[oklch(91%_0.02_255)] dark:bg-[oklch(22%_0.02_255)] px-1 py-0.5 rounded text-[9px]">Enter</kbd> to send ·
            <kbd className="font-mono bg-[oklch(91%_0.02_255)] dark:bg-[oklch(22%_0.02_255)] px-1 py-0.5 rounded text-[9px]">Shift+Enter</kbd> for new line
          </p>
        </div>
      </footer>
    </main>
  );
}}
'''

# ─────────────────────────────────────────────
# TEMPLATE: PERF
# Virtualized list — useVirtualizer, React.lazy + Suspense, lazy images, prefetch
# ─────────────────────────────────────────────
TEMPLATE_PERF = '''\
import React, {{
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  Suspense,
  lazy,
}} from "react";
import {{ useVirtualizer }} from "@tanstack/react-virtual";

// Intent: CREATE_COMPONENT · Product: catalog · Dials: DV=4 MI=3 VD=7
// Reference: examples/good-perf.jsx

// ── Lazy-loaded detail panel (code-splitting via React.lazy + Suspense) ──────
const ItemDetailPanel = lazy(() =>
  Promise.resolve({{
    default: function DetailPanel({{ item, onClose }}) {{
      return (
        <aside role="complementary" aria-label={{`Details for ${{item.name}}`}}
          className="fixed inset-y-0 right-0 w-72 bg-[oklch(99%_0.005_255)] dark:bg-[oklch(18%_0.01_255)] border-l border-[oklch(90%_0.02_255)] dark:border-[oklch(30%_0.02_255)] shadow-2xl z-40 flex flex-col">
          <header className="flex items-center justify-between px-5 py-4 border-b border-[oklch(90%_0.02_255)] dark:border-[oklch(30%_0.02_255)]">
            <h2 className="font-bold text-[oklch(20%_0.01_255)] dark:text-[oklch(95%_0.01_255)] text-sm">Item Detail</h2>
            <button onClick={{onClose}} aria-label="Close detail panel"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[oklch(45%_0.04_255)] hover:bg-[oklch(93%_0.02_255)] dark:hover:bg-[oklch(28%_0.02_255)] focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.18_260)] transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <img src={{item.avatar}} alt={{`${{item.name}} avatar`}} loading="lazy" decoding="async" width="64" height="64"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-[oklch(80%_0.08_260)]" />
            <p className="font-bold text-[oklch(20%_0.01_255)] dark:text-[oklch(95%_0.01_255)] text-lg">{{item.name}}</p>
            <p className="text-sm text-[oklch(52%_0.04_255)] dark:text-[oklch(65%_0.04_255)]">{{item.role}}</p>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-xs font-semibold text-[oklch(55%_0.04_255)] uppercase tracking-wider">Department</dt><dd className="mt-0.5 font-medium text-[oklch(25%_0.02_255)] dark:text-[oklch(90%_0.02_255)]">{{item.department}}</dd></div>
              <div><dt className="text-xs font-semibold text-[oklch(55%_0.04_255)] uppercase tracking-wider">Location</dt><dd className="mt-0.5 font-medium text-[oklch(25%_0.02_255)] dark:text-[oklch(90%_0.02_255)]">{{item.location}}</dd></div>
              <div><dt className="text-xs font-semibold text-[oklch(55%_0.04_255)] uppercase tracking-wider">Score</dt>
                <dd className="mt-1"><div className="flex items-center gap-2"><div className="flex-1 h-2 rounded-full bg-[oklch(90%_0.02_255)] dark:bg-[oklch(30%_0.02_255)]"><div className="h-2 rounded-full bg-[oklch(60%_0.18_145)]" style={{{{ width: `${{item.score}}%` }}}} /></div><span className="text-xs font-semibold tabular-nums">{{item.score}}%</span></div></dd>
              </div>
            </dl>
          </div>
        </aside>
      );
    }},
  }})
);

const DEPARTMENTS = ["Engineering", "Design", "Product", "Data Science", "Marketing", "Operations"];

const RAW_ITEMS = [
  {{ id:1,  name:"Amara Nwosu",        role:"Senior Software Engineer",   dept:"Engineering",   loc:"Lagos, NG",      score:91, status:"Active"   }},
  {{ id:2,  name:"Kenji Watanabe",      role:"UX Design Lead",             dept:"Design",        loc:"Tokyo, JP",      score:88, status:"Remote"   }},
  {{ id:3,  name:"Priya Krishnamurthy", role:"Principal Data Scientist",   dept:"Data Science",  loc:"Mumbai, IN",     score:94, status:"Active"   }},
  {{ id:4,  name:"Sebastián Vargas",    role:"Product Manager",            dept:"Product",       loc:"São Paulo, BR",  score:85, status:"Active"   }},
  {{ id:5,  name:"Fatima Al-Rashidi",   role:"Engineering Manager",        dept:"Engineering",   loc:"Cairo, EG",      score:96, status:"Active"   }},
  {{ id:6,  name:"Tobias Heinemann",    role:"Frontend Engineer",          dept:"Engineering",   loc:"Berlin, DE",     score:82, status:"Active"   }},
  {{ id:7,  name:"Yuki Adeyemi",        role:"Growth Marketing Manager",   dept:"Marketing",     loc:"Amsterdam, NL",  score:87, status:"Remote"   }},
  {{ id:8,  name:"Naledi Dlamini",      role:"Senior Product Designer",    dept:"Design",        loc:"Nairobi, KE",    score:90, status:"Active"   }},
  {{ id:9,  name:"Haruto Shibata",      role:"Backend Engineer",           dept:"Engineering",   loc:"Tokyo, JP",      score:83, status:"Active"   }},
  {{ id:10, name:"Camille Beaulieu",    role:"Financial Analyst",          dept:"Operations",    loc:"Toronto, CA",    score:79, status:"Active"   }},
  {{ id:11, name:"Olusegun Adebayo",    role:"DevOps Engineer",            dept:"Engineering",   loc:"Lagos, NG",      score:86, status:"Active"   }},
  {{ id:12, name:"Mei-Ling Chen",       role:"Machine Learning Engineer",  dept:"Data Science",  loc:"Seoul, KR",      score:92, status:"Active"   }},
  {{ id:13, name:"Ingrid Bergström",    role:"Operations Lead",            dept:"Operations",    loc:"Amsterdam, NL",  score:84, status:"On Leave" }},
  {{ id:14, name:"Kofi Mensah",         role:"Senior Data Analyst",        dept:"Data Science",  loc:"Nairobi, KE",    score:81, status:"Active"   }},
  {{ id:15, name:"Sakura Yamamoto",     role:"Visual Designer",            dept:"Design",        loc:"Tokyo, JP",      score:78, status:"Active"   }},
  {{ id:16, name:"Ravi Sundaram",       role:"Staff Engineer",             dept:"Engineering",   loc:"Mumbai, IN",     score:97, status:"Active"   }},
  {{ id:17, name:"Anika Hoffmann",      role:"Content Strategist",         dept:"Marketing",     loc:"Berlin, DE",     score:76, status:"Remote"   }},
  {{ id:18, name:"Emeka Eze",           role:"Product Analyst",            dept:"Product",       loc:"Lagos, NG",      score:85, status:"Active"   }},
  {{ id:19, name:"Hana Park",           role:"Senior UX Researcher",       dept:"Design",        loc:"Seoul, KR",      score:89, status:"Active"   }},
  {{ id:20, name:"Lucía Moreno",        role:"iOS Engineer",               dept:"Engineering",   loc:"São Paulo, BR",  score:84, status:"Active"   }},
  {{ id:21, name:"Takeshi Ando",        role:"Infrastructure Engineer",    dept:"Engineering",   loc:"Tokyo, JP",      score:88, status:"Remote"   }},
  {{ id:22, name:"Chiamaka Obi",        role:"Risk & Compliance Analyst",  dept:"Operations",    loc:"Lagos, NG",      score:80, status:"Active"   }},
  {{ id:23, name:"Pooja Joshi",         role:"Data Engineer",              dept:"Data Science",  loc:"Mumbai, IN",     score:86, status:"Active"   }},
  {{ id:24, name:"Simone Carvalho",     role:"Brand Designer",             dept:"Design",        loc:"São Paulo, BR",  score:82, status:"Contract" }},
  {{ id:25, name:"Yeon-Seo Kim",        role:"Head of Product",            dept:"Product",       loc:"Seoul, KR",      score:95, status:"Active"   }},
  {{ id:26, name:"Marcus Osei",         role:"Full-Stack Engineer",        dept:"Engineering",   loc:"Toronto, CA",    score:83, status:"Active"   }},
  {{ id:27, name:"Elif Çelik",          role:"Data Scientist",             dept:"Data Science",  loc:"Istanbul, TR",   score:89, status:"Remote"   }},
  {{ id:28, name:"Adaeze Chukwu",       role:"Engineering Team Lead",      dept:"Engineering",   loc:"Lagos, NG",      score:94, status:"Active"   }},
  {{ id:29, name:"Valentina Romano",    role:"Senior Recruiter",           dept:"Operations",    loc:"Amsterdam, NL",  score:80, status:"Active"   }},
  {{ id:30, name:"Siddharth Kulkarni",  role:"Principal Product Manager",  dept:"Product",       loc:"Mumbai, IN",     score:93, status:"Active"   }},
];

const ITEMS = RAW_ITEMS.map(e => ({{
  ...e,
  department: e.dept,
  location: e.loc,
  avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${{encodeURIComponent(e.name)}}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
}}));

const STATUS_STYLES = {{
  Active:     "bg-[oklch(93%_0.08_145)] text-[oklch(33%_0.12_145)] dark:bg-[oklch(28%_0.08_145)] dark:text-[oklch(78%_0.12_145)]",
  "On Leave": "bg-[oklch(93%_0.08_70)]  text-[oklch(38%_0.12_70)]  dark:bg-[oklch(28%_0.08_70)]  dark:text-[oklch(78%_0.12_70)]",
  Remote:     "bg-[oklch(93%_0.08_260)] text-[oklch(36%_0.12_260)] dark:bg-[oklch(28%_0.08_260)] dark:text-[oklch(78%_0.12_260)]",
  Contract:   "bg-[oklch(93%_0.07_35)]  text-[oklch(38%_0.12_35)]  dark:bg-[oklch(28%_0.07_35)]  dark:text-[oklch(78%_0.12_35)]",
}};

// Memoized row component — avoids re-renders during scroll
const ItemRow = React.memo(function ItemRow({{ item, onSelect, prefetchDetail }}) {{
  const handleMouseEnter = useCallback(() => {{ prefetchDetail(item.id); }}, [item.id, prefetchDetail]);

  return (
    <article
      className="flex items-center gap-3 px-4 py-3 border-b border-[oklch(92%_0.01_255)] dark:border-[oklch(28%_0.01_255)] hover:bg-[oklch(97%_0.01_255)] dark:hover:bg-[oklch(22%_0.01_255)] transition-colors cursor-pointer group"
      style={{{{ contain: "layout style" }}}}
      onMouseEnter={{handleMouseEnter}}
      onClick={{() => onSelect(item)}}
      role="button" tabIndex={{0}}
      aria-label={{`View profile of ${{item.name}}, ${{item.role}}`}}
      onKeyDown={{e => {{ if (e.key==="Enter"||e.key===" ") {{ e.preventDefault(); onSelect(item); }} }}}}
    >
      <img src={{item.avatar}} alt={{`${{item.name}} initials avatar`}} loading="lazy" decoding="async" width="36" height="36"
        className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-[oklch(86%_0.04_260)] dark:ring-[oklch(40%_0.04_260)]" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[oklch(22%_0.01_255)] dark:text-[oklch(93%_0.01_255)] truncate">{{item.name}}</p>
        <p className="text-xs text-[oklch(52%_0.04_255)] dark:text-[oklch(62%_0.04_255)] truncate mt-0.5">{{item.role}}</p>
      </div>
      <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 text-[oklch(40%_0.12_260)] bg-[oklch(94%_0.06_260)] dark:text-[oklch(75%_0.14_260)] dark:bg-[oklch(26%_0.06_260)]">{{item.department}}</span>
      <span className={{`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${{STATUS_STYLES[item.status] || ""}}`}}>{{item.status}}</span>
      <div className="hidden lg:flex items-center gap-1.5 shrink-0 w-20">
        <div className="flex-1 h-1.5 rounded-full bg-[oklch(88%_0.03_255)] dark:bg-[oklch(35%_0.03_255)]">
          <div className="h-1.5 rounded-full bg-[oklch(58%_0.18_145)]" style={{{{ width: `${{item.score}}%` }}}} />
        </div>
        <span className="text-[10px] font-semibold tabular-nums text-[oklch(50%_0.04_255)]">{{item.score}}%</span>
      </div>
    </article>
  );
}});

export default function PerformanceCatalog() {{
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeDept, setActiveDept] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [prefetchedIds, setPrefetchedIds] = useState(new Set());
  const parentRef = useRef(null);

  useEffect(() => {{
    const t = setTimeout(() => setIsLoading(false), 620);
    return () => clearTimeout(t);
  }}, []);

  // useMemo: filtered list only recalculates when search/dept changes
  const filteredItems = useMemo(() => {{
    const q = search.trim().toLowerCase();
    return ITEMS.filter(e => {{
      const matchDept = !activeDept || e.department === activeDept;
      const matchSearch = !q || e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q);
      return matchDept && matchSearch;
    }});
  }}, [search, activeDept]);

  // useVirtualizer — only renders visible rows, handles 10k+ items smoothly
  const rowVirtualizer = useVirtualizer({{
    count: isLoading ? 10 : filteredItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  }});

  // useCallback: stable refs prevent child re-renders
  const handleSelect = useCallback(item => setSelectedItem(item), []);
  const handleClose  = useCallback(() => setSelectedItem(null), []);
  const prefetchDetail = useCallback(id => {{
    setPrefetchedIds(prev => {{ if (prev.has(id)) return prev; const n=new Set(prev); n.add(id); return n; }});
  }}, []);
  const handleSearch = useCallback(v => setSearch(v), []);
  const handleDept   = useCallback(d => setActiveDept(d), []);

  if (error) {{
    return (
      <main className="min-h-[100dvh] flex items-center justify-center bg-[oklch(98%_0.005_255)] dark:bg-[oklch(14%_0.01_255)] font-[Manrope,system-ui,sans-serif] px-4">
        <style>{{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');@media(prefers-reduced-motion:reduce){{*,*::before,*::after{{animation-duration:0.01ms!important;transition-duration:0.01ms!important}}}}`}}</style>
        <div role="alert" className="text-center space-y-4 max-w-sm">
          <p className="font-semibold text-[oklch(22%_0.01_255)] dark:text-[oklch(93%_0.01_255)]">Failed to load catalog</p>
          <p className="text-sm text-[oklch(52%_0.04_255)] dark:text-[oklch(62%_0.04_255)]">{{error}}</p>
          <button onClick={{()=>{{ setError(null); setIsLoading(true); setTimeout(()=>setIsLoading(false),620); }}}}
            className="min-h-[44px] px-6 rounded-lg bg-[oklch(52%_0.18_260)] text-[oklch(97%_0.01_255)] text-sm font-semibold hover:bg-[oklch(45%_0.18_260)] transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(52%_0.18_260)] focus-visible:ring-offset-2">
            Retry
          </button>
        </div>
      </main>
    );
  }}

  return (
    <main className="min-h-[100dvh] bg-[oklch(98%_0.005_255)] dark:bg-[oklch(14%_0.01_255)] font-[Manrope,system-ui,sans-serif] text-[oklch(22%_0.01_255)] dark:text-[oklch(93%_0.01_255)]" aria-busy={{isLoading}}>
      <style>{{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        @media (prefers-reduced-motion: reduce) {{
          *, *::before, *::after {{ animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }}
        }}
      `}}</style>

      <a href="#catalog-list" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[oklch(98%_0.005_255)] focus:px-4 focus:py-2 focus:rounded-lg focus:ring-2 focus:ring-[oklch(55%_0.18_260)] focus:text-sm focus:font-semibold">
        Skip to employee list
      </a>

      <header className="sticky top-0 z-30 bg-[oklch(98%_0.005_255)]/90 dark:bg-[oklch(14%_0.01_255)]/90 backdrop-blur-md border-b border-[oklch(90%_0.01_255)] dark:border-[oklch(28%_0.01_255)] px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[oklch(52%_0.18_260)] flex items-center justify-center">
              <svg className="w-4 h-4 text-[oklch(97%_0.01_255)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={{2}} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="font-extrabold text-[oklch(18%_0.01_255)] dark:text-[oklch(95%_0.01_255)] text-sm tracking-tight">PeopleHub</h1>
          </div>
          <nav aria-label="Main navigation">
            <ul className="flex items-center gap-1 text-sm font-medium text-[oklch(50%_0.04_255)] dark:text-[oklch(60%_0.04_255)]">
              <li><a href="#" className="px-3 py-2 rounded-lg hover:bg-[oklch(93%_0.02_255)] dark:hover:bg-[oklch(25%_0.02_255)] transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.18_260)]">Overview</a></li>
              <li><a href="#" className="px-3 py-2 rounded-lg bg-[oklch(93%_0.02_255)] dark:bg-[oklch(25%_0.02_255)] text-[oklch(22%_0.01_255)] dark:text-[oklch(93%_0.01_255)] focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.18_260)]">People</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-12" aria-label="Employee catalog">
        {{/* Stats strip */}}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {{[
            {{ label: "Total",     value: ITEMS.length.toString(),                                                                        accent: "text-[oklch(45%_0.16_260)]" }},
            {{ label: "Active",    value: ITEMS.filter(e=>e.status==="Active").length.toString(),                                         accent: "text-[oklch(42%_0.16_145)]" }},
            {{ label: "Remote",    value: ITEMS.filter(e=>e.status==="Remote").length.toString(),                                         accent: "text-[oklch(42%_0.16_220)]" }},
            {{ label: "Avg Score", value: `${{(ITEMS.reduce((s,e)=>s+e.score,0)/ITEMS.length).toFixed(1)}}%`,                             accent: "text-[oklch(42%_0.16_50)]"  }},
          ].map(({{label,value,accent}}) => (
            <div key={{label}} className="rounded-xl border border-[oklch(88%_0.02_255)] dark:border-[oklch(30%_0.02_255)] bg-[oklch(99%_0.005_255)] dark:bg-[oklch(18%_0.01_255)] px-4 py-3">
              <p className="text-xs font-semibold text-[oklch(55%_0.04_255)] uppercase tracking-wider">{{label}}</p>
              <p className={{`text-2xl font-extrabold tabular-nums mt-0.5 ${{accent}}`}}>{{value}}</p>
            </div>
          ))}}
        </div>

        {{/* Search + filter toolbar */}}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
          <div className="relative flex-1 max-w-xs w-full">
            <label htmlFor="catalog-search" className="sr-only">Search employees</label>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(60%_0.04_255)] pointer-events-none" fill="none" viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" /><path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input id="catalog-search" type="search" placeholder="Search by name or role…" value={{search}} onChange={{e=>handleSearch(e.target.value)}}
              aria-describedby="catalog-search-hint"
              className="w-full pl-9 pr-4 h-11 min-h-[44px] rounded-lg border border-[oklch(85%_0.02_255)] dark:border-[oklch(38%_0.02_255)] bg-[oklch(99%_0.005_255)] dark:bg-[oklch(24%_0.01_255)] text-sm placeholder:text-[oklch(62%_0.04_255)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.18_260)] transition-colors" />
            <span id="catalog-search-hint" className="sr-only">Filters employees by name or job title</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {{["All",...DEPARTMENTS].map(dept => (
              <button key={{dept}} onClick={{()=>handleDept(dept==="All"?null:dept)}}
                className={{`h-11 min-h-[44px] px-3 rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.18_260)] ${{(dept==="All"&&!activeDept)||activeDept===dept ? "bg-[oklch(28%_0.02_255)] dark:bg-[oklch(88%_0.02_255)] border-[oklch(28%_0.02_255)] text-[oklch(97%_0.01_255)] dark:text-[oklch(18%_0.01_255)]" : "border-[oklch(85%_0.02_255)] dark:border-[oklch(38%_0.02_255)] text-[oklch(42%_0.04_255)] dark:text-[oklch(65%_0.04_255)]"}}`}}>
                {{dept}}
              </button>
            ))}}
          </div>
          <span role="status" aria-live="polite" aria-atomic="true" className="text-xs text-[oklch(55%_0.04_255)] dark:text-[oklch(62%_0.04_255)] sm:ml-auto shrink-0">
            {{filteredItems.length}} of {{ITEMS.length}} employees
          </span>
        </div>

        {{/* Virtualized list container */}}
        <div id="catalog-list" className="rounded-2xl border border-[oklch(88%_0.02_255)] dark:border-[oklch(30%_0.02_255)] bg-[oklch(99%_0.005_255)] dark:bg-[oklch(18%_0.01_255)] shadow-sm overflow-hidden">
          {{isLoading && (
            <div role="status" aria-label="Loading catalog" aria-live="polite" className="flex items-center gap-2 px-4 py-2.5 bg-[oklch(95%_0.05_260)] dark:bg-[oklch(24%_0.05_260)] border-b border-[oklch(86%_0.06_260)] dark:border-[oklch(34%_0.06_260)]">
              <div className="w-3 h-3 rounded-full bg-[oklch(52%_0.18_260)] animate-pulse" />
              <p className="text-xs font-semibold text-[oklch(38%_0.12_260)] dark:text-[oklch(72%_0.12_260)]">Loading catalog…</p>
            </div>
          )}}
          <div ref={{parentRef}} className="overflow-y-auto" style={{{{ height:"480px" }}}} tabIndex={{0}} role="list" aria-label="Employee rows" aria-busy={{isLoading}}>
            {{isLoading ? (
              <div style={{{{ height:`${{rowVirtualizer.getTotalSize()}}px`, position:"relative" }}}}>
                {{rowVirtualizer.getVirtualItems().map(vi => (
                  <div key={{vi.key}} style={{{{ position:"absolute", top:0, left:0, width:"100%", transform:`translateY(${{vi.start}}px)` }}}}>
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-[oklch(92%_0.01_255)] dark:border-[oklch(28%_0.01_255)]">
                      <div className="animate-pulse w-9 h-9 rounded-full bg-[oklch(88%_0.02_255)] dark:bg-[oklch(32%_0.02_255)] shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="animate-pulse h-3.5 w-32 rounded bg-[oklch(88%_0.02_255)] dark:bg-[oklch(32%_0.02_255)]" />
                        <div className="animate-pulse h-3 w-48 rounded bg-[oklch(91%_0.02_255)] dark:bg-[oklch(30%_0.02_255)]" />
                      </div>
                    </div>
                  </div>
                ))}}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-[oklch(58%_0.04_255)]">
                <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><circle cx="11" cy="11" r="7" strokeWidth={{1.5}} /><path d="M17 17L21 21" strokeWidth={{1.5}} strokeLinecap="round" /></svg>
                <p className="font-semibold text-sm">No employees match your filters</p>
                <button onClick={{()=>{{ setSearch(""); setActiveDept(null); }}}} className="text-[oklch(52%_0.18_260)] text-xs font-bold hover:underline focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.18_260)] rounded px-2 py-1 min-h-[44px]">Clear filters</button>
              </div>
            ) : (
              <div style={{{{ height:`${{rowVirtualizer.getTotalSize()}}px`, position:"relative" }}}} role="rowgroup">
                {{rowVirtualizer.getVirtualItems().map(vi => {{
                  const item = filteredItems[vi.index];
                  return (
                    <div key={{vi.key}} data-index={{vi.index}} ref={{rowVirtualizer.measureElement}}
                      style={{{{ position:"absolute", top:0, left:0, width:"100%", transform:`translateY(${{vi.start}}px)` }}}} role="row">
                      <ItemRow item={{item}} onSelect={{handleSelect}} prefetchDetail={{prefetchDetail}} />
                    </div>
                  );
                }})}}
              </div>
            )}}
          </div>
          {{!isLoading && (
            <footer className="flex items-center justify-between px-4 py-3 border-t border-[oklch(90%_0.01_255)] dark:border-[oklch(28%_0.01_255)] bg-[oklch(97%_0.005_255)] dark:bg-[oklch(19%_0.01_255)]">
              <p className="text-xs text-[oklch(55%_0.04_255)] dark:text-[oklch(60%_0.04_255)]">Virtualized · {{filteredItems.length}} rows · {{prefetchedIds.size}} prefetched</p>
              <p className="text-xs text-[oklch(55%_0.04_255)] dark:text-[oklch(60%_0.04_255)]">Avg score: <strong>{{(ITEMS.reduce((s,e)=>s+e.score,0)/ITEMS.length).toFixed(1)}}%</strong> · offer acceptance 87.3%</p>
            </footer>
          )}}
        </div>
      </section>

      {{selectedItem && (
        <Suspense fallback={{<div role="status" aria-label="Loading detail panel" className="fixed inset-y-0 right-0 w-72 bg-[oklch(99%_0.005_255)] dark:bg-[oklch(18%_0.01_255)] border-l border-[oklch(90%_0.02_255)] z-40 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[oklch(88%_0.02_255)] border-t-[oklch(52%_0.18_260)] animate-spin" /></div>}}>
          <ItemDetailPanel item={{selectedItem}} onClose={{handleClose}} />
        </Suspense>
      )}}
      {{selectedItem && <div className="fixed inset-0 bg-[oklch(20%_0.01_255)]/30 dark:bg-[oklch(5%_0.01_255)]/50 z-30 backdrop-blur-[2px]" aria-hidden="true" onClick={{handleClose}} />}}
    </main>
  );
}}
'''

TEMPLATES = {
    "dashboard":    TEMPLATE_DASHBOARD,
    "landing":      TEMPLATE_LANDING,
    "form":         TEMPLATE_FORM,
    "mobile":       TEMPLATE_MOBILE,
    "auth":         TEMPLATE_AUTH,
    "email":        TEMPLATE_EMAIL,
    "checkout":     TEMPLATE_CHECKOUT,
    "table":        TEMPLATE_DATA_TABLE,
    "react19":      TEMPLATE_REACT19,
    "ai-chat":      TEMPLATE_AI_CHAT,
    "perf":         TEMPLATE_PERF,
}

def main():
    if len(sys.argv) < 2:
        print("Frontend Design Pro — Scaffold Generator")
        print("\nUsage: python scaffold.py <intent> [output_file]")
        print("\nAvailable intents:")
        for k, v in INTENTS.items():
            print(f"  {k:15s} — {v}")
        sys.exit(0)

    intent = sys.argv[1].lower()
    if intent not in INTENTS:
        print(f"Unknown intent: '{intent}'. Available: {', '.join(INTENTS.keys())}")
        sys.exit(1)

    output = sys.argv[2] if len(sys.argv) > 2 else f"{intent}.jsx"
    name = intent.replace("-", " ").title().replace(" ", "")
    # Normalize aliases for DIAL_DEFAULTS/TEMPLATE lookups
    INTENT_TO_TEMPLATE_KEY = {
        "react 19":      "react19",
        "useoptimistic": "react19",
        "server action": "react19",
        "ai chat":       "ai-chat",
        "chat ui":       "ai-chat",
        "chatbot":       "ai-chat",
        "virtualized":   "perf",
        "virtual list":  "perf",
        "performance":   "perf",
    }
    template_key = INTENT_TO_TEMPLATE_KEY.get(intent, intent)
    dv, mi, vd = DIAL_DEFAULTS.get(template_key, (5, 5, 4))
    description = INTENTS[intent]

    # Pick the right template
    template = TEMPLATES.get(template_key, TEMPLATE_GENERIC)
    code = template.format(
        intent=intent,
        component_name=name,
        dv=dv, mi=mi, vd=vd,
        description=description,
    )

    Path(output).write_text(code)
    print(f"✓ Generated {intent} scaffold → {output}")
    print(f"  Component : {name}")
    print(f"  Template  : {'purpose-built' if template_key in TEMPLATES else 'generic (all 4 states)'}")
    print(f"  Dials     : DV={dv} / MI={mi} / VD={vd}")
    print(f"  Reference : examples/good-{intent}.jsx (if exists)")
    print(f"  Size      : {len(code):,} bytes")

if __name__ == "__main__":
    main()
