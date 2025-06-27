// lib/redis.ts
/**
 * Полная «кукла» клиента Redis.
 * Экспортируются все методы, которые встречаются в проекте,
 * но они ничего не делают и не вызывают ошибок в рантайме.
 */

type AnyArgs = readonly unknown[] | unknown;

function noop<T = void>(_: AnyArgs = []): T | Promise<T> {
  // заглушка: возвращает значение подходящего типа, ничего не делая
  return undefined as unknown as T;
}

export const redis = {
  /** ─────────────── списки ─────────────── */
  lpush:  (...args: AnyArgs) => noop<number>(args),
  lrange: (...args: AnyArgs) => noop<string[]>(args),

  /** ───── сортированные множества (Z-set) ───── */
  zadd:   (...args: AnyArgs) => noop<number>(args),
  zcount: (...args: AnyArgs) => noop<number>(args)
} as const;
