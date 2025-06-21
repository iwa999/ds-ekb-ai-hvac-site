import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { problem } = await req.json();

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Ты HVAC-инженер. Отвечай кратко, чётко и профессионально.' },
        { role: 'user', content: problem },
      ],
      temperature: 0.2,
    }),
  });

  if (!resp.ok) {
    return new Response(JSON.stringify({ answer: 'Ошибка AI-сервиса' }), { status: 502 });
  }

  const data = await resp.json();
  return new Response(JSON.stringify({ answer: data.choices[0].message.content }), {
    headers: { 'Content-Type': 'application/json' },
  });
}