import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const DAY_MS = 86_400_000;            // миллисекунд в сутках

export async function GET() {
  const now = Date.now();

  // параллельные запросы в Redis
  const [latest, count24h] = await Promise.all([
    redis.lrange<string[]>("leads", 0, 19),                  // 20 последних лидов
    redis.zcount("hits24h", now - DAY_MS, "+inf"),           // общее за 24 часа
  ]);

  return NextResponse.json({
    latest: latest.map(JSON.parse),                          // превращаем строки в объекты
    count24h,
  });
}
