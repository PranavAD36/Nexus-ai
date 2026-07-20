"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, MessageSquarePlus, Search, Sparkles, Trash2, PencilLine, Loader2, Copy, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { createClient } from '@/lib/supabase/client';
import { createChatRecord, deleteChat, getChatMessages, getChats, saveMessage, updateChatTitle } from '@/lib/supabase/chat';
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
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

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
  }, [activeChatId]);

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
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const filteredChats = useMemo(() => chats.filter((chat) => chat.title.toLowerCase().includes(search.toLowerCase())), [chats, search]);

  const handleCreateChat = async () => {
    if (isCreatingChat) return;
    setIsCreatingChat(true);
    setError(null);

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
      const history = [...messages, userMessage].map((message) => ({ role: message.role, content: message.content }));
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
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

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <div className="mx-auto flex h-screen w-full max-w-7xl flex-col px-4 py-4 lg:px-6">
        <div className="flex flex-1 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
          <aside className="hidden w-80 flex-col border-r border-slate-800 bg-slate-950/70 p-4 lg:flex">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Nexus-AI</p>
                <h2 className="mt-1 text-lg font-semibold">Workspace</h2>
              </div>
              <Button size="sm" onClick={handleCreateChat} disabled={isCreatingChat}>
                {isCreatingChat ? <Loader2 className="animate-spin" size={16} /> : <MessageSquarePlus size={16} />}
              </Button>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300">
              <Search size={16} />
              <input aria-label="Search chats" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent outline-none" placeholder="Search chats" />
            </div>
            <div className="mt-5 flex-1 space-y-2 overflow-y-auto">
              {filteredChats.map((chat) => (
                <button key={chat.id} onClick={() => setActiveChatId(chat.id)} className={`flex w-full items-start justify-between rounded-2xl border px-3 py-3 text-left transition ${activeChatId === chat.id ? 'border-cyan-400/30 bg-cyan-400/10' : 'border-slate-800 bg-slate-900 hover:bg-slate-800'}`}>
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
                <Button variant="ghost" size="sm" onClick={handleCreateChat} disabled={isCreatingChat}>
                  {isCreatingChat ? 'Creating…' : 'New Chat'}
                </Button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-950/60 p-8 text-center text-slate-300">
                  <div>
                    <Sparkles className="mx-auto mb-3 text-cyan-200" size={28} />
                    <p className="text-lg text-white">Your next conversation begins here.</p>
                    <p className="mt-2 text-sm text-slate-400">Ask anything and Nexus-AI will respond in real time.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] rounded-2xl border px-4 py-3 sm:max-w-[75%] ${message.role === 'user' ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-50' : 'border-slate-800 bg-slate-950/80 text-slate-200'}`}>
                        {message.role === 'assistant' ? (
                          <div className="flex items-center justify-end gap-2 pb-2">
                            <button aria-label="Copy response" onClick={() => navigator.clipboard.writeText(message.content)} className="text-slate-400 transition hover:text-white"><Copy size={14} /></button>
                            <button aria-label="Regenerate response" onClick={handleRegenerate} className="text-slate-400 transition hover:text-white"><RefreshCw size={14} /></button>
                          </div>
                        ) : null}
                        <div className="text-sm leading-7">
                          {message.role === 'assistant' && message.content ? (
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
                              {message.content}
                            </ReactMarkdown>
                          ) : (
                            <div className="whitespace-pre-wrap">{message.content || (message.role === 'assistant' ? 'Thinking…' : '')}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-4">
              {error ? <p className="mb-3 text-sm text-rose-300">{error}</p> : null}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder="Ask Nexus-AI anything..."
                  className="min-h-[100px] w-full resize-none bg-transparent px-2 py-2 text-sm outline-none"
                  disabled={isGenerating}
                />
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-slate-400">Enter to send · Shift + Enter for new line</p>
                  <Button size="sm" onClick={() => void handleSend()} disabled={isGenerating || !draft.trim()}>
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
