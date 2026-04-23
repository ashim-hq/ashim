"use client";

import { Github, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { label: "Features", href: "#features" },
  { label: "Enterprise", href: "#enterprise" },
  { label: "Docs", href: "https://docs.snapotter.com" },
  { label: "GitHub", href: "https://github.com/ashim-hq/ashim", icon: Github },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground text-sm font-bold">
            S
          </div>
          <span className="text-lg font-bold tracking-tight">SnapOtter</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
                {...(item.href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {Icon && <Icon size={16} />}
                {item.label}
              </a>
            );
          })}
        </div>

        <div className="hidden md:block">
          <a
            href="https://demo.snapotter.com"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            Try Demo
          </a>
        </div>

        <button
          className="md:hidden text-muted"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          type="button"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-6 py-4 md:hidden">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block py-2 text-sm text-muted"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://demo.snapotter.com"
            className="mt-2 block rounded-lg bg-accent px-4 py-2 text-center text-sm font-medium text-accent-foreground"
          >
            Try Demo
          </a>
        </div>
      )}
    </nav>
  );
}
