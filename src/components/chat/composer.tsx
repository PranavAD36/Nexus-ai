"use client";

import { motion } from 'framer-motion';
import { ArrowUp, Paperclip, Mic, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComposerProps {
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isGenerating: boolean;
  disabled?: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}

export function Composer({ draft, onDraftChange, onSend, onKeyDown, isGenerating, disabled, textareaRef }: ComposerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto w-full max-w-3xl rounded-[1rem] border border-white/8 bg-zinc-900/85 p-3 shadow-[0_6px_30px_rgba(2,6,23,0.5)]"
    >
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask Nexus-AI anything..."
        className="min-h-[72px] w-full resize-none rounded-xl bg-transparent px-3 py-2 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-500"
        disabled={disabled}
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button className="rounded-full border border-white/8 bg-white/3 p-2 text-zinc-300 transition hover:bg-white/6 hover:text-white" aria-label="Attach file">
            <Paperclip size={15} />
          </button>
          <button className="rounded-full border border-white/8 bg-white/3 p-2 text-zinc-300 transition hover:bg-white/6 hover:text-white" aria-label="Voice input">
            <Mic size={15} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-zinc-400/12 bg-zinc-800/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-300 sm:flex">
            <Sparkles size={12} />
            Stream ready
          </div>
          <Button size="sm" onClick={onSend} disabled={isGenerating || disabled || !draft.trim()} className="rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 px-3 py-2 text-white hover:opacity-95 shadow-md">
            <ArrowUp size={16} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
