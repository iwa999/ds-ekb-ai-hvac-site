/**
 * Отменяем пререндеринг для этого API-роута —
 * Next.js больше не будет выполнять код на стадии build.
 */
export const dynamic = 'force-dynamic';  // ← ключевая строка

import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

/** сутки в миллисекундах */
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * GET /api/stats
 * Возвращает счётчики лидов за 24 ч и список последних 20 записей.
 */
export async function GET(_req: NextRequest) {
  // параллельные вызовы к Redis (у нас сейчас заглушка, ошибок не будет)
  const [latest, count24h] = await Promise.all([
    redis.lrange('leads', 0, 19),                 // последние 20
    redis.zcount('hits24h', Date.now() - DAY_MS, '+inf') // за 24 ч
  ]);

  return NextResponse.json({
    leads24h: count24h,
    latest
  });
}
