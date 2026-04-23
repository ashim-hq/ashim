import { Github } from "lucide-react";
import { FadeIn } from "./fade-in";
import { TypingCursor } from "./typing-cursor";

export function Hero() {
  return (
    <section className="px-6 pt-32 pb-20 md:pt-44 md:pb-32">
      <div className="mx-auto max-w-4xl text-center">
        <FadeIn>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Your images. Stay yours.
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="mt-6 text-xl md:text-2xl">
            <TypingCursor />
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="https://demo.snapotter.com"
              className="rounded-xl bg-accent px-8 py-3.5 text-base font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition-colors hover:bg-accent-hover"
            >
              Try the Demo &rarr;
            </a>
            <a
              href="https://github.com/ashim-hq/ashim"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-base font-semibold transition-colors hover:bg-background-alt"
            >
              <Github size={18} />
              View on GitHub
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="mt-8 text-sm text-muted">
            AGPL-3.0 &middot; Docker one-liner &middot; Free forever
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
