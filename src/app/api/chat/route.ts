import { streamGeminiResponse } from '@/lib/gemini';

export async function POST(request: Request) {
  const { messages } = await request.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        await streamGeminiResponse(messages, (chunk) => {
          controller.enqueue(encoder.encode(chunk));
        });
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
