// lib/redis.ts
/**
 * Заглушка клиента Redis, чтобы TypeScript
 * и рантайм не падали в отсутствие реального подключения.
 */

export const redis = {
  /** очередь лидов */
  lpush: async (..._args: unknown[]) => {},

  /** сортированное множество для статистики */
  zadd: async (..._args: unknown[]) => {}
} as const;
