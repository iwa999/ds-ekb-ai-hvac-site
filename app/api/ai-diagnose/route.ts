import { NextRequest } from 'next/server';

/**
 * Базовый URL для запросов к модели.
 * Для ProxyAPI положи переменную окружения
 *   OPENAI_BASE_URL=https://api.proxyapi.ru/openai/v1
 * Иначе будет использоваться прямой openai.com.
 */
const BASE = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { problem } = await req.json();

  const resp = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // ProxyAPI принимает как Bearer, так и x-api-key – оставляем оба
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'x-api-key': process.env.OPENAI_API_KEY as string,
    },
    body: JSON.stringify({
      /**
       * Если ProxyAPI вернёт 404 model not found,
       * замени на 'gpt-3.5-turbo' или другой поддерживаемый алиас.
       */
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

  // Логируем статус и тело ответа, чтобы видеть точную ошибку в Railway-логах
  const debugBody = await resp.text();
  console.error('ProxyAPI status', resp.status, debugBody);

  if (!resp.ok) {
    return new Response(
      JSON.stringify({ answer: 'Ошибка AI-сервиса' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Парсим JSON только если статус 2xx
  const data = JSON.parse(debugBody);
  const answer =
    data?.choices?.[0]?.message?.content || 'Ошибка AI-сервиса';

  return new Response(
    JSON.stringify({ answer }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}
