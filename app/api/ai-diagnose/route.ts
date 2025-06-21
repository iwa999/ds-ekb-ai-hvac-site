import { NextRequest } from 'next/server';

/**
 * Базовый URL берём из переменной окружения.
 * Для ProxyAPI: https://api.proxyapi.ru/openai/v1
 * Если переменная не задана — используем прямой openai.com.
 */
const BASE = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { problem } = await req.json();

  const resp = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // ProxyAPI принимает ключ в заголовке x-api-key
      'x-api-key': process.env.OPENAI_API_KEY as string,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',           // если ProxyAPI не поддержит — заменим позже
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

  // Логируем статус, чтобы видеть в Railway-логах
  console.error('ProxyAPI status', resp.status);

  if (!resp.ok) {
    return new Response(
      JSON.stringify({ answer: 'Ошибка AI-сервиса' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const data = await resp.json();
  const answer =
    data?.choices?.[0]?.message?.content || 'Ошибка AI-сервиса';

  return new Response(
    JSON.stringify({ answer }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}
