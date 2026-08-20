import { NEXUS_AI_SYSTEM_PROMPT } from '@/lib/ai/system-prompt';

export type OpenRouterRole = 'user' | 'assistant';

export interface OpenRouterMessage {
  role: OpenRouterRole;
  content: string;
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-4o-mini';

export async function streamOpenRouterResponse(
  messages: OpenRouterMessage[],
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY');

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
      stream: true,
      messages: [{ role: 'system', content: NEXUS_AI_SYSTEM_PROMPT }, ...messages.slice(-8)],
    }),
    signal,
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`OpenRouter API error (${response.status})${details ? `: ${details}` : ''}`);
  }
  if (!response.body) throw new Error('OpenRouter returned an empty stream');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';
  let finished = false;

  const processLine = (line: string) => {
    if (!line.startsWith('data:')) return false;
    const data = line.slice(5).trim();
    if (data === '[DONE]') return true;
    try {
      const content = JSON.parse(data)?.choices?.[0]?.delta?.content;
      if (typeof content === 'string' && content) {
        fullText += content;
        onChunk(content);
      }
    } catch {
      // Ignore incomplete or provider metadata frames.
    }
    return false;
  };

  const abort = () => {
    void reader.cancel();
  };
  signal?.addEventListener('abort', abort, { once: true });

  try {
    while (!finished) {
      if (signal?.aborted) throw new Error('Aborted');
      const { done, value } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';
      finished = lines.some(processLine);
      if (done) {
        if (buffer) processLine(buffer);
        break;
      }
    }
  } finally {
    signal?.removeEventListener('abort', abort);
  }
  return fullText;
}
