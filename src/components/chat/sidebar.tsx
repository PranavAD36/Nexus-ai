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

interface WorkspaceSidebarProps {
  chats: ChatSummary[];
  onCreateChat: () => void;
  isCreatingChat: boolean;
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
}

interface ConversationSidebarProps {
  chats: ChatSummary[];
  activeChatId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelectChat: (chatId: string) => void;
  onRename: (chatId: string) => void;
  onDelete: (chatId: string) => void;
  onTogglePin?: (chatId: string) => void;
  onStartRename: (chatId: string) => void;
  titleEditingId: string | null;
  titleDraft: string;
  onTitleDraftChange: (value: string) => void;
  onCreateChat: () => void;
  isLoading?: boolean;
}

export function WorkspaceSidebar({ chats, onCreateChat, isCreatingChat, isCollapsed, onToggleCollapse }: WorkspaceSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-none w-24 flex-col border-r border-white/10 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur-xl">
      <div className="flex h-full flex-col justify-between gap-4">
        <div>
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-100 shadow-lg">
            <Sparkles size={22} />
          </div>
          <div className="space-y-1 text-left">
            <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400">Nexus-AI</p>
            <p className="text-sm font-semibold text-white">Workspace</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onCreateChat}
            disabled={isCreatingChat}
            className="flex w-full items-center justify-center rounded-2xl border border-violet-400/25 bg-violet-500/15 px-2 py-3 text-sm text-violet-50 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            New Chat
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-2 py-3 text-sm text-white transition hover:bg-white/10"
          >
            {isCollapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>

        <div className="space-y-3 rounded-[1.35rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[0_0_30px_rgba(15,23,42,0.18)]">
          <div className="text-sm font-semibold text-white">Overview</div>
          <div className="grid gap-2 text-sm text-zinc-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="uppercase tracking-[0.25em] text-[10px] text-zinc-500">Chats</p>
              <p className="mt-1 font-medium text-white">{chats.length} total</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="uppercase tracking-[0.25em] text-[10px] text-zinc-500">Pinned</p>
              <p className="mt-1 font-medium text-white">{chats.filter((chat) => chat.pinned).length} saved</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function ConversationSidebar({
  chats,
  activeChatId,
  search,
  onSearchChange,
  onSelectChat,
  onRename,
  onDelete,
  onTogglePin,
  onStartRename,
  titleEditingId,
  titleDraft,
  onTitleDraftChange,
  onCreateChat,
  isLoading = false,
}: ConversationSidebarProps) {
  return (
    <aside className="flex flex-none w-80 flex-col border-r border-white/10 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400">Conversation</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Chats</h2>
        </div>
        <Button size="sm" onClick={onCreateChat} className="rounded-2xl border border-violet-400/25 bg-violet-500/15 px-3 text-sm text-violet-50 hover:bg-violet-500/20">
          <MessageSquarePlus size={16} />
        </Button>
      </div>
      <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-300">
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <Search size={14} />
          <input
            aria-label="Search chats"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            placeholder="Search chats"
          />
        </div>
      </div>
      <div className="mt-5 flex-1 space-y-3 overflow-y-auto pr-1">
        {isLoading ? (
          [1, 2, 3].map((index) => (
            <div key={index} className="h-20 rounded-[1.1rem] border border-white/10 bg-zinc-900/70 p-4 animate-pulse" />
          ))
        ) : (
          chats.map((chat) => (
            <motion.button
              layout
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`flex w-full items-start justify-between rounded-[1.1rem] border px-3 py-3 text-left transition ${
                activeChatId === chat.id
                  ? 'border-zinc-400/30 bg-zinc-800/80 shadow-[0_0_20px_rgba(113,113,122,0.14)]'
                  : 'border-white/10 bg-zinc-900/70 hover:bg-zinc-800/90'
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
                <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-400">
                  <Sparkles size={12} className="text-zinc-300" />
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
                  className="text-zinc-400 transition hover:text-white"
                >
                  {chat.pinned ? <Pin size={14} /> : <PinOff size={14} />}
                </button>
                <button
                  aria-label="Rename chat"
                  onClick={(event) => {
                    event.stopPropagation();
                    onStartRename(chat.id);
                  }}
                  className="text-zinc-400 transition hover:text-white"
                >
                  <PencilLine size={14} />
                </button>
                <button
                  aria-label="Delete chat"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(chat.id);
                  }}
                  className="text-zinc-400 transition hover:text-white"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.button>
          ))
        )}
      </div>
    </aside>
  );
}

