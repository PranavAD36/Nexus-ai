import { createClient } from '@/lib/supabase/client';

export type ChatRecord = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  pinned: boolean;
};

export type MessageRecord = {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

export async function createChatRecord(title: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const { data, error } = await supabase.from('chats').insert({ user_id: user.id, title }).select('*').single();
  if (error) throw error;
  return data as ChatRecord;
}

export async function getChats() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ChatRecord[];
}

export async function getChatMessages(chatId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const { data, error } = await supabase.from('messages').select('*').eq('chat_id', chatId).eq('user_id', user.id).order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as MessageRecord[];
}

export async function saveMessage(chatId: string, role: 'user' | 'assistant', content: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const { error } = await supabase.from('messages').insert({ chat_id: chatId, user_id: user.id, role, content });
  if (error) throw error;
}

export async function updateChatTitle(chatId: string, title: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const { error } = await supabase.from('chats').update({ title, updated_at: new Date().toISOString() }).eq('id', chatId).eq('user_id', user.id);
  if (error) throw error;
}

export async function deleteChat(chatId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const { error } = await supabase.from('chats').delete().eq('id', chatId).eq('user_id', user.id);
  if (error) throw error;
}
