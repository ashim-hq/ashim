"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { FadeIn } from "./fade-in";

const command = "docker run -d -p 1349:1349 ghcr.io/ashim-hq/ashim";

export function HowItWorks() {
  const [copied, setCopied] = useState(false);

  function copyCommand() {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section id="how-it-works" className="bg-background-alt px-6 py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <FadeIn>
          <p className="text-sm font-medium text-accent">Get started in seconds</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            One command. That's it.
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-8 overflow-hidden rounded-xl border border-border bg-[#1e1e1e] shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              <button
                type="button"
                onClick={copyCommand}
                className="text-white/40 transition-colors hover:text-white/80"
                aria-label="Copy command"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div className="overflow-x-auto whitespace-nowrap px-5 py-4 text-left font-mono text-sm">
              <p className="text-white">
                <span className="text-green-400">$</span>{" "}
                <span className="select-all">{command}</span>
              </p>
            </div>
          </div>
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
