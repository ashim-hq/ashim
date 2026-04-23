"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

const phrases = [
  "100% local processing.",
  "Zero data leaves your network.",
  "50+ image tools.",
  "14 AI models. Your hardware.",
  "Air-gapped ready.",
  "Enterprise-grade. Free forever.",
  "One Docker container.",
  "Open source. Always.",
];

export function TypingCursor() {
  const [index, setIndex] = useState(0);

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % phrases.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(advance, 3000);
    return () => clearInterval(timer);
  }, [advance]);

  return (
    <span className="inline-flex items-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={phrases[index]}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-accent"
        >
          {phrases[index]}
        </motion.span>
      </AnimatePresence>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        className="ml-0.5 inline-block w-[3px] h-[1em] bg-accent align-middle"
      />
    </span>
  );
}
