"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, MessageSquarePlus, Search, Sparkles, Trash2, Pin, PencilLine, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createChatRecord, deleteChat, getChatMessages, getChats, saveMessage, updateChatTitle } from '@/lib/supabase/chat';
import { streamGeminiResponse } from '@/lib/gemini';
import { Button } from '@/components/ui/button';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const load = async () => {
      try {
        const chatList = await getChats();
        setChats(chatList as ChatSummary[]);
        if (chatList.length > 0 && !activeChatId) {
          setActiveChatId(chatList[0].id);
        }
      } catch {
        setError('Unable to load chats.');
      }
    };
    load();
  }, [activeChatId]);

  useEffect(() => {
    if (!activeChatId) return;
    const loadMessages = async () => {
      try {
        const chatMessages = await getChatMessages(activeChatId);
        setMessages(chatMessages as ChatMessage[]);
      } catch {
        setError('Unable to load messages.');
      }
    };
    loadMessages();
  }, [activeChatId]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      window.location.reload();
    });
    return () => authListener.subscription.unsubscribe();
  }, [supabase]);

  const filteredChats = useMemo(() => chats.filter((chat) => chat.title.toLowerCase().includes(search.toLowerCase())), [chats, search]);

  const handleCreateChat = async () => {
    try {
      const newChat = await createChatRecord('New Chat');
      setChats((prev) => [newChat as ChatSummary, ...prev]);
      setActiveChatId(newChat.id);
      setMessages([]);
      setError(null);
    } catch {
      setError('Unable to create a new chat.');
    }
  };

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || !activeChatId || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    const userMessage = { id: crypto.randomUUID(), role: 'user' as const, content: trimmed, created_at: new Date().toISOString() };
    const assistantPlaceholder = { id: crypto.randomUUID(), role: 'assistant' as const, content: '', created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    setDraft('');

    try {
      await saveMessage(activeChatId, 'user', trimmed);
      const history = [...messages, userMessage].map((message) => ({ role: message.role, content: message.content }));
      let streamed = '';
      await streamGeminiResponse(history, (chunk) => {
        streamed += chunk;
        setMessages((prev) => {
          const next = [...prev];
          const target = next[next.length - 1];
          if (target?.role === 'assistant') {
            target.content = streamed;
          }
          return next;
        });
      });
      await saveMessage(activeChatId, 'assistant', streamed);
      const updatedTitle = trimmed.length > 34 ? `${trimmed.slice(0, 34)}...` : trimmed;
      await updateChatTitle(activeChatId, updatedTitle);
      const refresh = await getChats();
      setChats(refresh as ChatSummary[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.');
    } finally {
      setIsGenerating(false);
    }
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
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      if (activeChatId === chatId) {
        const remaining = chats.filter((chat) => chat.id !== chatId);
        setActiveChatId(remaining[0]?.id ?? null);
        setMessages(remaining[0] ? [] : []);
      }
    } catch {
      setError('Unable to delete chat.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white">
      <div className="mx-auto flex h-screen w-full max-w-7xl flex-col px-4 py-4 lg:px-6">
        <div className="flex flex-1 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-premium backdrop-blur-2xl">
          <aside className="hidden w-80 flex-col border-r border-white/10 bg-black/20 p-4 lg:flex">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Nexus-AI</p>
                <h2 className="mt-1 text-lg font-semibold">Workspace</h2>
              </div>
              <Button size="sm" onClick={handleCreateChat}>
                <MessageSquarePlus size={16} />
              </Button>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
              <Search size={16} />
              <input aria-label="Search chats" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent outline-none" placeholder="Search chats" />
            </div>
            <div className="mt-5 flex-1 space-y-2 overflow-y-auto">
              {filteredChats.map((chat) => (
                <button key={chat.id} onClick={() => setActiveChatId(chat.id)} className={`flex w-full items-start justify-between rounded-2xl border px-3 py-3 text-left transition ${activeChatId === chat.id ? 'border-cyan-400/30 bg-cyan-400/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                  <div className="min-w-0">
                    {titleEditing === chat.id ? (
                      <input value={titleDraft} onChange={(event) => setTitleDraft(event.target.value)} onBlur={() => handleRename(chat.id)} className="w-full bg-transparent text-sm outline-none" autoFocus />
                    ) : (
                      <p className="truncate text-sm font-medium text-white">{chat.title}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">{new Date(chat.updated_at).toLocaleDateString()}</p>
                  </div>
                  <div className="ml-2 flex gap-2">
                    <button aria-label="Rename chat" onClick={(event) => { event.stopPropagation(); setTitleEditing(chat.id); setTitleDraft(chat.title); }}><PencilLine size={14} className="text-slate-400" /></button>
                    <button aria-label="Delete chat" onClick={(event) => { event.stopPropagation(); handleDelete(chat.id); }}><Trash2 size={14} className="text-slate-400" /></button>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <div className="flex flex-1 flex-col">
            <header className="flex items-center justify-between border-b border-white/10 p-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Conversation</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{activeChatId ? 'Live session' : 'Start a new conversation'}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleCreateChat}>New Chat</Button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-8 text-center text-slate-300">
                  <div>
                    <Sparkles className="mx-auto mb-3 text-cyan-200" size={28} />
                    <p className="text-lg text-white">Your next conversation begins here.</p>
                    <p className="mt-2 text-sm text-slate-400">Ask anything and Nexus-AI will respond in real time.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] rounded-[1.5rem] border px-4 py-3 sm:max-w-[75%] ${message.role === 'user' ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-50' : 'border-white/10 bg-white/5 text-slate-200'}`}>
                        <div className="whitespace-pre-wrap text-sm leading-7">{message.content || (message.role === 'assistant' ? 'Thinking…' : '')}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-4">
              {error ? <p className="mb-3 text-sm text-rose-300">{error}</p> : null}
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-3">
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask Nexus-AI anything..."
                  className="min-h-[100px] w-full resize-none bg-transparent px-2 py-2 text-sm outline-none"
                  disabled={isGenerating}
                />
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-slate-400">Enter to send · Shift + Enter for new line</p>
                  <Button size="sm" onClick={handleSend} disabled={isGenerating || !draft.trim()}>
                    {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <ArrowUp size={16} />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
