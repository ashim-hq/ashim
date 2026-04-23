"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { FadeIn } from "./fade-in";

const command =
  "docker run -d --name ashim -p 1349:1349 -v ashim-data:/data ghcr.io/ashim-hq/ashim:latest";

export function HowItWorks() {
  const [copied, setCopied] = useState(false);

  function copyCommand() {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section id="how-it-works" className="bg-background-alt px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <FadeIn>
          <p className="text-sm font-medium text-accent">Get started in seconds</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            One command. That's it.
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <button
            type="button"
            onClick={copyCommand}
            className="group relative mt-8 w-full cursor-pointer overflow-hidden rounded-xl border border-border bg-[#1e1e1e] text-left shadow-lg transition-all hover:border-accent/40"
          >
            <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap px-5 py-4 font-mono text-xs md:text-sm">
              <span className="text-green-400 shrink-0">$</span>
              <span className="text-white">{command}</span>
              <span className="ml-auto shrink-0 pl-4">
                {copied ? (
                  <span className="flex items-center gap-1.5 text-green-400">
                    <Check size={14} />
                    <span className="text-xs">Copied!</span>
                  </span>
                ) : (
                  <Copy
                    size={14}
                    className="text-white/30 transition-colors group-hover:text-white/70"
                  />
                )}
              </span>
            </div>
          </button>
        </FadeIn>

        <FadeIn delay={0.15}>
          <p className="mt-6 text-sm text-muted">
            Linux, macOS, Windows. ARM and x86.{" "}
            <a
              href="https://docs.snapotter.com"
              className="font-medium text-accent hover:underline"
            >
              Full docs
            </a>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
