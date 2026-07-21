import { GoogleGenerativeAI } from '@google/generative-ai';
import { NEXUS_AI_SYSTEM_PROMPT } from '@/lib/ai/system-prompt';

export type GeminiRole = 'user' | 'assistant';

export interface GeminiMessage {
  role: GeminiRole;
  content: string;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildPrompt(messages: GeminiMessage[]) {
  const recent = messages.slice(-8);
  return recent.map((message) => `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}`).join('\n\n');
}

export async function streamGeminiResponse(
  messages: GeminiMessage[],
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash',
  });
  const prompt = buildPrompt(messages);

  let attempt = 0;
  while (attempt < 3) {
    try {
      const result = await model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: `${NEXUS_AI_SYSTEM_PROMPT}\n\nConversation:\n${prompt}` }] }],
      });

      let fullText = '';
      for await (const chunk of result.stream) {
        if (signal?.aborted) {
          throw new Error('Aborted');
        }
        const text = chunk.text();
        fullText += text;
        onChunk(text);
      }

      return fullText;
    } catch (error) {
      attempt += 1;
      if (attempt >= 3) {
        throw error;
      }
      await delay(800 * attempt);
    }
  }

  throw new Error('Failed to generate response');
}
