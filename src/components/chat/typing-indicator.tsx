"use client";

import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-slate-900/80 px-4 py-3 shadow-[0_0_30px_rgba(34,211,238,0.08)]"
    >
      <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/20 via-slate-900 to-violet-500/20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-cyan-400/30"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="h-3 w-3 rounded-full bg-cyan-300"
        />
      </div>
      <div className="flex items-center gap-1.5">
        {['bg-cyan-300', 'bg-violet-400', 'bg-fuchsia-400'].map((color, index) => (
          <motion.span
            key={color}
            animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.1, delay: index * 0.14, repeat: Infinity }}
            className={`h-2.5 w-2.5 rounded-full ${color}`}
          />
        ))}
      </div>
    </motion.div>
  );
}
