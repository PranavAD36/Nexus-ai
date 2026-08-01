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
  isMobileVisible?: boolean;
  onClose?: () => void;
  isLoading?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
  isMobileVisible = false,
  onClose,
  isLoading = false,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 88 : isMobileVisible ? 320 : 300 }}
      transition={{ duration: 0.2 }}
      className={isMobileVisible ? 'fixed inset-y-0 left-0 z-50 flex w-full max-w-[320px] flex-col border-r border-white/10 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-xl lg:relative lg:block' : 'hidden lg:flex'}
    >
      <div className="flex items-center justify-between gap-3">
        {!isCollapsed ? (
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400">Nexus-AI</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Workspace</h2>
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-100">
            <Sparkles size={18} />
          </div>
        )}
        <div className="flex items-center gap-2">
          {isMobileVisible && onClose ? (
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-2xl">
              Close
            </Button>
          ) : null}
          {!isCollapsed ? (
            <Button size="sm" onClick={onCreateChat} disabled={isCreatingChat} className="rounded-2xl bg-white/10 px-3 text-white hover:bg-white/15">
              <MessageSquarePlus size={16} />
            </Button>
          ) : null}
          {onToggleCollapse ? (
            <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="hidden rounded-2xl lg:flex" aria-label="Collapse sidebar">
              {isCollapsed ? <MessageSquarePlus size={16} /> : <Sparkles size={16} />}
            </Button>
          ) : null}
        </div>
      </div>

      {!isCollapsed ? (
        <>
          <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[0_0_30px_rgba(15,23,42,0.18)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-200/20 to-zinc-500/10 text-zinc-100">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Nexus AI</p>
                <p className="text-[11px] text-zinc-400">A refined workspace for focused conversations.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
                <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">Chats</p>
                <p className="mt-1 text-sm text-white">{chats.length} total</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
                <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">Pinned</p>
                <p className="mt-1 text-sm text-white">{chats.filter((chat) => chat.pinned).length} saved</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-300">
            <Search size={15} />
            <input
              aria-label="Search chats"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
              placeholder="Search chats"
            />
          </div>
        </>
      ) : null}

      <div className="mt-5 flex-1 space-y-2 overflow-y-auto pr-1">
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
              {!isCollapsed ? (
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
              ) : null}
            </motion.button>
          ))
        )}
      </div>
    </motion.aside>
  );
}
