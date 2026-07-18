import { GoogleGenerativeAI } from '@google/generative-ai';

export type GeminiRole = 'user' | 'assistant';

export interface GeminiMessage {
  role: GeminiRole;
  content: string;
}

const apiKey = process.env.GEMINI_API_KEY;

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
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = buildPrompt(messages);

  let attempt = 0;
  while (attempt < 3) {
    try {
      const result = await model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: `You are Nexus-AI, a concise and polished assistant. Respond helpfully and clearly.\n\n${prompt}` }] }],
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
