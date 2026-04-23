import {
  BadgeCheck,
  CircleDollarSign,
  Code,
  Layers,
  Plug,
  ShieldCheck,
  UserRoundX,
  Workflow,
  Zap,
} from "lucide-react";

import { FadeIn } from "./fade-in";

const benefits = [
  {
    title: "No Signup",
    description: "Start instantly, no accounts or emails required.",
    icon: UserRoundX,
  },
  {
    title: "No Uploads",
    description: "Your files stay on your server. Nothing leaves your network.",
    icon: ShieldCheck,
  },
  {
    title: "Forever Free",
    description: "All tools, no trials, no paywalls. Open source.",
    icon: CircleDollarSign,
  },
  {
    title: "No Limits",
    description: "Use as much as you want, no hidden caps.",
    icon: BadgeCheck,
  },
  {
    title: "Batch Processing",
    description: "Handle unlimited images in one go.",
    icon: Layers,
  },
  {
    title: "Lightning Fast",
    description: "Powered by Sharp. Process images instantly.",
    icon: Zap,
  },
  {
    title: "Open Source",
    description: "AGPL-3.0 licensed. Inspect every line of code.",
    icon: Code,
  },
  {
    title: "REST API",
    description: "Every tool accessible via HTTP. Full OpenAPI docs.",
    icon: Plug,
  },
  {
    title: "Pipeline Automation",
    description: "Chain tools together. Automate your workflows.",
    icon: Workflow,
  },
];

export function WhyChoose() {
  return (
    <section className="bg-background-alt px-6 py-24 md:py-36">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
            Why choose SnapOtter?
          </h2>
        </FadeIn>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, i) => (
            <FadeIn key={benefit.title} delay={i * 0.05}>
              <div className="rounded-2xl border border-border bg-background p-6 transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <benefit.icon size={24} className="shrink-0 text-accent" />
                  <h3 className="text-lg font-bold">{benefit.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">{benefit.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
