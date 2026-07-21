"use client";

import { motion } from 'framer-motion';
import { MessageSquarePlus, PencilLine, Search, Sparkles, Trash2, Pin, PinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatSummary {
  id: string;
  title: string;
  updated_at: string;
  pinned: boolean;
}

interface SidebarProps {
  chats: ChatSummary[];
  activeChatId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onCreateChat: () => void;
  onSelectChat: (chatId: string) => void;
  onRename: (chatId: string) => void;
  onDelete: (chatId: string) => void;
  onTogglePin?: (chatId: string) => void;
  onStartRename: (chatId: string) => void;
  titleEditingId: string | null;
  titleDraft: string;
  onTitleDraftChange: (value: string) => void;
  isCreatingChat: boolean;
}

export function Sidebar({
  chats,
  activeChatId,
  search,
  onSearchChange,
  onCreateChat,
  onSelectChat,
  onRename,
  onDelete,
  onTogglePin,
  onStartRename,
  titleEditingId,
  titleDraft,
  onTitleDraftChange,
  isCreatingChat,
}: SidebarProps) {
  return (
    <aside className="hidden w-[290px] flex-col border-r border-white/10 bg-slate-950/70 p-4 backdrop-blur-xl lg:flex">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-200/70">Nexus-AI</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Workspace</h2>
        </div>
        <Button size="sm" onClick={onCreateChat} disabled={isCreatingChat} className="rounded-2xl">
          <MessageSquarePlus size={16} />
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-300">
        <Search size={15} />
        <input
          aria-label="Search chats"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full bg-transparent text-sm outline-none"
          placeholder="Search chats"
        />
      </div>

      <div className="mt-5 flex-1 space-y-2 overflow-y-auto pr-1">
        {chats.map((chat) => (
          <motion.button
            layout
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`flex w-full items-start justify-between rounded-[1.1rem] border px-3 py-3 text-left transition ${
              activeChatId === chat.id
                ? 'border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.12)]'
                : 'border-white/10 bg-slate-900/70 hover:bg-slate-800/80'
            }`}
          >
            <div className="min-w-0">
              {titleEditingId === chat.id ? (
                <input
                  value={titleDraft}
                  onChange={(event) => onTitleDraftChange(event.target.value)}
                  onBlur={() => onRename(chat.id)}
                  className="w-full bg-transparent text-sm font-medium text-white outline-none"
                  autoFocus
                />
              ) : (
                <p className="truncate text-sm font-medium text-white">{chat.title}</p>
              )}
              <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                <Sparkles size={12} className="text-cyan-300" />
                {new Date(chat.updated_at).toLocaleDateString()}
              </div>
            </div>
            <div className="ml-2 flex gap-2">
              <button
                aria-label="Pin chat"
                onClick={(event) => {
                  event.stopPropagation();
                  onTogglePin?.(chat.id);
                }}
                className="text-slate-400 transition hover:text-white"
              >
                {chat.pinned ? <Pin size={14} /> : <PinOff size={14} />}
              </button>
              <button
                aria-label="Rename chat"
                onClick={(event) => {
                  event.stopPropagation();
                  onStartRename(chat.id);
                }}
                className="text-slate-400 transition hover:text-white"
              >
                <PencilLine size={14} />
              </button>
              <button
                aria-label="Delete chat"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(chat.id);
                }}
                className="text-slate-400 transition hover:text-white"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </motion.button>
        ))}
      </div>
    </aside>
  );
}
