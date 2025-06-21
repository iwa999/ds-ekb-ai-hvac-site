import { NextRequest } from 'next/server';

//
// Если в Variables задано OPENAI_BASE_URL — используем его,
// иначе падаем назад на прямой openai.com.
//
const BASE = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { problem } = await req.json();

  const resp = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // если ProxyAPI требует другой алиас — поменяй здесь
      messages: [
        {
          role: 'system',
          content: 'Ты HVAC-инженер. Отвечай кратко, чётко и профессионально.',
        },
        { role: 'user', content: problem },
      ],
      temperature: 0.2,
    }),
  });

  // Любой код, кроме 2xx → показываем «Ошибка AI-сервиса»
  if (!resp.ok) {
    return new Response(
      JSON.stringify({ answer: 'Ошибка AI-сервиса' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const data = await resp.json();
  const answer = data?.choices?.[0]?.message?.content || 'Ошибка AI-сервиса';

  return new Response(
    JSON.stringify({ answer }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}
