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
      className="rounded-[1.4rem] border border-white/10 bg-slate-950/70 p-3 shadow-[0_0_40px_rgba(15,23,42,0.35)]"
    >
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask Nexus-AI anything..."
        className="min-h-[96px] w-full resize-none bg-transparent px-2 py-2 text-sm leading-7 text-slate-100 outline-none placeholder:text-slate-500"
        disabled={disabled}
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:text-white" aria-label="Attach file">
            <Paperclip size={15} />
          </button>
          <button className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:text-white" aria-label="Voice input">
            <Mic size={15} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-100 sm:flex">
            <Sparkles size={12} />
            Stream ready
          </div>
          <Button size="sm" onClick={onSend} disabled={isGenerating || disabled || !draft.trim()} className="rounded-2xl">
            <ArrowUp size={16} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
