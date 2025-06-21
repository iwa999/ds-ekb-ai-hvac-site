import { NextRequest } from 'next/server';

/**
 * Базовый URL берём из переменной окружения.
 * Для ProxyAPI это https://api.proxyapi.ru/openai/v1
 * Если переменная не задана — падаем на прямой openai.com.
 */
const BASE = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { problem } = await req.json();

  const resp = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      // если ProxyAPI вместо Bearer требует x-api-key:
      // 'x-api-key': process.env.OPENAI_API_KEY,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',          // при 404 заменим на gpt-3.5-turbo
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

  // ЛОГИРУЕМ статус ProxyAPI — увидите его в Railway → Logs
  console.error('ProxyAPI status', resp.status);

  if (!resp.ok) {
    return new Response(
      JSON.stringify({ answer: 'Ошибка AI-сервиса' }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const data = await resp.json();
  const answer =
    data?.choices?.[0]?.message?.content || 'Ошибка AI-сервиса';

  return new Response(JSON.stringify({ answer }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
