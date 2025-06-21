import { NextRequest } from 'next/server';

const BASE =
  process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

export const runtime = 'nodejs'; // ← ключевой фикс

export async function POST(req: NextRequest) {
  const { problem } = await req.json();

  const resp = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'x-api-key': process.env.OPENAI_API_KEY as string,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Ты HVAC-инженер. Отвечай кратко, чётко и профессионально.',
        },
        { role: 'user', content: problem },
      ],
      temperature: 0.2,
    }),
  });

  const debugBody = await resp.text();
  console.error('ProxyAPI status', resp.status, debugBody);

  if (!resp.ok) {
    return new Response(
      JSON.stringify({ answer: 'Ошибка AI-сервиса' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const data = JSON.parse(debugBody);
  const answer =
    data?.choices?.[0]?.message?.content || 'Ошибка AI-сервиса';

  return new Response(JSON.stringify({ answer }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
