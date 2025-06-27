// app/api/stats/route.ts
import { NextResponse } from 'next/server';

/**
 * Отключаем пререндеринг: роут будет исполняться только
 * при реальном HTTP-запросе, а не на стадии build.
 */
export const dynamic = 'force-dynamic';

/**
 * GET /api/stats  →  безопасный ответ-заглушка
 */
export async function GET() {
  return NextResponse.json({
    leads24h: 0,
    latest:   []
  });
}
