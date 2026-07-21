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

          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                error:
                  err instanceof Error ? err.message : "Unknown Gemini Error",
              })
            )
          );

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

    return Response.json(
      {
        error: err instanceof Error ? err.message : "Unknown Error",
      },
      {
        status: 500,
      }
    );
  }
}