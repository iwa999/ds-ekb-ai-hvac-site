import { NextRequest } from 'next/server';
import { basePrice, kObject, kUrgency, sqmRate } from '@/lib/pricing';

/**
 * POST /api/calc-price
 * Body: { service, object, urgency, sqm }
 * Ответ: { price }
 */
export async function POST(req: NextRequest) {
  const { service, object, urgency, sqm } = await req.json();

  // 1 — базовая цена по услуге
  const base = basePrice[service as string] ?? 0;

  // 2 — коэффициенты
  const objK = kObject[object as string] ?? 1;
  const urgK = kUrgency[urgency as string] ?? 1;

  // 3 — надбавка за площадь, если введена
  const areaAdd =
    sqm && typeof sqm === 'number' && sqm > 0 ? sqm * sqmRate : 0;

  // Итоговая формула
  const price = Math.round(base * objK * urgK + areaAdd);

  return new Response(JSON.stringify({ price }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
