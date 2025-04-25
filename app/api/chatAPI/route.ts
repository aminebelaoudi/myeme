import { ChatBody } from '@/types/types';
import { GeminiStream } from '@/utils/chatStream';

export const runtime = 'edge';

export async function GET(req: Request): Promise<Response> {
  try {
    const { inputCode, model, apiKey } = (await req.json()) as ChatBody;

    let apiKeyFinal;
    if (apiKey) {
      apiKeyFinal = apiKey;
    } else {
      apiKeyFinal = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    }

    const stream = await GeminiStream(inputCode, model, apiKeyFinal);

    return new Response(stream);
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const { inputCode, model, apiKey } = (await req.json()) as ChatBody;

    if (!inputCode) {
      return new Response(JSON.stringify({ error: 'Input code is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    let apiKeyFinal;
    if (apiKey) {
      apiKeyFinal = apiKey;
    } else {
      apiKeyFinal = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    }

    if (!apiKeyFinal) {
      return new Response(JSON.stringify({ error: 'API key is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const stream = await GeminiStream(inputCode, model, apiKeyFinal);

    return new Response(stream);
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
