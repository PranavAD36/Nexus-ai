"use client";

import { motion } from 'framer-motion';
import { Copy, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  onCopy?: () => void;
  onRegenerate?: () => void;
}

export function MessageBubble({ role, content, onCopy, onRegenerate }: MessageBubbleProps) {
  const isAssistant = role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[92%] rounded-[1.35rem] border px-4 py-3 shadow-[0_0_30px_rgba(15,23,42,0.16)] sm:max-w-[78%] ${
          role === 'user'
            ? 'border-zinc-400/20 bg-gradient-to-br from-zinc-200/15 to-zinc-500/10 text-zinc-50'
            : 'border-white/10 bg-zinc-900/80 text-zinc-100'
        }`}
      >
        {isAssistant && content ? (
          <div className="mb-2 flex items-center justify-end gap-2">
            <button aria-label="Copy response" onClick={onCopy} className="text-slate-400 transition hover:text-white">
              <Copy size={14} />
            </button>
            <button aria-label="Regenerate response" onClick={onRegenerate} className="text-slate-400 transition hover:text-white">
              <RefreshCw size={14} />
            </button>
          </div>
        ) : null}

        <div className="text-[15px] leading-7 text-zinc-100">
          {isAssistant && content ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }: { className?: string; children?: React.ReactNode }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const childText = String(children ?? '').replace(/\n$/, '');
                  return match ? (
                    <SyntaxHighlighter style={oneDark as never} language={match[1]} PreTag="div" {...props}>
                      {childText}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>{children}</code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          ) : (
            <div className="whitespace-pre-wrap">{content}</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
