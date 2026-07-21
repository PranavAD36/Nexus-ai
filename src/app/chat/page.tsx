"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUp, Menu, Sparkles, LogOut, Settings2, PanelLeftClose, PanelLeftOpen, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createChatRecord, deleteChat, getChatMessages, getChats, saveMessage, toggleChatPin, updateChatTitle } from '@/lib/supabase/chat';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/chat/sidebar';
import { Composer } from '@/components/chat/composer';
import { MessageBubble } from '@/components/chat/message-bubble';
import { TypingIndicator } from '@/components/chat/typing-indicator';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatSummary {
  id: string;
  title: string;
  updated_at: string;
  pinned: boolean;
}

export default function ChatPage() {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleEditing, setTitleEditing] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoTitleApplied, setAutoTitleApplied] = useState<Record<string, boolean>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const verifySession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
      }
    };

    void verifySession();
  }, [router, supabase]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const chatList = await getChats();
        if (!isMounted) return;
        setChats(chatList as ChatSummary[]);
        if (chatList.length > 0 && !activeChatId) {
          setActiveChatId(chatList[0].id);
        }
      } catch {
        if (isMounted) {
          setError('Unable to load chats.');
        }
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    const loadMessages = async () => {
      try {
        const chatMessages = await getChatMessages(activeChatId);
        if (!isMounted) return;
        setMessages(chatMessages as ChatMessage[]);
      } catch {
        if (isMounted) {
          setError('Unable to load messages.');
        }
      }
    };
    void loadMessages();
    return () => {
      isMounted = false;
    };
  }, [activeChatId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }, [messages, isGenerating, prefersReducedMotion]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [draft]);

  const filteredChats = useMemo(() => {
    const query = search.toLowerCase();
    return chats.filter((chat) => chat.title.toLowerCase().includes(query));
  }, [chats, search]);

  const currentChatTitle = useMemo(() => {
    const currentChat = chats.find((chat) => chat.id === activeChatId);
    return currentChat?.title ?? 'New conversation';
  }, [activeChatId, chats]);

  const handleCreateChat = async () => {
    if (isCreatingChat) return;
    setIsCreatingChat(true);
    setError(null);
    setShowSidebarOnMobile(false);

    try {
      const newChat = await createChatRecord('New Chat');
      if (!newChat) {
        setError('Unable to create a new chat.');
        return;
      }

      setChats((prev) => [newChat as ChatSummary, ...prev]);
      setActiveChatId(newChat.id);
      setMessages([]);
      setDraft('');
    } catch {
      setError('Unable to create a new chat.');
    } finally {
      setIsCreatingChat(false);
    }
  };

  const sendMessage = async (content: string, replaceLastAssistant = false) => {
    const trimmed = content.trim();
    if (!trimmed || !activeChatId || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    const userMessage = { id: crypto.randomUUID(), role: 'user' as const, content: trimmed, created_at: new Date().toISOString() };
    const assistantPlaceholder = { id: crypto.randomUUID(), role: 'assistant' as const, content: '', created_at: new Date().toISOString() };
    const history = [...messages, userMessage];

    setMessages((prev) => {
      if (replaceLastAssistant && prev.length > 0) {
        const withoutLast = prev.slice(0, -1);
        return [...withoutLast, userMessage, assistantPlaceholder];
      }
      return [...prev, userMessage, assistantPlaceholder];
    });
    setDraft('');

    try {
      await saveMessage(activeChatId, 'user', trimmed);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.map((message) => ({ role: message.role, content: message.content })) }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unable to get a response.' }));
        throw new Error(errorData.error || 'Unable to get a response.');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Unable to read response stream.');
      }

      const decoder = new TextDecoder();
      let streamed = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        streamed += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          const target = next[next.length - 1];
          if (target?.role === 'assistant') {
            target.content = streamed;
          }
          return next;
        });
      }

      streamed += decoder.decode();
      await saveMessage(activeChatId, 'assistant', streamed);

      const currentChat = chats.find((chat) => chat.id === activeChatId);
      if (!autoTitleApplied[activeChatId || ''] && currentChat && ['New Chat', 'Untitled chat', ''].includes(currentChat.title.trim())) {
        const updatedTitle = trimmed.length > 34 ? `${trimmed.slice(0, 34)}...` : trimmed;
        await updateChatTitle(activeChatId, updatedTitle);
        setAutoTitleApplied((prev) => ({ ...prev, [activeChatId]: true }));
      }

      const refresh = await getChats();
      setChats(refresh as ChatSummary[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    await sendMessage(draft);
  };

  const handleRegenerate = async () => {
    const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user');
    if (!lastUserMessage) return;
    await sendMessage(lastUserMessage.content, true);
  };

  const handleRename = async (chatId: string) => {
    const finalTitle = titleDraft.trim() || 'Untitled chat';
    try {
      await updateChatTitle(chatId, finalTitle);
      setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, title: finalTitle } : chat)));
      setTitleEditing(null);
    } catch {
      setError('Unable to rename chat.');
    }
  };

  const handleDelete = async (chatId: string) => {
    try {
      await deleteChat(chatId);
      const remaining = chats.filter((chat) => chat.id !== chatId);
      setChats(remaining);
      if (activeChatId === chatId) {
        setActiveChatId(remaining[0]?.id ?? null);
        setMessages([]);
      }
    } catch {
      setError('Unable to delete chat.');
    }
  };

  const handlePin = async (chatId: string) => {
    const target = chats.find((chat) => chat.id === chatId);
    if (!target) return;
    const pinned = !target.pinned;
    const success = await toggleChatPin(chatId, pinned);
    if (!success) return;
    setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, pinned } : chat)));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex h-screen max-w-7xl flex-col px-3 py-3 sm:px-4 lg:px-6">
        <div className="flex flex-1 overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/80 shadow-[0_0_80px_rgba(6,10,20,0.35)] backdrop-blur-xl">
          <Sidebar
            chats={filteredChats}
            activeChatId={activeChatId}
            search={search}
            onSearchChange={setSearch}
            onCreateChat={handleCreateChat}
            onSelectChat={setActiveChatId}
            onRename={handleRename}
            onDelete={handleDelete}
            onTogglePin={handlePin}
            onStartRename={(chatId) => {
              setTitleEditing(chatId);
              setTitleDraft(chats.find((chat) => chat.id === chatId)?.title ?? '');
            }}
            titleEditingId={titleEditing}
            titleDraft={titleDraft}
            onTitleDraftChange={setTitleDraft}
            isCreatingChat={isCreatingChat}
          />

          <div className="flex flex-1 flex-col">
            <header className="flex items-center justify-between border-b border-white/10 px-3 py-3 sm:px-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="rounded-2xl lg:hidden" onClick={() => setShowSidebarOnMobile((prev) => !prev)}>
                  {showSidebarOnMobile ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
                </Button>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-200/70">Conversation</p>
                  <h3 className="mt-1 text-sm font-semibold text-white sm:text-base">{currentChatTitle}</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleCreateChat} disabled={isCreatingChat} className="rounded-2xl">
                  {isCreatingChat ? 'Creating…' : 'New Chat'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowSettings((prev) => !prev)} className="rounded-2xl">
                  <Settings2 size={15} />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-2xl">
                  <LogOut size={15} />
                </Button>
              </div>
            </header>

            {showSettings ? (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mx-3 mt-3 rounded-[1.3rem] border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300 shadow-[0_0_40px_rgba(15,23,42,0.2)] sm:mx-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Workspace settings</p>
                    <p className="mt-1 text-xs text-slate-400">Theme, motion, and conversation controls.</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)} className="rounded-2xl">
                    Close
                  </Button>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Theme</p>
                    <p className="mt-1 text-sm text-white">Dark mode is active by default.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Animation</p>
                    <p className="mt-1 text-sm text-white">Smooth motion is enabled for a premium feel.</p>
                  </div>
                </div>
              </motion.div>
            ) : null}

            <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/60 p-8 text-center text-slate-300">
                  <div>
                    <Sparkles className="mx-auto mb-3 text-cyan-200" size={28} />
                    <p className="text-lg text-white">Your next conversation begins here.</p>
                    <p className="mt-2 text-sm text-slate-400">Ask anything and Nexus-AI will respond in real time.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isLastAssistant = message.role === 'assistant' && index === messages.length - 1 && isGenerating && !message.content;
                    return (
                      <div key={message.id}>
                        {isLastAssistant ? <TypingIndicator /> : <MessageBubble role={message.role} content={message.content} onCopy={() => navigator.clipboard.writeText(message.content)} onRegenerate={handleRegenerate} />}
                      </div>
                    );
                  })}
                  <div ref={endRef} />
                </div>
              )}
            </div>

            <div className="border-t border-white/10 px-3 py-3 sm:px-4 sm:py-4">
              {error ? <p className="mb-3 text-sm text-rose-300">{error}</p> : null}
              <Composer
                textareaRef={textareaRef}
                draft={draft}
                onDraftChange={setDraft}
                onSend={handleSend}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
                isGenerating={isGenerating}
                disabled={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
