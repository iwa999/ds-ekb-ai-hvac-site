import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  const payload = await req.json();

  /* 1. создаём сделку в AmoCRM (существующий код) */
  const amoRes = await fetch(process.env.AMO_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!amoRes.ok) {
    return NextResponse.json({ error: "amo error" }, { status: 500 });
  }

  /* 2. логируем лид для social-proof */
  await Promise.all([
    redis.lpush("leads", JSON.stringify(payload)),                 // очередь из 20 лидов
    redis.zadd("hits24h", { score: Date.now(), member: payload.phone }), // счётчик 24 ч
  ]);

  /* 3. отправляем письмо (оставь как было, если блок уже реализован) */
  // ... существующий SMTP-код ...

  return NextResponse.json({ ok: true }, { status: 201 });
}
