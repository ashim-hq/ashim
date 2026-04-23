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
    gradient: "from-rose-500/10 to-pink-500/5",
  },
  {
    title: "No Uploads",
    description: "Your files stay on your server. Nothing leaves your network.",
    icon: ShieldCheck,
    gradient: "from-blue-500/10 to-indigo-500/5",
  },
  {
    title: "Forever Free",
    description: "All tools, no trials, no paywalls. Open source.",
    icon: CircleDollarSign,
    gradient: "from-emerald-500/10 to-teal-500/5",
  },
  {
    title: "No Limits",
    description: "Use as much as you want, no hidden caps.",
    icon: BadgeCheck,
    gradient: "from-violet-500/10 to-purple-500/5",
  },
  {
    title: "Batch Processing",
    description: "Handle unlimited images in one go.",
    icon: Layers,
    gradient: "from-amber-500/10 to-orange-500/5",
  },
  {
    title: "Lightning Fast",
    description: "Powered by Sharp. Process images instantly.",
    icon: Zap,
    gradient: "from-yellow-500/10 to-amber-500/5",
  },
  {
    title: "Open Source",
    description: "AGPL-3.0 licensed. Inspect every line of code.",
    icon: Code,
    gradient: "from-cyan-500/10 to-sky-500/5",
  },
  {
    title: "REST API",
    description: "Every tool accessible via HTTP. Full OpenAPI docs.",
    icon: Plug,
    gradient: "from-fuchsia-500/10 to-pink-500/5",
  },
  {
    title: "Pipeline Automation",
    description: "Chain tools together. Automate your workflows.",
    icon: Workflow,
    gradient: "from-orange-500/10 to-red-500/5",
  },
];

export function WhyChoose() {
  return (
    <section className="bg-background-alt px-6 py-24 md:py-36">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="text-center text-sm font-medium text-accent">Why SnapOtter</p>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight md:text-4xl">
            Built different. On purpose.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-lg text-muted">
            No compromises on privacy, speed, or freedom.
          </p>
        </FadeIn>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, i) => (
            <FadeIn key={benefit.title} delay={i * 0.04}>
              <div
                className={`group h-full rounded-2xl bg-gradient-to-br ${benefit.gradient} border border-border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background shadow-sm">
                  <benefit.icon size={22} className="text-accent" />
                </div>
                <h3 className="mt-4 text-base font-bold">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{benefit.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
