import { streamGeminiResponse } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await streamGeminiResponse(messages, (chunk) => {
            controller.enqueue(encoder.encode(chunk));
          });

          controller.close();
        } catch (err) {
          console.error("Gemini Stream Error:", err);
          const message = err instanceof Error ? err.message : "Unknown Gemini Error";
          const isQuota = /quota|429|rate limit|too many requests|quota exceeded/i.test(message);
          const errorPayload = {
            error: isQuota
              ? 'AI service is temporarily unavailable due to API quota limits. Please try again in a few minutes.'
              : message,
          };

          controller.enqueue(encoder.encode(`__ERROR__:${JSON.stringify(errorPayload)}`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (err) {
    console.error("Route Error:", err);
    const message = err instanceof Error ? err.message : 'Unknown Error';
    const isQuota = /quota|429|rate limit|too many requests|quota exceeded/i.test(message);

    return Response.json(
      {
        error: isQuota
          ? 'AI service is temporarily unavailable due to API quota limits. Please try again in a few minutes.'
          : message,
      },
      {
        status: isQuota ? 503 : 500,
      }
    );
  }
}