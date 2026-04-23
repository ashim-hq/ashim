"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

function FaqEntry({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-base font-medium">{item.question}</span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <p className="pb-5 leading-relaxed text-muted">{item.answer}</p>}
    </div>
  );
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y-0">
      {items.map((item) => (
        <FaqEntry key={item.question} item={item} />
      ))}
    </div>
  );
}
