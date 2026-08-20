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
      className="mx-auto w-full max-w-3xl rounded-[1.65rem] border border-white/5 bg-[#212121] p-2.5 shadow-lg sm:p-3"
    >
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask Nexus-AI anything..."
        className="min-h-[58px] w-full resize-none rounded-xl bg-transparent px-3 py-2 text-[15px] leading-6 text-zinc-100 outline-none placeholder:text-zinc-500"
        disabled={disabled}
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <button className="rounded-full border border-white/8 bg-white/3 p-2 text-zinc-300 transition hover:bg-white/6 hover:text-white" aria-label="Attach file">
            <Paperclip size={15} />
          </button>
          <button className="rounded-full border border-white/8 bg-white/3 p-2 text-zinc-300 transition hover:bg-white/6 hover:text-white" aria-label="Voice input">
            <Mic size={15} />
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-zinc-400/12 bg-zinc-800/60 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-zinc-300 sm:flex">
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
