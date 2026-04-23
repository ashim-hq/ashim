import { BadgeCheck, CircleDollarSign, Layers, ShieldCheck, UserRoundX, Zap } from "lucide-react";
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
];

export function WhyChoose() {
  return (
    <section className="bg-dark-bg px-6 py-24 text-dark-fg md:py-36">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
            Why choose SnapOtter?
          </h2>
        </FadeIn>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, i) => (
            <FadeIn key={benefit.title} delay={i * 0.05}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3">
                  <benefit.icon size={24} className="text-accent shrink-0" />
                  <h3 className="text-lg font-bold">{benefit.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-dark-muted">
                  {benefit.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
