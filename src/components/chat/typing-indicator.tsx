"use client";

import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="mx-auto flex w-full max-w-3xl items-center gap-3 rounded-[1.2rem] border border-white/10 bg-zinc-900/80 px-4 py-3 shadow-[0_6px_30px_rgba(2,6,23,0.6)]"
    >
      <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-zinc-200/20 via-zinc-900 to-zinc-500/20">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 rounded-full border border-zinc-300/30" />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.2, repeat: Infinity }} className="h-3 w-3 rounded-full bg-zinc-200" />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.9, delay: i * 0.12, repeat: Infinity }}
              className="h-2.5 w-2.5 rounded-full bg-zinc-300"
            />
          ))}
        </div>
        <p className="text-sm text-zinc-400">Thinking…</p>
      </div>
    </motion.div>
  );
}
