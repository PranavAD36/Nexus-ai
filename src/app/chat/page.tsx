"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUp, Menu, Sparkles, LogOut, Settings2, PanelLeftClose, PanelLeftOpen, AlertTriangle, Loader2 } from 'lucide-react';
import { createClient, resetClient } from '@/lib/supabase/client';
import { createChatRecord, deleteChat, getChatMessages, getChats, saveMessage, toggleChatPin, updateChatTitle } from '@/lib/supabase/chat';
import { Button } from '@/components/ui/button';
import { WorkspaceSidebar, ConversationSidebar } from '@/components/chat/sidebar';
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
  const [isGuest, setIsGuest] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleEditing, setTitleEditing] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isChatsLoading, setIsChatsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [autoTitleApplied, setAutoTitleApplied] = useState<Record<string, boolean>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const hasAutoCreatedChatRef = useRef(false);
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  };

  useEffect(() => {
    const verifySession = async () => {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      setIsGuest(!session);
    };

    void verifySession();
  }, [router]);

  useEffect(() => {
    if (isGuest !== false) return;
    let isMounted = true;
    const load = async () => {
      setIsChatsLoading(true);
      try {
        const chatList = await getChats();
        if (!isMounted) return;
        setChats(chatList as ChatSummary[]);

        if (!hasAutoCreatedChatRef.current) {
          hasAutoCreatedChatRef.current = true;
          const newChat = await createChatRecord('New Chat');
          if (newChat) {
            setChats((prev) => [newChat as ChatSummary, ...prev]);
            setActiveChatId(newChat.id);
            setMessages([]);
            setDraft('');
          } else if (chatList.length > 0) {
            setActiveChatId(chatList[0].id);
          }
        } else if (chatList.length > 0 && !activeChatId) {
          setActiveChatId(chatList[0].id);
        }
      } catch {
        if (isMounted) {
          setError('Unable to load chats.');
        }
      } finally {
        if (isMounted) {
          setIsChatsLoading(false);
        }
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, [isGuest]);

  useEffect(() => {
    if (isGuest !== true) return;
    setChats([]);
    setActiveChatId('guest-local-chat');
    setMessages([]);
    setIsChatsLoading(false);
    setIsMessagesLoading(false);
  }, [isGuest]);

  useEffect(() => {
    if (isGuest !== false) return;
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    const loadMessages = async () => {
      setIsMessagesLoading(true);
      try {
        const chatMessages = await getChatMessages(activeChatId);
        if (!isMounted) return;
        setMessages(chatMessages as ChatMessage[]);
      } catch {
        if (isMounted) {
          setError('Unable to load messages.');
        }
      } finally {
        if (isMounted) {
          setIsMessagesLoading(false);
        }
      }
    };
    void loadMessages();
    return () => {
      isMounted = false;
    };
  }, [activeChatId, isGuest]);

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
    if (isGuest) {
      setActiveChatId('guest-local-chat');
      setMessages([]);
      setDraft('');
      setError(null);
      return;
    }
    setIsCreatingChat(true);
    setError(null);
    setIsGenerating(false);

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
      setTitleEditing(null);
      setTitleDraft('');
      setAutoTitleApplied((prev) => ({ ...prev, [newChat.id]: false }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      if (!isGuest) await saveMessage(activeChatId, 'user', trimmed);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.map((message) => ({ role: message.role, content: message.content })) }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unable to get a response.' }));
        throw new Error('AI service is temporarily unavailable. Please try again later.');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Unable to read response stream.');
      }

      const decoder = new TextDecoder();
      let streamed = '';
      let streamError: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        streamed += chunk;

        const errorPrefix = '__ERROR__:';
        const errorIndex = streamed.indexOf(errorPrefix);
        if (errorIndex !== -1) {
          const contentPart = streamed.slice(0, errorIndex);
          const errorText = streamed.slice(errorIndex + errorPrefix.length);

          if (errorText.trim().endsWith('}')) {
            try {
              const payload = JSON.parse(errorText);
              streamError = 'AI service is temporarily unavailable. Please try again later.';
            } catch {
              streamError = 'AI service is temporarily unavailable. Please try again later.';
            }

            streamed = contentPart;
            break;
          }
        }

        setMessages((prev) => {
          const next = [...prev];
          const target = next[next.length - 1];
          if (target?.role === 'assistant') {
            target.content = streamed;
          }
          return next;
        });
      }

      if (streamError) {
        setMessages((prev) => {
          const next = [...prev];
          if (next[next.length - 1]?.role === 'assistant') {
            next.pop();
          }
          return next;
        });
        throw new Error(streamError);
      }

      streamed += decoder.decode();
      if (!isGuest) await saveMessage(activeChatId, 'assistant', streamed);

      const currentChat = chats.find((chat) => chat.id === activeChatId);
      if (!isGuest && !autoTitleApplied[activeChatId || ''] && currentChat && ['New Chat', 'Untitled chat', ''].includes(currentChat.title.trim())) {
        const updatedTitle = trimmed.length > 34 ? `${trimmed.slice(0, 34)}...` : trimmed;
        await updateChatTitle(activeChatId, updatedTitle);
        setAutoTitleApplied((prev) => ({ ...prev, [activeChatId]: true }));
      }

      if (!isGuest) {
        const refresh = await getChats();
        setChats(refresh as ChatSummary[]);
      }
    } catch (err) {
      setError('AI service is temporarily unavailable. Please try again later.');
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

  const handleRetry = async () => {
    setError(null);
    const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user');
    if (!lastUserMessage) return;
    await sendMessage(lastUserMessage.content, true);
  };

  const handleRename = async (chatId: string) => {
    if (isGuest) return;
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
    if (isGuest) return;
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
    if (isGuest) return;
    const target = chats.find((chat) => chat.id === chatId);
    if (!target) return;
    const pinned = !target.pinned;
    const success = await toggleChatPin(chatId, pinned);
    if (!success) return;
    setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, pinned } : chat)));
  };

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut({ scope: 'global' });
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
      window.sessionStorage.clear();
    }
    resetClient();
    window.location.assign('/');
  };

  if (isGuest === null) {
    return <div className="min-h-screen bg-zinc-950" />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="h-screen overflow-hidden bg-black text-zinc-100">
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex min-h-0 flex-1 overflow-hidden bg-black">
          <WorkspaceSidebar
            chats={chats}
            onCreateChat={handleCreateChat}
            isCreatingChat={isCreatingChat}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          />

          {!isSidebarCollapsed ? <ConversationSidebar
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
            isLoading={isChatsLoading}
          /> : null}

          <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-black">
            <header className="flex min-w-0 shrink-0 items-center justify-between gap-3 px-3 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="hidden rounded-2xl lg:flex" onClick={() => setIsSidebarCollapsed((prev) => !prev)} aria-label="Collapse sidebar">
                  {isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                </Button>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400">Conversation</p>
                  <h3 className="mt-1 max-w-[42vw] truncate text-sm font-semibold text-white sm:max-w-none sm:text-base">{currentChatTitle}</h3>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <Button variant="ghost" size="sm" onClick={handleCreateChat} disabled={isCreatingChat} className="rounded-2xl border border-violet-400/25 bg-violet-500/15 px-3 text-sm text-violet-50">
                  {isCreatingChat ? 'Creating…' : 'New Chat'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowSettings((prev) => !prev)} className="rounded-2xl" aria-label="Open settings">
                  <Settings2 size={15} />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-2xl" aria-label="Log out">
                  <LogOut size={15} />
                </Button>
              </div>
            </header>

            {showSettings ? (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mx-3 mt-3 rounded-[1.3rem] border border-white/10 bg-zinc-900/70 p-4 text-sm text-zinc-300 shadow-[0_0_40px_rgba(15,23,42,0.24)] sm:mx-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Workspace settings</p>
                    <p className="mt-1 text-xs text-zinc-400">Theme, motion, and conversation controls.</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)} className="rounded-2xl">
                    Close
                  </Button>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">Theme</p>
                    <p className="mt-1 text-sm text-white">Neutral slate and zinc palette.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">Animation</p>
                    <p className="mt-1 text-sm text-white">Smooth motion is enabled for a premium feel.</p>
                  </div>
                </div>
              </motion.div>
            ) : null}

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 sm:px-5 lg:px-8">
              {isMessagesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="rounded-[1.25rem] border border-white/8 bg-zinc-900/75 p-6 shadow-[0_6px_30px_rgba(2,6,23,0.5)]">
                      <div className="mb-4 h-4 w-3/4 rounded-full bg-gradient-to-r from-zinc-700 to-zinc-800 animate-pulse" />
                      <div className="space-y-3">
                        <div className="h-3 w-full rounded-full bg-zinc-800 animate-pulse" />
                        <div className="h-3 w-5/6 rounded-full bg-zinc-800 animate-pulse" />
                        <div className="h-3 w-2/3 rounded-full bg-zinc-800 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }} className="flex min-h-0 flex-1 items-center justify-center p-6 text-center text-zinc-300 sm:p-8">
                  <div className="max-w-xl">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-violet-200">
                      <Sparkles size={26} />
                    </div>
                    <p className="mt-5 text-xl font-semibold text-white">Your next conversation begins here.</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">Start with a prompt and Nexus-AI will respond in real time.</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {['Ask for a summary', 'Plan a trip', 'Draft an email'].map((s) => (
                        <button key={s} onClick={() => { setDraft(s); textareaRef.current?.focus(); }} className="rounded-full border border-white/10 bg-zinc-900/70 px-4 py-2 text-sm text-zinc-200 transition hover:border-violet-400/30 hover:bg-zinc-800">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4">
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

            <div className="shrink-0 bg-black px-3 pb-4 pt-2 sm:px-5 lg:px-8">
              {error ? (
                <div className="mx-auto mb-4 max-w-3xl rounded-[1.3rem] border border-rose-400/10 bg-rose-500/10 p-4 text-sm text-white shadow-[0_0_40px_rgba(220,38,38,0.12)]">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={18} className="mt-0.5 text-rose-300" />
                    <div>
                      <p className="font-semibold">AI is temporarily unavailable.</p>
                      <p className="mt-1 text-sm text-zinc-300">
                        {/(quota|429|rate limit|too many requests|quota exceeded)/i.test(error)
                          ? 'Please try again later.'
                          : error}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button variant="secondary" size="sm" onClick={handleRetry} className="rounded-2xl">
                      Retry
                    </Button>
                  </div>
                </div>
              ) : null}
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
    </motion.div>
  );
}
