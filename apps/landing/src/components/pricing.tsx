import { Check } from "lucide-react";

import { FadeIn } from "./fade-in";

const plans = [
  {
    name: "Free",
    price: "Free",
    subtitle: "For everyone",
    features: [
      "All 40+ tools included",
      "Unlimited usage",
      "Self-host anywhere",
      "Community support",
      "Open source (AGPL-3.0)",
    ],
    cta: "Get Started",
    href: "#how-it-works",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    subtitle: "For organizations",
    features: [
      "Everything in Free",
      "Commercial license (no AGPL)",
      "Priority support",
      "Deployment assistance",
      "Custom integrations",
    ],
    cta: "Contact Us",
    href: "/contact",
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-background-alt px-6 py-24 md:py-36">
      <div className="mx-auto max-w-4xl">
        <FadeIn>
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
            Simple pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-lg text-muted">
            Free for everyone. Enterprise support when you need it.
          </p>
        </FadeIn>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.1}>
              <div className="flex h-full flex-col rounded-2xl border border-border bg-background p-8">
                <p className="text-sm font-medium text-muted">{plan.subtitle}</p>
                <p className="mt-2 text-3xl font-bold">{plan.price}</p>

                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check size={16} className="shrink-0 text-accent" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.href}
                  className={`mt-8 block rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-colors ${
                    plan.highlighted
                      ? "bg-accent text-accent-foreground hover:bg-accent-hover"
                      : "border border-border hover:bg-background-alt"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
