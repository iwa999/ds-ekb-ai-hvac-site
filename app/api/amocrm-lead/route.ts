import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  const payload = await req.json();

  /** 1. Существующий код: сделка + письмо */
  const amoRes = await fetch(process.env.AMO_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body:   JSON.stringify(payload),
  });
  if (!amoRes.ok)
    return NextResponse.json({ error: "amo error" }, { status: 500 });

  /** 2. Social-proof → Redis */
  await Promise.all([
    redis.lpush("leads", JSON.stringify(payload)),                // 20 последних
    redis.zadd("hits24h", { score: Date.now(), member: payload.phone }), // счёт 24 ч
  ]);

  /** 3. Существующий SMTP-код */

  return NextResponse.json({ ok: true }, { status: 201 });
}
