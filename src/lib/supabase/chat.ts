import { createClient } from '@/lib/supabase/client';

async function getAuthenticatedUser() {
  const supabase = createClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) return null;
  if (session?.user) return session.user;

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) return null;
  return user ?? null;
}

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
  const user = await getAuthenticatedUser();
  if (!user) return null;

  try {
    const { data, error } = await supabase.from('chats').insert({ user_id: user.id, title }).select('*').single();
    if (error) return null;
    return data as ChatRecord;
  } catch {
    return null;
  }
}

export async function getChats() {
  const supabase = createClient();
  const user = await getAuthenticatedUser();
  if (!user) return [];

  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) return [];
    return (data ?? []) as ChatRecord[];
  } catch {
    return [];
  }
}

export async function getChatMessages(chatId: string) {
  const supabase = createClient();
  const user = await getAuthenticatedUser();
  if (!user) return [];

  try {
    const { data, error } = await supabase.from('messages').select('*').eq('chat_id', chatId).eq('user_id', user.id).order('created_at', { ascending: true });
    if (error) return [];
    return (data ?? []) as MessageRecord[];
  } catch {
    return [];
  }
}

export async function saveMessage(chatId: string, role: 'user' | 'assistant', content: string) {
  const supabase = createClient();
  const user = await getAuthenticatedUser();
  if (!user) return false;

  try {
    const { error } = await supabase.from('messages').insert({ chat_id: chatId, user_id: user.id, role, content });
    if (error) return false;
    return true;
  } catch {
    return false;
  }
}

export async function updateChatTitle(chatId: string, title: string) {
  const supabase = createClient();
  const user = await getAuthenticatedUser();
  if (!user) return false;

  try {
    const { error } = await supabase.from('chats').update({ title, updated_at: new Date().toISOString() }).eq('id', chatId).eq('user_id', user.id);
    if (error) return false;
    return true;
  } catch {
    return false;
  }
}

export async function deleteChat(chatId: string) {
  const supabase = createClient();
  const user = await getAuthenticatedUser();
  if (!user) return false;

  try {
    const { error } = await supabase.from('chats').delete().eq('id', chatId).eq('user_id', user.id);
    if (error) return false;
    return true;
  } catch {
    return false;
  }
}
