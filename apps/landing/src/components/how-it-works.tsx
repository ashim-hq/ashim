import { FadeIn } from "./fade-in";

const steps = [
  {
    number: "1",
    title: "Pull",
    code: "docker pull snapotter/snapotter",
    description: "One image. Everything included.",
  },
  {
    number: "2",
    title: "Deploy",
    code: "docker run -p 8080:8080 snapotter/snapotter",
    description: "One command. Any server.",
  },
  {
    number: "3",
    title: "Use",
    code: null,
    description: "Browser UI, REST API, or pipeline automation.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-background-alt px-6 py-24 md:py-36">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
            Up and running in 60 seconds.
          </h2>
        </FadeIn>

        <div className="mt-16 grid gap-8 md:grid-cols-3 md:gap-12">
          {steps.map((step, i) => (
            <FadeIn key={step.number} delay={i * 0.1}>
              <div className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-bold">
                  {step.number}
                </div>
                <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
                {step.code && (
                  <div className="mt-3 rounded-lg bg-dark-bg px-4 py-2.5 font-mono text-sm text-dark-fg">
                    {step.code}
                  </div>
                )}
                <p className="mt-3 text-muted">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
