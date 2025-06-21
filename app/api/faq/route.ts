import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';

// ---------- 0. Конфиг ----------
const BASE = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const OPENAI_KEY = process.env.OPENAI_API_KEY!;
export const runtime = 'nodejs';

// ---------- 1. Загружаем FAQ ---------
type QA = { q: string; a: string; vec: Map<string, number> };
let faqData: QA[] | null = null;

async function loadFaq(): Promise<QA[]> {
  if (faqData) return faqData;

  const md = await fs.readFile(
    path.join(process.cwd(), 'data/faq.md'),
    'utf8',
  );

  const blocks = md
    .split('\n')
    .filter((l) => l.startsWith('##'))
    .map((_, i, arr) => arr.slice(i, i + 2))
    .filter((b) => b.length === 2)
    .map(([q, a]) => ({
      q: q.replace(/^##\s*/, '').trim(),
      a: a.trim(),
    }));

  // строим простую TF частоту => вектор
  faqData = blocks.map(({ q, a }) => ({
    q,
    a,
    vec: toVector(q + ' ' + a),
  }));
  return faqData;
}

// ---------- 2. Утилиты TF-IDF ------------
function tokenize(txt: string) {
  return txt
    .toLowerCase()
    .replace(/[^a-zа-я0-9\s]/giu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function toVector(txt: string) {
  const map = new Map<string, number>();
  for (const t of tokenize(txt)) {
    map.set(t, (map.get(t) || 0) + 1);
  }
  return map;
}

function cosine(a: Map<string, number>, b: Map<string, number>) {
  let dot = 0,
    na = 0,
    nb = 0;
  a.forEach((v, k) => {
    if (b.has(k)) dot += v * (b.get(k) as number);
    na += v * v;
  });
  b.forEach((v) => {
    nb += v * v;
  });
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

// ---------- 3. POST /api/faq -------------
export async function POST(req: NextRequest) {
  const { question } = await req.json();
  if (!question || typeof question !== 'string') {
    return new Response(
      JSON.stringify({ answer: 'Вопрос не задан' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const faq = await loadFaq();
  const qVec = toVector(question);
  let best: QA | null = null;
  let bestScore = 0;

  for (const item of faq) {
    const score = cosine(qVec, item.vec);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  // ---------- 3.a FAQ ответ ----------
  if (best && bestScore >= 0.8) {
    return new Response(JSON.stringify({ answer: best.a }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ---------- 3.b Fallback к LLM ----------
  try {
    const resp = await fetch(`${BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
        'x-api-key': OPENAI_KEY, // для ProxyAPI
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Ты HVAC-инженер, отвечай кратко и по делу.',
          },
          { role: 'user', content: question },
        ],
        temperature: 0.2,
      }),
    });

    const data = await resp.json();
    const answer =
      data?.choices?.[0]?.message?.content || 'Извините, нет ответа';

    return new Response(JSON.stringify({ answer }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('LLM err', err);
    return new Response(
      JSON.stringify({ answer: 'Ошибка сервиса FAQ' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
