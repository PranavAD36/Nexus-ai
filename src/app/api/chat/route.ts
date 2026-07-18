import { NextResponse } from 'next/server';
import { streamGeminiResponse } from '@/lib/gemini';

export async function POST(request: Request) {
  const { messages } = await request.json();

  try {
    const chunks: string[] = [];
    const content = await streamGeminiResponse(messages, (chunk) => chunks.push(chunk));
    return NextResponse.json({ content: content || chunks.join('') });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}
