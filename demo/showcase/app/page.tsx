import { Hero3D } from "@/components/Hero3D";
import { BentoGrid, type BentoFeature } from "@/components/BentoGrid";
import { Pricing, type PricingTier } from "@/components/Pricing";
import { Testimonials, type Testimonial } from "@/components/Testimonials";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";

const features: BentoFeature[] = [
  {
    id: "ingest",
    title: "Ingests 214M events a day",
    description:
      "One SDK call streams every click, request, and background job into the same pipeline — no separate warehouse export.",
    stat: "214M",
    statLabel: "events / day, current customer median",
    span: "large",
  },
  {
    id: "anomaly",
    title: "Anomaly detection that explains itself",
    description: "Every flagged spike ships with the three upstream signals that caused it.",
    span: "wide",
  },
  {
    id: "latency",
    title: "37ms p50 query latency",
    description: "Even against a 90-day rolling window across every tenant.",
    stat: "37ms",
    statLabel: "p50 across all tenants",
    span: "small",
  },
  {
    id: "retention",
    title: "Cohort retention, live",
    description: "Watch a cohort curve update as events land — not tomorrow's batch job.",
    span: "tall",
  },
  {
    id: "alerts",
    title: "6,842 alerts routed last quarter",
    description: "Slack, PagerDuty, or a webhook — Nexus decides who needs to know, not everyone.",
    stat: "6,842",
    statLabel: "alerts routed, Q2",
    span: "small",
  },
];

const tiers: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 49,
    annualPrice: 41,
    description: "For teams validating product-market fit.",
    features: ["3 pipelines", "14-day retention", "Community support", "Up to 2M events / mo"],
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPrice: 219,
    annualPrice: 182,
    description: "For teams that ship weekly and need the signal fast.",
    features: [
      "Unlimited pipelines",
      "90-day retention",
      "Anomaly detection",
      "Priority support",
      "Up to 40M events / mo",
    ],
    highlighted: true,
  },
  {
    id: "scale",
    name: "Scale",
    monthlyPrice: 674,
    annualPrice: 559,
    description: "For platforms running the anomaly engine on everything.",
    features: [
      "Dedicated ingest lane",
      "1-year retention",
      "Custom alert routing",
      "SSO + audit log",
      "Uncapped events",
    ],
  },
];

const testimonials: Testimonial[] = [
  {
    id: "priya",
    quote:
      "We caught a checkout regression 11 minutes after deploy instead of finding it in Monday's report.",
    name: "Priya Raman",
    role: "Head of Platform, Ferro",
    metric: "11 min to detection, down from 3 days",
  },
  {
    id: "declan",
    quote: "Nexus is the first analytics tool our on-call engineers actually open unprompted.",
    name: "Declan Osei",
    role: "Staff SRE, Loom Freight",
    metric: "68% fewer false-positive pages",
  },
  {
    id: "mireille",
    quote: "The bento view of our funnel replaced four separate dashboards we'd stitched together.",
    name: "Mireille Kanto",
    role: "VP Growth, Auberon",
    metric: "4 dashboards consolidated into 1",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-[100dvh]">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <Hero3D />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col items-start px-6 py-28 sm:py-40">
          <span className="rounded-full border border-border bg-bg-surface px-3 py-1 font-mono text-xs uppercase tracking-wide text-accent">
            now parsing 214M events / day
          </span>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-text-primary sm:text-6xl">
            Analytics that finds the signal before your dashboard loads
          </h1>
          <p className="mt-6 max-w-xl text-lg text-text-muted">
            Nexus ingests every event your product emits and surfaces the anomalies that actually
            matter — ranked, explained, and routed to the right engineer.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="#contact"
              className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-bg-base hover:bg-accent-dim"
            >
              Talk to the team
            </a>
            <a
              href="#pricing"
              className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-text-primary hover:border-accent"
            >
              See pricing
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <h2 className="max-w-lg text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          One pipeline. Every signal.
        </h2>
        <div className="mt-12">
          <BentoGrid features={features} />
        </div>
      </section>

      <section id="pricing" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Pricing that scales with your event volume
          </h2>
          <div className="mt-12">
            <Pricing tiers={tiers} />
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <Testimonials testimonials={testimonials} />
        </div>
      </section>

      <section id="contact" className="border-t border-border">
        <div className="mx-auto max-w-2xl px-6 py-24 sm:py-32">
          <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Get a walkthrough of your own data
          </h2>
          <p className="mt-3 text-text-muted">
            Tell us what you're tracking today and we'll show you what Nexus surfaces from it.
          </p>
          <div className="mt-10">
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
