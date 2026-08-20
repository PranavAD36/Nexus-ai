"use client";

import { motion } from 'framer-motion';
import { MessageSquarePlus, PencilLine, Search, Sparkles, Trash2, Pin, PinOff, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
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

export function WorkspaceSidebar({ onCreateChat, isCreatingChat, isCollapsed, onToggleCollapse }: WorkspaceSidebarProps) {
  return (
    <aside className="hidden min-h-0 w-16 flex-none flex-col items-center border-r border-white/10 bg-black px-2 py-3 lg:flex">
      <div className="flex h-full w-full flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-100">
          <Sparkles size={22} />
        </div>

        <div className="mt-5 flex w-full flex-col items-center gap-2">
          <button
            type="button"
            onClick={onCreateChat}
            disabled={isCreatingChat}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="New chat"
          >
            <MessageSquarePlus size={19} />
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            aria-label={isCollapsed ? 'Expand workspace sidebar' : 'Collapse workspace sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
          </button>
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
    <aside className="hidden min-h-0 w-64 flex-none flex-col border-r border-white/10 bg-black p-3 md:flex lg:w-72">
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
      <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
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
